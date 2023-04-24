import { NextApiRequest, NextApiResponse } from "next"
import { type ChatCompletionResponseMessageRoleEnum, Configuration, OpenAIApi } from "openai"
import { RequiredError } from "openai/dist/base";
import { z } from "zod";
import { ChatApiBody, ChatApiResponse } from "~/util/chat";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
})

const openai = new OpenAIApi(configuration);

type chatResponseOptions = {
  role: ChatCompletionResponseMessageRoleEnum
}

async function fetchSingleChatResponse(content: string, options?: chatResponseOptions) {
  const {
    role = "user",
  } = options || {}

  console.log('single chat', content)
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role, content }],
  })


  return completion.data.choices[0].message?.content || ""
}

async function fetchTranslation(message: string, lang = "Korean") {
  const translationCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `translate the following message to ${lang}: ${message}`
      },
    ],
  })

  const translation = translationCompletion.data.choices[0].message?.content || ""
  return translation
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatApiResponse>
) {
  const { body } = req

  const bodyParseResult = z.custom<ChatApiBody>().safeParse(JSON.parse(body))

  if (!bodyParseResult.success) {
    res.status(400).end(bodyParseResult.error)
    return
  }

  const chatReq = bodyParseResult.data
  console.log(chatReq)

  try {
    switch (chatReq.type) {
      case "start": {
        console.log('chat switch start', chatReq)
        const message = await fetchSingleChatResponse(`make friendly converstation`)
        const translation = await fetchTranslation(message, chatReq.lang)
        console.log(message, translation)
        res.status(200).json({
          message,
          translation
        })
      } break;
      case "repsonse": {
        console.log('chat switch response', chatReq)
        const message = await fetchSingleChatResponse(`respond to the following message as a friendly chat partner: ${chatReq.message}`)
        const translation = await fetchTranslation(message, chatReq.lang)
        res.status(200).json({
          message,
          translation
        })
      } break;
      case "translation": {
        console.log('chat switch response', chatReq)
        const message = chatReq.message // can add moderation here
        const translation = await fetchTranslation(message, chatReq.lang)
        res.status(200).json({
          message,
          translation
        })
      } break;
    }
  } catch (err) {
    if (err instanceof RequiredError) {
      res.status(400).end(err)
    } else {
      res.status(500).end(err)
    }
  }
}