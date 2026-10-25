<script lang="ts" setup></script>

<template>
  <div></div>
</template>

<script lang="ts">
import { canLazyLoad, hasValidSchema } from '../browseraction/components/logic/urlschema'
export default {
  methods: {
    init: () => {
      const url = window.location.hash.substring(1)

      let docTitle = url
      try {
        const parsedUrl = new URL(url)

        let hostname = parsedUrl.hostname
        if (hostname.startsWith('www.')) {
          hostname = hostname.substring(4)
        }

        let path = `${hostname}${parsedUrl.pathname}`
        if (path.endsWith('/')) {
          path = path.substring(0, path.length - 1)
        }

        docTitle = path
      } catch (e) {
        console.error(e)
      }
      document.title = `[${docTitle}]`

      // Never execute active content from a URL fragment inside an extension page.
      if (!hasValidSchema(url) || !canLazyLoad(url)) return

      const navigate = () => window.location.replace(url)
      window.addEventListener('focus', navigate, { once: true })
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') navigate()
      })
      // A quickly selected tab may already be focused before this script runs.
      if (document.hasFocus() && document.visibilityState === 'visible') navigate()
    }
  },
  beforeMount() {
    this.init()
  }
}
</script>

<style scoped></style>
