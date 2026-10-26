vi.mock('webextension-polyfill', () => ({
  default: {
    tabGroups: {
      query: () =>
        Promise.resolve([{ id: MOCK_TAB_GROUP_ID, title: MOCK_TAB_GROUP_TITLE, color: 'blue' }])
    },
    runtime: {
      getURL: (val: string) => val,
      sendMessage: (message: any) => {
        sendMessageCalls.push(message)
        return Promise.resolve()
      },
      onMessage: {
        addListener: vi.fn()
      }
    },
    storage: {
      local: {
        remove: async (key: string) => {
          delete mockStore[key]
        },
        get: (key: string | string[]) => {
          if (Array.isArray(key)) {
            return key.reduce((acc, k) => ({ ...acc, [k]: mockStore[k] }), {})
          }
          return { [key]: mockStore[key] }
        },
        set: async (val: any) => {
          mockStore = { ...mockStore, ...val }
        }
      }
    }
  }
}))

import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest'
import { flushPromises, mount, enableAutoUnmount } from '@vue/test-utils'
import App from '../BrowserAction.vue'
import { BrowserStorageKey } from '../components/store/browser-storage'
import {
  NEW_TAB_GROUP_ID,
  NEW_TAB_GROUP_TITLE,
  NO_TAB_GROUP_ID,
  NO_TAB_GROUP_TITLE
} from '../components/logic/tabgroups'
import { NEW_CONTAINER_TITLE, NO_CONTAINER_TITLE } from '../components/logic/containers'

const MOCK_TAB_GROUP_ID = 123
const MOCK_TAB_GROUP_TITLE = 'Mock Tab Group'

enableAutoUnmount(afterEach)

let mockStore: Record<string, unknown> = {}
let sendMessageCalls: any[] = []

beforeEach(() => {
  mockStore = {}
  sendMessageCalls = []
})

describe('browser action', () => {
  it('renders elements', async () => {
    const wrapper = mount(App)
    await flushPromises()
    expect(wrapper.text()).toContain('List of URLs / Text to extract URLs from:')
    expect(wrapper.text()).toContain('Open URLs')
    expect(wrapper.text()).toContain(NO_TAB_GROUP_TITLE)
    expect(wrapper.text()).toContain(NEW_TAB_GROUP_TITLE)
    expect(wrapper.text()).toContain(MOCK_TAB_GROUP_TITLE)
    expect(wrapper.text()).not.toContain(NO_CONTAINER_TITLE)
    expect(wrapper.text()).not.toContain(NEW_CONTAINER_TITLE)
    expect(wrapper.text()).toContain('Extract URLs from text')
    expect(wrapper.text()).toContain('Do not load tabs until selected')
    expect(wrapper.get('#order').text()).toContain('Original')
    expect(wrapper.get('#order').text()).toContain('Reverse')
    expect(wrapper.get('#order').text()).toContain('Random')
    expect(wrapper.text()).toContain('Preserve input')
    expect(wrapper.text()).toContain('Ignore duplicate URLs')
    expect(wrapper.find('#searchquery').exists()).toBe(false)
  })

  describe('features', () => {
    it('opens urls in new tabs in new tab group', async () => {
      const wrapper = mount(App)
      await flushPromises()

      await wrapper
        .find('textarea#urls')
        .setValue('https://github.com\nhttps://github.com/htrinter/')
      await wrapper.find('select#tabGroupSelection').setValue(NEW_TAB_GROUP_ID)

      await wrapper.find('button#open').trigger('click')

      expect(sendMessageCalls).toHaveLength(1)
      expect(sendMessageCalls[0]).toEqual({
        action: 'loadSites',
        deduplicate: true,
        lazyloading: false,
        order: 'original',
        selectedContainerId: 'NO_CONTAINER_ID',
        selectedTabGroupId: -2,
        text: 'https://github.com\nhttps://github.com/htrinter/'
      })
    })

    it('opens urls in new tabs in existing tab group', async () => {
      const wrapper = mount(App)
      await flushPromises()

      await wrapper
        .find('textarea#urls')
        .setValue('https://github.com\nhttps://github.com/htrinter/')
      await wrapper.find('select#tabGroupSelection').setValue(MOCK_TAB_GROUP_ID)

      await wrapper.find('button#open').trigger('click')

      expect(sendMessageCalls).toHaveLength(1)
      expect(sendMessageCalls[0]).toEqual({
        action: 'loadSites',
        deduplicate: true,
        lazyloading: false,
        order: 'original',
        selectedContainerId: 'NO_CONTAINER_ID',
        selectedTabGroupId: 123,
        text: 'https://github.com\nhttps://github.com/htrinter/'
      })
    })
  })

  describe('storage get', () => {
    it('renders with default options', async () => {
      const wrapper = mount(App)
      await flushPromises()
      expect((wrapper.find('select#tabGroupSelection').element as HTMLInputElement).value).toBe(
        String(NO_TAB_GROUP_ID)
      )
    })

    const renderWithStoredValuesTestCases = [
      {
        storeKey: BrowserStorageKey.selectedTabGroupId,
        value: String(MOCK_TAB_GROUP_ID),
        expectedStates: {
          selectedTabGroupId: MOCK_TAB_GROUP_ID
        }
      }
    ]
    it.each(renderWithStoredValuesTestCases)(
      'renders with stored $storeKey',
      async ({ storeKey, value, expectedStates }) => {
        mockStore = { [storeKey]: value }

        const wrapper = mount(App)
        await flushPromises()

        expect((wrapper.find('select#tabGroupSelection').element as HTMLInputElement).value).toBe(
          String(expectedStates.selectedTabGroupId)
        )
      }
    )
  })

  describe('storage set', () => {
    const storeTabGroupStateTestCases = [
      { selectedTabGroupId: NO_TAB_GROUP_ID },
      { selectedTabGroupId: NEW_TAB_GROUP_ID },
      { selectedTabGroupId: MOCK_TAB_GROUP_ID }
    ]
    it.each(storeTabGroupStateTestCases)(
      'stores $selectedTabGroupId tab group select state',
      async ({ selectedTabGroupId }) => {
        const storeKey = BrowserStorageKey.selectedTabGroupId

        const wrapper = mount(App, { attachTo: document.body })
        await flushPromises()

        const select = wrapper.find('select#tabGroupSelection')

        expect(mockStore[storeKey]).toBeFalsy()

        await select.setValue(selectedTabGroupId)
        expect((select.element as HTMLSelectElement).value).toBe(String(selectedTabGroupId))
        expect(mockStore[storeKey]).toBe(selectedTabGroupId)
      }
    )
  })
})
