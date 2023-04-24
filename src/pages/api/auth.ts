import type { NextApiRequest, NextApiResponse } from 'next'
import { setCookie } from '~/util/cookies'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed")
  }

  const { pwd } = req.body

  if (pwd === process.env.PASSWORD) {
    // res.setHeader('Set-Cookie', `login=true`)
    setCookie(res, 'login', true, { path: '/', maxAge: 2592000 })
    res.redirect(302, "/")
  } else {
    res.status(400).end("bad password")
  }
}