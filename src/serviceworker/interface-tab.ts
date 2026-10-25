import browser from 'webextension-polyfill'

// Serialize clicks so a double click cannot create duplicate interface tabs.
let opening: Promise<unknown> = Promise.resolve()

export function openInterfaceTab(tab: Pick<browser.Tabs.Tab, 'windowId'>) {
  opening = opening
    .catch(() => {})
    .then(async () => {
      const windowId = tab.windowId ?? (await browser.windows.getCurrent()).id
      if (windowId == null) throw new Error('No browser window is available')
      const url = browser.runtime.getURL('browseraction.html')
      const tabs = await browser.tabs.query({ windowId })
      const existing = tabs.find((candidate) => candidate.url?.split('#')[0] === url)
      if (existing?.id != null) {
        await browser.tabs.update(existing.id, { active: true })
      } else {
        await browser.tabs.create({ url, windowId, active: true })
      }
      await browser.windows.update(windowId, { focused: true })
    })
  return opening
}
