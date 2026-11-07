import { describe, expect, it } from 'vitest'

import { passkeyPlugin, PASSKEY_RECOVERY_DIALOG } from './index'

import type { MenuRenderContext } from '../types'

const keys = (
  options?: Parameters<typeof passkeyPlugin>[0],
): string[] | undefined =>
  passkeyPlugin(options).menuItems?.map((item) => item.key)

describe('passkeyPlugin', () => {
  it('adds the disclosure and recovery phrase by default', () => {
    expect(keys()).toEqual(['passkey-disclosure', 'passkey-recovery-trigger'])
    expect(passkeyPlugin().dialogs?.map((dialog) => dialog.key)).toEqual([
      PASSKEY_RECOVERY_DIALOG,
    ])
  })

  it('adds the session control with `session: true`', () => {
    expect(keys({ session: true })).toEqual([
      'passkey-disclosure',
      'passkey-session',
      'passkey-recovery-trigger',
    ])
  })

  it('leaves out what is turned off', () => {
    expect(
      keys({ session: true, disclosure: false, recoveryPhrase: false }),
    ).toEqual(['passkey-session'])
    expect(passkeyPlugin({ recoveryPhrase: false }).dialogs).toEqual([])
  })

  it('shows its menu items only for the passkey wallet', () => {
    const ctx = (id: string | null): MenuRenderContext =>
      ({ activeWallet: id ? { id } : null }) as unknown as MenuRenderContext
    for (const item of passkeyPlugin({ session: true }).menuItems ?? []) {
      expect(item.enabled?.(ctx('passkey'))).toBe(true)
      expect(item.enabled?.(ctx('pera'))).toBe(false)
      expect(item.enabled?.(ctx(null))).toBe(false)
    }
  })
})
