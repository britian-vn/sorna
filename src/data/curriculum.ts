import {
  BandPathwayTrack,
  VocabGrammarLesson,
  SrsCardData,
  SrsRecallRating,
  MasteryLevel,
  ListeningReadingTest,
  WritingPromptItem,
  SpeakingCueCard,
  NewsArticleItem,
  ShadowingVideoLesson,
  AcademicBadge,
  PeerSubmissionData,
  QuizQuestion,
} from '../types';

export const HERO_LIBRARY_IMAGE = '/src/assets/images/hero_oxford_library_1794990559559.jpg';
export const NEWS_CLIMATE_IMAGE = '/src/assets/images/news_climate_summit_1794990558585.jpg';
export const SHADOWING_LECTURE_IMAGE = '/src/assets/images/shadowing_academic_lecture_1794990561337.jpg';

// Parse any YouTube URL or ID into a clean 11-char YouTube Video ID
export function extractYoutubeId(input: string): string | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const regExp =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = trimmed.match(regExp);
  return match ? match[1] : undefined;
}

// Web Speech API Pronunciation Helper
export function speakText(text: string, rate = 1.0, pitch = 1.0) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-GB';
  utterance.rate = rate;
  utterance.pitch = pitch;
  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find((v) => v.lang.includes('en-GB') && v.name.toLowerCase().includes('natural')) ||
    voices.find((v) => v.lang.includes('en-GB')) ||
    voices.find((v) => v.lang.startsWith('en'));
  if (preferred) utterance.voice = preferred;
  window.speechSynthesis.speak(utterance);
}

// SM-2 Spaced Repetition Algorithm
export function calculateSm2(
  card: SrsCardData,
  rating: SrsRecallRating
): SrsCardData {
  let { repetitions, easeFactor, intervalDays } = card;
  const now = new Date();

  if (rating === 'Again') {
    repetitions = 0;
    intervalDays = 0;
    easeFactor = Math.max(1.3, Number((easeFactor - 0.2).toFixed(2)));
  } else if (rating === 'Hard') {
    repetitions = Math.max(1, repetitions);
    intervalDays = intervalDays === 0 ? 1 : Math.max(1, Math.round(intervalDays * 1.2));
    easeFactor = Math.max(1.3, Number((easeFactor - 0.15).toFixed(2)));
  } else if (rating === 'Good') {
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 3;
    else intervalDays = Math.max(4, Math.round(intervalDays * easeFactor));
  } else if (rating === 'Easy') {
    repetitions += 1;
    if (repetitions === 1) intervalDays = 4;
    else if (repetitions === 2) intervalDays = 7;
    else intervalDays = Math.max(8, Math.round(intervalDays * easeFactor * 1.3));
    easeFactor = Math.min(3.5, Number((easeFactor + 0.15).toFixed(2)));
  }

  let masteryLevel: MasteryLevel = 'Learning';
  if (repetitions === 0 && rating === 'Again') {
    masteryLevel = 'Learning';
  } else if (intervalDays >= 14 || repetitions >= 4) {
    masteryLevel = 'Mastered';
  } else if (intervalDays >= 3 || repetitions >= 2) {
    masteryLevel = 'Reviewing';
  } else {
    masteryLevel = 'Learning';
  }

  const nextReview = new Date(now);
  if (intervalDays === 0) {
    nextReview.setMinutes(nextReview.getMinutes() + 10);
  } else {
    nextReview.setDate(nextReview.getDate() + intervalDays);
  }

  return {
    ...card,
    repetitions,
    easeFactor,
    intervalDays,
    masteryLevel,
    lastReviewedAt: now.toISOString(),
    nextReviewAt: nextReview.toISOString(),
  };
}

// 1. IELTS Band Pathways (4 Progressive Levels - Bilingual EN & VI)
export const BAND_PATHWAYS: BandPathwayTrack[] = [
  {
    id: '0-3.5',
    name: 'Band 0 – 3.5 · Foundation',
    nameVi: 'Band 0 – 3.5 · Nền tảng (Foundation)',
    subtitle: 'Core Survival Lexicon, Phonetic Literacy & Clause Mechanics',
    subtitleVi: 'Từ vựng cốt lõi, Phiên âm IPA & Cấu trúc câu đơn chuẩn xác',
    cefrEquivalent: 'CEFR A1 – A2',
    description:
      'Build essential English sentence structure, core 800 high-frequency words, everyday listening decoding, and foundational paragraph construction.',
    descriptionVi:
      'Xây dựng gốc ngữ pháp câu đơn (S-V-O), nắm vững 800 từ vựng thông dụng nhất, luyện nghe bắt từ khóa cơ bản và viết đoạn văn ngắn không sai lỗi chia động từ.',
    dailyGoalText: '25 mins/day · 10 SRS flashcards · 1 foundational grammar drill',
    dailyGoalTextVi: '25 phút/ngày · 10 thẻ từ vựng SRS · 1 bài ngữ pháp nền tảng',
    milestones: [
      {
        id: 'm_f1',
        title: 'Master Present, Past & Future Core Tenses',
        titleVi: 'Làm chủ các thì Hiện tại, Quá khứ & Tương lai cơ bản',
        description: 'Construct accurate SVO declarative and interrogative sentences without subject-verb agreement errors.',
        descriptionVi: 'Viết đúng câu khẳng định và câu hỏi theo cấu trúc Chủ ngữ + Động từ + Tân ngữ, không sai lỗi chia động từ số ít/số nhiều.',
        skillFocus: 'writing',
        dailyGoalMinutes: 15,
        targetModule: 'vocab-grammar',
      },
      {
        id: 'm_f2',
        title: 'Decode Numbers, Dates, Postcodes & Campus Dialogues',
        titleVi: 'Nghe bắt chuẩn Số đếm, Ngày tháng, Mã bưu điện & Hội thoại trường học',
        description: 'Complete IELTS Listening Section 1 form-completion tasks with 85%+ accuracy on spelled names and telephone sequences.',
        descriptionVi: 'Hoàn thành dạng bài điền biểu mẫu IELTS Listening Part 1 đạt độ chính xác trên 85% với tên đánh vần và số điện thoại.',
        skillFocus: 'listening',
        dailyGoalMinutes: 15,
        targetModule: 'skills-lab',
      },
      {
        id: 'm_f3',
        title: 'Acquire 150 A1–A2 Daily Life & Education Headwords',
        titleVi: 'Thuộc lòng 150 từ vựng A1–A2 chủ đề Giáo dục & Đời sống',
        description: 'Reach Reviewing or Mastered status on core Education and Health vocabulary cards in your SRS deck.',
        descriptionVi: 'Đưa các thẻ từ vựng chủ đề Giáo dục và Sức khỏe lên cấp độ Đang ôn (Reviewing) hoặc Đã thuộc lòng (Mastered) trong bộ thẻ SRS.',
        skillFocus: 'reading',
        dailyGoalMinutes: 10,
        targetModule: 'srs-deck',
      },
      {
        id: 'm_f4',
        title: 'Deliver 45-Second Part 1 Personal Introductions',
        titleVi: 'Trả lời trôi chảy 45 giây cho câu hỏi Speaking Part 1',
        description: 'Record fluent responses about hometown, work/studies, and daily routine using basic linking words (because, however, also).',
        descriptionVi: 'Thu âm câu trả lời về quê hương, học tập và thói quen hàng ngày có sử dụng từ nối (because, however, also).',
        skillFocus: 'speaking',
        dailyGoalMinutes: 15,
        targetModule: 'skills-lab',
      },
    ],
  },
  {
    id: '3.5-5.0',
    name: 'Band 3.5 – 5.0 · Elementary',
    nameVi: 'Band 3.5 – 5.0 · Sơ trung cấp (Elementary)',
    subtitle: 'Subordinate Clauses, Skimming/Scanning & Task 1 Overview',
    subtitleVi: 'Mệnh đề phụ thuộc, Kỹ năng đọc lướt Skimming/Scanning & Tổng quan Task 1',
    cefrEquivalent: 'CEFR A2+ – B1',
    description:
      'Transition from isolated simple sentences to connected multi-paragraph discourse, mastering skimming/scanning for Reading and structured Task 1 overviews.',
    descriptionVi:
      'Chuyển từ câu đơn rời rạc sang câu ghép và câu phức có mệnh đề quan hệ; nắm vững kỹ thuật đọc lướt tìm ý chính (Skimming) và dò từ khóa (Scanning).',
    dailyGoalText: '35 mins/day · 15 SRS flashcards · 1 graded news article + 1 skill task',
    dailyGoalTextVi: '35 phút/ngày · 15 thẻ SRS · 1 bài báo song ngữ + 1 bài luyện kỹ năng',
    milestones: [
      {
        id: 'm_e1',
        title: 'Deploy Complex Subordinate & Relative Clauses',
        titleVi: 'Sử dụng thành thạo Mệnh đề nhượng bộ & Mệnh đề quan hệ',
        description: 'Combine ideas using although, whereas, provided that, and non-defining relative clauses in Writing Task 2.',
        descriptionVi: 'Kết nối ý bằng although, despite, whereas, provided that và mệnh đề quan hệ (which, who) trong bài viết Writing Task 2.',
        skillFocus: 'writing',
        dailyGoalMinutes: 20,
        targetModule: 'vocab-grammar',
      },
      {
        id: 'm_e2',
        title: 'Master Skimming & Scanning for True/False/Not Given',
        titleVi: 'Xử lý gọn dạng bài Đúng / Sai / Không đề cập (True/False/Not Given)',
        description: 'Distinguish factual contradiction (False) from absent evidence (Not Given) under timed conditions.',
        descriptionVi: 'Phân biệt chính xác thông tin trái ngược hoàn toàn (False) với thông tin không có trong bài (Not Given).',
        skillFocus: 'reading',
        dailyGoalMinutes: 20,
        targetModule: 'skills-lab',
      },
      {
        id: 'm_e3',
        title: 'Shadow & Fill Blanks in 3 Animation / Movie Video Clips',
        titleVi: 'Luyện nói nhại (Shadowing) & Nghe điền từ 3 video Hoạt hình / Phim',
        description: 'Match native speaker rhythm, weak forms, and sentence stress in the Video Shadowing Studio.',
        descriptionVi: 'Bắt chước ngữ điệu, âm yếu (weak forms) và hoàn thành bài tập nghe điền từ vào chỗ trống trong Phòng luyện Video.',
        skillFocus: 'listening',
        dailyGoalMinutes: 15,
        targetModule: 'shadowing',
      },
      {
        id: 'm_e4',
        title: 'Structure a 2-Minute Speaking Part 2 Long Turn',
        titleVi: 'Lập dàn ý 1 phút & Nói liên tục 2 phút cho Speaking Part 2',
        description: 'Use the 1-minute preparation timer to map 4 cue prompts and speak continuously for 120 seconds.',
        descriptionVi: 'Tận dụng 1 phút chuẩn bị để vạch 4 ý chính trên Cue Card và nói mạch lạc suốt 120 giây.',
        skillFocus: 'speaking',
        dailyGoalMinutes: 15,
        targetModule: 'skills-lab',
      },
    ],
  },
  {
    id: '5.0-6.0',
    name: 'Band 5.0 – 6.0 · Intermediate',
    nameVi: 'Band 5.0 – 6.0 · Trung cấp (Intermediate)',
    subtitle: 'Academic Collocations, Cohesive Devices & Argument Synthesis',
    subtitleVi: 'Cụm từ cố định (Collocations), Từ nối mạch lạc & Lập luận PEEL',
    cefrEquivalent: 'CEFR B1+ – B2',
    description:
      'Eliminate repetitive phrasing, master Task 1 comparative data synthesis, handle multiple-speaker Listening Section 3 tutorials, and build cohesive 250-word essays.',
    descriptionVi:
      'Loại bỏ lỗi lặp từ nhờ paraphrase và collocations học thuật; xử lý tốt bài nghe thảo luận nhiều người ở Part 3 và viết bài luận 250 từ chặt chẽ.',
    dailyGoalText: '45 mins/day · 20 SRS flashcards · 1 AI-graded essay or speaking test',
    dailyGoalTextVi: '45 phút/ngày · 20 thẻ SRS · 1 bài viết hoặc nói chấm chữa lỗi bằng AI',
    milestones: [
      {
        id: 'm_i1',
        title: 'Write Band 6.5+ Task 2 Essays with PEEL Paragraphs',
        titleVi: 'Viết đoạn văn thân bài Task 2 chuẩn cấu trúc PEEL đạt Band 6.5+',
        description: 'Structure Point–Explanation–Evidence–Link body paragraphs evaluated by the AI Examiner.',
        descriptionVi: 'Triển khai đoạn văn theo công thức Luận điểm (Point) – Giải thích (Explanation) – Ví dụ (Evidence) – Liên kết (Link) và chấm bằng AI.',
        skillFocus: 'writing',
        dailyGoalMinutes: 25,
        targetModule: 'skills-lab',
      },
      {
        id: 'm_i2',
        title: 'Track Distractors & Attitude Shifts in Section 3 Tutorials',
        titleVi: 'Nhận diện bẫy đổi ý (Distractors) trong bài nghe thảo luận Part 3',
        description: 'Identify when academic speakers revise or hedge an opinion mid-conversation.',
        descriptionVi: 'Nhận biết các từ báo hiệu sự thay đổi ý kiến (however, actually, on second thoughts) trong hội thoại học thuật.',
        skillFocus: 'listening',
        dailyGoalMinutes: 20,
        targetModule: 'skills-lab',
      },
      {
        id: 'm_i3',
        title: 'Read & Annotate 5 B2 Graded News Articles',
        titleVi: 'Đọc hiểu & Tra từ trực tiếp trên 5 bài báo tiếng Anh cấp độ B2',
        description: 'Extract collocations from Environment and Technology journalism directly into your SRS Flashcard Deck.',
        descriptionVi: 'Click tra nghĩa tiếng Việt và lưu các cụm từ chủ đề Môi trường & Công nghệ từ Báo tiếng Anh vào bộ thẻ SRS.',
        skillFocus: 'reading',
        dailyGoalMinutes: 20,
        targetModule: 'news-reader',
      },
      {
        id: 'm_i4',
        title: 'Complete 2 Anonymous Community Peer Reviews',
        titleVi: 'Tham gia chấm chéo 2 bài viết trong Cộng đồng Peer Review',
        description: 'Critique fellow learners’ essays using the 4 official IELTS criteria to sharpen your own self-editing.',
        descriptionVi: 'Đánh giá bài làm ẩn danh của học viên khác theo 4 tiêu chí IELTS để rèn kỹ năng tự phát hiện lỗi.',
        skillFocus: 'writing',
        dailyGoalMinutes: 15,
        targetModule: 'skills-lab',
      },
    ],
  },
  {
    id: '6.0-7.0+',
    name: 'Band 6.0 – 7.0+ · Upper-Intermediate / Advanced',
    nameVi: 'Band 6.0 – 7.0+ · Cận cao cấp & Nâng cao (Advanced)',
    subtitle: 'C1 Lexical Precision, Nominalization, Inversion & Nuanced Rhetoric',
    subtitleVi: 'Từ vựng C1 sắc bén, Danh từ hóa (Nominalization) & Đảo ngữ học thuật',
    cefrEquivalent: 'CEFR B2+ – C1',
    description:
      'Achieve university-level academic sophistication through nominalization, cleft sentences, C1 idiomatic precision, and unhesitating Part 3 abstract argumentation.',
    descriptionVi:
      'Chinh phục văn phong học thuật bậc đại học thông qua kỹ thuật danh từ hóa, câu đảo ngữ, câu chẻ và lập luận phản biện sâu sắc cho Speaking Part 3.',
    dailyGoalText: '60 mins/day · 25 SRS flashcards · Full timed 4-skill simulation + AI critique',
    dailyGoalTextVi: '60 phút/ngày · 25 thẻ SRS · Luyện đề 4 kỹ năng bấm giờ & chữa chi tiết cùng AI',
    milestones: [
      {
        id: 'm_a1',
        title: 'Master Academic Nominalization & Negative Inversion',
        titleVi: 'Làm chủ kỹ thuật Danh từ hóa & Đảo ngữ nhấn mạnh C1',
        description: 'Deploy structures such as "Not only does rapid urbanization strain infrastructure..." and dense noun phrases.',
        descriptionVi: 'Áp dụng nhuần nhuyễn đảo ngữ ("Not only does...", "Seldom have...") và cụm danh từ học thuật vào bài luận.',
        skillFocus: 'writing',
        dailyGoalMinutes: 25,
        targetModule: 'vocab-grammar',
      },
      {
        id: 'm_a2',
        title: 'Achieve Band 7.5+ on Timed Academic Reading Passages',
        titleVi: 'Đạt Band 7.5+ bài Đọc học thuật bấm giờ',
        description: 'Solve Matching Headings and Summary Completion questions with zero lexical trap errors.',
        descriptionVi: 'Giải quyết chính xác dạng bài Nối tiêu đề (Matching Headings) và Điền tóm tắt mà không mắc bẫy từ đồng nghĩa.',
        skillFocus: 'reading',
        dailyGoalMinutes: 25,
        targetModule: 'skills-lab',
      },
      {
        id: 'm_a3',
        title: 'Deliver Speculative Part 3 Abstract Discussions',
        titleVi: 'Phản biện sắc sảo các câu hỏi trừu tượng Speaking Part 3',
        description: 'Use epistemic modality (bound to, arguably, ostensibly) to evaluate long-term societal implications.',
        descriptionVi: 'Sử dụng ngôn ngữ khách quan học thuật (arguably, ostensibly, bound to) để phân tích tác động xã hội dài hạn.',
        skillFocus: 'speaking',
        dailyGoalMinutes: 20,
        targetModule: 'skills-lab',
      },
      {
        id: 'm_a4',
        title: 'Adapt & Master C1 Economist/Nature-Style News Reports',
        titleVi: 'Chuyển đổi & Làm chủ các bài báo học thuật C1 kèm 25 thẻ từ Mastered',
        description: 'Use the AI News Adapter at Band 6.0–7.0+ and move 25 C1 headwords into the "Mastered" SRS tier.',
        descriptionVi: 'Sử dụng AI News Adapter ở mức Band 6.0–7.0+ và đưa 25 từ vựng C1 lên cấp độ Đã thuộc lòng (Mastered).',
        skillFocus: 'reading',
        dailyGoalMinutes: 20,
        targetModule: 'news-reader',
      },
    ],
  },
];

// 2. Vocabulary & Grammar Hub (CEFR A1 - C1 with Vietnamese Theory, Translations & Bilingual Quiz Correction)
export const VOCAB_GRAMMAR_LESSONS: VocabGrammarLesson[] = [
  {
    id: 'vg_a1_edu',
    title: 'Academic Campus & Daily Study Routines',
    titleVi: 'Từ vựng Trường Đại học & Thói quen Học tập Hàng ngày ( kèm Thì Hiện tại đơn)',
    category: 'Vocabulary',
    cefrLevel: 'A1',
    topic: 'Education',
    summary: 'Essential foundational vocabulary for describing university facilities, timetables, and student obligations in Speaking Part 1 and Listening Section 1.',
    summaryVi: 'Tổng hợp từ vựng nền tảng mô tả chương trình học, môn học bắt buộc, học phí và cách dùng Thì Hiện tại đơn với trạng từ chỉ tần suất trong IELTS Speaking Part 1.',
    grammarRuleOrNote: 'Use the Present Simple with frequency adverbs (always, usually, seldom) placed before the main verb but after the auxiliary "be".',
    grammarTheoryVi: `📚 GIẢNG GIẢI LÝ THUYẾT NGỮ PHÁP (TIẾNG VIỆT):
1. Công thức Thì Hiện tại đơn (Present Simple) diễn tả thói quen học tập hoặc sự thật hiển nhiên:
   • Với động từ thường: S + (always / usually / often / seldom) + V(s/es) + O.
   • Với động từ Tobe: S + am/is/are + (always / usually / often) + Cụm tính từ / Danh từ.
2. Quy tắc vị trí Trạng từ chỉ tần suất (Rất hay sai trong Speaking Part 1):
   • Đứng TRƯỚC động từ thường: "I usually study in the library." (KHÔNG nói "I study usually...").
   • Đứng SAU động từ tobe: "First-year lectures are always compulsory."
3. Mẹo ăn điểm IELTS: Thay vì chỉ nói "I study mandatory subjects", hãy nâng cấp thành "I take compulsory modules in my undergraduate curriculum."`,
    words: [
      {
        word: 'curriculum',
        phonetic: '/kəˈrɪkjələm/',
        partOfSpeech: 'noun (danh từ)',
        vietnameseMeaning: 'chương trình giảng dạy, khung chương trình học',
        definition: 'The subjects comprising a course of study in a school or college.',
        exampleSentence: 'The university updated its undergraduate curriculum to include digital literacy.',
        exampleTranslationVi: 'Trường đại học đã cập nhật chương trình giảng dạy bậc cử nhân để đưa thêm môn kỹ năng số vào.',
        collocations: ['national curriculum (chương trình quốc gia)', 'design a curriculum (thiết kế chương trình)', 'core curriculum (chương trình cốt lõi)'],
      },
      {
        word: 'compulsory',
        phonetic: '/kəmˈpʌlsəri/',
        partOfSpeech: 'adjective (tính từ)',
        vietnameseMeaning: 'bắt buộc (theo quy định hoặc luật pháp)',
        definition: 'Required by law or a rule; obligatory.',
        exampleSentence: 'Mathematics and English are compulsory subjects for all first-year students.',
        exampleTranslationVi: 'Toán học và Tiếng Anh là các môn học bắt buộc đối với tất cả sinh viên năm nhất.',
        collocations: ['compulsory education (giáo dục bắt buộc)', 'compulsory attendance (điểm danh bắt buộc)', 'compulsory module (học phần bắt buộc)'],
      },
      {
        word: 'tuition',
        phonetic: '/tjuˈɪʃən/',
        partOfSpeech: 'noun (danh từ không đếm được)',
        vietnameseMeaning: 'học phí (tuition fees) / sự giảng dạy',
        definition: 'Teaching or instruction, especially of individuals or small groups, or the fee charged for it.',
        exampleSentence: 'Rising tuition fees have prompted many applicants to seek academic scholarships.',
        exampleTranslationVi: 'Học phí ngày càng tăng đã thúc đẩy nhiều thí sinh tìm kiếm các suất học bổng học thuật.',
        collocations: ['tuition fees (tiền học phí)', 'private tuition (học kèm gia sư)', 'annual tuition (học phí hàng năm)'],
      },
    ],
    quiz: [
      {
        id: 'q_a1_1',
        question: 'Which word best completes the sentence: "Attendance at the laboratory safety briefing is ________ for all new chemistry students."',
        questionVi: 'Chọn từ phù hợp nhất để điền vào câu: "Việc tham dự buổi phổ biến an toàn phòng thí nghiệm là ________ đối với tất cả sinh viên hóa học mới."',
        options: ['compulsory (bắt buộc)', 'temporary (tạm thời)', 'optional (tự chọn)', 'fragile (dễ vỡ)'],
        correctIndex: 0,
        explanation: '"Compulsory" means mandatory or required by institutional rules.',
        explanationVi: 'Đáp án đúng là "compulsory" (bắt buộc). An toàn phòng thí nghiệm là quy định bắt buộc cho mọi sinh viên mới, không phải "temporary" (tạm thời), "optional" (tự chọn) hay "fragile" (mỏng manh, dễ vỡ).',
      },
      {
        id: 'q_a1_2',
        question: 'Choose the grammatically correct sentence for IELTS Speaking Part 1:',
        questionVi: 'Chọn câu đúng ngữ pháp nhất khi trả lời IELTS Speaking Part 1 về thói quen học tập:',
        options: [
          'I am usually studying in the library after lectures.',
          'I usually study in the central library after my morning lectures.',
          'Usually I am study in library after lecture.',
          'I study usually in the library yesterday.',
        ],
        correctIndex: 1,
        explanation: 'Habitual routines in the present require the Present Simple ("I usually study"), with the frequency adverb before the main verb.',
        explanationVi: 'Đáp án đúng là câu 2: Thói quen lặp đi lặp lại ở hiện tại phải dùng Thì Hiện tại đơn ("study") và trạng từ tần suất "usually" phải đứng TRƯỚC động từ thường ("I usually study"). Câu 1 dùng sai thì tiếp diễn; câu 3 thừa "am"; câu 4 đặt sai vị trí "usually" và mâu thuẫn với "yesterday".',
      },
    ],
  },
  {
    id: 'vg_a2_health',
    title: 'Preventive Healthcare & Sedentary Lifestyles',
    titleVi: 'Chăm sóc Sức khỏe Dự phòng & Lối sống Ít vận động (Danh từ Đếm được vs Không đếm được)',
    category: 'Vocabulary',
    cefrLevel: 'A2',
    topic: 'Health',
    summary: 'Core lexicon for discussing diet, physical activity, and public health initiatives in Writing Task 2 and Speaking Part 2.',
    summaryVi: 'Từ vựng cốt lõi về chế độ dinh dưỡng, lối sống ngồi nhiều ít vận động và quy tắc Danh từ không đếm được thường gây mất điểm trong IELTS Writing.',
    grammarRuleOrNote: 'Countable vs. Uncountable Nouns: Words like "information", "advice", "equipment", and "research" are uncountable and never take a plural "-s" or "many".',
    grammarTheoryVi: `📚 GIẢNG GIẢI LÝ THUYẾT NGỮ PHÁP (TIẾNG VIỆT):
1. Danh từ Không đếm được (Uncountable Nouns) trong Tiếng Anh Học thuật:
   • Các từ cực kỳ phổ biến trong IELTS như: research (nghiên cứu), information (thông tin), advice (lời khuyên), equipment (trang thiết bị), knowledge (kiến thức), evidence (bằng chứng) là DANH TỪ KHÔNG ĐẾM ĐƯỢC.
2. Ba quy tắc sống còn cần nhớ:
   • TUYỆT ĐỐI KHÔNG thêm "-s/es" vào sau các từ này (Sai: "medical researches", "equipments", "advices").
   • Động từ theo sau LUÔN chia ở ngôi số ít: "Recent medical research shows that..." (KHÔNG viết "show").
   • Không dùng "a/an" hoặc "many/few" trực tiếp trước chúng; hãy dùng "much / a great deal of / a piece of advice / a body of research".`,
    words: [
      {
        word: 'sedentary',
        phonetic: '/ˈsedəntəri/',
        partOfSpeech: 'adjective (tính từ)',
        vietnameseMeaning: 'ít vận động, ngồi nhiều một chỗ',
        definition: 'Tending to spend much time seated; somewhat inactive.',
        exampleSentence: 'A sedentary office lifestyle significantly increases the risk of cardiovascular disease.',
        exampleTranslationVi: 'Lối sống văn phòng ngồi nhiều ít vận động làm tăng đáng kể nguy cơ mắc bệnh tim mạch.',
        collocations: ['sedentary lifestyle (lối sống ít vận động)', 'sedentary occupation (nghề nghiệp ngồi nhiều)', 'lead a sedentary life (sống ít vận động)'],
      },
      {
        word: 'nutritious',
        phonetic: '/njuˈtrɪʃəs/',
        partOfSpeech: 'adjective (tính từ)',
        vietnameseMeaning: 'giàu dinh dưỡng, bổ dưỡng',
        definition: 'Efficient as food; nourishing and rich in essential vitamins.',
        exampleSentence: 'Schools should provide nutritious meals rather than processed snacks.',
        exampleTranslationVi: 'Trường học nên cung cấp các bữa ăn giàu dinh dưỡng thay vì đồ ăn vặt chế biến sẵn.',
        collocations: ['nutritious diet (chế độ ăn bổ dưỡng)', 'highly nutritious (cực kỳ giàu dinh dưỡng)', 'nutritious ingredients (nguyên liệu bổ dưỡng)'],
      },
      {
        word: 'remedy',
        phonetic: '/ˈremədi/',
        partOfSpeech: 'noun / verb (danh từ / động từ)',
        vietnameseMeaning: 'phương thuốc, biện pháp khắc phục',
        definition: 'A medicine, treatment, or solution that counteracts a disease or problem.',
        exampleSentence: 'Regular brisk walking is an effective remedy for mild work-related stress.',
        exampleTranslationVi: 'Đi bộ nhanh thường xuyên là một phương pháp khắc phục hiệu quả đối với chứng căng thẳng nhẹ do công việc.',
        collocations: ['natural remedy (liệu pháp tự nhiên)', 'effective remedy (biện pháp hữu hiệu)', 'remedy a problem (khắc phục vấn đề)'],
      },
    ],
    quiz: [
      {
        id: 'q_a2_1',
        question: 'Identify the grammatical error in: "Recent medical researches show that a sedentary lifestyle harms metabolism."',
        questionVi: 'Tìm lỗi sai ngữ pháp trong câu: "Recent medical researches show that a sedentary lifestyle harms metabolism."',
        options: [
          '"Sedentary" should be an adverb.',
          '"Researches" is uncountable; it must be "Recent medical research shows...".',
          '"Harms" should be "harming".',
          'There is no error in the sentence.',
        ],
        correctIndex: 1,
        explanation: '"Research" is an uncountable noun in academic English and takes a singular verb ("research shows").',
        explanationVi: 'Lỗi sai nằm ở "researches show": Trong tiếng Anh học thuật, "research" là danh từ KHÔNG đếm được nên không bao giờ thêm "es", và động từ theo sau phải chia số ít thành "Recent medical research shows...".',
      },
    ],
  },
  {
    id: 'vg_b1_grammar',
    title: 'Subordinate Contrast & Concession Clauses',
    titleVi: 'Ngữ pháp Mệnh đề Nhượng bộ & Tương phản (Although / Despite / Whereas)',
    category: 'Grammar',
    cefrLevel: 'B1',
    topic: 'Society',
    summary: 'Master "although", "despite", "in spite of", and "whereas" to balance opposing arguments seamlessly in IELTS Writing Task 2.',
    summaryVi: 'Nắm vững cấu trúc Although, Despite / In spite of, Albeit và Whereas để lập luận 2 chiều sắc bén trong IELTS Writing Task 2 mà không mắc lỗi thừa từ "but".',
    grammarRuleOrNote: '"Although / Even though" must be followed by a full clause (Subject + Verb). "Despite / In spite of" must be followed by a Noun Phrase, Gerund (-ing), or "the fact that + clause". Never write "Despite + Subject + Verb" or "Although... but...".',
    grammarTheoryVi: `📚 GIẢNG GIẢI LÝ THUYẾT NGỮ PHÁP (TIẾNG VIỆT):
1. Phân biệt cấu trúc theo sau:
   • Although / Even though / Though + MỆNH ĐỀ ĐẦY ĐỦ (S + V):
     Ví dụ: "Although remote work increases flexibility, it can weaken team cohesion."
   • Despite / In spite of + CỤM DANH TỪ (Noun Phrase) hoặc V-ing (hoặc "the fact that + S + V"):
     Ví dụ: "Despite the undeniable convenience of remote work, it can weaken team cohesion."
2. Hai lỗi kinh điển của thí sinh Việt Nam cần tránh tuyệt đối:
   • Lỗi 1 (Thừa từ "but"): Tiếng Việt nói "Mặc dù... nhưng...", nhưng trong Tiếng Anh khi đã dùng "Although / Despite" ở vế đầu thì vế hai TUYỆT ĐỐI KHÔNG dùng "but".
   • Lỗi 2: Đặt mệnh đề (S + V) ngay sau "Despite" (Sai: "Despite telecommuting saves time..." -> Sửa: "Despite saving time..." hoặc "Although telecommuting saves time...").`,
    words: [
      {
        word: 'albeit',
        phonetic: '/ɔːlˈbiːɪt/',
        partOfSpeech: 'conjunction (liên từ học thuật)',
        vietnameseMeaning: 'mặc dù, dẫu cho (đi với tính từ/trạng từ/cụm từ)',
        definition: 'Though; used to introduce a concessive phrase or adjective.',
        exampleSentence: 'The housing reform made steady, albeit modest, progress over the decade.',
        exampleTranslationVi: 'Cuộc cải cách nhà ở đã đạt được tiến bộ vững chắc, mặc dù còn khiêm tốn, trong suốt thập kỷ qua.',
        collocations: ['albeit slowly (dẫu có chậm)', 'albeit temporary (mặc dù chỉ tạm thời)', 'albeit with caveats (dẫu còn những lưu ý)'],
      },
      {
        word: 'notwithstanding',
        phonetic: '/ˌnɒtwɪθˈstændɪŋ/',
        partOfSpeech: 'preposition (giới từ C1)',
        vietnameseMeaning: 'bất chấp, mặc cho (= despite)',
        definition: 'In spite of; without being opposed or prevented by.',
        exampleSentence: 'Notwithstanding the high initial cost, solar panels reduce long-term household expenditure.',
        exampleTranslationVi: 'Bất chấp chi phí ban đầu cao, pin mặt trời giúp giảm chi tiêu hộ gia đình về lâu dài.',
        collocations: ['notwithstanding the challenges (bất chấp những thách thức)', 'notwithstanding the evidence (bất chấp bằng chứng)'],
      },
    ],
    quiz: [
      {
        id: 'q_b1_1',
        question: 'Select the sentence that uses concessive grammar accurately for Band 6.5+:',
        questionVi: 'Chọn câu sử dụng cấu trúc nhượng bộ đúng chuẩn ngữ pháp Band 6.5+:',
        options: [
          'Although remote work increases flexibility, but it can erode team cohesion.',
          'Despite telecommuting saves commuting time, employees often feel isolated.',
          'Despite the undeniable convenience of remote work, it can erode spontaneous team collaboration.',
          'In spite of they invested heavily, congestion remained severe.',
        ],
        correctIndex: 2,
        explanation: '"Despite" is followed by a noun phrase ("the undeniable convenience of remote work"), and does not pair with a redundant "but".',
        explanationVi: 'Đáp án đúng là câu 3: Sau "Despite" là một cụm danh từ chuẩn ("the undeniable convenience of remote work") và vế sau không bị thừa từ "but". Câu 1 sai vì dùng cả "Although... but"; câu 2 và câu 4 sai vì sau "Despite / In spite of" lại dùng mệnh đề S + V.',
      },
    ],
  },
  {
    id: 'vg_b2_env',
    title: 'Ecological Resilience, Decarbonization & Biodiversity',
    titleVi: 'Từ vựng Môi trường, Giảm phát thải & Đa dạng sinh học (kèm Câu Bị động Học thuật)',
    category: 'Vocabulary',
    cefrLevel: 'B2',
    topic: 'Environment',
    summary: 'High-impact B2/C1 lexical items for environmental policy essays, Reading passages on conservation, and Speaking Part 3.',
    summaryVi: 'Bộ từ vựng B2/C1 đắt giá cho chủ đề biến đổi khí hậu, bảo tồn sinh thái và cách dùng Câu bị động (Passive Voice) tạo giọng văn khách quan.',
    grammarRuleOrNote: 'Use Passive Voice ("is exacerbated by", "must be mitigated through") when emphasizing ecological processes rather than unspecified human agents.',
    grammarTheoryVi: `📚 GIẢNG GIẢI LÝ THUYẾT NGỮ PHÁP (TIẾNG VIỆT):
1. Khi nào dùng Câu Bị Động (Passive Voice) trong IELTS Writing?
   • Trong văn phong học thuật (Academic Writing), khi muốn nhấn mạnh vào QUÁ TRÌNH hoặc HIỆN TƯỢNG tự nhiên/chính sách thay vì chủ thể chung chung ("people", "we"), hãy dùng Bị động: S + be + V3/ed (+ by O).
2. Cấu trúc Bị động kết hợp Động từ khuyết thiếu (Modal Passive) rất ăn điểm trong câu giải pháp Task 2:
   • Công thức: Chủ ngữ + should / must / can + BE + V3/ed.
   • Ví dụ: "The adverse effects of soil erosion can be mitigated through large-scale reforestation." (Tác động xấu của xói mòn đất có thể được giảm thiểu thông qua việc trồng rừng quy mô lớn).`,
    words: [
      {
        word: 'mitigate',
        phonetic: '/ˈmɪtɪɡeɪt/',
        partOfSpeech: 'verb (ngoại động từ)',
        vietnameseMeaning: 'giảm thiểu, làm dịu bớt (tác hại, rủi ro)',
        definition: 'Make less severe, serious, or painful.',
        exampleSentence: 'Reforestation programs help mitigate the devastating effects of soil erosion.',
        exampleTranslationVi: 'Các chương trình trồng rừng giúp giảm thiểu những tác động tàn khốc của tình trạng xói mòn đất.',
        collocations: ['mitigate climate change (giảm thiểu biến đổi khí hậu)', 'mitigate the impact (làm dịu tác động)', 'mitigate risks (giảm nhẹ rủi ro)'],
      },
      {
        word: 'deplete',
        phonetic: '/dɪˈpliːt/',
        partOfSpeech: 'verb (ngoại động từ)',
        vietnameseMeaning: 'làm cạn kiệt, làm suy giảm nghiêm trọng',
        definition: 'Use up the supply or resources of; diminish severely.',
        exampleSentence: 'Industrial overfishing continues to deplete marine biodiversity at an alarming rate.',
        exampleTranslationVi: 'Việc đánh bắt cá công nghiệp quá mức tiếp tục làm cạn kiệt đa dạng sinh học biển với tốc độ đáng báo động.',
        collocations: ['deplete natural resources (làm cạn kiệt tài nguyên)', 'deplete aquifers (làm cạn tầng nước ngầm)', 'rapidly depleted (bị cạn kiệt nhanh chóng)'],
      },
      {
        word: 'Anthropocene',
        phonetic: '/ænˈθrɒpəsiːn/',
        partOfSpeech: 'noun (danh từ học thuật)',
        vietnameseMeaning: 'kỷ Nhân sinh (thời đại con người tác động mạnh lên khí hậu)',
        definition: 'The current geological age, viewed as the period during which human activity has been the dominant influence on climate.',
        exampleSentence: 'Conservationists argue that the Anthropocene demands binding international treaties.',
        exampleTranslationVi: 'Các nhà bảo tồn lập luận rằng kỷ Nhân sinh đòi hỏi những hiệp ước quốc tế có tính ràng buộc.',
        collocations: ['the Anthropocene epoch (thế Nhân sinh)', 'industrial Anthropocene (kỷ Nhân sinh công nghiệp)'],
      },
    ],
    quiz: [
      {
        id: 'q_b2_1',
        question: 'Which verb collocates most naturally with "the adverse impacts of urban heat islands" in an academic essay?',
        questionVi: 'Động từ nào đi kèm tự nhiên và chuẩn học thuật nhất với cụm "the adverse impacts of urban heat islands" (những tác động bất lợi của đảo nhiệt đô thị)?',
        options: ['mitigate (giảm thiểu)', 'abolish (bãi bỏ luật/tục lệ)', 'hesitate (do dự)', 'congratulate (chúc mừng)'],
        correctIndex: 0,
        explanation: '"Mitigate the adverse impacts/effects" is a core Band 7+ academic collocation.',
        explanationVi: '"Mitigate the adverse impacts/effects" (giảm thiểu những tác động bất lợi) là cụm collocation chuẩn Band 7.0+. "Abolish" chỉ dùng cho việc bãi bỏ luật lệ hoặc hủ tục, không dùng cho hiện tượng nhiệt độ.',
      },
      {
        id: 'q_b2_2',
        question: 'What does "deplete aquifers" mean in an environmental reading passage?',
        questionVi: 'Cụm từ "deplete aquifers" trong bài đọc chủ đề môi trường mang nghĩa là gì?',
        options: [
          'Purify underground water reserves (Làm sạch nguồn nước ngầm).',
          'Exhaust or drain underground water supplies faster than they replenish (Làm cạn kiệt các tầng chứa nước ngầm).',
          'Map subterranean rock formations (Lập bản đồ đá ngầm).',
          'Freeze coastal glaciers (Làm đóng băng sông băng ven biển).',
        ],
        correctIndex: 1,
        explanation: '"Deplete" means to exhaust or dangerously reduce a finite supply, and "aquifers" are underground water layers.',
        explanationVi: '"Deplete" nghĩa là làm cạn kiệt, rút cạn; còn "aquifers" là các tầng chứa nước ngầm dưới lòng đất.',
      },
    ],
  },
  {
    id: 'vg_c1_tech_grammar',
    title: 'C1 Nominalization, Inversion & Algorithmic Governance',
    titleVi: 'Ngữ pháp C1: Đảo ngữ Nhấn mạnh (Negative Inversion) & Từ vựng Trí tuệ Nhân tạo',
    category: 'Grammar',
    cefrLevel: 'C1',
    topic: 'Technology',
    summary: 'Transform verb-heavy conversational clauses into dense academic noun phrases and emphatic negative inversions for Band 7.5–8.5 Writing.',
    summaryVi: 'Bí quyết nâng điểm Grammatical Range & Accuracy lên Band 7.5–8.5 nhờ cấu trúc Đảo ngữ phủ định (Not only... but also, Seldom, Under no circumstances).',
    grammarRuleOrNote: 'Negative Inversion: When a sentence opens with a restrictive adverbial ("Seldom", "Not only", "Under no circumstances", "Little"), invert the auxiliary verb and subject: "Not only does automation displace routine labor, but it also reshapes wage distribution."',
    grammarTheoryVi: `📚 GIẢNG GIẢI LÝ THUYẾT NGỮ PHÁP C1 (TIẾNG VIỆT):
1. Đảo ngữ với trạng từ phủ định / giới hạn đứng đầu câu (Negative Inversion):
   • Khi đưa các từ như "Not only..." (Không những...), "Seldom / Rarely..." (Hiếm khi...), "Under no circumstances..." (Trong bất kỳ hoàn cảnh nào cũng không...) lên ĐẦU CÂU để nhấn mạnh, ta phải ĐẢO TRỢ ĐỘNG TỪ lên trước Chủ ngữ (giống cấu trúc câu hỏi!).
2. Công thức chuẩn:
   • Not only + Trợ động từ (do/does/did/have/can/is) + S + V(nguyên thể/V3), + but + S + also + V...
   • Ví dụ chuẩn Band 8.0: "Not only DOES automation displace routine labor, but it also reshapes wage distribution."
   • Ví dụ với Seldom: "Seldom HAVE policymakers anticipated the velocity of technological disruption."`,
    words: [
      {
        word: 'ubiquitous',
        phonetic: '/juːˈbɪkwɪtəs/',
        partOfSpeech: 'adjective (tính từ C1)',
        vietnameseMeaning: 'phổ biến khắp mọi nơi, có mặt ở khắp nơi',
        definition: 'Present, appearing, or found everywhere.',
        exampleSentence: 'Algorithmic recommendation engines have become ubiquitous across modern media platforms.',
        exampleTranslationVi: 'Các công cụ gợi ý bằng thuật toán đã trở nên phổ biến khắp mọi nơi trên các nền tảng truyền thông hiện đại.',
        collocations: ['ubiquitous computing (điện toán khắp nơi)', 'increasingly ubiquitous (ngày càng phổ biến khắp nơi)', 'ubiquitous presence (sự hiện diện khắp nơi)'],
      },
      {
        word: 'proliferation',
        phonetic: '/prəˌlɪfəˈreɪʃən/',
        partOfSpeech: 'noun (danh từ C1)',
        vietnameseMeaning: 'sự gia tăng nhanh chóng, sự bùng nổ về số lượng',
        definition: 'Rapid increase in numbers or widespread multiplication.',
        exampleSentence: 'The proliferation of generative artificial intelligence raises urgent copyright questions.',
        exampleTranslationVi: 'Sự bùng nổ nhanh chóng của trí tuệ nhân tạo tạo sinh đặt ra những câu hỏi cấp bách về bản quyền.',
        collocations: ['rapid proliferation (sự bùng nổ nhanh chóng)', 'proliferation of misinformation (sự lan tràn thông tin sai lệch)'],
      },
      {
        word: 'double-edged sword',
        phonetic: '/ˌdʌbəl edʒd ˈsɔːd/',
        partOfSpeech: 'noun (thành ngữ học thuật)',
        vietnameseMeaning: 'con dao hai lưỡi (vừa có lợi vừa có hại)',
        definition: 'A phenomenon that carries both significant benefits and serious drawbacks.',
        exampleSentence: 'Biometric surveillance acts as a double-edged sword, enhancing security while eroding anonymity.',
        exampleTranslationVi: 'Giám sát sinh trắc học đóng vai trò như một con dao hai lưỡi, vừa tăng cường an ninh nhưng vừa làm xói mòn quyền ẩn danh.',
        collocations: ['act as a double-edged sword (đóng vai trò như con dao hai lưỡi)', 'prove to be a double-edged sword (chứng tỏ là con dao hai lưỡi)'],
      },
    ],
    quiz: [
      {
        id: 'q_c1_1',
        question: 'Select the sentence with correct C1 negative inversion:',
        questionVi: 'Chọn câu áp dụng đúng công thức Đảo ngữ phủ định cấp độ C1:',
        options: [
          'Seldom policymakers have anticipated the speed of technological disruption.',
          'Seldom have policymakers anticipated the velocity of technological disruption.',
          'Not only AI improves diagnostics, it also reduces hospital wait times.',
          'Under no circumstances personal data should be sold without consent.',
        ],
        correctIndex: 1,
        explanation: 'After "Seldom" at the start of a clause, the auxiliary "have" precedes the subject "policymakers" ("Seldom have policymakers anticipated...").',
        explanationVi: 'Đáp án đúng là câu 2: Khi "Seldom" (Hiếm khi) đứng đầu câu, trợ động từ "have" phải được đảo lên trước chủ ngữ "policymakers" ("Seldom have policymakers anticipated..."). Câu 1, 3, 4 đều quên đảo trợ động từ lên trước chủ ngữ.',
      },
    ],
  },
  {
    id: 'vg_b2_econ',
    title: 'Macroeconomic Fiscal Policy & Global Trade',
    titleVi: 'Từ vựng Kinh tế Vĩ mô, Trợ cấp Công & Bất bình đẳng Thu nhập (kèm Mệnh đề Phân từ)',
    category: 'Vocabulary',
    cefrLevel: 'B2',
    topic: 'Economy',
    summary: 'High-precision vocabulary for discussing public spending, taxation, inflation, and socioeconomic mobility.',
    summaryVi: 'Từ vựng học thuật về trợ cấp chính phủ, khoảng cách giàu nghèo và cách dùng Mệnh đề phân từ (Participle Clauses) để rút gọn câu phức.',
    grammarRuleOrNote: 'Use participle clauses ("Driven by rising energy costs, inflation peaked in Q3") to synthesize cause and effect concisely in Task 1 and Task 2.',
    grammarTheoryVi: `📚 GIẢNG GIẢI LÝ THUYẾT NGỮ PHÁP (TIẾNG VIỆT):
1. Mệnh đề phân từ (Participle Clauses) giúp rút gọn câu khi 2 vế có cùng chủ ngữ:
   • Dạng Chủ động (V-ing): Dùng khi chủ ngữ tự thực hiện hành động.
     Ví dụ: "Investing heavily in vocational schools, the government narrowed regional wage disparities."
   • Dạng Bị động (V3/ed): Dùng khi chủ ngữ chịu tác động bởi yếu tố khác.
     Ví dụ: "Driven by rising energy costs, inflation peaked in the third quarter." (Bị đẩy lên bởi chi phí năng lượng tăng cao, lạm phát đạt đỉnh vào quý 3).`,
    words: [
      {
        word: 'subsidize',
        phonetic: '/ˈsʌbsɪdaɪz/',
        partOfSpeech: 'verb (ngoại động từ)',
        vietnameseMeaning: 'trợ cấp, hỗ trợ tài chính (từ ngân sách nhà nước)',
        definition: 'Support an organization or activity financially using public funds.',
        exampleSentence: 'Many European municipalities heavily subsidize public rail networks to curb car dependency.',
        exampleTranslationVi: 'Nhiều thành phố châu Âu trợ cấp mạnh cho mạng lưới đường sắt công cộng nhằm hạn chế sự phụ thuộc vào ô tô cá nhân.',
        collocations: ['heavily subsidize (trợ cấp mạnh)', 'government-subsidized (được chính phủ trợ giá)', 'subsidize renewable energy (trợ giá năng lượng tái tạo)'],
      },
      {
        word: 'disparity',
        phonetic: '/dɪˈspærəti/',
        partOfSpeech: 'noun (danh từ)',
        vietnameseMeaning: 'sự chênh lệch lớn, sự bất bình đẳng',
        definition: 'A great difference or inequality, especially in economic or social conditions.',
        exampleSentence: 'Targeted vocational training can narrow the income disparity between urban and rural regions.',
        exampleTranslationVi: 'Đào tạo nghề có trọng điểm có thể thu hẹp sự chênh lệch thu nhập giữa khu vực thành thị và nông thôn.',
        collocations: ['wealth disparity (chênh lệch giàu nghèo)', 'growing disparity (khoảng cách ngày càng lớn)', 'narrow the disparity (thu hẹp khoảng cách)'],
      },
    ],
    quiz: [
      {
        id: 'q_econ_1',
        question: 'What is the most accurate synonym for "wealth disparity" in IELTS Writing Task 2?',
        questionVi: 'Cụm từ nào đồng nghĩa chính xác nhất với "wealth disparity" trong IELTS Writing Task 2?',
        options: [
          'economic inequality (bất bình đẳng kinh tế / chênh lệch giàu nghèo)',
          'financial celebration (lễ kỷ niệm tài chính)',
          'monetary uniformity (sự đồng nhất tiền tệ)',
          'industrial output (sản lượng công nghiệp)',
        ],
        correctIndex: 0,
        explanation: '"Disparity" denotes a significant gap or inequality between socioeconomic groups.',
        explanationVi: '"Disparity" có nghĩa là sự chênh lệch, bất bình đẳng lớn; do đó "wealth disparity" đồng nghĩa trực tiếp với "economic inequality" (bất bình đẳng kinh tế / khoảng cách giàu nghèo).',
      },
    ],
  },
];

// Lookup Vietnamese meaning for any SRS card (including cards loaded from Firestore)
const VIETNAMESE_CARD_MAP: Record<string, { vi: string; exVi: string }> = {
  mitigate: {
    vi: 'giảm thiểu, làm dịu bớt (tác hại, rủi ro)',
    exVi: 'Các vành đai xanh đô thị giúp giảm thiểu tác động của lũ quét.',
  },
  ubiquitous: {
    vi: 'phổ biến khắp mọi nơi, có mặt ở mọi nơi',
    exVi: 'Các công cụ cộng tác đám mây đã trở nên phổ biến khắp nơi trong giáo dục đại học.',
  },
  proliferation: {
    vi: 'sự gia tăng nhanh chóng, sự bùng nổ số lượng',
    exVi: 'Sự gia tăng nhanh chóng của các chuyến bay chặng ngắn đã làm phức tạp hóa mục tiêu giảm carbon.',
  },
  sedentary: {
    vi: 'ít vận động, ngồi nhiều một chỗ',
    exVi: 'Hành vi ngồi nhiều ít vận động kéo dài có liên hệ mật thiết với các rối loạn chuyển hóa.',
  },
  disparity: {
    vi: 'sự chênh lệch lớn, sự bất bình đẳng',
    exVi: 'Đầu tư hạ tầng số nhằm thu hẹp sự chênh lệch về internet băng thông rộng.',
  },
  compulsory: {
    vi: 'bắt buộc (theo quy định hoặc luật pháp)',
    exVi: 'Giáo dục công dân là môn học bắt buộc tại tất cả các trường trung học.',
  },
  curriculum: {
    vi: 'chương trình giảng dạy, khung chương trình học',
    exVi: 'Nghiên cứu liên ngành đã được tích hợp vào chương trình giảng dạy cử nhân tài năng.',
  },
  subsidize: {
    vi: 'trợ cấp, hỗ trợ tài chính từ ngân sách công',
    exVi: 'Chính phủ nên trợ cấp cho các chương trình chăm sóc sức khỏe dự phòng.',
  },
};

export function getCardBilingualInfo(card: SrsCardData): {
  vietnameseMeaning: string;
  exampleTranslationVi: string;
} {
  const key = card.word.toLowerCase().trim();
  if (card.vietnameseMeaning) {
    return {
      vietnameseMeaning: card.vietnameseMeaning,
      exampleTranslationVi: card.exampleTranslationVi || '',
    };
  }
  if (VIETNAMESE_CARD_MAP[key]) {
    return {
      vietnameseMeaning: VIETNAMESE_CARD_MAP[key].vi,
      exampleTranslationVi: VIETNAMESE_CARD_MAP[key].exVi,
    };
  }
  const dict = ACADEMIC_DICTIONARY[key];
  if (dict) {
    return {
      vietnameseMeaning: dict.vietnameseMeaning,
      exampleTranslationVi: '',
    };
  }
  return {
    vietnameseMeaning: 'Từ vựng học thuật IELTS (Xem định nghĩa chi tiết bên dưới)',
    exampleTranslationVi: '',
  };
}

// 3. Initial Starter SRS Flashcards
export function getInitialSrsDeck(uid: string): SrsCardData[] {
  const now = new Date();
  const pastDue = new Date(now.getTime() - 3600 * 1000).toISOString();
  const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString();
  const nextMonth = new Date(now.getTime() + 21 * 24 * 3600 * 1000).toISOString();

  return [
    {
      id: 'card_mitigate',
      uid,
      word: 'mitigate',
      phonetic: '/ˈmɪtɪɡeɪt/',
      partOfSpeech: 'verb',
      vietnameseMeaning: 'giảm thiểu, làm dịu bớt (tác hại, rủi ro)',
      definition: 'To make less severe, harmful, or painful.',
      exampleSentence: 'Urban green belts help mitigate the effects of flash flooding.',
      exampleTranslationVi: 'Các vành đai xanh đô thị giúp giảm thiểu tác động của lũ quét.',
      topic: 'Environment',
      cefrLevel: 'B2',
      source: 'vocab-hub',
      masteryLevel: 'New',
      intervalDays: 0,
      easeFactor: 2.5,
      repetitions: 0,
      nextReviewAt: pastDue,
      lastReviewedAt: pastDue,
    },
    {
      id: 'card_ubiquitous',
      uid,
      word: 'ubiquitous',
      phonetic: '/juːˈbɪkwɪtəs/',
      partOfSpeech: 'adjective',
      vietnameseMeaning: 'phổ biến khắp mọi nơi, có mặt ở mọi nơi',
      definition: 'Present, appearing, or found everywhere simultaneously.',
      exampleSentence: 'Cloud-based collaboration tools have become ubiquitous in higher education.',
      exampleTranslationVi: 'Các công cụ cộng tác đám mây đã trở nên phổ biến khắp nơi trong giáo dục đại học.',
      topic: 'Technology',
      cefrLevel: 'C1',
      source: 'vocab-hub',
      masteryLevel: 'New',
      intervalDays: 0,
      easeFactor: 2.5,
      repetitions: 0,
      nextReviewAt: pastDue,
      lastReviewedAt: pastDue,
    },
    {
      id: 'card_proliferation',
      uid,
      word: 'proliferation',
      phonetic: '/prəˌlɪfəˈreɪʃən/',
      partOfSpeech: 'noun',
      vietnameseMeaning: 'sự gia tăng nhanh chóng, sự bùng nổ số lượng',
      definition: 'Rapid multiplication or widespread increase in number.',
      exampleSentence: 'The proliferation of short-haul flights has complicated carbon reduction targets.',
      exampleTranslationVi: 'Sự gia tăng nhanh chóng của các chuyến bay chặng ngắn đã làm phức tạp hóa mục tiêu giảm carbon.',
      topic: 'Environment',
      cefrLevel: 'C1',
      source: 'news-reader',
      masteryLevel: 'Learning',
      intervalDays: 1,
      easeFactor: 2.35,
      repetitions: 1,
      nextReviewAt: pastDue,
      lastReviewedAt: pastDue,
    },
    {
      id: 'card_sedentary',
      uid,
      word: 'sedentary',
      phonetic: '/ˈsedəntəri/',
      partOfSpeech: 'adjective',
      vietnameseMeaning: 'ít vận động, ngồi nhiều một chỗ',
      definition: 'Characterized by much sitting and little physical exercise.',
      exampleSentence: 'Prolonged sedentary behavior is correlated with metabolic disorders.',
      exampleTranslationVi: 'Hành vi ngồi nhiều ít vận động kéo dài có liên hệ mật thiết với các rối loạn chuyển hóa.',
      topic: 'Health',
      cefrLevel: 'B1',
      source: 'vocab-hub',
      masteryLevel: 'Learning',
      intervalDays: 1,
      easeFactor: 2.4,
      repetitions: 1,
      nextReviewAt: tomorrow,
      lastReviewedAt: now.toISOString(),
    },
    {
      id: 'card_disparity',
      uid,
      word: 'disparity',
      phonetic: '/dɪˈspærəti/',
      partOfSpeech: 'noun',
      vietnameseMeaning: 'sự chênh lệch lớn, sự bất bình đẳng',
      definition: 'A noticeable and often unfair difference between things or people.',
      exampleSentence: 'Digital infrastructure investments aim to bridge the broadband disparity.',
      exampleTranslationVi: 'Đầu tư hạ tầng số nhằm thu hẹp sự chênh lệch về internet băng thông rộng.',
      topic: 'Economy',
      cefrLevel: 'B2',
      source: 'news-reader',
      masteryLevel: 'Reviewing',
      intervalDays: 5,
      easeFactor: 2.5,
      repetitions: 2,
      nextReviewAt: pastDue,
      lastReviewedAt: pastDue,
    },
    {
      id: 'card_compulsory',
      uid,
      word: 'compulsory',
      phonetic: '/kəmˈpʌlsəri/',
      partOfSpeech: 'adjective',
      vietnameseMeaning: 'bắt buộc (theo quy định hoặc luật pháp)',
      definition: 'Required by rule or law; obligatory.',
      exampleSentence: 'Civic education is compulsory across all secondary academies.',
      exampleTranslationVi: 'Giáo dục công dân là môn học bắt buộc tại tất cả các trường trung học.',
      topic: 'Education',
      cefrLevel: 'B1',
      source: 'vocab-hub',
      masteryLevel: 'Reviewing',
      intervalDays: 7,
      easeFactor: 2.6,
      repetitions: 3,
      nextReviewAt: nextWeek,
      lastReviewedAt: now.toISOString(),
    },
    {
      id: 'card_curriculum',
      uid,
      word: 'curriculum',
      phonetic: '/kəˈrɪkjələm/',
      partOfSpeech: 'noun',
      vietnameseMeaning: 'chương trình giảng dạy, khung chương trình học',
      definition: 'The aggregate of courses of study given in a school, college, or university.',
      exampleSentence: 'Interdisciplinary research was embedded into the honours curriculum.',
      exampleTranslationVi: 'Nghiên cứu liên ngành đã được tích hợp vào chương trình giảng dạy cử nhân tài năng.',
      topic: 'Education',
      cefrLevel: 'A2',
      source: 'vocab-hub',
      masteryLevel: 'Mastered',
      intervalDays: 21,
      easeFactor: 2.8,
      repetitions: 5,
      nextReviewAt: nextMonth,
      lastReviewedAt: now.toISOString(),
    },
    {
      id: 'card_subsidize',
      uid,
      word: 'subsidize',
      phonetic: '/ˈsʌbsɪdaɪz/',
      partOfSpeech: 'verb',
      vietnameseMeaning: 'trợ cấp, hỗ trợ tài chính từ ngân sách công',
      definition: 'Support financially through public grants or tax reductions.',
      exampleSentence: 'Governments ought to subsidize preventative healthcare programs.',
      exampleTranslationVi: 'Chính phủ nên trợ cấp cho các chương trình chăm sóc sức khỏe dự phòng.',
      topic: 'Economy',
      cefrLevel: 'B2',
      source: 'vocab-hub',
      masteryLevel: 'Mastered',
      intervalDays: 18,
      easeFactor: 2.7,
      repetitions: 4,
      nextReviewAt: nextMonth,
      lastReviewedAt: now.toISOString(),
    },
  ];
}

// 4. IELTS 4-Skills Practice Lab Data (With Bilingual EN-VI Explanations)
export const LISTENING_READING_TESTS: ListeningReadingTest[] = [
  {
    id: 'lr_listen_sec3',
    skill: 'listening',
    title: 'Section 3 Academic Tutorial: Urban Micro-Climate Research Project',
    titleVi: 'Listening Part 3: Thảo luận Dự án Nghiên cứu Vi khí hậu Đô thị',
    bandTarget: 'Band 5.5 – 7.5',
    durationMinutes: 10,
    topic: 'Environment',
    customAudioHint: 'Nghe hội thoại nhiều người nói tích hợp sẵn hoặc dán link file nghe MP3/WAV bất kỳ.',
    audioScriptOrPassage: [
      'Dr. Evans: Welcome back, Maya and Liam. Let us review your methodology for the urban heat-island field study before you deploy the thermal sensors on Monday.',
      'Maya: Initially, we planned to mount twelve sensors along the central commercial boulevard, because traffic density is highest there.',
      'Liam: However, after inspecting the municipal shading map, we realized the glass skyscrapers cast irregular afternoon shadows that would skew the baseline readings.',
      'Dr. Evans: Good catch. So how have you revised the sampling grid?',
      'Maya: Instead of concentrating solely on the boulevard, we split the sensors across three distinct zones: a tree-lined residential avenue, an unshaded concrete car park, and the riverside botanical corridor.',
      'Dr. Evans: Excellent. And what about calibration? Last semester, humidity drift caused a 1.4-degree margin of error in the riverside units.',
      'Liam: We have scheduled a 48-hour chamber calibration in the engineering lab this Thursday, and each sensor will log readings every fifteen minutes rather than hourly.',
    ],
    passageTranslationsVi: [
      'TS. Evans: Chào mừng Maya và Liam quay lại. Hãy cùng rà soát phương pháp nghiên cứu thực địa về đảo nhiệt đô thị trước khi các em lắp đặt cảm biến nhiệt vào thứ Hai tới.',
      'Maya: Ban đầu, chúng em dự định gắn 12 cảm biến dọc theo đại lộ thương mại trung tâm, vì mật độ giao thông ở đó cao nhất.',
      'Liam: Tuy nhiên, sau khi kiểm tra bản đồ bóng râm của thành phố, chúng em nhận ra các tòa nhà chọc trời bằng kính tạo ra bóng râm buổi chiều không đồng đều, điều này sẽ làm sai lệch số liệu chuẩn ban đầu.',
      'TS. Evans: Phát hiện rất tốt. Vậy các em đã điều chỉnh lưới lấy mẫu như thế nào?',
      'Maya: Thay vì chỉ tập trung ở đại lộ, chúng em chia cảm biến ra 3 khu vực riêng biệt: một đại lộ dân cư rợp bóng cây, một bãi đỗ xe bê tông không có mái che, và hành lang thực vật ven sông.',
      'TS. Evans: Tuyệt vời. Thế còn việc hiệu chuẩn thì sao? Học kỳ trước, độ ẩm thay đổi đã gây ra sai số 1,4 độ ở các thiết bị ven sông.',
      'Liam: Chúng em đã lên lịch hiệu chuẩn trong buồng thí nghiệm 48 giờ tại phòng lab kỹ thuật vào thứ Năm này, và mỗi cảm biến sẽ ghi dữ liệu mỗi 15 phút thay vì mỗi giờ.',
    ],
    questions: [
      {
        id: 'lq_1',
        question: 'Why did Maya and Liam abandon their original plan to place all twelve sensors on the commercial boulevard?',
        questionVi: 'Tại sao Maya và Liam lại từ bỏ kế hoạch ban đầu là đặt toàn bộ 12 cảm biến trên đại lộ thương mại?',
        options: [
          'The municipal council refused to grant a pedestrian permit.',
          'Irregular afternoon shadows from glass skyscrapers would distort baseline temperature data.',
          'Traffic noise interfered with the wireless transmitters.',
          'They only had eight functioning sensors available.',
        ],
        correctIndex: 1,
        explanation: 'Liam notes that "the glass skyscrapers cast irregular afternoon shadows that would skew the baseline readings." Note how "initially planned" acts as a classic IELTS distractor.',
        explanationVi: 'Phân tích Tiếng Việt: Maya nói "Initially, we planned..." (Ban đầu chúng em định...) là bẫy đánh lạc hướng (Distractor). Ngay sau đó Liam dùng từ nối "However" (Tuy nhiên) và giải thích lý do đổi ý: các tòa nhà kính tạo bóng râm buổi chiều không đều làm lệch số liệu ("skew the baseline readings" = "distort baseline temperature data").',
      },
      {
        id: 'lq_2',
        question: 'Which THREE locations make up the revised sensor sampling grid?',
        questionVi: 'Ba địa điểm nào tạo nên lưới lấy mẫu cảm biến sau khi đã sửa đổi?',
        options: [
          'A commercial boulevard, a subway station, and a rooftop garden.',
          'A tree-lined residential avenue, an unshaded concrete car park, and a riverside botanical corridor.',
          'A university courtyard, an industrial warehouse, and a coastal pier.',
          'Three separate floors of the engineering building.',
        ],
        correctIndex: 1,
        explanation: 'Maya explicitly lists: "a tree-lined residential avenue, an unshaded concrete car park, and the riverside botanical corridor."',
        explanationVi: 'Phân tích Tiếng Việt: Sau câu hỏi của TS. Evans về lưới lấy mẫu mới ("revised sampling grid"), Maya liệt kê rõ 3 khu vực: đại lộ dân cư rợp bóng cây (tree-lined residential avenue), bãi đỗ xe bê tông không bóng râm (unshaded concrete car park) và hành lang thực vật ven sông (riverside botanical corridor).',
      },
      {
        id: 'lq_3',
        question: 'How frequently will the calibrated sensors record temperature data during the field study?',
        questionVi: 'Các cảm biến sau khi hiệu chuẩn sẽ ghi lại dữ liệu nhiệt độ với tần suất bao lâu một lần?',
        options: ['Every 60 minutes', 'Every 48 hours', 'Every 15 minutes', 'Once per day at noon'],
        correctIndex: 2,
        explanation: 'Liam states that "each sensor will log readings every fifteen minutes rather than hourly."',
        explanationVi: 'Phân tích Tiếng Việt: Liam nói rõ ở câu cuối: "each sensor will log readings every fifteen minutes rather than hourly" (ghi dữ liệu mỗi 15 phút thay vì mỗi giờ). Con số "48 hours" là thời gian hiệu chuẩn trong phòng lab, còn "hourly" (60 phút) là phương án bị loại bỏ ("rather than hourly").',
      },
    ],
  },
  {
    id: 'lr_read_sec2',
    skill: 'reading',
    title: 'Academic Passage: The Architecture of Deep Reading in a Digital Epoch',
    titleVi: 'Reading Học thuật: Cấu trúc của Việc Đọc Sâu trong Kỷ nguyên Số',
    bandTarget: 'Band 6.0 – 8.0',
    durationMinutes: 15,
    topic: 'Education',
    audioScriptOrPassage: [
      'Paragraph A: Cognitive neuroscientists have long observed that reading is not an innate human faculty encoded in our genome like spoken language. Rather, the brain must forge an intricate "reading circuit" by repurposing regions originally evolved for object recognition and spoken syntax. When readers engage with sustained, linear prose—often termed "deep reading"—this circuit activates prefrontal areas responsible for deductive inference, analogical reasoning, and critical empathy.',
      'Paragraph B: Over the past two decades, however, the shift from printed pages to hyperlinked screens has altered daily reading habits. Eye-tracking studies conducted by literacy researchers in Oslo and Zurich indicate that digital readers frequently adopt an "F-shaped" scanning pattern: they read the top two lines horizontally, drop down the left margin for keywords, and rarely return to dense subordinate clauses. While this rapid triage is highly efficient for sifting through hundreds of emails, researchers caution that habitual skimming may weaken our patience for complex philosophical or scientific arguments.',
      'Paragraph C: Crucially, the medium itself is not inherently defective. Controlled trials comparing university students who read identical long-form historical essays on e-ink tablets versus paper found virtually no difference in comprehension when notifications were disabled and students were instructed to annotate key claims. The decisive factor was cognitive posture: learners who approached screens expecting shallow entertainment skimmed superficially, whereas those trained in "biliterate" reading strategies slowed their pace and achieved full analytical depth across both mediums.',
    ],
    passageTranslationsVi: [
      'Đoạn A: Các nhà thần kinh học nhận thức từ lâu đã quan sát thấy rằng đọc không phải là một năng lực bẩm sinh được mã hóa sẵn trong bộ gen con người như ngôn ngữ nói. Thay vào đó, bộ não phải tự thiết lập một "mạch đọc" phức tạp bằng cách tái sử dụng các vùng não vốn tiến hóa để nhận diện vật thể và cú pháp lời nói. Khi người đọc đắm mình vào văn xuôi mạch lạc, chuyên sâu—thường gọi là "đọc sâu" (deep reading)—mạch này kích hoạt các vùng vỏ não trước trán chịu trách nhiệm suy luận diễn dịch, tư duy tương tự và sự thấu cảm phản biện.',
      'Đoạn B: Tuy nhiên, trong hai thập kỷ qua, sự dịch chuyển từ trang giấy in sang màn hình chứa đầy siêu liên kết đã làm thay đổi thói quen đọc hàng ngày. Các nghiên cứu theo dõi chuyển động mắt tại Oslo và Zurich chỉ ra rằng người đọc trên thiết bị số thường áp dụng kiểu quét hình chữ "F": họ đọc ngang hai dòng đầu tiên, lướt dọc lề trái để tìm từ khóa và hiếm khi quay lại các mệnh đề phụ thuộc dày đặc. Mặc dù cách lọc nhanh này rất hiệu quả để xử lý hàng trăm email, các nhà nghiên cứu cảnh báo rằng thói quen đọc lướt có thể làm suy yếu sự kiên nhẫn của chúng ta trước những lập luận triết học hoặc khoa học phức tạp.',
      'Đoạn C: Điều quan trọng là bản thân phương tiện (màn hình) không hề có lỗi cố hữu. Các thử nghiệm có đối chứng so sánh sinh viên đại học đọc cùng một tiểu luận lịch sử dài trên máy đọc sách e-ink và trên giấy cho thấy hầu như không có sự khác biệt về mức độ hiểu bài khi thông báo bị tắt và sinh viên được hướng dẫn ghi chú các luận điểm chính. Yếu tố quyết định nằm ở "tư thế nhận thức": những người tiếp cận màn hình với tâm thế giải trí hời hợt thì đọc lướt qua loa, trong khi những người được rèn luyện chiến lược đọc song phương đã điều chỉnh nhịp độ chậm lại và đạt được chiều sâu phân tích trọn vẹn trên cả hai phương tiện.',
    ],
    questions: [
      {
        id: 'rq_1',
        question: 'TRUE / FALSE / NOT GIVEN: Humans are born with a dedicated genetic brain region specifically evolved for reading text.',
        questionVi: 'TRUE / FALSE / NOT GIVEN: Con người sinh ra đã có sẵn một vùng não di truyền chuyên biệt tiến hóa riêng cho việc đọc văn bản.',
        options: [
          'TRUE — The passage states reading is encoded in our genome.',
          'FALSE — The passage states reading is not an innate faculty and relies on repurposing existing brain regions.',
          'NOT GIVEN — The passage does not mention genetics or brain development.',
        ],
        correctIndex: 1,
        explanation: 'Paragraph A explicitly contradicts the statement: "reading is not an innate human faculty encoded in our genome... Rather, the brain must forge an intricate reading circuit by repurposing regions."',
        explanationVi: 'Phân tích Tiếng Việt: Chọn FALSE vì câu nhận định TRÁI NGƯỢC hoàn toàn với câu đầu Đoạn A: "reading is not an innate human faculty encoded in our genome" (đọc không phải là năng lực bẩm sinh được mã hóa trong bộ gen, mà não phải tái sử dụng các vùng nhận diện vật thể).',
      },
      {
        id: 'rq_2',
        question: 'According to Paragraph B, what characterizes the "F-shaped" reading behavior observed in eye-tracking studies?',
        questionVi: 'Theo Đoạn B, hành vi đọc hình chữ "F" trong các nghiên cứu theo dõi mắt có đặc điểm gì?',
        options: [
          'Reading from the bottom paragraph upward to the introduction.',
          'Reading every word aloud to reinforce phonetic memory.',
          'Scanning top lines horizontally and dropping down the left margin for keywords while skipping dense clauses.',
          'Memorizing footnotes before reading the main heading.',
        ],
        correctIndex: 2,
        explanation: 'Paragraph B defines the F-shaped pattern as reading the top lines horizontally and dropping down the left margin for keywords.',
        explanationVi: 'Phân tích Tiếng Việt: Trong Đoạn B, dấu hai chấm sau cụm "F-shaped scanning pattern:" giải thích trực tiếp: đọc ngang 2 dòng đầu ("read the top two lines horizontally"), lướt dọc lề trái tìm từ khóa ("drop down the left margin for keywords") và bỏ qua các mệnh đề phức tạp.',
      },
      {
        id: 'rq_3',
        question: 'What did controlled trials with university students in Paragraph C reveal about e-ink tablets versus paper?',
        questionVi: 'Các thử nghiệm có đối chứng với sinh viên đại học ở Đoạn C tiết lộ điều gì khi so sánh máy đọc e-ink với sách giấy?',
        options: [
          'Paper always outperformed e-ink by at least 40% regardless of study conditions.',
          'Comprehension was virtually identical when notifications were disabled and active annotation was used.',
          'E-ink tablets permanently damaged students’ short-term recall.',
          'Students refused to annotate historical essays on paper.',
        ],
        correctIndex: 1,
        explanation: 'Paragraph C notes "virtually no difference in comprehension when notifications were disabled and students were instructed to annotate key claims."',
        explanationVi: 'Phân tích Tiếng Việt: Đoạn C nêu rõ "virtually no difference in comprehension" (= "Comprehension was virtually identical": mức độ đọc hiểu gần như tương đương nhau) khi tắt thông báo ("notifications were disabled") và có ghi chú luận điểm chính ("annotate key claims").',
      },
    ],
  },
];

export const WRITING_PROMPTS: WritingPromptItem[] = [
  {
    id: 'wp_task2_edu',
    taskType: 'Task 2 Essay',
    title: 'University Curriculum: Theoretical Knowledge vs. Practical Vocational Skills',
    titleVi: 'Task 2: Giáo dục Đại học nên tập trung vào Lý thuyết Học thuật hay Kỹ năng Thực hành Nghề nghiệp?',
    topic: 'Education',
    durationMinutes: 40,
    minWords: 250,
    promptText:
      'Some people believe that universities should focus primarily on theoretical academic subjects, while others argue that higher education ought to prepare graduates directly for practical workplace careers. Discuss both views and give your own opinion.',
    promptTextVi:
      'Đề bài (Dịch nghĩa): Một số người cho rằng các trường đại học nên tập trung chủ yếu vào các môn học lý thuyết học thuật, trong khi những người khác lập luận rằng giáo dục đại học cần chuẩn bị trực tiếp kỹ năng làm việc thực tế cho sinh viên tốt nghiệp. Hãy thảo luận cả hai quan điểm và đưa ra ý kiến của riêng bạn.',
    rubricChecklist: [
      'Address both perspectives equally before or while advancing a clear personal thesis.',
      'Organize into 4 paragraphs (Introduction, Body 1: Theoretical Value, Body 2: Practical Employability, Conclusion).',
      'Use C1 cohesive transitions (Conversely, Proponents of... contend that, By contrast) without mechanical numbering.',
      'Incorporate at least 5 topic-specific collocations (pedagogical foundation, labour-market readiness, interdisciplinary inquiry).',
    ],
    rubricChecklistVi: [
      'Thảo luận cân bằng cả 2 quan điểm và nêu rõ quan điểm cá nhân (Thesis Statement) ngay từ Mở bài.',
      'Chia bố cục 4 đoạn rõ ràng: Mở bài, Thân bài 1 (Giá trị của lý thuyết nền tảng), Thân bài 2 (Tính ứng dụng thực tiễn & cơ hội việc làm), Kết bài.',
      'Sử dụng các cụm chuyển ý học thuật C1 (On the one hand, By contrast, Proponents contend that...) thay vì liệt kê máy móc.',
      'Đưa vào ít nhất 5 collocations chủ đề Giáo dục (intellectual inquiry, vocational training, epistemic rigour, mutually exclusive).',
    ],
    sampleBand75Essay: `Higher education has historically stood at the crossroads between pure intellectual inquiry and pragmatic vocational training. While traditionalists maintain that universities exist to cultivate abstract analytical reasoning, a growing consensus insists that degree programmes must equip graduates with tangible workplace competencies. In my view, these two imperatives are not mutually exclusive; rather, modern universities should anchor practical skill acquisition within a rigorous theoretical framework.

On the one hand, theoretical disciplines form the bedrock of long-term scientific and cultural innovation. Fields such as pure mathematics, ethics, and theoretical physics rarely yield immediate commercial products, yet they cultivate epistemic rigour—the ability to question assumptions, synthesize complex data, and construct coherent arguments. For instance, the cryptographic algorithms that secure contemporary digital banking originated from abstract number theory developed decades before computers existed. If universities were reduced to short-term corporate training centres, society would forfeit the foundational research required to solve unforeseen global challenges.

On the other hand, the economic realities facing contemporary graduates cannot be dismissed. With tuition fees rising and entry-level roles becoming increasingly specialized, students understandably expect higher education to enhance their employability. Disciplines such as nursing, civil engineering, and software architecture demand hands-on clinical placements and industry simulations. Integrating internships and project-based assessments into undergraduate curricula ensures that graduates can translate abstract principles into real-world execution without requiring years of costly retraining.

In conclusion, framing academic theory and vocational preparation as binary opposites creates a false dichotomy. Universities best serve both the individual and society when they marry deep conceptual understanding with applied professional practice.`,
    examinerNotes:
      'Band 8.0 Model Analysis: Notice how the introduction paraphrases the prompt using "intellectual inquiry" and "pragmatic vocational training" and establishes a nuanced thesis ("not mutually exclusive"). Body 1 provides a concrete historical example (cryptography from number theory), and Body 2 acknowledges economic realities before the conclusion synthesizes both poles.',
    examinerNotesVi:
      'Phân tích Bài mẫu Band 8.0 (Tiếng Việt): Mở bài đã paraphrase xuất sắc cụm "theoretical subjects" thành "pure intellectual inquiry" và "practical careers" thành "pragmatic vocational training", đồng thời nêu luận điểm dung hòa ("not mutually exclusive" - không loại trừ lẫn nhau). Thân bài 1 lấy ví dụ thực tế về thuật toán mật mã ngân hàng bắt nguồn từ lý thuyết số học trừu tượng; Thân bài 2 phân tích thực tế học phí và nhu cầu thực tập trước khi Kết bài chốt lại bằng cụm C1 "false dichotomy" (sự phân cực sai lầm).',
  },
  {
    id: 'wp_task1_env',
    taskType: 'Task 1 Academic',
    title: 'Electricity Generation by Source Across Four European Nations (2010–2025)',
    titleVi: 'Task 1 Academic: Biểu đồ Tỷ trọng Sản xuất Điện năng theo Nguồn tại 4 Quốc gia Châu Âu (2010–2025)',
    topic: 'Environment',
    durationMinutes: 20,
    minWords: 150,
    promptText:
      'The table and chart below summarize the percentage share of electricity generated from Renewables (Wind/Solar/Hydro), Nuclear, and Fossil Fuels across Denmark, France, Germany, and Poland between 2010 and 2025. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
    promptTextVi:
      'Đề bài (Dịch nghĩa): Bảng số liệu dưới đây tóm tắt tỷ lệ phần trăm điện năng được sản xuất từ Năng lượng tái tạo, Điện hạt nhân và Nhiên liệu hóa thạch tại Đan Mạch, Pháp, Đức và Ba Lan giai đoạn 2010 – 2025. Hãy tóm tắt các đặc điểm chính và so sánh những điểm nổi bật.',
    chartSummary:
      'Denmark: Renewables surged from 32% (2010) to 84% (2025), while Fossil Fuels fell from 68% to 16% (Nuclear: 0%). France: Nuclear remained dominant at 75% (2010) and 68% (2025), with Renewables rising from 15% to 26%. Germany: Renewables more than doubled from 19% to 56%, Nuclear dropped from 22% to 0%, and Fossil Fuels declined from 59% to 44%. Poland: Fossil Fuels fell from 91% to 66%, while Renewables quadrupled from 9% to 34%.',
    rubricChecklist: [
      'Include a clear Overview paragraph highlighting the universal upward trajectory of renewables and France’s unique reliance on nuclear power.',
      'Avoid listing every number mechanically; group countries by structural patterns (e.g., Denmark & Germany’s rapid green transition vs. Poland’s coal legacy).',
      'Use precise comparative quantifiers (more than doubled, quadrupled, accounted for the lion’s share, plummeted to zero).',
    ],
    rubricChecklistVi: [
      'Bắt buộc có đoạn Overview (Tổng quan) nêu rõ xu hướng tăng đồng loạt của Năng lượng tái tạo ở cả 4 nước và sự khác biệt của Pháp (dựa vào điện hạt nhân).',
      'Không liệt kê số liệu máy móc từng nước; hãy nhóm Đan Mạch & Đức (chuyển dịch xanh mạnh mẽ) đối lập với Pháp và Ba Lan.',
      'Sử dụng đa dạng các cụm từ chỉ tỷ lệ và mức tăng giảm (soared from... to..., nearly tripled, fourfold increase, two-thirds).',
    ],
    sampleBand75Essay: `The provided data compares shifts in electricity generation across Denmark, France, Germany, and Poland by energy source between 2010 and 2025.

Overall, every surveyed nation expanded its share of renewable electricity over the fifteen-year period, accompanied by a corresponding contraction in fossil fuel reliance. However, energy portfolios diverged sharply: Denmark and Germany spearheaded the transition toward wind and solar, France continued to rely predominantly on nuclear power, and Poland remained the most fossil-fuel-dependent country despite substantial green growth.

In 2010, Denmark and Germany generated the majority of their power from fossil fuels at 68% and 59% respectively. By 2025, Denmark had transformed its grid, with renewables soaring from 32% to 84% and fossil fuels dropping to just 16%. Similarly, Germany’s renewable output nearly tripled from 19% to 56%, compensating for both the complete phase-out of its nuclear sector (which fell from 22% to 0%) and a 15-percentage-point decline in fossil fuel usage.

By contrast, France maintained the lowest fossil fuel share throughout the period, relying heavily on nuclear energy, which accounted for 75% of output in 2010 and 68% in 2025, while its renewable share rose modestly from 15% to 26%. Meanwhile, Poland experienced a nearly fourfold increase in renewable generation (from 9% to 34%), though fossil fuels still supplied two-thirds (66%) of its electricity in 2025.`,
    examinerNotes:
      'Band 8.0 Model Analysis: Clear 2-sentence Overview immediately after the introductory paraphrase, accurate grouping of Denmark/Germany vs. France/Poland, and varied numerical expressions ("nearly tripled", "fourfold increase", "two-thirds").',
    examinerNotesVi:
      'Phân tích Bài mẫu Band 8.0 (Tiếng Việt): Đoạn Overview 2 câu tóm gọn cả xu hướng chung (tăng điện tái tạo, giảm nhiên liệu hóa thạch) lẫn đặc điểm nổi bật nhất của từng nhóm nước. Cách diễn đạt số liệu linh hoạt: thay vì lặp lại "increased from 9% to 34%", bài viết dùng "a nearly fourfold increase" (tăng gần gấp 4 lần) và đổi "66%" thành "two-thirds" (hai phần ba).',
  },
];

export const SPEAKING_CUE_CARDS: SpeakingCueCard[] = [
  {
    id: 'sc_part1_study',
    part: 'Part 1: Interview',
    topic: 'Education',
    title: 'Academic Habits, Reading Preferences & Time Management',
    titleVi: 'Part 1: Thói quen Học tập, Sở thích Đọc sách & Quản lý Thời gian',
    prepSeconds: 15,
    speakSeconds: 45,
    prompts: [
      'Do you prefer studying in the morning or late at night, and why?',
      'How has the way you read books or articles changed over the past five years?',
      'What techniques do you use to stay focused when preparing for a demanding examination?',
    ],
    promptsVi: [
      'Bạn thích học vào buổi sáng sớm hay đêm muộn hơn, và tại sao?',
      'Cách bạn đọc sách hoặc đọc báo đã thay đổi như thế nào trong 5 năm qua?',
      'Bạn sử dụng phương pháp nào để giữ sự tập trung khi ôn luyện cho một kỳ thi khó?',
    ],
    sampleAnswer:
      'I am unequivocally an early riser when it comes to intellectually demanding work. Between six and nine in the morning, my cognitive stamina is at its peak and my phone is completely silent, which allows me to tackle dense academic reading without fragmenting my attention. Over the past five years, I have transitioned from skimming articles on my laptop to reading long-form essays on an e-ink tablet so I can annotate key collocations without social media distractions.',
    sampleAnswerVi:
      'Bản dịch Tiếng Việt: Tôi hoàn toàn là một người dậy sớm khi giải quyết các công việc đòi hỏi trí óc. Từ 6 đến 9 giờ sáng, sức bền nhận thức (cognitive stamina) của tôi ở mức đỉnh cao và điện thoại hoàn toàn im lặng, giúp tôi xử lý các bài đọc học thuật khó mà không bị phân tán sự chú ý. Trong 5 năm qua, tôi đã chuyển từ việc đọc lướt trên laptop sang đọc các bài luận dài trên máy đọc sách e-ink để có thể ghi chú các cụm từ hay mà không bị mạng xã hội làm xao nhãng.',
    keyLexicon: ['cognitive stamina (sức bền trí óc)', 'unequivocally (hoàn toàn/chắc chắn)', 'fragmenting my attention (làm phân mảnh sự chú ý)', 'long-form essays (bài luận dài)'],
  },
  {
    id: 'sc_part2_tech',
    part: 'Part 2: Cue Card Long Turn',
    topic: 'Technology',
    title: 'Describe a Digital Tool or Innovation That Improved Your Learning',
    titleVi: 'Part 2: Mô tả một Công cụ Kỹ thuật số giúp Cải thiện Việc Học của Bạn',
    prepSeconds: 60,
    speakSeconds: 120,
    prompts: [
      'You should say:',
      '• what this digital tool or innovation is and how you discovered it',
      '• how frequently you use it in your academic or professional routine',
      '• how it differs from traditional study methods',
      '• and explain why it has had such a lasting impact on your productivity.',
    ],
    promptsVi: [
      'Gợi ý dàn bài (Bạn nên nói về):',
      '• Công cụ kỹ thuật số đó là gì và bạn biết đến nó như thế nào',
      '• Tần suất bạn sử dụng nó trong học tập hoặc công việc hàng ngày',
      '• Nó khác biệt ra sao so với phương pháp ghi chép truyền thống',
      '• Và giải thích tại sao nó lại mang lại hiệu quả lâu dài cho năng suất của bạn.',
    ],
    sampleAnswer:
      'I would like to talk about spaced-repetition flashcard software, which fundamentally transformed how I retain academic English vocabulary. I first stumbled across the concept two years ago while reading an article on cognitive psychology and the Ebbinghaus forgetting curve. Previously, I used to fill notebooks with bilingual word lists and reread them passively before exams—a method that felt productive in the moment but led to rapid memory decay within a week. By contrast, an algorithmic spaced-repetition deck tests active recall right before I am about to forget a term, scheduling easy words weeks into the future while cycling difficult collocations daily. As a result, my active lexical resource during timed writing tasks has become far more precise and effortless.',
    sampleAnswerVi:
      'Bản dịch Tiếng Việt: Tôi muốn kể về phần mềm thẻ nhớ lặp lại ngắt quãng (SRS), công cụ đã thay đổi hoàn toàn cách tôi ghi nhớ từ vựng tiếng Anh học thuật. Tôi tình cờ biết đến khái niệm này 2 năm trước khi đọc một bài viết về tâm lý học nhận thức và đường cong quên lãng Ebbinghaus. Trước đây, tôi thường chép kín sổ tay các danh sách từ song ngữ rồi đọc lại một cách thụ động trước kỳ thi—cách này tạo cảm giác hiệu quả tức thời nhưng lại dẫn đến sự mai một trí nhớ nhanh chóng chỉ sau một tuần. Ngược lại, bộ thẻ lặp lại ngắt quãng bằng thuật toán kiểm tra khả năng chủ động gợi nhớ ngay trước thời điểm tôi sắp quên, đẩy các từ dễ ra nhiều tuần sau và xoay vòng các cụm từ khó hàng ngày.',
    keyLexicon: ['forgetting curve (đường cong quên lãng)', 'passive rereading (đọc lại thụ động)', 'memory decay (sự suy giảm trí nhớ)', 'active recall (chủ động gợi nhớ)'],
  },
  {
    id: 'sc_part3_env',
    part: 'Part 3: Abstract Discussion',
    topic: 'Environment',
    title: 'Corporate Responsibility vs. Individual Action in Climate Policy',
    titleVi: 'Part 3: Trách nhiệm Tập đoàn Công nghiệp so với Hành động Cá nhân trong Chính sách Khí hậu',
    prepSeconds: 20,
    speakSeconds: 90,
    prompts: [
      'To what extent should governments penalize industries rather than taxing individual consumers to reduce carbon emissions?',
      'Why do international environmental treaties often struggle to move from pledges to measurable enforcement?',
      'How might urban architecture evolve over the next thirty years to adapt to extreme weather patterns?',
    ],
    promptsVi: [
      'Chính phủ nên xử phạt các ngành công nghiệp nặng thay vì đánh thuế người tiêu dùng cá nhân ở mức độ nào để giảm khí thải carbon?',
      'Tại sao các hiệp ước môi trường quốc tế thường gặp khó khăn khi chuyển từ cam kết trên giấy sang thực thi thực tế?',
      'Kiến trúc đô thị trong 30 năm tới sẽ thay đổi như thế nào để thích ứng với thời tiết cực đoan?',
    ],
    sampleAnswer:
      'While individual lifestyle choices—such as reducing air travel or adopting a plant-rich diet—cultivate civic awareness, systemic decarbonization hinges predominantly on regulatory frameworks targeting heavy industry. A single municipal mandate requiring carbon-neutral steel or subsidizing grid-scale battery storage achieves more in a fiscal quarter than millions of uncoordinated household habits. However, international treaties frequently falter because industrial nations fear losing short-term export competitiveness if neighbouring economies do not enforce symmetrical carbon pricing.',
    sampleAnswerVi:
      'Bản dịch Tiếng Việt: Mặc dù lựa chọn lối sống cá nhân—như hạn chế đi máy bay hay ăn nhiều thực vật—giúp nuôi dưỡng ý thức công dân, quá trình khử carbon mang tính hệ thống phụ thuộc chủ yếu vào khung pháp lý nhắm vào công nghiệp nặng. Chỉ một quy định bắt buộc sử dụng thép trung hòa carbon hoặc trợ giá pin lưu trữ lưới điện cũng mang lại hiệu quả trong một quý tài chính lớn hơn hàng triệu thói quen rời rạc của từng hộ gia đình. Tuy nhiên, các hiệp ước quốc tế thường đình trệ vì các quốc gia công nghiệp lo sợ mất khả năng cạnh tranh xuất khẩu ngắn hạn nếu các nền kinh tế láng giềng không áp dụng mức định giá carbon tương xứng.',
    keyLexicon: ['systemic decarbonization (khử carbon hệ thống)', 'regulatory frameworks (khung pháp lý)', 'symmetrical carbon pricing (định giá carbon tương xứng)'],
  },
];

// 5. English News Reader Articles + Comprehensive Bilingual English-Vietnamese Dictionary
export const NEWS_ARTICLES: NewsArticleItem[] = [
  {
    id: 'news_1',
    title: 'The Quiet Revolution of Sponge Cities: How Urban Planners Are Reclaiming Rainwater',
    titleVi: 'Cuộc Cách mạng Thầm lặng của "Thành phố Bọt biển": Cách các Nhà quy hoạch Đô thị Thu hồi Nước mưa',
    sourcePublication: 'The Global Urbanist Review',
    topic: 'Environment',
    bandLevel: '6.0-7.0+',
    cefrLevel: 'C1',
    readTimeMinutes: 4,
    publishedDate: 'November 2026',
    imageUrl: NEWS_CLIMATE_IMAGE,
    summary:
      'Confronted with intensifying monsoon deluges and prolonged droughts, metropolitan architects from Copenhagen to Singapore are replacing impermeable concrete with porous wetlands.',
    summaryVi:
      'Tóm tắt Tiếng Việt: Đối mặt với những trận mưa xối xả ngày càng dữ dội và hạn hán kéo dài, các kiến trúc sư đô thị từ Copenhagen đến Singapore đang thay thế các bề mặt bê tông chống thấm bằng hệ thống đầm lầy và vỉa hè thấm nước.',
    paragraphs: [
      'For over a century, modern civil engineering treated rainwater as an inconvenience to be expelled as rapidly as possible through subterranean concrete culverts. Yet as climate volatility intensifies, this impermeable infrastructure has proven dangerously brittle. When torrential downpours overwhelm storm drains, flash floods paralyze transit corridors, while the diverted water is lost before it can replenish depleted underground aquifers.',
      'In response, a growing coalition of hydrologists and municipal architects has championed the "sponge city" paradigm. Rather than channeling runoff into concrete pipes, sponge cities deploy permeable pavements, sunken bioswales, and interconnected urban wetlands that absorb, filter, and store up to seventy percent of annual rainfall on site. During subsequent dry spells, this captured reservoir is gradually released to irrigate parks and cool surrounding micro-climates through natural evapotranspiration.',
      'Crucially, economic audits from pilot districts in Rotterdam and Wuhan demonstrate that green hydrological infrastructure is substantially more cost-effective than endlessly expanding underground mega-tunnels. Beyond mitigating flood damage, restored urban waterways foster biodiversity and provide residents with tranquil recreational sanctuaries—proving that ecological resilience and civic livability can reinforce one another.',
    ],
    paragraphsVi: [
      'Trong hơn một thế kỷ, ngành kỹ thuật dân dụng hiện đại đã coi nước mưa như một sự phiền toái cần phải tống khứ càng nhanh càng tốt qua các cống bê tông ngầm dưới lòng đất. Thế nhưng khi sự biến động khí hậu ngày càng gay gắt, cơ sở hạ tầng không thấm nước này đã bộc lộ sự mong manh nguy hiểm. Khi những trận mưa như trút nước làm quá tải hệ thống thoát nước, lũ quét làm tê liệt các tuyến giao thông, trong khi lượng nước bị đẩy đi lại thất thoát trước khi kịp bổ sung cho các tầng nước ngầm đang cạn kiệt.',
      'Để ứng phó, một liên minh ngày càng đông đảo các nhà thủy văn học và kiến trúc sư đô thị đã khởi xướng mô hình "thành phố bọt biển" (sponge city). Thay vì dồn dòng chảy vào ống bê tông, các thành phố bọt biển sử dụng vỉa hè thấm nước, rãnh sinh học trũng và hệ thống đầm lầy đô thị liên thông giúp hấp thụ, lọc và tích trữ tới 70% lượng mưa hàng năm ngay tại chỗ. Trong những đợt khô hạn tiếp theo, nguồn nước dự trữ này được giải phóng từ từ để tưới tiêu công viên và làm mát vi khí hậu xung quanh thông qua quá trình bốc thoát hơi nước tự nhiên.',
      'Quan trọng hơn, các cuộc kiểm toán kinh tế từ những quận thí điểm ở Rotterdam và Vũ Hán chứng minh rằng hạ tầng thủy văn xanh tiết kiệm chi phí hơn nhiều so với việc mở rộng vô tận các siêu đường hầm ngầm. Ngoài việc giảm thiểu thiệt hại do lũ lụt, các tuyến đường thủy đô thị được phục hồi còn thúc đẩy đa dạng sinh học và mang lại không gian nghỉ ngơi yên bình cho cư dân—chứng minh rằng khả năng chống chịu sinh thái và chất lượng sống đô thị có thể củng cố lẫn nhau.',
    ],
    comprehensionQuestions: [
      {
        id: 'nq_1',
        question: 'What is the primary flaw of traditional twentieth-century storm-water engineering described in paragraph 1?',
        questionVi: 'Điểm yếu chính của kỹ thuật thoát nước mưa truyền thống thế kỷ 20 được mô tả trong đoạn 1 là gì?',
        options: [
          'It relies too heavily on wooden bridges.',
          'Impermeable concrete channels expel water too fast, causing flash floods while failing to recharge underground aquifers.',
          'It stores too much rainwater inside residential basements.',
          'It prohibits public transit corridors.',
        ],
        correctIndex: 1,
        explanation: 'Paragraph 1 explains that impermeable concrete overwhelms drains during downpours and prevents water from replenishing depleted aquifers.',
        explanationVi: 'Giải thích Tiếng Việt: Đoạn 1 nêu rõ cơ sở hạ tầng bê tông không thấm nước (impermeable infrastructure) vừa làm quá tải cống thoát gây lũ quét (flash floods), vừa làm mất nguồn nước trước khi kịp bổ sung cho các tầng nước ngầm bị cạn kiệt (replenish depleted underground aquifers).',
      },
      {
        id: 'nq_2',
        question: 'How do "sponge cities" utilize captured rainwater during dry periods?',
        questionVi: 'Các "thành phố bọt biển" tận dụng lượng nước mưa thu giữ được vào mùa khô như thế nào?',
        options: [
          'They export it by tanker ship to neighbouring countries.',
          'They release it to irrigate green spaces and cool urban micro-climates via evapotranspiration.',
          'They boil it to generate steam electricity.',
          'They freeze it in subterranean vaults.',
        ],
        correctIndex: 1,
        explanation: 'Paragraph 2 states that the captured reservoir is released to irrigate parks and cool micro-climates through evapotranspiration.',
        explanationVi: 'Giải thích Tiếng Việt: Câu cuối Đoạn 2 chỉ rõ vào mùa khô ("During subsequent dry spells"), lượng nước dự trữ được xả ra từ từ để tưới công viên ("irrigate parks") và làm mát vi khí hậu thông qua sự bốc thoát hơi nước ("evapotranspiration").',
      },
    ],
  },
  {
    id: 'news_2',
    title: 'Why Four-Day Academic Weeks Are Reshaping University Research Productivity',
    titleVi: 'Tại sao Tuần học 4 Ngày Đang Tái định hình Năng suất Nghiên cứu Đại học',
    sourcePublication: 'Higher Education Chronicle',
    topic: 'Education',
    bandLevel: '5.0-6.0',
    cefrLevel: 'B2',
    readTimeMinutes: 3,
    publishedDate: 'November 2026',
    summary:
      'Universities trialing consolidated lecture schedules report sharper student attendance, lower burnout, and deeper independent scholarship.',
    summaryVi:
      'Tóm tắt Tiếng Việt: Các trường đại học thử nghiệm lịch học tập trung 4 ngày/tuần ghi nhận tỷ lệ chuyên cần cao hơn, giảm kiệt sức và nâng cao chất lượng luận văn.',
    paragraphs: [
      'Across twelve European and Asia-Pacific universities, administrators have begun consolidating undergraduate lectures into four structured days, reserving Wednesdays or Fridays exclusively for uninterrupted laboratory research and independent reading. Initially, sceptics warned that compressing seminar timetables would overwhelm first-year students and reduce faculty availability.',
      'Empirical data collected over four semesters tells a remarkably different story. Faculties participating in the consolidated schedule recorded a nineteen percent drop in student absenteeism and a marked improvement in dissertation submission quality. Cognitive psychologists attribute this gain to reduced context-switching: when learners do not have to commute for a single fifty-minute lecture, they can sustain deep analytical focus for several hours at a time.',
      'Nevertheless, education researchers emphasize that a four-day lecture calendar requires disciplined self-regulation. Institutions that paired the schedule with structured peer-study groups and library mentoring saw the strongest grade improvements, particularly among foundation-level international scholars.',
    ],
    paragraphsVi: [
      'Tại 12 trường đại học ở châu Âu và châu Á – Thái Bình Dương, ban giám hiệu đã bắt đầu gom lịch giảng dạy đại học vào 4 ngày cố định, dành trọn thứ Tư hoặc thứ Sáu cho việc nghiên cứu phòng thí nghiệm không bị gián đoạn và tự đọc sách chuyên sâu. Ban đầu, những người hoài nghi cảnh báo rằng việc nén thời khóa biểu sẽ làm quá tải sinh viên năm nhất.',
      'Dữ liệu thực nghiệm thu thập qua 4 học kỳ lại kể một câu chuyện hoàn toàn khác. Các khoa tham gia lịch học tập trung ghi nhận tỷ lệ sinh viên vắng mặt giảm 19% và chất lượng khóa luận tốt nghiệp tăng rõ rệt. Các nhà tâm lý học nhận thức lý giải thành quả này là nhờ giảm sự phân mảnh chuyển đổi ngữ cảnh (context-switching): khi người học không phải di chuyển chỉ để nghe một tiết học 50 phút, họ có thể duy trì sự tập trung phân tích sâu suốt nhiều giờ liền.',
      'Tuy nhiên, các nhà nghiên cứu giáo dục nhấn mạnh rằng lịch học 4 ngày đòi hỏi kỷ luật tự giác cao. Những trường kết hợp lịch học này với nhóm học tập đồng đẳng và cố vấn thư viện đã đạt mức cải thiện điểm số mạnh nhất, đặc biệt ở nhóm du học sinh trình độ nền tảng.',
    ],
    comprehensionQuestions: [
      {
        id: 'nq_2_1',
        question: 'According to cognitive psychologists in paragraph 2, why did dissertation quality improve under the consolidated schedule?',
        questionVi: 'Theo các nhà tâm lý học nhận thức ở đoạn 2, tại sao chất lượng luận văn lại được cải thiện nhờ lịch học tập trung?',
        options: [
          'Exams were made significantly easier.',
          'Reduced context-switching and fewer fragmented commutes allowed students to sustain deep analytical focus.',
          'Lectures were shortened to ten minutes.',
          'Students stopped using the university library.',
        ],
        correctIndex: 1,
        explanation: 'Paragraph 2 links the improvement to reduced context-switching and sustained analytical focus.',
        explanationVi: 'Giải thích Tiếng Việt: Đoạn 2 chỉ rõ nhờ giảm việc chuyển đổi ngữ cảnh liên tục ("reduced context-switching") và không phải đi lại lắt nhắt cho các ca học lẻ, sinh viên duy trì được sự tập trung phân tích sâu ("sustain deep analytical focus").',
      },
    ],
  },
  {
    id: 'news_3',
    title: 'Community Micro-Grids Bring Reliable Solar Power to Remote Island Clinics',
    titleVi: 'Lưới điện Nhỏ Cộng đồng Mang Điện mặt trời Ổn định đến các Trạm Y tế Đảo xa',
    sourcePublication: 'Civic Technology Digest',
    topic: 'Technology',
    bandLevel: '3.5-5.0',
    cefrLevel: 'B1',
    readTimeMinutes: 3,
    publishedDate: 'November 2026',
    summary:
      'Local engineers are combining rooftop solar panels with shared battery banks to keep rural medical refrigerators running around the clock.',
    summaryVi:
      'Tóm tắt Tiếng Việt: Các kỹ sư địa phương đang kết hợp tấm pin mặt trời áp mái với hệ thống pin lưu trữ để giữ cho tủ lạnh bảo quản vắc-xin tại các trạm xá đảo xa hoạt động 24/7.',
    paragraphs: [
      'For decades, small island health clinics relied on noisy diesel generators to power vaccine refrigerators and diagnostic lighting. Whenever fuel ferries were delayed by seasonal typhoons, doctors faced sudden power outages that spoiled essential medicines and halted evening consultations.',
      'Today, decentralized solar micro-grids are solving this problem across dozens of coastal villages. By linking rooftop photovoltaic panels to lithium-iron battery banks, clinics can store clean electricity during sunny afternoons and draw steady power throughout the night. Local technicians receive practical training to maintain the inverters, creating skilled employment within the community.',
      'Within the first year of operation, participating clinics reduced their energy expenditure by sixty percent and achieved uninterrupted vaccine cold-chain storage even during severe storm weeks.',
    ],
    paragraphsVi: [
      'Trong nhiều thập kỷ, các trạm y tế trên các hòn đảo nhỏ phải phụ thuộc vào máy phát điện chạy dầu diesel ồn ào để cấp điện cho tủ lạnh bảo quản vắc-xin và đèn khám bệnh. Mỗi khi tàu chở nhiên liệu bị trì hoãn do bão theo mùa, các bác sĩ lại đối mặt với tình trạng mất điện đột ngột làm hỏng thuốc thiết yếu và buộc phải ngừng khám buổi tối.',
      'Ngày nay, các lưới điện nhỏ năng lượng mặt trời phi tập trung đang giải quyết triệt để vấn đề này tại hàng chục ngôi làng ven biển. Bằng cách kết nối các tấm pin quang điện áp mái với hệ thống pin lưu trữ lithium-sắt, trạm xá có thể tích trữ điện sạch vào buổi chiều nắng và sử dụng nguồn điện ổn định suốt đêm. Kỹ thuật viên địa phương được đào tạo thực hành để bảo trì bộ biến tần, tạo ra việc làm có tay nghề ngay tại cộng đồng.',
      'Chỉ trong năm đầu tiên vận hành, các trạm y tế tham gia đã cắt giảm 60% chi phí năng lượng và duy trì chuỗi bảo quản lạnh vắc-xin không gián đoạn ngay cả trong những tuần bão lớn.',
    ],
    comprehensionQuestions: [
      {
        id: 'nq_3_1',
        question: 'What problem occurred when diesel fuel ferries were delayed by typhoons?',
        questionVi: 'Vấn đề gì đã xảy ra khi tàu chở dầu diesel bị trễ do bão?',
        options: [
          'Clinics experienced power outages that spoiled vaccines and stopped evening consultations.',
          'Solar panels automatically doubled their output.',
          'Hospitals moved to mainland cities.',
          'Electricity prices dropped to zero.',
        ],
        correctIndex: 0,
        explanation: 'Paragraph 1 states that delayed fuel ferries caused power outages that spoiled essential medicines.',
        explanationVi: 'Giải thích Tiếng Việt: Câu cuối Đoạn 1 nêu rõ khi phà chở dầu bị trễ do bão, bác sĩ gặp cảnh mất điện đột ngột ("sudden power outages") làm hỏng thuốc thiết yếu ("spoiled essential medicines") và ngừng khám buổi tối.',
      },
    ],
  },
];

// Bilingual English-Vietnamese Dictionary for Instant Word Click in the News Reader
export const ACADEMIC_DICTIONARY: Record<
  string,
  {
    phonetic: string;
    partOfSpeech: string;
    vietnameseMeaning: string;
    definition: string;
    cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  }
> = {
  impermeable: {
    phonetic: '/ɪmˈpɜːmiəbəl/',
    partOfSpeech: 'adjective (tính từ)',
    vietnameseMeaning: 'không thấm nước, chống thấm',
    definition: 'Not allowing fluid or water to pass through.',
    cefrLevel: 'C1',
  },
  subterranean: {
    phonetic: '/ˌsʌbtəˈreɪniən/',
    partOfSpeech: 'adjective (tính từ)',
    vietnameseMeaning: 'ngầm dưới lòng đất',
    definition: 'Existing, occurring, or done under the earth’s surface.',
    cefrLevel: 'C1',
  },
  culverts: {
    phonetic: '/ˈkʌlvəts/',
    partOfSpeech: 'noun (danh từ)',
    vietnameseMeaning: 'cống ngầm dẫn nước dưới đường',
    definition: 'Underground tunnels or drains carrying water under a road or railway.',
    cefrLevel: 'C1',
  },
  volatility: {
    phonetic: '/ˌvɒləˈtɪləti/',
    partOfSpeech: 'noun (danh từ)',
    vietnameseMeaning: 'sự biến động mạnh, tính bất ổn',
    definition: 'Liability to change rapidly and unpredictably, especially for the worse.',
    cefrLevel: 'C1',
  },
  brittle: {
    phonetic: '/ˈbrɪtəl/',
    partOfSpeech: 'adjective (tính từ)',
    vietnameseMeaning: 'giòn, dễ gãy vỡ, mong manh trước áp lực',
    definition: 'Hard but liable to break or fail easily under stress; fragile.',
    cefrLevel: 'B2',
  },
  torrential: {
    phonetic: '/təˈrenʃəl/',
    partOfSpeech: 'adjective (tính từ)',
    vietnameseMeaning: 'xối xả, như trút nước (mưa)',
    definition: 'Falling rapidly and in copious quantities (especially of rain).',
    cefrLevel: 'C1',
  },
  replenish: {
    phonetic: '/rɪˈplenɪʃ/',
    partOfSpeech: 'verb (động từ)',
    vietnameseMeaning: 'bổ sung, làm đầy lại',
    definition: 'Fill something up again; restore to a former level or condition.',
    cefrLevel: 'B2',
  },
  aquifers: {
    phonetic: '/ˈækwɪfəz/',
    partOfSpeech: 'noun (danh từ)',
    vietnameseMeaning: 'tầng chứa nước ngầm',
    definition: 'Underground layers of water-bearing permeable rock, sand, or gravel.',
    cefrLevel: 'C1',
  },
  paradigm: {
    phonetic: '/ˈpærədaɪm/',
    partOfSpeech: 'noun (danh từ)',
    vietnameseMeaning: 'mô hình mẫu, hệ tư tưởng',
    definition: 'A typical example, pattern, or conceptual framework of something.',
    cefrLevel: 'C1',
  },
  permeable: {
    phonetic: '/ˈpɜːmiəbəl/',
    partOfSpeech: 'adjective (tính từ)',
    vietnameseMeaning: 'có thể thấm qua, thấm nước',
    definition: 'Allowing liquids or gases to pass through it.',
    cefrLevel: 'B2',
  },
  reservoir: {
    phonetic: '/ˈrezəvwɑː/',
    partOfSpeech: 'noun (danh từ)',
    vietnameseMeaning: 'hồ chứa, nguồn dự trữ',
    definition: 'A large natural or artificial supply or reserve of water.',
    cefrLevel: 'B2',
  },
  irrigate: {
    phonetic: '/ˈɪrɪɡeɪt/',
    partOfSpeech: 'verb (động từ)',
    vietnameseMeaning: 'tưới tiêu (cho cây trồng, công viên)',
    definition: 'Supply water to land or crops to help growth.',
    cefrLevel: 'B2',
  },
  evapotranspiration: {
    phonetic: '/ɪˌvæpəʊtrænspɪˈreɪʃən/',
    partOfSpeech: 'noun (danh từ)',
    vietnameseMeaning: 'quá trình bốc thoát hơi nước tự nhiên',
    definition: 'The process by which water is transferred from the land to the atmosphere by evaporation and plant transpiration.',
    cefrLevel: 'C1',
  },
  mitigating: {
    phonetic: '/ˈmɪtɪɡeɪtɪŋ/',
    partOfSpeech: 'verb (động từ)',
    vietnameseMeaning: 'giảm thiểu, làm dịu bớt thiệt hại',
    definition: 'Making less severe, serious, or destructive.',
    cefrLevel: 'B2',
  },
  biodiversity: {
    phonetic: '/ˌbaɪəʊdaɪˈvɜːsəti/',
    partOfSpeech: 'noun (danh từ)',
    vietnameseMeaning: 'sự đa dạng sinh học',
    definition: 'The variety of plant and animal life in the world or in a particular habitat.',
    cefrLevel: 'B2',
  },
  resilience: {
    phonetic: '/rɪˈzɪliəns/',
    partOfSpeech: 'noun (danh từ)',
    vietnameseMeaning: 'khả năng chống chịu và phục hồi nhanh',
    definition: 'The capacity to recover quickly from difficulties or adapt to shock.',
    cefrLevel: 'B2',
  },
  consolidating: {
    phonetic: '/kənˈsɒlɪdeɪtɪŋ/',
    partOfSpeech: 'verb (động từ)',
    vietnameseMeaning: 'hợp nhất, gom lại thành khối thống nhất',
    definition: 'Combining a number of things into a single more effective or coherent whole.',
    cefrLevel: 'B2',
  },
  sceptics: {
    phonetic: '/ˈskeptɪks/',
    partOfSpeech: 'noun (danh từ)',
    vietnameseMeaning: 'những người hoài nghi',
    definition: 'People inclined to question or doubt accepted opinions or proposals.',
    cefrLevel: 'B2',
  },
  empirical: {
    phonetic: '/ɪmˈpɪrɪkəl/',
    partOfSpeech: 'adjective (tính từ)',
    vietnameseMeaning: 'thực nghiệm (dựa trên quan sát và số liệu thực tế)',
    definition: 'Based on, concerned with, or verifiable by observation or experience rather than pure theory.',
    cefrLevel: 'C1',
  },
  absenteeism: {
    phonetic: '/ˌæbsənˈtiːɪzəm/',
    partOfSpeech: 'noun (danh từ)',
    vietnameseMeaning: 'tình trạng vắng mặt, nghỉ học/nghỉ làm không lý do',
    definition: 'The practice of regularly staying away from work or school without good reason.',
    cefrLevel: 'B2',
  },
  dissertation: {
    phonetic: '/ˌdɪsəˈteɪʃən/',
    partOfSpeech: 'noun (danh từ)',
    vietnameseMeaning: 'luận văn, khóa luận tốt nghiệp',
    definition: 'A long essay on a particular subject, especially one written for a university degree.',
    cefrLevel: 'B2',
  },
  decentralized: {
    phonetic: '/diːˈsentrəlaɪzd/',
    partOfSpeech: 'adjective (tính từ)',
    vietnameseMeaning: 'phi tập trung, phân tán về địa phương',
    definition: 'Distributed away from a single central location or authority.',
    cefrLevel: 'B2',
  },
  photovoltaic: {
    phonetic: '/ˌfəʊtəʊvɒlˈteɪɪk/',
    partOfSpeech: 'adjective (tính từ)',
    vietnameseMeaning: 'quang điện (biến ánh sáng mặt trời thành điện)',
    definition: 'Relating to the production of electric current at the junction of two substances exposed to light.',
    cefrLevel: 'C1',
  },
  expenditure: {
    phonetic: '/ɪkˈspendɪtʃə/',
    partOfSpeech: 'noun (danh từ)',
    vietnameseMeaning: 'chi phí, khoản chi tiêu',
    definition: 'The action of spending funds, or the total amount of money spent.',
    cefrLevel: 'B2',
  },
  rainwater: {
    phonetic: '/ˈreɪnwɔːtə/',
    partOfSpeech: 'noun (danh từ)',
    vietnameseMeaning: 'nước mưa',
    definition: 'Water that has fallen as rain.',
    cefrLevel: 'A2',
  },
  infrastructure: {
    phonetic: '/ˈɪnfrəstrʌktʃə/',
    partOfSpeech: 'noun (danh từ)',
    vietnameseMeaning: 'cơ sở hạ tầng',
    definition: 'The basic physical and organizational structures and facilities needed for the operation of a society.',
    cefrLevel: 'B2',
  },
  outages: {
    phonetic: '/ˈaʊtɪdʒɪz/',
    partOfSpeech: 'noun (danh từ)',
    vietnameseMeaning: 'sự cố mất điện, ngừng hoạt động',
    definition: 'Periods when a power supply or other service is not available.',
    cefrLevel: 'B2',
  },
};

export function lookupWordDefinition(rawWord: string, contextSentence: string) {
  const cleaned = rawWord.replace(/[^a-zA-Z-]/g, '').toLowerCase();
  if (!cleaned) return null;

  const direct = ACADEMIC_DICTIONARY[cleaned];
  if (direct) {
    return {
      word: cleaned,
      ...direct,
      exampleSentence: contextSentence,
    };
  }

  const stems = [
    cleaned.replace(/s$/, ''),
    cleaned.replace(/ed$/, ''),
    cleaned.replace(/ing$/, ''),
    cleaned.replace(/ly$/, ''),
  ];
  for (const s of stems) {
    if (ACADEMIC_DICTIONARY[s]) {
      return {
        word: cleaned,
        ...ACADEMIC_DICTIONARY[s],
        exampleSentence: contextSentence,
      };
    }
  }

  let partOfSpeech = 'noun / academic term (danh từ / thuật ngữ)';
  let viType = 'danh từ / thuật ngữ ngữ cảnh';
  if (cleaned.endsWith('ly')) {
    partOfSpeech = 'adverb (trạng từ)';
    viType = 'trạng từ bổ nghĩa trong câu';
  } else if (cleaned.endsWith('ous') || cleaned.endsWith('ive') || cleaned.endsWith('al') || cleaned.endsWith('able')) {
    partOfSpeech = 'adjective (tính từ)';
    viType = 'tính từ miêu tả tính chất';
  } else if (cleaned.endsWith('tion') || cleaned.endsWith('ment') || cleaned.endsWith('ity') || cleaned.endsWith('ness')) {
    partOfSpeech = 'noun (danh từ)';
    viType = 'danh từ chỉ sự việc/khái niệm';
  } else if (cleaned.endsWith('ize') || cleaned.endsWith('ate') || cleaned.endsWith('ify') || cleaned.endsWith('ing') || cleaned.endsWith('ed')) {
    partOfSpeech = 'verb / participle (động từ / phân từ)';
    viType = 'động từ / phân từ hành động';
  }

  const cefrLevel: 'A2' | 'B1' | 'B2' | 'C1' =
    cleaned.length >= 10 ? 'C1' : cleaned.length >= 7 ? 'B2' : cleaned.length >= 5 ? 'B1' : 'A2';

  return {
    word: cleaned,
    phonetic: `/${cleaned.slice(0, 12)}/`,
    partOfSpeech,
    vietnameseMeaning: `Từ vựng học thuật "${cleaned}" (${viType}) — Xem bản dịch đoạn văn bên dưới hoặc lưu vào thẻ SRS để ôn tập.`,
    definition: `Contextual academic term ("${cleaned}") used in IELTS reading discourse.`,
    cefrLevel,
    exampleSentence: contextSentence,
  };
}

// 6. Video Shadowing & Listen-Fill Studio Lessons (Pre-loaded with Short YouTube Videos across Anime, Animation, Movies, and Academic)
export const SHADOWING_LESSONS: ShadowingVideoLesson[] = [
  {
    id: 'sh_anime_1',
    title: 'Anime Short: Starlight & Distant Memories (Shinkai Style)',
    titleVi: 'Anime: Ánh Sao & Ký Ức Xa Xăm (Luyện Nghe Điền Từ & Shadowing)',
    category: 'Anime',
    speakerName: 'Mitsuha & Taki (English Dub Voiceover)',
    accent: 'Clear Expressive English Dub',
    bandLevel: '3.5-5.0',
    topic: 'Society',
    durationSeconds: 32,
    youtubeId: 'WhWc3b3KhnY',
    posterUrl: SHADOWING_LECTURE_IMAGE,
    sentences: [
      {
        id: 'sa_1',
        startTime: 0,
        endTime: 8,
        speaker: 'Narrator',
        text: 'Every morning when I wake up, I feel as though I have lost something precious.',
        translationVi: 'Mỗi buổi sáng khi thức dậy, tôi đều cảm thấy như thể mình vừa đánh mất một điều gì đó vô cùng quý giá.',
        phoneticFocus: '/ˈpreʃəs/ (precious)',
        stressTip: 'Link "wake_up" and place emotional falling stress on "precious".',
        stressTipVi: 'Nối âm "wake_up" và nhấn giọng truyền cảm vào từ "precious" (quý giá).',
        clozeWord: 'precious',
        clozeHintVi: 'quý giá, trân quý (tính từ, 8 chữ cái, bắt đầu bằng P)',
        clozeExplanationEn: '"Precious" (/ˈpreʃəs/) is an adjective meaning of great value; not to be wasted or treated carelessly.',
        clozeExplanationVi: 'Giải thích: "Precious" (/ˈpreʃəs/ - tính từ) nghĩa là quý giá, vô giá. Cụm "something precious" (một điều gì đó quý giá) đặt tính từ sau đại từ bất định "something".',
      },
      {
        id: 'sa_2',
        startTime: 8,
        endTime: 16,
        speaker: 'Protagonist',
        text: 'Even if the timeline changes, I will search across the horizon to remember your name.',
        translationVi: 'Ngay cả khi dòng thời gian thay đổi, tôi vẫn sẽ tìm kiếm khắp chân trời để nhớ lại tên của bạn.',
        phoneticFocus: '/həˈraɪzən/ (horizon)',
        stressTip: 'Stress the second syllable in "ho-RI-zon" and hold the diphthong /aɪ/.',
        stressTipVi: 'Nhấn trọng âm vào âm tiết thứ hai của từ "ho-RI-zon" (/həˈraɪzən/ - chân trời).',
        clozeWord: 'horizon',
        clozeHintVi: 'đường chân trời (danh từ, 7 chữ cái, bắt đầu bằng H)',
        clozeExplanationEn: '"Horizon" refers to the line at which the earth’s surface and the sky appear to meet.',
        clozeExplanationVi: 'Giải thích: "Horizon" (/həˈraɪzən/ - danh từ) là đường chân trời. Cụm "across the horizon" mang nghĩa ẩn dụ là đi khắp chân trời góc bể.',
      },
      {
        id: 'sa_3',
        startTime: 16,
        endTime: 24,
        speaker: 'Narrator',
        text: 'Our memories may fade like twilight, yet the promise remains engraved in our hearts.',
        translationVi: 'Ký ức của chúng ta có thể phai nhạt như ánh hoàng hôn, nhưng lời hứa vẫn khắc sâu trong tim.',
        phoneticFocus: '/ɪnˈɡreɪvd/ (engraved)',
        stressTip: 'Pause slightly before "yet" to highlight the contrast.',
        stressTipVi: 'Ngắt nhịp nhẹ trước liên từ "yet" (nhưng) và phát âm rõ âm cuối /vd/ trong "engraved".',
        clozeWord: 'engraved',
        clozeHintVi: 'được khắc sâu, ghi tạc (quá khứ phân từ, 8 chữ cái, bắt đầu bằng E)',
        clozeExplanationEn: '"Engraved" means carved or permanently imprinted on a surface or in one’s memory.',
        clozeExplanationVi: 'Giải thích: "Engraved" (/ɪnˈɡreɪvd/) nghĩa là được chạm khắc hoặc khắc sâu vào tâm trí ("engraved in our hearts").',
      },
      {
        id: 'sa_4',
        startTime: 24,
        endTime: 32,
        speaker: 'Protagonist',
        text: 'Courage is not the absence of fear, but the determination to move forward.',
        translationVi: 'Lòng dũng cảm không phải là sự vắng bóng của nỗi sợ, mà là sự quyết tâm tiến về phía trước.',
        phoneticFocus: '/dɪˌtɜːmɪˈneɪʃən/ (determination)',
        stressTip: 'Emphasize "determination" on the fourth syllable (-NA-).',
        stressTipVi: 'Nhấn mạnh âm tiết thứ tư "-NA-" trong từ "de-ter-mi-NA-tion" (sự quyết tâm).',
        clozeWord: 'determination',
        clozeHintVi: 'sự quyết tâm, ý chí kiên định (danh từ, 13 chữ cái, bắt đầu bằng D)',
        clozeExplanationEn: '"Determination" is a B2/C1 noun meaning firmness of purpose and resolve.',
        clozeExplanationVi: 'Giải thích: "Determination" (danh từ B2) là sự quyết tâm, kiên định. Cấu trúc "not A, but B" (không phải A, mà là B) giúp câu nói cực kỳ ấn tượng trong IELTS Speaking.',
      },
    ],
  },
  {
    id: 'sh_anim_2',
    title: '3D Animation Short: Sintel & The Mountain Journey',
    titleVi: 'Hoạt hình 3D: Hành Trình Vượt Núi Của Sintel (Blender Open Movie)',
    category: 'Animation',
    speakerName: 'Sintel & Scales (3D Animated Short)',
    accent: 'Natural Conversational Storytelling',
    bandLevel: '3.5-5.0',
    topic: 'Environment',
    durationSeconds: 32,
    youtubeId: 'eRsGyueVLvQ',
    posterUrl: NEWS_CLIMATE_IMAGE,
    sentences: [
      {
        id: 'san_1',
        startTime: 0,
        endTime: 8,
        speaker: 'Sintel',
        text: 'Through the freezing blizzard, the young traveler searched for her companion.',
        translationVi: 'Xuyên qua cơn bão tuyết giá lạnh, người lữ khách trẻ tuổi vẫn miệt mài tìm kiếm người bạn đồng hành.',
        phoneticFocus: '/kəmˈpænjən/ (companion)',
        stressTip: 'Reduce the first vowel in "kəm-PAN-yən" to a soft schwa /ə/.',
        stressTipVi: 'Đọc nhẹ âm đầu là /kəm/ và nhấn trọng âm vào âm hai "-PAN-" trong "companion".',
        clozeWord: 'companion',
        clozeHintVi: 'người bạn đồng hành (danh từ, 9 chữ cái, bắt đầu bằng C)',
        clozeExplanationEn: '"Companion" is a B2 noun referring to a person or animal with whom one spends a lot of time or travels.',
        clozeExplanationVi: 'Giải thích: "Companion" (/kəmˈpænjən/) là người bạn đồng hành—từ thay thế học thuật rất hay cho từ "friend" trong IELTS Speaking Part 2.',
      },
      {
        id: 'san_2',
        startTime: 8,
        endTime: 16,
        speaker: 'Shaman',
        text: 'Every ancient forest protects a fragile balance between nature and humanity.',
        translationVi: 'Mỗi khu rừng cổ đại đều bảo vệ một sự cân bằng mong manh giữa thiên nhiên và con người.',
        phoneticFocus: '/ˈfrædʒaɪl/ (fragile)',
        stressTip: 'In British English, pronounce "fragile" as /ˈfrædʒaɪl/.',
        stressTipVi: 'Chú ý âm /dʒ/ ở giữa từ "fragile" (mong manh, dễ tổn thương).',
        clozeWord: 'fragile',
        clozeHintVi: 'mong manh, dễ vỡ, dễ tổn thương (tính từ, 7 chữ cái, bắt đầu bằng F)',
        clozeExplanationEn: '"Fragile balance" is a high-scoring collocation for Environment essays meaning a delicate equilibrium.',
        clozeExplanationVi: 'Giải thích: Cụm collocation "a fragile balance" (một sự cân bằng mong manh) cực kỳ đắt giá khi viết IELTS Writing Task 2 chủ đề Môi trường.',
      },
      {
        id: 'san_3',
        startTime: 16,
        endTime: 24,
        speaker: 'Sintel',
        text: 'Instead of surrendering to exhaustion, she climbed toward the distant summit.',
        translationVi: 'Thay vì đầu hàng trước sự kiệt sức, cô ấy vẫn leo về phía đỉnh núi xa xôi.',
        phoneticFocus: '/ɪɡˈzɔːstʃən/ (exhaustion)',
        stressTip: 'The "h" in "exhaustion" is silent: /ɪɡˈzɔːstʃən/.',
        stressTipVi: 'Lưu ý âm "h" trong từ "exhaustion" là âm câm, đọc là /ɪɡˈzɔːstʃən/ (sự kiệt sức).',
        clozeWord: 'exhaustion',
        clozeHintVi: 'sự kiệt sức, mệt nhoài (danh từ, 10 chữ cái, bắt đầu bằng E)',
        clozeExplanationEn: '"Exhaustion" is a state of extreme physical or mental tiredness.',
        clozeExplanationVi: 'Giải thích: "Exhaustion" (/ɪɡˈzɔːstʃən/) là danh từ của động từ "exhaust", nghĩa là trạng thái kiệt sức hoàn toàn.',
      },
    ],
  },
  {
    id: 'sh_movie_3',
    title: 'Sci-Fi Cinema Scene: Tears of Steel — Saving the Future',
    titleVi: 'Phim Điện Ảnh Sci-Fi: Tears of Steel — Giải Cứu Tương Lai',
    category: 'Movies',
    speakerName: 'Thom & Celia (Sci-Fi Short Film)',
    accent: 'Cinematic International English',
    bandLevel: '5.0-6.0',
    topic: 'Technology',
    durationSeconds: 28,
    youtubeId: 'R6MlUcmOul8',
    posterUrl: HERO_LIBRARY_IMAGE,
    sentences: [
      {
        id: 'sm_1',
        startTime: 0,
        endTime: 9,
        speaker: 'Commander',
        text: 'Artificial intelligence was designed to protect civilization, not to replace human judgment.',
        translationVi: 'Trí tuệ nhân tạo được thiết kế để bảo vệ nền văn minh, chứ không phải để thay thế phán đoán của con người.',
        phoneticFocus: '/ˌsɪvəlaɪˈzeɪʃən/ (civilization)',
        stressTip: 'Pause sharply at the comma before "not to replace".',
        stressTipVi: 'Ngắt giọng dứt khoát ở dấu phẩy trước cụm đối lập "not to replace".',
        clozeWord: 'civilization',
        clozeHintVi: 'nền văn minh (danh từ, 12 chữ cái, bắt đầu bằng C)',
        clozeExplanationEn: '"Civilization" refers to the stage of human social and cultural development and organization.',
        clozeExplanationVi: 'Giải thích: "Civilization" (/ˌsɪvəlaɪˈzeɪʃən/) là nền văn minh nhân loại—từ vựng trọng tâm cho chủ đề Công nghệ & Xã hội.',
      },
      {
        id: 'sm_2',
        startTime: 9,
        endTime: 18,
        speaker: 'Scientist',
        text: 'If we alter the original memory code, the consequences will be irreversible.',
        translationVi: 'Nếu chúng ta thay đổi mã ký ức gốc, hậu quả sẽ không thể đảo ngược được.',
        phoneticFocus: '/ˌɪrɪˈvɜːsəbəl/ (irreversible)',
        stressTip: 'Stress the third syllable "-VER-" in "ir-re-VER-si-ble".',
        stressTipVi: 'Nhấn trọng âm vào âm tiết thứ ba "-VER-" trong từ "irreversible" (không thể đảo ngược).',
        clozeWord: 'irreversible',
        clozeHintVi: 'không thể đảo ngược, không thể cứu vãn (tính từ C1, 12 chữ cái, bắt đầu bằng I)',
        clozeExplanationEn: '"Irreversible" (C1 adjective) means impossible to undo or alter back to a previous condition.',
        clozeExplanationVi: 'Giải thích: Tiền tố "ir-" mang nghĩa phủ định; "irreversible" (tính từ C1) nghĩa là không thể đảo ngược (rất hay đi với "irreversible damage/consequences").',
      },
      {
        id: 'sm_3',
        startTime: 18,
        endTime: 28,
        speaker: 'Thom',
        text: 'Sometimes a genuine apology is stronger than the most sophisticated weapon.',
        translationVi: 'Đôi khi một lời xin lỗi chân thành còn mạnh mẽ hơn cả thứ vũ khí tinh vi nhất.',
        phoneticFocus: '/səˈfɪstɪkeɪtɪd/ (sophisticated)',
        stressTip: 'Pronounce "genuine" as /ˈdʒenjuɪn/ (not /dʒenju-aɪn/).',
        stressTipVi: 'Đọc chuẩn từ "genuine" là /ˈdʒenjuɪn/ và "sophisticated" là /səˈfɪstɪkeɪtɪd/ (tinh vi, hiện đại).',
        clozeWord: 'sophisticated',
        clozeHintVi: 'tinh vi, phức tạp, tân tiến (tính từ B2/C1, 13 chữ cái, bắt đầu bằng S)',
        clozeExplanationEn: '"Sophisticated" describes a machine, system, or technique developed to a high degree of complexity.',
        clozeExplanationVi: 'Giải thích: "Sophisticated" (/səˈfɪstɪkeɪtɪd/) dùng để miêu tả công nghệ, máy móc hoặc hệ thống tinh vi, hiện đại bậc cao.',
      },
    ],
  },
  {
    id: 'sh_1',
    title: 'Academic Keynote: How Cities Adapt to Demographic Aging',
    titleVi: 'Bài Giảng Học Thuật: Các Thành Phố Thích Ứng Với Già Hóa Dân Số Như Thế Nào',
    category: 'Academic',
    speakerName: 'Prof. Eleanor Vance (Oxford Urban Institute)',
    accent: 'British Received Pronunciation (en-GB)',
    bandLevel: '6.0-7.0+',
    topic: 'Society',
    durationSeconds: 32,
    youtubeId: 'aqz-KE-bpKQ',
    posterUrl: SHADOWING_LECTURE_IMAGE,
    sentences: [
      {
        id: 's_1',
        startTime: 0,
        endTime: 8,
        speaker: 'Prof. Vance',
        text: 'When demographers examine twenty-first-century urbanization, they rarely focus on birth rates alone.',
        translationVi: 'Khi các nhà nhân khẩu học nghiên cứu quá trình đô thị hóa thế kỷ 21, họ hiếm khi chỉ tập trung vào tỷ lệ sinh.',
        phoneticFocus: '/dɪˈmɒɡrəfəz ɪɡˈzæmɪn/',
        stressTip: 'Stress "demographers", "twenty-first-century", and "rarely"; link "focus_on" smoothly.',
        stressTipVi: 'Nhấn mạnh từ "demographers" (nhà nhân khẩu học) và nối âm mượt mà cụm "focus_on".',
        clozeWord: 'urbanization',
        clozeHintVi: 'quá trình đô thị hóa (danh từ B2/C1, 12 chữ cái, bắt đầu bằng U)',
        clozeExplanationEn: '"Urbanization" refers to the population shift from rural to urban areas.',
        clozeExplanationVi: 'Giải thích: "Urbanization" (/ˌɜːbənaɪˈzeɪʃən/) là quá trình đô thị hóa—danh từ chủ chốt trong mọi bài thi IELTS chủ đề Xã hội & Đô thị.',
      },
      {
        id: 's_2',
        startTime: 8,
        endTime: 16,
        speaker: 'Prof. Vance',
        text: 'Instead, the decisive transformation lies in how metropolitan transit serves an aging population.',
        translationVi: 'Thay vào đó, sự chuyển đổi mang tính quyết định nằm ở cách hệ thống giao thông đô thị phục vụ một dân số đang già hóa.',
        phoneticFocus: '/dɪˈsaɪsɪv ˌtrænsfəˈmeɪʃən/',
        stressTip: 'Pause briefly after "Instead," and place primary tonic stress on "aging population".',
        stressTipVi: 'Ngắt nhẹ sau từ "Instead," và đặt trọng âm câu vào cụm "aging population" (dân số già hóa).',
        clozeWord: 'decisive',
        clozeHintVi: 'mang tính quyết định, then chốt (tính từ B2/C1, 8 chữ cái, bắt đầu bằng D)',
        clozeExplanationEn: '"Decisive" means settling an issue or producing a definite, crucial result.',
        clozeExplanationVi: 'Giải thích: "Decisive" (/dɪˈsaɪsɪv/) là tính từ của động từ "decide", nghĩa là mang tính quyết định, bước ngoặt ("decisive transformation").',
      },
      {
        id: 's_3',
        startTime: 16,
        endTime: 24,
        speaker: 'Prof. Vance',
        text: 'Accessible pedestrian precincts and step-free rail stations benefit not only seniors, but every commuter.',
        translationVi: 'Các khu phố đi bộ dễ tiếp cận và nhà ga không bậc thang mang lại lợi ích không chỉ cho người cao tuổi mà cho mọi hành khách đi làm.',
        phoneticFocus: '/pəˈdestriən ˈpriːsɪŋkts/',
        stressTip: 'Emphasize the correlative pair "not only seniors, || but every commuter" with rising-falling intonation.',
        stressTipVi: 'Lên giọng ở vế "not only seniors" và xuống giọng dứt khoát ở vế "but every commuter".',
        clozeWord: 'pedestrian',
        clozeHintVi: 'người đi bộ / dành cho người đi bộ (danh từ/tính từ B2, 10 chữ cái, bắt đầu bằng P)',
        clozeExplanationEn: '"Pedestrian precinct" is a British English IELTSListening Section 2 map term for a car-free walking zone.',
        clozeExplanationVi: 'Giải thích: "Pedestrian" (/pəˈdestriən/) là người đi bộ. Cụm "pedestrian precinct" (khu phố dành riêng cho người đi bộ) xuất hiện rất thường xuyên trong bài thi IELTS Listening Part 2 (dạng Map).',
      },
      {
        id: 's_4',
        startTime: 24,
        endTime: 32,
        speaker: 'Prof. Vance',
        text: 'Ultimately, inclusive urban design is an investment in long-term civic productivity.',
        translationVi: 'Suy cho cùng, thiết kế đô thị bao trùm chính là một khoản đầu tư cho năng suất công dân dài hạn.',
        phoneticFocus: '/ɪnˈkluːsɪv ˈɜːbən dɪˈzaɪn/',
        stressTip: 'Drop pitch decisively on "civic productivity" to signal conclusion authority.',
        stressTipVi: 'Hạ trầm giọng ở cụm cuối "civic productivity" để tạo sức nặng cho câu kết luận.',
        clozeWord: 'inclusive',
        clozeHintVi: 'bao trùm, hòa nhập cho mọi đối tượng (tính từ C1, 9 chữ cái, bắt đầu bằng I)',
        clozeExplanationEn: '"Inclusive design" ensures facilities are usable by everyone, including elderly and disabled citizens.',
        clozeExplanationVi: 'Giải thích: "Inclusive" (/ɪnˈkluːsɪv/) nghĩa là bao trùm, không bỏ sót ai (mọi tầng lớp, lứa tuổi đều tiếp cận được).',
      },
    ],
  },
];

// 7. Academic Badges Catalog (Bilingual EN & VI)
export const ACADEMIC_BADGES: AcademicBadge[] = [
  {
    id: 'badge_diagnostic',
    title: 'Calibrated Scholar',
    titleVi: 'Học Giả Định Tuyến',
    description: 'Completed the IELTS Diagnostic Placement Assessment to establish a baseline 4-skill profile.',
    descriptionVi: 'Hoàn thành Bài kiểm tra Phân loại Đầu vào để xác lập biểu đồ 4 kỹ năng.',
    criteriaText: 'Complete Quick or Detailed Placement',
    category: 'Pathway',
  },
  {
    id: 'badge_srs_master',
    title: 'Lexicon Fellow',
    titleVi: 'Bậc Thầy Từ Vựng SRS',
    description: 'Maintained at least 10 cards in your Spaced Repetition Deck or reviewed 5 due flashcards.',
    descriptionVi: 'Sở hữu từ 10 thẻ từ vựng trở lên trong bộ thẻ nhớ SRS SM-2.',
    criteriaText: '10+ SRS Cards or 5 Reviews',
    category: 'Lexicon',
  },
  {
    id: 'badge_ai_examiner',
    title: 'Rhetoric Laureate',
    titleVi: 'Tinh Hoa Hùng Biện AI',
    description: 'Submitted a Writing essay or Speaking response for full 4-criterion AI Examiner evaluation.',
    descriptionVi: 'Hoàn thành chấm chữa chi tiết ít nhất 1 bài Writing hoặc Speaking cùng Giám khảo AI.',
    criteriaText: 'Complete 1 AI-Graded Assessment',
    category: 'Assessment',
  },
  {
    id: 'badge_peer_mentor',
    title: 'Peer Review Mentor',
    titleVi: 'Cố Vấn Cộng Đồng',
    description: 'Contributed constructive rubric feedback or shared a submission in the Anonymous Peer-Review Hub.',
    descriptionVi: 'Đóng góp nhận xét chấm bài hoặc chia sẻ bài viết trên Cộng đồng Peer Review.',
    criteriaText: 'Participate in Peer Review Hub',
    category: 'Community',
  },
  {
    id: 'badge_pathway_pioneer',
    title: 'Band Pathway Pioneer',
    titleVi: 'Tiên Phong Lộ Trình Band',
    description: 'Completed at least 3 structured Band Pathway milestones across your roadmap.',
    descriptionVi: 'Hoàn thành tối thiểu 3 cột mốc kỹ năng trên Lộ trình IELTS Band Pathways.',
    criteriaText: 'Check off 3+ Pathway Milestones',
    category: 'Pathway',
  },
];

// 8. Dual-Mode Diagnostic Placement Questions (With Bilingual Explanations)
export const QUICK_DIAGNOSTIC_QUESTIONS: QuizQuestion[] = [
  {
    id: 'qd_1',
    question: '[A2 Grammar] Each of the university applicants ________ required to submit an academic reference before Friday.',
    questionVi: '[Ngữ pháp A2] Mỗi ứng viên đại học đều ________ phải nộp thư giới thiệu học thuật trước thứ Sáu.',
    options: ['are', 'is', 'were', 'have been'],
    correctIndex: 1,
    explanation: '"Each of + plural noun" takes a singular verb ("is").',
    explanationVi: 'Giải thích Tiếng Việt: Chủ ngữ bắt đầu bằng "Each of + danh từ số nhiều" luôn chia động từ ở ngôi SỐ ÍT ("is").',
  },
  {
    id: 'qd_2',
    question: '[B1 Vocabulary] Municipal authorities introduced congestion charges to ________ commuters from driving into the historic centre.',
    questionVi: '[Từ vựng B1] Chính quyền thành phố áp dụng phí ùn tắc để ________ người đi làm lái xe cá nhân vào khu trung tâm cổ.',
    options: ['deter (ngăn cản/làm nản lòng)', 'encourage (khuyến khích)', 'accelerate (tăng tốc)', 'congratulate (chúc mừng)'],
    correctIndex: 0,
    explanation: '"Deter somebody from doing something" means to discourage them through fees or obstacles.',
    explanationVi: 'Giải thích Tiếng Việt: Cấu trúc "deter somebody from V-ing" nghĩa là ngăn cản, làm ai đó chùn bước không làm gì (thường đi với giới từ "from").',
  },
  {
    id: 'qd_3',
    question: '[B2 Grammar] ________ the substantial capital investment required, offshore wind farms deliver reliable clean energy.',
    questionVi: '[Ngữ pháp B2] ________ khoản vốn đầu tư ban đầu rất lớn, các trang trại điện gió ngoài khơi vẫn mang lại nguồn điện sạch ổn định.',
    options: ['Although', 'Despite', 'However', 'Whereas'],
    correctIndex: 1,
    explanation: '"Despite" is followed by a noun phrase ("the substantial capital investment required").',
    explanationVi: 'Giải thích Tiếng Việt: Cụm "the substantial capital investment required" là một Cụm danh từ (Noun Phrase, chữ "required" ở đây là phân từ rút gọn mệnh đề quan hệ "which is required"), nên phải dùng giới từ "Despite".',
  },
  {
    id: 'qd_4',
    question: '[B2 Reading Inference] "While digital textbooks reduce printing expenditure, comprehension trials suggest that tactile page navigation aids spatial memory." What does the author imply?',
    questionVi: '[Đọc hiểu B2] "Mặc dù sách điện tử giúp giảm chi phí in ấn, các thử nghiệm đọc hiểu cho thấy việc lật trang giấy vật lý hỗ trợ trí nhớ không gian." Tác giả hàm ý điều gì?',
    options: [
      'Digital textbooks should be banned immediately.',
      'Physical books offer a cognitive memory advantage despite higher printing costs.',
      'Printing expenditure has no impact on schools.',
      'Spatial memory is unrelated to reading.',
    ],
    correctIndex: 1,
    explanation: 'The concessive "While..." balances the financial benefit of digital books against the spatial memory advantage of physical pages.',
    explanationVi: 'Giải thích Tiếng Việt: Tác giả dùng "While" để đối chiếu: sách điện tử rẻ hơn về chi phí in, nhưng sách giấy lại có lợi thế về trí nhớ không gian ("aids spatial memory").',
  },
  {
    id: 'qd_5',
    question: '[C1 Inversion & Lexicon] Not only ________ routine administrative tasks, but artificial intelligence also reshapes diagnostic medicine.',
    questionVi: '[Đảo ngữ C1] Trí tuệ nhân tạo không những ________ các tác vụ hành chính lặp lại mà còn tái định hình y học chẩn đoán.',
    options: [
      'automation streamlines',
      'does automation streamline',
      'streamlines automation',
      'automation is streamlining',
    ],
    correctIndex: 1,
    explanation: 'Opening a clause with "Not only" requires negative inversion: auxiliary "does" + subject "automation" + bare infinitive "streamline".',
    explanationVi: 'Giải thích Tiếng Việt: Khi "Not only" đứng đầu câu, ta bắt buộc phải đảo trợ động từ "does" lên trước chủ ngữ "automation" và đưa động từ chính "streamline" về nguyên mẫu ("does automation streamline").',
  },
];

export const DETAILED_DIAGNOSTIC_LISTENING = [
  {
    id: 'dl_1',
    title: 'Dialogue 1: University Library Orientation (Hướng dẫn Thư viện Đại học)',
    audioText:
      'Librarian: Good morning. Please note that while the main reading room on the second floor stays open until midnight, the rare manuscripts archive on the fourth floor closes strictly at five thirty PM, and requires a digital booking reference.',
    question: 'When does the rare manuscripts archive close, and what is required for entry?',
    options: [
      'Midnight; a student bus pass.',
      '5:30 PM; a digital booking reference.',
      '4:00 PM; a signed letter from a dean.',
      '9:00 PM; no booking is required.',
    ],
    correctIndex: 1,
  },
  {
    id: 'dl_2',
    title: 'Dialogue 2: Marine Biology Seminar Revision (Thảo luận Sinh học Biển)',
    audioText:
      'Professor: Several of you attributed the coral bleaching in Sector B to industrial runoff. However, chemical assays confirmed nitrogen levels were normal; the decisive trigger was a three-week thermal anomaly in late August.',
    question: 'What did the chemical assays confirm was the actual cause of the coral bleaching?',
    options: [
      'High nitrogen from industrial runoff.',
      'Overfishing by commercial trawlers.',
      'A three-week thermal temperature anomaly in late August.',
      'Plastic micro-debris in Sector A.',
    ],
    correctIndex: 2,
  },
];

export interface AdaptiveReadingNode {
  id: string;
  difficultyBand: number;
  cefrLabel: string;
  passageSnippet: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export const ADAPTIVE_READING_POOL: AdaptiveReadingNode[] = [
  {
    id: 'ar_low',
    difficultyBand: 4.5,
    cefrLabel: 'CEFR B1 · Band 4.5',
    passageSnippet:
      'Public bicycle-sharing schemes have expanded rapidly across European capitals over the past decade. By offering thirty minutes of free riding between metro stations, cities have persuaded thousands of short-distance commuters to leave their private cars at home.',
    question: 'How have European capitals encouraged short-distance commuters to use shared bicycles?',
    options: [
      'By closing all metro stations permanently.',
      'By offering thirty minutes of free riding between metro stations.',
      'By giving free private cars to residents.',
      'By banning pedestrians from city streets.',
    ],
    correctIndex: 1,
  },
  {
    id: 'ar_mid',
    difficultyBand: 6.0,
    cefrLabel: 'CEFR B2 · Band 6.0',
    passageSnippet:
      'Although telecommuting reduces daily vehicular congestion, urban economists observe a paradoxical "rebound effect": remote workers often relocate to sprawling suburbs where public transit is scarce, thereby increasing household car mileage for non-work errands.',
    question: 'What is the paradoxical "rebound effect" of telecommuting described by urban economists?',
    options: [
      'Remote workers move back into dense city centres and sell their cars.',
      'Eliminating the daily office commute can inadvertently increase total car mileage because workers move to car-dependent suburbs.',
      'Public transit fares become too expensive for suburban residents.',
      'Office buildings consume more electricity when empty.',
    ],
    correctIndex: 1,
  },
  {
    id: 'ar_high',
    difficultyBand: 7.5,
    cefrLabel: 'CEFR C1 · Band 7.5+',
    passageSnippet:
      'Epistemic humility in scientific peer review requires distinguishing between methodological flaws and unwelcome empirical conclusions. When referees penalize studies merely because results contradict prevailing orthodoxy, confirmation bias becomes institutionalized within the literature.',
    question: 'According to the passage, how does confirmation bias become institutionalized in scientific literature?',
    options: [
      'When researchers refuse to use statistical software.',
      'When peer reviewers reject methodologically sound studies simply because their findings challenge established orthodoxy.',
      'When journals publish too many replication studies.',
      'When universities reduce funding for laboratory equipment.',
    ],
    correctIndex: 1,
  },
];

export const INITIAL_PEER_SUBMISSIONS: PeerSubmissionData[] = [
  {
    id: 'peer_seed_1',
    authorUid: 'scholar_community_1',
    anonymousHandle: 'Scholar #418',
    authorBand: '5.0-6.0',
    skill: 'writing',
    promptTitle: 'Task 2: Should Museums Be Free to the Public?',
    content:
      'Many people argue that admission to national museums and art galleries should be completely free of charge, whereas others believe visitors ought to pay an entry ticket to fund maintenance. In my view, removing financial barriers to cultural heritage is vital for educational equity, even if municipalities must subsidize operating costs through general taxation. When low-income families can visit historical exhibitions freely, children develop curiosity and historical literacy regardless of socioeconomic background.',
    wordCount: 74,
    visibility: 'public',
    reviewCount: 3,
    averageBand: 6.5,
    latestReviewComment:
      'Strong cohesive use of "whereas" and "educational equity". To reach Band 7.5, expand your second body paragraph with a concrete counter-argument on tourist ticket tiers.',
    latestReviewerHandle: 'Scholar #892 (Band 7.0+)',
  },
  {
    id: 'peer_seed_2',
    authorUid: 'scholar_community_2',
    anonymousHandle: 'Scholar #209',
    authorBand: '6.0-7.0+',
    skill: 'speaking',
    promptTitle: 'Part 3: The Impact of Automation on Creative Professions',
    content:
      'Spoken Transcript: Well, while generative algorithms can effortlessly synthesize derivative illustrations or boilerplate journalism, I doubt they will ever supplant genuine human artistry. Art is fundamentally valued not merely for its surface aesthetic, but for the lived mortality and intentionality of its creator. Consequently, we are likely to see a bifurcation where routine commercial design is automated, while bespoke human craftsmanship commands an even higher cultural premium.',
    wordCount: 69,
    visibility: 'public',
    reviewCount: 4,
    averageBand: 7.5,
    latestReviewComment:
      'Impressive C1 lexicon ("supplant", "bifurcation", "cultural premium") and clear contrastive subordination.',
    latestReviewerHandle: 'Scholar #114 (Band 7.0+)',
  },
];
