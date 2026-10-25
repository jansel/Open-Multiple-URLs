import browser from 'webextension-polyfill'
import { openInterfaceTab } from './interface-tab'
import type { LoadSitesMessage } from './types'
import { loadSites } from '../browseraction/components/logic/load'

// Listen for messages from the interface tab
export const loadSitesListener = async (
  message: unknown,
  sender?: browser.Runtime.MessageSender
) => {
  if (
    message &&
    typeof message === 'object' &&
    'action' in message &&
    message.action === 'loadSites'
  ) {
    const loadSitesMessage = message as LoadSitesMessage
    return loadSites(
      loadSitesMessage.text,
      loadSitesMessage.lazyloading,
      loadSitesMessage.random,
      loadSitesMessage.reverse,
      loadSitesMessage.deduplicate,
      loadSitesMessage.handleAsSearchQuery,
      loadSitesMessage.selectedTabGroupId,
      loadSitesMessage.selectedContainerId,
      sender?.tab?.windowId
    )
  }
  return false
}
browser.runtime.onMessage.addListener(loadSitesListener)

browser.action.onClicked.addListener((tab) => {
  void openInterfaceTab(tab).catch((error) =>
    console.error('Could not open the interface tab', error)
  )
})
