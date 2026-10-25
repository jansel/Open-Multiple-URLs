/**
 * Type definition for message passing between interface tab and background script
 */

export interface LoadSitesMessage {
  action: 'loadSites'
  text: string
  lazyloading: boolean
  random: boolean
  reverse: boolean
  deduplicate: boolean
  handleAsSearchQuery: boolean
  selectedTabGroupId: number | null | undefined
  selectedContainerId: string | null | undefined
}

export interface LoadSitesResult {
  opened: number
  failed: number
}
