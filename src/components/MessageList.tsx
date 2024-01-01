"use client";

import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";
import { Input } from "./ui/input";
import { useChat } from "ai/react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";

const MessageList = ({ chatId }: { chatId: number }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
  });

  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    },
    initialMessages: data || [],
  });

  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);
  if (isLoading) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  if (!messages || messages.length === 0)
    return (
      <div className="border border-black flex item-center justify-center h-screen w-full">
        <p>Start Chatting...</p>
      </div>
    );
  return (
    <>
      <div className="flex flex-col gap-2 px-6 py-4 mt-2 mx-2 h-[70vh] overflow-y-auto">
        {messages.map((message) => {
          return (
            <div
              key={message.id}
              className={cn("flex", {
                "justify-end pl-10": message.role === "user",
                "justify-start pr-10": message.role === "assistant",
              })}
            >
              <div
                className={cn(
                  "rounded-lg px-3 text-sm py-1 shadow-md ring-1 ring-gray-900/10",
                  {
                    "bg-blue-600 text-white": message.role === "user",
                  }
                )}
              >
                <p>{message.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-md shadow-md inset-x-0 px-2 mx-2 py-4 bg-white"
      >
        <div className="flex">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="w-full"
          />
          <Button className="bg-blue-600 ml-2">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </>
  );
};

export default MessageList;
