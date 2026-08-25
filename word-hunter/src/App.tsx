import { useState, useEffect } from 'react';
import { LevelConfig, ArrowType, SpellingItem, ArcherBow } from './types/game';
import { GAME_REALMS, ARCHER_BOWS } from './services/WorldData';
import { audioService } from './services/AudioService';
import { GameCanvas } from './components/GameCanvas';
import { WorldMap } from './components/WorldMap';
import { HUD } from './components/HUD';
import { ClassroomDiscussionModal } from './components/ClassroomDiscussionModal';
import { StudentPickerModal } from './components/StudentPickerModal';
import { ArmoryModal } from './components/ArmoryModal';
import { SpellingGuideModal } from './components/SpellingGuideModal';
import { TeacherCustomWordsModal } from './components/TeacherCustomWordsModal';
import { LevelVictoryModal } from './components/LevelVictoryModal';
import { ClassroomRoomModal } from './components/ClassroomRoomModal';

export function App() {
  // Navigation & Screen View
  const [currentView, setCurrentView] = useState<'map' | 'game'>('map');
  const [activeLevel, setActiveLevel] = useState<LevelConfig | null>(null);

  // Player Stats & Progression
  const [score, setScore] = useState<number>(() => {
    const saved = localStorage.getItem('wh_score');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem('wh_coins');
    return saved ? parseInt(saved, 10) : 250;
  });

  const [currentCombo, setCurrentCombo] = useState<number>(0);
  const [highestCombo, setHighestCombo] = useState<number>(0);

  const [completedLevels, setCompletedLevels] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('wh_completed_levels');
    return saved ? JSON.parse(saved) : {};
  });

  const [unlockedLevels, setUnlockedLevels] = useState<string[]>(() => {
    const saved = localStorage.getItem('wh_unlocked_levels');
    return saved ? JSON.parse(saved) : ['r1_l1', 'r1_l2'];
  });

  // Armory & Bow State
  const [equippedBowId, setEquippedBowId] = useState<string>(() => {
    return localStorage.getItem('wh_equipped_bow') || 'bow_apprentice';
  });

  const [unlockedBows, setUnlockedBows] = useState<string[]>(() => {
    const saved = localStorage.getItem('wh_unlocked_bows');
    return saved ? JSON.parse(saved) : ['bow_apprentice'];
  });

  const [activeArrowType, setActiveArrowType] = useState<ArrowType>('standard');
  const [arrowInventory, setArrowInventory] = useState<Record<ArrowType, number>>({
    standard: 9999,
    fire: 10,
    slow_mo: 8,
    piercing: 5,
    multi_shot: 6,
  });

  // Settings & Classroom Features
  const [isProjectorMode, setIsProjectorMode] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Current Spelling Word in arena (for Classroom Discussion)
  const [currentSpellingItem, setCurrentSpellingItem] = useState<SpellingItem | null>(null);

  // Modals Visibility
  const [isDiscussionOpen, setIsDiscussionOpen] = useState<boolean>(false);
  const [isStudentPickerOpen, setIsStudentPickerOpen] = useState<boolean>(false);
  const [isArmoryOpen, setIsArmoryOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isTeacherWordsOpen, setIsTeacherWordsOpen] = useState<boolean>(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState<boolean>(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState<boolean>(false);
  const [victoryStars, setVictoryStars] = useState<number>(3);
  const [victoryScoreGained, setVictoryScoreGained] = useState<number>(0);

  // Save progression to LocalStorage
  useEffect(() => {
    localStorage.setItem('wh_score', score.toString());
    localStorage.setItem('wh_coins', coins.toString());
    localStorage.setItem('wh_completed_levels', JSON.stringify(completedLevels));
    localStorage.setItem('wh_unlocked_levels', JSON.stringify(unlockedLevels));
    localStorage.setItem('wh_equipped_bow', equippedBowId);
    localStorage.setItem('wh_unlocked_bows', JSON.stringify(unlockedBows));
  }, [score, coins, completedLevels, unlockedLevels, equippedBowId, unlockedBows]);

  const equippedBow: ArcherBow =
    ARCHER_BOWS.find((b) => b.id === equippedBowId) || ARCHER_BOWS[0];

  // Handlers
  const handleStartLevel = (level: LevelConfig) => {
    setActiveLevel(level);
    setCurrentCombo(0);
    setHighestCombo(0);
    setIsPaused(false);
    setCurrentView('game');
  };

  const handleToggleProjectorMode = () => {
    setIsProjectorMode((prev) => !prev);
  };

  const handleToggleMute = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
  };

  const handleHitTarget = (isCorrect: boolean, points: number, item?: SpellingItem) => {
    if (item) {
      setCurrentSpellingItem(item);
    }

    if (isCorrect) {
      setCurrentCombo((prev) => {
        const next = prev + 1;
        setHighestCombo((h) => Math.max(h, next));
        return next;
      });
      setScore((prev) => prev + points + currentCombo * 25);
      setCoins((prev) => prev + 10 + currentCombo * 2);
    } else {
      setCurrentCombo(0);
    }
  };

  const handleConsumeArrow = (type: ArrowType) => {
    if (type !== 'standard') {
      setArrowInventory((prev) => ({
        ...prev,
        [type]: Math.max(0, prev[type] - 1),
      }));
    }
  };

  const handleCompleteLevel = (stars: number, earnedScore: number) => {
    if (!activeLevel) return;

    setVictoryStars(stars);
    setVictoryScoreGained(earnedScore);
    setIsVictoryModalOpen(true);
    setIsPaused(true);

    // Save completion
    setCompletedLevels((prev) => ({
      ...prev,
      [activeLevel.id]: Math.max(prev[activeLevel.id] || 0, stars),
    }));

    // Unlock next level in realm or next realm
    const allLevelsFlat = GAME_REALMS.flatMap((r) => r.levels);
    const currentIndex = allLevelsFlat.findIndex((l) => l.id === activeLevel.id);
    if (currentIndex !== -1 && currentIndex + 1 < allLevelsFlat.length) {
      const nextLevel = allLevelsFlat[currentIndex + 1];
      setUnlockedLevels((prev) => (prev.includes(nextLevel.id) ? prev : [...prev, nextLevel.id]));
    }
  };

  const handleNextLevel = () => {
    setIsVictoryModalOpen(false);
    if (!activeLevel) return;

    const allLevelsFlat = GAME_REALMS.flatMap((r) => r.levels);
    const currentIndex = allLevelsFlat.findIndex((l) => l.id === activeLevel.id);
    if (currentIndex !== -1 && currentIndex + 1 < allLevelsFlat.length) {
      const nextLevel = allLevelsFlat[currentIndex + 1];
      handleStartLevel(nextLevel);
    } else {
      setCurrentView('map');
    }
  };

  const handleReplayLevel = () => {
    setIsVictoryModalOpen(false);
    if (activeLevel) {
      handleStartLevel(activeLevel);
    }
  };

  const handleBuyBow = (bow: ArcherBow) => {
    if (coins >= bow.price) {
      setCoins((prev) => prev - bow.price);
      setUnlockedBows((prev) => [...prev, bow.id]);
      setEquippedBowId(bow.id);
    }
  };

  const handleBuyArrows = (type: ArrowType, cost: number, count: number) => {
    if (coins >= cost) {
      setCoins((prev) => prev - cost);
      setArrowInventory((prev) => ({
        ...prev,
        [type]: prev[type] + count,
      }));
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 flex flex-col">
      {/* 1. World Map Screen */}
      {currentView === 'map' && (
        <WorldMap
          score={score}
          coins={coins}
          completedLevels={completedLevels}
          unlockedLevels={unlockedLevels}
          isProjectorMode={isProjectorMode}
          isMuted={isMuted}
          onSelectLevel={handleStartLevel}
          onToggleProjectorMode={handleToggleProjectorMode}
          onToggleMute={handleToggleMute}
          onOpenSpellingGuide={() => setIsGuideOpen(true)}
          onOpenTeacherWords={() => setIsTeacherWordsOpen(true)}
          onOpenArmory={() => setIsArmoryOpen(true)}
          onOpenClassroomRoom={() => setIsRoomModalOpen(true)}
        />
      )}

      {/* 2. Active Action Gameplay Screen */}
      {currentView === 'game' && activeLevel && (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
          {/* Top HUD */}
          <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
            <HUD
              score={score}
              coins={coins}
              currentCombo={currentCombo}
              highestCombo={highestCombo}
              equippedBow={equippedBow}
              activeArrowType={activeArrowType}
              arrowInventory={arrowInventory}
              isProjectorMode={isProjectorMode}
              isMuted={isMuted}
              level={activeLevel}
              onSelectArrowType={setActiveArrowType}
              onToggleProjectorMode={handleToggleProjectorMode}
              onToggleMute={handleToggleMute}
              onPause={() => setCurrentView('map')}
              onOpenSpellingGuide={() => setIsGuideOpen(true)}
              onOpenClassDiscussion={() => {
                setIsPaused(true);
                setIsDiscussionOpen(true);
              }}
              onOpenStudentPicker={() => setIsStudentPickerOpen(true)}
              onOpenArmory={() => setIsArmoryOpen(true)}
            />
          </div>

          {/* Interactive Game Canvas Engine */}
          <div className="flex-1 w-full h-full">
            <GameCanvas
              level={activeLevel}
              equippedBow={equippedBow}
              activeArrowType={activeArrowType}
              arrowInventory={arrowInventory}
              isProjectorMode={isProjectorMode}
              isPaused={isPaused}
              onConsumeArrow={handleConsumeArrow}
              onHitTarget={handleHitTarget}
              onCompleteLevel={handleCompleteLevel}
              onSelectArrowType={setActiveArrowType}
              currentCombo={currentCombo}
              score={score}
            />
          </div>
        </div>
      )}

      {/* Classroom Discussion / Pause Modal */}
      <ClassroomDiscussionModal
        isOpen={isDiscussionOpen}
        item={currentSpellingItem}
        isProjectorMode={isProjectorMode}
        onClose={() => {
          setIsDiscussionOpen(false);
          setIsPaused(false);
        }}
      />

      {/* Student Roulette Picker Modal */}
      <StudentPickerModal
        isOpen={isStudentPickerOpen}
        onClose={() => setIsStudentPickerOpen(false)}
        onSelectStudent={(name) => {
          console.log(`Student ${name} selected for turn!`);
        }}
      />

      {/* Armory Shop Modal */}
      <ArmoryModal
        isOpen={isArmoryOpen}
        coins={coins}
        equippedBowId={equippedBowId}
        unlockedBows={unlockedBows}
        arrowInventory={arrowInventory}
        onClose={() => setIsArmoryOpen(false)}
        onEquipBow={setEquippedBowId}
        onBuyBow={handleBuyBow}
        onBuyArrows={handleBuyArrows}
      />

      {/* Spelling Dictionary & Handbook Modal */}
      <SpellingGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Teacher Custom Words Manager Modal */}
      <TeacherCustomWordsModal
        isOpen={isTeacherWordsOpen}
        onClose={() => setIsTeacherWordsOpen(false)}
        onRefreshData={() => {
          // Trigger component refresh
          setActiveLevel((prev) => (prev ? { ...prev } : null));
        }}
      />

      {/* Classroom Room Session Modal */}
      <ClassroomRoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
      />

      {/* Level Victory Modal */}
      {activeLevel && (
        <LevelVictoryModal
          isOpen={isVictoryModalOpen}
          starsEarned={victoryStars}
          level={activeLevel}
          scoreGained={victoryScoreGained}
          highestCombo={highestCombo}
          onNextLevel={handleNextLevel}
          onReplay={handleReplayLevel}
          onBackToMap={() => {
            setIsVictoryModalOpen(false);
            setCurrentView('map');
          }}
        />
      )}
    </div>
  );
}

export default App;
