import browser from 'webextension-polyfill'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { NEW_TAB_GROUP_ID, NO_TAB_GROUP_ID } from '@/browseraction/components/logic/tabgroups'
import { NEW_CONTAINER_ID, NO_CONTAINER_ID } from '@/browseraction/components/logic/containers'
import { getTabCount, loadSites, splitInputLines } from '@/browseraction/components/logic/load'

const MOCK_TAB_GROUP_ID = 42
const MOCK_CONTAINER_ID = '123-container'

const { tabCreateMock } = vi.hoisted(() => ({ tabCreateMock: vi.fn() }))
const ciCreateMock = vi.fn()

vi.mock('webextension-polyfill', () => ({
  default: {
    tabs: {
      create: tabCreateMock,
      group: vi.fn()
    },
    contextualIdentities: {
      create: (props: any) => {
        ciCreateMock(props)
        return { cookieStoreId: MOCK_CONTAINER_ID }
      }
    },
    runtime: { getURL: (val: string) => val }
  }
}))

const url1 = 'https://test.de'
const url2 = 'https://example.com'
const urlList = url1 + '\n' + url2

describe('load tabs', () => {
  beforeEach(() => {
    tabCreateMock.mockResolvedValue({ id: 42 })
  })
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('loads tabs in sequence', async () => {
    await loadSites(urlList, false, 'original', false, null)

    expect(tabCreateMock).toHaveBeenNthCalledWith(1, {
      url: url1,
      active: false
    })
    expect(tabCreateMock).toHaveBeenNthCalledWith(2, {
      url: url2,
      active: false
    })
    expect(tabCreateMock).toHaveBeenCalledTimes(2)
    expect(browser.tabs.group).not.toHaveBeenCalled()
  })

  it('lazy loads tabs', async () => {
    await loadSites(urlList, true, 'original', false, null)

    expect(tabCreateMock).toHaveBeenCalledWith({
      url: 'lazyloading.html#' + url1,
      active: false
    })
    expect(tabCreateMock).toHaveBeenCalledWith({
      url: 'lazyloading.html#' + url2,
      active: false
    })
    expect(tabCreateMock).toHaveBeenCalledTimes(2)
  })

  it('loads tabs in random order', async () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0)
    const thirdUrl = 'https://example.org'
    await loadSites(`${urlList}\n${thirdUrl}`, false, 'random', false, null)
    expect(tabCreateMock.mock.calls.map(([props]) => props.url)).toEqual([url2, thirdUrl, url1])
    random.mockRestore()
  })

  it('loads tabs in reverse order', async () => {
    await loadSites(urlList, false, 'reverse', false, null)

    expect(tabCreateMock).toHaveBeenNthCalledWith(1, {
      url: url2,
      active: false
    })
    expect(tabCreateMock).toHaveBeenNthCalledWith(2, {
      url: url1,
      active: false
    })
    expect(tabCreateMock).toHaveBeenCalledTimes(2)
  })

  it('loads tabs and deduplicate', async () => {
    await loadSites(`${urlList}\n${urlList}\n${urlList}\n${urlList}`, false, 'original', true, null)

    expect(tabCreateMock).toHaveBeenNthCalledWith(1, {
      url: url1,
      active: false
    })
    expect(tabCreateMock).toHaveBeenNthCalledWith(2, {
      url: url2,
      active: false
    })
    expect(tabCreateMock).toHaveBeenCalledTimes(2)
  })

  it('prepends http protocol if protocol does not exist', async () => {
    await loadSites('test.de', false, 'reverse', false, null)

    expect(tabCreateMock).toHaveBeenNthCalledWith(1, {
      url: 'http://test.de',
      active: false
    })
  })

  it('determines tab count correctly', () => {
    expect(getTabCount('', false)).toBe(0)
    expect(getTabCount(url1, false)).toBe(1)
    expect(getTabCount(urlList, false)).toBe(2)
    expect(getTabCount(`url1\n`.repeat(5000), false)).toBe(5000)
    expect(getTabCount(`url1\n`.repeat(5001), false)).toBe(5001)
    expect(getTabCount(`${urlList}\n`.repeat(100), true)).toBe(2)
  })

  it('gets urls from text', () => {
    expect(splitInputLines('', false)).toEqual([])
    expect(splitInputLines('\n\n', false)).toEqual([])
    expect(splitInputLines(urlList, false)).toEqual([url1, url2])
    expect(splitInputLines(`\n\n\n${urlList}\n\n\n${urlList}\n\n`, false)).toEqual([
      url1,
      url2,
      url1,
      url2
    ])
    expect(splitInputLines(`\n\n\n${urlList}\n\n\n${urlList}\n\n`, true)).toEqual([url1, url2])
  })

  it('loads tabs without tab group', async () => {
    await loadSites(urlList, false, 'original', false, NO_TAB_GROUP_ID)

    expect(tabCreateMock).toHaveBeenCalledTimes(2)
    expect(browser.tabs.group).not.toHaveBeenCalled()
  })

  it('loads tabs to new tab group', async () => {
    await loadSites(urlList, false, 'original', false, NEW_TAB_GROUP_ID)

    expect(tabCreateMock).toHaveBeenCalledTimes(2)
    expect(browser.tabs.group).toBeCalledWith({ tabIds: [42, 42] })
  })

  it('loads tabs to existing tab group', async () => {
    await loadSites(urlList, false, 'original', false, MOCK_TAB_GROUP_ID)

    expect(tabCreateMock).toHaveBeenCalledTimes(2)
    expect(browser.tabs.group).toBeCalledWith({ tabIds: [42, 42], groupId: MOCK_TAB_GROUP_ID })
  })

  it('loads tabs without container', async () => {
    await loadSites(urlList, false, 'original', false, undefined, NO_CONTAINER_ID)

    expect(tabCreateMock).toHaveBeenCalledTimes(2)
    expect(ciCreateMock).not.toHaveBeenCalled()
  })

  it('loads tabs to new container', async () => {
    await loadSites(urlList, false, 'original', false, undefined, NEW_CONTAINER_ID)

    expect(tabCreateMock).toHaveBeenCalledTimes(2)
    expect(tabCreateMock).toHaveBeenCalledWith({
      url: url1,
      active: false,
      cookieStoreId: MOCK_CONTAINER_ID
    })
    expect(ciCreateMock).toHaveBeenCalled()
  })

  it('loads tabs to existing container', async () => {
    await loadSites(urlList, false, 'original', false, undefined, MOCK_CONTAINER_ID)

    expect(tabCreateMock).toHaveBeenCalledTimes(2)
    expect(ciCreateMock).not.toHaveBeenCalled()
  })

  it('keeps opening tabs in the originating window', async () => {
    await loadSites(urlList, false, 'original', false, null, null, 17)
    expect(tabCreateMock).toHaveBeenCalledWith({ url: url1, active: false, windowId: 17 })
  })

  it('reports failures and continues with valid URLs', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    tabCreateMock.mockRejectedValueOnce(new Error('Invalid URL'))
    const result = await loadSites(urlList, false, 'original', false)
    expect(result).toEqual({ opened: 1, failed: 1 })
    expect(tabCreateMock).toHaveBeenCalledTimes(2)
    log.mockRestore()
  })

  it('does not create an empty group', async () => {
    await loadSites('', false, 'original', false, NEW_TAB_GROUP_ID)
    expect(browser.tabs.group).not.toHaveBeenCalled()
  })
})
