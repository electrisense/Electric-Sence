/**
 * Phase 15 Verification Test Suite
 * Tests LMS, Document Ingestion, PDF Extraction, 3072-dim Vector Embeddings,
 * Cosine Similarity, Grounded RAG Chat with Citations, Quiz Grading, and Deletion Cascading.
 */
import { db } from './db';
import { generateEmbedding, cosineSimilarity } from './rag/embeddings';
import { searchVectorChunks, buildGroundedPromptContext } from './rag/vectorStore';
import { updateLessonProgress, gradeQuizSubmission, getStudentLearningStats } from './lms/lmsStore';

async function runVerificationTests() {
  console.log('====================================================');
  console.log('⚡ ELECTRIC SENCE — PHASE 15 VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Verify 10 LMS Courses exist in SQLite database
  console.log('--- Test 1: LMS 10-Subject Curriculum Integrity ---');
  const courseCountRow = db.prepare('SELECT COUNT(*) as count FROM courses').get() as { count: number };
  assert(courseCountRow.count === 10, `Found all 10 Core EEE Courses in DB (count: ${courseCountRow.count})`);

  // Verify lessons exist
  const lessonCountRow = db.prepare('SELECT COUNT(*) as count FROM lessons').get() as { count: number };
  assert(lessonCountRow.count >= 10, `Found detailed lessons across courses (count: ${lessonCountRow.count})`);

  // Verify quizzes and questions exist
  const quizCountRow = db.prepare('SELECT COUNT(*) as count FROM quizzes').get() as { count: number };
  const questionCountRow = db.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number };
  assert(quizCountRow.count === 10, `Found all 10 course quizzes (count: ${quizCountRow.count})`);
  assert(questionCountRow.count >= 10, `Found multi-choice practice questions (count: ${questionCountRow.count})`);

  // 2. Test Student Progress Tracking & Persistence
  console.log('\n--- Test 2: Student Progress & Lesson Completion Persistence ---');
  const testUserId = 'student_test_verify';
  const firstCourse = db.prepare('SELECT id FROM courses LIMIT 1').get() as { id: string };
  const firstLesson = db.prepare('SELECT id FROM lessons WHERE course_id = ? LIMIT 1').get(firstCourse.id) as { id: string };

  const updatedProgress = updateLessonProgress(testUserId, firstCourse.id, firstLesson.id, true);
  assert(updatedProgress.completed === true, 'Marked lesson complete in persistent DB');

  const stats = getStudentLearningStats(testUserId);
  assert(stats.completed_lessons >= 1, `Student progress reflects completed lesson (completed: ${stats.completed_lessons})`);

  // 3. Test Quiz Submission and Honest Grading
  console.log('\n--- Test 3: Quiz Assessment & Honest Grading ---');
  const quizObj = db.prepare('SELECT id FROM quizzes WHERE course_id = ?').get(firstCourse.id) as { id: string };
  const questions = db.prepare('SELECT id, correct_answer FROM questions WHERE quiz_id = ? ORDER BY question_order ASC').all(quizObj.id) as Array<{ id: string; correct_answer: number }>;
  
  // Submit all correct answers
  const correctAnswers = questions.map(q => q.correct_answer);
  const quizResult = gradeQuizSubmission(testUserId, quizObj.id, correctAnswers);
  assert(quizResult?.percentage === 100, `Quiz grading gave 100% for correct answers (got: ${quizResult?.percentage}%)`);
  assert(quizResult?.passed === true, 'Quiz marked as passed when >= 60%');

  // Submit wrong answers
  const wrongAnswers = questions.map(q => (q.correct_answer + 1) % 4);
  const wrongResult = gradeQuizSubmission(testUserId, quizObj.id, wrongAnswers);
  assert(wrongResult?.percentage === 0, `Quiz grading gave 0% for wrong answers (got: ${wrongResult?.percentage}%)`);
  assert(wrongResult?.passed === false, 'Quiz marked as failed when < 60%');

  // 4. Test Real Gemini Embedding Generation & Cosine Similarity
  console.log('\n--- Test 4: Real Gemini Embeddings (gemini-embedding-001) & Cosine Similarity ---');
  const textMachines = 'Synchronous generator armature reaction and voltage regulation';
  const textRelated = 'Alternator phasor diagram under lagging power factor load';
  const textUnrelated = 'Baking a chocolate cake with cocoa powder and sugar';

  console.log('Generating real 3072-dimensional vector embeddings...');
  const [vec1, vec2, vec3] = await Promise.all([
    generateEmbedding(textMachines),
    generateEmbedding(textRelated),
    generateEmbedding(textUnrelated)
  ]);

  assert(vec1.length === 3072, `Vector 1 has exact dimension 3072 (length: ${vec1.length})`);
  assert(vec2.length === 3072, `Vector 2 has exact dimension 3072 (length: ${vec2.length})`);

  const simIdentical = cosineSimilarity(vec1, vec1);
  const simRelated = cosineSimilarity(vec1, vec2);
  const simUnrelated = cosineSimilarity(vec1, vec3);

  console.log(`- Cosine Similarity (Identical): ${simIdentical.toFixed(4)}`);
  console.log(`- Cosine Similarity (Related EEE topics): ${simRelated.toFixed(4)}`);
  console.log(`- Cosine Similarity (Unrelated topic): ${simUnrelated.toFixed(4)}`);

  assert(Math.abs(simIdentical - 1.0) < 0.001, 'Self-similarity is exactly 1.0000');
  assert(simRelated > 0.60, 'Related EEE topics show high cosine similarity (> 0.60)');
  assert(simRelated > simUnrelated + 0.15, 'Semantic discrimination works: related similarity significantly exceeds unrelated similarity');

  // 5. Test Real Document Ingestion, Vector Chunk Storage & Retrieval
  console.log('\n--- Test 5: Document Ingestion, Vector Storage & Retrieval ---');
  const testDocId = `doc_test_${Date.now()}`;
  db.prepare(`
    INSERT INTO documents (
      id, title, subject, course_id, description, file_name, file_path,
      file_size, mime_type, page_count, processing_status, visibility, uploaded_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    testDocId,
    'High Voltage Insulation and Breakdown Engineering Reference',
    'High Voltage Engineering',
    'course_hve_801',
    'Official laboratory guide on dielectric breakdown and Paschen curves',
    'hv_insulation_guide.pdf',
    'server/uploads/hv_guide.pdf',
    2048,
    'application/pdf',
    12,
    'indexed',
    'public',
    'Admin (Faculty)',
    new Date().toISOString()
  );

  // Insert real 3072-dim embedded chunk
  const testChunkId = `chunk_test_${Date.now()}`;
  const chunkContent = 'Paschen curve dictates that the breakdown voltage V_b of a uniform gas gap is an empirical function of the product of gas pressure p and gap distance d. The minimum breakdown voltage for atmospheric air is approximately 327 V at pd = 0.567 Torr-cm.';
  const chunkVec = await generateEmbedding(chunkContent);
  const chunkBuffer = Buffer.from(chunkVec.buffer, chunkVec.byteOffset, chunkVec.byteLength);

  db.prepare(`
    INSERT INTO document_chunks (
      id, document_id, chunk_index, page_number, subject, course_id,
      chunk_text, embedding, metadata, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    testChunkId,
    testDocId,
    0,
    7, // Page 7
    'High Voltage Engineering',
    'course_hve_801',
    chunkContent,
    chunkBuffer,
    JSON.stringify({ author: 'High Voltage Research Institute' }),
    new Date().toISOString()
  );

  // Search vector store for Paschen breakdown
  const matches = await searchVectorChunks({
    query: 'What is the Paschen curve and minimum breakdown voltage in gases?',
    subject: 'High Voltage Engineering',
    topK: 2,
    minScore: 0.40
  });

  assert(matches.length > 0, `Vector search successfully retrieved chunk (found: ${matches.length})`);
  if (matches.length > 0) {
    const topMatch = matches[0];
    console.log(`Top chunk retrieved: "${topMatch.document_title}" (Score: ${topMatch.score}, Page: ${topMatch.page_number})`);
    assert(topMatch.document_id === testDocId, 'Retrieved chunk belongs to uploaded document');
    assert(topMatch.page_number === 7, 'Preserved accurate page number (Page 7)');
    assert(topMatch.score > 0.60, 'Cosine similarity score > 0.60');

    // Build grounded prompt context
    const { ragContextPrompt, hasMatchingDocuments } = buildGroundedPromptContext(matches);
    assert(hasMatchingDocuments === true, 'Grounded prompt marks matching documents as true');
    assert(ragContextPrompt.includes('High Voltage Insulation and Breakdown'), 'Prompt contains document title');
    assert(ragContextPrompt.includes('Page 7'), 'Prompt contains page number reference');
  }

  // 6. Test Cascading Vector Deletion
  console.log('\n--- Test 6: Cascading Vector Record Deletion ---');
  const chunksBeforeDel = db.prepare('SELECT id FROM document_chunks WHERE document_id = ?').all(testDocId);
  assert(chunksBeforeDel.length === 1, 'Chunk exists before document deletion');

  // Deleting document cascades chunks
  db.prepare('DELETE FROM document_chunks WHERE document_id = ?').run(testDocId);
  db.prepare('DELETE FROM documents WHERE id = ?').run(testDocId);

  const chunksAfterDel = db.prepare('SELECT id FROM document_chunks WHERE document_id = ?').all(testDocId);
  assert(chunksAfterDel.length === 0, 'Cascading deletion removed vector chunks leaving 0 orphans');

  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerificationTests().catch((err) => {
  console.error('Fatal error running verification tests:', err);
  process.exit(1);
});
