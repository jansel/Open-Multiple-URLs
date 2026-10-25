<script lang="ts" setup>
import UrlListInput from '@/browseraction/components/UrlListInput.vue'
import ActionBar from '@/browseraction/components/ActionBar.vue'
import OptionBar from '@/browseraction/components/OptionBar.vue'
import { BrowserStorageKey } from '@/browseraction/components/store/browser-storage'
import browser from 'webextension-polyfill'
import { store } from '@/browseraction/components/store/store'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { NO_TAB_GROUP_ID, loadTabGroups } from './components/logic/tabgroups'
import { NO_CONTAINER_ID, loadContainers, hasContainerSupport } from './components/logic/containers'

const isStoredValuesLoaded = ref(false)
const loadError = ref('')
Promise.all([
  browser.storage.local.get(Object.values(BrowserStorageKey)),
  loadTabGroups(),
  hasContainerSupport(),
  loadContainers()
])
  .then((data) => {
    // stored options
    store.preserveInputChecked = Boolean(data[0][BrowserStorageKey.preserve] ?? true)
    store.urlList = store.preserveInputChecked
      ? String(data[0][BrowserStorageKey.urlList] ?? '')
      : ''
    store.lazyLoadingChecked = Boolean(data[0][BrowserStorageKey.lazyload])
    store.loadInRandomOrderChecked = Boolean(data[0][BrowserStorageKey.random])
    store.loadInReverseOrderChecked = Boolean(data[0][BrowserStorageKey.reverse])
    store.deduplicateURLsChecked = Boolean(data[0][BrowserStorageKey.deduplicate])
    store.handleAsSearchQueryChecked = Boolean(data[0][BrowserStorageKey.handleAsSearchQuery])

    // tab groups (Chrome only)
    store.hasTabGroupSupport = Boolean(browser.tabGroups)
    store.tabGroups = data[1]
    store.selectedTabGroupId =
      store.tabGroups.find(
        (group) => group.id === Number(data[0][BrowserStorageKey.selectedTabGroupId])
      )?.id ?? NO_TAB_GROUP_ID

    // contextual identities (Firefox only)
    store.hasContainerSupport = data[2]
    store.containers = data[3]
    store.selectedContainerId =
      store.containers.find(
        (c) => c.cookieStoreId === data[0][BrowserStorageKey.selectedContainerId]
      )?.cookieStoreId ?? NO_CONTAINER_ID

    isStoredValuesLoaded.value = true
  })
  .catch(() => {
    loadError.value = 'Could not load your saved settings. Reload this tab to try again.'
  })

async function refreshGroups() {
  if (!isStoredValuesLoaded.value) return
  try {
    store.tabGroups = await loadTabGroups()
    if (!store.tabGroups.some((group) => group.id === store.selectedTabGroupId)) {
      store.setSelectedTabGroupId(NO_TAB_GROUP_ID)
    }
  } catch {
    // Keep the current selection if Chrome is temporarily unavailable.
  }
}
onMounted(() => window.addEventListener('focus', refreshGroups))
onBeforeUnmount(() => window.removeEventListener('focus', refreshGroups))
</script>

<template>
  <main class="workspace">
    <header class="page-header">
      <img :src="browser.runtime.getURL('icon48.png')" width="44" height="44" alt="" />
      <div>
        <h1>Open Multiple URLs <span>Tab</span></h1>
        <p>A place for your links. Paste, organize, and open them together.</p>
      </div>
    </header>
    <p v-if="loadError" role="alert" class="error-message">{{ loadError }}</p>
    <div v-else-if="isStoredValuesLoaded" class="workspace-grid">
      <section class="editor-panel" aria-label="URL workspace">
        <UrlListInput />
        <ActionBar />
      </section>
      <aside class="options-panel" aria-labelledby="options-title">
        <h2 id="options-title">Opening options</h2>
        <OptionBar />
      </aside>
    </div>
    <p v-else role="status">Loading your workspace…</p>
    <footer>Your links stay on this device. This tab stays open while you browse.</footer>
  </main>
</template>
