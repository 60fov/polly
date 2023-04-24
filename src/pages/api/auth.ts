import { serialize, CookieSerializeOptions } from 'cookie'
import type { NextApiRequest, NextApiResponse } from 'next'


export const setCookie = (
  res: NextApiResponse,
  name: string,
  value: unknown,
  options: CookieSerializeOptions = {}
) => {
  const stringValue =
    typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value)

  if (typeof options.maxAge === 'number') {
    options.expires = new Date(Date.now() + options.maxAge * 1000)
  }

  res.setHeader('Set-Cookie', serialize(name, stringValue, options))
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed")
  }

  const { pwd } = req.body

  if (pwd === process.env.PASSWORD) {
    setCookie(res, 'login', true, { path: '/', maxAge: 2592000 })
    res.redirect(302, "/")
  } else {
    res.status(400).end("bad password")
  }
}