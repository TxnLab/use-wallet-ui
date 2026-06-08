import { inject, type ComputedRef, type InjectionKey } from 'vue'

import type { Theme, ResolvedTheme } from '../composables/useResolvedTheme'
import type { QueryClient } from '@tanstack/vue-query'

export interface WalletUIContextType {
  queryClient: QueryClient
  theme: ComputedRef<Theme>
  resolvedTheme: ComputedRef<ResolvedTheme>
}

export const WALLET_UI_CONTEXT_KEY: InjectionKey<WalletUIContextType> =
  Symbol('wallet-ui')

export function useWalletUI(): WalletUIContextType {
  const context = inject(WALLET_UI_CONTEXT_KEY)
  if (!context) {
    throw new Error('useWalletUI must be used within a WalletUIProvider')
  }
  return context
}
