<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { store } from './store/store'
import { extractURLs } from './logic/extract'

const urlTextArea = ref<HTMLTextAreaElement | null>(null)
let replacesAllOnPaste = false

onMounted(() => urlTextArea.value?.select())

function handlePaste(event: ClipboardEvent) {
  const input = event.target as HTMLTextAreaElement
  replacesAllOnPaste = input.selectionStart === 0 && input.selectionEnd === input.value.length
}

function handleInput(event: Event) {
  const input = event.target as HTMLTextAreaElement
  const shouldExtract = replacesAllOnPaste && (event as InputEvent).inputType === 'insertFromPaste'
  replacesAllOnPaste = false
  // Keep plain text (including search queries) when extraction finds nothing.
  store.setUrlList(shouldExtract ? extractURLs(input.value) || input.value : input.value)
}
</script>

<template>
  <section id="url-list-input">
    <label for="urls">List of URLs / Text to extract URLs from:</label>
    <textarea
      ref="urlTextArea"
      id="urls"
      wrap="soft"
      tabindex="1"
      :value="store.urlList"
      @paste="handlePaste"
      @input="handleInput"
    ></textarea>
  </section>
</template>
