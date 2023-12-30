import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import md5 from "md5";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

// Function to create and return a Pinecone client instance
export const getPineconeClient = async () => {
  return new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
    environment: process.env.PINECONE_ENVIRONMENT!,
  });
};

// Function to truncate a string to a specified number of bytes
export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

// Function to prepare a document for embedding
async function prepareDocument(page: PDFPage) {
  console.log("Preparing document");
  // Extract relevant information from the PDF page
  let { pageContent, metadata } = page;

  // Remove newlines from the page content
  pageContent = pageContent.replace(/\n/g, "");
  // Split the document into smaller segments
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  console.log("Prepared document");
  return docs;
}

// Function to embed a document and create a Pinecone record
async function embedDocument(doc: Document) {
  try {
    console.log("Obtaining embeddings");
    // Obtain embeddings for the document's page content
    const embeddings = await getEmbeddings(doc.pageContent);
    // Create a hash for the document's page content
    const hash = md5(doc.pageContent);

    // Create and return a Pinecone record
    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}

// Function to load PDFs from S3, extract text, segment, vectorize, and upload to Pinecone
export async function loadS3IntoPinecone(fileKeys: string[]) {
  // 1. obtain the pdfs -> downlaod and read from pdfs
  for (const fileKey of fileKeys) {
    const file_name = await downloadFromS3(fileKey);
    if (!file_name) {
      throw new Error("could not download from s3");
    }

    // Getting the text from the downlaoded pdf
    const loader = new PDFLoader(file_name);
    const pages = (await loader.load()) as PDFPage[];

    // 2. split and segment the pdf
    const documents = await Promise.all(pages.map(prepareDocument));
    // 3. vectorise and embed individual documents
    const vectors = await Promise.all(documents.flat().map(embedDocument));

    const client = await getPineconeClient();
    const pineconeIndex = client.index(process.env.PINECONE_INDEX_NAME!);

    // Use the file key to create a namespace within the index
    const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
    // Upsert vectors into the namespace
    await namespace.upsert(vectors);
    console.log("Uploaded vectors");
  }
}
