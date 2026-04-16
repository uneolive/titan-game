(function () {
  const ARENA_WIDTH = 960;
  const ARENA_HEIGHT = 640;
  const BASE_Y = ARENA_HEIGHT - 24;
  const PLAYER_MISSILE_SPEED = 430;
  const MOUSE_FIRE_COOLDOWN_MS = 350;
  const KEYBOARD_FIRE_COOLDOWN_MS = 220;
  const MAX_MOUSE_SHOTS = 3;
  const SHOT_BLAST_RADIUS = 68;
  const POWER_UP_DURATION_MS = 6500;
  const HUD_UPDATE_MS = 90;

  const enemyPalette = {
    standard: { color: '#ff815f', trail: 'rgba(255, 129, 95, 0.26)', points: 100 },
    fast: { color: '#ffd362', trail: 'rgba(255, 211, 98, 0.26)', points: 140 },
    heavy: { color: '#7ae1ff', trail: 'rgba(122, 225, 255, 0.28)', points: 180 },
    splitter: { color: '#c69bff', trail: 'rgba(198, 155, 255, 0.28)', points: 160 },
  };

  const powerUpMeta = {
    repair: { color: '#86ffb6', label: 'Repair' },
    freeze: { color: '#83d6ff', label: 'Freeze' },
    rapid: { color: '#ffd062', label: 'Rapid' },
  };

  const targetSpriteKeys = ['nicolas', 'pascale', 'phil', 'kevan', 'eliza', 'newTarget'];

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const scoreValue = document.getElementById('scoreValue');
  const levelValue = document.getElementById('levelValue');
  const controlSupport = document.getElementById('controlSupport');
  const powerValue = document.getElementById('powerValue');
  const powerSupport = document.getElementById('powerSupport');
  const easyButton = document.getElementById('easyButton');
  const normalButton = document.getElementById('normalButton');
  const hardButton = document.getElementById('hardButton');
  const difficultySupport = document.getElementById('difficultySupport');
  const sfxButton = document.getElementById('sfxButton');
  const pauseButton = document.getElementById('pauseButton');
  const mouseModeButton = document.getElementById('mouseModeButton');
  const keyboardModeButton = document.getElementById('keyboardModeButton');
  const musicButton = document.getElementById('musicButton');
  const speedSlider = document.getElementById('speedSlider');
  const speedValue = document.getElementById('speedValue');
  const startButton = document.getElementById('startButton');
  const dialogEyebrow = document.getElementById('dialogEyebrow');
  const dialogTitle = document.getElementById('dialogTitle');
  const dialogDescription = document.getElementById('dialogDescription');
  const dialogTip = document.getElementById('dialogTip');

  const theme = new Audio('./assets/showdown-theme.wav');
  theme.loop = true;
  theme.volume = 0.28;
  const seagullKill = new Audio('./assets/seagull-kill.mp3');
  seagullKill.preload = 'auto';
  seagullKill.volume = 0.9;

  const sprites = {
    fire: createImage('./assets/newforma-fire.png'),
    nicolas: createImage('./assets/nicolas.png'),
    pascale: createImage('./assets/pascale.png'),
    phil: createImage('./assets/phil.png'),
    kevan: createImage('./assets/kevan.png'),
    eliza: createImage('./assets/eliza.png'),
    newTarget: createImage('./assets/new-target.png'),
    emblem: createImage('./assets/team-titan-emblem.png'),
    background: createImage('./assets/space-background.jpg'),
  };

  let audioContext = null;
  let animationFrameId = 0;
  let controlMode = 'mouse';
  let difficulty = 'normal';
  let keyboardSpeed = 300;
  let sfxMuted = false;
  let musicMuted = false;
  let phase = 'menu';
  let gameOverSummary = null;
  const input = new Set();

  let runtime = createRuntime();
  let hud = createHudState(runtime);

  function createImage(src) {
    const image = new Image();
    image.src = src;
    return image;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function distance(ax, ay, bx, by) {
    return Math.hypot(ax - bx, ay - by);
  }

  function createInitialBases() {
    return [
      { id: 1, x: 172, width: 112, hp: 1, maxHp: 1 },
      { id: 2, x: 480, width: 132, hp: 1, maxHp: 1 },
      { id: 3, x: 788, width: 112, hp: 1, maxHp: 1 },
    ];
  }

  function createRuntime() {
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

  function pickTargetSpriteKey() {
    return targetSpriteKeys[Math.floor(Math.random() * targetSpriteKeys.length)];
  }

  function getDifficultyConfig() {
    if (difficulty === 'easy') {
      return {
        speedMultiplier: 0.84,
        spawnMultiplier: 1.22,
        label: 'Slower threats and longer gaps between volleys.',
      };
    }

    if (difficulty === 'hard') {
      return {
        speedMultiplier: 1.22,
        spawnMultiplier: 0.82,
        label: 'Faster threats and more frequent volleys.',
      };
    }

    return {
      speedMultiplier: 1,
      spawnMultiplier: 1,
      label: 'Balanced spawn rate and threat speed.',
    };
  }

  function createHudState(currentRuntime) {
    return {
      score: currentRuntime.score,
      level: currentRuntime.level,
      bases: currentRuntime.bases.map((base) => ({ ...base })),
      activePowerUps: currentRuntime.activePowerUps.map((power) => power.type),
      availableShots: getAvailableShots(currentRuntime),
    };
  }

  function findClosestAliveBase(bases, x) {
    const aliveBases = bases.filter((base) => base.hp > 0);
    const candidates = aliveBases.length > 0 ? aliveBases : bases;
    return candidates.reduce((closest, candidate) => {
      return Math.abs(candidate.x - x) < Math.abs(closest.x - x) ? candidate : closest;
    }, candidates[0]);
  }

  function getAvailableShots(currentRuntime) {
    if (controlMode !== 'mouse') {
      return 99;
    }
    return Math.max(0, MAX_MOUSE_SHOTS - currentRuntime.shots.length);
  }

  function getLevelFromScore(score) {
    return Math.floor(score / 850) + 1;
  }

  function isPowerUpActive(currentRuntime, type, now) {
    return currentRuntime.activePowerUps.some((power) => power.type === type && power.expiresAt > now);
  }

  function ensureAudioContext() {
    if (sfxMuted) {
      return null;
    }
    if (!audioContext) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) {
        return null;
      }
      audioContext = new AudioCtor();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
    return audioContext;
  }

  function playTone(frequency, durationMs, type, gainValue) {
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

  function playSeagullKill() {
    if (sfxMuted) {
      return;
    }

    try {
      seagullKill.currentTime = 0;
      seagullKill.play().catch(() => {});
    } catch (_error) {
      // Ignore audio play failures caused by browser autoplay restrictions.
    }
  }

  function playBaseExplosion() {
    const context = ensureAudioContext();
    if (!context) {
      return;
    }

    const durationSeconds = 1.35;
    const sampleRate = context.sampleRate;
    const frameCount = Math.floor(sampleRate * durationSeconds);
    const buffer = context.createBuffer(1, frameCount, sampleRate);
    const channel = buffer.getChannelData(0);

    for (let index = 0; index < frameCount; index += 1) {
      const progress = index / frameCount;
      const decay = Math.pow(1 - progress, 1.35);
      const rumble = Math.sin(progress * 56 * Math.PI) * 0.34 * (1 - progress * 0.7);
      const crack = Math.sin(progress * 8 * Math.PI) * 0.18 * (1 - progress);
      channel[index] = ((Math.random() * 2 - 1) * 1.08 + rumble + crack) * decay;
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const now = context.currentTime;

    source.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1700, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + durationSeconds);
    gain.gain.setValueAtTime(0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    source.start(now);
    source.stop(now + durationSeconds);

    playTone(62, 760, 'sawtooth', 0.09);
    playTone(36, 1200, 'triangle', 0.075);
    playTone(24, 1450, 'sine', 0.05);
  }

  function syncHud() {
    hud = createHudState(runtime);
    scoreValue.textContent = runtime.score.toLocaleString();
    levelValue.textContent = String(runtime.level);
    controlSupport.textContent =
      controlMode === 'mouse'
        ? `${hud.availableShots} missile slots available`
        : `Reticle speed ${keyboardSpeed}`;
    difficultySupport.textContent = getDifficultyConfig().label;
    const activeTypes = runtime.activePowerUps
      .filter((power) => power.expiresAt > runtime.loopTimeMs)
      .map((power) => power.type);
    powerValue.textContent = String(activeTypes.length);
    powerSupport.textContent = activeTypes.length > 0 ? activeTypes.join(', ') : 'No active boosts';
  }

  function updateOverlay() {
    mouseModeButton.classList.toggle('active', controlMode === 'mouse');
    keyboardModeButton.classList.toggle('active', controlMode === 'keyboard');
    easyButton.classList.toggle('active', difficulty === 'easy');
    normalButton.classList.toggle('active', difficulty === 'normal');
    hardButton.classList.toggle('active', difficulty === 'hard');
    sfxButton.classList.toggle('active', !sfxMuted);
    sfxButton.textContent = sfxMuted ? 'SFX Off' : 'SFX On';
    musicButton.classList.toggle('active', !musicMuted);
    musicButton.textContent = musicMuted ? 'Music Off' : 'Music On';
    speedValue.textContent = String(keyboardSpeed);
    speedSlider.value = String(keyboardSpeed);
    pauseButton.textContent = phase === 'paused' ? 'Resume' : 'Pause';

    if (phase === 'playing') {
      overlay.classList.add('hidden');
      return;
    }

    overlay.classList.remove('hidden');

    if (phase === 'paused') {
      dialogEyebrow.textContent = 'Titan Network';
      dialogTitle.textContent = 'Simulation paused';
      dialogDescription.textContent =
        'Resume when you are ready. Control settings remain available in the top panel.';
      dialogTip.textContent = 'Use Pause again or press Resume to continue the current run.';
      startButton.textContent = 'Resume';
    } else if (phase === 'gameOver') {
      dialogEyebrow.textContent = 'Titan Network';
      dialogTitle.textContent = 'Titan base destroyed';
      dialogDescription.textContent = `Final score ${gameOverSummary.score}. Threat level ${gameOverSummary.level}.`;
      dialogTip.textContent = 'Replay instantly or quit back to the menu.';
      startButton.textContent = 'Replay';
    } else {
      dialogEyebrow.textContent = 'Titan Network';
      dialogTitle.textContent = 'Initialize defense grid';
      dialogDescription.textContent =
        'Pick your control scheme from the top controls, arm the launchers, and hold the line against incoming bombardment.';
      dialogTip.textContent =
        'Click to fire in mouse mode. In keyboard mode, move then press space or enter.';
      startButton.textContent = 'Start Game';
    }
  }

  function syncMusic() {
    if (!musicMuted && phase === 'playing') {
      theme.play().catch(() => {});
    } else {
      theme.pause();
    }
  }

  function returnToMenu() {
    phase = 'menu';
    runtime = createRuntime();
    gameOverSummary = null;
    theme.pause();
    theme.currentTime = 0;
    syncHud();
    updateOverlay();
  }

  function startGame() {
    if (phase === 'paused') {
      phase = 'playing';
      syncMusic();
      updateOverlay();
      return;
    }

    runtime = createRuntime();
    phase = 'playing';
    gameOverSummary = null;
    syncHud();
    updateOverlay();
    theme.currentTime = 0;
    syncMusic();
  }

  function togglePause() {
    if (phase === 'playing') {
      phase = 'paused';
      theme.pause();
      updateOverlay();
      return;
    }

    if (phase === 'paused') {
      phase = 'playing';
      syncMusic();
      updateOverlay();
    }
  }

  function spawnEnemy() {
    const roll = Math.random();
    let kind = 'standard';
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
    const speed = baseSpeed * speedMultiplier * getDifficultyConfig().speedMultiplier;
    const palette = enemyPalette[kind];

    runtime.enemyId += 1;
    runtime.enemies.push({
      id: runtime.enemyId,
      kind,
      spriteKey: pickTargetSpriteKey(),
      state: 'active',
      deathStartedAt: 0,
      deathDurationMs: 220,
      baseRotation: 0,
      deathResolved: false,
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

  function destroyEnemy(enemy, now, spawnChildren) {
    runtime.score += enemy.points;

    if (enemy.splitOnDeath && spawnChildren && enemy.y < ARENA_HEIGHT - 140) {
      [-1, 1].forEach((direction) => {
        runtime.enemyId += 1;
        runtime.enemies.push({
          id: runtime.enemyId,
          kind: 'fast',
          spriteKey: pickTargetSpriteKey(),
          state: 'active',
          deathStartedAt: 0,
          deathDurationMs: 220,
          baseRotation: 0,
          deathResolved: false,
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
      });
    }

    if (Math.random() < 0.1) {
      const type = Math.random() > 0.66 ? 'repair' : Math.random() > 0.45 ? 'rapid' : 'freeze';
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

    playSeagullKill();

    playTone(enemy.kind === 'heavy' ? 160 : 220, 180, 'triangle', 0.04);
    runtime.level = getLevelFromScore(runtime.score);
    runtime.activePowerUps = runtime.activePowerUps.filter((power) => power.expiresAt > now);
  }

  function activatePowerUp(powerUp, now) {
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

  function markEnemyDying(enemy, now) {
    if (!enemy.deathResolved) {
      destroyEnemy(enemy, now, true);
      enemy.deathResolved = true;
    }
    enemy.state = 'dying';
    enemy.deathStartedAt = now;
    enemy.baseRotation = Math.atan2(enemy.vy, enemy.vx) - Math.PI / 2;
  }

  function fireShot(targetX, targetY, now) {
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
      spent: false,
      radius: 0,
      maxRadius: SHOT_BLAST_RADIUS,
      growthRate: 180,
    });
    runtime.lastShotAt = now;
    playTone(550, 110, 'square', 0.035);
  }

  function updateMouseReticle(event) {
    if (controlMode !== 'mouse' || phase !== 'playing') {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const scaleX = ARENA_WIDTH / rect.width;
    const scaleY = ARENA_HEIGHT / rect.height;
    runtime.reticleX = clamp((event.clientX - rect.left) * scaleX, 24, ARENA_WIDTH - 24);
    runtime.reticleY = clamp((event.clientY - rect.top) * scaleY, 36, ARENA_HEIGHT - 120);
  }

  function drawScene() {
    ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

    if (sprites.background.complete) {
      ctx.drawImage(sprites.background, 0, 0, ARENA_WIDTH, ARENA_HEIGHT);
      ctx.fillStyle = 'rgba(2, 8, 18, 0.38)';
      ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
    } else {
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
    }

    ctx.fillStyle = '#111318';
    ctx.beginPath();
    ctx.moveTo(0, ARENA_HEIGHT);
    ctx.lineTo(0, ARENA_HEIGHT - 68);
    ctx.lineTo(130, ARENA_HEIGHT - 94);
    ctx.lineTo(270, ARENA_HEIGHT - 76);
    ctx.lineTo(380, ARENA_HEIGHT - 108);
    ctx.lineTo(530, ARENA_HEIGHT - 80);
    ctx.lineTo(700, ARENA_HEIGHT - 104);
    ctx.lineTo(860, ARENA_HEIGHT - 78);
    ctx.lineTo(ARENA_WIDTH, ARENA_HEIGHT - 92);
    ctx.lineTo(ARENA_WIDTH, ARENA_HEIGHT);
    ctx.closePath();
    ctx.fill();

    runtime.bases.forEach((base) => {
      ctx.save();
      ctx.translate(base.x, BASE_Y);
      ctx.fillStyle = base.hp > 0 ? '#8d97b8' : '#494d5a';
      ctx.strokeStyle = base.hp > 0 ? '#d7ddf0' : '#676c79';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-base.width / 2, -16, base.width, 16, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = base.hp > 0 ? 'rgba(215, 221, 240, 0.16)' : 'rgba(98, 108, 129, 0.14)';
      ctx.beginPath();
      ctx.arc(0, -18, base.width * 0.28, Math.PI, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = base.hp > 0 ? '#f1f3fa' : '#b6bccf';
      ctx.font = '600 14px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`B${base.id}`, 0, -4);

      ctx.font = '600 12px ui-sans-serif, system-ui, sans-serif';
      ctx.fillStyle = base.hp > 0 ? '#dfe5f8' : '#b28484';
      ctx.fillText(base.hp > 0 ? 'Online' : 'Destroyed', 0, 14);
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

      const sprite = sprites[enemy.spriteKey];
      if (sprite.complete) {
        const size = enemy.kind === 'heavy' ? 88 : enemy.kind === 'fast' ? 66 : 76;
        const spinProgress =
          enemy.state === 'dying'
            ? Math.min(1, (runtime.loopTimeMs - enemy.deathStartedAt) / enemy.deathDurationMs)
            : 0;
        const rotation =
          enemy.state === 'dying'
            ? enemy.baseRotation + spinProgress * Math.PI * 4
            : Math.atan2(enemy.vy, enemy.vx) - Math.PI / 2;
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(rotation);
        if (enemy.state === 'dying') {
          ctx.globalAlpha = Math.max(0.3, 1 - spinProgress * 0.45);
        }
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
        if (sprites.fire.complete) {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.drawImage(sprites.fire, shot.x - shot.radius, shot.y - shot.radius, shot.radius * 2, shot.radius * 2);
          ctx.restore();
        }
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 244, 214, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    if (sprites.emblem.complete) {
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.drawImage(sprites.emblem, ARENA_WIDTH - 190, 26, 150, 150);
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
  }

  function updateGame(timestamp) {
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
        const moveX = (input.has('arrowright') || input.has('d') ? 1 : 0) - (input.has('arrowleft') || input.has('a') ? 1 : 0);
        const moveY = (input.has('arrowdown') || input.has('s') ? 1 : 0) - (input.has('arrowup') || input.has('w') ? 1 : 0);
        runtime.reticleX = clamp(runtime.reticleX + moveX * keyboardSpeed * deltaSeconds, 24, ARENA_WIDTH - 24);
        runtime.reticleY = clamp(runtime.reticleY + moveY * keyboardSpeed * deltaSeconds, 36, ARENA_HEIGHT - 120);
      }

      const frozen = isPowerUpActive(runtime, 'freeze', timestamp);
      const difficultyConfig = getDifficultyConfig();
      const enemySpeedFactor = (frozen ? 0.42 : 1) * difficultyConfig.speedMultiplier;
      const spawnRateFactor = (frozen ? 0.78 : 1) * difficultyConfig.spawnMultiplier;

      runtime.spawnTimerMs -= deltaMs;
      if (runtime.spawnTimerMs <= 0) {
        spawnEnemy();
        const baseInterval = Math.max(210, 920 - runtime.level * 65);
        runtime.spawnTimerMs = baseInterval * spawnRateFactor * (0.75 + Math.random() * 0.55);
      }

        runtime.enemies.forEach((enemy) => {
          if (enemy.state === 'active') {
            enemy.x += enemy.vx * deltaSeconds * enemySpeedFactor;
            enemy.y += enemy.vy * deltaSeconds * enemySpeedFactor;
          }
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
          if (shot.spent) {
            shot.radius += shot.growthRate * 2.2 * deltaSeconds;
            return;
          }
          shot.radius += shot.growthRate * deltaSeconds;
        }
      });

      const survivingEnemies = [];
      runtime.enemies.forEach((enemy) => {
        if (enemy.state === 'dying') {
          const deathElapsed = timestamp - enemy.deathStartedAt;
          if (deathElapsed >= enemy.deathDurationMs) {
            return;
          } else {
            survivingEnemies.push(enemy);
          }
          return;
        }

        const killingShot = runtime.shots.find(
          (shot) =>
            shot.exploded &&
            !shot.spent &&
            distance(enemy.x, enemy.y, shot.x, shot.y) <= shot.radius + enemy.radius
        );

        if (killingShot) {
          killingShot.spent = true;
          killingShot.radius = killingShot.maxRadius;
          markEnemyDying(enemy, timestamp);
          survivingEnemies.push(enemy);
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
          const wasAlive = baseHit.hp > 0;
          baseHit.hp = Math.max(0, baseHit.hp - enemy.damage);
          if (wasAlive && baseHit.hp === 0) {
            playBaseExplosion();
          } else {
            playTone(110, 260, 'square', 0.05);
          }
          return;
        }

        if (enemy.y < ARENA_HEIGHT + 60) {
          survivingEnemies.push(enemy);
        }
      });
      runtime.enemies = survivingEnemies;

      const survivingPowerUps = [];
      runtime.powerUps.forEach((powerUp) => {
        const detonated = runtime.shots.some(
          (shot) => shot.exploded && distance(powerUp.x, powerUp.y, shot.x, shot.y) <= shot.radius + powerUp.radius
        );

        if (detonated) {
          activatePowerUp(powerUp, timestamp);
          return;
        }

        if (powerUp.y < ARENA_HEIGHT - 50) {
          survivingPowerUps.push(powerUp);
        }
      });
      runtime.powerUps = survivingPowerUps;

      runtime.shots = runtime.shots.filter((shot) => !shot.exploded || shot.radius < shot.maxRadius);

      if (runtime.bases.every((base) => base.hp === 0)) {
        gameOverSummary = { score: runtime.score, level: runtime.level };
        phase = 'gameOver';
        theme.pause();
        theme.currentTime = 0;
        updateOverlay();
      }

      if (timestamp - runtime.lastHudAt >= HUD_UPDATE_MS) {
        runtime.lastHudAt = timestamp;
        syncHud();
      }
    }
  }

  function frame(timestamp) {
    updateGame(timestamp);
    drawScene();
    animationFrameId = requestAnimationFrame(frame);
  }

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' ', 'enter'].includes(key)) {
      event.preventDefault();
    }

    input.add(key);

    if (phase === 'playing' && controlMode === 'keyboard' && (key === ' ' || key === 'enter')) {
      fireShot(runtime.reticleX, runtime.reticleY, runtime.loopTimeMs);
      syncHud();
    }
  });

  window.addEventListener('keyup', (event) => {
    input.delete(event.key.toLowerCase());
  });

  canvas.addEventListener('mousemove', updateMouseReticle);
  canvas.addEventListener('click', (event) => {
    if (phase !== 'playing' || controlMode !== 'mouse') {
      return;
    }
    updateMouseReticle(event);
    fireShot(runtime.reticleX, runtime.reticleY, runtime.loopTimeMs);
    syncHud();
  });

  mouseModeButton.addEventListener('click', () => {
    controlMode = 'mouse';
    syncHud();
    updateOverlay();
  });

  keyboardModeButton.addEventListener('click', () => {
    controlMode = 'keyboard';
    syncHud();
    updateOverlay();
  });

  easyButton.addEventListener('click', () => {
    difficulty = 'easy';
    syncHud();
    updateOverlay();
  });

  normalButton.addEventListener('click', () => {
    difficulty = 'normal';
    syncHud();
    updateOverlay();
  });

  hardButton.addEventListener('click', () => {
    difficulty = 'hard';
    syncHud();
    updateOverlay();
  });

  speedSlider.addEventListener('input', () => {
    keyboardSpeed = Number(speedSlider.value);
    speedValue.textContent = String(keyboardSpeed);
    syncHud();
  });

  musicButton.addEventListener('click', () => {
    musicMuted = !musicMuted;
    syncMusic();
    updateOverlay();
  });

  sfxButton.addEventListener('click', () => {
    sfxMuted = !sfxMuted;
    updateOverlay();
  });

  pauseButton.addEventListener('click', togglePause);
  startButton.addEventListener('click', startGame);

  syncHud();
  updateOverlay();
  drawScene();
  animationFrameId = requestAnimationFrame(frame);

  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(animationFrameId);
    theme.pause();
  });
})();
