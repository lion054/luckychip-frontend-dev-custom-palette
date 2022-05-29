import { BigNumber } from 'ethers'
import { Token } from 'config/constants/types'

export interface BankRowProps {
  address: string,
  stakingToken: Token
  earningToken: Token
  stakingBalance: BigNumber
  earningBalance: BigNumber
  onDeposit: () => void
  onWithdraw: () => void
}

export interface BankTableProps {
  records: Array<BankRowProps>
}
