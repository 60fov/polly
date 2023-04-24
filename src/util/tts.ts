import { useEffect, useRef, useState } from "react"
import { LanguageBCP47 } from "./langauge"

export type SpeakOptions = {
  lang?: LanguageBCP47
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

export const useTTS = (options?: SpeakOptions) => {
  const [isPlaying, setIsPlaying] = useState(false)

  const refUtterance = useRef<SpeechSynthesisUtterance>()

  const play = (text: string) => {
    const synth = window.speechSynthesis
    if (options && options.force && (synth.speaking || synth.pending)) synth.cancel()
    if (refUtterance.current) {
      refUtterance.current.text = text
      window.speechSynthesis.speak(refUtterance.current)
    }
  }

  const handleStart = () => {
    setIsPlaying(true)
    console.log('tts handle start')
  }

  const handleEnd = () => {
    setIsPlaying(false)
    console.log('tts handle end')
  }

  const handlePause = () => {
    setIsPlaying(false)
    console.log('tts handle pause')
  }

  const handleResume = () => {
    setIsPlaying(true)
    console.log('tts handle resume')
  }

  const handleError = (e: SpeechSynthesisErrorEvent) => {
    console.log(e)
    setIsPlaying(false)
  }
  const handleBoundary = (e: SpeechSynthesisEvent) => {
    // console.log(e)
  }
  const handleMark = (e: SpeechSynthesisEvent) => {
    // console.log(e)
  }

  useEffect(() => {
    refUtterance.current = new SpeechSynthesisUtterance()
    const utterance = refUtterance.current
    utterance.addEventListener('start', handleStart)
    utterance.addEventListener('end', handleEnd)
    utterance.addEventListener('pause', handlePause)
    utterance.addEventListener('resume', handleResume)
    utterance.addEventListener('error', handleError)
    utterance.addEventListener('boundary', handleBoundary)
    utterance.addEventListener('mark', handleMark)
    return () => {
      const utterance = refUtterance.current
      if (utterance) {
        utterance.removeEventListener('start', handleStart)
        utterance.removeEventListener('end', handleEnd)
        utterance.removeEventListener('pause', handlePause)
        utterance.removeEventListener('resume', handleResume)
        utterance.removeEventListener('error', handleError)
        utterance.removeEventListener('boundary', handleBoundary)
        utterance.removeEventListener('mark', handleMark)
      }
    }
  }, [])


  useEffect(() => {
    const utterance = refUtterance.current
    if (utterance && options) {
      if (options.lang) utterance.lang = options.lang
      if (options.pitch) utterance.pitch = options.pitch
      if (options.rate) utterance.rate = options.rate
    }
  }, [options])


  // useEffect(() => {
  //   const utterance = refUtterance.current
  //   if (utterance) {
  //     const synth = window.speechSynthesis
  //     if (!text) {
  //       console.warn('tts text undefined')
  //       return
  //     }

  //     if (options?.force && (synth.speaking || synth.pending)) synth.cancel()

  //     // utterance.text = text
  //     // if (autoPlay) {
  //     //   synth.speak(utterance)
  //     // }
  //   }
  // }, [text])

  return {
    play,
    isPlaying
  }
}

const tts = { speak }
export default tts