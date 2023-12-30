import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";

import ChatSiderbar from "@/components/ChatSiderbar";
import ChatComponent from "@/components/ChatComponent";
import PDFViewer from "@/components/PDFViewer";

const Page = async ({ chatId }: { chatId: string }) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats) {
    return redirect("/");
  }
  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/");
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));
  return (
    <div className="flex max-h-screen overflow-scroll">
      <div className="flex w-full max-h-screen overflow-scroll">
        <div className="flex-[1] max-w-xs">
          <ChatSiderbar chats={_chats} chatId={parseInt(chatId)} />
        </div>
        <div className="max-h-screen p-4 oveflow-scroll flex-[5]">
          <PDFViewer urls={currentChat?.pdfUrls || []} />
        </div>
        <div className="flex-[3] border-l-4 border-l-slate-200">
          <ChatComponent chatId={parseInt(chatId)} />
        </div>
      </div>
    </div>
  );
};

export default Page;
