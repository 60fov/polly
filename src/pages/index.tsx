import { GetServerSideProps, GetServerSidePropsContext } from "next"
import { NextRequest } from "next/server"
import React, { useCallback, useEffect, useRef, useState } from "react"
import MultiToggle from "~/components/Mutlitoggle"
import Icon from "~/icons/Icons"
import data from "~/util/data"
import { cn, randomFrom, stringCompareDiff } from "~/util/fns"
import { useSTT } from "~/util/hooks"
import { LanguageISO6391, SupportedLanguage, getBCP47, getISO6391, isSupportedLanguage } from "~/util/langauge"

import tts, { SpeakOptions, useTTS } from "~/util/tts"

type Goal = {
  text: string
  english: string
  romanization?: string
}

export default function Home() {

  const [running, setRunning] = useState(false)

  const [goal, setGoal] = useState<Goal>()
  const [transcription, setTranscription] = useState("")
  const [language, setLanguage] = useState<SupportedLanguage>("korean")
  const refLang = useRef<SupportedLanguage>()

  refLang.current = language

  const { play: ttsPlay, isPlaying: ttsIsPlaying } = useTTS({
    lang: getBCP47(language),
    rate: 0.7,
    force: true,
  })

  const onTranscribe = useCallback(async (blob: Blob) => {
    const lang = refLang.current || language
    console.log("transcribing", getISO6391(lang), lang)
    const text = await fetchTranscription(blob, getISO6391(lang))
    console.log("transcribed", text)
    return {
      blob,
      text
    }
  }, [language])

  const onTranscribeEnd = useCallback((transcript: string) => {
    setTranscription(transcript)
    // const stringDiff = stringCompareDiff(goal?.text || "", transcript)
    // ttsPlay(getAttemptResponse(stringDiff))
  }, [
    // goal?.text, ttsPlay
  ])

  const {
    transcript,
    isSpeaking,
    isTranscribing,
    isRecording,
    startRecording,
    stopRecording
  } = useSTT({
    onTranscribe,
    onTranscribeEnd,
  })


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

  useEffect(() => {
    if (!goal) return
    ttsPlay(goal.text)
  }, [goal])

  useEffect(() => {
    if (transcription) {
      const stringDiff = stringCompareDiff(goal?.text || "", transcript)
      ttsPlay(getAttemptResponse(stringDiff))
    }
  }, [transcription])

  const handleStart: React.MouseEventHandler = () => {
    setRunning(true)
    setGoal(randomFrom(data[language]))
  }

  const handleSayAgain: React.MouseEventHandler = () => {
    if (!goal) {
      console.warn("no goal")
      return
    }
    ttsPlay(goal.text)
  }

  const handleContinue: React.MouseEventHandler = () => {
    setGoal(randomFrom(data[language]))
    setTranscription("")
  }

  const handleLanguageChange = (lang: SupportedLanguage) => {
    console.log('setting language to', lang)
    setLanguage(lang)
    setGoal(randomFrom(data[lang]))
    setTranscription("")
  }

  const getAttemptResponse = (diff: number) => {
    let result: string
    if (diff < 0.6) {
      result = "not even close, try again";
    } else if (diff < 0.75) {
      result = "nice try, but you can do better.";
    } else if (diff < 0.9) {
      result = "you're so close!";
    } else {
      result = "perfect!";
    }
    return result
  }


  const stringDiff = stringCompareDiff(goal?.text || "", transcription)
  const correctPronunciation = stringDiff > 0.9

  if (!running) {
    return (
      <main className={"h-screen flex items-center justify-center"}>
        <button
          onClick={handleStart}
          className={cn(
            "p-2 leading-none border border-neutral-200 bg-neutral-100 rounded hover:bg-white active:bg-neutral-300"
          )}>enter</button>
      </main>
    )
  }

  return (
    <main className={cn(
      "h-screen flex items-center justify-center",
      "bg-white",
      // "bg-teal-300 bg-rose-300"
    )}>

      <div className={cn(
        "flex flex-col items-center gap-4",
      )}>

        <div className={cn(
          "relative flex p-2 leading-none rounded  text-2xl font-semibold",
          isRecording ? "bg-rose-300" : "bg-neutral-100",
        )}>
          <div className="absolute bottom-full mb-1 text-xs text-neutral-600 font-normal tracking-tight italic left-0 right-0 text-center">
            {
              transcription && getAttemptResponse(stringDiff)
            }
          </div>
          {
            transcription ?
              <span className={cn(
                stringDiff < 0.6 ? "text-red-400" :
                  stringDiff < 0.75 ? "text-amber-400" :
                    stringDiff < 0.9 ? "text-green-400" :
                      "text-fuchsia-400"
              )}>
                {transcription}
              </span>
              :
              <span className="opacity-50">
                {isRecording ? "recording" :
                  isTranscribing ? "transcribing" : "hold space to record your input"}
              </span>
          }
        </div>

        <div className="flex flex-col items-center">
          <div className="relative flex items-center">
            <span className="text-2xl font-semibold">{goal?.text}</span>
            <div
              onClick={handleSayAgain}
              className={cn(
                "cursor-pointer left-full absolute ml-2 hover:opacity-100",
                ttsIsPlaying ? "text-red-500 opacity-100" : "opacity-25"
              )}><Icon.Speaker className="w-4 h-4" /></div>
          </div>
          <span className="text-xl">{goal?.romanization}</span>
          <span className="italic">{goal?.english}</span>
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={handleContinue}
            onKeyDown={(e) => { e.preventDefault() }}
            onKeyUp={(e) => { e.preventDefault() }}
            className={cn(
              "p-2 leading-none border border-neutral-200 bg-neutral-100 rounded hover:bg-white active:bg-neutral-300"
            )}>{correctPronunciation ? "continue" : "skip"}</button>
        </div>

        <MultiToggle.Base name="lang2" value={language} onValueChange={handleLanguageChange}>
          <MultiToggle.Item value="korean">korean</MultiToggle.Item>
          <MultiToggle.Item value="japanese">japanese</MultiToggle.Item>
          <MultiToggle.Item value="spanish">spanish</MultiToggle.Item>
        </MultiToggle.Base>

      </div>
    </main>
  )
}

async function fetchTranscription(blob: Blob, lang: LanguageISO6391) {
  const buffer = await blob.arrayBuffer()
  const response = await fetch(`/api/speech/stt/${lang}`, {
    method: "POST",
    body: buffer
  })
  const { text } = await response.json() as { text: string }
  return text
}