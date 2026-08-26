import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  MissionConfig, MissionResult, AnswerRecord, LevelResult, SpellingItem,
  ArrowType, ArcherBow, LevelConfig,
} from '../types/game';
import { buildMissionChunks, modeSummary } from '../services/Mission';
import { spellingContentAdapter } from '../services/SpellingContentAdapter';
import { audioService } from '../services/AudioService';
import { ARCHER_BOWS } from '../services/WorldData';
import { emit, toGrade20 } from '../services/Embed';
import { GameCanvas } from './GameCanvas';
import { MissionHud } from './MissionHud';
import { MissionEndModal } from './MissionEndModal';
import { RotateHint } from './RotateHint';
import { fa } from '../engine/world';
import { Play, Clock, Target, Heart } from 'lucide-react';

interface Props {
  config: MissionConfig;
  /** کمانی که پلتفرم برای این دانش‌آموز ذخیره کرده */
  bow?: ArcherBow;
  inventory?: Record<ArrowType, number>;
  onExit?: () => void;
}

type Phase = 'brief' | 'playing' | 'done';

export const MissionRunner: React.FC<Props> = ({ config, bow, inventory, onExit }) => {
  const chunks = useMemo(() => buildMissionChunks(config), [config]);

  const [phase, setPhase] = useState<Phase>('brief');
  const [chunkIdx, setChunkIdx] = useState(0);
  const [runKey, setRunKey] = useState(0);
  const [projector, setProjector] = useState(false);
  const [muted, setMuted] = useState(() => audioService.getIsMuted());
  const [arrowType, setArrowType] = useState<ArrowType>('standard');
  const [combo, setCombo] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(config.durationSec);
  const secondsRef = useRef(config.durationSec);
  useEffect(() => { secondsRef.current = secondsLeft; }, [secondsLeft]);
  const [result, setResult] = useState<MissionResult | null>(null);

  /** آمار زنده — در ref نگه داشته می‌شود تا رندرهای بازی را کند نکند */
  const run = useRef({
    startedAt: 0,
    answers: [] as AnswerRecord[],
    correct: 0,
    wrong: 0,
    score: 0,
    coins: 0,
    livesLeft: config.lives,
    bestStreak: 0,
    streak: 0,
    finished: false,
  });

  const [live, setLive] = useState({ answered: 0, correct: 0, livesLeft: config.lives, score: 0 });

  const equippedBow = bow || ARCHER_BOWS[0];
  const arrows: Record<ArrowType, number> = inventory || {
    standard: Infinity, fire: 0, slow_mo: 0, piercing: 0, multi_shot: 0,
  };

  /* ── واژه‌های همین درس ── */
  useEffect(() => {
    spellingContentAdapter.beginQuiz();
    const n = spellingContentAdapter.setSessionWords(config.words ?? null);
    if (config.words && n === 0) {
      console.warn('[word-hunter] فهرست واژه‌های ارسالی خالی یا نامعتبر بود؛ بانک پیش‌فرض به کار می‌رود.');
    }
    return () => {
      spellingContentAdapter.setSessionWords(null);
      spellingContentAdapter.endQuiz();
    };
  }, [config.words]);

  /* ── پایان مأموریت ── */
  const finish = useCallback((completed: boolean) => {
    const r = run.current;
    if (r.finished) return;
    r.finished = true;

    const answered = r.answers.length;
    const res: MissionResult = {
      sessionId: config.sessionId,
      student: config.student,
      kind: config.kind,
      startedAt: r.startedAt,
      finishedAt: Date.now(),
      durationSec: Math.round((Date.now() - r.startedAt) / 1000),
      questionCount: config.questionCount,
      answered,
      correct: r.correct,
      wrong: r.wrong,
      accuracy: answered > 0 ? r.correct / answered : 0,
      grade20: toGrade20(r.correct, config.questionCount),
      score: r.score,
      coins: r.coins,
      bestStreak: r.bestStreak,
      livesLeft: r.livesLeft,
      completed,
      answers: r.answers,
      missed: r.answers
        .filter((a) => !a.correct)
        .map((a) => {
          const item = spellingContentAdapter.getItemById(a.wordId);
          return {
            wordId: a.wordId,
            word: a.word,
            correctSpelling: item?.correctSpelling ?? a.word,
            rule: item?.ruleExplanation ?? '',
          };
        }),
    };
    setResult(res);
    setPhase('done');
    emit({ type: 'wordhunter:finished', result: res });
  }, [config]);

  /* ── تایمر کل مأموریت ── */
  useEffect(() => {
    if (phase !== 'playing' || config.durationSec <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        const next = s - 1;
        if (next <= 0) { window.clearInterval(id); finish(false); return 0; }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, config.durationSec, finish]);

  /* ── شروع ── */
  const start = () => {
    audioService.unlock();
    run.current.startedAt = Date.now();
    setPhase('playing');
    emit({ type: 'wordhunter:started', sessionId: config.sessionId, startedAt: run.current.startedAt });
  };

  /* ── ثبت هر پاسخ ── */
  const onWordResult = useCallback(
    (item: SpellingItem, correct: boolean, detail: { chosen: string; ms: number; mode: LevelConfig['mode'] }) => {
      const r = run.current;
      // پاسخ‌هایی که بعد از پر شدن سهمیه می‌رسند شمرده نمی‌شوند:
      // بین آخرین پاسخ و بسته شدن مأموریت چند لحظه فاصله هست و
      // دانش‌آموز می‌تواند در همان فاصله یک تیر دیگر بزند
      if (r.finished || r.answers.length >= config.questionCount || r.livesLeft <= 0) return;

      const record: AnswerRecord = {
        index: r.answers.length,
        wordId: item.id,
        word: item.word,
        chosen: detail.chosen,
        correct,
        ms: detail.ms,
        mode: detail.mode,
        category: item.category,
      };
      r.answers.push(record);
      spellingContentAdapter.markAsked(item.id);
      if (correct) {
        r.correct++;
        r.streak++;
        r.bestStreak = Math.max(r.bestStreak, r.streak);
      } else {
        r.wrong++;
        r.streak = 0;
        r.livesLeft = Math.max(0, r.livesLeft - 1);
      }

      setLive({ answered: r.answers.length, correct: r.correct, livesLeft: r.livesLeft, score: r.score });

      emit({
        type: 'wordhunter:progress',
        sessionId: config.sessionId,
        studentId: config.student.id,
        answered: r.answers.length,
        questionCount: config.questionCount,
        correct: r.correct,
        wrong: r.wrong,
        accuracy: r.correct / r.answers.length,
        score: r.score,
        bestStreak: r.bestStreak,
        livesLeft: r.livesLeft,
        secondsLeft: secondsRef.current,
        last: record,
      });

      if (r.answers.length >= config.questionCount) {
        window.setTimeout(() => finish(true), 2400);
      } else if (r.livesLeft <= 0) {
        window.setTimeout(() => finish(false), 2400);
      }
    },
    [config, finish]
  );

  /* ── پایان یک تکه: برو سراغ تکهٔ بعد ── */
  const onChunkFinish = useCallback((_r: LevelResult) => {
    const r = run.current;
    if (r.finished) return;
    if (r.answers.length >= config.questionCount || r.livesLeft <= 0) {
      finish(r.answers.length >= config.questionCount);
      return;
    }
    setChunkIdx((i) => {
      const next = i + 1;
      if (next >= chunks.length) { finish(true); return i; }
      return next;
    });
    setRunKey((k) => k + 1);
  }, [chunks.length, config.questionCount, finish]);

  const onScoreDelta = useCallback((points: number, coins: number) => {
    run.current.score += points;
    run.current.coins += coins;
  }, []);

  /* ── تکهٔ جاری ── */
  const chunk: LevelConfig | undefined = chunks[chunkIdx];
  const currentLevel: LevelConfig | null = chunk
    ? {
        ...chunk,
        // جان‌ها در کل مأموریت مشترک‌اند، نه در هر تکه
        lives: Math.max(1, run.current.livesLeft),
        // تکه هرگز زودتر از پرسش‌های باقی‌مانده تمام نمی‌شود
        rounds: Math.min(chunk.rounds, Math.max(1, config.questionCount - run.current.answers.length)),
      }
    : null;

  /* ═══════════ صفحهٔ آغاز ═══════════ */
  if (phase === 'brief') {
    const modes = Array.from(new Set(chunks.map((c) => c.mode)));
    return (
      <div className="w-full h-full overflow-y-auto bg-slate-950 text-slate-100 flex items-center justify-center p-5">
        <div className="w-full max-w-lg rounded-3xl border-2 border-amber-500/60 bg-slate-900 p-7 shadow-2xl flex flex-col gap-5 animate-[wh-pop_.25s_ease-out]">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/25">
              🏹
            </div>
            <div>
              <div className="text-[11px] font-black text-amber-400">
                {config.kind === 'exam' ? 'آزمون املا' : 'تمرین املا'}
              </div>
              <h1 className="text-xl font-black text-slate-50">{config.title}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{config.student.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <Brief icon={<Target className="w-4 h-4 text-sky-400" />} label="پرسش" value={fa(config.questionCount)} />
            <Brief
              icon={<Clock className="w-4 h-4 text-emerald-400" />}
              label="زمان"
              value={config.durationSec > 0 ? `${fa(Math.round(config.durationSec / 60))} دقیقه` : 'آزاد'}
            />
            <Brief icon={<Heart className="w-4 h-4 text-rose-400" />} label="جان" value={fa(config.lives)} />
          </div>

          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4">
            <div className="text-xs font-black text-slate-300 mb-2">در این مأموریت چه می‌کنی؟</div>
            <ul className="space-y-1.5">
              {modes.map((m) => (
                <li key={m} className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-base">{spellingContentAdapter.getGameModeDisplayName(m).icon}</span>
                  <span>{modeSummary(m)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500 leading-relaxed">
              با موس یا لمس صفحه نشانه بگیر و رها کن تا تیر شلیک شود.
              بعد از هر پاسخ، قاعدهٔ املایی همان واژه را می‌بینی.
              {config.kind === 'exam' && ' نتیجه در پایان برای معلم ثبت می‌شود.'}
            </p>
          </div>

          <button
            onClick={start}
            className="w-full py-4 rounded-2xl bg-gradient-to-l from-amber-400 to-yellow-300 hover:from-amber-300 text-slate-950 font-black shadow-lg shadow-amber-500/25 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" /> شروع
          </button>
        </div>
      </div>
    );
  }

  /* ═══════════ پایان ═══════════ */
  if (phase === 'done' && result) {
    return <MissionEndModal result={result} config={config} onExit={onExit} />;
  }

  /* ═══════════ بازی ═══════════ */
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-950">
      <MissionHud
        config={config}
        answered={live.answered}
        correct={live.correct}
        livesLeft={live.livesLeft}
        secondsLeft={secondsLeft}
        combo={combo}
        score={run.current.score}
        coins={run.current.coins}
        arrowType={arrowType}
        inventory={arrows}
        projector={projector}
        muted={muted}
        showEconomy={config.showEconomy}
        onSelectArrowType={setArrowType}
        onToggleProjector={() => setProjector((p) => !p)}
        onToggleMute={() => setMuted(audioService.toggleMute())}
      />
      <div className="flex-1 w-full min-h-0">
        {currentLevel && (
          <GameCanvas
            key={`${currentLevel.id}_${runKey}_${projector ? 'p' : 'n'}`}
            level={currentLevel}
            equippedBow={equippedBow}
            activeArrowType={arrowType}
            arrowInventory={arrows}
            isProjectorMode={projector}
            isPaused={false}
            currentStudent={null}
            compact
            onConsumeArrow={() => {}}
            onSelectArrowType={setArrowType}
            onComboChange={setCombo}
            onScoreDelta={onScoreDelta}
            onWordResult={onWordResult}
            onCurrentItem={() => {}}
            onFinish={onChunkFinish}
          />
        )}
      </div>
      <RotateHint />
    </div>
  );
};

const Brief: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-slate-950 border border-slate-800">
    {icon}
    <span className="text-[10px] text-slate-500">{label}</span>
    <span className="text-sm font-black text-slate-100">{value}</span>
  </div>
);
