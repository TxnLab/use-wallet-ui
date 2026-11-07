import { addVirtualAuthenticator, expect, test } from '../../fixtures/passkey'

import type { Page } from '@playwright/test'

// Runs against examples/react-passkey (passkey-react project) and
// examples/vue-passkey (passkey-vue project). Both register
// passkey({ session: true }), lute(), pera() and passkeyPlugin({ session: true }).

async function openConnectDialog(page: Page) {
  await page.getByRole('button', { name: 'Connect Wallet' }).click()
  const row = page.locator('[data-wallet-id="passkey"]')
  await expect(row).toBeVisible()
  return row
}

async function openConnectedMenu(page: Page) {
  await page.locator('[data-wallet-button]').click()
  await expect(page.getByRole('button', { name: 'Disconnect' })).toBeVisible()
}

/** Creates a passkey account and returns the connected button's label */
async function createPasskeyAccount(page: Page): Promise<string> {
  const row = await openConnectDialog(page)
  await row.getByRole('button', { name: 'Create passkey' }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  const button = page.locator('[data-wallet-button]')
  await expect(button).not.toHaveText(/Connect Wallet/)
  return (await button.innerText()).trim()
}

test.describe('Passkey wallet', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-wallet-theme]')
  })

  test.afterEach(async ({ pageErrors }) => {
    expect(pageErrors).toEqual([])
  })

  test('shows Create passkey and Sign in for the passkey wallet only', async ({
    page,
  }) => {
    const row = await openConnectDialog(page)
    await expect(
      row.getByRole('button', { name: 'Create passkey' }),
    ).toBeVisible()
    await expect(
      row.getByRole('button', { name: 'Sign in with passkey' }),
    ).toBeVisible()

    // Other wallets stay single-button rows
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('button', { name: /Lute/ })).toBeVisible()
    await expect(dialog.getByRole('button', { name: /Pera/ })).toBeVisible()
    await expect(
      dialog.getByRole('button', { name: 'Create passkey' }),
    ).toHaveCount(1)
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

    const row = await openConnectDialog(page)
    await row.getByRole('button', { name: 'Sign in with passkey' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page.locator('[data-wallet-button]')).toHaveText(label)
  })

  test("shows a note on whose account it is, naming the account's domain", async ({
    page,
  }) => {
    await addVirtualAuthenticator(page)
    await createPasskeyAccount(page)
    await openConnectedMenu(page)

    await expect(page.locator('[data-passkey-disclosure]')).toHaveText(
      'This account is created by and for localhost. Keep only what you need here, and move larger amounts to a wallet you control.',
    )
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

    await page.getByRole('button', { name: 'Export Recovery Phrase' }).click()
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

    await page.getByRole('button', { name: 'Export Recovery Phrase' }).click()
    const dialog = page.locator('[data-passkey-recovery-dialog]')
    await dialog.getByRole('button', { name: 'Reveal Recovery Phrase' }).click()
    await expect(dialog.locator('[data-passkey-phrase] li')).toHaveCount(25)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()

    await openConnectedMenu(page)
    await page.getByRole('button', { name: 'Export Recovery Phrase' }).click()
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
    const row = await openConnectDialog(page)
    await row.getByRole('button', { name: 'Sign in with passkey' }).click()

    await expect(row.getByRole('alert')).toHaveText(
      "The passkey request was cancelled or timed out, or no passkey was found. New here? Choose 'Create passkey'.",
    )
    await expect(page.getByRole('dialog')).toBeVisible()

    // The user can go straight to creating one
    await row.getByRole('button', { name: 'Create passkey' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page.locator('[data-wallet-button]')).not.toHaveText(
      /Connect Wallet/,
    )
  })

  test('explains a cancelled passkey prompt', async ({ page }) => {
    // Without user verification the browser rejects the prompt, as it does
    // when the user cancels it
    await addVirtualAuthenticator(page, { isUserVerified: false })
    const row = await openConnectDialog(page)
    await row.getByRole('button', { name: 'Create passkey' }).click()

    await expect(row.getByRole('alert')).toHaveText(
      'The passkey request was cancelled or timed out, or no passkey was found.',
    )
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('suggests another provider when the passkey has no PRF support', async ({
    page,
  }) => {
    await addVirtualAuthenticator(page, { hasPrf: false })
    const row = await openConnectDialog(page)
    await row.getByRole('button', { name: 'Create passkey' }).click()

    await expect(row.getByRole('alert')).toContainText(
      "Your passkey provider doesn't support passkey accounts. Try a different provider",
    )
  })

  test('still connects other wallets from a single-button row', async ({
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

    await page.getByRole('button', { name: 'Export Recovery Phrase' }).click()
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
    const row = await openConnectDialog(page)
    await row.getByRole('button', { name: 'Sign in with passkey' }).click()
    await expect(row.getByRole('alert')).toBeVisible()

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

    await page.getByRole('button', { name: 'Export Recovery Phrase' }).click()
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
})
