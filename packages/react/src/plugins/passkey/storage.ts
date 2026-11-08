/**
 * A per-account flag in localStorage. Falls back to memory when storage is
 * unavailable (private mode, blocked site data), so it lasts for the page
 * session.
 */
interface AddressFlag {
  has: (address: string) => boolean
  set: (address: string) => void
}

function createAddressFlag(keyPrefix: string): AddressFlag {
  const inMemory = new Set<string>()
  return {
    has(address: string): boolean {
      if (inMemory.has(address)) return true
      try {
        return localStorage.getItem(keyPrefix + address) === '1'
      } catch {
        return false
      }
    },
    set(address: string): void {
      inMemory.add(address)
      try {
        localStorage.setItem(keyPrefix + address, '1')
      } catch {
        // Kept in memory above
      }
    },
  }
}

const disclosureDismissed = createAddressFlag(
  'wui:passkey-disclosure-dismissed:',
)

/** Whether the user dismissed the passkey disclosure for this account */
export const isDisclosureDismissed = (address: string): boolean =>
  disclosureDismissed.has(address)

/** Remember that the user dismissed the passkey disclosure for this account */
export const dismissDisclosure = (address: string): void =>
  disclosureDismissed.set(address)
