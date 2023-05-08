import type { ReactElement } from "react"
import { cn } from "~/util/fns"

interface Props {
  name: string
  label?: string
  defaultValue?: string
  value?: string
  onValueChange?: (newValue: string) => void
  children: ReactElement<OptionProps>[] | ReactElement<OptionProps>
}


const Base = (props: Props) => {
  const {
    name,
    label,
    defaultValue,
    value: valueProp,
    onValueChange,
    children
  } = props

  // TODO: use for refs
  // const [value, setValue] = useState<string | undefined>(valueProp ?? defaultValue)

  return (
    <div className={cn(
      "group relative",
      // "p-[2px] flex gap-1 items-center",
      // "text-front/90 bg-back-alt/75 border-[0.5px] border-front/10 rounded-md outline-access outline-1",
    )}>
      <select
        name={name}
        id={`${name}-select`}
        value={valueProp}
        onInput={(e) => {
          const newValue = e.currentTarget.value
          if (onValueChange) onValueChange(newValue)
          // setValue(newValue)
        }}
        className={cn(
          "peer transition-all duration-150",
          "appearance-none outline-none",
          "bg-light px-4 py-2 rounded-xl text-dark text-3xl font-semibold",
        )}
      >
        {children}
      </select>
      <span className="absolute right-3 pointer-events-none peer-hover:text-front/90">
        {/* <HiChevronDown /> */}
      </span>
    </div>
  )
}

interface OptionProps {
  value: string
  children?: string
}

const Option = (props: OptionProps) => {
  const {
    value,
    children
  } = props;

  return (
    <option value={value}>
      {children || value}
    </option>
  )
}

const Select = { Base, Option }

export default Select