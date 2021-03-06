import { createSelector } from 'reselect'

export const selectTransactions = state => state.get('transactions')

export const selectTxPanelListing = createSelector(selectTransactions, txState =>
  txState.get('txPanelListing')
)
export const selectTxPanelMethod = createSelector(selectTransactions, txState =>
  txState.get('txPanelMethod')
)
