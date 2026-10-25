import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UrlListInput from '../components/UrlListInput.vue'
import { store } from '../components/store/store'
import browser from 'webextension-polyfill'

vi.mock('webextension-polyfill', () => ({
  default: { storage: { local: { set: vi.fn() } } }
}))

beforeEach(() => {
  store.urlList = ''
  store.preserveInputChecked = true
  vi.clearAllMocks()
})

async function paste(initial: string, text: string, start: number, end: number) {
  store.urlList = initial
  const wrapper = mount(UrlListInput)
  const input = wrapper.get('textarea')
  input.element.setSelectionRange(start, end)
  await input.trigger('paste')
  input.element.value = initial.slice(0, start) + text + initial.slice(end)
  await input.trigger('input', { inputType: 'insertFromPaste' })
  return wrapper
}

describe('automatic paste extraction', () => {
  it('extracts a paste into an empty input and persists the result', async () => {
    const wrapper = await paste('', 'See https://example.com and https://example.org.', 0, 0)
    expect(wrapper.get('textarea').element.value).toBe('https://example.com\nhttps://example.org\n')
    expect(browser.storage.local.set).toHaveBeenLastCalledWith({ txt: store.urlList })
  })

  it('extracts only when the entire previous input is selected', async () => {
    await paste('old text', 'See https://example.com.', 0, 8)
    expect(store.urlList).toBe('https://example.com\n')
  })

  it.each([
    [0, 3],
    [4, 8],
    [4, 4],
    [0, 0],
    [8, 8]
  ])('preserves partial edits at selection %i–%i', async (start, end) => {
    const pasted = 'See https://example.com.'
    await paste('old text', pasted, start, end)
    expect(store.urlList).toBe('old text'.slice(0, start) + pasted + 'old text'.slice(end))
  })

  it('keeps text when a full paste contains no URLs', async () => {
    await paste('old', 'search for something', 0, 3)
    expect(store.urlList).toBe('search for something')
  })

  it('does not extract ordinary typing or a later edit after a cancelled paste', async () => {
    const wrapper = mount(UrlListInput)
    await wrapper.get('textarea').trigger('paste')
    await wrapper.get('textarea').setValue('See https://example.com.')
    expect(store.urlList).toBe('See https://example.com.')
  })
})
