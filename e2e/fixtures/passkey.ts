import { test as base, type CDPSession, type Page } from '@playwright/test'

type AuthenticatorOptions = {
  hasPrf?: boolean
  isUserVerified?: boolean
}

export interface VirtualAuthenticator {
  client: CDPSession
  authenticatorId: string
}

/**
 * Adds a Chromium virtual authenticator with the PRF extension, so passkey
 * prompts resolve without UI. Passkeys work on localhost in Chrome.
 */
export async function addVirtualAuthenticator(
  page: Page,
  { hasPrf = true, isUserVerified = true }: AuthenticatorOptions = {},
): Promise<VirtualAuthenticator> {
  const client = await page.context().newCDPSession(page)
  await client.send('WebAuthn.enable')
  const { authenticatorId } = await client.send(
    'WebAuthn.addVirtualAuthenticator',
    {
      options: {
        protocol: 'ctap2',
        ctap2Version: 'ctap2_1',
        transport: 'internal',
        hasResidentKey: true,
        hasUserVerification: true,
        isUserVerified,
        hasPrf,
        automaticPresenceSimulation: true,
      },
    },
  )
  return { client, authenticatorId }
}

export const test = base.extend<{ pageErrors: Error[] }>({
  // Collect uncaught page errors so each test can assert there were none.
  // `auto` attaches the listener before the test body runs.
  pageErrors: [
    async ({ page }, use) => {
      const errors: Error[] = []
      page.on('pageerror', (error) => errors.push(error))
      await use(errors)
    },
    { auto: true },
  ],

  page: async ({ page }, use) => {
    // Keep NFD lookups off the network: passkey accounts are new and have none
    await page.route(/api(\.testnet)?\.nf\.domains/, (route) =>
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: '{}',
      }),
    )
    await use(page)
  },
})

export { expect } from '@playwright/test'
