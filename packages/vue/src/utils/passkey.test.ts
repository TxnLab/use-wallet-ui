import { PasskeyError } from '@txnlab/use-wallet-passkey'
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'

import {
  getPasskeyAccountDomain,
  getPasskeyErrorCode,
  getPasskeyErrorMessage,
  isPasskeyWallet,
  type PasskeyWalletAdapter,
} from './passkey'

import type { PasskeyAdapter } from '@txnlab/use-wallet-passkey'

describe('PasskeyWalletAdapter', () => {
  it('matches the members of PasskeyAdapter it relies on', () => {
    expectTypeOf<PasskeyAdapter>().toMatchTypeOf<PasskeyWalletAdapter>()
  })
})

describe('isPasskeyWallet', () => {
  it('matches the passkey wallet id only', () => {
    expect(isPasskeyWallet({ id: 'passkey' })).toBe(true)
    expect(isPasskeyWallet({ id: 'pera' })).toBe(false)
    expect(isPasskeyWallet(null)).toBe(false)
  })
})

describe('getPasskeyErrorCode', () => {
  it('reads the code of a PasskeyError', () => {
    expect(getPasskeyErrorCode(new PasskeyError('cancelled', 'x'))).toBe(
      'cancelled',
    )
  })

  it('returns null for other errors', () => {
    expect(getPasskeyErrorCode(new Error('x'))).toBeNull()
    expect(
      getPasskeyErrorCode(Object.assign(new Error('x'), { code: 'cancelled' })),
    ).toBeNull()
    const numeric = Object.assign(new Error('x'), { code: 1 })
    numeric.name = 'PasskeyError'
    expect(getPasskeyErrorCode(numeric)).toBeNull()
    expect(getPasskeyErrorCode('cancelled')).toBeNull()
    expect(getPasskeyErrorCode(undefined)).toBeNull()
  })
})

describe('getPasskeyErrorMessage', () => {
  it('explains a cancelled request', () => {
    expect(
      getPasskeyErrorMessage(new PasskeyError('cancelled', 'raw')),
    ).toMatch(/cancelled or timed out, or no passkey was found/)
  })

  it('suggests a full browser when passkeys are unsupported', () => {
    expect(
      getPasskeyErrorMessage(new PasskeyError('unsupported', 'raw')),
    ).toMatch(/Safari or Chrome/)
  })

  it('suggests another provider when PRF is unsupported', () => {
    expect(
      getPasskeyErrorMessage(new PasskeyError('prf-unsupported', 'raw')),
    ).toMatch(/different provider/)
  })

  it('points to the right passkey on a key mismatch', () => {
    expect(
      getPasskeyErrorMessage(new PasskeyError('key-mismatch', 'raw')),
    ).toMatch(/different account/)
  })

  it("falls back to the adapter's message for other codes", () => {
    expect(
      getPasskeyErrorMessage(new PasskeyError('key-store-failed', 'CSP')),
    ).toBe('CSP')
  })

  it('has a message when the adapter gives none', () => {
    expect(
      getPasskeyErrorMessage(new PasskeyError('key-store-failed', '')),
    ).toBe('The passkey request failed.')
  })

  it('returns null for errors from other wallets', () => {
    expect(getPasskeyErrorMessage(new Error('Pera closed'))).toBeNull()
  })
})

describe('getPasskeyAccountDomain', () => {
  it("reads the domain from the adapter's account name", () => {
    expect(getPasskeyAccountDomain('Passkey · example.com')).toBe('example.com')
    expect(getPasskeyAccountDomain('My App · Passkey · app.example.com')).toBe(
      'app.example.com',
    )
  })

  it('trims the domain', () => {
    expect(getPasskeyAccountDomain('Passkey ·  example.com ')).toBe(
      'example.com',
    )
  })

  describe('without a domain in the name', () => {
    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('falls back to the page hostname', () => {
      vi.stubGlobal('location', { hostname: 'app.example.com' })
      expect(getPasskeyAccountDomain('Passkey')).toBe('app.example.com')
      expect(getPasskeyAccountDomain('Passkey · ')).toBe('app.example.com')
      expect(getPasskeyAccountDomain(undefined)).toBe('app.example.com')
    })
  })
})
