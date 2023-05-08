import { ReactNode, useRef, useState } from "react"
import { createCtx } from "~/util/fns"
import Portal from "./Portal"
import Button, { ButtonProps } from "./Button"
import { useOnClickOutside } from "~/util/hooks/useOnClickOutside"

interface ModalContextInterface {
  open: boolean
  setOpen: (open: boolean) => void
}

const [useModalContext, ModalContextProvider] = createCtx<ModalContextInterface>()

interface ModalProps {
  open?: boolean
  children: ReactNode
}

function Modal(props: ModalProps) {
  const {
    open: openProp,
    children
  } = props

  const [open, setOpen] = useState(false)

  return (
    <ModalContextProvider value={{ open: openProp ?? open, setOpen }}>
      <div className="relative flex">
        {children}
      </div>
    </ModalContextProvider>
  )
}

function ModalButton(props: ButtonProps) {
  const {
    ...restProps
  } = props

  const { open, setOpen } = useModalContext()

  return (
    <Button
      {...restProps}
      onClick={() => {
        console.log('modal click')
        setOpen(!open)
      }}
    />
  )
}

interface ModalPortalProps {
  children: ReactNode
}

function ModalPortal(props: ModalPortalProps) {
  const {
    children
  } = props

  const { open, setOpen } = useModalContext()

  const refMenuElement = useRef<HTMLDivElement>(null)

  useOnClickOutside(refMenuElement, () => setOpen(false))

  return (
    <Portal>{
      open ?
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div ref={refMenuElement} className={"relative max-w-xl rounded-3xl p-6 bg-dark/75 backdrop-blur-sm"}>
            {children}
          </div>
        </div>
        :
        null
    }</Portal>
  )

}

Modal.Button = ModalButton
Modal.Portal = ModalPortal

export default Modal