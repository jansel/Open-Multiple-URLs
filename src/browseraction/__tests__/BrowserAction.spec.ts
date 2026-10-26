vi.mock('webextension-polyfill', () => ({
  default: {
    runtime: {
      getURL: (val: string) => val,
      sendMessage: async (message: unknown) => {
        sendMessageCalls.push(message)
      }
    },
    storage: {
      local: {
        get: async (keys: string[]) => Object.fromEntries(keys.map((key) => [key, mockStore[key]])),
        set: async (values: Record<string, unknown>) => {
          Object.assign(mockStore, values)
        }
      }
    }
  }
}))

import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest'
import { flushPromises, mount, enableAutoUnmount } from '@vue/test-utils'
import App from '../BrowserAction.vue'
import browser from 'webextension-polyfill'

enableAutoUnmount(afterEach)

let mockStore: Record<string, unknown> = {}
let sendMessageCalls: unknown[] = []

beforeEach(() => {
  mockStore = {}
  sendMessageCalls = []
})

describe('workspace', () => {
  it('renders with local defaults', async () => {
    const wrapper = mount(App)
    await flushPromises()
    expect(wrapper.text()).toContain('Extract URLs from text')
    expect(wrapper.get('#urls').element).toHaveProperty('value', '')
    expect(wrapper.get('#lazyLoad').element).toHaveProperty('checked', false)
    expect(wrapper.get('#preserve').element).toHaveProperty('checked', true)
    expect(wrapper.get('#deduplicate').element).toHaveProperty('checked', true)
    expect(wrapper.get('#order').element).toHaveProperty('value', 'original')
    expect(wrapper.findAll('#order option').map((option) => option.text())).toEqual([
      'Original',
      'Reverse',
      'Random'
    ])
    expect(wrapper.find('#random').exists()).toBe(false)
    expect(wrapper.find('#reverse').exists()).toBe(false)
    expect(wrapper.find('#searchquery').exists()).toBe(false)
    expect(wrapper.text().toLowerCase()).not.toContain('sync')
    expect(wrapper.get('#clear').element).toHaveProperty('disabled', true)
  })

  it('extracts URLs from text', async () => {
    const wrapper = mount(App)
    await flushPromises()
    await wrapper.get('#urls').setValue('foo https://github.com bar')
    await wrapper.get('#extract').trigger('click')
    expect(wrapper.get('#urls').element).toHaveProperty('value', 'https://github.com\n')
    expect(wrapper.get('#extract').element).toHaveProperty('disabled', true)
  })

  it.each([
    '',
    '   ',
    'A note with no links',
    'https://example.com',
    'https://example.com\nhttps://example.org\n',
    'https://example.com\r\nhttps://example.org\r\n'
  ])('disables extraction when it has no useful result for %j', async (text) => {
    const wrapper = mount(App)
    await flushPromises()
    await wrapper.get('#urls').setValue(text)
    expect(wrapper.get('#extract').element).toHaveProperty('disabled', true)
    await wrapper.get('#extract').trigger('click')
    expect(wrapper.get('#urls').element).toHaveProperty('value', text.replace(/\r\n?/g, '\n'))
  })

  it('enables extraction again when prose is added to a clean list', async () => {
    const wrapper = mount(App)
    await flushPromises()
    await wrapper.get('#urls').setValue('https://example.com\n')
    expect(wrapper.get('#extract').element).toHaveProperty('disabled', true)
    await wrapper.get('#urls').setValue('Visit https://example.com today')
    expect(wrapper.get('#extract').element).toHaveProperty('disabled', false)
    await wrapper.get('#extract').trigger('click')
    expect(wrapper.get('#urls').element).toHaveProperty('value', 'https://example.com\n')
    expect(wrapper.get('#extract').element).toHaveProperty('disabled', true)
  })

  it.each(['original', 'reverse', 'random'])(
    'sends a single %s order to the background script',
    async (order) => {
      const wrapper = mount(App)
      await flushPromises()
      await wrapper.get('#urls').setValue('https://github.com\nhttps://example.com')
      await wrapper.get('#order').setValue(order)
      await wrapper.get('#open').trigger('click')
      expect(sendMessageCalls).toEqual([
        {
          action: 'loadSites',
          deduplicate: true,
          lazyloading: false,
          order,
          selectedContainerId: 'NO_CONTAINER_ID',
          selectedTabGroupId: -1,
          text: 'https://github.com\nhttps://example.com'
        }
      ])
      expect(mockStore.order).toBe(order)
    }
  )

  it('counts unique URLs by default and warns at 25', async () => {
    const wrapper = mount(App)
    await flushPromises()
    await wrapper.get('#urls').setValue('https://example.com\n'.repeat(25))
    expect(wrapper.get('#open').text()).toContain('(1)')
    expect(wrapper.find('#tabcount').exists()).toBe(false)
    const urls = Array.from({ length: 25 }, (_, index) => `https://example.com/${index}`)
    await wrapper.get('#urls').setValue(urls.slice(0, 24).join('\n'))
    expect(wrapper.get('#open').text()).toContain('(24)')
    expect(wrapper.find('#tabcount').exists()).toBe(false)
    await wrapper.get('#urls').setValue(urls.join('\n'))
    expect(wrapper.get('#open').text()).toContain('(25)')
    expect(wrapper.find('#tabcount').exists()).toBe(true)
  })

  it.each([true, false])(
    'clears current and saved input with preservation %s',
    async (preserve) => {
      mockStore = { preserve, txt: 'https://example.com/saved' }
      const wrapper = mount(App, { attachTo: document.body })
      await flushPromises()
      await wrapper.get('#urls').setValue('https://example.com/edit')
      await wrapper.get('#open').trigger('click')
      await flushPromises()
      expect(wrapper.find('[role="status"]').exists()).toBe(true)
      await wrapper.get('#clear').trigger('click')
      expect(wrapper.get('#urls').element).toHaveProperty('value', '')
      expect(document.activeElement).toBe(wrapper.get('#urls').element)
      expect(mockStore.txt).toBe('')
      expect(wrapper.get('#clear').element).toHaveProperty('disabled', true)
      expect(wrapper.get('#open').element).toHaveProperty('disabled', true)
      expect(wrapper.find('[role="status"]').exists()).toBe(false)
      expect(wrapper.get('#preserve').element).toHaveProperty('checked', preserve)
    }
  )
})

describe('local settings', () => {
  it('restores input and saved options, including explicit false values', async () => {
    mockStore = {
      txt: 'https://example.com/saved',
      lazyload: true,
      preserve: true,
      deduplicate: false,
      order: 'reverse'
    }
    const wrapper = mount(App)
    await flushPromises()
    expect(wrapper.get('#urls').element).toHaveProperty('value', mockStore.txt)
    expect(wrapper.get('#lazyLoad').element).toHaveProperty('checked', true)
    expect(wrapper.get('#deduplicate').element).toHaveProperty('checked', false)
    expect(wrapper.get('#order').element).toHaveProperty('value', 'reverse')
  })

  it.each(['original', 'reverse', 'random', 'invalid'])(
    'restores stored order %s',
    async (order) => {
      mockStore = { order }
      const wrapper = mount(App)
      await flushPromises()
      expect(wrapper.get('#order').element).toHaveProperty(
        'value',
        order === 'invalid' ? 'original' : order
      )
    }
  )

  it('does not restore or save input when preservation is off', async () => {
    mockStore = { preserve: false }
    const wrapper = mount(App)
    await flushPromises()
    expect(wrapper.get('#preserve').element).toHaveProperty('checked', false)
    expect(wrapper.get('#urls').element).toHaveProperty('value', '')
    await wrapper.get('#urls').setValue('https://example.com/unsaved')
    expect(mockStore.txt).toBeUndefined()
  })

  it('saves input by default, clears saved input on opt-out, and saves current input on opt-in', async () => {
    const wrapper = mount(App)
    await flushPromises()
    await wrapper.get('#urls').setValue('https://example.com/saved')
    expect(mockStore.txt).toBe('https://example.com/saved')
    await wrapper.get('#preserve').setValue(false)
    expect(mockStore.txt).toBe('')
    expect(mockStore.preserve).toBe(false)
    expect(wrapper.get('#urls').element).toHaveProperty('value', 'https://example.com/saved')
    await wrapper.get('#urls').setValue('https://example.com/edited')
    expect(mockStore.txt).toBe('')
    await wrapper.get('#preserve').setValue(true)
    expect(mockStore.txt).toBe('https://example.com/edited')
    expect(mockStore.preserve).toBe(true)
  })

  it.each([
    { id: 'lazyLoad', key: 'lazyload' },
    { id: 'preserve', key: 'preserve' },
    { id: 'deduplicate', key: 'deduplicate' }
  ])('stores the $id setting locally', async ({ id, key }) => {
    const wrapper = mount(App, { attachTo: document.body })
    await flushPromises()
    for (const value of [false, true, false]) {
      await wrapper.get(`#${id}`).setValue(value)
      expect(wrapper.get(`#${id}`).element).toHaveProperty('checked', value)
      // The initial false value for lazy loading need not write an unchanged default.
      expect(mockStore[key] ?? false).toBe(value)
    }
  })

  it('shows a recoverable error if saving fails', async () => {
    const wrapper = mount(App)
    await flushPromises()
    const save = vi.spyOn(browser.storage.local, 'set').mockRejectedValueOnce(new Error('quota'))
    await wrapper.get('#order').setValue('reverse')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('Could not save your changes')
    await wrapper.get('#order').setValue('original')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    save.mockRestore()
  })
})
