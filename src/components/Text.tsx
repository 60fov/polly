import { ReactNode } from "react";
import { cn } from "~/util/fns";
import { ThemeColor } from "~/util/theme";

const textSizeList = ['sm', 'md', 'lg'] as const
type TextSize = typeof textSizeList[number]

type Tag = React.ElementType

type TextOwnProps<T extends Tag = Tag> = {
  as?: T
  size?: TextSize
  className?: string
}

type TextProps<T extends Tag> =
  TextOwnProps &
  Omit<React.ComponentProps<T>, keyof TextOwnProps>

export default function Text<T extends Tag>(props: TextProps<T>) {
  const {
    as: Tag = 'p',
    size = 'md',
    className,
    children,
    ...restProps
  } = props

  return (
    <Tag
      className={cn(
        size === 'sm' && "text-xl font-light tracking-tight",
        size === 'md' && "text-3xl font-semibold tracking-tight",
        size === 'lg' && "text-5xl font-extrabold tracking-normal",
        className
      )}
      {...restProps}>{children}</Tag>
  )
}