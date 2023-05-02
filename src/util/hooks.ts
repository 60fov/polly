import { useCallback, useEffect, useRef, useState } from "react"
import { ChatMessage, fetchPollyChat } from "./chat"
import { z } from "zod"
import hark, { Harker } from "hark"


interface PollyChatOptions {
  onNewChat?: (chat: ChatMessage) => void
}

export const usePollyChat = (options: PollyChatOptions) => {
  const {
    onNewChat
  } = options

  const [log, setLog] = useState<ChatMessage[]>([])

  useEffect(() => {
    const localLogData = localStorage.getItem("polly_log")

    if (localLogData) {
      try {
        const localLog = z.custom<ChatMessage[]>().parse(localLogData)
        setLog(localLog)
      } catch (err) {
        console.warn("failed to load local log")
        console.warn(err)
        console.warn("restarting chat")
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("log", JSON.stringify(log))
    console.log(log)
  }, [log])

  async function startChat() {
    const { message, translation } = await fetchPollyChat({
      type: "start"
    })
    const newMessage = { user: "AI", message, translation }
    setLog([newMessage])
    if (onNewChat) onNewChat(newMessage)
  }


  async function pushUserChat(message: string) {
    const pollyResp = await fetchPollyChat({
      type: "translation",
      message
    })
    const newMessage = { user: "me", ...pollyResp }
    setLog([...log, newMessage])
    if (onNewChat) onNewChat(newMessage)

    return pollyResp
  }

  async function getAiResponse() {
    const lastMessage = log.at(-1)
    if (!lastMessage) {
      startChat()
    } else {
      const pollyResp = await fetchPollyChat({
        type: 'repsonse',
        message: lastMessage.message
      })

      const newMessage = { user: "AI", ...pollyResp }
      setLog([...log, newMessage])
      if (onNewChat) onNewChat(newMessage)
    }
  }

  return {
    log,
    startChat,
    pushUserChat,
    getAiResponse,
  }
}




interface useWhisperOptions {
  requestMicOnMount?: boolean
  transcribeOnStoppedSpeaking?: boolean
  timeSlice?: number
  onTranscribe: (blob: Blob) => Promise<{ blob?: Blob, text: string }>
  onTranscribeEnd?: (transcript: string) => void
  onSpeakingStart?: () => void
  onSpeakingStop?: () => void
}

export function useSTT(options: useWhisperOptions) {
  const {
    requestMicOnMount = false,
    transcribeOnStoppedSpeaking = false,
    timeSlice,
    onTranscribe,
    onTranscribeEnd,
    onSpeakingStart,
    onSpeakingStop,
  } = options

  const [transcript, setTranscript] = useState("")

  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const refHarker = useRef<Harker>()
  const refAudioStream = useRef<MediaStream>()
  const refMediaRecorder = useRef<MediaRecorder>()

  // const onTranscribeEndCallback = useCallback(onTranscribeEnd, [onTranscribeEnd])
  // const onTranscribeCallback = useCallback(onTranscribe, [onTranscribe])

  // usecallback for handling onTranscribe change
  const handleRecorderDataAvailable = async (e: BlobEvent) => {
    setIsTranscribing(true)
    const { text } = await onTranscribe(e.data)
    if (onTranscribeEnd) onTranscribeEnd(text)
    setIsTranscribing(false)
    setTranscript(text)
  }

  const initStreamAndRecorder = useCallback(async () => {
    refAudioStream.current = await navigator.mediaDevices.getUserMedia({ audio: true })
    refMediaRecorder.current = new MediaRecorder(refAudioStream.current, {
      audioBitsPerSecond: 16_000,
      mimeType: "audio/webm"
    })
    if (!refHarker.current) {
      console.log("starting hark init")
      refHarker.current = hark(refAudioStream.current, {
        play: false,
      })
      refHarker.current.on('speaking', handleSpeaking)
      refHarker.current.on('stopped_speaking', handleStoppedSpeaking)
      // refHarker.current.on('state_change', )
      console.log("finsihed hark init")
    } else {
      refHarker.current.resume()
    }

    const recorder = refMediaRecorder.current

    recorder.addEventListener('dataavailable', handleRecorderDataAvailable)
    recorder.addEventListener('start', handleRecorderStart)
    recorder.addEventListener('stop', handleRecorderStop)
    recorder.addEventListener('pause', handleRecorderPause)
    recorder.addEventListener('resume', handleRecorderResume)
    recorder.addEventListener('error', handleRecorderError)
  }, [])

  const startRecording = async () => {
    if (!refAudioStream.current || !refMediaRecorder.current) {
      await initStreamAndRecorder()
    }
    const recorder = refMediaRecorder.current
    if (!recorder) {
      console.error('failed to start recording')
      return
    }
    console.log("recording start", recorder)
    recorder.start(timeSlice)
  }

  const stopRecording = () => {
    console.log("recording stop")
    refMediaRecorder.current?.stop()
  }

  const pauseRecording = () => {
    refMediaRecorder.current?.pause()
  }

  const resumeRecording = () => {
    refMediaRecorder.current?.resume()
  }

  // recorder event handlers

  const handleRecorderStart = (e: Event) => {
    setIsRecording(true)
    console.log("recorder handle start")
  }

  const handleRecorderStop = (e: Event) => {
    setIsRecording(false)
    console.log("recorder handle stop")
  }

  const handleRecorderPause = (e: Event) => {
    setIsRecording(false)
    console.log("recorder handle pause")
  }

  const handleRecorderResume = (e: Event) => {
    setIsRecording(true)
    console.log("recorder handle resume")
  }

  const handleRecorderError = (e: Event) => {
    console.log('media recorder error')
  }

  // hark event handlers 

  const handleSpeaking = () => {
    setIsSpeaking(true)
    if (onSpeakingStart) onSpeakingStart()
  }

  const handleStoppedSpeaking = () => {
    setIsSpeaking(false)
    if (onSpeakingStop) onSpeakingStop()
    if (transcribeOnStoppedSpeaking) {
      refMediaRecorder.current?.requestData()
    }
  }

  // clean up
  useEffect(() => {
    return () => {
      const recorder = refMediaRecorder.current
      if (recorder) {
        recorder.removeEventListener('dataavailable', handleRecorderDataAvailable)
        recorder.removeEventListener('start', handleRecorderStart)
        recorder.removeEventListener('stop', handleRecorderStop)
        recorder.removeEventListener('pause', handleRecorderPause)
        recorder.removeEventListener('resume', handleRecorderResume)
        recorder.removeEventListener('error', handleRecorderError)
      }

      if (refHarker.current) {
        refHarker.current.stop()
      }
    }
  }, [])

  useEffect(() => {
    // if (requestMicOnMount) {
    initStreamAndRecorder()
    // }
  }, [])


  // hark initializer
  useEffect(() => {

  }, [])

  return {
    // state
    transcript,
    isRecording,
    isSpeaking,
    isTranscribing,

    // functions
    startRecording,
    stopRecording,
    resumeRecording,
    pauseRecording,
  }
} 