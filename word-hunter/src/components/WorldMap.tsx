import React, { useState, useMemo } from 'react';
import { Realm, LevelConfig, PlayerProgress, ClassSessionState } from '../types/game';
import { spellingContentAdapter } from '../services/SpellingContentAdapter';
import { fa } from '../engine/world';
import { TeacherMenu } from './TeacherMenu';
import { countUnlocked, ACHIEVEMENTS } from '../services/Achievements';
import { Star, Lock, Play, Tv, Volume2, VolumeX, Trophy, Medal } from 'lucide-react';

interface Props {
  realms: Realm[];
  progress: PlayerProgress;
  totalStars: number;
  maxStars: number;
  projector: boolean;
  muted: boolean;
  musicOn: boolean;
  session: ClassSessionState;
  onSelectLevel: (l: LevelConfig) => void;
  onToggleProjector: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onOpenGuide: () => void;
  onOpenTeacherWords: () => void;
  onOpenArmory: () => void;
  onOpenSession: () => void;
  onOpenReport: () => void;
  onOpenBadges: () => void;
  onResetProgress: () => void;
}

const REALM_BG: Record<string, string> = {
  forest: 'radial-gradient(ellipse at 50% 20%, #065f46 0%, #022c22 55%, #020617 100%)',
  crystal_cave: 'radial-gradient(ellipse at 50% 20%, #5b21b6 0%, #2e1065 55%, #020617 100%)',
  sky_city: 'radial-gradient(ellipse at 50% 20%, #0369a1 0%, #082f49 55%, #020617 100%)',
  dark_fortress: 'radial-gradient(ellipse at 50% 20%, #9a3412 0%, #431407 55%, #020617 100%)',
  desert_ruins: 'radial-gradient(ellipse at 50% 20%, #a16207 0%, #422006 55%, #020617 100%)',
  celestial_island: 'radial-gradient(ellipse at 50% 20%, #6d28d9 0%, #2e1065 45%, #020617 100%)',
};

export const WorldMap: React.FC<Props> = ({
  realms, progress, totalStars, maxStars, projector, muted, musicOn, session,
  onSelectLevel, onToggleProjector, onToggleMute, onToggleMusic,
  onOpenGuide, onOpenTeacherWords, onOpenArmory, onOpenSession, onOpenReport, onOpenBadges, onResetProgress,
}) => {
  const [realmId, setRealmId] = useState(realms[0].id);
  const realm = realms.find((r) => r.id === realmId) || realms[0];

  const realmStars = useMemo(() => {
    const done = realm.levels.reduce((a, l) => a + (progress.completedLevels[l.id] || 0), 0);
    return { done, max: realm.levels.length * 3 };
  }, [realm, progress.completedLevels]);

  const iconBtn = 'p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition active:scale-95';

  return (
    <div className="relative w-full h-full overflow-y-auto bg-slate-950 text-slate-100">
      {/* پس‌زمینهٔ قلمرو */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-700 opacity-45"
        style={{ background: REALM_BG[realm.bgTheme] }}
      />
      <div className="fixed inset-0 pointer-events-none opacity-[0.07]"
        style={{ backgroundImage: 'radial-gradient(circle at 25% 30%, #fff 1px, transparent 1px), radial-gradient(circle at 70% 60%, #fff 1px, transparent 1px)', backgroundSize: '120px 120px, 90px 90px' }} />

      {/* سربرگ */}
      <header className="relative z-20 sticky top-0 flex flex-wrap items-center justify-between gap-3 px-4 lg:px-8 py-3 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/25">
            🏹
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-black bg-gradient-to-l from-amber-300 via-yellow-100 to-amber-400 bg-clip-text text-transparent leading-tight">
              شکارچی کلمات
            </h1>
            <p className="text-[11px] text-slate-400">بازی اکشن آموزش املای فارسی برای کلاس درس</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-yellow-500/40">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-black text-yellow-300">{fa(totalStars)}</span>
            <span className="text-[10px] text-slate-500">/ {fa(maxStars)}</span>
          </div>
          <button onClick={onOpenArmory} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-amber-500/40 transition active:scale-95">
            <span className="text-sm">🪙</span>
            <span className="text-sm font-black text-amber-300">{fa(progress.coins)}</span>
          </button>
          <button
            onClick={onOpenBadges}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-amber-500/40 transition active:scale-95"
            title="نشان‌های شکارچی"
          >
            <Medal className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-black text-amber-300">
              {fa(countUnlocked(progress))}
              <span className="text-[10px] text-slate-500"> / {fa(ACHIEVEMENTS.length)}</span>
            </span>
          </button>
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-black text-emerald-300">{fa(progress.score)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TeacherMenu
            session={session}
            musicOn={musicOn}
            onOpenSession={onOpenSession}
            onOpenReport={onOpenReport}
            onOpenTeacherWords={onOpenTeacherWords}
            onOpenGuide={onOpenGuide}
            onToggleMusic={onToggleMusic}
            onResetProgress={onResetProgress}
          />
          {/* فقط دو چیزی که معلم وسط کلاس مدام به آن‌ها دست می‌زند بیرون می‌مانند */}
          <button
            onClick={onToggleProjector}
            className={`${iconBtn} ${projector ? '!bg-amber-400 !text-slate-950 !border-amber-300' : ''}`}
            title="حالت ویدئوپروژکتور — قلم درشت‌تر برای دیده شدن از ته کلاس"
          >
            <Tv className="w-5 h-5" />
          </button>
          <button onClick={onToggleMute} className={iconBtn} title={muted ? 'روشن کردن صدا' : 'قطع صدا'}>
            {muted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 flex flex-col gap-6">
        {/* نوار جلسهٔ کلاس */}
        {session.roster.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-2xl bg-teal-950/50 border border-teal-800/60">
            <span className="text-lg">🧑‍🏫</span>
            <span className="text-sm font-black text-teal-100">{session.className}</span>
            <span className="text-xs text-teal-300/80">{fa(session.roster.length)} دانش‌آموز</span>
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${
              session.turnMode === 'turns'
                ? 'bg-teal-500/20 border-teal-400/50 text-teal-200'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              {session.turnMode === 'turns' ? 'حالت نوبتی' : 'حالت آزاد'}
            </span>
            {session.totalAttempts > 0 && (
              <span className="text-xs text-slate-400">
                دقت کلاس: <b className="text-emerald-300">{fa(Math.round((session.totalCorrect / session.totalAttempts) * 100))}٪</b>
                {' '}از {fa(session.totalAttempts)} پاسخ
              </span>
            )}
            <button onClick={onOpenReport} className="mr-auto text-xs font-bold text-teal-300 hover:text-teal-200 transition">
              دیدن کارنامه ←
            </button>
          </div>
        )}

        {/* قلمروها */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {realms.map((r) => {
            const on = r.id === realm.id;
            const stars = r.levels.reduce((a, l) => a + (progress.completedLevels[l.id] || 0), 0);
            const unlocked = r.levels.some((l) => progress.unlockedLevels.includes(l.id));
            return (
              <button
                key={r.id}
                onClick={() => setRealmId(r.id)}
                className={`shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-all duration-300 active:scale-95 ${
                  on
                    ? 'bg-slate-900 border-amber-400 shadow-lg shadow-amber-500/10 scale-[1.03]'
                    : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800'
                } ${!unlocked ? 'opacity-55' : ''}`}
              >
                <span className="text-xl">{unlocked ? r.icon : '🔒'}</span>
                <div className="text-right leading-tight">
                  <div className={`text-sm font-black ${on ? 'text-amber-300' : 'text-slate-300'}`}>{r.title}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                    {fa(stars)} / {fa(r.levels.length * 3)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* بنر قلمرو */}
        <div className="relative overflow-hidden rounded-3xl p-6 lg:p-7 border border-slate-700/70 bg-slate-900/70 backdrop-blur-md shadow-2xl">
          <div
            className="absolute -left-16 -top-16 w-56 h-56 rounded-full blur-3xl opacity-25 pointer-events-none"
            style={{ background: realm.primaryColor }}
          />
          <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2.5">
                <span>{realm.icon}</span> قلمرو {realm.title}
                <span className="text-slate-500 font-normal">{realm.englishTitle}</span>
              </div>
              <h2 className="text-xl lg:text-3xl font-black text-slate-50 leading-snug">{realm.subtitle}</h2>
              <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">{realm.description}</p>
            </div>
            <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950/70 border border-slate-700">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-lg font-black text-yellow-300">{fa(realmStars.done)}</span>
              <span className="text-xs text-slate-500">از {fa(realmStars.max)}</span>
            </div>
          </div>
        </div>

        {/* مرحله‌ها */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pb-16">
          {realm.levels.map((lvl) => {
            const unlocked = progress.unlockedLevels.includes(lvl.id);
            const stars = progress.completedLevels[lvl.id] || 0;
            const high = progress.highScores[lvl.id] || 0;
            const boss = lvl.mode === 'boss_battle';
            const mode = spellingContentAdapter.getGameModeDisplayName(lvl.mode);
            const cat = spellingContentAdapter.getCategoryInfo(lvl.category);

            return (
              <div
                key={lvl.id}
                className={`group relative rounded-2xl p-5 border flex flex-col justify-between overflow-hidden transition-all duration-300 ${
                  unlocked
                    ? boss
                      ? 'bg-gradient-to-b from-rose-950/70 to-slate-900/90 border-rose-500/60 hover:border-rose-400 hover:shadow-2xl hover:shadow-rose-500/20 hover:-translate-y-1'
                      : 'bg-slate-900/85 border-slate-700/80 hover:border-amber-400/70 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1'
                    : 'bg-slate-950/70 border-slate-800/70 opacity-60'
                }`}
              >
                {stars === 3 && (
                  <div className="absolute -left-8 top-4 rotate-[-38deg] px-8 py-0.5 bg-amber-400 text-slate-950 text-[9px] font-black shadow">
                    کامل
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-slate-800 text-amber-300 border border-slate-700">
                      مرحلهٔ {fa(lvl.levelNumber)}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-800/70 px-2.5 py-1 rounded-lg border border-slate-700/60">
                      <span>{mode.icon}</span>
                      <span className="font-bold">{mode.fa}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-50 group-hover:text-amber-300 transition">{lvl.title}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed min-h-[32px]">{lvl.description}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-950 text-slate-300 border border-slate-700">
                      {cat.icon} {cat.short}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-800 text-slate-400">
                      {spellingContentAdapter.getGradeDisplayName(lvl.grade)}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-800 text-slate-400">
                      {'★'.repeat(lvl.difficulty)}
                    </span>
                  </div>

                  {high > 0 && (
                    <div className="mt-2.5 text-[10px] text-slate-500">
                      بهترین امتیاز: <b className="text-emerald-400">{fa(high)}</b>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}`} />
                    ))}
                  </div>

                  {unlocked ? (
                    <button
                      onClick={() => onSelectLevel(lvl)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black shadow-lg transition active:scale-95 ${
                        boss
                          ? 'bg-gradient-to-l from-rose-500 to-orange-400 hover:from-rose-400 text-white'
                          : 'bg-gradient-to-l from-amber-400 to-yellow-300 hover:from-amber-300 text-slate-950'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      {boss ? 'نبرد!' : stars > 0 ? 'دوباره' : 'شروع'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                      <Lock className="w-3.5 h-3.5" /> قفل
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
