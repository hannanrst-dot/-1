// 2.5D Canvas Renderer for Rescue the Mountain Cargo («نجات بار از کوه»)
import { toPersianDigits } from './physics.js';

export class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.dpr = window.devicePixelRatio || 1;

    this.animTime = 0;
    this.particles = [];
    this.bird = { x: 120, y: 130, flap: 0, hopOffset: 0 };
    this.clouds = [
      { x: 50, y: 60, speed: 0.15, size: 60 },
      { x: 320, y: 40, speed: 0.22, size: 80 },
      { x: 650, y: 75, speed: 0.18, size: 50 }
    ];

    this.simProgress = 0; // 0 to 1 during animation
    this.isTesting = false;
    this.isSuccess = false;
    this.testSpeed = 1.0;
    this.reducedMotion = false;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  addSparkle(x, y, count = 12, color = '#FFD700') {
    if (this.reducedMotion) return;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 1.5 + Math.random() * 3;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.03,
        size: 3 + Math.random() * 4,
        color
      });
    }
  }

  addDust(x, y) {
    if (this.reducedMotion) return;
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 5,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 1.2,
        life: 0.8,
        decay: 0.04,
        size: 4 + Math.random() * 4,
        color: 'rgba(210, 180, 140, 0.7)'
      });
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(state) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    this.animTime += 0.016;

    ctx.clearRect(0, 0, w, h);

    // 1. Sky & Mountain Background
    this.drawSkyAndMountains(ctx, w, h);

    // 2. Clouds & Flying Companion Bird
    this.drawCloudsAndBird(ctx, w, h);

    // 3. Terrain & Clinic Structure
    this.drawTerrainAndClinic(ctx, w, h, state);

    // 4. Interactive Machine Rendering based on Mission/State
    if (state.missionId === 1 || state.workbenchType === 'FLAT_DRAG') {
      this.drawFlatDragScene(ctx, w, h, state);
    } else if (state.missionId === 2 || state.workbenchType === 'INCLINED_PLANE') {
      this.drawInclinedPlaneScene(ctx, w, h, state);
    } else if (state.missionId === 3 || state.workbenchType === 'LEVER') {
      this.drawLeverScene(ctx, w, h, state);
    } else if (state.missionId === 4 || state.workbenchType === 'PULLEY') {
      this.drawPulleyScene(ctx, w, h, state);
    } else if (state.missionId === 5 || state.workbenchType === 'CAPSTONE') {
      this.drawCapstoneScene(ctx, w, h, state);
    }

    // 5. Particles (Sparkles / Dust)
    this.drawParticles(ctx);

    // 6. Force Meter & Gauge Overlay on Canvas
    this.drawForceMeterOverlay(ctx, w, h, state);
  }

  drawSkyAndMountains(ctx, w, h) {
    // Sky gradient (sunlit Iranian highland morning)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.75);
    skyGrad.addColorStop(0, '#7ec8f8');
    skyGrad.addColorStop(0.55, '#c5e6fa');
    skyGrad.addColorStop(1, '#fffae8');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Sun
    ctx.save();
    ctx.fillStyle = 'rgba(255, 235, 140, 0.45)';
    ctx.beginPath();
    ctx.arc(w * 0.85, 70, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF8D0';
    ctx.beginPath();
    ctx.arc(w * 0.85, 70, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Far Mountain Ridges (Deep Indigo & Teal)
    ctx.fillStyle = '#4b6584';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.65);
    ctx.lineTo(w * 0.15, h * 0.35);
    ctx.lineTo(w * 0.35, h * 0.52);
    ctx.lineTo(w * 0.6, h * 0.28);
    ctx.lineTo(w * 0.8, h * 0.48);
    ctx.lineTo(w, h * 0.32);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();

    // Snow caps
    ctx.fillStyle = '#eaf2f8';
    ctx.beginPath();
    ctx.moveTo(w * 0.6, h * 0.28);
    ctx.lineTo(w * 0.56, h * 0.33);
    ctx.lineTo(w * 0.64, h * 0.34);
    ctx.closePath();
    ctx.fill();

    // Mid-ground Mountains (Warm Ochre / Sage Green)
    ctx.fillStyle = '#658d72';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.7);
    ctx.quadraticCurveTo(w * 0.25, h * 0.48, w * 0.45, h * 0.68);
    ctx.quadraticCurveTo(w * 0.7, h * 0.52, w, h * 0.62);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();
  }

  drawCloudsAndBird(ctx, w, h) {
    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
    this.clouds.forEach(c => {
      c.x += c.speed;
      if (c.x > w + 100) c.x = -100;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size * 0.4, 0, Math.PI * 2);
      ctx.arc(c.x + c.size * 0.3, c.y - c.size * 0.15, c.size * 0.45, 0, Math.PI * 2);
      ctx.arc(c.x + c.size * 0.6, c.y, c.size * 0.35, 0, Math.PI * 2);
      ctx.fill();
    });

    // Mountain Bird («بلبل کوهی»)
    const bx = this.bird.x + Math.sin(this.animTime * 1.5) * 8;
    const by = this.bird.y + Math.cos(this.animTime * 2.2) * 6;
    ctx.save();
    ctx.translate(bx, by);
    // Body (Teal & Saffron)
    ctx.fillStyle = '#20bf6b';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 6, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // Head
    ctx.fillStyle = '#f7b731';
    ctx.beginPath();
    ctx.arc(8, -4, 5, 0, Math.PI * 2);
    ctx.fill();
    // Beak
    ctx.fillStyle = '#e17055';
    ctx.beginPath();
    ctx.moveTo(13, -4);
    ctx.lineTo(17, -3);
    ctx.lineTo(13, -1);
    ctx.fill();
    // Eye
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.arc(10, -5, 1, 0, Math.PI * 2);
    ctx.fill();
    // Wing
    const wingY = Math.sin(this.animTime * 8) * 4;
    ctx.fillStyle = '#0fb9b1';
    ctx.beginPath();
    ctx.ellipse(-2, -2 + wingY, 6, 4, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawTerrainAndClinic(ctx, w, h, state) {
    // Foreground Ground (Warm Stone & Grassy Terraces)
    const groundY = h * 0.82;
    ctx.fillStyle = '#795548';
    ctx.fillRect(0, groundY, w, h - groundY);

    // Top grass layer
    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = 0; x <= w; x += 30) {
      ctx.lineTo(x, groundY + Math.sin(x * 0.05) * 4);
    }
    ctx.lineTo(w, groundY + 12);
    ctx.lineTo(0, groundY + 12);
    ctx.fill();

    // Wildflowers (شقایق کوهی سرخ و زرد)
    ctx.fillStyle = '#e74c3c';
    for (let x = 40; x < w; x += 110) {
      const fy = groundY - 6 + Math.sin(x) * 4;
      ctx.beginPath();
      ctx.arc(x, fy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(x, fy, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e74c3c';
    }

    // Mountain Clinic Building on the right edge
    const clinicX = w - 160;
    const clinicY = h * 0.45;
    const clinicW = 140;
    const clinicH = groundY - clinicY;

    // Clinic stone base
    ctx.fillStyle = '#dcdde1';
    ctx.fillRect(clinicX, clinicY, clinicW, clinicH);

    // Wooden roof
    ctx.fillStyle = '#a0522d';
    ctx.beginPath();
    ctx.moveTo(clinicX - 15, clinicY);
    ctx.lineTo(clinicX + clinicW / 2, clinicY - 35);
    ctx.lineTo(clinicX + clinicW + 15, clinicY);
    ctx.closePath();
    ctx.fill();

    // Wooden beams & Door
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(clinicX + 45, groundY - 70, 45, 70);

    // Medical Red Crescent / Crescent Banner
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(clinicX + clinicW / 2, clinicY + 30, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(clinicX + clinicW / 2 + 3, clinicY + 30, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(clinicX + clinicW / 2 + 7, clinicY + 30, 9, 0, Math.PI * 2);
    ctx.fill();

    // Signboard: «درمانگاه کوهستان»
    ctx.fillStyle = '#fff8e7';
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 2;
    ctx.fillRect(clinicX + 15, clinicY + 52, 110, 22);
    ctx.strokeRect(clinicX + 15, clinicY + 52, 110, 22);

    ctx.fillStyle = '#3e2723';
    ctx.font = 'bold 12px Vazirmatn, Shabnam, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('درمانگاه کوهستان', clinicX + 70, clinicY + 68);
  }

  // --- Scene 1: Flat Dragging & Rollers ---
  drawFlatDragScene(ctx, w, h, state) {
    const groundY = h * 0.82;
    const startX = 140;
    const endX = w - 240;
    const progress = this.simProgress;
    const currentX = startX + (endX - startX) * progress;

    const hasRollers = state.hasRollers;
    const surfaceId = state.selectedSurface || 'ROUGH_STONE';

    // Track surface overlay
    ctx.save();
    if (surfaceId === 'ROUGH_STONE') {
      ctx.fillStyle = '#9e9e9e';
      ctx.fillRect(startX - 20, groundY - 6, endX - startX + 100, 8);
      // Rough stone bumps
      ctx.fillStyle = '#616161';
      for (let x = startX - 10; x < endX + 80; x += 22) {
        ctx.beginPath();
        ctx.arc(x, groundY - 4, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (surfaceId === 'WOOD_PLANKS') {
      ctx.fillStyle = '#bcaaa4';
      ctx.fillRect(startX - 20, groundY - 6, endX - startX + 100, 8);
      ctx.strokeStyle = '#795548';
      ctx.lineWidth = 2;
      for (let x = startX - 20; x < endX + 80; x += 35) {
        ctx.strokeRect(x, groundY - 6, 32, 8);
      }
    } else if (surfaceId === 'SMOOTH_TRACK') {
      ctx.fillStyle = '#81d4fa';
      ctx.fillRect(startX - 20, groundY - 6, endX - startX + 100, 8);
      // Shine glints
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(startX + 60, groundY - 5, 80, 2);
      ctx.fillRect(startX + 220, groundY - 5, 100, 2);
    }
    ctx.restore();

    // Rollers beneath crate if active
    const crateW = 85;
    const crateH = 65;
    let crateBottomY = groundY - 6;

    if (hasRollers) {
      crateBottomY -= 16;
      // Draw 3 wooden roller cylinders
      const rollerAngle = progress * 15;
      const rollerXPositions = [currentX + 15, currentX + 42, currentX + 70];
      rollerXPositions.forEach(rx => {
        ctx.save();
        ctx.translate(rx, groundY - 8);
        ctx.rotate(rollerAngle);
        ctx.fillStyle = '#ffb74d';
        ctx.strokeStyle = '#e65100';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Spoke mark
        ctx.beginPath();
        ctx.moveTo(-7, 0);
        ctx.lineTo(7, 0);
        ctx.stroke();
        ctx.restore();
      });
    }

    // The Medicine Crate
    this.drawCrate(ctx, currentX, crateBottomY - crateH, crateW, crateH, state.cargoMassKg || 50);

    // Pulling Rope & Inventor Figure
    const pullX = currentX + crateW + 55;
    const pullY = crateBottomY - 25;
    this.drawRope(ctx, currentX + crateW, crateBottomY - 25, pullX, pullY, state.isHumanPullable ? '#8d6e63' : '#e74c3c');
    this.drawInventorPulling(ctx, pullX + 15, groundY - 6, progress, state.isHumanPullable);
  }

  // --- Scene 2: Inclined Plane ---
  drawInclinedPlaneScene(ctx, w, h, state) {
    const groundY = h * 0.82;
    const cliffHeightPx = 160;
    const cliffTopY = groundY - cliffHeightPx;
    const cliffX = w - 260;

    // Stone cliff shelf
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(cliffX, cliffTopY, w - cliffX, cliffHeightPx);
    // Stone bricks texture
    ctx.strokeStyle = '#576574';
    ctx.lineWidth = 2;
    for (let y = cliffTopY; y < groundY; y += 30) {
      ctx.beginPath();
      ctx.moveTo(cliffX, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Ramp Base & Length
    const rampLengthM = state.rampLengthM || 4.0;
    // Map rampLengthM (2.2m to 6.5m) to horizontal base
    const minM = 2.2;
    const maxM = 6.5;
    const minBasePx = 140;
    const maxBasePx = 420;
    const baseLengthPx = minBasePx + ((rampLengthM - minM) / (maxM - minM)) * (maxBasePx - minBasePx);

    const rampStartX = cliffX - baseLengthPx;
    const rampStartY = groundY - 4;
    const rampEndX = cliffX;
    const rampEndY = cliffTopY;

    // Draw Ramp Support Scaffolding
    ctx.fillStyle = 'rgba(215, 175, 130, 0.95)';
    ctx.beginPath();
    ctx.moveTo(rampStartX, rampStartY);
    ctx.lineTo(rampEndX, rampEndY);
    ctx.lineTo(rampEndX, rampStartY);
    ctx.closePath();
    ctx.fill();

    // Ramp Surface Plank
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(rampStartX, rampStartY);
    ctx.lineTo(rampEndX, rampEndY);
    ctx.stroke();

    // Measuring Tape & Angle label
    const angleRad = Math.atan2(cliffHeightPx, baseLengthPx);
    const angleDeg = Math.round((angleRad * 180) / Math.PI);

    // Measuring tape along ramp
    ctx.save();
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(rampStartX, rampStartY - 12);
    ctx.lineTo(rampEndX, rampEndY - 12);
    ctx.stroke();
    ctx.setLineDash([]);

    // Distance Badge
    const midX = (rampStartX + rampEndX) / 2;
    const midY = (rampStartY + rampEndY) / 2 - 25;
    ctx.fillStyle = '#fff9db';
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 1.5;
    ctx.fillRect(midX - 45, midY - 14, 90, 24);
    ctx.strokeRect(midX - 45, midY - 14, 90, 24);

    ctx.fillStyle = '#d35400';
    ctx.font = 'bold 12px Vazirmatn, Shabnam, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`طول: ${toPersianDigits(rampLengthM)} م | شیب: ${toPersianDigits(angleDeg)}°`, midX, midY + 3);
    ctx.restore();

    // Crate position along ramp during test
    const progress = this.simProgress;
    const cx = rampStartX + (rampEndX - rampStartX) * progress;
    const cy = rampStartY + (rampEndY - rampStartY) * progress;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-angleRad);

    const crateW = 75;
    const crateH = 55;

    // Rollers on ramp
    if (state.hasRollers) {
      const rAngle = progress * 18;
      ctx.fillStyle = '#ffb74d';
      ctx.strokeStyle = '#e65100';
      ctx.lineWidth = 2;
      [15, 40, 65].forEach(rx => {
        ctx.beginPath();
        ctx.arc(rx, -8, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
      this.drawCrate(ctx, 0, -crateH - 16, crateW, crateH, state.cargoMassKg || 50);
    } else {
      this.drawCrate(ctx, 0, -crateH - 6, crateW, crateH, state.cargoMassKg || 50);
    }
    ctx.restore();

    // Pulley / Puller at cliff top
    const pullAnchorX = cliffX + 35;
    const pullAnchorY = cliffTopY - 20;
    this.drawRope(ctx, cx + 50 * Math.cos(-angleRad), cy + 50 * Math.sin(-angleRad) - 20, pullAnchorX, pullAnchorY, '#8d6e63');
    this.drawInventorPulling(ctx, pullAnchorX + 25, cliffTopY, progress, state.isHumanPullable);
  }

  // --- Scene 3: Lever Scene ---
  drawLeverScene(ctx, w, h, state) {
    const groundY = h * 0.82;
    const originX = 160;
    const beamPx = 360; // total rendered beam width

    const fulcrumRatio = (state.fulcrumPosM || 1.2) / (state.beamLengthM || 3.0);
    const clampedRatio = Math.max(0.15, Math.min(0.85, fulcrumRatio));
    const fulcrumX = originX + clampedRatio * beamPx;

    // Tilt angle of lever based on test progress
    const maxTilt = 0.16; // radians
    const currentTilt = state.isTesting ? (state.isHumanPullable ? (this.simProgress * maxTilt) : (this.simProgress * 0.03)) : 0;

    // Draw Fulcrum Stone (سنگ تکیه‌گاه)
    const fulcrumH = 45;
    ctx.fillStyle = '#546e7a';
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fulcrumX, groundY - fulcrumH);
    ctx.lineTo(fulcrumX - 26, groundY);
    ctx.lineTo(fulcrumX + 26, groundY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fulcrum Label
    ctx.fillStyle = '#263238';
    ctx.font = 'bold 12px Vazirmatn, Shabnam, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('تکیه‌گاه', fulcrumX, groundY + 18);

    // Draw Pivoting Wooden Beam
    ctx.save();
    ctx.translate(fulcrumX, groundY - fulcrumH);
    ctx.rotate(currentTilt);

    const leftArmPx = fulcrumX - originX;
    const rightArmPx = beamPx - leftArmPx;

    // Beam rectangle
    ctx.fillStyle = '#8d6e63';
    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth = 3;
    ctx.fillRect(-leftArmPx, -10, beamPx, 20);
    ctx.strokeRect(-leftArmPx, -10, beamPx, 20);

    // Boulder / Heavy Load at Left End (بار)
    const boulderRadius = 38;
    const loadX = -leftArmPx + 35;
    const loadY = -10 - boulderRadius;
    ctx.fillStyle = '#78909c';
    ctx.strokeStyle = '#37474f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(loadX, loadY, boulderRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Vazirmatn, Shabnam, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`تخته‌سنگ (${toPersianDigits(state.cargoMassKg || 80)} کیلو)`, loadX, loadY + 4);

    // Load Arm Distance Indicator
    ctx.restore();

    // Arm length lines and labels
    ctx.save();
    ctx.strokeStyle = '#e67e22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX + 35, groundY - 60);
    ctx.lineTo(fulcrumX, groundY - 60);
    ctx.stroke();

    ctx.fillStyle = '#d35400';
    ctx.font = 'bold 11px Vazirmatn, Shabnam, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`بازوی بار: ${toPersianDigits(state.loadArmM || 0.8)} م`, (originX + 35 + fulcrumX) / 2, groundY - 68);

    // Effort Arm line
    const effortX = originX + beamPx;
    ctx.strokeStyle = '#27ae60';
    ctx.beginPath();
    ctx.moveTo(fulcrumX, groundY - 60);
    ctx.lineTo(effortX, groundY - 60);
    ctx.stroke();

    ctx.fillStyle = '#27ae60';
    ctx.fillText(`بازوی نیرو: ${toPersianDigits(state.effortArmM || 2.2)} م`, (fulcrumX + effortX) / 2, groundY - 68);
    ctx.restore();

    // Inventor pushing down on right end
    const handY = groundY - fulcrumH + (rightArmPx * Math.sin(currentTilt));
    this.drawInventorPushing(ctx, effortX, handY, this.simProgress, state.isHumanPullable);
  }

  // --- Scene 4: Pulley Scene ---
  drawPulleyScene(ctx, w, h, state) {
    const groundY = h * 0.82;
    const topBeamY = 90;
    const centerX = w * 0.45;
    const pulleyType = state.selectedPulley || 'FIXED';
    const progress = this.simProgress;

    // Top support beam / Wooden gantry
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(centerX - 120, topBeamY - 14, 240, 24);
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - 120, topBeamY - 14, 240, 24);

    const liftHeightPx = 160;
    const crateW = 75;
    const crateH = 55;
    const startCrateY = groundY - crateH - 4;
    const endCrateY = startCrateY - liftHeightPx;
    const crateCurrentY = startCrateY - liftHeightPx * progress;

    if (pulleyType === 'FIXED') {
      // 1 Fixed Pulley at top gantry
      const fixedWheelX = centerX;
      const fixedWheelY = topBeamY + 30;
      this.drawPulleyWheel(ctx, fixedWheelX, fixedWheelY, 24, progress * 15);

      // Ropes: Crate -> Pulley Wheel -> Puller Hand
      this.drawRope(ctx, fixedWheelX - 22, crateCurrentY, fixedWheelX - 22, fixedWheelY, '#8d6e63');
      this.drawRope(ctx, fixedWheelX + 22, fixedWheelY, fixedWheelX + 110, groundY - 60 + progress * 50, '#8d6e63');

      // Crate
      this.drawCrate(ctx, fixedWheelX - 22 - crateW / 2, crateCurrentY, crateW, crateH, state.cargoMassKg || 60);

      // Puller
      this.drawInventorPulling(ctx, fixedWheelX + 120, groundY - 4, progress, state.isHumanPullable);

    } else if (pulleyType === 'MOVABLE') {
      // Movable Pulley: Top Anchor + Movable wheel on crate
      const topAnchorX = centerX - 40;
      const fixedTopWheelX = centerX + 40;
      const fixedTopWheelY = topBeamY + 30;

      // Movable wheel attached to top of crate
      const movableWheelX = centerX;
      const movableWheelY = crateCurrentY - 26;

      this.drawPulleyWheel(ctx, movableWheelX, movableWheelY, 22, progress * 18);
      this.drawPulleyWheel(ctx, fixedTopWheelX, fixedTopWheelY, 22, progress * 18);

      // Ropes: Top anchor -> Under Movable Wheel -> Up to fixed wheel -> down to puller
      this.drawRope(ctx, topAnchorX, topBeamY + 10, movableWheelX - 20, movableWheelY, '#8d6e63');
      this.drawRope(ctx, movableWheelX + 20, movableWheelY, fixedTopWheelX - 20, fixedTopWheelY, '#8d6e63');
      this.drawRope(ctx, fixedTopWheelX + 20, fixedTopWheelY, fixedTopWheelX + 90, groundY - 60 + progress * 70, '#8d6e63');

      // Crate attached to movable wheel
      this.drawCrate(ctx, movableWheelX - crateW / 2, crateCurrentY, crateW, crateH, state.cargoMassKg || 60);

      // Puller
      this.drawInventorPulling(ctx, fixedTopWheelX + 100, groundY - 4, progress, state.isHumanPullable);

    } else {
      // COMPOUND (2 or 4 pulleys)
      const topW1 = centerX - 25;
      const topW2 = centerX + 25;
      const topY = topBeamY + 30;

      const botW1 = centerX - 18;
      const botW2 = centerX + 18;
      const botY = crateCurrentY - 26;

      this.drawPulleyWheel(ctx, topW1, topY, 20, progress * 20);
      this.drawPulleyWheel(ctx, topW2, topY, 20, progress * 20);
      this.drawPulleyWheel(ctx, botW1, botY, 18, progress * 20);
      this.drawPulleyWheel(ctx, botW2, botY, 18, progress * 20);

      // Multi-strand ropes
      this.drawRope(ctx, topW1 - 18, topY, botW1 - 16, botY, '#8d6e63');
      this.drawRope(ctx, botW1 + 16, botY, topW2 - 18, topY, '#8d6e63');
      this.drawRope(ctx, topW2 + 18, topY, botW2 - 16, botY, '#8d6e63');
      this.drawRope(ctx, botW2 + 16, botY, centerX + 120, groundY - 60 + progress * 80, '#8d6e63');

      this.drawCrate(ctx, centerX - crateW / 2, crateCurrentY, crateW, crateH, state.cargoMassKg || 60);
      this.drawInventorPulling(ctx, centerX + 130, groundY - 4, progress, state.isHumanPullable);
    }

    // Rope length counter badge
    const ropeDistanceM = state.ropePullDistanceM || 4.0;
    ctx.save();
    ctx.fillStyle = '#e8f5e9';
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 2;
    ctx.fillRect(centerX + 60, topBeamY + 60, 130, 30);
    ctx.strokeRect(centerX + 60, topBeamY + 60, 130, 30);

    ctx.fillStyle = '#2e7d32';
    ctx.font = 'bold 12px Vazirmatn, Shabnam, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`طناب کشیده‌شده: ${toPersianDigits(ropeDistanceM * progress)} / ${toPersianDigits(ropeDistanceM)} م`, centerX + 125, topBeamY + 80);
    ctx.restore();
  }

  // --- Scene 5: Capstone Comprehensive Scene ---
  drawCapstoneScene(ctx, w, h, state) {
    const groundY = h * 0.82;
    const progress = this.simProgress;

    // 3 Stages:
    // Stage 1 (0.0 to 0.4): Ramp incline to middle plateau
    // Stage 2 (0.4 to 0.7): Crossing wooden bridge
    // Stage 3 (0.7 to 1.0): Pulley lift to top clinic balcony

    const s1EndX = w * 0.35;
    const s1EndY = groundY - 90;
    const s2EndX = w * 0.65;
    const s2EndY = s1EndY;
    const s3EndY = groundY - 200;

    // Plateau 1
    ctx.fillStyle = '#795548';
    ctx.fillRect(s1EndX - 20, s1EndY, 40, groundY - s1EndY);

    // Stage 1 Ramp
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(80, groundY - 4);
    ctx.lineTo(s1EndX, s1EndY);
    ctx.stroke();

    // Stage 2 Wooden Bridge
    const bridgeBeams = state.stage2BridgeBeamCount || 2;
    ctx.fillStyle = bridgeBeams >= 2 ? '#bcaaa4' : 'rgba(188, 170, 164, 0.4)';
    ctx.fillRect(s1EndX, s1EndY - 6, s2EndX - s1EndX, 12);
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 2;
    ctx.strokeRect(s1EndX, s1EndY - 6, s2EndX - s1EndX, 12);

    // Stage 3 High Tower & Pulley
    ctx.fillStyle = '#78909c';
    ctx.fillRect(s2EndX, s3EndY, 70, groundY - s3EndY);
    this.drawPulleyWheel(ctx, s2EndX + 35, s3EndY - 20, 20, progress * 20);

    // Crate coordinate
    let cx, cy;
    const crateW = 60;
    const crateH = 45;

    if (progress <= 0.4) {
      const p = progress / 0.4;
      cx = 80 + (s1EndX - 80) * p;
      cy = (groundY - 4) + (s1EndY - (groundY - 4)) * p - crateH;
    } else if (progress <= 0.7) {
      const p = (progress - 0.4) / 0.3;
      cx = s1EndX + (s2EndX - s1EndX) * p;
      cy = s1EndY - crateH - 6;
    } else {
      const p = (progress - 0.7) / 0.3;
      cx = s2EndX + 10;
      cy = (s2EndY - crateH - 6) + (s3EndY - 20 - (s2EndY - crateH - 6)) * p;
    }

    this.drawCrate(ctx, cx, cy, crateW, crateH, state.cargoMassKg || 70);
  }

  // --- Sub-draw helper elements ---

  drawCrate(ctx, x, y, w, h, massKg) {
    ctx.save();
    // Wooden crate body
    ctx.fillStyle = '#d7a15c';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x, y, w, h);

    // Diagonal brace
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y + h);
    ctx.moveTo(x + w, y);
    ctx.lineTo(x, y + h);
    ctx.stroke();

    // Red Crescent / Medical symbol
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + w / 2 + 2, y + h / 2, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(x + w / 2 + 5, y + h / 2, 6, 0, Math.PI * 2);
    ctx.fill();

    // Mass Label
    ctx.fillStyle = '#3e2723';
    ctx.font = 'bold 11px Vazirmatn, Shabnam, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${toPersianDigits(massKg)} kg`, x + w / 2, y + h - 5);
    ctx.restore();
  }

  drawPulleyWheel(ctx, x, y, radius, rotationAngle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotationAngle);

    // Outer rim
    ctx.fillStyle = '#795548';
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner groove
    ctx.fillStyle = '#d7ccc8';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Spokes
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
      ctx.stroke();
    }

    // Center pin
    ctx.fillStyle = '#ffc107';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawRope(ctx, x1, y1, x2, y2, color = '#8d6e63') {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  drawInventorPulling(ctx, x, groundY, progress, isSuccess) {
    ctx.save();
    ctx.translate(x, groundY);

    // Effort posture: leaning back while pulling
    const leanAngle = isSuccess ? -0.2 : -0.35;
    ctx.rotate(leanAngle);

    // Body (Warm Saffron tunic)
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(-8, -48, 16, 26);

    // Head
    ctx.fillStyle = '#f8c291';
    ctx.beginPath();
    ctx.arc(0, -56, 9, 0, Math.PI * 2);
    ctx.fill();

    // Persian headband / Cap (Teal)
    ctx.fillStyle = '#16a085';
    ctx.beginPath();
    ctx.arc(0, -60, 9, Math.PI, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(-4, -56, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-4, -22);
    ctx.lineTo(-12, 0);
    ctx.moveTo(4, -22);
    ctx.lineTo(6, 0);
    ctx.stroke();

    // Arms holding rope
    ctx.strokeStyle = '#f8c291';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.lineTo(-24, -34);
    ctx.stroke();

    ctx.restore();
  }

  drawInventorPushing(ctx, x, handY, progress, isSuccess) {
    ctx.save();
    ctx.translate(x, handY);

    // Arms pushing down on lever handle
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(-6, -35, 14, 24);

    ctx.fillStyle = '#f8c291';
    ctx.beginPath();
    ctx.arc(0, -43, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#16a085';
    ctx.beginPath();
    ctx.arc(0, -47, 8, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#f8c291';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, -28);
    ctx.lineTo(0, 0);
    ctx.stroke();

    ctx.restore();
  }

  drawParticles(ctx) {
    this.updateParticles();
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  drawForceMeterOverlay(ctx, w, h, state) {
    // Spring Force Meter HUD (نیروسنج فنری)
    const meterX = 20;
    const meterY = 20;
    const meterW = 160;
    const meterH = 90;

    ctx.save();
    // Glassmorphism background panel
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = state.isHumanPullable ? '#27ae60' : '#e74c3c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(meterX, meterY, meterW, meterH, 10);
    ctx.fill();
    ctx.stroke();

    // Title & Icon
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 12px Vazirmatn, Shabnam, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('⚡ نیروی کشش لازم:', meterX + meterW - 12, meterY + 22);

    // Big Force Value in Persian digits
    const forceN = state.totalRequiredForceN !== undefined ? state.totalRequiredForceN : 300;
    ctx.fillStyle = state.isHumanPullable ? '#27ae60' : '#c0392b';
    ctx.font = 'bold 20px Vazirmatn, Shabnam, sans-serif';
    ctx.fillText(`${toPersianDigits(forceN)} نیوتون`, meterX + meterW - 12, meterY + 48);

    // Spring Bar indicator
    const barX = meterX + 12;
    const barY = meterY + 58;
    const barW = meterW - 24;
    const barH = 10;

    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(barX, barY, barW, barH);

    const maxScaleForce = 600;
    const fillRatio = Math.min(1.0, forceN / maxScaleForce);
    ctx.fillStyle = state.isHumanPullable ? '#2ecc71' : '#e74c3c';
    ctx.fillRect(barX, barY, barW * fillRatio, barH);

    // Safe Human Limit Marker (180 N)
    const limitX = barX + barW * (180 / maxScaleForce);
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(limitX, barY - 2);
    ctx.lineTo(limitX, barY + barH + 2);
    ctx.stroke();

    // Status subtitle
    ctx.font = '10px Vazirmatn, Shabnam, sans-serif';
    ctx.fillStyle = state.isHumanPullable ? '#27ae60' : '#e74c3c';
    ctx.textAlign = 'center';
    const statusText = state.isHumanPullable ? '✔ قابل کشیدن با نیروی یک فرد' : '✖ سنگین‌تر از توان یک نفر';
    ctx.fillText(statusText, meterX + meterW / 2, meterY + 80);

    ctx.restore();
  }
}
