<template>
  <section id="action-bar">
    <button id="open" :disabled="opening || tabCount === 0" @click="openURLs">
      <strong>
        Open URLs <span v-if="tabCount > 0">({{ tabCount }})</span>
      </strong>
    </button>
    <button id="clear" :disabled="opening || !hasInput" @click="clearInput">Clear</button>
    <span
      id="tabcount"
      v-if="tabCount >= 25"
      aria-label="Opening many URLs at once may lead to long wait times or crash your browser."
      title="Opening many URLs at once can slow your browser."
    >
      &#9888;
    </span>
  </section>
  <p v-if="status" role="status" class="action-status">{{ status }}</p>
</template>

<script lang="ts">
import { store } from '@/browseraction/components/store/store'
import { loadTabGroups } from './logic/tabgroups'
import { loadContainers } from './logic/containers'
import browser from 'webextension-polyfill'
import type { LoadSitesMessage, LoadSitesResult } from '@/serviceworker/types'
import { getTabCount } from './logic/load'

export default {
  data() {
    return {
      opening: false,
      status: ''
    }
  },
  methods: {
    async openURLs() {
      if (this.opening) return
      this.opening = true
      this.status = 'Opening URLs…'
      const message: LoadSitesMessage = {
        action: 'loadSites',
        text: store.urlList,
        lazyloading: store.lazyLoadingChecked,
        order: store.order,
        deduplicate: store.deduplicateURLsChecked,
        selectedTabGroupId: store.selectedTabGroupId,
        selectedContainerId: store.selectedContainerId
      }
      try {
        const result = (await browser.runtime.sendMessage(message)) as LoadSitesResult | undefined
        store.tabGroups = await loadTabGroups()
        store.containers = await loadContainers()
        this.status = result?.failed
          ? `Opened ${result.opened} URLs. ${result.failed} could not be opened; check the addresses and try again.`
          : 'Finished opening URLs. Your list is ready to use again.'
      } catch {
        this.status = 'Could not finish opening URLs. Check your list and try again.'
      } finally {
        this.opening = false
      }
    },
    clearInput() {
      store.clearUrlList()
      this.status = ''
      document.getElementById('urls')?.focus()
    }
  },
  computed: {
    hasInput() {
      return store.urlList.length > 0
    },
    tabCount: function () {
      return getTabCount(store.urlList, store.deduplicateURLsChecked)
    }
  }
}
</script>
