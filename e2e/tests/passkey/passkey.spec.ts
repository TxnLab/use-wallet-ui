import { addVirtualAuthenticator, expect, test } from '../../fixtures/passkey'

import type { Page } from '@playwright/test'

// Runs against examples/react-passkey (passkey-react project) and
// examples/vue-passkey (passkey-vue project). Both register
// passkey({ session: true }), lute(), pera() and
// passkeyPlugin({ session: true, disclosure: true }).

async function openConnectDialog(page: Page) {
  await page.getByRole('button', { name: 'Connect Wallet' }).click()
  const section = page.locator('[data-passkey-connect]')
  await expect(section).toBeVisible()
  return section
}

async function openConnectedMenu(page: Page) {
  await page.locator('[data-wallet-button]').click()
  await expect(page.getByRole('button', { name: 'Disconnect' })).toBeVisible()
}

// Click outside the menu: the Vue menu doesn't close on Escape
async function closeConnectedMenu(page: Page) {
  await page.mouse.click(5, 700)
  await expect(page.getByRole('button', { name: 'Disconnect' })).toBeHidden()
}

/** Creates a passkey account and returns the connected button's label */
async function createPasskeyAccount(page: Page): Promise<string> {
  const section = await openConnectDialog(page)
  await section.getByRole('button', { name: 'Create a passkey' }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  const button = page.locator('[data-wallet-button]')
  await expect(button).not.toHaveText(/Connect Wallet/)
  return (await button.innerText()).trim()
}

// passkeyLayout: 'featured' (the examples start in it with ?layout=featured)
test.describe('Passkey wallet', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?layout=featured')
    await page.waitForSelector('[data-wallet-theme]')
  })

  test.afterEach(async ({ pageErrors }) => {
    expect(pageErrors).toEqual([])
  })

  test('leads with the passkey and lists the other wallets below', async ({
    page,
  }) => {
    const section = await openConnectDialog(page)
    await expect(
      section.getByRole('button', { name: 'Continue with passkey' }),
    ).toBeVisible()
    await expect(
      section.getByRole('button', { name: 'Create a passkey' }),
    ).toBeVisible()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('or connect a wallet')).toBeVisible()
    await expect(dialog.getByRole('button', { name: /Lute/ })).toBeVisible()
    await expect(dialog.getByRole('button', { name: /Pera/ })).toBeVisible()
    // The passkey wallet isn't repeated in the list
    await expect(
      dialog.getByRole('button', { name: /Passkey icon/ }),
    ).toHaveCount(0)
  })

  test('creates a passkey, disconnects, and signs back in to the same account', async ({
    page,
  }) => {
    await addVirtualAuthenticator(page)
    const label = await createPasskeyAccount(page)

    await openConnectedMenu(page)
    await expect(page.getByText('Passkey', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Disconnect' }).click()
    await expect(
      page.getByRole('button', { name: 'Connect Wallet' }),
    ).toBeVisible()

    const section = await openConnectDialog(page)
    await section.getByRole('button', { name: 'Continue with passkey' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page.locator('[data-wallet-button]')).toHaveText(label)
  })

  test("tags the account with its domain and shows the note until 'Got it'", async ({
    page,
  }) => {
    await addVirtualAuthenticator(page)
    await createPasskeyAccount(page)
    await openConnectedMenu(page)

    await expect(page.locator('[data-passkey-domain]')).toHaveText('localhost')
    const note = page.locator('[data-passkey-disclosure]')
    await expect(note).toContainText(
      'This account is created by and for localhost. Keep only what you need here, and move larger amounts to a wallet you control.',
    )

    // Let the menu settle (balance and NFD lookups re-render it), so a later
    // re-render can't be what hides the note
    await page.waitForTimeout(1500)
    await note.getByRole('button', { name: 'Got it' }).click()
    await expect(note).toHaveCount(0, { timeout: 500 })
    await expect(page.locator('[data-passkey-domain]')).toHaveText('localhost')

    // Dismissed for this account, across menu opens and page loads
    await page.keyboard.press('Escape')
    await page.reload()
    await page.waitForSelector('[data-wallet-button]')
    await openConnectedMenu(page)
    await expect(page.locator('[data-passkey-domain]')).toBeVisible()
    await expect(note).toHaveCount(0)
  })

  test('shows the note again for a different passkey account', async ({
    page,
  }) => {
    await addVirtualAuthenticator(page)
    const first = await createPasskeyAccount(page)
    await openConnectedMenu(page)
    await page
      .locator('[data-passkey-disclosure]')
      .getByRole('button', { name: 'Got it' })
      .click()
    await page.getByRole('button', { name: 'Disconnect' }).click()

    // A second passkey is a different account
    const second = await createPasskeyAccount(page)
    expect(second).not.toBe(first)
    await openConnectedMenu(page)
    await expect(page.locator('[data-passkey-disclosure]')).toBeVisible()
  })

  test('dismisses the note for the session when storage is unavailable', async ({
    page,
  }) => {
    // Block only the disclosure's storage keys; the wallet keeps its own
    await page.addInitScript(() => {
      const blocked = (key: string) =>
        key.startsWith('wui:passkey-disclosure-dismissed:')
      const { getItem, setItem } = Storage.prototype
      Storage.prototype.getItem = function (key: string) {
        if (blocked(key)) throw new DOMException('Blocked', 'SecurityError')
        return getItem.call(this, key)
      }
      Storage.prototype.setItem = function (key: string, value: string) {
        if (blocked(key)) throw new DOMException('Blocked', 'SecurityError')
        return setItem.call(this, key, value)
      }
    })
    await page.reload()
    await addVirtualAuthenticator(page)
    await createPasskeyAccount(page)
    await openConnectedMenu(page)

    const note = page.locator('[data-passkey-disclosure]')
    await note.getByRole('button', { name: 'Got it' }).click()
    await expect(note).toHaveCount(0)

    await closeConnectedMenu(page)
    await openConnectedMenu(page)
    await expect(note).toHaveCount(0)
  })

  test('locks and unlocks the session from the menu', async ({ page }) => {
    await addVirtualAuthenticator(page)
    await createPasskeyAccount(page)
    await openConnectedMenu(page)

    // Connecting unlocks the session
    const session = page.locator('[data-passkey-session]')
    await expect(session).toContainText('Unlocked')

    await session.getByRole('button', { name: 'Lock' }).click()
    await expect(session).toContainText('Locked')
    await expect(session).toContainText(
      'The next signature asks for your passkey.',
    )

    await session.getByRole('button', { name: 'Unlock' }).click()
    await expect(session).toContainText('Unlocked')
  })

  test('picks up a lock that happened while the menu was closed', async ({
    page,
  }) => {
    await addVirtualAuthenticator(page)
    await createPasskeyAccount(page)

    // A reload restores the account with the session locked
    await page.reload()
    await page.waitForSelector('[data-wallet-button]')
    await openConnectedMenu(page)
    await expect(page.locator('[data-passkey-session]')).toContainText('Locked')
  })

  test('exports the recovery phrase with Falcon import instructions', async ({
    page,
  }) => {
    await addVirtualAuthenticator(page)
    await createPasskeyAccount(page)
    await openConnectedMenu(page)

    await page.getByRole('button', { name: /Back up account/ }).click()
    const dialog = page.locator('[data-passkey-recovery-dialog]')
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('[data-passkey-falcon-note]')).toContainText(
      'Import it as a Falcon / quantum account',
    )
    await expect(dialog).toContainText('Falcon25 account')
    await expect(dialog).toContainText('quantum account import')
    await expect(dialog).toContainText(
      'A regular 25-word import restores a different, empty account.',
    )

    await dialog.getByRole('button', { name: 'Reveal Recovery Phrase' }).click()
    const words = dialog.locator('[data-passkey-phrase] li')
    await expect(words).toHaveCount(25)
    await expect(dialog.locator('[data-passkey-falcon-note]')).toBeVisible()

    await dialog.getByRole('button', { name: 'Done' }).click()
    await expect(dialog).toBeHidden()
  })

  test('hides the phrase when the dialog closes and starts over next time', async ({
    page,
  }) => {
    await addVirtualAuthenticator(page)
    await createPasskeyAccount(page)
    await openConnectedMenu(page)

    await page.getByRole('button', { name: /Back up account/ }).click()
    const dialog = page.locator('[data-passkey-recovery-dialog]')
    await dialog.getByRole('button', { name: 'Reveal Recovery Phrase' }).click()
    await expect(dialog.locator('[data-passkey-phrase] li')).toHaveCount(25)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()

    await openConnectedMenu(page)
    await page.getByRole('button', { name: /Back up account/ }).click()
    await expect(dialog.locator('[data-passkey-phrase]')).toHaveCount(0)
    await expect(
      dialog.getByRole('button', { name: 'Reveal Recovery Phrase' }),
    ).toBeVisible()
  })

  test('explains a sign-in with no passkey and keeps the dialog open', async ({
    page,
  }) => {
    // An authenticator with no credentials: the browser rejects the request
    // the same way it would a cancelled prompt
    await addVirtualAuthenticator(page)
    const section = await openConnectDialog(page)
    await section.getByRole('button', { name: 'Continue with passkey' }).click()

    await expect(section.getByRole('alert')).toHaveText(
      "The passkey request was cancelled or timed out, or no passkey was found. New here? Choose 'Create a passkey'.",
    )
    await expect(page.getByRole('dialog')).toBeVisible()

    // The user can go straight to creating one
    await section.getByRole('button', { name: 'Create a passkey' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page.locator('[data-wallet-button]')).not.toHaveText(
      /Connect Wallet/,
    )
  })

  test('explains a cancelled passkey prompt', async ({ page }) => {
    // Without user verification the browser rejects the prompt, as it does
    // when the user cancels it
    await addVirtualAuthenticator(page, { isUserVerified: false })
    const section = await openConnectDialog(page)
    await section.getByRole('button', { name: 'Create a passkey' }).click()

    await expect(section.getByRole('alert')).toHaveText(
      'The passkey request was cancelled or timed out, or no passkey was found.',
    )
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('suggests another provider when the passkey has no PRF support', async ({
    page,
  }) => {
    await addVirtualAuthenticator(page, { hasPrf: false })
    const section = await openConnectDialog(page)
    await section.getByRole('button', { name: 'Create a passkey' }).click()

    await expect(section.getByRole('alert')).toContainText(
      "Your passkey provider doesn't support passkey accounts. Try a different provider",
    )
  })

  test('still connects other wallets from a single-button section', async ({
    page,
  }) => {
    // Pera opens its own modal; the passkey example only polyfills Buffer
    await openConnectDialog(page)
    await page.getByRole('dialog').getByRole('button', { name: /Pera/ }).click()
    await expect(page.locator('pera-wallet-connect-modal')).toBeAttached()
  })

  test('shows Unlocked as soon as the unlock finishes', async ({ page }) => {
    await addVirtualAuthenticator(page)
    await createPasskeyAccount(page)
    await openConnectedMenu(page)

    const session = page.locator('[data-passkey-session]')
    await session.getByRole('button', { name: 'Lock' }).click()
    await session.getByRole('button', { name: 'Unlock' }).click()
    // Wait for the request to settle, then read once: the menu's 1s poll
    // must not be what updates it
    await expect(
      session.getByRole('button', { name: /^(Lock|Unlock)$/ }),
    ).toBeEnabled()
    expect(await session.innerText()).toContain('Unlocked')
  })

  test('explains a failed unlock and enables Unlock again', async ({
    page,
  }) => {
    const { client, authenticatorId } = await addVirtualAuthenticator(page)
    await createPasskeyAccount(page)
    await openConnectedMenu(page)

    const session = page.locator('[data-passkey-session]')
    await session.getByRole('button', { name: 'Lock' }).click()
    await client.send('WebAuthn.setUserVerified', {
      authenticatorId,
      isUserVerified: false,
    })
    await session.getByRole('button', { name: 'Unlock' }).click()

    await expect(session.getByRole('alert')).toHaveText(
      'The passkey request was cancelled or timed out, or no passkey was found.',
    )
    await expect(session).not.toContainText('The next signature asks')
    await expect(session.getByRole('button', { name: 'Unlock' })).toBeEnabled()
  })

  test('explains a failed export and starts over on Try Again', async ({
    page,
  }) => {
    const { client, authenticatorId } = await addVirtualAuthenticator(page)
    await createPasskeyAccount(page)
    await openConnectedMenu(page)
    await client.send('WebAuthn.setUserVerified', {
      authenticatorId,
      isUserVerified: false,
    })

    await page.getByRole('button', { name: /Back up account/ }).click()
    const dialog = page.locator('[data-passkey-recovery-dialog]')
    await dialog.getByRole('button', { name: 'Reveal Recovery Phrase' }).click()
    await expect(dialog.getByRole('alert')).toHaveText(
      'The passkey request was cancelled or timed out, or no passkey was found.',
    )
    await expect(dialog.locator('[data-passkey-phrase]')).toHaveCount(0)

    await dialog.getByRole('button', { name: 'Try Again' }).click()
    await expect(
      dialog.getByRole('button', { name: 'Reveal Recovery Phrase' }),
    ).toBeVisible()
  })

  test('clears a connect error when the dialog reopens', async ({ page }) => {
    await addVirtualAuthenticator(page)
    const section = await openConnectDialog(page)
    await section.getByRole('button', { name: 'Continue with passkey' }).click()
    await expect(section.getByRole('alert')).toBeVisible()

    await page.getByRole('button', { name: 'Close dialog' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()

    const reopened = await openConnectDialog(page)
    await expect(reopened.getByRole('alert')).toHaveCount(0)
  })

  test('clears the copied phrase from the clipboard when the dialog closes', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await addVirtualAuthenticator(page)
    await createPasskeyAccount(page)
    await openConnectedMenu(page)

    await page.getByRole('button', { name: /Back up account/ }).click()
    const dialog = page.locator('[data-passkey-recovery-dialog]')
    await dialog.getByRole('button', { name: 'Reveal Recovery Phrase' }).click()
    await expect(dialog.locator('[data-passkey-phrase] li')).toHaveCount(25)

    await dialog.getByRole('button', { name: 'Copy' }).click()
    await expect(dialog.getByRole('button', { name: 'Copied' })).toBeVisible()
    const readClipboard = () =>
      page.evaluate(() => navigator.clipboard.readText())
    expect((await readClipboard()).split(' ')).toHaveLength(25)

    await dialog.getByRole('button', { name: 'Done' }).click()
    await expect(dialog).toBeHidden()
    await expect.poll(readClipboard).toBe('')
  })

  test('shows which passkey action is waiting, and dims the other', async ({
    page,
  }) => {
    // Without presence simulation the prompt stays open
    await addVirtualAuthenticator(page, { automaticPresenceSimulation: false })
    const section = await openConnectDialog(page)
    await section.getByRole('button', { name: 'Create a passkey' }).click()

    const pressed = section.locator('button[aria-busy="true"]')
    await expect(pressed).toHaveText('Waiting for your passkey…')
    await expect(pressed).toHaveCSS('opacity', '1')
    await expect(section).not.toContainText('New here?')

    const other = section.getByRole('button', { name: 'Continue with passkey' })
    await expect(other).toBeDisabled()
    await expect(other).toHaveCSS('opacity', '0.5')
  })

  test("tags 'Back up account' until the phrase has been shown", async ({
    page,
  }) => {
    await addVirtualAuthenticator(page)
    await createPasskeyAccount(page)
    await openConnectedMenu(page)

    const backup = page.getByRole('button', { name: /Back up account/ })
    await expect(backup.locator('[data-passkey-not-backed-up]')).toHaveText(
      'Not backed up',
    )

    await backup.click()
    const dialog = page.locator('[data-passkey-recovery-dialog]')
    await dialog.getByRole('button', { name: 'Reveal Recovery Phrase' }).click()
    await expect(dialog.locator('[data-passkey-phrase] li')).toHaveCount(25)
    await dialog.getByRole('button', { name: 'Done' }).click()
    await expect(dialog).toBeHidden()

    await openConnectedMenu(page)
    await expect(backup).toBeVisible()
    await expect(page.locator('[data-passkey-not-backed-up]')).toHaveCount(0)

    // Remembered for this account across page loads
    await page.reload()
    await page.waitForSelector('[data-wallet-button]')
    await openConnectedMenu(page)
    await expect(backup).toBeVisible()
    await expect(page.locator('[data-passkey-not-backed-up]')).toHaveCount(0)
  })
})

// passkeyLayout: 'list', the default
test.describe('Passkey wallet, list layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-wallet-theme]')
  })

  test.afterEach(async ({ pageErrors }) => {
    expect(pageErrors).toEqual([])
  })

  async function openListDialog(page: Page) {
    await page.getByRole('button', { name: 'Connect Wallet' }).click()
    const section = page.locator('[data-passkey-connect="list"]')
    await expect(section).toBeVisible()
    return section
  }

  test('groups the passkey rows above the other wallets', async ({ page }) => {
    const section = await openListDialog(page)
    await expect(section.getByText('Passkey', { exact: true })).toBeVisible()
    await expect(
      section.getByRole('button', { name: 'Sign in with passkey' }),
    ).toBeVisible()
    await expect(
      section.getByRole('button', { name: 'Create a passkey' }),
    ).toBeVisible()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Wallets', { exact: true })).toBeVisible()
    await expect(dialog.getByRole('button', { name: /Lute/ })).toBeVisible()
    await expect(dialog.getByRole('button', { name: /Pera/ })).toBeVisible()
    // No featured button or divider in this layout
    await expect(
      dialog.getByRole('button', { name: 'Continue with passkey' }),
    ).toHaveCount(0)
    await expect(dialog.getByText('or connect a wallet')).toHaveCount(0)
  })

  test('creates a passkey, disconnects, and signs back in from the rows', async ({
    page,
  }) => {
    await addVirtualAuthenticator(page)
    let section = await openListDialog(page)
    await section.getByRole('button', { name: 'Create a passkey' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    const button = page.locator('[data-wallet-button]')
    await expect(button).not.toHaveText(/Connect Wallet/)
    const label = (await button.innerText()).trim()

    await button.click()
    await page.getByRole('button', { name: 'Disconnect' }).click()

    section = await openListDialog(page)
    await section.getByRole('button', { name: 'Sign in with passkey' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(button).toHaveText(label)
  })

  test('explains a sign-in with no passkey under the passkey group', async ({
    page,
  }) => {
    await addVirtualAuthenticator(page)
    const section = await openListDialog(page)
    await section.getByRole('button', { name: 'Sign in with passkey' }).click()

    await expect(section.getByRole('alert')).toHaveText(
      "The passkey request was cancelled or timed out, or no passkey was found. New here? Choose 'Create a passkey'.",
    )
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test("follows the provider's layout when it changes", async ({ page }) => {
    await page.getByLabel('Passkey layout').selectOption('featured')
    await page.getByRole('button', { name: 'Connect Wallet' }).click()
    await expect(
      page.locator('[data-passkey-connect="featured"]'),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Close dialog' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()

    await page.getByLabel('Passkey layout').selectOption('list')
    await openListDialog(page)
  })

  test('shows which passkey row is waiting, and dims the other', async ({
    page,
  }) => {
    // Without presence simulation the prompt stays open
    await addVirtualAuthenticator(page, { automaticPresenceSimulation: false })
    const section = await openListDialog(page)
    await section.getByRole('button', { name: 'Sign in with passkey' }).click()

    const pressed = section.locator('button[aria-busy="true"]')
    await expect(pressed).toHaveText('Waiting for your passkey…')
    await expect(pressed).toHaveCSS('opacity', '1')

    const other = section.getByRole('button', { name: 'Create a passkey' })
    await expect(other).toBeDisabled()
    await expect(other).toHaveCSS('opacity', '0.5')
    // The pressed row carries the message; the status line is for screen
    // readers only
    await expect(
      section.locator('p', { hasText: 'Waiting for your passkey…' }),
    ).toHaveClass(/sr-only/)
  })
})
