import { cn } from "~/util/fns";
import { useTheme } from "~/util/hooks/useTheme";

export default function Test() {
  const [theme, setTheme] = useTheme()

  return (
    <main className={cn(
      "h-screen flex flex-col items-center p-4"
    )}>
      <div className={cn(
        'flex flex-col gap-4',
        'max-w-3xl'
      )}>
        <ChatMessage
          text="정말 멋지네요. 당신은 얼마나 자주 그 가게에 갑니까?"
          translation="That's really cool. How often do you go to that store?"
        />
        <ChatMessage
          isUser
          text="처음이에요! 나는 친구들과 함께 있었고 그녀는 나를 그곳으로 데려갔습니다."
          translation="That was my first time! I was with my friends and she took me there."
        />
        <ChatMessage
          isLoading
        />
      </div>

      <button onClick={() => setTheme('lavender', 'light')}>lav</button>
      <button onClick={() => setTheme('amber', 'light')}>amber</button>
      <button onClick={() => setTheme('rose', 'light')}>rose</button>
      {/* <button onClick={() => setTheme('aqua', 'light')}>aqua</button> */}
    </main>
  )
}

function ChatMessage(props: {
  text?: string,
  translation?: string,
  isUser?: boolean,
  isLoading?: boolean,
}) {

  const {
    text,
    translation,
    isUser = false,
    isLoading = false,
  } = props

  return (
    <div className={cn(
      "max-w-[70%]",
      "flex flex-col gap-4",
      "p-6 rounded-3xl border",
      isUser ? [
        "self-end rounded-br-none bg-vibrant/50 border-vibrant/50 text-dark"
      ] : [
        "self-start rounded-bl-none bg-white/75 border-white/75 text-dark"
      ]
    )}>
      {
        !isLoading ?
          <>
            <div className={cn(
              "text-3xl font-semibold"
            )}>{text}</div>
            <div className={cn(
              "text-xl font-light italic"
            )}>{translation}</div>
          </>
          :
          <div className="flex gap-2">
            <span className="w-2 h-2 rounded-full bg-back inline-block" />
            <span className="w-2 h-2 rounded-full bg-back inline-block" />
            <span className="w-2 h-2 rounded-full bg-back inline-block" />
          </div>
      }
    </div>
  )

}