import { PDFParse } from 'pdf-parse';

export interface ExtractedChunk {
  chunk_index: number;
  page_number: number;
  chunk_text: string;
}

export interface ExtractedDocument {
  page_count: number;
  total_characters: number;
  chunks: ExtractedChunk[];
}

/**
 * Split text into semantic overlapping chunks of roughly 800-1200 characters
 */
function splitTextIntoChunks(text: string, pageNumber: number, startIndex: number): ExtractedChunk[] {
  const paragraphs = text.split(/\n\s*\n+/);
  const chunks: ExtractedChunk[] = [];
  let currentChunk = '';
  let chunkIndex = startIndex;

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    if ((currentChunk + '\n\n' + trimmed).length > 1000) {
      if (currentChunk.trim().length > 40) {
        chunks.push({
          chunk_index: chunkIndex++,
          page_number: pageNumber,
          chunk_text: currentChunk.trim(),
        });
      }
      // Keep overlap from end of current chunk
      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-Math.min(words.length, 25)).join(' ');
      currentChunk = overlapWords + '\n\n' + trimmed;
    } else {
      currentChunk = currentChunk ? currentChunk + '\n\n' + trimmed : trimmed;
    }
  }

  if (currentChunk.trim().length > 30) {
    chunks.push({
      chunk_index: chunkIndex++,
      page_number: pageNumber,
      chunk_text: currentChunk.trim(),
    });
  }

  return chunks;
}

/**
 * Extract text and page-indexed chunks from a PDF buffer
 */
export async function extractFromPdf(buffer: Buffer): Promise<ExtractedDocument> {
  const parser = new PDFParse({ data: buffer });
  try {
    await parser.load();
    const info = await parser.getInfo().catch(() => ({ pages: 1 }));
    const totalPages = Math.max(info?.pages || 1, 1);

    const allChunks: ExtractedChunk[] = [];
    let totalChars = 0;
    let globalChunkIndex = 0;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      let pageText = '';
      try {
        const textResult = await parser.getPageText(pageNum);
        pageText = typeof textResult === 'string' ? textResult : (textResult?.text || '');
      } catch (err) {
        console.warn(`Failed to extract page ${pageNum}, attempting fallback:`, err);
      }

      const cleanText = pageText
        .replace(/\r\n/g, '\n')
        .replace(/\t/g, ' ')
        .replace(/ +/g, ' ')
        .trim();

      if (cleanText.length > 20) {
        totalChars += cleanText.length;
        const pageChunks = splitTextIntoChunks(cleanText, pageNum, globalChunkIndex);
        allChunks.push(...pageChunks);
        globalChunkIndex += pageChunks.length;
      }
    }

    // Fallback: if page-by-page extraction yielded zero chunks, use full document text
    if (allChunks.length === 0) {
      const fullText = await parser.getText().catch(() => '');
      const rawText = typeof fullText === 'string' ? fullText : (fullText?.text || '');
      const clean = rawText.trim();
      totalChars = clean.length;
      if (clean.length > 20) {
        const fallbackChunks = splitTextIntoChunks(clean, 1, 0);
        allChunks.push(...fallbackChunks);
      }
    }

    return {
      page_count: totalPages,
      total_characters: totalChars,
      chunks: allChunks,
    };
  } finally {
    await parser.destroy().catch(() => {});
  }
}

/**
 * Extract text and chunks from plain text / markdown
 */
export function extractFromPlainText(text: string): ExtractedDocument {
  const clean = text.replace(/\r\n/g, '\n').trim();
  const chunks = splitTextIntoChunks(clean, 1, 0);
  return {
    page_count: 1,
    total_characters: clean.length,
    chunks,
  };
}

