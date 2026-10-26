<script lang="ts" setup>
import { store } from '@/browseraction/components/store/store'
import { NO_LAZY_LOAD_SCHEMES } from './logic/urlschema'

function checkLazyLoading(event: Event) {
  store.setLazyLoadingChecked((event.target as HTMLInputElement).checked)
}
function setOrder(event: Event) {
  store.setOrder((event.target as HTMLSelectElement).value)
}
function checkPreserveInput(event: Event) {
  store.setPreserveInputChecked((event.target as HTMLInputElement).checked)
}
function checkDeduplicateURLs(event: Event) {
  store.setDeduplicateURLsChecked((event.target as HTMLInputElement).checked)
}
</script>

<template>
  <section id="option-bar-hwrapper">
    <section>
      <h3>Loading</h3>
      <label class="checkbox"
        ><input
          type="checkbox"
          id="lazyLoad"
          :checked="store.lazyLoadingChecked"
          @change="checkLazyLoading"
        />
        Do not load tabs until selected &nbsp;<span
          :title="'The following URL schemes are not supported: ' + NO_LAZY_LOAD_SCHEMES.join(', ')"
        >
          ⓘ
        </span>
      </label>
      <label class="order-label" for="order">Order</label>
      <select id="order" :value="store.order" @change="setOrder">
        <option value="original">Original</option>
        <option value="reverse">Reverse</option>
        <option value="random">Random</option>
      </select>
    </section>
    <section>
      <h3>URL handling</h3>
      <label class="checkbox"
        ><input
          type="checkbox"
          id="deduplicate"
          :checked="store.deduplicateURLsChecked"
          @change="checkDeduplicateURLs"
        />
        Ignore duplicate URLs</label
      >
    </section>
  </section>
  <section>
    <h3>Workspace</h3>
    <label class="checkbox"
      ><input
        type="checkbox"
        id="preserve"
        :checked="store.preserveInputChecked"
        @change="checkPreserveInput"
      />
      Preserve input</label
    >
    <p class="option-hint">Remember your list on this device when you reload or reopen this tab.</p>
  </section>
</template>
