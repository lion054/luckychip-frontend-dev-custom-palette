import React, { useMemo, useRef } from 'react'
import { useLocation } from 'react-router'
import { useWeb3React } from '@web3-react/core'
import { languageList } from 'config/localization/languages'
import { useTranslation } from 'contexts/Localization'
import useTheme from 'hooks/useTheme'
import useAuth from 'hooks/useAuth'
import { usePriceCakeBusd, useDice } from 'state/hooks'
import { getDiceContract } from 'utils/contractHelpers'
import { useModal } from '@heswap/uikit'
import Menu from './components/Menu'
import { links } from './config'
import ConfirmationModal from '../ConfirmationModal'

const AppMenu = (props) => {
  const location = useLocation()
  const { account } = useWeb3React()
  const { login, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const cakePriceUsd = usePriceCakeBusd()
  const { currentLanguage, setLanguage, t } = useTranslation()

  const { claimable } = useDice()

  const [onPresentConfirmation] = useModal(
    <ConfirmationModal
      title="Confirm to claim"
      description="Are you sure to claim?"
      onConfirm={async () => {
        const token = new URLSearchParams(location.search).get('token')
        const diceContract = getDiceContract(token)
        const tx = await diceContract.claimReward()
        const receipt = await tx.wait()
        console.log('claimReward', receipt.transactionHash)
      }}
    />,
  )

  return (
    <Menu
      logoTitle="LuckyChip"
      account={account}
      claimable={claimable}
      claim={onPresentConfirmation}
      login={login}
      logout={logout}
      isDark={isDark}
      toggleTheme={toggleTheme}
      currentLang={currentLanguage.code}
      langs={languageList}
      setLang={setLanguage}
      cakePriceUsd={cakePriceUsd.toNumber()}
      links={links(t)}
      {...props}
    />
  )
}

export default AppMenu
