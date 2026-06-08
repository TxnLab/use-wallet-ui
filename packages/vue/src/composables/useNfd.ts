import { useQuery } from '@tanstack/vue-query'
import { useWallet, useNetwork } from '@txnlab/use-wallet-vue'
import { computed } from 'vue'

export type NfdRecord = {
  name: string
  properties: {
    verified: {
      [key: string]: string
    }
    userDefined: {
      [key: string]: string
    }
  }
  image?: string
  avatar?: {
    url?: string
  }
}

export type NfdLookupResponse = {
  [address: string]: NfdRecord | null
}

export type NfdView = 'tiny' | 'thumbnail' | 'brief' | 'full'

/**
 * Composable to fetch NFD data for the active Algorand address.
 *
 * @param options.enabled Whether to enable the NFD lookup (defaults to true)
 * @param options.view The view type for the NFD lookup (defaults to 'thumbnail')
 */
export function useNfd(
  options: { enabled?: boolean; view?: NfdView } = {},
): ReturnType<typeof useQuery<NfdRecord | null>> {
  const { activeAddress } = useWallet()
  const { activeNetwork } = useNetwork()
  const { enabled = true, view = 'thumbnail' } = options

  const isEnabled = computed(() => enabled && !!activeAddress.value)

  return useQuery({
    queryKey: computed(() => [
      'nfd',
      activeAddress.value,
      activeNetwork.value,
      view,
    ]),
    queryFn: async ({ signal }) => {
      if (!activeAddress.value) return null

      const isTestnet = activeNetwork.value === 'testnet'
      const apiEndpoint = isTestnet
        ? 'https://api.testnet.nf.domains'
        : 'https://api.nf.domains'

      const response = await fetch(
        `${apiEndpoint}/nfd/lookup?address=${encodeURIComponent(activeAddress.value)}&view=${view}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal,
        },
      )

      if (response.status === 404) return null

      if (!response.ok) {
        throw new Error(`NFD lookup failed: ${response.statusText}`)
      }

      const data: NfdLookupResponse = await response.json()
      return data[activeAddress.value] ?? null
    },
    enabled: isEnabled,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('404')) return false
      return failureCount < 3
    },
    refetchOnWindowFocus: true,
  })
}
