import { useEffect, useState } from "react"
import { type ChatMessage } from "~/util/chat"
import { cn } from "~/util/fns"
import { usePollyChat, useSTT } from "~/util/hooks"

import tts from "~/util/tts"

export default function Home() {

  const [state, setState] = useState<"intro" | "waitingForAi" | "waitingForUserResponse" | "waitingForUserTranslation">("intro")

  const {
    log: chatLog,
    startChat,
    pushUserChat,
    getAiResponse
  } = usePollyChat({
    onNewChat: async ({ user, message, translation }) => {
      tts.speak(`${message}`, { lang: "en-US", rate: 0.9 })
      tts.speak(`${translation}`, { lang: "ko-KR", rate: 0.75 })
      if (user === "me") {
        setState("waitingForUserTranslation")
      } else if (user === "AI") {
        setState("waitingForUserResponse")
      }
    }
  })

  const {
    transcript,
    isRecording,
    isSpeaking,
    isTranscribing,
    pauseRecording,
    startRecording,
    stopRecording,
  } = useSTT({
    requestMicOnMount: true,
    // transcribeOnStoppedSpeaking: true,
    onTranscribe: async (blob: Blob) => {
      console.log('transcribe fn call')
      const buffer = await blob.arrayBuffer()
      const lang = state === "waitingForUserResponse" ? "en" : "ko"
      console.log(lang)
      const response = await fetch(`/api/speech/stt/${lang}`, {
        method: "POST",
        body: buffer
      })
      const { text } = await response.json() as { text: string }

      return {
        blob,
        text,
      }
    },
    onTranscribeEnd: async (transcript: string) => {
      pushUserChat(transcript)
    }
  })

  function recordingStatusMessage() {
    return "hold spacebar to record"
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && !isRecording) {
        startRecording()
        console.log('space down recording...')
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        stopRecording()
        console.log('space up recording stopped.')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])


  const enterApp = () => {
    setState("waitingForAi")
    startChat()
  }

  if (state === "intro") {
    return (
      <main className="h-screen flex items-center justify-center">
        <button
          onClick={enterApp}
          className="bg-neutral-200 hover:bg-neutral-200/50 active:bg-neutral-300 p-2 rounded">
          enter
        </button>
      </main>
    )
  }

  return (
    <main className={cn(
      "max-w-sm mx-auto h-screen p-2"
    )}>
      <div className="flex flex-col gap-2">
        {
          [...chatLog].map((msg, i) => (
            <ChatMessage key={i} {...msg} />
          ))
        }
      </div>
      <div className="h-4"></div>
      {
        (state === "waitingForUserTranslation" || state === "waitingForUserResponse") &&
        <div className="flex justify-end p-2 gap-2">
          <span className="rounded-full px-3 border border-neutral-300">{recordingStatusMessage()}</span>
          <span>{<Icon.Mic />}</span>
        </div>
      }
      <div className="flex flex-col">
        <span>{`recording: ${isRecording}`}</span>
        <span>{`speaking: ${isSpeaking}`}</span>
        <span>{`transcribing: ${isTranscribing}`}</span>
        <span>{`app state: ${state}`}</span>
      </div>
    </main>
  )
}


interface ChatMessageProps extends ChatMessage { }

const ChatMessage = (props: ChatMessageProps) => {
  const {
    user,
    message,
    translation
  } = props


  const replayTTS = () => {
    tts.speak(`${message}`, { lang: "en-US", rate: 0.9 })
    tts.speak(`${translation}`, { lang: "ko-KR", rate: 0.7 })
  }

  return (
    <div onClick={replayTTS}
      className={cn(
        "px-3 py-2 leading-none rounded-xl max-w-[75%] flex flex-col gap-1 cursor-pointer",
        user !== "AI" ?
          "rounded-br-none bg-indigo-600 text-white self-end" :
          "rounded-bl-none bg-neutral-300 self-start",
      )}>
      <span>
        {message || "message..."}
      </span>
      <span className="flex h-[1px] bg-neutral-950/25" />
      <span>
        {translation || "translation..."}
      </span>
    </div>
  )

}

const Mic = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
  )
}

const Icon = {
  Mic
}