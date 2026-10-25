<script lang="ts" setup>
import { store } from '@/browseraction/components/store/store'
import { NO_LAZY_LOAD_SCHEMES } from './logic/urlschema'
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
          :title="
            'Search queries and the following URL schemes are not supported: ' +
            NO_LAZY_LOAD_SCHEMES.join(', ')
          "
        >
          ⓘ
        </span>
      </label>
      <label class="checkbox"
        ><input
          type="checkbox"
          id="random"
          :checked="store.loadInRandomOrderChecked"
          @change="checkLoadInRandomOrder"
        />
        Load in random order</label
      >
      <label class="checkbox"
        ><input
          type="checkbox"
          id="reverse"
          :checked="store.loadInReverseOrderChecked"
          @change="checkLoadInReverseOrder"
        />
        Load in reverse order</label
      >
    </section>
    <!-- URL handling options -->
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
      <label class="checkbox"
        ><input
          type="checkbox"
          id="searchquery"
          :checked="store.handleAsSearchQueryChecked"
          @change="checkHandleAsSearchQuery"
        />
        Handle Non-URLs as search queries</label
      >
    </section>
  </section>
  <!-- Input handling options -->
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
    <p class="option-hint">Remember your list when you reload or reopen this tab.</p>
  </section>
</template>

<script lang="ts">
export default {
  methods: {
    checkLazyLoading(event: Event) {
      this.$nextTick(() => {
        store.setLazyLoadingChecked((event?.target as HTMLInputElement).checked)
      })
    },
    checkLoadInRandomOrder(event: Event) {
      this.$nextTick(() => {
        store.setLoadInRandomOrderChecked((event?.target as HTMLInputElement).checked)
      })
    },
    checkLoadInReverseOrder(event: Event) {
      this.$nextTick(() => {
        store.setLoadInReverseOrderChecked((event?.target as HTMLInputElement).checked)
      })
    },
    checkPreserveInput(event: Event) {
      this.$nextTick(() => {
        store.setPreserveInputChecked((event?.target as HTMLInputElement).checked)
      })
    },
    checkDeduplicateURLs(event: Event) {
      this.$nextTick(() => {
        store.setDeduplicateURLsChecked((event?.target as HTMLInputElement).checked)
      })
    },
    checkHandleAsSearchQuery(event: Event) {
      this.$nextTick(() => {
        store.setHandleAsSearchQueryChecked((event?.target as HTMLInputElement).checked)
      })
    }
  }
}
</script>

<style scoped></style>
