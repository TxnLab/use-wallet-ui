const STORAGE_KEY_PREFIX = 'wui:passkey-disclosure-dismissed:'

// Fallback when storage is unavailable (private mode, blocked site data):
// the dismissal lasts for this page session
const dismissedInMemory = new Set<string>()

/** Whether the user dismissed the passkey disclosure for this account */
export function isDisclosureDismissed(address: string): boolean {
  if (dismissedInMemory.has(address)) return true
  try {
    return localStorage.getItem(STORAGE_KEY_PREFIX + address) === '1'
  } catch {
    return false
  }
}

/** Remember that the user dismissed the passkey disclosure for this account */
export function dismissDisclosure(address: string): void {
  dismissedInMemory.add(address)
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + address, '1')
  } catch {
    // Kept in memory above
  }
}
