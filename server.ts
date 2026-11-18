import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '2mb' }));

  // 1. Bilingual AI Writing & Speaking Grader Endpoint (EN + VI side-by-side)
  app.post('/api/ai/grade-submission', async (req, res) => {
    try {
      const { skill, promptTitle, promptText, userText, targetBand } = req.body;
      if (!userText || typeof userText !== 'string' || userText.trim().length < 5) {
        return res.status(400).json({
          error: 'Vui lòng nhập bài viết hoặc bản ghi âm câu trả lời (ít nhất 5 ký tự) để AI chấm điểm.',
        });
      }

      const ai = getGenAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Evaluate the following IELTS ${skill === 'speaking' ? 'Speaking' : 'Writing'} response against official IELTS band descriptors. Provide BOTH English and Vietnamese explanations side-by-side.
Prompt Title: ${promptTitle || 'IELTS Task'}
Prompt Details: ${promptText || 'Standard IELTS Academic Task'}
Target Band: ${targetBand || 7.0}
Candidate Response:
"""
${userText.slice(0, 5000)}
"""`,
        config: {
          systemInstruction:
            'You are a Senior Certified Bilingual (English-Vietnamese) IELTS Examiner. Provide rigorous, calibrated Band 0.0-9.0 scores in 0.5 increments across the 4 official criteria. Return both English feedback (examinerSummary, strengths, improvements, modelUpgrade) AND detailed Vietnamese feedback (examinerSummaryVi, strengthsVi, improvementsVi, modelUpgradeVi) explaining grammar/vocabulary errors and how to fix them in clear Vietnamese.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallBand: { type: Type.NUMBER, description: 'Overall IELTS band score from 1.0 to 9.0 in 0.5 steps.' },
              taskResponse: { type: Type.NUMBER, description: 'Task Achievement / Task Response or Fluency & Coherence score.' },
              coherenceCohesion: { type: Type.NUMBER, description: 'Coherence & Cohesion score.' },
              lexicalResource: { type: Type.NUMBER, description: 'Lexical Resource score.' },
              grammaticalRange: { type: Type.NUMBER, description: 'Grammatical Range & Accuracy score.' },
              examinerSummary: { type: Type.STRING, description: '2-3 sentence holistic examiner assessment in English.' },
              examinerSummaryVi: { type: Type.STRING, description: 'Nhận xét tổng quan chi tiết bằng Tiếng Việt (2-3 câu).' },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 specific lexical, structural, or argumentative strengths in English.',
              },
              strengthsVi: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 điểm mạnh cụ thể về từ vựng, cấu trúc câu và lập luận bằng Tiếng Việt.',
              },
              improvements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 concrete sentence-level or structural error corrections in English.',
              },
              improvementsVi: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 lỗi sai cụ thể trong bài kèm cách sửa chi tiết giải thích bằng Tiếng Việt.',
              },
              modelUpgrade: {
                type: Type.STRING,
                description: 'A refined Band 7.5+ rewrite of the candidate response in English.',
              },
              modelUpgradeVi: {
                type: Type.STRING,
                description: 'Bản dịch nghĩa Tiếng Việt của bài mẫu nâng cấp Band 7.5+.',
              },
            },
            required: [
              'overallBand',
              'taskResponse',
              'coherenceCohesion',
              'lexicalResource',
              'grammaticalRange',
              'examinerSummary',
              'examinerSummaryVi',
              'strengths',
              'strengthsVi',
              'improvements',
              'improvementsVi',
              'modelUpgrade',
              'modelUpgradeVi',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('AI Grade Submission Error:', msg);
      return res.status(500).json({ error: msg });
    }
  });

  // 2. Bilingual Dynamic AI News Level Adapter Endpoint
  app.post('/api/ai/adapt-news', async (req, res) => {
    try {
      const { title, sourceText, targetBandLevel, topic } = req.body;
      if (!sourceText || typeof sourceText !== 'string' || sourceText.trim().length < 20) {
        return res.status(400).json({ error: 'Vui lòng nhập nội dung bài báo (ít nhất 20 ký tự) để chuyển đổi cấp độ.' });
      }

      const ai = getGenAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Adapt or rewrite the following English news article specifically for an IELTS learner at pathway level "${targetBandLevel || '5.0-6.0'}" (Topic: ${topic || 'Global Affairs'}), and include full Vietnamese translations and bilingual question explanations.
Original Title: ${title || 'Global Report'}
Original Text:
"""
${sourceText.slice(0, 6000)}
"""`,
        config: {
          systemInstruction:
            'You are a Bilingual English-Vietnamese Academic Editor. Rewrite the article into 3 coherent English paragraphs calibrated to the target IELTS Band level, provide the corresponding 3 Vietnamese translated paragraphs (paragraphsVi), a Vietnamese title (adaptedTitleVi), 6 key vocabulary words with Vietnamese meanings (vietnameseMeaning), and 2 reading comprehension questions with both English (explanation) and Vietnamese (explanationVi) answer explanations.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              adaptedTitle: { type: Type.STRING },
              adaptedTitleVi: { type: Type.STRING },
              cefrBadge: { type: Type.STRING, description: 'A1, A2, B1, B2, or C1' },
              readTimeMinutes: { type: Type.NUMBER },
              paragraphs: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              paragraphsVi: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              keyVocabulary: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    phonetic: { type: Type.STRING },
                    partOfSpeech: { type: Type.STRING },
                    vietnameseMeaning: { type: Type.STRING },
                    definition: { type: Type.STRING },
                    exampleSentence: { type: Type.STRING },
                    exampleTranslationVi: { type: Type.STRING },
                  },
                  required: ['word', 'phonetic', 'partOfSpeech', 'vietnameseMeaning', 'definition', 'exampleSentence', 'exampleTranslationVi'],
                },
              },
              comprehensionQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    questionVi: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                    explanationVi: { type: Type.STRING },
                  },
                  required: ['question', 'questionVi', 'options', 'correctIndex', 'explanation', 'explanationVi'],
                },
              },
            },
            required: [
              'adaptedTitle',
              'adaptedTitleVi',
              'cefrBadge',
              'readTimeMinutes',
              'paragraphs',
              'paragraphsVi',
              'keyVocabulary',
              'comprehensionQuestions',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('AI Adapt News Error:', msg);
      return res.status(500).json({ error: msg });
    }
  });

  // 3. Detailed 4-Skill Placement Evaluation Endpoint (Bilingual)
  app.post('/api/ai/evaluate-placement', async (req, res) => {
    try {
      const { listeningScore, readingScore, writingText, speakingTranscript } = req.body;
      const ai = getGenAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Evaluate a new student's 4-Skill IELTS Diagnostic Placement Test:
- Objective Listening Score: ${listeningScore ?? 5.5} / 9.0
- Adaptive Reading Score: ${readingScore ?? 5.5} / 9.0
- Diagnostic Writing Sample (~50 words): "${(writingText || 'No sample provided').slice(0, 1500)}"
- Diagnostic Speaking Part 1 Response: "${(speakingTranscript || 'No sample provided').slice(0, 1500)}"`,
        config: {
          systemInstruction:
            'You are an IELTS Director of Studies. Score the student writing and speaking samples on the 0.0-9.0 IELTS scale, compute their recommended pathway ("0-3.5", "3.5-5.0", "5.0-6.0", or "6.0-7.0+"), and provide a concise bilingual English + Vietnamese diagnostic rationale.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              writingBand: { type: Type.NUMBER },
              speakingBand: { type: Type.NUMBER },
              overallBand: { type: Type.NUMBER },
              recommendedPathway: {
                type: Type.STRING,
                description: 'Must be one of: "0-3.5", "3.5-5.0", "5.0-6.0", "6.0-7.0+"',
              },
              prioritySkill: {
                type: Type.STRING,
                description: 'Must be one of: "listening", "reading", "writing", "speaking"',
              },
              diagnosticSummary: { type: Type.STRING },
            },
            required: ['writingBand', 'speakingBand', 'overallBand', 'recommendedPathway', 'prioritySkill', 'diagnosticSummary'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('AI Placement Evaluation Error:', msg);
      return res.status(500).json({ error: msg });
    }
  });

  // 4. AI Custom Video Transcript & Fill-in-the-Blank Cloze Generator Endpoint
  app.post('/api/ai/generate-video-cloze', async (req, res) => {
    try {
      const { title, category, rawTranscriptOrTopic } = req.body;
      const ai = getGenAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Create 4 engaging synchronized English-Vietnamese video shadowing & fill-in-the-blank sentences for a video titled "${title || 'English Scene'}" in category "${category || 'Anime'}".
User input transcript or topic description:
"""
${(rawTranscriptOrTopic || 'An inspiring dialogue about perseverance, friendship, and chasing dreams.').slice(0, 3000)}
"""`,
        config: {
          systemInstruction:
            'You are a Bilingual English-Vietnamese Media Coach. Generate 4 natural spoken sentences (each 8-16 words long). For each sentence, choose 1 important keyword in the sentence as "clozeWord" (must appear verbatim as a word inside "text"), provide its Vietnamese meaning in "clozeHintVi", provide the full Vietnamese sentence translation in "translationVi", phonetic transcription of key phrase in "phoneticFocus", English & Vietnamese pronunciation tips, and bilingual explanation of the cloze word ("clozeExplanationEn" and "clozeExplanationVi").',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              titleVi: { type: Type.STRING },
              speakerName: { type: Type.STRING },
              sentences: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    speaker: { type: Type.STRING },
                    text: { type: Type.STRING, description: 'Full English sentence containing the exact clozeWord.' },
                    translationVi: { type: Type.STRING, description: 'Full Vietnamese translation of the sentence.' },
                    phoneticFocus: { type: Type.STRING },
                    stressTip: { type: Type.STRING },
                    stressTipVi: { type: Type.STRING },
                    clozeWord: { type: Type.STRING, description: 'A single word from "text" to be blanked out in Fill-in-the-Blank mode.' },
                    clozeHintVi: { type: Type.STRING, description: 'Vietnamese meaning hint for the clozeWord.' },
                    clozeExplanationEn: { type: Type.STRING },
                    clozeExplanationVi: { type: Type.STRING },
                  },
                  required: [
                    'speaker',
                    'text',
                    'translationVi',
                    'phoneticFocus',
                    'stressTip',
                    'stressTipVi',
                    'clozeWord',
                    'clozeHintVi',
                    'clozeExplanationEn',
                    'clozeExplanationVi',
                  ],
                },
              },
            },
            required: ['titleVi', 'speakerName', 'sentences'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('AI Generate Video Cloze Error:', msg);
      return res.status(500).json({ error: msg });
    }
  });

  // 5. AI CEFR Vocabulary Batch Generator Endpoint (A1 - C1 Bilingual Lexicon Expansion)
  app.post('/api/ai/generate-vocab-batch', async (req, res) => {
    try {
      const { cefrLevel, topic, count } = req.body;
      const targetCefr = cefrLevel && cefrLevel !== 'ALL' ? cefrLevel : 'B2';
      const targetTopic = topic && topic !== 'ALL' ? topic : 'Education';
      const batchSize = Math.min(12, Math.max(4, Number(count) || 8));

      const ai = getGenAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Generate ${batchSize} high-utility academic English vocabulary words specifically calibrated for CEFR level "${targetCefr}" in the IELTS topic "${targetTopic}". Provide accurate IPA phonetics, Vietnamese academic translation, clear English definition, bilingual example sentence (English + Vietnamese), and 2 academic collocations for each word.`,
        config: {
          systemInstruction:
            'You are a Senior Bilingual (English-Vietnamese) Lexicographer for Cambridge & IELTS Academic. Return distinct, authentic CEFR-graded headwords with natural Vietnamese meanings and IELTS Task 2 / Speaking Part 3 example sentences.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              words: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    phonetic: { type: Type.STRING },
                    partOfSpeech: { type: Type.STRING },
                    vietnameseMeaning: { type: Type.STRING },
                    definition: { type: Type.STRING },
                    exampleSentence: { type: Type.STRING },
                    exampleTranslationVi: { type: Type.STRING },
                    collocations: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: [
                    'word',
                    'phonetic',
                    'partOfSpeech',
                    'vietnameseMeaning',
                    'definition',
                    'exampleSentence',
                    'exampleTranslationVi',
                    'collocations',
                  ],
                },
              },
            },
            required: ['words'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('AI Generate Vocab Batch Error:', msg);
      return res.status(500).json({ error: msg });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScholarBand server listening on http://localhost:${PORT}`);
  });
}

startServer();
