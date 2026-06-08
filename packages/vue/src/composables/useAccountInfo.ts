import { useQuery } from '@tanstack/vue-query'
import { useWallet } from '@txnlab/use-wallet-vue'
import { computed } from 'vue'

import type algosdk from 'algosdk'

/**
 * Composable to fetch account information for the active Algorand address.
 *
 * @param options.enabled Whether to enable the account lookup (defaults to true)
 */
export function useAccountInfo(
  options: { enabled?: boolean } = {},
): ReturnType<typeof useQuery<algosdk.modelsv2.Account | null>> {
  const { activeAddress, algodClient } = useWallet()
  const { enabled = true } = options

  const isEnabled = computed(
    () => enabled && !!activeAddress.value && !!algodClient.value,
  )

  return useQuery({
    queryKey: computed(() => ['account-info', activeAddress.value]),
    queryFn: async () => {
      if (!activeAddress.value || !algodClient.value) return null

      try {
        const accountInfo = await algodClient.value
          .accountInformation(activeAddress.value)
          .do()
        return accountInfo
      } catch (error) {
        throw new Error(`Error fetching account information: ${error}`)
      }
    },
    enabled: isEnabled,
    refetchOnWindowFocus: true,
  })
}
