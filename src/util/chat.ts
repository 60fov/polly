export type ChatMessage = {
  user?: string,
  message: string,
  translation: string
}

// const chatStateList = ["generatingMessage", "userSpeaking", "userMessaging", "idle"] as const
// type ChatState = typeof chatStateList[number]

export type ChatApiBody = { lang?: string } & ({
  type: "repsonse"
  message: string
} | {
  type: "start"
} | {
  type: "translation"
  message: string
})


export type ChatApiResponse = {
  message: string,
  translation: string
}

export async function fetchPollyChat(body: ChatApiBody) {
  console.log("polly chat fetch")
  const resp = await fetch('/api/chat', {
    method: "POST",
    body: JSON.stringify(body)
  })
  const result = await resp.json() as ChatApiResponse
  console.log('polly chat resp: ', result.message, result.translation)
  return result
}