import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import UploadButton from "@/components/UploadButton";
import Link from "next/link";
import { MessageCircle, MoveLeft, MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import MessageList from "@/components/MessageList";

type Props = {
  params: {
    chatId: string;
  };
};

const Page = async ({ params: { chatId } }: Props) => {
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
    <div className="w-full justify-between items-stretch h-screen flex flex-shrink-0">
      <div className="w-2/6 relative overflow-y-auto">
        <div className="px-2 py-[12px] flex items-center justify-between">
          <UploadButton
            className="w-full border-white border py-6 text-black bg-white shadow-md"
            buttonText="New Chat"
          />
        </div>

        <div className="bg-white h-[80vh] rounded-md mx-2 shadow-md  flex max-h-screen overflow-scroll pb-20 flex-col">
          {_chats.map((chat) => (
            <div key={chat.id}>
              <Link href={`/chat/${chat.id}`}>
                <div
                  className={cn("px-3 py-6 flex items-center hover:font-bold", {
                    "bg-gray-100": chat.id === parseInt(chatId),
                    "rounded-md": chat.id === parseInt(chatId),
                  })}
                >
                  <MessageCircle className="mr-2" />
                  <p className="w-full overflow-hidden text-sm truncate font-semibold whitespace-nowrap text-ellipsis">
                    {chat.pdfNames[0]}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <div className="w-4/6 flex flex-col item-center">
        <div className="px-2 py-[12px] w-full items-center justify-between flex">
          <Button variant={"outline"} className="border-none shadow-md py-6">
            <MoveLeft />
          </Button>
          <Button variant={"outline"} className="border-none shadow-md py-6">
            <MoveRight />
          </Button>
        </div>
        <iframe
          src={`https://docs.google.com/gview?url=${currentChat?.pdfUrls[0]}&embedded=true`}
          className="w-full h-[80vh] bg-transparent px-2 bg-white"
        ></iframe>
      </div>
      <div className="w-2/6" id="message-container">
        <div className="px-2 py-[12px] w-full">
          <Button
            variant={"outline"}
            className="w-full border-none shadow-md py-6"
          >
            Chat
          </Button>
        </div>
        <MessageList chatId={parseInt(chatId)} />
      </div>
    </div>
  );
};

export default Page;
