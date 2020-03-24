import { loop } from './utils/loop'
import { easingFunctions, EasingFunction } from './utils/easing-functions'

interface Params {
  from: number
  to: number
  duration: number
  iterationCount?: number
  timingFunction?: EasingFunction
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  transition: (Object: { progress: number; value: number }) => void
  done?: () => void
}

export function animate (params: Params) {
  const {
    from,
    to,
    duration,
    timingFunction = easingFunctions.linear,
    iterationCount = 1,
    direction = 'normal',
    transition,
    done
  } = params

  let stopNow = false
  let paused = false

  return Object.freeze({
    stop () {
      stopNow = true
    },
    continue () {
      paused = false
    },
    pause () {
      paused = true
    },
    start () {
      const range = to - from
      let currentDirection: 1 | -1 = direction.includes('reverse') ? -1 : 1
      let iteration = 0

      stopNow = false

      loop(timeFraction => {
        if (stopNow) return 'stop'
        if (paused) return 'pause'

        const timeProgress = timeFraction / duration
        const progress = Math.min((range * timeProgress) / range, 1)
        const valueProgress = from + (to - from) * timingFunction(progress)
        const value =
          currentDirection < 0 ? from + (to - valueProgress) : valueProgress

        transition({ progress, value })

        if (progress >= 1) {
          iteration++

          if (direction.includes('alternate')) {
            currentDirection *= -1
          }

          if (iteration < iterationCount) {
            return 'restart'
          }

          if (done) done()
          return 'stop'
        }

        return 'continue'
      })
    }
  })
}
