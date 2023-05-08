import { ReactNode, useCallback, useEffect, useRef, useState } from "react"
import data from "~/util/data"
import { cn, createCtx, shuffle, stringCompareDiff as stringCompareF } from "~/util/fns"
import { useSTT } from "~/util/hooks"
import useEvent from "~/util/hooks/useEvent"
import { LanguageISO6391, SupportedLanguage, getISO6391 } from "~/util/langauge"
import Text from './Text'
import useTimeout from "~/util/hooks/useTimeout"
import useStateRef from "~/util/hooks/useStateRef"

type Goal = {
  text: string
  english: string
  romanization?: string
}



interface TranscriptionContextInterface {
  language: SupportedLanguage
  volume: number
  rate: number
  transcript: string
  attempts: number
  isTranscribing: boolean
  isRecording: boolean
  nextGoal: () => void
  goal?: Goal
  similarity?: number
}

const [useTranscriptionContext, TranscriptionProvider] = createCtx<TranscriptionContextInterface>()



interface TranscriptionProps {
  language: SupportedLanguage
  volume?: number
  rate?: number
  children: ReactNode
}

function Transcription(props: TranscriptionProps) {
  const {
    language,
    volume = 1,
    rate = 1,
    children
  } = props

  const [attempts, setAttempts] = useState(0)
  const [goalList, setGoalList, refGoalList] = useStateRef<Goal[]>()
  const [similarity, setSimilarity] = useState(0)

  const refSimilarity = useRef(similarity)
  refSimilarity.current = similarity

  const goal = () => refGoalList.current?.at(0)

  useEffect(() => {
    setAttempts(0)
  }, [])

  const successTimeout = useTimeout(() => {
    console.log("timeout")
    nextGoal()
  }, 1000)

  const {
    transcript,
    isRecording,
    isTranscribing,
    isSpeaking,
    startRecording,
    stopRecording,
  } = useSTT({
    onTranscribe: async (blob: Blob) => {
      const text = await fetchTranscription(blob, getISO6391(language))
      return { text }
    },
    onTranscribeEnd: (transcript: string) => {
      setAttempts(attempts + 1)
      const sim = stringCompareF(transcript, goal()?.text || "")
      console.log('transcript', transcript, "goal", goal()?.text, 'sim', sim)
      setSimilarity(sim)
      if (sim === 1) {
        successTimeout.start()
      }
    }
  })

  useEvent('keydown', (e) => {
    if (attempts === 0) {
      const canStartRecording = !isRecording && !isTranscribing
      if (canStartRecording && e.code === 'Space') {
        startRecording()
      }
    }
  })

  useEvent('keyup', (e) => {
    if (isRecording && e.code === 'Space') {
      stopRecording()
    }
  })

  useEffect(() => {
    setGoalList(shuffle(data[language]))
  }, [language])

  const nextGoal = () => {
    if (goalList) {
      setGoalList([...goalList.slice(1)])
      setAttempts(0)
    }
  }

  return (
    <TranscriptionProvider value={{
      volume,
      rate,
      language,
      transcript,
      attempts,
      isTranscribing,
      isRecording,
      goal: goal(),
      similarity: refSimilarity.current,
      nextGoal,
    }}>
      <div className="flex flex-col gap-16 items-center">
        {children}
      </div>
    </TranscriptionProvider>
  )
}



interface TranscriptionInputProps {

}

function Input(props: TranscriptionInputProps) {
  const {

  } = props

  const { transcript, attempts, isTranscribing, isRecording, similarity } = useTranscriptionContext()

  const showTranscript = !isRecording && !isTranscribing && attempts !== 0

  function transcription() {
    return isRecording ? (
      `Recording...`
    ) : isTranscribing ? (
      `Transcribing...`
    ) : attempts === 0 ? (
      `Hold Space to Record`
    ) :
      transcript
  }

  function feedback() {
    if (similarity === undefined) return
    if (similarity < 0.25) return "Not even close."
    if (similarity < 0.5) return "You can do better..."
    if (similarity < 0.75) return "Nice try."
    if (similarity < 0.9) return "Great job!"
    return "Perfect!!"
  }

  return (
    <div className="relative flex justify-center">
      {
        attempts !== 0 &&
        <div className="absolute bg-dark rounded-full leading-none px-8 py-1 bottom-full mb-8">
          <Text size="sm" className="text-light italic whitespace-nowrap">
            {feedback()}
          </Text>
        </div>
      }
      <Text size={"lg"} className={cn(
        "font-semibold opacity-50",
        showTranscript && "opacity-100"
      )}>
        {transcription()}
      </Text>
    </div>
  )
}



interface TranscriptionGoalProps {

}

function Goal(props: TranscriptionGoalProps) {

  const { goal } = useTranscriptionContext()

  return (
    <div className="flex flex-col gap-2 items-center">
      <Text size="lg" className="font-semibold">{goal?.text}</Text>
      <Text size="md" className="font-medium">{goal?.romanization}</Text>
      <Text size="sm" className="italic">{goal?.english}</Text>
    </div>
  )
}

Transcription.Input = Input
Transcription.Goal = Goal

export default Transcription



async function fetchTranscription(blob: Blob, lang: LanguageISO6391) {
  const buffer = await blob.arrayBuffer()
  const response = await fetch(`/api/speech/stt/${lang}`, {
    method: "POST",
    body: buffer
  })
  const { text } = await response.json() as { text: string }
  return text
}
