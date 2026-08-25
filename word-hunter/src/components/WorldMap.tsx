import React, { useState } from 'react';
import { Realm, LevelConfig } from '../types/game';
import { GAME_REALMS } from '../services/WorldData';
import { spellingContentAdapter } from '../services/SpellingContentAdapter';
import {
  Sparkles,
  Star,
  Lock,
  Play,
  Tv,
  HelpCircle,
  ShoppingBag,
  BookOpen,
  Volume2,
  VolumeX,
  Users,
} from 'lucide-react';

interface WorldMapProps {
  score: number;
  coins: number;
  completedLevels: Record<string, number>;
  unlockedLevels: string[];
  isProjectorMode: boolean;
  isMuted: boolean;
  onSelectLevel: (level: LevelConfig) => void;
  onToggleProjectorMode: () => void;
  onToggleMute: () => void;
  onOpenSpellingGuide: () => void;
  onOpenTeacherWords: () => void;
  onOpenArmory: () => void;
  onOpenClassroomRoom: () => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  score,
  coins,
  completedLevels,
  unlockedLevels,
  isProjectorMode,
  isMuted,
  onSelectLevel,
  onToggleProjectorMode,
  onToggleMute,
  onOpenSpellingGuide,
  onOpenTeacherWords,
  onOpenArmory,
  onOpenClassroomRoom,
}) => {
  const [selectedRealmId, setSelectedRealmId] = useState<string>('realm_1');
  const activeRealm: Realm = GAME_REALMS.find((r) => r.id === selectedRealmId) || GAME_REALMS[0];

  // Calculate total stars earned
  const totalStars = Object.values(completedLevels).reduce((acc, stars) => acc + stars, 0);

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none overflow-x-hidden">
      {/* Dynamic Realm Ambient Background */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none transition-all duration-700 bg-cover bg-center"
        style={{
          background:
            selectedRealmId === 'realm_1'
              ? 'radial-gradient(circle at 50% 30%, #064e3b 0%, #022c22 70%, #020617 100%)'
              : selectedRealmId === 'realm_2'
              ? 'radial-gradient(circle at 50% 30%, #581c87 0%, #3b0764 70%, #020617 100%)'
              : selectedRealmId === 'realm_3'
              ? 'radial-gradient(circle at 50% 30%, #0369a1 0%, #082f49 70%, #020617 100%)'
              : selectedRealmId === 'realm_4'
              ? 'radial-gradient(circle at 50% 30%, #9a3412 0%, #431407 70%, #020617 100%)'
              : 'radial-gradient(circle at 50% 30%, #854d0e 0%, #422006 70%, #020617 100%)',
        }}
      />

      {/* Top Navigation Bar */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-4 p-4 lg:px-8 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
        {/* Logo & Game Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
            🏹
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-black bg-gradient-to-r from-amber-300 via-amber-100 to-yellow-400 bg-clip-text text-transparent">
              شکارچی کلمات
            </h1>
            <p className="text-xs text-slate-400">بازی ماجراجویی و اکشن املای فارسی</p>
          </div>
        </div>

        {/* Hunter Stats & Gold */}
        <div className="flex items-center gap-3">
          {/* Total Stars */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-yellow-500/40 shadow-inner">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-black text-yellow-300">{totalStars} ستاره</span>
          </div>

          {/* Gold Coins */}
          <button
            onClick={onOpenArmory}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-amber-500/40 shadow-inner transition active:scale-95"
            title="فروشگاه تجهیزات"
          >
            <span className="text-sm">🪙</span>
            <span className="text-sm font-black text-amber-300">
              {coins.toLocaleString('fa-IR')}
            </span>
          </button>

          {/* Hunter Score */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400">امتیاز کل:</span>
            <span className="text-sm font-black text-emerald-300">
              {score.toLocaleString('fa-IR')}
            </span>
          </div>
        </div>

        {/* Teacher & Game Action Shortcuts */}
        <div className="flex items-center gap-2">
          {/* Classroom Room Code Session */}
          <button
            onClick={onOpenClassroomRoom}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600/90 hover:bg-teal-500 text-white font-bold text-xs border border-teal-400/50 shadow-md transition active:scale-95"
            title="اتاق تعاملی کلاس درس"
          >
            <Users className="w-4 h-4" />
            <span className="hidden md:inline">اتاق کلاس</span>
          </button>

          {/* Teacher Word List Editor */}
          <button
            onClick={onOpenTeacherWords}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold text-xs border border-indigo-400/50 shadow-md transition active:scale-95"
            title="تعریف و ویرایش کلمات معلّم"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">کلمات معلم</span>
          </button>

          {/* Hunter Armory Store */}
          <button
            onClick={onOpenArmory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-white font-bold text-xs border border-amber-400/50 shadow-md transition active:scale-95"
            title="فروشگاه کمان و تیرها"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden md:inline">تجهیزات</span>
          </button>

          {/* Spelling Handbook */}
          <button
            onClick={onOpenSpellingGuide}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="دانشنامه املای فارسی"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Projector Mode Toggle */}
          <button
            onClick={onToggleProjectorMode}
            className={`p-2.5 rounded-xl border transition ${
              isProjectorMode
                ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold shadow-lg shadow-amber-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="حالت ویدئو پروژکتور کلاس"
          >
            <Tv className="w-5 h-5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title={isMuted ? 'فعال‌سازی صدا' : 'قطع صدا'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Main World Content */}
      <main className="relative z-10 flex-1 flex flex-col p-4 lg:p-8 max-w-7xl mx-auto w-full gap-6">
        {/* Realm Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {GAME_REALMS.map((realm, idx) => {
            const isSelected = realm.id === selectedRealmId;
            return (
              <button
                key={realm.id}
                onClick={() => setSelectedRealmId(realm.id)}
                className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-2xl border transition-all duration-300 active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-r from-slate-800 to-slate-900 border-amber-400 shadow-xl shadow-amber-500/10 scale-105'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-400'
                }`}
              >
                <span className="text-xl">
                  {idx === 0 ? '🌲' : idx === 1 ? '💎' : idx === 2 ? '☁️' : idx === 3 ? '🏰' : '👑'}
                </span>
                <div className="flex flex-col text-right">
                  <span className={`text-sm font-bold ${isSelected ? 'text-amber-300' : 'text-slate-300'}`}>
                    {realm.title}
                  </span>
                  <span className="text-[10px] text-slate-400">{realm.englishTitle}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Realm Banner */}
        <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 border border-slate-700/80 bg-slate-900/70 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
                <span>قلمرو {activeRealm.title}</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-black text-slate-100">
                {activeRealm.subtitle}
              </h2>
              <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                {activeRealm.description}
              </p>
            </div>
          </div>
        </div>

        {/* Level Map Grid Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
          {activeRealm.levels.map((lvl) => {
            const isUnlocked = unlockedLevels.includes(lvl.id) || lvl.isUnlocked;
            const stars = completedLevels[lvl.id] || 0;
            const isBoss = lvl.mode === 'boss_battle';

            return (
              <div
                key={lvl.id}
                className={`relative group rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  isUnlocked
                    ? isBoss
                      ? 'bg-gradient-to-b from-rose-950/60 to-slate-900/90 border-rose-500/60 hover:border-rose-400 hover:shadow-2xl hover:shadow-rose-500/20'
                      : 'bg-slate-900/80 border-slate-700/80 hover:border-amber-400/80 hover:shadow-xl hover:shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800/60 opacity-60'
                }`}
              >
                {/* Level Header */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-slate-800 text-amber-300 border border-slate-700">
                      مرحله {lvl.levelNumber}
                    </span>

                    {/* Game Mode Badge */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/60 px-2.5 py-1 rounded-xl border border-slate-700/50">
                      <span>{spellingContentAdapter.getGameModeDisplayName(lvl.mode).icon}</span>
                      <span className="font-medium">
                        {spellingContentAdapter.getGameModeDisplayName(lvl.mode).fa}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition line-clamp-1">
                    {lvl.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                    {lvl.description}
                  </p>

                  {/* Spelling Category Tag */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                      {spellingContentAdapter.getCategoryDisplayName(lvl.category)}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[11px] bg-slate-800 text-slate-300">
                      {spellingContentAdapter.getGradeDisplayName(lvl.grade)}
                    </span>
                  </div>
                </div>

                {/* Level Footer: Stars & Action Button */}
                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  {/* Stars Earned */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-4 h-4 ${
                          starIdx <= stars
                            ? 'text-yellow-400 fill-yellow-400 animate-pulse'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Play or Locked Button */}
                  {isUnlocked ? (
                    <button
                      onClick={() => onSelectLevel(lvl)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-all duration-200 active:scale-95 ${
                        isBoss
                          ? 'bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isBoss ? 'شروع نبرد نهایی' : 'ورود به میدان'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                      <Lock className="w-3.5 h-3.5" />
                      <span>قفل است</span>
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
