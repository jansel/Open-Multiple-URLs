import browser from 'webextension-polyfill'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadSitesListener } from '@/serviceworker/background'
import { loadSites } from '@/browseraction/components/logic/load'

vi.mock('webextension-polyfill', () => ({
  default: {
    action: { onClicked: { addListener: vi.fn() } },
    runtime: { onMessage: { addListener: vi.fn() } }
  }
}))

vi.mock('@/browseraction/components/logic/load', () => ({
  loadSites: vi.fn().mockResolvedValue(true)
}))

describe('background script', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('registers message handler', async () => {
    expect(browser.runtime.onMessage.addListener).toHaveBeenCalledTimes(1)
    expect(browser.runtime.onMessage.addListener).toHaveBeenCalledWith(loadSitesListener)
  })

  it('handles loadSites message', async () => {
    const message = {
      action: 'loadSites',
      text: 'example.com',
      lazyloading: true,
      order: 'reverse',
      deduplicate: true,
      selectedTabGroupId: 42,
      selectedContainerId: 'container1'
    }

    const result = await loadSitesListener(message)
    expect(result).toBe(true)
    expect(loadSites).toHaveBeenCalledWith(
      'example.com',
      true,
      'reverse',
      true,
      42,
      'container1',
      undefined
    )
  })

  it('dismisses unknown actions', async () => {
    const message = {
      action: 'foobar'
    }

    const result = await loadSitesListener(message)
    expect(result).toBe(false)
  })
})
