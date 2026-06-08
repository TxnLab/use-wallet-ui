<script setup lang="ts">
import { ref, watch } from 'vue'
import { type QueryClient } from '@tanstack/vue-query'
import { useWallet, useNetwork } from '@txnlab/use-wallet-vue'

import type { NfdLookupResponse, NfdView } from '../composables/useNfd'

const props = defineProps<{
  enabled: boolean
  nfdView: NfdView
  queryClient: QueryClient
}>()

const { activeAddress, activeWallet, algodClient } = useWallet()
const { activeNetwork } = useNetwork()

const prevActiveAddress = ref<string | null>(null)

watch(
  [activeAddress, activeWallet, algodClient, activeNetwork],
  async () => {
    if (!props.enabled) {
      prevActiveAddress.value = activeAddress.value
      return
    }

    const shouldPrefetch =
      prevActiveAddress.value === null &&
      activeAddress.value !== null &&
      activeWallet.value !== null &&
      !!activeWallet.value.accounts &&
      activeWallet.value.accounts.length > 0 &&
      !!algodClient.value

    prevActiveAddress.value = activeAddress.value

    if (!shouldPrefetch) return

    console.log(
      `[WalletUI] Prefetching data for all accounts in wallet ${activeWallet.value!.id}`,
    )

    const addresses = activeWallet.value!.accounts.map((a) => a.address)

    if (addresses.length > 0) {
      const batchSize = 20
      const addressBatches: string[][] = []
      for (let i = 0; i < addresses.length; i += batchSize) {
        addressBatches.push(addresses.slice(i, i + batchSize))
      }

      for (const batch of addressBatches) {
        const isTestnet = activeNetwork.value === 'testnet'
        const apiEndpoint = isTestnet
          ? 'https://api.testnet.nf.domains'
          : 'https://api.nf.domains'

        const queryParams = new URLSearchParams()
        batch.forEach((address) => {
          queryParams.append('address', address)
        })
        queryParams.append('view', props.nfdView)

        try {
          const response = await fetch(
            `${apiEndpoint}/nfd/lookup?${queryParams.toString()}`,
            {
              method: 'GET',
              headers: { Accept: 'application/json' },
            },
          )

          if (!response.ok && response.status !== 404) {
            throw new Error(
              `NFD prefetch lookup failed: ${response.statusText}`,
            )
          }

          const responseData: NfdLookupResponse =
            response.status === 404 ? {} : await response.json()

          batch.forEach((address) => {
            const nfdData = responseData[address] || null
            props.queryClient.setQueryData(
              ['nfd', address, activeNetwork.value, props.nfdView],
              nfdData,
            )
          })
        } catch (error) {
          console.error('Error prefetching NFD data:', error)
        }
      }
    }

    addresses.forEach((address) => {
      props.queryClient.prefetchQuery({
        queryKey: ['account-balance', address],
        queryFn: async () => {
          try {
            const accountInfo = await algodClient
              .value!.accountInformation(address)
              .do()
            return Number(accountInfo.amount)
          } catch (error) {
            throw new Error(`Error fetching account balance: ${error}`)
          }
        },
      })
    })
  },
  { immediate: true },
)
</script>

<template></template>
