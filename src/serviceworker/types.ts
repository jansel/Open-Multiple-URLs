import type { UrlOrder } from '@/browseraction/components/logic/order'

/**
 * Type definition for message passing between interface tab and background script
 */

export interface LoadSitesMessage {
  action: 'loadSites'
  text: string
  lazyloading: boolean
  order: UrlOrder
  deduplicate: boolean
  selectedTabGroupId: number | null | undefined
  selectedContainerId: string | null | undefined
}

export interface LoadSitesResult {
  opened: number
  failed: number
}
