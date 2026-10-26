import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { mount, flushPromises, enableAutoUnmount } from '@vue/test-utils'
import browser from 'webextension-polyfill'
import App from '../LazyLoading.vue'

vi.mock('webextension-polyfill', () => ({
  default: { tabs: { getCurrent: vi.fn() } }
}))

enableAutoUnmount(afterEach)
beforeEach(() => {
  vi.mocked(browser.tabs.getCurrent).mockResolvedValue({ active: false } as browser.Tabs.Tab)
})
afterEach(() => vi.unstubAllGlobals())

describe('lazy loading', () => {
  describe('set title', () => {
    it('omits https protocol', () => {
      window.location.hash = '#https://github.com'
      mount(App)
      expect(document.title).toBe('[github.com]')
    })

    it('omits http protocol', () => {
      window.location.hash = '#http://github.com'
      mount(App)
      expect(document.title).toBe('[github.com]')
    })

    it('omits trailing slash', () => {
      window.location.hash = '#https://github.com/htrinter/'
      mount(App)
      expect(document.title).toBe('[github.com/htrinter]')
    })

    it('use full url if not parsable', () => {
      window.location.hash = '#//www.github.com/htrinter/'
      mount(App)
      expect(document.title).toBe('[//www.github.com/htrinter/]')
    })
  })

  it('navigates when a previously inactive tab is selected', async () => {
    const originalLocation = window.location
    vi.stubGlobal('location', {
      ...originalLocation,
      replace: vi.fn()
    })

    window.location.hash = '#https://github.com/htrinter/'
    mount(App)
    await flushPromises()
    window.dispatchEvent(new Event('focus'))
    document.dispatchEvent(new Event('visibilitychange'))
    await flushPromises()
    expect(window.location.replace).not.toHaveBeenCalled()
    vi.mocked(browser.tabs.getCurrent).mockResolvedValue({ active: true } as browser.Tabs.Tab)
    window.dispatchEvent(new Event('focus'))
    document.dispatchEvent(new Event('visibilitychange'))
    await flushPromises()
    expect(window.location.replace).toHaveBeenCalledTimes(1)
    expect(window.location.replace).toHaveBeenCalledWith('https://github.com/htrinter/')
  })

  it('navigates if the tab was selected before initialization', async () => {
    vi.mocked(browser.tabs.getCurrent).mockResolvedValue({ active: true } as browser.Tabs.Tab)
    vi.stubGlobal('location', { hash: '#https://example.com', replace: vi.fn() })
    mount(App)
    await flushPromises()
    expect(window.location.replace).toHaveBeenCalledWith('https://example.com')
  })

  it('never navigates to active content even in a selected tab', async () => {
    vi.mocked(browser.tabs.getCurrent).mockResolvedValue({ active: true } as browser.Tabs.Tab)
    vi.stubGlobal('location', { hash: '#javascript:alert(1)', replace: vi.fn() })
    mount(App)
    window.dispatchEvent(new Event('focus'))
    await flushPromises()
    expect(window.location.replace).not.toHaveBeenCalled()
  })
})
