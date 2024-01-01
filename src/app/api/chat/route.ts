import { HfInference } from "@huggingface/inference";
import { HuggingFaceStream, StreamingTextResponse } from "ai";
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const Hf = new HfInference(process.env.HF_API_KEY);

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length != 1) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }

    const fileKeys = _chats[0].fileKeys;
    const lastMessage = messages[messages.length - 1];

    // Get context for all fileKeys
    const contextPromises = fileKeys.map((fileKey) =>
      getContext(lastMessage.content, fileKey)
    );
    const contexts = await Promise.all(contextPromises);

    // Join all contexts into a single string
    const allContexts = contexts.join("\n");

    const userMessages = messages.filter(
      (message: any) => message.role === "user"
    );

    const question = userMessages[userMessages.length - 1].content;

    const prompt = `
      Document:  ${allContexts}. Now from above document, please answer the following question or perform the given task: ${question} 
      `;

    const response = await Hf.textGenerationStream({
      model: "google/flan-t5-xxl",
      // model: "mistralai/Mistral-7B-v0.1",
      inputs: prompt,
    });
    console.log(response);

    const stream = HuggingFaceStream(response, {
      onStart: async () => {
        // save user message into db
        await db.insert(_messages).values({
          chatId,
          content: lastMessage.content,
          role: "user",
        });
      },
      onCompletion: async (completion) => {
        // save ai message into db
        await db.insert(_messages).values({
          chatId,
          content: completion,
          role: "system",
        });
      },
    });
    return new StreamingTextResponse(stream);
  } catch (error) {}
}
