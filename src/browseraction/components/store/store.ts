import { reactive } from 'vue'
import browser from 'webextension-polyfill'
import { BrowserStorageKey } from '@/browseraction/components/store/browser-storage'
import { NO_TAB_GROUP_ID, type TabGroup } from '../logic/tabgroups'
import { parseUrlOrder, type UrlOrder } from '../logic/order'
import { NO_CONTAINER_ID, type Container } from '../logic/containers'

export const store = reactive({
  urlList: '',
  lazyLoadingChecked: false,
  order: 'original' as UrlOrder,
  preserveInputChecked: true,
  deduplicateURLsChecked: true,

  hasTabGroupSupport: false,
  tabGroups: [] as TabGroup[],
  selectedTabGroupId: NO_TAB_GROUP_ID,
  storageError: '',

  hasContainerSupport: false,
  containers: [] as Container[],
  selectedContainerId: NO_CONTAINER_ID,

  saveLocal(values: Record<string, unknown>) {
    this.storageError = ''
    void browser.storage.local.set(values).catch(() => {
      this.storageError = 'Could not save your changes. Please try again.'
    })
  },

  setUrlList(value: string) {
    this.urlList = value
    if (this.preserveInputChecked) {
      this.saveLocal({ [BrowserStorageKey.urlList]: value })
    }
  },
  clearUrlList() {
    this.urlList = ''
    this.saveLocal({ [BrowserStorageKey.urlList]: '' })
  },
  setLazyLoadingChecked(value: boolean) {
    this.lazyLoadingChecked = value
    this.saveLocal({ [BrowserStorageKey.lazyload]: value })
  },
  setOrder(value: string) {
    this.order = parseUrlOrder(value)
    this.saveLocal({ [BrowserStorageKey.order]: this.order })
  },
  setPreserveInputChecked(value: boolean) {
    this.preserveInputChecked = value
    this.saveLocal({
      [BrowserStorageKey.preserve]: value,
      [BrowserStorageKey.urlList]: value ? this.urlList : ''
    })
  },
  setDeduplicateURLsChecked(value: boolean) {
    this.deduplicateURLsChecked = value
    this.saveLocal({ [BrowserStorageKey.deduplicate]: value })
  },
  setSelectedTabGroupId(value: number) {
    this.selectedTabGroupId = Number(value)
    this.saveLocal({ [BrowserStorageKey.selectedTabGroupId]: this.selectedTabGroupId })
  },
  setSelectedContainerId(value: string) {
    this.selectedContainerId = value
    this.saveLocal({ [BrowserStorageKey.selectedContainerId]: value })
  }
})
