<template>
  <section id="action-bar">
    <button id="extract" @click="setUrlListInputData">Extract URLs from text</button>
    <button id="open" :disabled="opening || tabCount === 0" @click="openURLs">
      <strong>
        Open URLs <span v-if="tabCount > 0">({{ tabCount }})</span>
      </strong>
    </button>
    <select
      aria-label="Tab group"
      id="tabGroupSelection"
      v-if="tabGroupsSupported"
      v-model="selectedTabGroupId"
    >
      <option v-for="group in tabGroups" :key="group.id" :value="group.id">
        {{ group.title }}
      </option>
    </select>
    <select
      id="containerSelection"
      v-if="containersSupported"
      v-model="selectedContainerId"
      @change="setContainerSelection"
    >
      <option v-for="c in containers" :key="c.cookieStoreId" :value="c.cookieStoreId">
        {{ c.title }}
      </option>
    </select>
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
import { extractURLs } from '@/browseraction/components/logic/extract'
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
      status: '',
      selectedContainerId: store.selectedContainerId
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
        random: store.loadInRandomOrderChecked,
        reverse: store.loadInReverseOrderChecked,
        deduplicate: store.deduplicateURLsChecked,
        handleAsSearchQuery: store.handleAsSearchQueryChecked,
        selectedTabGroupId: this.selectedTabGroupId,
        selectedContainerId: this.selectedContainerId
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
    setUrlListInputData() {
      store.setUrlList(extractURLs(store.urlList))
    },
    setContainerSelection() {
      this.$nextTick(() => {
        store.setSelectedContainerId(this.selectedContainerId)
      })
    }
  },
  computed: {
    selectedTabGroupId: {
      get() {
        return store.selectedTabGroupId
      },
      set(value: number) {
        store.setSelectedTabGroupId(value)
      }
    },
    tabCount: function () {
      return getTabCount(store.urlList, store.deduplicateURLsChecked)
    },
    tabGroupsSupported: function () {
      return store.hasTabGroupSupport
    },
    tabGroups: function () {
      return store.tabGroups
    },
    containersSupported: function () {
      return store.hasContainerSupport
    },
    containers: function () {
      return store.containers
    }
  }
}
</script>

<style scoped></style>
