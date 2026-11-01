import 'dotenv/config';

const EMBEDDING_MODEL = 'gemini-embedding-001';

/**
 * Generate real 3072-dimensional vector embedding using Google Gemini Embedding Model
 */
export async function generateEmbedding(text: string): Promise<Float32Array> {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY is not configured in .env');
  }

  const cleanText = text.trim();
  if (!cleanText) {
    throw new Error('Cannot embed empty text');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${EMBEDDING_MODEL}`,
      content: {
        parts: [{ text: cleanText }]
      }
    })
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const errorMsg = data.error?.message || `Embedding API failed with HTTP ${response.status}`;
    console.error('Gemini Embedding Error:', errorMsg);
    throw new Error(errorMsg);
  }

  const values: number[] = data.embedding?.values;
  if (!values || !Array.isArray(values) || values.length === 0) {
    throw new Error('Invalid embedding response: missing vector values');
  }

  return new Float32Array(values);
}

/**
 * Convert Float32Array to binary Buffer for direct SQLite BLOB storage
 */
export function float32ArrayToBuffer(arr: Float32Array): Buffer {
  return Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength);
}

/**
 * Convert SQLite BLOB Buffer back to Float32Array
 */
export function bufferToFloat32Array(buf: Buffer): Float32Array {
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return new Float32Array(ab);
}

/**
 * Compute exact mathematical Cosine Similarity between two Float32Array vectors
 * Returns float between 0.0 and 1.0
 */
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  const len = a.length;

  for (let i = 0; i < len; i++) {
    const valA = a[i];
    const valB = b[i];
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  // Clamp between 0.0 and 1.0 for engineering ranking
  return Math.max(0, Math.min(similarity, 1.0));
}

