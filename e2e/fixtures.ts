import { test as base, expect, chromium, type BrowserContext, type Page } from '@playwright/test'
import { resolve } from 'node:path'

type ExtensionFixtures = {
  extensionContext: BrowserContext
  extensionId: string
  workspace: Page
  clickToolbar: (tab: Page) => Promise<void>
}

export const test = base.extend<ExtensionFixtures>({
  // eslint-disable-next-line no-empty-pattern
  extensionContext: async ({}, use) => {
    const extensionPath = resolve('dist-chrome')
    // A new temporary profile on every test, never the user's personal browser.
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless: !process.env.HEADED,
      viewport: { width: 1280, height: 900 },
      args: [
        '--enable-unsafe-extension-debugging',
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    })
    await use(context)
    await context.close()
  },
  extensionId: async ({ extensionContext }, use) => {
    const worker =
      extensionContext.serviceWorkers()[0] ?? (await extensionContext.waitForEvent('serviceworker'))
    await expect.poll(() => worker.evaluate('chrome.action.onClicked.hasListeners()')).toBe(true)
    await use(new URL(worker.url()).host)
  },
  clickToolbar: async ({ extensionContext, extensionId }, use) => {
    await use(async (tab) => {
      const browserSession = await extensionContext.browser()!.newBrowserCDPSession()
      const { targetInfos } = await browserSession.send('Target.getTargets', {
        filter: [{ type: 'tab' }]
      })
      const target = targetInfos.find((candidate) => candidate.url === tab.url())
      if (!target) throw new Error('Could not find the browser tab target')
      await browserSession.send('Extensions.triggerAction', {
        id: extensionId,
        targetId: target.targetId
      })
      await browserSession.detach()
    })
  },
  workspace: async ({ extensionContext, clickToolbar, extensionId }, use) => {
    const initialTab = extensionContext.pages()[0]
    await clickToolbar(initialTab)
    await expect
      .poll(() =>
        extensionContext
          .pages()
          .some((page) => page.url() === `chrome-extension://${extensionId}/browseraction.html`)
      )
      .toBe(true)
    const workspace = extensionContext
      .pages()
      .find((page) => page.url() === `chrome-extension://${extensionId}/browseraction.html`)!
    await expect(workspace.locator('#urls')).toBeVisible()
    const errors: string[] = []
    workspace.on('pageerror', (error) => errors.push(error.message))
    await use(workspace)
    expect(errors).toEqual([])
  }
})
export { expect }
