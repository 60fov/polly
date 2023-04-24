import { RefObject, useEffect, useReducer, useRef, useState } from 'react'
import { cn } from '~/util/fns'
import data from "~/util/data"
import hark from "hark"

export default function Home() {
  const audioStreamRef = useRef<MediaStream>()
  const mediaRecorderRef = useRef<MediaRecorder>()
  const audioRef = useRef<HTMLAudioElement>(null)

  const [goals, setGoals] = useState<typeof data.korean[0][]>()

  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState("")
  const [transcriptionState, setTranscriptionState] = useState<"success" | "error" | "loading" | "idle">("idle")

  const { currentTime, duration, isPlaying } = useAudioState(audioRef)

  const [realTimeCurrentTime, setRealTimeCurrentTime] = useState(0)
  useAnimationFrame(() => {
    if (!audioRef.current) return
    setRealTimeCurrentTime(audioRef.current.currentTime)
  })

  // init goals
  useEffect(() => {
    setGoals(shuffle(data.korean))
  }, [])

  useEffect(() => {
    tts()
  }, [goals])

  // audio onmount
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      audio: true
    }).then((stream) => {
      audioStreamRef.current = stream

      mediaRecorderRef.current = new MediaRecorder(stream, {
        audioBitsPerSecond: 16_000,
        mimeType: 'audio/webm',
      })

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (!audioRef.current) {
          console.warn("audio ref falsy")
          return
        }
        const audioURL = URL.createObjectURL(e.data)
        audioRef.current.src = audioURL
        e.data.arrayBuffer()
          .then((buffer) => {
            setTranscriptionState("loading")
            return fetch('/api/speech/stt/ko', {
              method: "POST",
              body: buffer
            })
          })
          .then((resp) => resp.json())
          .then((json) => {
            setTranscriptionState("success")
            return setTranscription(json.text)
          })
          .catch((error) => {
            setTranscriptionState("error")
            console.log(error)
          })
      }
      console.log("audio stream: captured!")
    }).catch((err) => {
      console.warn(err)
    })
  }, [])

  const handleRecordButton: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (!audioStreamRef.current) {
      console.warn("audioStreamRef is falsy")
      return
    }
    if (!mediaRecorderRef.current) {
      console.warn("mediaRecorder is falsy")
      return
    }

    const recorder = mediaRecorderRef.current

    if (isRecording) {
      recorder.stop()
      setIsRecording(false)
    } else {
      recorder.start()
      setIsRecording(true)
    }
    console.log(`recorder state: ${recorder.state}`)
  }

  const tts = () => {
    const goal = goals?.[0].korean
    if (!goal) return
    speak(goal, {
      lang: 'ko-KR',
      rate: 0.7
    })
  }

  const goal = goals?.[0]

  const correct = (transcriptionState === "success" && transcription.replaceAll(".", "").replaceAll("?", "") === goal?.korean)

  return (
    <main className={cn("h-screen flex flex-col gap-6 justify-center items-center")}>
      <div className={cn("flex flex-col gap-6 items-center p-12 w-full max-w-xl rounded-xl bg-neutral-200/50")}>
        <div className={cn(
          "flex flex-col gap-3 items-center"
        )}>
          <span onClick={tts} className={cn(
            "text-5xl font-bold p-2 hover:bg-neutral-300/50 rounded",
            transcriptionState === "success" && (correct ? "text-teal-500" : "text-rose-500"),
            "transition-colors"
          )}>{goal?.korean}</span>
          <span>{goal?.romanization}</span>
          <span>{goal?.english}</span>
        </div>
        <div>
          <p className={cn(
            "text-neutral-800",
            "p-2 rounded",
            "bg-neutral-200"
          )}>
            {
              transcriptionState === "loading" ? (
                "processing audio..."
              ) : transcriptionState === 'success' ? (
                transcription
              ) : transcriptionState === 'error' ? (
                'failed to transcribe audio'
              ) : "..."
            }
          </p>
        </div>
        <div className="flex h-10 bg-neutral-200 border border-neutral-300 rounded self-stretch overflow-hidden">
          <button
            onClick={() => {
              const audio = audioRef.current
              if (!audio) return
              if (audio.paused) audio.play()
              else audio.pause()
            }}
            className={cn(
              "flex items-center justify-center p-2",
              "hover:bg-neutral-100/50 active:bg-neutral-300",
              "border-r border-r-neutral-300"
            )}>{isPlaying ? <IconPause /> : <IconPlay />}</button>

          <div className="flex items-center p-2 grow">
            <ProgressBar value={!isRecording ? realTimeCurrentTime : undefined} max={duration} />
          </div>

          <button
            className={cn(
              "flex items-center justify-center p-2",
              "hover:bg-neutral-100/50 active:bg-neutral-300",
              "border-l border-l-neutral-300",
              isRecording ? "animate-pulse text-red-400" : "text-black"
            )}
            onClick={handleRecordButton}>
            <IconMic />
          </button>
        </div>
        <audio
          ref={audioRef}
        // controls
        />
      </div>
      <button
        className={cn(
          "p-2 leading-none rounded bg-neutral-200 border border-neutral-300",
          correct && "bg-cyan-200 hover:bg-cyan-200/50 active:bg-cyan-400 border-cyan-300 transition-all"
        )}
        onClick={() => {
          setGoals(goals?.slice(1))
          setTranscription("")
          setTranscriptionState("idle")
        }}
        disabled={!correct}>
        continue
      </button>
    </main>
  )
}


interface ProgressBarProps {
  value?: number
  max: number
}

const ProgressBar = (props: ProgressBarProps) => {
  const {
    value,
    max
  } = props

  return (
    <div
      className={cn(
        "w-full h-2 bg-neutral-400 rounded overflow-clip",
      )}>
      <div
        className={cn(
          "bg-black/50 h-full",
          value === undefined && "animate-pulse"
        )}
        style={{ width: `${(value || max) / max * 100}%` }}>
      </div>
    </div>
  )
}

const useAudioState = (ref: RefObject<HTMLAudioElement>) => {
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = ref.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleDurationChange = (event: Event) => {
      console.log('target duration', (event.currentTarget as HTMLAudioElement).duration)
      console.log('audio duration', audio.duration)
      setDuration(audio.duration)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('durationchange', handleDurationChange)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('durationchange', handleDurationChange)

    }
  }, [ref])
  return { currentTime, isPlaying, duration }
}

const useAnimationFrame = (callback: (delta: number) => void) => {
  const refFrame = useRef<number>()
  const refPrevTime = useRef<number>()

  const animate: FrameRequestCallback = (time) => {
    if (refPrevTime.current != undefined) {
      const dt = time - refPrevTime.current
      callback(dt)
    }
    refPrevTime.current = time
    refFrame.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    refFrame.current = requestAnimationFrame(animate);
    return () => {
      if (refFrame.current) cancelAnimationFrame(refFrame.current);
    }
  }, []);
}



export type SpeakOptions = {
  lang?: 'ko-KR' | 'en-US' | undefined
  pitch?: number
  rate?: number
  force?: boolean
}

const speak = (text: string, options?: SpeakOptions) => {
  const synth = window.speechSynthesis
  const utterance = new SpeechSynthesisUtterance()
  if (options) {
    if (options.lang) utterance.lang = options.lang
    if (options.pitch) utterance.pitch = options.pitch
    if (options.rate) utterance.rate = options.rate
    if (options.force && (synth.speaking || synth.pending)) synth.cancel()
  }
  utterance.text = text
  synth.speak(utterance)
}

const IconPlay = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
  )
}
const IconPause = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
    </svg>
  )
}
const IconMic = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
  )
}

function shuffle<T>(array: Array<T>) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}