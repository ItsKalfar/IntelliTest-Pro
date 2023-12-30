import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { getS3Url } from "@/lib/s3";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { loadS3IntoPinecone } from "@/lib/pinecone";

export async function POST(req: Request, res: Response) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { files } = body;

    console.log("Received files");

    // Initialize arrays to store information for all PDFs
    const pdfNames = [];
    const pdfUrls = [];
    const fileKeys = [];

    // Processing each file in the array
    for (const { file_key, file_name } of files) {
      console.log("Loading files into Pinecone");
      await loadS3IntoPinecone(file_key);
      console.log("Loaded data into Pinecone");

      // Accumulate information for each PDF
      pdfNames.push(file_name);
      pdfUrls.push(getS3Url(file_key));
      fileKeys.push(file_key);
    }

    console.log("Creating chat...");
    // Insert accumulated information into the database
    const chatId = await db
      .insert(chats)
      .values({
        pdfNames,
        pdfUrls,
        userId,
        fileKeys,
      })
      .returning({
        insertedId: chats.id,
      });

    console.log("Chat created successfully...");
    return NextResponse.json(
      {
        chat_id: chatId[0].insertedId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
