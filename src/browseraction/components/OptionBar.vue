<script lang="ts" setup>
import { computed } from 'vue'
import { store } from '@/browseraction/components/store/store'
import { extractURLs } from './logic/extract'

const extractedUrls = computed(() => extractURLs(store.urlList))
const canExtract = computed(
  () =>
    extractedUrls.value !== '' &&
    extractedUrls.value.trim() !== store.urlList.trim().replace(/\r\n?/g, '\n')
)

function extractInput() {
  if (canExtract.value) store.setUrlList(extractedUrls.value)
}
function checkLazyLoading(event: Event) {
  store.setLazyLoadingChecked((event.target as HTMLInputElement).checked)
}
function setOrder(event: Event) {
  store.setOrder((event.target as HTMLSelectElement).value)
}
function setTabGroup(event: Event) {
  store.setSelectedTabGroupId(Number((event.target as HTMLSelectElement).value))
}
function setContainer(event: Event) {
  store.setSelectedContainerId((event.target as HTMLSelectElement).value)
}
function checkPreserveInput(event: Event) {
  store.setPreserveInputChecked((event.target as HTMLInputElement).checked)
}
function checkDeduplicateURLs(event: Event) {
  store.setDeduplicateURLsChecked((event.target as HTMLInputElement).checked)
}
</script>

<template>
  <div class="option-list">
    <label class="checkbox">
      <input
        type="checkbox"
        id="lazyLoad"
        :checked="store.lazyLoadingChecked"
        @change="checkLazyLoading"
      />
      Do not load tabs until selected
    </label>
    <label class="checkbox">
      <input
        type="checkbox"
        id="deduplicate"
        :checked="store.deduplicateURLsChecked"
        @change="checkDeduplicateURLs"
      />
      Ignore duplicate URLs
    </label>
    <div>
      <label class="checkbox">
        <input
          type="checkbox"
          id="preserve"
          :checked="store.preserveInputChecked"
          @change="checkPreserveInput"
        />
        Preserve input
      </label>
      <p class="option-hint">Remember this list between visits.</p>
    </div>
    <div class="select-option">
      <label for="order">Order</label>
      <select id="order" :value="store.order" @change="setOrder">
        <option value="original">Original</option>
        <option value="reverse">Reverse</option>
        <option value="random">Random</option>
      </select>
    </div>
    <div v-if="store.hasTabGroupSupport" class="select-option">
      <label for="tabGroupSelection">Tab group</label>
      <select id="tabGroupSelection" :value="store.selectedTabGroupId" @change="setTabGroup">
        <option v-for="group in store.tabGroups" :key="group.id" :value="group.id">
          {{ group.title }}
        </option>
      </select>
    </div>
    <div v-if="store.hasContainerSupport" class="select-option">
      <label for="containerSelection">Container</label>
      <select id="containerSelection" :value="store.selectedContainerId" @change="setContainer">
        <option
          v-for="container in store.containers"
          :key="container.cookieStoreId"
          :value="container.cookieStoreId"
        >
          {{ container.title }}
        </option>
      </select>
    </div>
  </div>
  <div class="option-tools">
    <button id="extract" :disabled="!canExtract" @click="extractInput">
      Extract URLs from text
    </button>
  </div>
</template>
