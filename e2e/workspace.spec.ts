import { test, expect } from './fixtures'

test('toolbar reuses a persistent tab, including after the service worker restarts', async ({
  workspace,
  extensionContext,
  clickToolbar,
  extensionId
}) => {
  const input = workspace.locator('#urls')
  await input.fill('https://example.com/preserved')
  const other = extensionContext.pages()[0]
  await other.bringToFront()
  await clickToolbar(other)
  await expect(input).toHaveValue('https://example.com/preserved')
  expect(
    extensionContext.pages().filter((page) => page.url().includes('/browseraction.html'))
  ).toHaveLength(1)
  const session = await extensionContext.newCDPSession(other)
  await session.send('ServiceWorker.enable')
  await session.send('ServiceWorker.stopAllWorkers')
  await clickToolbar(other)
  await expect(input).toHaveValue('https://example.com/preserved')
  expect(
    extensionContext.pages().filter((page) => page.url().includes('/browseraction.html'))
  ).toHaveLength(1)
  await workspace.reload()
  await expect(input).toHaveValue('https://example.com/preserved')
  await workspace.close()
  await clickToolbar(other)
  await expect
    .poll(
      () =>
        extensionContext.pages().filter((page) => page.url().includes('/browseraction.html')).length
    )
    .toBe(1)
  const reopened = extensionContext
    .pages()
    .find((page) => page.url().includes('/browseraction.html'))!
  await expect(reopened.locator('#urls')).toHaveValue('https://example.com/preserved')
  expect(reopened.url()).toBe(`chrome-extension://${extensionId}/browseraction.html`)
})

test('preserve input can be turned off', async ({ workspace }) => {
  await workspace.locator('#urls').fill('https://example.com/private-list')
  await workspace.locator('#preserve').uncheck()
  await expect(workspace.locator('#urls')).toHaveValue('https://example.com/private-list')
  await workspace.reload()
  await expect(workspace.locator('#preserve')).not.toBeChecked()
  await expect(workspace.locator('#urls')).toHaveValue('')
})

test('opens background tabs in a new group and keeps the workspace available', async ({
  workspace,
  extensionContext
}) => {
  await workspace
    .locator('#urls')
    .fill('https://example.com\nhttps://example.org\nhttps://example.com')
  await workspace.locator('#lazyLoad').check()
  await workspace.locator('#deduplicate').check()
  await workspace
    .getByRole('complementary', { name: 'Opening options' })
    .getByLabel('Tab group')
    .selectOption('-2')
  await workspace.locator('#open').click()
  await expect(workspace.getByRole('status')).toContainText('Finished opening')
  const tabs = extensionContext.pages().filter((page) => page.url().includes('/lazyloading.html#'))
  expect(tabs).toHaveLength(2)
  await expect(workspace.locator('#urls')).toHaveValue(
    'https://example.com\nhttps://example.org\nhttps://example.com'
  )
  await expect(workspace.locator('#tabGroupSelection option')).toHaveCount(3)
  await workspace.screenshot({ path: 'test-results/workspace-light.png', fullPage: true })
  await workspace.emulateMedia({ colorScheme: 'dark' })
  await workspace.screenshot({ path: 'test-results/workspace-dark.png', fullPage: true })
  await workspace.setViewportSize({ width: 390, height: 844 })
  await workspace.screenshot({ path: 'test-results/workspace-narrow.png', fullPage: true })
  expect(
    await workspace.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
  ).toBe(true)
  await workspace.screenshot({ path: 'test-results/workspace-narrow.png', fullPage: true })
})

test('lazy tabs navigate only when selected', async ({ workspace, extensionContext }) => {
  await extensionContext.route('https://example.com/**', (route) =>
    route.fulfill({ body: '<h1>Loaded on selection</h1>', contentType: 'text/html' })
  )
  await workspace.locator('#urls').fill('https://example.com/deferred')
  await workspace.locator('#lazyLoad').check()
  await workspace.locator('#open').click()
  await expect
    .poll(() =>
      extensionContext
        .pages()
        .find((page) => page.url().includes('/lazyloading.html#'))
        ?.url()
    )
    .toContain('/lazyloading.html#')
  const deferred = extensionContext
    .pages()
    .find((page) => page.url().includes('/lazyloading.html#'))!
  await deferred.bringToFront()
  await expect(deferred).toHaveURL('https://example.com/deferred')
  await expect(deferred.getByRole('heading')).toHaveText('Loaded on selection')
})
