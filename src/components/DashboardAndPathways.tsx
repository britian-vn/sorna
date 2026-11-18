import React from 'react';
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
  const maxRadius = 82;

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
          className="fill-current text-[11px] font-medium font-mono-tabular"
        >
          Listening {listening.toFixed(1)}
        </text>
        <text
          x={center + maxRadius + 8}
          y={center + 4}
          textAnchor="start"
          className="fill-current text-[11px] font-medium font-mono-tabular"
        >
          Reading {reading.toFixed(1)}
        </text>
        <text
          x={center}
          y={center + maxRadius + 20}
          textAnchor="middle"
          className="fill-current text-[11px] font-medium font-mono-tabular"
        >
          Writing {writing.toFixed(1)}
        </text>
        <text
          x={center - maxRadius - 8}
          y={center + 4}
          textAnchor="end"
          className="fill-current text-[11px] font-medium font-mono-tabular"
        >
          Speaking {speaking.toFixed(1)}
        </text>
      </svg>
      <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1 text-center">
        <span>
          {langMode === 'en'
            ? 'Solid Crimson: Current Profile'
            : 'Đỏ Đậm: Trình độ hiện tại'}
        </span>
        <span>·</span>
        <span>
          {langMode === 'en'
            ? `Dashed Indigo: Target Band ${targetBand.toFixed(1)}`
            : `Nét Đứt Xanh: Mục tiêu Band ${targetBand.toFixed(1)}`}
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
  const showEn = langMode === 'bilingual' || langMode === 'en';

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
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E2DA] dark:border-[#263042] pb-6">
          <div className="space-y-1.5">
            <p className="text-xs text-[#991B1B] dark:text-[#D97706] font-medium">
              {langMode === 'vi'
                ? 'Học phần 01 · Lộ trình IELTS 4 Chặng & Mục tiêu Hàng ngày'
                : 'Module 01 · Structured IELTS Band Curriculum & Lộ trình 4 Chặng'}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold font-serif-editorial">
              {langMode === 'vi'
                ? 'Lộ Trình Học IELTS Theo 4 Cấp Độ (Band 0 – 7.0+)'
                : 'Progressive IELTS Band Pathways (Band 0 – 7.0+)'}
            </h1>
            {showEn && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
                Track your progression across four calibrated proficiency tiers. Milestones focused on{' '}
                <strong className="text-[#18181B] dark:text-[#F3F0E6]">{weakestSkill.label}</strong>{' '}
                ({weakestSkill.score.toFixed(1)}) are highlighted for priority completion.
              </p>
            )}
            {showVi && (
              <p className="text-xs text-emerald-800 dark:text-emerald-300 max-w-2xl">
                Theo dõi tiến độ qua 4 chặng năng lực IELTS chuẩn hóa. Dựa trên biểu đồ 4 kỹ năng của bạn, các cột mốc luyện{' '}
                <strong>{weakestSkill.labelVi}</strong> ({weakestSkill.score.toFixed(1)}) được đánh dấu ưu tiên.
              </p>
            )}
          </div>
          <button
            onClick={onOpenPlacement}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#18181B] text-white dark:bg-[#F3F0E6] dark:text-[#0B0F17] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>
              {langMode === 'en' ? 'Recalibrate Placement Test' : 'Kiểm tra Đầu vào / Đổi Band'}
            </span>
          </button>
        </div>

        {/* 4 Band Pathway Tracks */}
        <div className="space-y-6">
          {BAND_PATHWAYS.map((track, idx) => {
            const isCurrent = track.id === profile.currentBandLevel;
            const completedCount = track.milestones.filter((m) =>
              profile.completedMilestones.includes(m.id)
            ).length;
            const pct = Math.round((completedCount / track.milestones.length) * 100);

            return (
              <section
                key={track.id}
                className={`rounded-xl border p-6 transition-colors ${
                  isCurrent
                    ? 'bg-white dark:bg-[#151C28] border-[#991B1B] dark:border-[#D97706]'
                    : 'bg-white/80 dark:bg-[#151C28]/70 border-[#E6E2DA] dark:border-[#263042]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E6E2DA] dark:border-[#263042]">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="font-mono-tabular font-semibold text-[#991B1B] dark:text-[#D97706]">
                        0{idx + 1}. {track.cefrEquivalent}
                      </span>
                      <span>·</span>
                      <span>{langMode === 'vi' && track.dailyGoalTextVi ? track.dailyGoalTextVi : track.dailyGoalText}</span>
                      {isCurrent && (
                        <>
                          <span>·</span>
                          <span className="font-semibold text-[#18181B] dark:text-[#F3F0E6]">
                            {langMode === 'en' ? 'Active Pathway' : 'Chặng Đang Học'}
                          </span>
                        </>
                      )}
                    </div>
                    <h2 className="text-xl font-bold font-serif-editorial">
                      {langMode === 'vi' && track.nameVi ? track.nameVi : track.name}
                    </h2>
                    {langMode === 'bilingual' && track.nameVi && (
                      <p className="text-xs font-medium text-[#991B1B] dark:text-[#D97706]">
                        {track.nameVi} — {track.subtitleVi}
                      </p>
                    )}
                    {showEn && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-3xl">
                        {track.description}
                      </p>
                    )}
                    {showVi && track.descriptionVi && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-3xl">
                        🇻🇳 {track.descriptionVi}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
                    <div className="w-44 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono-tabular">
                        <span>
                          {completedCount}/{track.milestones.length}{' '}
                          {langMode === 'en' ? 'Milestones' : 'Cột mốc'}
                        </span>
                        <span className="font-semibold">{pct}%</span>
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
                        className="px-3.5 py-2 text-xs font-medium border border-[#E6E2DA] dark:border-[#263042] hover:border-[#991B1B] rounded-lg whitespace-nowrap cursor-pointer"
                      >
                        {langMode === 'en' ? 'Set as Active Track' : 'Chọn học chặng này'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Milestones Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
                  {track.milestones.map((ms) => {
                    const checked = profile.completedMilestones.includes(ms.id);
                    const isPrioritySkill = ms.skillFocus === weakestSkill.skill;
                    return (
                      <div
                        key={ms.id}
                        className={`p-4 rounded-lg border flex flex-col justify-between gap-3 transition-colors ${
                          checked
                            ? 'bg-[#FAF8F5] dark:bg-[#0B0F17]/60 border-emerald-600/40'
                            : 'bg-[#FAF8F5]/60 dark:bg-[#0B0F17] border-[#E6E2DA] dark:border-[#263042]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
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
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                              <span className="uppercase font-mono-tabular">{ms.skillFocus}</span>
                              <span>·</span>
                              <span className="font-mono-tabular">
                                {ms.dailyGoalMinutes} {langMode === 'en' ? 'min goal' : 'phút/ngày'}
                              </span>
                              {isPrioritySkill && !checked && (
                                <>
                                  <span>·</span>
                                  <span className="text-[#991B1B] dark:text-[#D97706] font-semibold">
                                    ▲ {langMode === 'en' ? 'Recommended Priority' : 'Ưu tiên luyện tập'}
                                  </span>
                                </>
                              )}
                            </div>
                            {showEn && (
                              <h3
                                className={`text-sm font-semibold ${
                                  checked ? 'line-through text-zinc-400' : ''
                                }`}
                              >
                                {ms.title}
                              </h3>
                            )}
                            {showVi && ms.titleVi && (
                              <p
                                className={`text-xs font-semibold text-[#991B1B] dark:text-[#D97706] ${
                                  checked ? 'line-through opacity-60' : ''
                                }`}
                              >
                                🇻🇳 {ms.titleVi}
                              </p>
                            )}
                            {showEn && (
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                {ms.description}
                              </p>
                            )}
                            {showVi && ms.descriptionVi && (
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                {ms.descriptionVi}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => onNavigate(ms.targetModule)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#991B1B] dark:text-[#D97706] hover:underline cursor-pointer"
                          >
                            <span>
                              {langMode === 'en' ? 'Open Practice Module' : 'Mở bài luyện tập'}
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
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

  // Dashboard Mode
  return (
    <div className="space-y-8">
      {/* Split Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold text-[#991B1B] dark:text-[#D97706]">
                {langMode === 'en' ? 'Active Pathway:' : 'Lộ trình hiện tại:'} Band {profile.currentBandLevel}
              </span>
              <span>·</span>
              <span className="font-mono-tabular">
                {langMode === 'en' ? 'Target:' : 'Mục tiêu:'} Band {profile.targetBand.toFixed(1)}
              </span>
              <span>·</span>
              <span className="font-mono-tabular">
                {langMode === 'en' ? 'Current Estimate:' : 'Band Ước tính:'} Band {overallBand.toFixed(1)}
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold font-serif-editorial tracking-tight">
              {langMode === 'vi'
                ? `Chào mừng trở lại, ${profile.displayName}. Cùng chinh phục mục tiêu IELTS hôm nay!`
                : `Welcome back, ${profile.displayName}. Your daily scholarship awaits.`}
            </h1>
            {showEn && (
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
                Your 4-Skill Balance Radar indicates that{' '}
                <strong className="text-[#18181B] dark:text-[#F3F0E6]">{weakestSkill.label}</strong>{' '}
                (Band {weakestSkill.score.toFixed(1)}) has the highest margin for growth toward your Band{' '}
                {profile.targetBand.toFixed(1)} goal.
              </p>
            )}
            {showVi && (
              <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed max-w-2xl">
                🇻🇳 Biểu đồ năng lực 4 kỹ năng cho thấy <strong>{weakestSkill.labelVi}</strong> (Band{' '}
                {weakestSkill.score.toFixed(1)}) cần được ưu tiên cải thiện để đạt mục tiêu Band{' '}
                {profile.targetBand.toFixed(1)}. Hãy ôn tập thẻ từ vựng SRS đến hạn và luyện Video Shadowing / Điền từ hôm nay!
              </p>
            )}
          </div>

          {/* Primary Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('srs-deck')}
              className="px-4 py-2.5 text-xs font-medium text-white bg-[#991B1B] hover:bg-[#7F1D1D] rounded-lg inline-flex items-center gap-2 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {langMode === 'en'
                  ? `Review ${dueCards.length} Due SRS Flashcards`
                  : `Ôn tập ${dueCards.length} Thẻ Từ Vựng SRS Đến Hạn`}
              </span>
            </button>
            <button
              onClick={() => onNavigate('shadowing')}
              className="px-4 py-2.5 text-xs font-medium border border-[#18181B] dark:border-[#F3F0E6] text-[#18181B] dark:text-[#F3F0E6] hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {langMode === 'en'
                  ? 'YouTube Shadowing & Fill-in-Blank'
                  : 'Luyện Video YouTube Anime/Phim & Điền Từ'}
              </span>
            </button>
            <button
              onClick={onOpenPlacement}
              className="px-3.5 py-2.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#991B1B] underline cursor-pointer"
            >
              {profile.diagnosticSavedState && !profile.diagnosticCompleted
                ? langMode === 'en'
                  ? 'Resume Saved Placement Test'
                  : 'Tiếp tục Bài Kiểm Tra Đầu Vào'
                : langMode === 'en'
                ? 'Take 4-Skill Placement Test'
                : 'Làm Bài Kiểm Tra Đầu Vào 4 Kỹ Năng'}
            </button>
          </div>
        </div>

        {/* Right Editorial Image Card */}
        <div className="lg:col-span-5 relative rounded-xl overflow-hidden border border-[#E6E2DA] dark:border-[#263042] min-h-[260px] bg-zinc-900">
          <img
            src={HERO_LIBRARY_IMAGE}
            alt="Historic university library desk with warm sunlight and open notebooks"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 flex flex-col justify-end text-white">
            <p className="text-xs text-amber-300 font-mono-tabular">
              {langMode === 'vi' && activeTrack.nameVi ? activeTrack.nameVi : activeTrack.name} ·{' '}
              {activeTrackPercent}%
            </p>
            <h2 className="text-lg font-semibold font-serif-editorial mt-1">
              {langMode === 'vi' && activeTrack.subtitleVi
                ? activeTrack.subtitleVi
                : activeTrack.subtitle}
            </h2>
            <p className="text-xs text-zinc-200 mt-1">
              {langMode === 'vi' && activeTrack.dailyGoalTextVi
                ? activeTrack.dailyGoalTextVi
                : activeTrack.dailyGoalText}
            </p>
            <div className="w-full h-1.5 bg-white/25 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-amber-400 transition-all duration-300"
                style={{ width: `${activeTrackPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width 4-Column KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>{langMode === 'en' ? 'Estimated Overall Band' : 'Band Tổng Ước Tính'}</span>
            <Target className="w-4 h-4 text-[#991B1B] dark:text-[#D97706]" />
          </div>
          <p className="text-2xl font-bold font-mono-tabular">{overallBand.toFixed(1)}</p>
          <p className="text-xs text-zinc-500">
            {langMode === 'en' ? 'Target:' : 'Mục tiêu:'} Band {profile.targetBand.toFixed(1)} ·{' '}
            {profile.currentBandLevel}
          </p>
        </div>

        <div className="bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>{langMode === 'en' ? 'SRS Vocabulary Deck' : 'Bộ Thẻ Từ Vựng SRS'}</span>
            <Layers className="w-4 h-4 text-[#1E3A8A] dark:text-[#60A5FA]" />
          </div>
          <p className="text-2xl font-bold font-mono-tabular">
            {dueCards.length} {langMode === 'en' ? 'Due' : 'Cần ôn'} · {masteredCount}{' '}
            {langMode === 'en' ? 'Mastered' : 'Thuộc lòng'}
          </p>
          <p className="text-xs text-zinc-500">
            {srsCards.length} {langMode === 'en' ? 'cards in SM-2 deck' : 'từ vựng song ngữ Anh-Việt'}
          </p>
        </div>

        <div className="bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>{langMode === 'en' ? 'Daily Study Streak' : 'Chuỗi Ngày Học Liên Tiếp'}</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-mono-tabular">
            {profile.studyStreak} {langMode === 'en' ? 'Days' : 'Ngày'}
          </p>
          <p className="text-xs text-zinc-500">
            {langMode === 'en' ? 'Reminder:' : 'Nhắc học:'}{' '}
            {profile.reminderEnabled ? `${profile.reminderTime}` : 'Tắt'}
          </p>
        </div>

        <div className="bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>{langMode === 'en' ? 'Completed Milestones' : 'Cột Mốc Hoàn Thành'}</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-mono-tabular">
            {profile.completedMilestones.length}{' '}
            {langMode === 'en' ? 'Milestones' : 'Cột mốc'}
          </p>
          <p className="text-xs text-zinc-500">
            {profile.completedLessons.length} {langMode === 'en' ? 'CEFR lessons' : 'bài học CEFR'} ·{' '}
            {attempts.length} {langMode === 'en' ? 'tests' : 'bài thi'}
          </p>
        </div>
      </div>

      {/* 2-Column Analytics: 4-Skill Radar Chart + Active Band Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <p className="text-xs text-[#991B1B] dark:text-[#D97706] font-medium">
              {langMode === 'en' ? '4-Skill Balance Analytics' : 'Phân Tích Cân Bằng 4 Kỹ Năng'}
            </p>
            <h2 className="text-lg font-bold font-serif-editorial mt-0.5">
              {langMode === 'en' ? 'IELTS Competency Radar' : 'Biểu Đồ Radar Năng Lực IELTS'}
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

          <div className="p-3.5 rounded-lg bg-[#FAF8F5] dark:bg-[#0B0F17] border border-[#E6E2DA] dark:border-[#263042] space-y-1">
            <p className="text-xs font-semibold text-[#18181B] dark:text-[#F3F0E6]">
              {langMode === 'en'
                ? `Adaptive Pathway Focus: Prioritize ${weakestSkill.label} (${weakestSkill.score.toFixed(1)})`
                : `Đề xuất Trọng tâm: Ưu tiên luyện ${weakestSkill.labelVi} (${weakestSkill.score.toFixed(1)})`}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {langMode === 'en'
                ? `Raising your ${weakestSkill.label} score by +1.0 band will lift your composite IELTS average to ${((overallBand * 4 + 1) / 4).toFixed(1)}.`
                : `Tăng điểm ${weakestSkill.labelVi} thêm +1.0 band sẽ nâng tổng điểm IELTS Overall của bạn lên ${((overallBand * 4 + 1) / 4).toFixed(1)}.`}
            </p>
          </div>
        </div>

        {/* Right: Active Band Pathway Checklist */}
        <div className="lg:col-span-7 bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#E6E2DA] dark:border-[#263042] pb-3">
            <div>
              <p className="text-xs text-zinc-500">
                {langMode === 'en' ? 'Current Structured Track' : 'Lộ trình hiện tại của bạn'}
              </p>
              <h2 className="text-lg font-bold font-serif-editorial">
                {langMode === 'vi' && activeTrack.nameVi ? activeTrack.nameVi : activeTrack.name}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('pathways')}
              className="text-xs font-medium text-[#991B1B] dark:text-[#D97706] hover:underline cursor-pointer"
            >
              {langMode === 'en' ? 'View All 4 Band Tracks →' : 'Xem toàn bộ 4 Chặng Band →'}
            </button>
          </div>

          <div className="space-y-3">
            {activeTrack.milestones.map((ms) => {
              const done = profile.completedMilestones.includes(ms.id);
              return (
                <div
                  key={ms.id}
                  className="p-3.5 rounded-lg border border-[#E6E2DA] dark:border-[#263042] bg-[#FAF8F5] dark:bg-[#0B0F17] flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleMilestone(ms.id)}
                      className="mt-0.5 text-[#991B1B] dark:text-[#D97706] cursor-pointer"
                    >
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <div className="space-y-0.5">
                      {showEn && (
                        <p className={`text-xs font-semibold ${done ? 'line-through text-zinc-400' : ''}`}>
                          {ms.title}
                        </p>
                      )}
                      {showVi && ms.titleVi && (
                        <p className={`text-xs font-medium text-[#991B1B] dark:text-[#D97706] ${done ? 'line-through opacity-60' : ''}`}>
                          🇻🇳 {ms.titleVi}
                        </p>
                      )}
                      <p className="text-[11px] text-zinc-500">
                        Focus: {ms.skillFocus.toUpperCase()} · {ms.dailyGoalMinutes}{' '}
                        {langMode === 'en' ? 'mins/day' : 'phút/ngày'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate(ms.targetModule)}
                    className="px-3 py-1.5 text-xs font-medium border border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#151C28] rounded-md hover:border-[#991B1B] shrink-0 cursor-pointer"
                  >
                    {langMode === 'en' ? 'Launch' : 'Học ngay'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gamification: Academic Badges Showcase */}
      <div className="bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#991B1B] dark:text-[#D97706] font-medium">
              {langMode === 'en' ? 'Academic Distinctions & Milestones' : 'Danh Hiệu & Huy Hiệu Học Thuật'}
            </p>
            <h2 className="text-lg font-bold font-serif-editorial">
              {langMode === 'en'
                ? `Earned Academic Badges (${profile.earnedBadges.length} / ${ACADEMIC_BADGES.length})`
                : `Huy Hiệu Đã Đạt Được (${profile.earnedBadges.length} / ${ACADEMIC_BADGES.length})`}
            </h2>
          </div>
          <Award className="w-5 h-5 text-[#991B1B] dark:text-[#D97706]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ACADEMIC_BADGES.map((badge) => {
            const unlocked = profile.earnedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border space-y-1.5 ${
                  unlocked
                    ? 'bg-[#FAF8F5] dark:bg-[#0B0F17] border-[#991B1B]/60 dark:border-[#D97706]/60'
                    : 'bg-zinc-50/60 dark:bg-zinc-900/40 border-[#E6E2DA] dark:border-[#263042] opacity-65'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono-tabular">
                  <span className="text-[#991B1B] dark:text-[#D97706] font-semibold">
                    {badge.category}
                  </span>
                  <span>
                    {unlocked
                      ? langMode === 'en'
                        ? '✓ Unlocked'
                        : '✓ Đã mở'
                      : langMode === 'en'
                      ? 'Locked'
                      : 'Chưa mở'}
                  </span>
                </div>
                <h3 className="text-sm font-semibold font-serif-editorial">
                  {langMode === 'vi' && badge.titleVi ? badge.titleVi : badge.title}
                </h3>
                {langMode === 'bilingual' && badge.titleVi && (
                  <p className="text-[11px] font-medium text-[#991B1B] dark:text-[#D97706]">
                    {badge.titleVi}
                  </p>
                )}
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
                  {langMode === 'vi' && badge.descriptionVi
                    ? badge.descriptionVi
                    : badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
