import { afterEach, describe, expect, it, vi } from 'vitest'

const ADDRESS = 'PASSKEYADDRESS'

// Fresh module state (the in-memory fallback) for each test
async function load(): Promise<typeof import('./storage')> {
  vi.resetModules()
  return import('./storage')
}

function memoryStorage(): Storage {
  const items = new Map<string, string>()
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
    removeItem: (key) => void items.delete(key),
    clear: () => items.clear(),
    key: () => null,
    get length(): number {
      return items.size
    },
  }
}

function throwingStorage(): Storage {
  const fail = (): never => {
    throw new Error('SecurityError')
  }
  return {
    getItem: fail,
    setItem: fail,
    removeItem: fail,
    clear: fail,
    key: fail,
    length: 0,
  }
}

describe('passkey disclosure dismissal', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('remembers a dismissal per address in localStorage', async () => {
    const storage = memoryStorage()
    vi.stubGlobal('localStorage', storage)
    const { dismissDisclosure, isDisclosureDismissed } = await load()

    expect(isDisclosureDismissed(ADDRESS)).toBe(false)
    dismissDisclosure(ADDRESS)
    expect(isDisclosureDismissed(ADDRESS)).toBe(true)
    expect(isDisclosureDismissed('OTHERADDRESS')).toBe(false)
    expect(storage.getItem(`wui:passkey-disclosure-dismissed:${ADDRESS}`)).toBe(
      '1',
    )

    // A later page load reads it back from storage
    const reloaded = await load()
    expect(reloaded.isDisclosureDismissed(ADDRESS)).toBe(true)
  })

  it('falls back to memory when storage throws', async () => {
    vi.stubGlobal('localStorage', throwingStorage())
    const { dismissDisclosure, isDisclosureDismissed } = await load()

    expect(isDisclosureDismissed(ADDRESS)).toBe(false)
    expect(() => dismissDisclosure(ADDRESS)).not.toThrow()
    expect(isDisclosureDismissed(ADDRESS)).toBe(true)
  })
})
