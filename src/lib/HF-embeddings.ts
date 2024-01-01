import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_API_KEY!);

export async function getEmbeddingsFromHF(text: string) {
  try {
    const response = await hf.featureExtraction({
      model: "sentence-transformers/distilbert-base-nli-mean-tokens",
      inputs: text,
    });
    return response as number[];
  } catch (error) {
    console.log("Error calling HF embeddings api", error);
    throw error;
  }
}
