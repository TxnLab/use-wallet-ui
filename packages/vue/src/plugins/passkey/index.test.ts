import { describe, expect, it } from 'vitest'

import { passkeyPlugin, PASSKEY_RECOVERY_DIALOG } from './index'

import type { MenuRenderContext } from '../types'

const keys = (
  options?: Parameters<typeof passkeyPlugin>[0],
): string[] | undefined =>
  passkeyPlugin(options).menuItems?.map((item) => item.key)

describe('passkeyPlugin', () => {
  it('adds the recovery phrase by default, with the disclosure off', () => {
    expect(keys()).toEqual(['passkey-recovery-trigger'])
    expect(passkeyPlugin().dialogs?.map((dialog) => dialog.key)).toEqual([
      PASSKEY_RECOVERY_DIALOG,
    ])
  })

  it('adds the disclosure with `disclosure: true` or a custom text', () => {
    expect(keys({ disclosure: true })).toEqual([
      'passkey-disclosure',
      'passkey-recovery-trigger',
    ])
    expect(keys({ disclosure: 'Custom for {domain}' })).toEqual([
      'passkey-disclosure',
      'passkey-recovery-trigger',
    ])
  })

  it('adds the session control with `session: true`', () => {
    expect(keys({ session: true })).toEqual([
      'passkey-session',
      'passkey-recovery-trigger',
    ])
  })

  it('leaves out what is turned off', () => {
    expect(keys({ session: true, recoveryPhrase: false })).toEqual([
      'passkey-session',
    ])
    expect(passkeyPlugin({ recoveryPhrase: false }).dialogs).toEqual([])
  })

  it('shows its menu items only for the passkey wallet', () => {
    const ctx = (id: string | null): MenuRenderContext =>
      ({ activeWallet: id ? { id } : null }) as unknown as MenuRenderContext
    for (const item of passkeyPlugin({ session: true, disclosure: true })
      .menuItems ?? []) {
      expect(item.enabled?.(ctx('passkey'))).toBe(true)
      expect(item.enabled?.(ctx('pera'))).toBe(false)
      expect(item.enabled?.(ctx(null))).toBe(false)
    }
  })
})
