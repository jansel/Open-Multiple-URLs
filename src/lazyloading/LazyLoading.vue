<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from 'vue'
import browser from 'webextension-polyfill'
import { canLazyLoad, hasValidSchema } from '../browseraction/components/logic/urlschema'

const url = window.location.hash.substring(1)
const canNavigate = hasValidSchema(url) && canLazyLoad(url)
let navigating = false

async function navigateIfSelected() {
  // Focus/visibility can briefly change while Chromium initializes a background tab.
  // Chrome's active flag is the authority for whether this tab was selected.
  if (!canNavigate || navigating) return
  try {
    const tab = await browser.tabs.getCurrent()
    if (tab?.active && !navigating) {
      navigating = true
      window.location.replace(url)
    }
  } catch (error) {
    console.error('Could not check whether this tab is selected', error)
  }
}

onMounted(() => {
  let title = url
  try {
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname.replace(/^www\./, '')
    title = `${hostname}${parsedUrl.pathname}`.replace(/\/$/, '')
  } catch {
    // Keep the original text if it cannot be parsed as a URL.
  }
  document.title = `[${title}]`

  // Never execute active content from a URL fragment inside an extension page.
  if (!canNavigate) return
  window.addEventListener('focus', navigateIfSelected)
  document.addEventListener('visibilitychange', navigateIfSelected)
  // A quickly selected tab may already be active before this script runs.
  void navigateIfSelected()
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', navigateIfSelected)
  document.removeEventListener('visibilitychange', navigateIfSelected)
})
</script>

<template>
  <div></div>
</template>
