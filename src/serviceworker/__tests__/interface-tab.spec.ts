import { beforeEach, describe, expect, it, vi } from 'vitest'
import browser from 'webextension-polyfill'
import { openInterfaceTab } from '../interface-tab'

vi.mock('webextension-polyfill', () => ({
  default: {
    runtime: { getURL: (path: string) => `chrome-extension://test/${path}` },
    tabs: { query: vi.fn(), create: vi.fn(), update: vi.fn() },
    windows: { update: vi.fn() }
  }
}))

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(browser.tabs.query).mockResolvedValue([])
})

describe('interface tab', () => {
  it('opens a new tab in the clicked window', async () => {
    await openInterfaceTab({ windowId: 7 })
    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: 'chrome-extension://test/browseraction.html',
      windowId: 7,
      active: true
    })
    expect(browser.windows.update).toHaveBeenCalledWith(7, { focused: true })
  })

  it('focuses an existing tab without reloading its contents', async () => {
    vi.mocked(browser.tabs.query).mockResolvedValue([
      { id: 42, url: 'chrome-extension://test/browseraction.html' } as browser.Tabs.Tab
    ])
    await openInterfaceTab({ windowId: 7 })
    expect(browser.tabs.query).toHaveBeenCalledWith({ windowId: 7 })
    expect(browser.tabs.update).toHaveBeenCalledWith(42, { active: true })
    expect(browser.tabs.create).not.toHaveBeenCalled()
  })

  it('serializes rapid clicks and discovers the tab created by the first click', async () => {
    vi.mocked(browser.tabs.query)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: 42, url: 'chrome-extension://test/browseraction.html' } as browser.Tabs.Tab
      ])
    await Promise.all([openInterfaceTab({ windowId: 7 }), openInterfaceTab({ windowId: 7 })])
    expect(browser.tabs.create).toHaveBeenCalledTimes(1)
    expect(browser.tabs.update).toHaveBeenCalledWith(42, { active: true })
  })

  it('recovers after a failed click', async () => {
    vi.mocked(browser.tabs.query).mockRejectedValueOnce(new Error('Window closed'))
    await expect(openInterfaceTab({ windowId: 7 })).rejects.toThrow('Window closed')
    await openInterfaceTab({ windowId: 8 })
    expect(browser.tabs.create).toHaveBeenCalledWith(expect.objectContaining({ windowId: 8 }))
  })
})
