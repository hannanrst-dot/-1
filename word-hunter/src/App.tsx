import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LevelConfig, ArrowType, SpellingItem, ArcherBow, LevelResult,
  PlayerProgress, ClassSessionState,
} from './types/game';
import { GAME_REALMS, ARCHER_BOWS, ALL_LEVELS, nextLevelOf } from './services/WorldData';
import { audioService } from './services/AudioService';
import { classSession } from './services/ClassSession';
import { loadProgress, saveProgress, resetProgress, DEFAULT_ARROWS } from './services/Progress';
import { GameCanvas } from './components/GameCanvas';
import { WorldMap } from './components/WorldMap';
import { HUD } from './components/HUD';
import { PauseModal } from './components/PauseModal';
import { ClassroomDiscussionModal } from './components/ClassroomDiscussionModal';
import { StudentPickerModal } from './components/StudentPickerModal';
import { ArmoryModal } from './components/ArmoryModal';
import { SpellingGuideModal } from './components/SpellingGuideModal';
import { TeacherCustomWordsModal } from './components/TeacherCustomWordsModal';
import { LevelEndModal } from './components/LevelEndModal';
import { ClassSessionModal } from './components/ClassSessionModal';
import { ClassReportModal } from './components/ClassReportModal';
import { RotateHint } from './components/RotateHint';

type View = 'map' | 'game';
type Modal =
  | null | 'pause' | 'discussion' | 'students' | 'armory'
  | 'guide' | 'teacherWords' | 'session' | 'report';

export function App() {
  /* ─────────── پیشرفت بازیکن ─────────── */
  const [progress, setProgress] = useState<PlayerProgress>(loadProgress);
  useEffect(() => { saveProgress(progress); }, [progress]);

  const patch = useCallback((p: Partial<PlayerProgress>) => {
    setProgress((prev) => ({ ...prev, ...p }));
  }, []);

  /* ─────────── ناوبری ─────────── */
  const [view, setView] = useState<View>('map');
  const [level, setLevel] = useState<LevelConfig | null>(null);
  const [runKey, setRunKey] = useState(0);           // برای شروع دوبارهٔ مرحله
  const [modal, setModal] = useState<Modal>(null);
  const [result, setResult] = useState<LevelResult | null>(null);

  /* ─────────── وضعیت جاری بازی ─────────── */
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [arrowType, setArrowType] = useState<ArrowType>('standard');
  const [currentItem, setCurrentItem] = useState<SpellingItem | null>(null);

  /* ─────────── تنظیمات ─────────── */
  const [projector, setProjector] = useState(() => localStorage.getItem('wh_projector') === '1');
  const [muted, setMuted] = useState(() => audioService.getIsMuted());
  const [musicOn, setMusicOn] = useState(() => audioService.getMusicOn());

  /* ─────────── جلسهٔ کلاس ─────────── */
  const [session, setSession] = useState<ClassSessionState>(() => classSession.get());
  useEffect(() => classSession.subscribe(setSession), []);

  useEffect(() => { localStorage.setItem('wh_projector', projector ? '1' : '0'); }, [projector]);

  // بیدار کردن موتور صدا با نخستین تعامل کاربر
  useEffect(() => {
    const wake = () => audioService.unlock();
    window.addEventListener('pointerdown', wake, { once: true });
    window.addEventListener('keydown', wake, { once: true });
    return () => {
      window.removeEventListener('pointerdown', wake);
      window.removeEventListener('keydown', wake);
    };
  }, []);

  // کلید Escape برای توقف
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modal) setModal(null);
        else if (view === 'game' && !result) setModal('pause');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal, view, result]);

  const equippedBow: ArcherBow =
    ARCHER_BOWS.find((b) => b.id === progress.equippedBowId) || ARCHER_BOWS[0];

  const isPaused = modal !== null || result !== null;

  /* ─────────── شروع و پایان مرحله ─────────── */

  const startLevel = useCallback((lvl: LevelConfig) => {
    audioService.unlock();
    setLevel(lvl);
    setResult(null);
    setModal(null);
    setCombo(0);
    setBestCombo(0);
    setCurrentItem(null);
    setRunKey((k) => k + 1);
    setView('game');
  }, []);

  const handleFinish = useCallback((r: LevelResult) => {
    setResult(r);
    if (!level) return;

    if (r.victory) {
      setProgress((prev) => {
        const stars = Math.max(prev.completedLevels[level.id] || 0, r.stars);
        const high = Math.max(prev.highScores[level.id] || 0, r.score);
        const next = nextLevelOf(level.id);
        const unlocked =
          next && !prev.unlockedLevels.includes(next.id)
            ? [...prev.unlockedLevels, next.id]
            : prev.unlockedLevels;
        const bonusCoins = r.stars * 40;
        return {
          ...prev,
          completedLevels: { ...prev.completedLevels, [level.id]: stars },
          highScores: { ...prev.highScores, [level.id]: high },
          unlockedLevels: unlocked,
          coins: prev.coins + bonusCoins,
        };
      });
    }
    setProgress((prev) => ({
      ...prev,
      totalShots: prev.totalShots + r.shots,
      totalHits: prev.totalHits + r.hits,
    }));
  }, [level]);

  const handleScoreDelta = useCallback((points: number, coins: number) => {
    setProgress((prev) => ({ ...prev, score: prev.score + points, coins: prev.coins + coins }));
  }, []);

  const handleComboChange = useCallback((c: number) => {
    setCombo(c);
    setBestCombo((b) => Math.max(b, c));
  }, []);

  const handleWordResult = useCallback((item: SpellingItem, correct: boolean) => {
    classSession.recordAnswer(item, correct, correct ? 100 : 0);
    setCurrentItem(item);
    // در حالت نوبتی، پس از هر پاسخ نوبت به نفر بعد می‌رسد
    if (classSession.get().turnMode === 'turns') classSession.nextTurn();
  }, []);

  const handleConsumeArrow = useCallback((type: ArrowType) => {
    if (type === 'standard') return;
    setProgress((prev) => ({
      ...prev,
      arrowInventory: { ...prev.arrowInventory, [type]: Math.max(0, prev.arrowInventory[type] - 1) },
    }));
  }, []);

  /* ─────────── فروشگاه ─────────── */

  const buyBow = (bow: ArcherBow) => {
    if (progress.coins < bow.price || progress.unlockedBows.includes(bow.id)) return;
    audioService.playCoin();
    patch({
      coins: progress.coins - bow.price,
      unlockedBows: [...progress.unlockedBows, bow.id],
      equippedBowId: bow.id,
    });
  };

  const buyArrows = (type: ArrowType, cost: number, count: number) => {
    if (progress.coins < cost) return;
    audioService.playCoin();
    patch({
      coins: progress.coins - cost,
      arrowInventory: { ...progress.arrowInventory, [type]: progress.arrowInventory[type] + count },
    });
  };

  /* ─────────── مشتق‌ها ─────────── */

  const totalStars = useMemo(
    () => Object.values(progress.completedLevels).reduce((a, b) => a + b, 0),
    [progress.completedLevels]
  );
  const maxStars = ALL_LEVELS.length * 3;

  const toggleMute = () => { setMuted(audioService.toggleMute()); };
  const toggleMusic = () => { setMusicOn(audioService.toggleMusic()); };

  const nextLevel = level ? nextLevelOf(level.id) : undefined;

  const handleRestart = () => {
    if (level) startLevel(level);
  };

  const backToMap = () => {
    setView('map');
    setResult(null);
    setModal(null);
    setLevel(null);
    setCombo(0);
    audioService.stopSpeech();
  };

  const handleResetProgress = () => {
    resetProgress();
    setProgress({
      score: 0, coins: 250, completedLevels: {}, highScores: {},
      unlockedLevels: [ALL_LEVELS[0].id], unlockedBows: ['bow_apprentice'],
      equippedBowId: 'bow_apprentice', arrowInventory: { ...DEFAULT_ARROWS },
      totalShots: 0, totalHits: 0,
    });
    backToMap();
  };

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-slate-950 text-slate-100 flex flex-col">
      {view === 'map' && (
        <WorldMap
          realms={GAME_REALMS}
          progress={progress}
          totalStars={totalStars}
          maxStars={maxStars}
          projector={projector}
          muted={muted}
          musicOn={musicOn}
          session={session}
          onSelectLevel={startLevel}
          onToggleProjector={() => setProjector((p) => !p)}
          onToggleMute={toggleMute}
          onToggleMusic={toggleMusic}
          onOpenGuide={() => setModal('guide')}
          onOpenTeacherWords={() => setModal('teacherWords')}
          onOpenArmory={() => setModal('armory')}
          onOpenSession={() => setModal('session')}
          onOpenReport={() => setModal('report')}
        />
      )}

      {view === 'game' && level && (
        <div className="relative w-full h-full flex flex-col overflow-hidden">
          <HUD
            score={progress.score}
            coins={progress.coins}
            combo={combo}
            equippedBow={equippedBow}
            arrowType={arrowType}
            inventory={progress.arrowInventory}
            projector={projector}
            muted={muted}
            level={level}
            currentStudent={session.currentStudent}
            turnMode={session.turnMode}
            onSelectArrowType={setArrowType}
            onToggleProjector={() => setProjector((p) => !p)}
            onToggleMute={toggleMute}
            onPause={() => setModal('pause')}
            onOpenGuide={() => setModal('guide')}
            onOpenDiscussion={() => setModal('discussion')}
            onOpenStudents={() => setModal('students')}
            onOpenArmory={() => setModal('armory')}
          />

          <div className="flex-1 w-full min-h-0">
            <GameCanvas
              key={`${level.id}_${runKey}_${projector ? 'p' : 'n'}`}
              level={level}
              equippedBow={equippedBow}
              activeArrowType={arrowType}
              arrowInventory={progress.arrowInventory}
              isProjectorMode={projector}
              isPaused={isPaused}
              currentStudent={session.turnMode === 'turns' ? session.currentStudent : null}
              onConsumeArrow={handleConsumeArrow}
              onSelectArrowType={setArrowType}
              onComboChange={handleComboChange}
              onScoreDelta={handleScoreDelta}
              onWordResult={handleWordResult}
              onCurrentItem={setCurrentItem}
              onFinish={handleFinish}
            />
          </div>
          <RotateHint />
        </div>
      )}

      {/* ─────────── پنجره‌ها ─────────── */}

      <PauseModal
        isOpen={modal === 'pause'}
        level={level}
        projector={projector}
        muted={muted}
        musicOn={musicOn}
        onResume={() => setModal(null)}
        onRestart={() => { setModal(null); handleRestart(); }}
        onMap={backToMap}
        onToggleProjector={() => setProjector((p) => !p)}
        onToggleMute={toggleMute}
        onToggleMusic={toggleMusic}
        onOpenGuide={() => setModal('guide')}
      />

      <ClassroomDiscussionModal
        isOpen={modal === 'discussion'}
        item={currentItem}
        projector={projector}
        onClose={() => setModal(null)}
      />

      <StudentPickerModal
        isOpen={modal === 'students'}
        session={session}
        projector={projector}
        onClose={() => setModal(null)}
        onOpenSession={() => setModal('session')}
      />

      <ClassSessionModal
        isOpen={modal === 'session'}
        session={session}
        onClose={() => setModal(null)}
        onOpenReport={() => setModal('report')}
      />

      <ClassReportModal
        isOpen={modal === 'report'}
        session={session}
        onClose={() => setModal(null)}
      />

      <ArmoryModal
        isOpen={modal === 'armory'}
        coins={progress.coins}
        equippedBowId={progress.equippedBowId}
        unlockedBows={progress.unlockedBows}
        inventory={progress.arrowInventory}
        onClose={() => setModal(null)}
        onEquipBow={(id) => patch({ equippedBowId: id })}
        onBuyBow={buyBow}
        onBuyArrows={buyArrows}
      />

      <SpellingGuideModal isOpen={modal === 'guide'} onClose={() => setModal(null)} />

      <TeacherCustomWordsModal
        isOpen={modal === 'teacherWords'}
        onClose={() => setModal(null)}
      />

      {level && result && (
        <LevelEndModal
          result={result}
          level={level}
          bestCombo={bestCombo}
          hasNext={!!nextLevel}
          projector={projector}
          onNext={() => nextLevel && startLevel(nextLevel)}
          onRetry={handleRestart}
          onMap={backToMap}
          onOpenReport={() => setModal('report')}
        />
      )}

      {/* دکمهٔ پنهان بازنشانی پیشرفت — فقط در نقشه */}
      {view === 'map' && (
        <button
          onClick={() => {
            if (window.confirm('همهٔ پیشرفت بازی (ستاره‌ها، سکه‌ها و مرحله‌های باز شده) پاک شود؟')) {
              handleResetProgress();
            }
          }}
          className="fixed bottom-3 left-3 z-40 px-3 py-1.5 rounded-lg bg-slate-900/70 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-500 hover:text-slate-300 transition"
        >
          بازنشانی پیشرفت
        </button>
      )}
    </div>
  );
}

export default App;
