import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Compass,
  Award,
  ArrowUpRight,
  Flame,
  Layers,
  Sparkles,
  BookOpen,
  Target,
  Video,
} from 'lucide-react';
import {
  BandLevelId,
  LanguageMode,
  SkillType,
  SrsCardData,
  UserProfileData,
  PracticeAttemptData,
} from '../types';
import {
  BAND_PATHWAYS,
  ACADEMIC_BADGES,
  HERO_LIBRARY_IMAGE,
} from '../data/curriculum';

interface DashboardAndPathwaysProps {
  mode: 'dashboard' | 'pathways';
  langMode: LanguageMode;
  profile: UserProfileData;
  srsCards: SrsCardData[];
  attempts: PracticeAttemptData[];
  onNavigate: (moduleKey: string) => void;
  onOpenPlacement: () => void;
  onToggleMilestone: (milestoneId: string) => void;
  onSelectBandLevel: (band: BandLevelId) => void;
}

// SVG 4-Skill Balance Radar Chart (0.0 - 9.0 Scale)
const SkillRadarChart: React.FC<{
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  targetBand: number;
  langMode: LanguageMode;
}> = ({ listening, reading, writing, speaking, targetBand, langMode }) => {
  const size = 240;
  const center = size / 2;
  const maxRadius = 80;

  const getPoint = (score: number, angleDeg: number) => {
    const normalized = Math.min(9, Math.max(1, score)) / 9;
    const rad = (angleDeg - 90) * (Math.PI / 180);
    const x = center + normalized * maxRadius * Math.cos(rad);
    const y = center + normalized * maxRadius * Math.sin(rad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };

  const userPolygon = [
    getPoint(listening, 0),
    getPoint(reading, 90),
    getPoint(writing, 180),
    getPoint(speaking, 270),
  ].join(' ');

  const targetPolygon = [
    getPoint(targetBand, 0),
    getPoint(targetBand, 90),
    getPoint(targetBand, 180),
    getPoint(targetBand, 270),
  ].join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        role="img"
        aria-label="4-Skill IELTS Radar Chart"
      >
        {[3, 6, 9].map((ringBand) => {
          const r = (ringBand / 9) * maxRadius;
          return (
            <circle
              key={ringBand}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke="currentColor"
              className="text-zinc-200 dark:text-zinc-800"
              strokeWidth="1"
            />
          );
        })}

        <line
          x1={center}
          y1={center - maxRadius}
          x2={center}
          y2={center + maxRadius}
          stroke="currentColor"
          className="text-zinc-200 dark:text-zinc-800"
          strokeWidth="1"
        />
        <line
          x1={center - maxRadius}
          y1={center}
          x2={center + maxRadius}
          y2={center}
          stroke="currentColor"
          className="text-zinc-200 dark:text-zinc-800"
          strokeWidth="1"
        />

        <polygon
          points={targetPolygon}
          fill="none"
          stroke="#1E3A8A"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />

        <polygon
          points={userPolygon}
          fill="rgba(153, 27, 27, 0.18)"
          stroke="#991B1B"
          strokeWidth="2.2"
        />

        <text
          x={center}
          y={center - maxRadius - 14}
          textAnchor="middle"
          className="fill-current text-xs font-semibold font-mono-tabular"
        >
          Listening {listening.toFixed(1)}
        </text>
        <text
          x={center + maxRadius + 8}
          y={center + 4}
          textAnchor="start"
          className="fill-current text-xs font-semibold font-mono-tabular"
        >
          Reading {reading.toFixed(1)}
        </text>
        <text
          x={center}
          y={center + maxRadius + 20}
          textAnchor="middle"
          className="fill-current text-xs font-semibold font-mono-tabular"
        >
          Writing {writing.toFixed(1)}
        </text>
        <text
          x={center - maxRadius - 8}
          y={center + 4}
          textAnchor="end"
          className="fill-current text-xs font-semibold font-mono-tabular"
        >
          Speaking {speaking.toFixed(1)}
        </text>
      </svg>
      <div className="flex items-center gap-3 text-xs text-zinc-500 mt-2 text-center">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#991B1B] inline-block" />
          {langMode === 'en' ? 'Current Band' : 'Điểm hiện tại'}
        </span>
        <span>·</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A] inline-block" />
          {langMode === 'en'
            ? `Target ${targetBand.toFixed(1)}`
            : `Mục tiêu ${targetBand.toFixed(1)}`}
        </span>
      </div>
    </div>
  );
};

export const DashboardAndPathways: React.FC<DashboardAndPathwaysProps> = ({
  mode,
  langMode,
  profile,
  srsCards,
  attempts,
  onNavigate,
  onOpenPlacement,
  onToggleMilestone,
  onSelectBandLevel,
}) => {
  const showVi = langMode === 'bilingual' || langMode === 'vi';
  const [selectedPathwayTab, setSelectedPathwayTab] = useState<BandLevelId | 'ALL'>(
    profile.currentBandLevel
  );

  const nowIso = new Date().toISOString();
  const dueCards = srsCards.filter((c) => c.nextReviewAt <= nowIso);
  const masteredCount = srsCards.filter((c) => c.masteryLevel === 'Mastered').length;

  const overallBand = Number(
    (
      (profile.listeningScore +
        profile.readingScore +
        profile.writingScore +
        profile.speakingScore) /
      4
    ).toFixed(1)
  );

  const skillEntries: { skill: SkillType; label: string; labelVi: string; score: number }[] = [
    { skill: 'listening', label: 'Listening', labelVi: 'Nghe (Listening)', score: profile.listeningScore },
    { skill: 'reading', label: 'Reading', labelVi: 'Đọc (Reading)', score: profile.readingScore },
    { skill: 'writing', label: 'Writing', labelVi: 'Viết (Writing)', score: profile.writingScore },
    { skill: 'speaking', label: 'Speaking', labelVi: 'Nói (Speaking)', score: profile.speakingScore },
  ];
  const weakestSkill = [...skillEntries].sort((a, b) => a.score - b.score)[0];

  const activeTrack =
    BAND_PATHWAYS.find((t) => t.id === profile.currentBandLevel) || BAND_PATHWAYS[2];
  const activeTrackCompleted = activeTrack.milestones.filter((m) =>
    profile.completedMilestones.includes(m.id)
  ).length;
  const activeTrackPercent = Math.round(
    (activeTrackCompleted / activeTrack.milestones.length) * 100
  );

  if (mode === 'pathways') {
    const visibleTracks =
      selectedPathwayTab === 'ALL'
        ? BAND_PATHWAYS
        : BAND_PATHWAYS.filter((t) => t.id === selectedPathwayTab);

    return (
      <div className="space-y-6">
        {/* Clean Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E6E2DA] dark:border-[#263042] pb-5">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#991B1B] dark:text-[#D97706]">
              {langMode === 'en'
                ? 'Structured IELTS Band Curriculum'
                : 'Lộ Trình Học IELTS Chuẩn Hóa Theo 4 Chặng'}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold">
              {langMode === 'en'
                ? 'IELTS Band Roadmap (Band 0 – 7.0+)'
                : 'Lộ Trình 4 Chặng IELTS (Band 0 – 7.0+)'}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {langMode === 'en'
                ? `Priority focus skill: ${weakestSkill.label} (Band ${weakestSkill.score.toFixed(1)})`
                : `Kỹ năng cần ưu tiên cải thiện: ${weakestSkill.labelVi} (Band ${weakestSkill.score.toFixed(1)})`}
            </p>
          </div>
          <button
            onClick={onOpenPlacement}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[#18181B] text-white dark:bg-[#F3F0E6] dark:text-[#0B0F17] rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>
              {langMode === 'en' ? 'Placement Test / Change Band' : 'Kiểm Tra Đầu Vào / Đổi Band'}
            </span>
          </button>
        </div>

        {/* Clean 4-Track Selector Bar (Prevents scrolling 4 huge sections at once) */}
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-[#151C28] p-2 rounded-xl border border-[#E6E2DA] dark:border-[#263042]">
          {BAND_PATHWAYS.map((t, idx) => {
            const isSelected = selectedPathwayTab === t.id;
            const isCurrentUserBand = t.id === profile.currentBandLevel;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedPathwayTab(t.id)}
                className={`flex-1 min-w-[160px] text-left px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#991B1B] text-white dark:bg-[#D97706] dark:text-[#0B0F17]'
                    : 'hover:bg-[#FAF8F5] dark:hover:bg-[#0B0F17]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono-tabular">
                  <span className="font-bold">Chặng {idx + 1}: Band {t.id}</span>
                  {isCurrentUserBand && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] rounded font-sans font-semibold ${
                        isSelected
                          ? 'bg-black/20 text-white dark:text-[#0B0F17]'
                          : 'bg-red-50 dark:bg-amber-950/60 text-[#991B1B] dark:text-[#D97706]'
                      }`}
                    >
                      Đang học
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs mt-0.5 truncate ${
                    isSelected ? 'opacity-90' : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {showVi && t.nameVi ? t.nameVi : t.name}
                </p>
              </button>
            );
          })}
          <button
            onClick={() => setSelectedPathwayTab('ALL')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedPathwayTab === 'ALL'
                ? 'bg-[#18181B] text-white dark:bg-[#F3F0E6] dark:text-[#0B0F17]'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-[#FAF8F5] dark:hover:bg-[#0B0F17]'
            }`}
          >
            Xem cả 4 chặng
          </button>
        </div>

        {/* Selected Band Pathway Track(s) */}
        <div className="space-y-6">
          {visibleTracks.map((track) => {
            const isCurrent = track.id === profile.currentBandLevel;
            const completedCount = track.milestones.filter((m) =>
              profile.completedMilestones.includes(m.id)
            ).length;
            const pct = Math.round((completedCount / track.milestones.length) * 100);

            return (
              <section
                key={track.id}
                className="rounded-2xl border bg-white dark:bg-[#151C28] border-[#E6E2DA] dark:border-[#263042] p-6 space-y-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E6E2DA] dark:border-[#263042]">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] font-mono-tabular font-semibold text-[#991B1B] dark:text-[#D97706]">
                        {track.cefrEquivalent}
                      </span>
                      <span>·</span>
                      <span>
                        {showVi && track.dailyGoalTextVi
                          ? track.dailyGoalTextVi
                          : track.dailyGoalText}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold">
                      {showVi && track.nameVi ? track.nameVi : track.name}
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-3xl">
                      {showVi && track.descriptionVi ? track.descriptionVi : track.description}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
                    <div className="w-48 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono-tabular">
                        <span>
                          Hoàn thành: {completedCount}/{track.milestones.length}
                        </span>
                        <span className="font-bold">{pct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-[#991B1B] dark:bg-[#D97706] transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {!isCurrent && (
                      <button
                        onClick={() => onSelectBandLevel(track.id)}
                        className="px-4 py-2 text-xs font-semibold bg-[#991B1B] text-white dark:bg-[#D97706] dark:text-[#0B0F17] rounded-xl whitespace-nowrap cursor-pointer"
                      >
                        {langMode === 'en' ? 'Set as Active Track' : 'Chọn học chặng này'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Milestones Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {track.milestones.map((ms) => {
                    const checked = profile.completedMilestones.includes(ms.id);
                    const isPrioritySkill = ms.skillFocus === weakestSkill.skill;
                    return (
                      <div
                        key={ms.id}
                        className={`p-5 rounded-xl border flex flex-col justify-between gap-4 transition-colors ${
                          checked
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-600/40'
                            : 'bg-[#FAF8F5] dark:bg-[#0B0F17] border-[#E6E2DA] dark:border-[#263042]'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <button
                            onClick={() => onToggleMilestone(ms.id)}
                            className="mt-0.5 text-[#991B1B] dark:text-[#D97706] hover:scale-105 transition-transform cursor-pointer"
                            aria-label={`Toggle milestone ${ms.title}`}
                          >
                            {checked ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                              <span className="uppercase font-mono-tabular font-semibold text-zinc-700 dark:text-zinc-300">
                                {ms.skillFocus}
                              </span>
                              <span>·</span>
                              <span className="font-mono-tabular">
                                {ms.dailyGoalMinutes} {langMode === 'en' ? 'min/day' : 'phút/ngày'}
                              </span>
                              {isPrioritySkill && !checked && (
                                <span className="px-2 py-0.5 rounded bg-red-50 dark:bg-amber-950/50 text-[#991B1B] dark:text-[#D97706] font-semibold">
                                  Ưu tiên
                                </span>
                              )}
                            </div>

                            <h3
                              className={`text-base font-bold ${
                                checked ? 'line-through text-zinc-400' : ''
                              }`}
                            >
                              {showVi && ms.titleVi ? ms.titleVi : ms.title}
                            </h3>

                            {langMode === 'bilingual' && ms.titleVi && (
                              <p className="text-xs text-zinc-500">{ms.title}</p>
                            )}

                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                              {showVi && ms.descriptionVi ? ms.descriptionVi : ms.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end pt-1 border-t border-[#E6E2DA]/60 dark:border-[#263042]/60">
                          <button
                            onClick={() => onNavigate(ms.targetModule)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#991B1B] dark:text-[#D97706] hover:underline cursor-pointer"
                          >
                            <span>
                              {langMode === 'en' ? 'Open Practice Module' : 'Mở bài luyện tập'}
                            </span>
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    );
  }

  // Dashboard Mode — Clean, Organized, Easy to Scan
  return (
    <div className="space-y-6">
      {/* Row 1: 4 Clear KPI Cards at Top */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-2xl p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
            <span>{langMode === 'en' ? 'Estimated Band' : 'Band Tổng Ước Tính'}</span>
            <Target className="w-4 h-4 text-[#991B1B] dark:text-[#D97706]" />
          </div>
          <p className="text-3xl font-bold font-mono-tabular">{overallBand.toFixed(1)}</p>
          <p className="text-xs text-zinc-500">
            Mục tiêu: <strong>Band {profile.targetBand.toFixed(1)}</strong> ({profile.currentBandLevel})
          </p>
        </div>

        <div className="bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-2xl p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
            <span>{langMode === 'en' ? 'SRS Vocabulary' : 'Thẻ Từ Vựng SRS'}</span>
            <Layers className="w-4 h-4 text-[#1E3A8A] dark:text-[#60A5FA]" />
          </div>
          <p className="text-3xl font-bold font-mono-tabular">
            {dueCards.length}{' '}
            <span className="text-base font-normal text-zinc-500">
              {langMode === 'en' ? 'due' : 'cần ôn'}
            </span>
          </p>
          <p className="text-xs text-zinc-500">
            Tổng {srsCards.length} thẻ · Đã thuộc {masteredCount} thẻ
          </p>
        </div>

        <div className="bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-2xl p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
            <span>{langMode === 'en' ? 'Study Streak' : 'Chuỗi Ngày Học'}</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-bold font-mono-tabular">
            {profile.studyStreak}{' '}
            <span className="text-base font-normal text-zinc-500">
              {langMode === 'en' ? 'days' : 'ngày'}
            </span>
          </p>
          <p className="text-xs text-zinc-500">
            Nhắc học hàng ngày: {profile.reminderEnabled ? profile.reminderTime : 'Đang tắt'}
          </p>
        </div>

        <div className="bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-2xl p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
            <span>{langMode === 'en' ? 'Progress' : 'Tiến Độ Hoàn Thành'}</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold font-mono-tabular">
            {profile.completedMilestones.length}{' '}
            <span className="text-base font-normal text-zinc-500">mốc</span>
          </p>
          <p className="text-xs text-zinc-500">
            {profile.completedLessons.length} bài ngữ pháp · {attempts.length} bài thi
          </p>
        </div>
      </div>

      {/* Row 2: Welcome & 3 Quick Daily Study Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-2xl p-6 md:p-7 flex flex-col justify-between space-y-5">
          <div className="space-y-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] text-xs font-semibold text-[#991B1B] dark:text-[#D97706]">
              Lộ trình đang học: Band {profile.currentBandLevel} → Mục tiêu Band{' '}
              {profile.targetBand.toFixed(1)}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold">
              {langMode === 'en'
                ? `Welcome back, ${profile.displayName}.`
                : `Chào mừng trở lại, ${profile.displayName}!`}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
              {langMode === 'en'
                ? `Your 4-skill analysis shows ${weakestSkill.label} (Band ${weakestSkill.score.toFixed(1)}) should be prioritized today. Follow the 3 recommended steps below:`
                : `Phân tích 4 kỹ năng cho thấy bạn nên ưu tiên cải thiện ${weakestSkill.labelVi} (hiện tại Band ${weakestSkill.score.toFixed(1)}). Chọn một trong 3 học phần trọng tâm bên dưới để bắt đầu:`}
            </p>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('srs-deck')}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-[#991B1B] hover:bg-[#7F1D1D] dark:bg-[#D97706] dark:text-[#0B0F17] rounded-xl inline-flex items-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>
                {langMode === 'en'
                  ? `Review ${dueCards.length} SRS Flashcards`
                  : `Ôn tập ${dueCards.length} Thẻ Từ Vựng SRS`}
              </span>
            </button>
            <button
              onClick={() => onNavigate('vocab-grammar')}
              className="px-4 py-2.5 text-xs font-semibold border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17] hover:border-[#991B1B] rounded-xl inline-flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#991B1B] dark:text-[#D97706]" />
              <span>
                {langMode === 'en'
                  ? '16,750 Words & 20-Q Grammar'
                  : 'Kho 16.750 Từ & Đề 20 Câu'}
              </span>
            </button>
            <button
              onClick={() => onNavigate('shadowing')}
              className="px-4 py-2.5 text-xs font-semibold border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17] hover:border-[#991B1B] rounded-xl inline-flex items-center gap-2 cursor-pointer"
            >
              <Video className="w-4 h-4 text-[#991B1B] dark:text-[#D97706]" />
              <span>
                {langMode === 'en'
                  ? '62+ YouTube Video Cloze'
                  : '62+ Video YouTube & Điền Từ'}
              </span>
            </button>
          </div>
        </div>

        {/* Right Editorial Progress Card */}
        <div className="lg:col-span-4 relative rounded-2xl overflow-hidden border border-[#E6E2DA] dark:border-[#263042] min-h-[250px] bg-zinc-900">
          <img
            src={HERO_LIBRARY_IMAGE}
            alt="Study workspace"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-6 flex flex-col justify-between text-white">
            <div className="flex justify-end">
              <button
                onClick={onOpenPlacement}
                className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur text-xs font-semibold cursor-pointer"
              >
                Thi Xếp Lớp 4 Kỹ Năng →
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-amber-300 font-mono-tabular font-semibold">
                {showVi && activeTrack.nameVi ? activeTrack.nameVi : activeTrack.name} ·{' '}
                {activeTrackPercent}%
              </p>
              <h2 className="text-lg font-bold leading-snug">
                {showVi && activeTrack.subtitleVi
                  ? activeTrack.subtitleVi
                  : activeTrack.subtitle}
              </h2>
              <div className="w-full h-2 bg-white/25 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${activeTrackPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: 4-Skill Radar Chart + Active Band Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <p className="text-xs text-[#991B1B] dark:text-[#D97706] font-semibold">
              {langMode === 'en' ? '4-Skill Balance Analytics' : 'Phân Tích Cân Bằng 4 Kỹ Năng'}
            </p>
            <h2 className="text-lg font-bold mt-0.5">
              {langMode === 'en' ? 'IELTS Competency Radar' : 'Biểu Đồ Năng Lực 4 Kỹ Năng'}
            </h2>
          </div>

          <SkillRadarChart
            listening={profile.listeningScore}
            reading={profile.readingScore}
            writing={profile.writingScore}
            speaking={profile.speakingScore}
            targetBand={profile.targetBand}
            langMode={langMode}
          />

          <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] space-y-1">
            <p className="text-xs font-bold text-[#18181B] dark:text-[#F3F0E6]">
              {langMode === 'en'
                ? `Focus Skill: ${weakestSkill.label} (${weakestSkill.score.toFixed(1)})`
                : `Trọng tâm: Ưu tiên luyện ${weakestSkill.labelVi} (${weakestSkill.score.toFixed(1)})`}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {langMode === 'en'
                ? `Raising ${weakestSkill.label} by +1.0 band lifts your overall average to ${((overallBand * 4 + 1) / 4).toFixed(1)}.`
                : `Tăng điểm ${weakestSkill.labelVi} thêm +1.0 band sẽ nâng điểm Overall lên ${((overallBand * 4 + 1) / 4).toFixed(1)}.`}
            </p>
          </div>
        </div>

        {/* Right: Active Band Pathway Checklist */}
        <div className="lg:col-span-7 bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E6E2DA] dark:border-[#263042] pb-3.5">
            <div>
              <p className="text-xs text-zinc-500">
                {langMode === 'en' ? 'Current Band Checklist' : 'Mục tiêu trong chặng hiện tại'}
              </p>
              <h2 className="text-lg font-bold">
                {showVi && activeTrack.nameVi ? activeTrack.nameVi : activeTrack.name}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('pathways')}
              className="text-xs font-semibold text-[#991B1B] dark:text-[#D97706] hover:underline cursor-pointer"
            >
              {langMode === 'en' ? 'View All 4 Tracks →' : 'Xem cả 4 chặng →'}
            </button>
          </div>

          <div className="space-y-3">
            {activeTrack.milestones.map((ms) => {
              const done = profile.completedMilestones.includes(ms.id);
              return (
                <div
                  key={ms.id}
                  className="p-4 rounded-xl border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17] flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleMilestone(ms.id)}
                      className="mt-0.5 text-[#991B1B] dark:text-[#D97706] cursor-pointer"
                    >
                      {done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div className="space-y-1">
                      <p
                        className={`text-sm font-bold ${
                          done ? 'line-through text-zinc-400' : ''
                        }`}
                      >
                        {showVi && ms.titleVi ? ms.titleVi : ms.title}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Kỹ năng: <span className="uppercase font-mono-tabular font-semibold">{ms.skillFocus}</span> ·{' '}
                        {ms.dailyGoalMinutes} {langMode === 'en' ? 'mins/day' : 'phút/ngày'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate(ms.targetModule)}
                    className="px-3.5 py-2 text-xs font-semibold border border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#151C28] rounded-lg hover:border-[#991B1B] shrink-0 cursor-pointer"
                  >
                    {langMode === 'en' ? 'Practice' : 'Luyện ngay'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 4: Academic Badges Showcase */}
      <div className="bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#991B1B] dark:text-[#D97706] font-semibold">
              {langMode === 'en' ? 'Milestones & Achievements' : 'Thành Tựu Học Tập'}
            </p>
            <h2 className="text-lg font-bold">
              {langMode === 'en'
                ? `Academic Badges (${profile.earnedBadges.length} / ${ACADEMIC_BADGES.length})`
                : `Huy Hiệu Đã Mở Khóa (${profile.earnedBadges.length} / ${ACADEMIC_BADGES.length})`}
            </h2>
          </div>
          <Award className="w-5 h-5 text-[#991B1B] dark:text-[#D97706]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {ACADEMIC_BADGES.map((badge) => {
            const unlocked = profile.earnedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border space-y-1.5 ${
                  unlocked
                    ? 'bg-[#FAF8F5] dark:bg-[#0B0F17] border-[#991B1B]/60 dark:border-[#D97706]/60'
                    : 'bg-zinc-50/60 dark:bg-zinc-900/40 border-[#E6E2DA] dark:border-[#263042] opacity-65'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono-tabular">
                  <span className="text-[#991B1B] dark:text-[#D97706] font-semibold">
                    {badge.category}
                  </span>
                  <span>{unlocked ? '✓ Đã mở' : 'Chưa mở'}</span>
                </div>
                <h3 className="text-sm font-bold">
                  {showVi && badge.titleVi ? badge.titleVi : badge.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {showVi && badge.descriptionVi ? badge.descriptionVi : badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
