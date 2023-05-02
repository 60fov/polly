import { useEffect } from "react"

type Handler = (event: MouseEvent) => void

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T> | React.RefObject<T>[],
  handler: Handler,
  mouseEvent: 'mousedown' | 'mouseup' = 'mousedown',
): void {

  useEffect(() => {
    function eventHandler(event: MouseEvent) {
      if (Array.isArray(ref)) {
        for (const r of ref) {
          const el = r?.current
          if (!el || el.contains(event.target as Node)) return
        }
      } else {
        const el = ref?.current
        if (!el || el.contains(event.target as Node)) return
      }
      handler(event)
    }

    window.addEventListener(mouseEvent, eventHandler)
    return () => {
      window.removeEventListener(mouseEvent, eventHandler)
    }
  }, [mouseEvent, handler, ref])
}