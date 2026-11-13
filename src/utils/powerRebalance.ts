import { TOTAL_POWER_BUDGET } from '../config/balance'

export interface PowerSplit {
  air: number
  shield: number
  rover: number
}

export function getDefaultPowerSplit(budget: number = TOTAL_POWER_BUDGET): PowerSplit {
  if (budget === 90) {
    return { air: 30, shield: 30, rover: 30 }
  }
  const each = Math.floor(budget / 3)
  const remainder = budget - each * 3
  return {
    air: each + remainder,
    shield: each,
    rover: each,
  }
}

/**
 * Rebalances power split when one slider is modified.
 * - If increasing: consumes unallocated power first, then deducts from other sliders proportionally.
 * - If decreasing: reduces the slider, leaving unallocated power ("Power left").
 * Total sum is always clamped to <= budget.
 */
export function rebalancePowerSplit(
  current: PowerSplit,
  targetKey: keyof PowerSplit,
  desiredValue: number,
  budget: number = TOTAL_POWER_BUDGET
): PowerSplit {
  const clampedDesired = Math.max(0, Math.min(budget, Math.round(desiredValue)))
  const currentVal = current[targetKey]
  const delta = clampedDesired - currentVal

  if (delta === 0) return { ...current }

  const otherKeys = (['air', 'shield', 'rover'] as (keyof PowerSplit)[]).filter(
    (k) => k !== targetKey
  )

  const currentTotal = current.air + current.shield + current.rover
  const unassigned = Math.max(0, budget - currentTotal)

  if (delta < 0) {
    // Decreasing is always allowed; frees up unassigned power
    return {
      ...current,
      [targetKey]: clampedDesired,
    }
  }

  // Increasing: take from unassigned first
  const fromUnassigned = Math.min(delta, unassigned)
  let neededFromOthers = delta - fromUnassigned

  const otherSum = current[otherKeys[0]] + current[otherKeys[1]]
  let newOther1 = current[otherKeys[0]]
  let newOther2 = current[otherKeys[1]]

  if (neededFromOthers > 0 && otherSum > 0) {
    // Take proportionally from the other two
    let reduce1 = Math.round((neededFromOthers * current[otherKeys[0]]) / otherSum)
    let reduce2 = neededFromOthers - reduce1

    // If one cannot cover its share, roll over to the other
    if (reduce1 > newOther1) {
      reduce2 += reduce1 - newOther1
      reduce1 = newOther1
    }
    if (reduce2 > newOther2) {
      reduce1 += reduce2 - newOther2
      reduce2 = newOther2
    }

    reduce1 = Math.min(reduce1, newOther1)
    reduce2 = Math.min(reduce2, newOther2)

    newOther1 -= reduce1
    newOther2 -= reduce2
    neededFromOthers -= reduce1 + reduce2
  }

  const actualGain = fromUnassigned + (current[otherKeys[0]] - newOther1) + (current[otherKeys[1]] - newOther2)
  const newTargetVal = currentVal + actualGain

  const result: PowerSplit = {
    air: current.air,
    shield: current.shield,
    rover: current.rover,
  }
  result[targetKey] = newTargetVal
  result[otherKeys[0]] = newOther1
  result[otherKeys[1]] = newOther2

  return result
}
