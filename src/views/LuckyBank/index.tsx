import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import styled from 'styled-components'
import { BigNumber, ethers } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { Heading, Image, useModal } from '@heswap/uikit'
import { noop } from 'lodash'
import moment from 'moment'
import 'moment-duration-format'
import { useBlock, useDice } from 'state/hooks'
import { getAddress, getLcAddress, getWbnbAddress, getBusdAddress, getBtcbAddress, getEthAddress, getDiceAddress, getDiceTokenAddress, isAddress } from 'utils/addressHelpers'
import { AddressZero } from '@ethersproject/constants'
import Page from 'components/layout/Page'
import PageHeader from 'components/PageHeader'
import { getDiceContract, getLcContract, getWbnbContract, getBusdContract, getBtcbContract, getEthContract } from 'utils/contractHelpers'
import { useWbnbContract } from 'hooks/useContract'
import useCallWithGasPrice from 'hooks/useCallWithGasPrice'
import useTokenBalance from 'hooks/useTokenBalance'
import tokens from 'config/constants/tokens'
import { BankRowProps } from './types'
import BankTable from './BankTable'
import AmountModal from './AmountModal'

const Clock = styled.div`
  padding-top: 32px;
  width: 100%;
  text-align: center;
`

const Label = styled(Heading).attrs({
  as: 'h2',
  scale: 'md',
})`
  color: ${({ theme }) => theme.colors.backgroundAlt};
  font-weight: 300;
  line-height: 1.4;
`

const TimeLabel = styled(Heading).attrs({
  as: 'h1',
  scale: 'xl',
})`
  color: ${({ theme }) => theme.colors.success};
  font-family: monospace;
  font-weight: 600;
  line-height: 1.4;
`

const Title = styled(Heading).attrs({
  as: 'h1',
  scale: 'xl',
})`
  color: ${({ theme }) => theme.colors.backgroundAlt};
  font-weight: 600;
  line-height: 1.4;
`

const Description = styled(Heading).attrs({
  as: 'h2',
  scale: 'md',
  color: 'textSubtle',
})`
  font-weight: 300;
  line-height: 1.4;
`

const HeaderStuff = styled.div`
  height: 136px;
`

function getStakingContract(token) {
  switch (token) {
    case 'LC':
      return getLcContract()
    case 'WBNB':
      return getWbnbContract()
    case 'BUSD':
      return getBusdContract()
    case 'BTCB':
      return getBtcbContract()
    case 'ETH':
      return getEthContract()
    default:
      return null
  }
}

const LuckyBank: React.FC = () => {
  const location = useLocation()
  let referrer = AddressZero
  if (location.pathname.substring(7) && isAddress(location.pathname.substring(7))) {
    referrer = location.pathname.substring(7)
    console.log(`referral link, ref=${referrer}`)
  } else {
    console.log('not referral link')
  }

  const { account } = useWeb3React()
  const { callWithGasPrice } = useCallWithGasPrice()
  const { attending, bankerTimeBlocks, playerTimeBlocks, currentGame, currentEpoch, currentRound, paused } = useDice()
  const [bankerTimeLeft, setBankerTimeLeft] = useState(null)
  const [playerTimeLeft, setPlayerTimeLeft] = useState(null)
  const bankerTimerRef = useRef(null)
  const playerTimerRef = useRef(null)
  const { currentBlock } = useBlock()
  const { balance: lcBalance } = useTokenBalance(getLcAddress())
  const { balance: wbnbBalance } = useTokenBalance(getWbnbAddress())
  const { balance: busdBalance } = useTokenBalance(getBusdAddress())
  const { balance: btcbBalance } = useTokenBalance(getBtcbAddress())
  const { balance: ethBalance } = useTokenBalance(getEthAddress())
  const { balance: lcDiceBalance } = useTokenBalance(getDiceTokenAddress('LC'))
  const { balance: wbnbDiceBalance } = useTokenBalance(getDiceTokenAddress('WBNB'))
  const { balance: busdDiceBalance } = useTokenBalance(getDiceTokenAddress('BUSD'))
  const { balance: btcbDiceBalance } = useTokenBalance(getDiceTokenAddress('BTCB'))
  const { balance: ethDiceBalance } = useTokenBalance(getDiceTokenAddress('ETH'))

  const handleDeposit = async (stakingSymbol, amount) => {
    try {
      // The token holder calls approve to set an allowance of tokens that the contract can use
      // This is from BEP20
      const stakingContract = getStakingContract(stakingSymbol)
      await stakingContract.approve(getDiceAddress(stakingSymbol), ethers.constants.MaxUint256)
      // call betNumber of dice contract
      const diceContract = getDiceContract(stakingSymbol)
      const tx = await callWithGasPrice(diceContract, 'deposit', [ethers.utils.parseEther(amount)], {
        value: ethers.utils.parseEther('0.001'),
      })
      const receipt = await tx.wait()
      console.log(`deposit,${receipt.transactionHash}`)
    } catch (e) {
      console.log(`deposit failed`, e)
    }
  }

  const handleWithdraw = async (stakingSymbol, amount) => {
    try {
      // The token holder calls approve to set an allowance of tokens that the contract can use
      // This is from BEP20
      const stakingContract = getStakingContract(stakingSymbol)
      await stakingContract.approve(getDiceAddress(stakingSymbol), ethers.constants.MaxUint256)
      // call betNumber of dice contract
      const diceContract = getDiceContract(stakingSymbol)
      const tx = await callWithGasPrice(diceContract, 'withdraw', [ethers.utils.parseEther(amount)], {
        value: ethers.utils.parseEther('0.001'),
      })
      const receipt = await tx.wait()
      console.log(`deposit,${receipt.transactionHash}`)
    } catch (e) {
      console.log(`deposit failed`, e)
    }
  }

  const [onPresentDepositFromLC] = useModal(
    <AmountModal
      title="Deposit from LC"
      max={lcBalance}
      onConfirm={(amount) => {
        handleDeposit('LC', amount)
      }}
      tokenSymbol="LC"
    />,
  )

  const [onPresentWithdrawToLC] = useModal(
    <AmountModal
      title="Withdraw to LC"
      max={lcDiceBalance}
      onConfirm={(amount) => {
        handleWithdraw('LC', amount)
      }}
      tokenSymbol="CAKE"
    />,
  )

  const [onPresentDepositFromWBNB] = useModal(
    <AmountModal
      title="Deposit from WBNB"
      max={wbnbBalance}
      onConfirm={(amount) => {
        handleDeposit('WBNB', amount)
      }}
      tokenSymbol="WBNB"
    />,
  )

  const [onPresentWithdrawToWBNB] = useModal(
    <AmountModal
      title="Withdraw to WBNB"
      max={wbnbDiceBalance}
      onConfirm={(amount) => {
        handleWithdraw('WBNB', amount)
      }}
      tokenSymbol="CAKE"
    />,
  )

  const [onPresentDepositFromBUSD] = useModal(
    <AmountModal
      title="Deposit from BUSD"
      max={busdBalance}
      onConfirm={(amount) => {
        handleDeposit('BUSD', amount)
      }}
      tokenSymbol="BUSD"
    />,
  )

  const [onPresentWithdrawToBUSD] = useModal(
    <AmountModal
      title="Withdraw to BUSD"
      max={busdDiceBalance}
      onConfirm={(amount) => {
        handleWithdraw('BUSD', amount)
      }}
      tokenSymbol="CAKE"
    />,
  )

  const [onPresentDepositFromBTCB] = useModal(
    <AmountModal
      title="Deposit from BTCB"
      max={btcbBalance}
      onConfirm={(amount) => {
        handleDeposit('BTCB', amount)
      }}
      tokenSymbol="BTCB"
    />,
  )

  const [onPresentWithdrawToBTCB] = useModal(
    <AmountModal
      title="Withdraw to BTCB"
      max={btcbDiceBalance}
      onConfirm={(amount) => {
        handleWithdraw('BTCB', amount)
      }}
      tokenSymbol="CAKE"
    />,
  )

  const [onPresentDepositFromETH] = useModal(
    <AmountModal
      title="Deposit from ETH"
      max={ethBalance}
      onConfirm={(amount) => {
        handleDeposit('ETH', amount)
      }}
      tokenSymbol="ETH"
    />,
  )

  const [onPresentWithdrawToETH] = useModal(
    <AmountModal
      title="Withdraw to ETH"
      max={ethDiceBalance}
      onConfirm={(amount) => {
        handleWithdraw('ETH', amount)
      }}
      tokenSymbol="CAKE"
    />,
  )

  const config: Array<BankRowProps> = [{
    address: getAddress(tokens['lc-dice'].address),
    stakingToken: tokens.lc,
    earningToken: tokens.cake,
    stakingBalance: BigNumber.from(0),
    earningBalance: BigNumber.from(0),
    onDeposit: onPresentDepositFromLC,
    onWithdraw: onPresentWithdrawToLC
  },{
    address: getAddress(tokens['wbnb-dice'].address),
    stakingToken: tokens.wbnb,
    earningToken: tokens.cake,
    stakingBalance: BigNumber.from(0),
    earningBalance: BigNumber.from(0),
    onDeposit: onPresentDepositFromWBNB,
    onWithdraw: onPresentWithdrawToWBNB
  },{
    address: getAddress(tokens['busd-dice'].address),
    stakingToken: tokens.busd,
    earningToken: tokens.cake,
    stakingBalance: BigNumber.from(0),
    earningBalance: BigNumber.from(0),
    onDeposit: onPresentDepositFromBUSD,
    onWithdraw: onPresentWithdrawToBUSD
  },{
    address: getAddress(tokens['btcb-dice'].address),
    stakingToken: tokens.btcb,
    earningToken: tokens.cake,
    stakingBalance: BigNumber.from(0),
    earningBalance: BigNumber.from(0),
    onDeposit: onPresentDepositFromBTCB,
    onWithdraw: onPresentWithdrawToBTCB
  },{
    address: getAddress(tokens['eth-dice'].address),
    stakingToken: tokens.eth,
    earningToken: tokens.cake,
    stakingBalance: BigNumber.from(0),
    earningBalance: BigNumber.from(0),
    onDeposit: onPresentDepositFromETH,
    onWithdraw: onPresentWithdrawToETH
  }]
  const [records, setRecords] = useState(config)

  useEffect(() => {
    async function fetchWBNB() {
      records[0].stakingBalance = BigNumber.from(lcBalance.toString())
      records[1].stakingBalance = BigNumber.from(wbnbBalance.toString())
      records[2].stakingBalance = BigNumber.from(busdBalance.toString())
      records[3].stakingBalance = BigNumber.from(btcbBalance.toString())
      records[4].stakingBalance = BigNumber.from(ethBalance.toString())
      setRecords(records)
    }
    fetchWBNB()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  useEffect(() => {
    if (bankerTimerRef) {
      clearInterval(bankerTimerRef.current)
    }
    if (currentBlock === 0 || !currentGame || !paused) {
      return () => { noop() }
    }
    let timeLeft = BigNumber.from(currentGame.bankerEndBlock).sub(BigNumber.from(currentBlock)).mul(3).toNumber() // each block is nearly 3 seconds in bsc
    bankerTimerRef.current = setInterval(() => {
      setBankerTimeLeft(timeLeft)
      timeLeft--
    }, 1000)
    return () => {
      if (bankerTimerRef) {
        clearInterval(bankerTimerRef.current)
      }
    }
  }, [currentBlock, currentGame, paused])

  useEffect(() => {
    if (playerTimerRef) {
      clearInterval(playerTimerRef.current)
    }
    if (currentBlock === 0 || !currentGame || paused) {
      return () => { noop() }
    }
    let timeLeft = BigNumber.from(currentGame.playerEndBlock).sub(BigNumber.from(currentBlock)).mul(3).toNumber() // each block is nearly 3 seconds in bsc
    playerTimerRef.current = setInterval(() => {
      setPlayerTimeLeft(timeLeft)
      timeLeft--
    }, 1000)
    return () => {
      if (playerTimerRef) {
        clearInterval(playerTimerRef.current)
      }
    }
  }, [currentBlock, currentGame, paused])

  const bankerTimeLabel = useMemo(() => {
    if (!bankerTimeLeft) {
      return ''
    }
    const optionalPrefix = moment.duration(bankerTimeLeft, 'seconds').format('y [years] w [weeks] d [days] h')
    const requiredSurfix = moment.duration(bankerTimeLeft, 'seconds').format('mm:ss', { trim: false })
    if (optionalPrefix === '0') {
      return requiredSurfix
    }
    return `${optionalPrefix}:${requiredSurfix}`
  }, [bankerTimeLeft])

  const playerTimeLabel = useMemo(() => {
    if (!playerTimeLeft) {
      return ''
    }
    const optionalPrefix = moment.duration(playerTimeLeft, 'seconds').format('y [years] w [weeks] d [days] h')
    const requiredSurfix = moment.duration(playerTimeLeft, 'seconds').format('mm:ss', { trim: false })
    if (optionalPrefix === '0') {
      return requiredSurfix
    }
    return `${optionalPrefix}:${requiredSurfix}`
  }, [playerTimeLeft])

  return (
    <>
      <PageHeader>
        {/* <Flex justifyContent="space-between" flexDirection={['column', null, null, 'row']} position="relative">
          <Flex flex="1" flexDirection="column" mr={['8px', 0]}>
            <Title mb="24px">{t('Lucky Bank')}</Title>
            <Description>{t('Just stake some tokens to earn.')}</Description>
            <Description>{t('High APR, low risk.')}</Description>
          </Flex>
          <Box position="absolute" top={32} right={32}>
            <HelpButton />
          </Box>
        </Flex> */}
        <HeaderStuff />
      </PageHeader>
      {/* {paused && (
        <Clock>
          <Label>Now Banker Time</Label>
          <TimeLabel>{bankerTimeLabel}</TimeLabel>
        </Clock>
      )}
      {!paused && (
        <Clock>
          <Label>Now Player Time</Label>
          <TimeLabel>{playerTimeLabel}</TimeLabel>
        </Clock>
      )}
      {paused && ( */}
        <Page>
          <BankTable records={records} />
          <Image
            mx="auto"
            mt="12px"
            src={`${process.env.PUBLIC_URL}/images/3d-syrup-bunnies.png`}
            alt="Pancake illustration"
            width={192}
            height={184.5}
          />
        </Page>
      {/* )} */}
    </>
  )
}

export default LuckyBank
