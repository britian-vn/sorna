export type BandLevelId = '0-3.5' | '3.5-5.0' | '5.0-6.0' | '6.0-7.0+';
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type IeltsTopic = 'Education' | 'Environment' | 'Technology' | 'Health' | 'Society' | 'Economy';
export type MasteryLevel = 'New' | 'Learning' | 'Reviewing' | 'Mastered';
export type SkillType = 'listening' | 'reading' | 'writing' | 'speaking';
export type SrsRecallRating = 'Again' | 'Hard' | 'Good' | 'Easy';
export type LanguageMode = 'bilingual' | 'vi' | 'en';
export type VideoCategory = 'Anime' | 'Animation' | 'Movies' | 'Academic' | 'Custom' | 'User Added';

export interface UserProfileData {
  uid: string;
  displayName: string;
  currentBandLevel: BandLevelId;
  targetBand: number;
  diagnosticCompleted: boolean;
  diagnosticMode?: 'quick' | 'detailed' | 'manual';
  diagnosticStep?: number;
  diagnosticSavedState?: string;
  listeningScore: number;
  readingScore: number;
  writingScore: number;
  speakingScore: number;
  completedMilestones: string[];
  completedLessons: string[];
  earnedBadges: string[];
  studyStreak: number;
  lastStudyDate: string;
  reminderEnabled: boolean;
  reminderTime: string;
  reminderDays: number[];
  browserPushEnabled: boolean;
  offlinePackSyncedAt?: string;
}

export interface SrsCardData {
  id: string;
  uid: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  vietnameseMeaning?: string;
  exampleSentence: string;
  exampleTranslationVi?: string;
  topic: string;
  cefrLevel: CefrLevel;
  source: 'vocab-hub' | 'news-reader' | 'custom';
  masteryLevel: MasteryLevel;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: string;
  lastReviewedAt: string;
}

export interface PracticeAttemptData {
  id: string;
  uid: string;
  skill: SkillType;
  testTitle: string;
  bandScore: number;
  userResponse: string;
  aiFeedbackSummary: string;
  durationSeconds: number;
  createdAtIso?: string;
}

export interface PeerSubmissionData {
  id: string;
  authorUid: string;
  anonymousHandle: string;
  authorBand: BandLevelId;
  skill: 'writing' | 'speaking';
  promptTitle: string;
  content: string;
  wordCount: number;
  visibility: 'public';
  reviewCount: number;
  averageBand: number;
  latestReviewComment: string;
  latestReviewerHandle: string;
}

export interface PathwayMilestone {
  id: string;
  title: string;
  titleVi: string;
  description: string;
  descriptionVi: string;
  skillFocus: SkillType;
  dailyGoalMinutes: number;
  targetModule: string;
}

export interface BandPathwayTrack {
  id: BandLevelId;
  name: string;
  nameVi: string;
  subtitle: string;
  subtitleVi: string;
  cefrEquivalent: string;
  description: string;
  descriptionVi: string;
  dailyGoalText: string;
  dailyGoalTextVi: string;
  milestones: PathwayMilestone[];
}

export interface VocabWordItem {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  vietnameseMeaning?: string;
  definition: string;
  exampleSentence: string;
  exampleTranslationVi?: string;
  collocations: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  questionVi?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  explanationVi?: string;
}

export interface VocabGrammarLesson {
  id: string;
  title: string;
  titleVi: string;
  category: 'Vocabulary' | 'Grammar';
  cefrLevel: CefrLevel;
  topic: IeltsTopic;
  summary: string;
  summaryVi: string;
  grammarRuleOrNote: string;
  grammarTheoryVi: string;
  words: VocabWordItem[];
  quiz: QuizQuestion[];
}

export interface ListeningReadingTest {
  id: string;
  skill: 'listening' | 'reading';
  title: string;
  titleVi: string;
  bandTarget: string;
  durationMinutes: number;
  topic: IeltsTopic;
  audioScriptOrPassage: string[];
  passageTranslationsVi?: string[];
  customAudioHint?: string;
  questions: QuizQuestion[];
}

export interface WritingPromptItem {
  id: string;
  taskType: 'Task 1 Academic' | 'Task 1 General' | 'Task 2 Essay';
  title: string;
  titleVi: string;
  topic: IeltsTopic;
  durationMinutes: number;
  minWords: number;
  promptText: string;
  promptTextVi: string;
  chartSummary?: string;
  rubricChecklist: string[];
  rubricChecklistVi: string[];
  sampleBand75Essay: string;
  examinerNotes: string;
  examinerNotesVi: string;
}

export interface SpeakingCueCard {
  id: string;
  part: 'Part 1: Interview' | 'Part 2: Cue Card Long Turn' | 'Part 3: Abstract Discussion';
  topic: IeltsTopic;
  title: string;
  titleVi: string;
  prepSeconds: number;
  speakSeconds: number;
  prompts: string[];
  promptsVi: string[];
  sampleAnswer: string;
  sampleAnswerVi: string;
  keyLexicon: string[];
}

export interface NewsArticleItem {
  id: string;
  title: string;
  titleVi?: string;
  sourcePublication: string;
  topic: IeltsTopic;
  bandLevel: BandLevelId;
  cefrLevel: CefrLevel;
  readTimeMinutes: number;
  publishedDate: string;
  imageUrl?: string;
  summary: string;
  summaryVi?: string;
  paragraphs: string[];
  paragraphsVi?: string[];
  comprehensionQuestions: QuizQuestion[];
}

export interface ShadowingSentence {
  id: string;
  startTime: number;
  endTime: number;
  speaker: string;
  text: string;
  translationVi: string;
  phoneticFocus: string;
  stressTip: string;
  stressTipVi: string;
  clozeWord: string;
  clozeHintVi: string;
  clozeExplanationEn: string;
  clozeExplanationVi: string;
}

export interface ShadowingVideoLesson {
  id: string;
  title: string;
  titleVi: string;
  category: VideoCategory;
  speakerName: string;
  accent: string;
  bandLevel?: BandLevelId;
  bandTarget?: string;
  topic: IeltsTopic;
  durationSeconds?: number;
  durationLabel?: string;
  youtubeId?: string;
  posterUrl?: string;
  videoUrl?: string;
  sentences: ShadowingSentence[];
}

export interface AcademicBadge {
  id: string;
  title: string;
  titleVi: string;
  description: string;
  descriptionVi: string;
  criteriaText: string;
  category: 'Pathway' | 'Lexicon' | 'Assessment' | 'Community';
}

export interface AiGradeResponse {
  overallBand: number;
  taskResponse: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
  examinerSummary: string;
  examinerSummaryVi?: string;
  strengths: string[];
  strengthsVi?: string[];
  improvements: string[];
  improvementsVi?: string[];
  modelUpgrade: string;
  modelUpgradeVi?: string;
}
