import { ReactNode } from "react"
import Button from "./Button"
import Icon, { IconContextProvider } from "~/icons/Icons"
import Modal from "./Modal"
import Text from "./Text"
import { cn } from "~/util/fns"
import { useSettingsStore } from "~/util/stores/settingsStore"
import Select from "./Select"
import { isSupportedLanguage } from "~/util/langauge"

interface LayoutProps {
  children?: ReactNode
}

export default function AppLayout({ children }: LayoutProps) {

  const { language, setLanguage } = useSettingsStore()

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
                  {/* <select
                    onChange={(e) => setLanguage(e.value)}
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
                  </select> */}
                  <Select.Base
                    name="language"
                    value={language}
                    onValueChange={(nv) => {
                      console.log(nv, isSupportedLanguage(nv))
                      if (isSupportedLanguage(nv)) setLanguage(nv)
                    }}>
                    <Select.Option value="korean">Korean</Select.Option>
                    <Select.Option value="japanese">Japanese</Select.Option>
                    <Select.Option value="spanish">Spanish</Select.Option>
                  </Select.Base>
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