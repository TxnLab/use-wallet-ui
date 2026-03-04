import { useWallet } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'
import { useState } from 'react'

export function SendTab() {
  const { activeAddress, algodClient, transactionSigner } = useWallet()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'sending' | 'success' | 'error'
  >('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const isValidAddress = recipient.length === 58
  const isValidAmount =
    amount !== '' && !isNaN(Number(amount)) && Number(amount) > 0

  const handleSend = async () => {
    if (!activeAddress || !algodClient || !transactionSigner) return
    if (!isValidAddress || !isValidAmount) return

    setStatus('sending')
    setErrorMsg('')

    try {
      const suggestedParams = await algodClient.getTransactionParams().do()
      const microAlgos = BigInt(Math.floor(Number(amount) * 1_000_000))

      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: activeAddress,
        receiver: recipient,
        amount: microAlgos,
        suggestedParams,
      })

      const signedTxns = await transactionSigner([txn], [0])
      await algodClient.sendRawTransaction(signedTxns[0]).do()

      setStatus('success')
      setRecipient('')
      setAmount('')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Transaction failed')
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-xs font-medium text-[var(--wui-color-text-secondary)] mb-1">
          Recipient Address
        </label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Enter Algorand address..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--wui-color-border)] bg-[var(--wui-color-bg-secondary)] text-[var(--wui-color-text)] placeholder:text-[var(--wui-color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--wui-color-primary)] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--wui-color-text-secondary)] mb-1">
          Amount (ALGO)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.001"
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--wui-color-border)] bg-[var(--wui-color-bg-secondary)] text-[var(--wui-color-text)] placeholder:text-[var(--wui-color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--wui-color-primary)] focus:border-transparent"
        />
      </div>

      {status === 'error' && (
        <p className="text-xs text-[var(--wui-color-danger-text)] bg-[var(--wui-color-danger-bg)] rounded-lg px-3 py-2">
          {errorMsg}
        </p>
      )}

      {status === 'success' && (
        <p className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
          Transaction sent successfully!
        </p>
      )}

      <button
        onClick={handleSend}
        disabled={!isValidAddress || !isValidAmount || status === 'sending'}
        className="w-full py-2 px-4 text-sm font-medium rounded-xl bg-[var(--wui-color-primary)] text-[var(--wui-color-primary-text)] hover:bg-[var(--wui-color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? 'Sending...' : 'Send'}
      </button>
    </div>
  )
}
