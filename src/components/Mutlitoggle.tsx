import type { CSSProperties, FormEventHandler, ReactElement, ReactNode } from "react"
import { useState } from "react"
import { cn, createCtx } from "~/util/fns"

interface MultiToggleContextInterface {
  name: string
  value: unknown
}

const [useMultiToggleContext, MultiToggleProvider] = createCtx<MultiToggleContextInterface>()

interface Props<T extends string> {
  name: string
  defaultValue?: T
  value?: T
  onValueChange?: (value: T) => void
  children: ReactElement<ItemProps<T>>[] | ReactElement<ItemProps<T>>
}

const Base = <T extends string>(props: Props<T>) => {
  const {
    name,
    defaultValue,
    value: valueProp,
    onValueChange,
    children
  } = props;

  const [value, setValue] = useState<T | undefined>(valueProp ?? defaultValue)

  const handleChange: FormEventHandler<HTMLFieldSetElement> = (e) => {
    const input = e.target as HTMLInputElement
    const newValue = input.value as T
    // TODO: calling both could be two render
    setValue(newValue)
    if (onValueChange) onValueChange(newValue)
  }

  return (
    <div
      className={cn(
        "rounded overflow-clip h-8 box-content flex",
      )}>
      <fieldset onChange={handleChange} className="flex">
        <MultiToggleProvider value={{ name, value }}>
          {children}
        </MultiToggleProvider>
      </fieldset>
    </div>
  )
}

interface ItemProps<T extends string> {
  value: T
  children?: ReactNode
  style?: CSSProperties

}


export const Item = <T extends string>({ value, children = value, style }: ItemProps<T>) => {
  const { name: toggleName, value: toggleValue } = useMultiToggleContext()

  return (
    <div className="relative flex">
      <input
        className="peer appearance-none absolute"
        type="radio"
        name={toggleName}
        id={value}
        value={value}
        checked={toggleValue === value}
        readOnly={true}
      />
      <label
        className={cn(
          "relative",
          "flex p-2 h-full items-center justify-center cursor-pointer bg-neutral-200/50 hover:bg-neutral-200",
          // "border-b-4 border-neutral-300",
          toggleValue === value && "bg-neutral-300 hover:bg-neutral-300"
          // "text-sm text-front/50 border-front/5 transition-[color] outline-access outline-1 outline-offset-2",
          // "hover:text-front/80",
          // "peer-checked:text-front",
          // "peer-focus-visible:outline"
        )}
        htmlFor={value}
        style={style}
      >
        <span className="z-10">
          {children}
        </span>
      </label>
    </div>
  )
}

const MultiToggle = { Base, Item }

export default MultiToggle