import { type ReactNode, useEffect, useRef, useState } from "react"
import ReactDOM from "react-dom"

interface PortalProps {
  children: ReactNode
}


export default function Portal(props: PortalProps) {
  const {
    children
  } = props

  const rootRef = useRef<HTMLElement | null>()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    rootRef.current = document.body
    setMounted(true)
  }, [mounted])

  if (!rootRef.current || !mounted) return null

  return ReactDOM.createPortal(children, rootRef.current)
}