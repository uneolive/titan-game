import { startTransition, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TitanCommand.css';
import teamTitanEmblem from '@/assets/titan-command/team-titan-emblem.png';
import newformaFire from '@/assets/titan-command/newforma-fire.png';
import garbageSprite from '@/assets/titan-command/garbage.png';
import knifeSprite from '@/assets/titan-command/knife.png';
import rocketMikeSprite from '@/assets/titan-command/rocket-mike.png';
import hockeyMaskSprite from '@/assets/titan-command/hockey-mask.png';

const ARENA_WIDTH = 960;
const ARENA_HEIGHT = 640;
const BASE_Y = ARENA_HEIGHT - 34;
const PLAYER_MISSILE_SPEED = 430;
const MOUSE_FIRE_COOLDOWN_MS = 350;
const KEYBOARD_FIRE_COOLDOWN_MS = 220;
const MAX_MOUSE_SHOTS = 3;
const SHOT_BLAST_RADIUS = 68;
const POWER_UP_DURATION_MS = 6500;
const HUD_UPDATE_MS = 90;

type ControlMode = 'mouse' | 'keyboard';
type GamePhase = 'menu' | 'playing' | 'gameOver';
type EnemyType = 'standard' | 'fast' | 'heavy' | 'splitter';
type PowerUpType = 'repair' | 'freeze' | 'rapid';

type BaseState = {
  id: number;
  x: number;
  width: number;
  hp: number;
  maxHp: number;
};

type EnemyProjectile = {
  id: number;
  kind: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  trail: string;
  damage: number;
  points: number;
  targetBaseId: number;
  splitOnDeath: boolean;
};

type PlayerShot = {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  exploded: boolean;
  radius: number;
  maxRadius: number;
  growthRate: number;
};

type PowerUp = {
  id: number;
  type: PowerUpType;
  x: number;
  y: number;
  radius: number;
  vy: number;
  color: string;
  label: string;
};

type ActivePowerUp = {
  type: PowerUpType;
  expiresAt: number;
};

type GameRuntime = {
  score: number;
  level: number;
  bases: BaseState[];
  enemies: EnemyProjectile[];
  shots: PlayerShot[];
  powerUps: PowerUp[];
  activePowerUps: ActivePowerUp[];
  reticleX: number;
  reticleY: number;
  spawnTimerMs: number;
  lastTimestamp: number;
  lastShotAt: number;
  lastHudAt: number;
  enemyId: number;
  shotId: number;
  powerUpId: number;
  loopTimeMs: number;
};

type HudState = {
  score: number;
  level: number;
  bases: BaseState[];
  controlMode: ControlMode;
  keyboardSpeed: number;
  activePowerUps: PowerUpType[];
  availableShots: number;
};

type InputState = {
  keys: Set<string>;
};

type SpriteMap = Record<string, HTMLImageElement>;

const enemyPalette: Record<EnemyType, { color: string; trail: string; points: number }> = {
  standard: { color: '#ff815f', trail: 'rgba(255, 129, 95, 0.26)', points: 100 },
  fast: { color: '#ffd362', trail: 'rgba(255, 211, 98, 0.26)', points: 140 },
  heavy: { color: '#7ae1ff', trail: 'rgba(122, 225, 255, 0.28)', points: 180 },
  splitter: { color: '#c69bff', trail: 'rgba(198, 155, 255, 0.28)', points: 160 },
};

const powerUpMeta: Record<PowerUpType, { color: string; label: string }> = {
  repair: { color: '#86ffb6', label: 'Repair' },
  freeze: { color: '#83d6ff', label: 'Freeze' },
  rapid: { color: '#ffd062', label: 'Rapid' },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function distance(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

function findClosestAliveBase(bases: BaseState[], x: number) {
  const aliveBases = bases.filter((base) => base.hp > 0);
  if (aliveBases.length === 0) {
    return bases[0];
  }

  return aliveBases.reduce((closest, candidate) => {
    return Math.abs(candidate.x - x) < Math.abs(closest.x - x) ? candidate : closest;
  }, aliveBases[0]);
}

function createInitialBases(): BaseState[] {
  return [
    { id: 1, x: 172, width: 112, hp: 1, maxHp: 1 },
    { id: 2, x: 480, width: 132, hp: 1, maxHp: 1 },
    { id: 3, x: 788, width: 112, hp: 1, maxHp: 1 },
  ];
}

function createRuntime(): GameRuntime {
  return {
    score: 0,
    level: 1,
    bases: createInitialBases(),
    enemies: [],
    shots: [],
    powerUps: [],
    activePowerUps: [],
    reticleX: ARENA_WIDTH / 2,
    reticleY: ARENA_HEIGHT / 2,
    spawnTimerMs: 900,
    lastTimestamp: 0,
    lastShotAt: -9999,
    lastHudAt: 0,
    enemyId: 0,
    shotId: 0,
    powerUpId: 0,
    loopTimeMs: 0,
  };
}

function getAvailableShots(runtime: GameRuntime, controlMode: ControlMode) {
  if (controlMode !== 'mouse') {
    return 99;
  }

  return Math.max(0, MAX_MOUSE_SHOTS - runtime.shots.length);
}

function getLevelFromScore(score: number) {
  return Math.floor(score / 850) + 1;
}

function isPowerUpActive(runtime: GameRuntime, type: PowerUpType, now: number) {
  return runtime.activePowerUps.some((power) => power.type === type && power.expiresAt > now);
}

function TitanHud({
  hud,
  emblemUrl,
  onQuitToMenu,
  onExitApp,
}: {
  hud: HudState;
  emblemUrl: string;
  onQuitToMenu: () => void;
  onExitApp: () => void;
}) {
  return (
    <>
      <div className="titan-command__header">
        <div className="titan-command__title-block">
          <div className="titan-command__brand">
            <img src={emblemUrl} alt="Team Titan insignia" />
            <h1>Titan Command</h1>
          </div>
          <p>
            Defend the orbital shield grid. Intercept incoming warheads before they reach the
            colonies below.
          </p>
        </div>
        <div className="titan-command__header-actions">
          <button className="titan-command__button" type="button" onClick={onQuitToMenu}>
            Quit to Menu
          </button>
          <button className="titan-command__button" type="button" onClick={onExitApp}>
            Exit to App
          </button>
        </div>
      </div>

      <div className="titan-command__hud">
        <div className="titan-command__panel">
          <span className="titan-command__stat-label">Score</span>
          <div className="titan-command__stat-value">{hud.score.toLocaleString()}</div>
          <p className="titan-command__stat-subtle">Level rises every 850 points.</p>
        </div>
        <div className="titan-command__panel">
          <span className="titan-command__stat-label">Threat Level</span>
          <div className="titan-command__stat-value">{hud.level}</div>
          <p className="titan-command__stat-subtle">
            {hud.controlMode === 'mouse'
              ? `${hud.availableShots} missile slots available`
              : `Reticle speed ${hud.keyboardSpeed}`}
          </p>
        </div>
        <div className="titan-command__panel">
          <span className="titan-command__stat-label">Base Status</span>
          <div className="titan-command__bases">
            {hud.bases.map((base) => (
              <span
                key={base.id}
                className={`titan-command__base-pill ${
                  base.hp > 0 ? '' : 'titan-command__base-pill--down'
                }`}
              >
                Base {base.id}: {base.hp > 0 ? 'Online' : 'Destroyed'}
              </span>
            ))}
          </div>
        </div>
        <div className="titan-command__panel">
          <span className="titan-command__stat-label">Power Grid</span>
          <div className="titan-command__stat-value">
            {hud.activePowerUps.length > 0 ? hud.activePowerUps.length : 0}
          </div>
          <p className="titan-command__stat-subtle">
            {hud.activePowerUps.length > 0 ? hud.activePowerUps.join(', ') : 'No active boosts'}
          </p>
        </div>
      </div>
    </>
  );
}

export function TitanCommand() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const runtimeRef = useRef<GameRuntime>(createRuntime());
  const inputRef = useRef<InputState>({ keys: new Set<string>() });
  const audioContextRef = useRef<AudioContext | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const spritesRef = useRef<SpriteMap>({});
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [controlMode, setControlMode] = useState<ControlMode>('mouse');
  const [keyboardSpeed, setKeyboardSpeed] = useState(300);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameOverSummary, setGameOverSummary] = useState<{ score: number; level: number } | null>(
    null
  );
  const [hud, setHud] = useState<HudState>({
    score: 0,
    level: 1,
    bases: createInitialBases(),
    controlMode: 'mouse',
    keyboardSpeed: 300,
    activePowerUps: [],
    availableShots: MAX_MOUSE_SHOTS,
  });

  function ensureAudioContext() {
    if (!soundEnabled || typeof window === 'undefined') {
      return null;
    }

    const AudioCtor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) {
      return null;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtor();
    }

    if (audioContextRef.current.state === 'suspended') {
      void audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }

  function playTone(frequency: number, durationMs: number, type: OscillatorType, gainValue: number) {
    const context = ensureAudioContext();
    if (!context) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(gainValue, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + durationMs / 1000);
  }

  function pushHudUpdate(runtime: GameRuntime) {
    startTransition(() => {
      setHud({
        score: runtime.score,
        level: runtime.level,
        bases: runtime.bases.map((base) => ({ ...base })),
        controlMode,
        keyboardSpeed,
        activePowerUps: runtime.activePowerUps
          .filter((power) => power.expiresAt > runtime.loopTimeMs)
          .map((power) => power.type),
        availableShots: getAvailableShots(runtime, controlMode),
      });
    });
  }

  function spawnEnemy(runtime: GameRuntime) {
    const roll = Math.random();
    let kind: EnemyType = 'standard';
    if (runtime.level >= 2 && roll > 0.7) {
      kind = 'fast';
    }
    if (runtime.level >= 3 && roll > 0.84) {
      kind = 'splitter';
    }
    if (runtime.level >= 4 && roll > 0.92) {
      kind = 'heavy';
    }

    const spawnX = 36 + Math.random() * (ARENA_WIDTH - 72);
    const targetBase = findClosestAliveBase(runtime.bases, spawnX);
    const targetY = BASE_Y - 24;
    const dx = targetBase.x - spawnX;
    const dy = targetY;
    const length = Math.hypot(dx, dy);
    const speedMultiplier =
      kind === 'fast' ? 1.45 : kind === 'heavy' ? 0.8 : kind === 'splitter' ? 1.05 : 1;
    const baseSpeed = 64 + runtime.level * 11;
    const speed = baseSpeed * speedMultiplier;
    const palette = enemyPalette[kind];

    runtime.enemyId += 1;
    runtime.enemies.push({
      id: runtime.enemyId,
      kind,
      x: spawnX,
      y: -20,
      vx: (dx / length) * speed,
      vy: (dy / length) * speed,
      radius: kind === 'heavy' ? 11 : kind === 'fast' ? 6 : 8,
      color: palette.color,
      trail: palette.trail,
      damage: 1,
      points: palette.points + runtime.level * 5,
      targetBaseId: targetBase.id,
      splitOnDeath: kind === 'splitter',
    });
  }

  function destroyEnemy(runtime: GameRuntime, enemy: EnemyProjectile, now: number, spawnChildren: boolean) {
    runtime.score += enemy.points;

    if (enemy.splitOnDeath && spawnChildren && enemy.y < ARENA_HEIGHT - 140) {
      for (const direction of [-1, 1] as const) {
        runtime.enemyId += 1;
        runtime.enemies.push({
          id: runtime.enemyId,
          kind: 'fast',
          x: enemy.x,
          y: enemy.y,
          vx: 68 * direction,
          vy: 108 + runtime.level * 9,
          radius: 5,
          color: enemyPalette.fast.color,
          trail: enemyPalette.fast.trail,
          damage: 1,
          points: 80,
          targetBaseId: enemy.targetBaseId,
          splitOnDeath: false,
        });
      }
    }

    if (Math.random() < 0.1) {
      const type: PowerUpType =
        Math.random() > 0.66 ? 'repair' : Math.random() > 0.45 ? 'rapid' : 'freeze';
      const meta = powerUpMeta[type];
      runtime.powerUpId += 1;
      runtime.powerUps.push({
        id: runtime.powerUpId,
        type,
        x: enemy.x,
        y: enemy.y,
        radius: 14,
        vy: 48,
        color: meta.color,
        label: meta.label,
      });
    }

    playTone(enemy.kind === 'heavy' ? 160 : 220, 180, 'triangle', 0.04);

    runtime.level = getLevelFromScore(runtime.score);
    runtime.activePowerUps = runtime.activePowerUps.filter((power) => power.expiresAt > now);
  }

  function activatePowerUp(runtime: GameRuntime, powerUp: PowerUp, now: number) {
    runtime.activePowerUps = runtime.activePowerUps.filter((power) => power.expiresAt > now);

    if (powerUp.type === 'repair') {
      const destroyedBase = runtime.bases.find((base) => base.hp === 0);
      if (destroyedBase) {
        destroyedBase.hp = 1;
      }
    } else {
      runtime.activePowerUps.push({ type: powerUp.type, expiresAt: now + POWER_UP_DURATION_MS });
    }

    playTone(powerUp.type === 'repair' ? 610 : 450, 220, 'sine', 0.045);
  }

  function fireShot(runtime: GameRuntime, targetX: number, targetY: number, now: number) {
    const cooldownMs =
      controlMode === 'mouse'
        ? isPowerUpActive(runtime, 'rapid', now)
          ? 170
          : MOUSE_FIRE_COOLDOWN_MS
        : KEYBOARD_FIRE_COOLDOWN_MS;

    if (now - runtime.lastShotAt < cooldownMs) {
      return;
    }

    if (controlMode === 'mouse' && runtime.shots.length >= MAX_MOUSE_SHOTS) {
      return;
    }

    const launchBase = findClosestAliveBase(runtime.bases, targetX);
    const originX = launchBase.x;
    const originY = BASE_Y - 12;
    const dx = targetX - originX;
    const dy = targetY - originY;
    const length = Math.max(1, Math.hypot(dx, dy));

    runtime.shotId += 1;
    runtime.shots.push({
      id: runtime.shotId,
      x: originX,
      y: originY,
      targetX,
      targetY,
      vx: (dx / length) * PLAYER_MISSILE_SPEED,
      vy: (dy / length) * PLAYER_MISSILE_SPEED,
      exploded: false,
      radius: 0,
      maxRadius: SHOT_BLAST_RADIUS,
      growthRate: 180,
    });
    runtime.lastShotAt = now;
    playTone(550, 110, 'square', 0.035);
  }

  function startGame() {
    const runtime = createRuntime();
    runtime.reticleX = ARENA_WIDTH / 2;
    runtime.reticleY = ARENA_HEIGHT / 2;
    runtime.lastShotAt = -9999;
    runtimeRef.current = runtime;
    pushHudUpdate(runtime);
    setGameOverSummary(null);
    setPhase('playing');
    if (soundEnabled) {
      void musicRef.current?.play().catch(() => undefined);
    }
  }

  function quitToMenu() {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setPhase('menu');
    setGameOverSummary(null);
    runtimeRef.current = createRuntime();
    pushHudUpdate(runtimeRef.current);
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }
  }

  function exitToApp() {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }
    navigate('/');
  }

  useEffect(() => {
    pushHudUpdate(runtimeRef.current);
  }, [controlMode, keyboardSpeed]);

  useEffect(() => {
    const sources: Record<string, string> = {
      fire: newformaFire,
      standard: garbageSprite,
      fast: knifeSprite,
      heavy: rocketMikeSprite,
      splitter: hockeyMaskSprite,
      emblem: teamTitanEmblem,
    };

    Object.entries(sources).forEach(([key, src]) => {
      const image = new Image();
      image.src = src;
      spritesRef.current[key] = image;
    });
  }, []);

  useEffect(() => {
    const music = musicRef.current;
    if (!music) {
      return;
    }

    music.volume = 0.28;

    if (soundEnabled && phase === 'playing') {
      void music.play().catch(() => undefined);
      return;
    }

    music.pause();
  }, [phase, soundEnabled]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (phase !== 'playing') {
        return;
      }

      const key = event.key.toLowerCase();
      if (
        key === 'arrowup' ||
        key === 'arrowdown' ||
        key === 'arrowleft' ||
        key === 'arrowright' ||
        key === 'w' ||
        key === 'a' ||
        key === 's' ||
        key === 'd' ||
        key === ' ' ||
        key === 'enter'
      ) {
        event.preventDefault();
      }

      inputRef.current.keys.add(key);

      if ((key === ' ' || key === 'enter') && controlMode === 'keyboard') {
        const runtime = runtimeRef.current;
        fireShot(runtime, runtime.reticleX, runtime.reticleY, runtime.loopTimeMs);
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      inputRef.current.keys.delete(event.key.toLowerCase());
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [controlMode, phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    function render(runtime: GameRuntime) {
      const ctx = context as CanvasRenderingContext2D;
      const sprites = spritesRef.current;

      ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

      const skyGradient = ctx.createLinearGradient(0, 0, 0, ARENA_HEIGHT);
      skyGradient.addColorStop(0, '#03101a');
      skyGradient.addColorStop(0.58, '#0a2234');
      skyGradient.addColorStop(1, '#08121a');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

      for (let index = 0; index < 60; index += 1) {
        const starX = ((index * 97) % ARENA_WIDTH) + ((runtime.loopTimeMs * 0.004) % 12);
        const starY = (index * 43) % (ARENA_HEIGHT - 120);
        const size = index % 6 === 0 ? 2 : 1;
        ctx.fillStyle = index % 8 === 0 ? 'rgba(255,245,190,0.9)' : 'rgba(186,213,255,0.8)';
        ctx.fillRect(starX % ARENA_WIDTH, starY, size, size);
      }

      ctx.fillStyle = '#0e2334';
      ctx.beginPath();
      ctx.moveTo(0, ARENA_HEIGHT);
      ctx.lineTo(0, ARENA_HEIGHT - 110);
      ctx.lineTo(130, ARENA_HEIGHT - 150);
      ctx.lineTo(270, ARENA_HEIGHT - 122);
      ctx.lineTo(380, ARENA_HEIGHT - 170);
      ctx.lineTo(530, ARENA_HEIGHT - 126);
      ctx.lineTo(700, ARENA_HEIGHT - 165);
      ctx.lineTo(860, ARENA_HEIGHT - 126);
      ctx.lineTo(ARENA_WIDTH, ARENA_HEIGHT - 145);
      ctx.lineTo(ARENA_WIDTH, ARENA_HEIGHT);
      ctx.closePath();
      ctx.fill();

      runtime.bases.forEach((base) => {
        ctx.save();
        ctx.translate(base.x, BASE_Y);
        ctx.fillStyle = base.hp > 0 ? '#7de5ff' : '#5a6279';
        ctx.strokeStyle = base.hp > 0 ? '#d8f8ff' : '#747d97';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-base.width / 2, -20, base.width, 20, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = base.hp > 0 ? 'rgba(125, 229, 255, 0.2)' : 'rgba(98, 108, 129, 0.16)';
        ctx.beginPath();
        ctx.arc(0, -24, base.width * 0.34, Math.PI, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = base.hp > 0 ? '#eefcff' : '#ced4e6';
        ctx.font = '600 14px ui-sans-serif, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`B${base.id}`, 0, -6);
        ctx.restore();
      });

      runtime.powerUps.forEach((powerUp) => {
        ctx.beginPath();
        ctx.fillStyle = powerUp.color;
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 2;
        ctx.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#02111b';
        ctx.font = '700 10px ui-sans-serif, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(powerUp.label[0], powerUp.x, powerUp.y + 3);
      });

      runtime.enemies.forEach((enemy) => {
        ctx.strokeStyle = enemy.trail;
        ctx.lineWidth = enemy.kind === 'heavy' ? 4 : 3;
        ctx.beginPath();
        ctx.moveTo(enemy.x - enemy.vx * 0.13, enemy.y - enemy.vy * 0.13);
        ctx.lineTo(enemy.x + enemy.vx * 0.08, enemy.y + enemy.vy * 0.08);
        ctx.stroke();

        const sprite = sprites[enemy.kind];
        if (sprite?.complete) {
          const size = enemy.kind === 'heavy' ? 42 : enemy.kind === 'fast' ? 28 : 34;
          ctx.save();
          ctx.translate(enemy.x, enemy.y);
          ctx.rotate(Math.atan2(enemy.vy, enemy.vx) + Math.PI / 2);
          ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.fillStyle = enemy.color;
          ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      runtime.shots.forEach((shot) => {
        if (!shot.exploded) {
          ctx.strokeStyle = 'rgba(164, 232, 255, 0.8)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(shot.x, shot.y);
          ctx.lineTo(shot.x - shot.vx * 0.06, shot.y - shot.vy * 0.06);
          ctx.stroke();
          ctx.beginPath();
          ctx.fillStyle = '#ffffff';
          ctx.arc(shot.x, shot.y, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const alpha = Math.max(0.08, 1 - shot.radius / shot.maxRadius);
          const fireSprite = sprites.fire;
          if (fireSprite?.complete) {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.drawImage(
              fireSprite,
              shot.x - shot.radius,
              shot.y - shot.radius,
              shot.radius * 2,
              shot.radius * 2
            );
            ctx.restore();
          } else {
            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 215, 125, ${alpha * 0.35})`;
            ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 244, 214, ${alpha})`;
          ctx.lineWidth = 3;
          ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      const emblem = sprites.emblem;
      if (emblem?.complete) {
        ctx.save();
        ctx.globalAlpha = 0.08;
        ctx.drawImage(emblem, ARENA_WIDTH - 190, 26, 150, 150);
        ctx.restore();
      }

      ctx.save();
      ctx.strokeStyle = controlMode === 'mouse' ? '#ffd062' : '#86ffb6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(runtime.reticleX, runtime.reticleY, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(runtime.reticleX - 26, runtime.reticleY);
      ctx.lineTo(runtime.reticleX + 26, runtime.reticleY);
      ctx.moveTo(runtime.reticleX, runtime.reticleY - 26);
      ctx.lineTo(runtime.reticleX, runtime.reticleY + 26);
      ctx.stroke();
      ctx.restore();

      if (phase !== 'playing') {
        ctx.fillStyle = 'rgba(6, 15, 24, 0.34)';
        ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
      }
    }

    function loop(timestamp: number) {
      const runtime = runtimeRef.current;
      if (runtime.lastTimestamp === 0) {
        runtime.lastTimestamp = timestamp;
        runtime.lastHudAt = timestamp;
      }

      const deltaMs = Math.min(33, timestamp - runtime.lastTimestamp);
      const deltaSeconds = deltaMs / 1000;
      runtime.lastTimestamp = timestamp;
      runtime.loopTimeMs = timestamp;

      if (phase === 'playing') {
        runtime.activePowerUps = runtime.activePowerUps.filter((power) => power.expiresAt > timestamp);

        if (controlMode === 'keyboard') {
          const moveX =
            (inputRef.current.keys.has('arrowright') || inputRef.current.keys.has('d') ? 1 : 0) -
            (inputRef.current.keys.has('arrowleft') || inputRef.current.keys.has('a') ? 1 : 0);
          const moveY =
            (inputRef.current.keys.has('arrowdown') || inputRef.current.keys.has('s') ? 1 : 0) -
            (inputRef.current.keys.has('arrowup') || inputRef.current.keys.has('w') ? 1 : 0);

          runtime.reticleX = clamp(runtime.reticleX + moveX * keyboardSpeed * deltaSeconds, 24, ARENA_WIDTH - 24);
          runtime.reticleY = clamp(runtime.reticleY + moveY * keyboardSpeed * deltaSeconds, 36, ARENA_HEIGHT - 120);
        }

        const frozen = isPowerUpActive(runtime, 'freeze', timestamp);
        const enemySpeedFactor = frozen ? 0.42 : 1;
        const spawnRateFactor = frozen ? 0.78 : 1;

        runtime.spawnTimerMs -= deltaMs;
        if (runtime.spawnTimerMs <= 0) {
          spawnEnemy(runtime);
          const baseInterval = Math.max(210, 920 - runtime.level * 65);
          runtime.spawnTimerMs = baseInterval * spawnRateFactor * (0.75 + Math.random() * 0.55);
        }

        runtime.enemies.forEach((enemy) => {
          enemy.x += enemy.vx * deltaSeconds * enemySpeedFactor;
          enemy.y += enemy.vy * deltaSeconds * enemySpeedFactor;
        });

        runtime.powerUps.forEach((powerUp) => {
          powerUp.y += powerUp.vy * deltaSeconds;
        });

        runtime.shots.forEach((shot) => {
          if (!shot.exploded) {
            shot.x += shot.vx * deltaSeconds;
            shot.y += shot.vy * deltaSeconds;
            if (distance(shot.x, shot.y, shot.targetX, shot.targetY) < 10 || shot.y <= shot.targetY) {
              shot.exploded = true;
              shot.x = shot.targetX;
              shot.y = shot.targetY;
              shot.radius = 10;
              playTone(190, 260, 'sawtooth', 0.03);
            }
          } else {
            shot.radius += shot.growthRate * deltaSeconds;
          }
        });

        const survivingEnemies: EnemyProjectile[] = [];
        runtime.enemies.forEach((enemy) => {
          const hitByExplosion = runtime.shots.some(
            (shot) => shot.exploded && distance(enemy.x, enemy.y, shot.x, shot.y) <= shot.radius + enemy.radius
          );

          if (hitByExplosion) {
            destroyEnemy(runtime, enemy, timestamp, true);
            return;
          }

          const baseHit = runtime.bases.find(
            (base) =>
              base.id === enemy.targetBaseId &&
              base.hp > 0 &&
              enemy.y >= BASE_Y - 10 &&
              Math.abs(enemy.x - base.x) < base.width / 2
          );

          if (baseHit) {
            baseHit.hp = Math.max(0, baseHit.hp - enemy.damage);
            playTone(110, 260, 'square', 0.05);
            return;
          }

          if (enemy.y < ARENA_HEIGHT + 60) {
            survivingEnemies.push(enemy);
          }
        });
        runtime.enemies = survivingEnemies;

        const survivingPowerUps: PowerUp[] = [];
        runtime.powerUps.forEach((powerUp) => {
          const detonated = runtime.shots.some(
            (shot) => shot.exploded && distance(powerUp.x, powerUp.y, shot.x, shot.y) <= shot.radius + powerUp.radius
          );

          if (detonated) {
            activatePowerUp(runtime, powerUp, timestamp);
            return;
          }

          if (powerUp.y < ARENA_HEIGHT - 50) {
            survivingPowerUps.push(powerUp);
          }
        });
        runtime.powerUps = survivingPowerUps;

        runtime.shots = runtime.shots.filter((shot) => !shot.exploded || shot.radius < shot.maxRadius);

        if (runtime.bases.every((base) => base.hp === 0)) {
          setGameOverSummary({ score: runtime.score, level: runtime.level });
          setPhase('gameOver');
        }

        if (timestamp - runtime.lastHudAt >= HUD_UPDATE_MS) {
          runtime.lastHudAt = timestamp;
          pushHudUpdate(runtime);
        }
      }

      render(runtime);
      animationFrameRef.current = requestAnimationFrame(loop);
    }

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [controlMode, keyboardSpeed, phase]);

  function updateMouseReticle(event: React.MouseEvent<HTMLCanvasElement>) {
    if (controlMode !== 'mouse') {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = ARENA_WIDTH / rect.width;
    const scaleY = ARENA_HEIGHT / rect.height;
    runtimeRef.current.reticleX = clamp((event.clientX - rect.left) * scaleX, 24, ARENA_WIDTH - 24);
    runtimeRef.current.reticleY = clamp((event.clientY - rect.top) * scaleY, 36, ARENA_HEIGHT - 120);
  }

  function handleCanvasClick(event: React.MouseEvent<HTMLCanvasElement>) {
    if (phase !== 'playing' || controlMode !== 'mouse') {
      return;
    }

    updateMouseReticle(event);
    const runtime = runtimeRef.current;
    fireShot(runtime, runtime.reticleX, runtime.reticleY, runtime.loopTimeMs);
    pushHudUpdate(runtime);
  }

  return (
    <div className="titan-command">
      <div className="titan-command__shell">
        <TitanHud
          hud={hud}
          emblemUrl={teamTitanEmblem}
          onQuitToMenu={quitToMenu}
          onExitApp={exitToApp}
        />

        <div className="titan-command__arena-frame">
          <canvas
            ref={canvasRef}
            className="titan-command__canvas"
            width={ARENA_WIDTH}
            height={ARENA_HEIGHT}
            onMouseMove={updateMouseReticle}
            onClick={handleCanvasClick}
          />

          {phase !== 'playing' && (
            <div className="titan-command__overlay">
              <div className="titan-command__dialog">
                <div className="titan-command__dialog-brand">
                  <img src={teamTitanEmblem} alt="Team Titan insignia" />
                  <h2>{phase === 'menu' ? 'Initialize defense grid' : 'Titan base destroyed'}</h2>
                </div>
                <p>
                  {phase === 'menu'
                    ? 'Pick your control scheme, arm the launchers, and hold the line against incoming bombardment.'
                    : `Final score ${gameOverSummary?.score ?? 0}. Threat level ${gameOverSummary?.level ?? 1}.`}
                </p>

                <div className="titan-command__controls">
                  <div className="titan-command__control-card">
                    <h3>Reticle Control</h3>
                    <div className="titan-command__choice-row">
                      <button
                        type="button"
                        className={`titan-command__choice ${
                          controlMode === 'mouse' ? 'titan-command__choice--active' : ''
                        }`}
                        onClick={() => setControlMode('mouse')}
                      >
                        Mouse aim
                      </button>
                      <button
                        type="button"
                        className={`titan-command__choice ${
                          controlMode === 'keyboard' ? 'titan-command__choice--active' : ''
                        }`}
                        onClick={() => setControlMode('keyboard')}
                      >
                        Keyboard aim
                      </button>
                    </div>
                    <p>
                      Mouse mode limits active missiles. Keyboard mode uses WASD or arrows plus
                      space/enter to fire.
                    </p>
                  </div>

                  <div className="titan-command__control-card">
                    <h3>Keyboard Reticle Speed</h3>
                    <input
                      className="titan-command__slider"
                      type="range"
                      min="180"
                      max="520"
                      step="20"
                      value={keyboardSpeed}
                      onChange={(event) => setKeyboardSpeed(Number(event.target.value))}
                    />
                    <p>{keyboardSpeed} px/s. Applies when keyboard aim is enabled.</p>
                  </div>

                  <div className="titan-command__control-card">
                    <h3>Mission Notes</h3>
                    <p>
                      Destroy missiles inside your blast radius, trigger power cores for repair,
                      freeze, and rapid fire, and survive long enough to escalate the score.
                    </p>
                    <div className="titan-command__choice-row">
                      <button
                        type="button"
                        className={`titan-command__choice ${
                          soundEnabled ? 'titan-command__choice--active' : ''
                        }`}
                        onClick={() => setSoundEnabled((current) => !current)}
                      >
                        {soundEnabled ? 'SFX On' : 'SFX Off'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="titan-command__footer">
                  <span className="titan-command__tipline">
                    {phase === 'menu'
                      ? 'Click to fire in mouse mode. In keyboard mode, move then press space or enter.'
                      : 'Replay instantly or return to the app without killing the process.'}
                  </span>
                  <div className="titan-command__choice-row">
                    <button className="titan-command__button" type="button" onClick={exitToApp}>
                      Quit Game
                    </button>
                    <button
                      className="titan-command__button titan-command__button--primary"
                      type="button"
                      onClick={startGame}
                    >
                      {phase === 'menu' ? 'Start Game' : 'Replay'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <audio ref={musicRef} loop preload="auto" src="/audio/showdown-theme.wav" />
    </div>
  );
}
