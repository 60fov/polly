import Transcription from "~/components/Transcription";
import { cn } from "~/util/fns";
import { NextPageWithLayout } from "./_app";
import { ReactElement } from "react";
import AppLayout from "~/components/AppLayout";

const Page: NextPageWithLayout = () => {
  return (
    <main className={cn(
      "h-screen flex items-center text-dark"
    )}>
      <div className="max-w-3xl mx-auto">
        <Transcription language="korean">
          <Transcription.Input />
          <Transcription.Goal />
        </Transcription>
      </div>
    </main>
  )
}

Page.getLayout = function getLayout(page: ReactElement) {
  return (
    <AppLayout>
      {page}
    </AppLayout>
  )
}

export default Page