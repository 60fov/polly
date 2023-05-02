import { useEffect, useRef, useState } from "react"

interface useTimeoutOptions {
  autoStart?: boolean
}

export default function useTimeout(fn: () => void, time: number, options?: useTimeoutOptions) {
  const {
    autoStart = false,
  } = options || {}

  const refHandle = useRef(0)

  function start() {
    refHandle.current = setTimeout(() => {
      fn()
    }, time) as unknown as number
  }

  function clear() {
    if (refHandle.current) clearTimeout(refHandle.current)
  }

  useEffect(() => {
    if (autoStart) {
      start()
    }
    () => {
      if (refHandle.current) clearTimeout(refHandle.current)
    }
  })

  return { start, clear }
}