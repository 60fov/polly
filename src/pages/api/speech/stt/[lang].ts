// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ReadStream, createReadStream } from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from "openai";
import getRawBody from 'raw-body';
import { Readable } from 'stream';
import { z } from 'zod';

type Data = {
  text: string
}

const API_URL = "https://api.openai.com/v1/audio/transcriptions"

const configuration = new Configuration({
  organization: "org-Q1bV6MDI54AQOdXuK3X7ye2e",
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function querySTT(data: Buffer, lang: SupportedLanguage) {
  const readable = new Readable()
  readable._read = () => { } // noop'd (?)
  readable.push(data)
  readable.push(null)
  // @ts-ignore
  readable.path = "audio.webm"
  return await openai.createTranscription(
    readable as unknown as File,
    "whisper-1",
    undefined, // prompt
    undefined, // response format
    undefined, // temperature
    "ko"
  )
}

const SupportedLanguageList = ['en', 'ko', 'jp'] as const
type SupportedLanguage = typeof SupportedLanguageList[number]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const langParse = z.custom<SupportedLanguage>().safeParse(req.query)
  if (!langParse.success) {
    res.status(400).end('invalid language query param')
    return
  }
  const lang = langParse.data
  const bodyBuffer = await getRawBody(req)

  if (req.method === 'POST') {
    const resp = await querySTT(bodyBuffer, lang)
    // console.log(resp)
    res.status(200).json({ text: resp.data.text })
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export const config = {
  api: {
    bodyParser: false
  },
}