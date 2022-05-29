import { useEffect, useState } from 'react'
import { getDiceContract } from 'utils/contractHelpers'
import useRefresh from 'hooks/useRefresh'

const usePaused = (stakingSymbol: string) => {
  const { slowRefresh } = useRefresh()
  const [paused, setPaused] = useState(true)

  useEffect(() => {
    async function fetchPaused() {
      if (mounted) {
        const diceContract = getDiceContract(stakingSymbol)
        const p = await diceContract.paused()
        console.log('paused', p)
        setPaused(p)
      }
    }

    let mounted = true // don't call the state variable
    fetchPaused()
    return function cleanup() {
      mounted = false // don't update the state variable on an unmount component
    }
  }, [stakingSymbol, slowRefresh])

  return paused
}

export default usePaused
