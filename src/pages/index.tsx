import { useEffect, useRef, useState } from 'react'
import { cn } from '~/util/fns'

const phrase = '만나서 반갑습니다.'

// https://www.kianmusser.com/articles/react-where-put-websocket/

export default function Home() {
  const audioStreamRef = useRef<MediaStream>()
  const mediaRecorderRef = useRef<MediaRecorder>()
  const audioRef = useRef<HTMLAudioElement>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [output, setOutput] = useState("")

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
          .then((buffer) =>
            fetch('/api/speech/stt/ko', {
              method: "POST",
              body: buffer
            }))
          .then((resp) => resp.json())
          .then((json) => setOutput(json.text))
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

  return (
    <main className={cn("h-screen flex justify-center items-center")}>
      <div className={cn("flex flex-col gap-12 items-center")}>
        <span className={cn(
          "text-5xl font-bold",
          output === phrase && "text-teal-500",
          "transition-colors"
        )}>{phrase}</span>
        <button
          className={cn(
            "appearance-none leading-none",
            "border p-1 rounded",
            isRecording ? "bg-red-100 border-red-300 animate-pulse" : "bg-neutral-100 border-neutral-300",
          )}
          onClick={handleRecordButton}
        >
          {
            isRecording ? "stop rec" : "start rec"
          }
        </button>
        <audio ref={audioRef} controls></audio>
      </div>
    </main >
  )
}