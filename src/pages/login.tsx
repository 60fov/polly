import { cookies } from "next/dist/client/components/headers"
import { useRouter } from "next/router"
import { useRef, useState } from "react"

export default function Auth() {
  const router = useRouter()
  const [error, setError] = useState(false)
  const refInput = useRef<HTMLInputElement>(null)
  return (
    <main className="flex flex-col items-center justify-center h-screen gap-2">
      <div className="flex gap-2">
        <input type="password" className="border-neutral-300 bg-neutral-200 rounded p-2" ref={refInput} placeholder="password" />
        <button onClick={async () => {
          console.log("click")
          return await fetch('/api/auth', {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pwd: refInput.current?.value })
          }).then((resp) => {
            if (resp.ok) {
              router.push("/")
            } else {
              setError(true)
            }
          })
        }}
          className="bg-black rounded text-white hover:bg-neutral-600 p-2">login</button>
      </div>
      <span className="text-red-500 h-4 tracking-tight">{error && "bad password"}</span>
    </main>
  )
}