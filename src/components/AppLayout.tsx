import { ReactNode } from "react"
import Button from "./Button"
import Icon, { IconContextProvider } from "~/icons/Icons"
import Modal from "./Modal"
import Text from "./Text"
import { cn } from "~/util/fns"

interface LayoutProps {
  children?: ReactNode
}

export default function AppLayout({ children }: LayoutProps) {
  return (
    <>
      <IconContextProvider value={{ size: 18 }}>
        <div className="absolute right-0 p-4 flex flex-col gap-4">
          <Modal>
            <Modal.Button><Icon.Gear /></Modal.Button>
            <Modal.Portal>
              <div className={"flex flex-col text-light"}>
                <div className={"flex gap-4 items-center"}>
                  <Text
                    as="label"
                    size="md"
                    htmlFor="languageSelect">
                    language
                  </Text>
                  <select
                    id="languageSelect"
                    className={cn(
                      "appearance-none outline-none",
                      "grow",
                      "bg-light px-4 py-2 rounded-xl text-dark text-3xl font-semibold",
                    )}
                  >
                    <option>korean</option>
                    <option>japanese</option>
                    <option>english</option>
                  </select>
                </div>

                <div>
                  <div className="flex gap-4">
                      <input type="checkbox" />
                      <span className="grow">{"hello"}</span> 
                      <span className="grow">{"안녕하세요"}</span>
                  </div>
                  <div className="flex gap-4">
                      <input type="checkbox" />
                      <span className="grow">{"hello"}</span> 
                      <span className="grow">{"안녕하세요"}</span>
                  </div>
                  <div className="flex gap-4">
                      <input type="checkbox" />
                      <span className="grow">{"hello"}</span> 
                      <span className="grow">{"안녕하세요"}</span>
                  </div>
                  <div className="flex gap-4">
                      <input type="checkbox" />
                      <span className="grow">{"hello"}</span> 
                      <span className="grow">{"안녕하세요"}</span>
                  </div>
                  <div className="flex gap-4">
                      <input type="checkbox" />
                      <span className="grow">{"hello"}</span> 
                      <span className="grow">{"안녕하세요"}</span>
                  </div>
                  <div className="flex gap-4">
                      <input type="checkbox" />
                      <span className="grow">{"hello"}</span> 
                      <span className="grow">{"안녕하세요"}</span>
                  </div>
                </div>

              </div>
            </Modal.Portal>
          </Modal>
        </div>
        <main>{children}</main>
      </IconContextProvider>
    </>
  )
}