import { cn } from "~/util/fns"

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {

}

export default function Button(props: ButtonProps) {
  const {
    className,
    children,
    ...restProps
  } = props

  return (
    <button {...restProps} className={cn(
      "flex",
      "rounded-full p-4",
      "bg-dark text-light",
      "hover:brightness-150 active:brightness-75",
      "transition-all",
      className,
    )}>
      {children}
    </button>
  )
}