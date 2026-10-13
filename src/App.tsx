import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore, getDimensionTierPreset, DIMENSION_TIERS } from './store/useGameStore';
import { useInputStore } from './store/useInputStore';
import { useUniversalInput } from './hooks/useUniversalInput';
import { useGameLoop } from './hooks/useGameLoop';
import { Navbar } from './components/layout/Navbar';
import { Scanlines } from './components/layout/Scanlines';
import { Watermark } from './components/layout/Watermark';
import { Button } from './components/common/Button';
import { ControlSettings } from './components/UI/ControlSettings';
import { VirtualJoystick } from './components/UI/VirtualJoystick';
import { TopRunnersList } from './components/UI/TopRunnersList';
import { DailyMissionDrawer } from './components/UI/DailyMissionDrawer';
import { AudioSynth as audioSynth } from './services/AudioSynth';
/* NEW CODE ADDITIONS START: POWER UP TYPES IMPORT */
import { PowerUpType } from './types';
/* NEW CODE ADDITIONS END: POWER UP TYPES IMPORT */
/* NEW CODE ADDITIONS START: LUCIDE ICONS FOR BEST DISTANCE, COMBO & MISSION HUD */
import { Trophy, Compass, Zap, Flame, Sparkles, Disc3, ShieldAlert, Shield, Layers, Target, X, Award } from 'lucide-react';
/* NEW CODE ADDITIONS END: LUCIDE ICONS FOR BEST DISTANCE, COMBO & MISSION HUD */

/* NEW CODE ADDITIONS START: PARTICLE SYSTEM CONSTANTS & TYPES */
const MAX_TRAIL_PARTICLES = 300;

interface TrailParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  r: number;
  g: number;
  b: number;
  size: number;
  active: boolean;
}
/* NEW CODE ADDITIONS END: PARTICLE SYSTEM CONSTANTS & TYPES */

export const App: React.FC = () => {
  useUniversalInput();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    isStarted,
    isGameOver,
    startGame,
    resetGame,
    updateTick,
    playerLane,
    isJumping,
    isSliding,
    setJumping,
    setSliding,
    speed,
    distance,
    /* NEW CODE ADDITIONS START: BEST DISTANCE, SCORE & COMBO EXTRACTION */
    bestDistance,
    score,
    topScore,
    orbs,
    combo,
    comboMultiplier,
    maxCombo,
    comboRank,
    missOrb,
    /* NEW CODE ADDITIONS END: BEST DISTANCE, SCORE & COMBO EXTRACTION */
    /* NEW CODE ADDITIONS START: POWER UP EXTRACTION */
    activePowerUp,
    collectPowerUp,
    /* NEW CODE ADDITIONS END: POWER UP EXTRACTION */
    /* NEW CODE ADDITIONS START: DIMENSION SHIFT STATE & ACTIONS */
    dimensionBoost,
    isDimensionShiftActive,
    phaseThroughObstacle,
    /* NEW CODE ADDITIONS END: DIMENSION SHIFT STATE & ACTIONS */
    collectOrb,
    takeDamage,
    /* NEW CODE ADDITIONS START: DAILY MISSION SYSTEM EXTRACTION */
    dailyMission,
    missionAlert,
    dismissMissionAlert,
    toggleMissionDrawer,
    /* NEW CODE ADDITIONS END: DAILY MISSION SYSTEM EXTRACTION */
  } = useGameStore();

  /* NEW CODE ADDITIONS START: DAILY MISSION KEYBOARD SHORTCUT & ALERT AUTO-DISMISS */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle daily mission drawer with [M] key if not in an input
      if ((e.key === 'm' || e.key === 'M') && !e.repeat && document.activeElement?.tagName !== 'INPUT') {
        toggleMissionDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMissionDrawer]);

  useEffect(() => {
    if (missionAlert?.active) {
      const timer = setTimeout(() => {
        dismissMissionAlert();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [missionAlert, dismissMissionAlert]);
  /* NEW CODE ADDITIONS END: DAILY MISSION KEYBOARD SHORTCUT & ALERT AUTO-DISMISS */

  const { deviceType } = useInputStore();

  // 3D Scene Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Player Meshes
  const playerGroupRef = useRef<THREE.Group | null>(null);
  const leftLegRef = useRef<THREE.Mesh | null>(null);
  const rightLegRef = useRef<THREE.Mesh | null>(null);
  const leftArmRef = useRef<THREE.Mesh | null>(null);
  const rightArmRef = useRef<THREE.Mesh | null>(null);
  const scarfRibbonRef = useRef<THREE.Mesh | null>(null);
  const playerAuraRef = useRef<THREE.Mesh | null>(null);
  /* NEW CODE ADDITIONS START: SHIELD FORCEFIELD REF */
  const shieldForcefieldRef = useRef<THREE.Mesh | null>(null);
  /* NEW CODE ADDITIONS END: SHIELD FORCEFIELD REF */

  /* NEW CODE ADDITIONS START: DIMENSION AFTER-IMAGE GHOST CLONES REFS */
  const ghostClonesRef = useRef<THREE.Group[]>([]);
  /* NEW CODE ADDITIONS END: DIMENSION AFTER-IMAGE GHOST CLONES REFS */

  // World objects
  const gridFloorRef = useRef<THREE.GridHelper | null>(null);
  const obstaclesGroupRef = useRef<THREE.Group | null>(null);
  const collectiblesGroupRef = useRef<THREE.Group | null>(null);
  const warpStreaksGroupRef = useRef<THREE.Group | null>(null);

  /* NEW CODE ADDITIONS START: SKYBOX PALETTE, LIGHTING & PILLARS REFS */
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const pointLightRef = useRef<THREE.PointLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const pillarsGroupRef = useRef<THREE.Group | null>(null);
  /* NEW CODE ADDITIONS END: SKYBOX PALETTE, LIGHTING & PILLARS REFS */

  /* NEW CODE ADDITIONS START: TRAIL PARTICLES SYSTEM REFS */
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const particlesPoolRef = useRef<TrailParticle[]>([]);
  const particlePositionsRef = useRef<Float32Array | null>(null);
  const particleColorsRef = useRef<Float32Array | null>(null);
  /* NEW CODE ADDITIONS END: TRAIL PARTICLES SYSTEM REFS */

  // Physics state inside 3D
  const jumpY = useRef(0);
  const jumpVY = useRef(0);
  const animTime = useRef(0);
  const laneX = useRef(0);
  const slideTimer = useRef(0);

  // Clear leftover 3D objects from previous runs
  const clearThreeGroups = () => {
    if (obstaclesGroupRef.current) {
      while (obstaclesGroupRef.current.children.length > 0) {
        obstaclesGroupRef.current.remove(obstaclesGroupRef.current.children[0]);
      }
    }
    if (collectiblesGroupRef.current) {
      while (collectiblesGroupRef.current.children.length > 0) {
        collectiblesGroupRef.current.remove(collectiblesGroupRef.current.children[0]);
      }
    }
    // Reset trail particles
    if (particlesPoolRef.current) {
      particlesPoolRef.current.forEach((p) => {
        p.active = false;
        p.life = 0;
      });
    }
  };

  /* NEW CODE ADDITIONS START: PARTICLE SPAWNER UTILITIES */
  const emitTrailParticle = (
    originX: number,
    originY: number,
    originZ: number,
    isShift: boolean,
    multiplier: number
  ) => {
    const pool = particlesPoolRef.current;
    if (!pool || pool.length === 0) return;

    // Find inactive particle or oldest particle
    let p = pool.find((item) => !item.active);
    if (!p) {
      p = pool[0];
    }

    const spread = isShift ? 0.6 : 0.25;
    p.active = true;
    p.x = originX + (Math.random() - 0.5) * spread;
    p.y = originY + (Math.random() - 0.5) * spread;
    p.z = originZ + (Math.random() - 0.5) * 0.2;

    if (isShift) {
      // Intensely chaotic neon stream during dimension shift
      p.vx = (Math.random() - 0.5) * 4.5;
      p.vy = (Math.random() - 0.5) * 4.0 + 1.0;
      p.vz = -8.0 - Math.random() * 12.0;
      p.maxLife = 0.5 + Math.random() * 0.3;
      p.life = p.maxLife;

      // Alternating Cyber-Red and Electric Violet
      if (Math.random() > 0.4) {
        p.r = 0.88;
        p.g = 0.34;
        p.b = 0.99;
      } else {
        p.r = 1.0;
        p.g = 0.0;
        p.b = 0.24;
      }
      p.size = 6.0 + Math.random() * 6.0;
    } else {
      // Sleek ninja trailing sparks scaling with combo
      const comboBoost = Math.min(3, multiplier * 0.5);
      p.vx = (Math.random() - 0.5) * 1.5;
      p.vy = Math.random() * 1.2;
      p.vz = -3.0 - Math.random() * 4.0;
      p.maxLife = 0.3 + Math.random() * 0.2;
      p.life = p.maxLife;

      if (multiplier >= 4) {
        p.r = 1.0;
        p.g = 0.0;
        p.b = 0.24;
      } else {
        p.r = 0.88;
        p.g = 0.34;
        p.b = 0.99;
      }
      p.size = 3.5 + comboBoost + Math.random() * 2.0;
    }
  };

  const emitOrbBurst = (bx: number, by: number, bz: number, multiplier: number) => {
    const burstCount = Math.min(25, 12 + multiplier * 2);
    for (let i = 0; i < burstCount; i++) {
      const pool = particlesPoolRef.current;
      const p = pool.find((item) => !item.active) || pool[i % pool.length];
      if (!p) continue;

      p.active = true;
      p.x = bx;
      p.y = by;
      p.z = bz;

      const angle = Math.random() * Math.PI * 2;
      const speedMag = 4.0 + Math.random() * 6.0;
      p.vx = Math.cos(angle) * speedMag;
      p.vy = (Math.random() - 0.5) * speedMag + 1.5;
      p.vz = Math.sin(angle) * speedMag;
      p.maxLife = 0.4 + Math.random() * 0.3;
      p.life = p.maxLife;

      if (multiplier >= 4) {
        p.r = 1.0;
        p.g = 0.0;
        p.b = 0.24;
      } else {
        p.r = 0.88;
        p.g = 0.34;
        p.b = 0.99;
      }
      p.size = 5.0 + Math.random() * 4.0;
    }
  };
  /* NEW CODE ADDITIONS END: PARTICLE SPAWNER UTILITIES */

  // Initialize Three.js Scene
  useEffect(() => {
    if (!canvasRef.current) return;

    audioSynth.init();

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.015);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      300
    );
    camera.position.set(0, 4.5, 9);
    camera.lookAt(0, 1.5, -10);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const dirLight = new THREE.DirectionalLight(0xff003c, 1.2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const purplePointLight = new THREE.PointLight(0xe056fd, 2, 30);
    purplePointLight.position.set(0, 5, -5);
    scene.add(purplePointLight);
    pointLightRef.current = purplePointLight;

    // Floor Grid
    const grid = new THREE.GridHelper(300, 60, 0xff003c, 0xe056fd);
    grid.position.set(0, 0, -100);
    scene.add(grid);
    gridFloorRef.current = grid;

    // Groups
    const obstaclesGroup = new THREE.Group();
    scene.add(obstaclesGroup);
    obstaclesGroupRef.current = obstaclesGroup;

    const collectiblesGroup = new THREE.Group();
    scene.add(collectiblesGroup);
    collectiblesGroupRef.current = collectiblesGroup;

    /* NEW CODE ADDITIONS START: INITIALIZE TRAIL PARTICLE BUFFER */
    const particlePositions = new Float32Array(MAX_TRAIL_PARTICLES * 3);
    const particleColors = new Float32Array(MAX_TRAIL_PARTICLES * 3);
    const particlesPool: TrailParticle[] = [];

    for (let i = 0; i < MAX_TRAIL_PARTICLES; i++) {
      particlesPool.push({
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        maxLife: 1,
        r: 0.88,
        g: 0.34,
        b: 0.99,
        size: 3,
        active: false,
      });

      // Default offscreen
      particlePositions[i * 3 + 0] = 0;
      particlePositions[i * 3 + 1] = -100;
      particlePositions[i * 3 + 2] = 0;

      particleColors[i * 3 + 0] = 0.88;
      particleColors[i * 3 + 1] = 0.34;
      particleColors[i * 3 + 2] = 0.99;
    }

    particlesPoolRef.current = particlesPool;
    particlePositionsRef.current = particlePositions;
    particleColorsRef.current = particleColors;

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePositions, 3)
    );
    particleGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(particleColors, 3)
    );

    // Canvas particle texture for smooth round glowing dots
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.4, 'rgba(224,86,253,0.8)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(pCanvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.65,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      map: particleTexture,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    particleSystemRef.current = particleSystem;
    /* NEW CODE ADDITIONS END: INITIALIZE TRAIL PARTICLE BUFFER */

    /* NEW CODE ADDITIONS START: WARP SPEED STREAKS FOR DIMENSION SHIFT */
    const warpStreaksGroup = new THREE.Group();
    const streakCount = 60;
    const streakGeo = new THREE.BufferGeometry();
    const streakPositions = new Float32Array(streakCount * 6);

    for (let i = 0; i < streakCount; i++) {
      const sx = (Math.random() - 0.5) * 20;
      const sy = Math.random() * 8 + 0.5;
      const sz = -Math.random() * 100;
      const len = 4 + Math.random() * 8;

      streakPositions[i * 6 + 0] = sx;
      streakPositions[i * 6 + 1] = sy;
      streakPositions[i * 6 + 2] = sz;

      streakPositions[i * 6 + 3] = sx;
      streakPositions[i * 6 + 4] = sy;
      streakPositions[i * 6 + 5] = sz - len;
    }

    streakGeo.setAttribute('position', new THREE.BufferAttribute(streakPositions, 3));
    const streakMat = new THREE.LineBasicMaterial({
      color: 0xe056fd,
      transparent: true,
      opacity: 0.8,
    });
    const streakLines = new THREE.LineSegments(streakGeo, streakMat);
    streakLines.visible = false;
    warpStreaksGroup.add(streakLines);
    scene.add(warpStreaksGroup);
    warpStreaksGroupRef.current = warpStreaksGroup;
    /* NEW CODE ADDITIONS END: WARP SPEED STREAKS FOR DIMENSION SHIFT */

    // Construct 3D Procedural Red & Purple Ninja
    const playerGroup = new THREE.Group();

    // Torso (Red Vest + Purple Sash)
    const torsoGeo = new THREE.BoxGeometry(0.8, 1.2, 0.5);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0xff003c });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.2;
    playerGroup.add(torso);

    const sashGeo = new THREE.BoxGeometry(0.85, 0.3, 0.55);
    const sashMat = new THREE.MeshStandardMaterial({ color: 0xe056fd });
    const sash = new THREE.Mesh(sashGeo, sashMat);
    sash.position.y = 1.0;
    playerGroup.add(sash);

    // Head (Purple Mask + Red Bandband)
    const headGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x220033 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.0;
    playerGroup.add(head);

    const eyesGeo = new THREE.BoxGeometry(0.4, 0.1, 0.1);
    const eyesMat = new THREE.MeshBasicMaterial({ color: 0xff003c });
    const eyes = new THREE.Mesh(eyesGeo, eyesMat);
    eyes.position.set(0, 2.05, 0.31);
    playerGroup.add(eyes);

    // Ninja Trailing Purple Scarf Ribbon
    const scarfGeo = new THREE.BoxGeometry(0.2, 0.2, 1.8);
    const scarfMat = new THREE.MeshBasicMaterial({ color: 0xe056fd });
    const scarf = new THREE.Mesh(scarfGeo, scarfMat);
    scarf.position.set(0, 2.1, -0.9);
    playerGroup.add(scarf);
    scarfRibbonRef.current = scarf;

    // Limbs
    const limbGeo = new THREE.BoxGeometry(0.3, 0.9, 0.3);
    const redMat = new THREE.MeshStandardMaterial({ color: 0xff003c });
    const purpleMat = new THREE.MeshStandardMaterial({ color: 0xe056fd });

    // Left Arm
    const leftArm = new THREE.Mesh(limbGeo, redMat);
    leftArm.position.set(-0.6, 1.2, 0);
    playerGroup.add(leftArm);
    leftArmRef.current = leftArm;

    // Right Arm
    const rightArm = new THREE.Mesh(limbGeo, redMat);
    rightArm.position.set(0.6, 1.2, 0);
    playerGroup.add(rightArm);
    rightArmRef.current = rightArm;

    // Left Leg
    const leftLeg = new THREE.Mesh(limbGeo, purpleMat);
    leftLeg.position.set(-0.25, 0.45, 0);
    playerGroup.add(leftLeg);
    leftLegRef.current = leftLeg;

    // Right Leg
    const rightLeg = new THREE.Mesh(limbGeo, purpleMat);
    rightLeg.position.set(0.25, 0.45, 0);
    playerGroup.add(rightLeg);
    rightLegRef.current = rightLeg;

    /* NEW CODE ADDITIONS START: INTANGIBLE HOLOGRAPHIC AURA & SHIELD FORCEFIELD */
    const auraGeo = new THREE.BoxGeometry(1.4, 2.6, 1.2);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xe056fd,
      wireframe: true,
      transparent: true,
      opacity: 0,
    });
    const playerAura = new THREE.Mesh(auraGeo, auraMat);
    playerAura.position.y = 1.3;
    playerGroup.add(playerAura);
    playerAuraRef.current = playerAura;

    // Holographic Shield Forcefield Sphere
    const shieldGeo = new THREE.IcosahedronGeometry(1.65, 1);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0,
    });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    shieldMesh.position.y = 1.3;
    shieldMesh.visible = false;
    playerGroup.add(shieldMesh);
    shieldForcefieldRef.current = shieldMesh;
    /* NEW CODE ADDITIONS END: INTANGIBLE HOLOGRAPHIC AURA & SHIELD FORCEFIELD */

    /* NEW CODE ADDITIONS START: GHOST AFTER-IMAGE TRAIL CLONES */
    const ghosts: THREE.Group[] = [];
    for (let g = 0; g < 3; g++) {
      const ghost = new THREE.Group();
      const gTorso = new THREE.Mesh(
        torsoGeo,
        new THREE.MeshBasicMaterial({
          color: g % 2 === 0 ? 0xe056fd : 0xff003c,
          wireframe: true,
          transparent: true,
          opacity: 0,
        })
      );
      gTorso.position.y = 1.2;
      ghost.add(gTorso);
      ghost.visible = false;
      scene.add(ghost);
      ghosts.push(ghost);
    }
    ghostClonesRef.current = ghosts;
    /* NEW CODE ADDITIONS END: GHOST AFTER-IMAGE TRAIL CLONES */

    scene.add(playerGroup);
    playerGroupRef.current = playerGroup;

    // Dimension Side Pillars
    const pillarsGroup = new THREE.Group();
    for (let i = 0; i < 30; i++) {
      const pGeo = new THREE.BoxGeometry(1, 15, 1);
      const pMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xff003c : 0xe056fd,
        wireframe: true,
      });
      const leftPillar = new THREE.Mesh(pGeo, pMat);
      leftPillar.position.set(-8, 5, -i * 12);
      pillarsGroup.add(leftPillar);

      const rightPillar = new THREE.Mesh(pGeo, pMat);
      rightPillar.position.set(8, 5, -i * 12);
      pillarsGroup.add(rightPillar);
    }
    scene.add(pillarsGroup);
    pillarsGroupRef.current = pillarsGroup;

    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Spawn Obstacles & Collectibles
  const spawnEntities = (zTarget: number) => {
    if (!obstaclesGroupRef.current || !collectiblesGroupRef.current) return;

    const lanes: (-1 | 0 | 1)[] = [-1, 0, 1];
    const chosenLane = lanes[Math.floor(Math.random() * lanes.length)];

    // Obstacle
    const obsTypes: ('BARRIER-LOW' | 'BARRIER-HIGH' | 'PILLAR')[] = ['BARRIER-LOW', 'BARRIER-HIGH', 'PILLAR'];
    const type = obsTypes[Math.floor(Math.random() * obsTypes.length)];

    const obsGroup = new THREE.Group();
    obsGroup.position.z = zTarget;
    let obsGeo: THREE.BufferGeometry;
    let obsMat: THREE.Material = new THREE.MeshStandardMaterial({
      color: 0xff003c,
      emissive: 0x990022,
    });

    if (type === 'BARRIER-LOW') {
      obsGeo = new THREE.BoxGeometry(2.2, 1.0, 0.6);
      const mesh = new THREE.Mesh(obsGeo, obsMat);
      mesh.position.set(chosenLane * 3.0, 0.5, 0);
      obsGroup.add(mesh);
    } else if (type === 'BARRIER-HIGH') {
      obsGeo = new THREE.BoxGeometry(2.2, 1.5, 0.6);
      const mesh = new THREE.Mesh(obsGeo, obsMat);
      mesh.position.set(chosenLane * 3.0, 2.5, 0);
      obsGroup.add(mesh);
    } else {
      obsGeo = new THREE.BoxGeometry(1.2, 4.0, 1.2);
      const mesh = new THREE.Mesh(obsGeo, obsMat);
      mesh.position.set(chosenLane * 3.0, 2.0, 0);
      obsGroup.add(mesh);
    }

    obsGroup.userData = { lane: chosenLane, type, phased: false };
    obstaclesGroupRef.current.add(obsGroup);

    // Collectible Lane
    const orbLane = lanes.find((l) => l !== chosenLane) || 0;

    /* NEW CODE ADDITIONS START: POWER UP CAPSULE VS ORB SPAWNING */
    // ~28% chance to spawn a Power-Up Capsule instead of a regular orb
    const isPowerUp = Math.random() < 0.28;
    if (isPowerUp) {
      const randP = Math.random();
      const pType: PowerUpType = randP < 0.35 ? 'SHIELD' : randP < 0.7 ? 'DOUBLE_SCORE' : 'COMBO_FREEZE';
      const capGroup = new THREE.Group();
      capGroup.position.set(orbLane * 3.0, 1.3, zTarget);

      // Core floating jewel
      const coreGeo = pType === 'COMBO_FREEZE'
        ? new THREE.DodecahedronGeometry(0.5, 0)
        : new THREE.OctahedronGeometry(0.5, 0);

      const coreMat = new THREE.MeshStandardMaterial({
        color: pType === 'COMBO_FREEZE' ? 0x00ffff : pType === 'SHIELD' ? 0x00f0ff : 0xff003c,
        emissive: pType === 'COMBO_FREEZE' ? 0x0099cc : pType === 'SHIELD' ? 0x0088ff : 0xff003c,
        roughness: 0.15,
        metalness: 0.85,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      capGroup.add(coreMesh);

      // Orbital spinning energy ring
      const ringGeo = new THREE.TorusGeometry(0.75, 0.04, 8, 20);
      const ringMat = new THREE.MeshBasicMaterial({
        color: pType === 'COMBO_FREEZE' ? 0x00ffff : pType === 'SHIELD' ? 0xe056fd : 0xffffff,
        wireframe: true,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 4;
      capGroup.add(ringMesh);

      // Cryogenic secondary frost ring for COMBO_FREEZE
      if (pType === 'COMBO_FREEZE') {
        const iceRingGeo = new THREE.TorusGeometry(0.58, 0.03, 6, 16);
        const iceRingMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          wireframe: true,
        });
        const iceRingMesh = new THREE.Mesh(iceRingGeo, iceRingMat);
        iceRingMesh.rotation.y = Math.PI / 3;
        capGroup.add(iceRingMesh);
      }

      // Outer wireframe beacon halo
      const haloGeo = new THREE.IcosahedronGeometry(0.92, 0);
      const haloMat = new THREE.MeshBasicMaterial({
        color: pType === 'COMBO_FREEZE' ? 0x00f0ff : pType === 'SHIELD' ? 0x00f0ff : 0xe056fd,
        wireframe: true,
        transparent: true,
        opacity: 0.65,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      capGroup.add(haloMesh);

      capGroup.userData = {
        lane: orbLane,
        type: 'POWER_UP',
        powerUpType: pType,
        collected: false,
        missed: false,
      };
      collectiblesGroupRef.current.add(capGroup);
    } else {
      // Standard collectible orb
      const orbGeo = new THREE.SphereGeometry(0.4, 12, 12);
      const orbMat = new THREE.MeshBasicMaterial({ color: 0xe056fd, wireframe: true });
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      orbMesh.position.set(orbLane * 3.0, 1.2, zTarget);
      orbMesh.userData = { lane: orbLane, type: 'ORB', collected: false, missed: false };
      collectiblesGroupRef.current.add(orbMesh);
    }
    /* NEW CODE ADDITIONS END: POWER UP CAPSULE VS ORB SPAWNING */
  };

  // Main 3D Game Loop
  useGameLoop((delta) => {
    if (!isStarted || isGameOver) return;

    /* NEW CODE ADDITIONS START: INCREMENTAL GLOBAL SPEED & DIFFICULTY PROGRESSION */
    updateTick(delta);
    /* NEW CODE ADDITIONS END: INCREMENTAL GLOBAL SPEED & DIFFICULTY PROGRESSION */

    // Limb animation and step cadence scale directly with the progressive speed
    animTime.current += delta * (speed * 0.42);

    // Target X Position based on Lane (-1, 0, 1)
    const targetX = playerLane * 3.0;
    laneX.current = THREE.MathUtils.lerp(laneX.current, targetX, 0.2);

    /* NEW CODE ADDITIONS START: DYNAMIC FOV & WARP STREAKS ANIMATION */
    if (cameraRef.current) {
      const speedFovBoost = Math.min(10, (speed - 24) * 0.25);
      const targetFov = (isDimensionShiftActive ? 78 : 65) + speedFovBoost;
      cameraRef.current.fov = THREE.MathUtils.lerp(cameraRef.current.fov, targetFov, 0.1);
      cameraRef.current.updateProjectionMatrix();
    }

    if (warpStreaksGroupRef.current && warpStreaksGroupRef.current.children[0]) {
      const streaks = warpStreaksGroupRef.current.children[0] as THREE.LineSegments;
      streaks.visible = isDimensionShiftActive || speed > 45;
      if (streaks.visible) {
        const positions = streaks.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length / 6; i++) {
          positions[i * 6 + 2] += speed * delta * 2.5;
          positions[i * 6 + 5] += speed * delta * 2.5;

          if (positions[i * 6 + 2] > 10) {
            positions[i * 6 + 2] = -120;
            positions[i * 6 + 5] = -128;
          }
        }
        streaks.geometry.attributes.position.needsUpdate = true;
      }
    }
    /* NEW CODE ADDITIONS END: DYNAMIC FOV & WARP STREAKS ANIMATION */

    /* NEW CODE ADDITIONS START: DYNAMIC SKYBOX & COLOR PALETTE ESCALATION PER TIER */
    const tierPreset = getDimensionTierPreset(distance);
    const targetSky = new THREE.Color(tierPreset.skyColor);
    const targetFog = new THREE.Color(tierPreset.fogColor);

    if (sceneRef.current) {
      if (sceneRef.current.background instanceof THREE.Color) {
        sceneRef.current.background.lerp(targetSky, 0.05);
      }
      if (sceneRef.current.fog instanceof THREE.FogExp2) {
        sceneRef.current.fog.color.lerp(targetFog, 0.05);
        sceneRef.current.fog.density = THREE.MathUtils.lerp(
          sceneRef.current.fog.density,
          tierPreset.fogDensity,
          0.05
        );
      }
    }

    if (dirLightRef.current) {
      dirLightRef.current.color.lerp(new THREE.Color(tierPreset.dirLightColor), 0.05);
    }
    if (pointLightRef.current) {
      pointLightRef.current.color.lerp(new THREE.Color(tierPreset.gridColorGrid), 0.05);
    }

    if (pillarsGroupRef.current) {
      const pCol1 = new THREE.Color(tierPreset.pillarColor1);
      const pCol2 = new THREE.Color(tierPreset.pillarColor2);
      pillarsGroupRef.current.children.forEach((pMesh, idx) => {
        if (pMesh instanceof THREE.Mesh && pMesh.material instanceof THREE.MeshBasicMaterial) {
          pMesh.material.color.lerp(idx % 2 === 0 ? pCol1 : pCol2, 0.05);
        }
      });
    }
    /* NEW CODE ADDITIONS END: DYNAMIC SKYBOX & COLOR PALETTE ESCALATION PER TIER */

    // Jumping Physics
    if (isJumping) {
      if (jumpY.current === 0) {
        jumpVY.current = 14.0;
        audioSynth.playJump();
      }
      jumpY.current += jumpVY.current * delta;
      jumpVY.current -= 32.0 * delta;

      if (jumpY.current <= 0) {
        jumpY.current = 0;
        jumpVY.current = 0;
        setJumping(false);
      }
    }

    // Sliding Physics & Native Delta Timer
    let playerScaleY = 1.0;
    if (isSliding) {
      if (slideTimer.current <= 0) slideTimer.current = 0.6;
      playerScaleY = 0.4;
      slideTimer.current -= delta;

      if (slideTimer.current <= 0) {
        slideTimer.current = 0;
        setSliding(false);
      }
    } else {
      slideTimer.current = 0;
    }

    // Update Player Mesh Position & Intangible Aura
    if (playerGroupRef.current) {
      playerGroupRef.current.position.x = laneX.current;
      playerGroupRef.current.position.y = jumpY.current;
      playerGroupRef.current.scale.y = playerScaleY;

      /* NEW CODE ADDITIONS START: INTANGIBLE GHOST AURA & GHOST CLONES */
      if (playerAuraRef.current) {
        const auraMat = playerAuraRef.current.material as THREE.MeshBasicMaterial;
        if (isDimensionShiftActive) {
          auraMat.opacity = 0.6 + Math.sin(animTime.current * 10) * 0.3;
          playerAuraRef.current.rotation.y += delta * 4;
        } else {
          auraMat.opacity = 0;
        }
      }

      /* NEW CODE ADDITIONS START: HOLOGRAPHIC SHIELD & COMBO FREEZE FORCEFIELD ANIMATION */
      if (shieldForcefieldRef.current) {
        const isShieldActive = activePowerUp?.type === 'SHIELD';
        const isFreezeActive = activePowerUp?.type === 'COMBO_FREEZE';
        const sMat = shieldForcefieldRef.current.material as THREE.MeshBasicMaterial;
        if (isShieldActive || isFreezeActive) {
          shieldForcefieldRef.current.visible = true;
          sMat.color.setHex(isFreezeActive ? 0x00ffff : 0x00f0ff);
          sMat.opacity = isFreezeActive
            ? 0.85 + Math.sin(animTime.current * 14) * 0.15
            : 0.75 + Math.sin(animTime.current * 12) * 0.25;
          shieldForcefieldRef.current.rotation.y += delta * (isFreezeActive ? 4.8 : 3.5);
          shieldForcefieldRef.current.rotation.x += delta * (isFreezeActive ? 2.8 : 2.0);
          const pulse = 1.0 + Math.sin(animTime.current * 8) * 0.08;
          shieldForcefieldRef.current.scale.set(pulse, pulse, pulse);
        } else {
          shieldForcefieldRef.current.visible = false;
          sMat.opacity = 0;
        }
      }
      /* NEW CODE ADDITIONS END: HOLOGRAPHIC SHIELD & COMBO FREEZE FORCEFIELD ANIMATION */

      // Update trailing after-image clones during dimension shift
      if (ghostClonesRef.current.length > 0) {
        ghostClonesRef.current.forEach((ghost, idx) => {
          if (isDimensionShiftActive) {
            ghost.visible = true;
            const lagFactor = (idx + 1) * 0.8;
            ghost.position.x = THREE.MathUtils.lerp(ghost.position.x, laneX.current, 0.25 / (idx + 1));
            ghost.position.y = jumpY.current;
            ghost.position.z = lagFactor * 0.8;
            ghost.scale.y = playerScaleY;
            const mesh = ghost.children[0] as THREE.Mesh;
            if (mesh) {
              const gMat = mesh.material as THREE.MeshBasicMaterial;
              gMat.opacity = (0.5 - idx * 0.12) * (0.8 + Math.sin(animTime.current * 8 + idx) * 0.2);
            }
          } else {
            ghost.visible = false;
          }
        });
      }
      /* NEW CODE ADDITIONS END: INTANGIBLE GHOST AURA & GHOST CLONES */

      // Running Limb Oscillations
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(animTime.current) * 0.8;
        rightArmRef.current.rotation.x = -Math.sin(animTime.current) * 0.8;
      }
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = -Math.sin(animTime.current) * 0.9;
        rightLegRef.current.rotation.x = Math.sin(animTime.current) * 0.9;
      }

      // Waving Scarf Tail
      if (scarfRibbonRef.current) {
        scarfRibbonRef.current.rotation.y = Math.sin(animTime.current * 2) * 0.2;
        scarfRibbonRef.current.rotation.x = Math.cos(animTime.current * 2) * 0.1;
      }

      // Footstep Sound Sync
      if (Math.sin(animTime.current) > 0.95 && !isJumping) {
        audioSynth.playFootstep();
      }

      /* NEW CODE ADDITIONS START: TRAIL PARTICLES EMISSION & BUFFER UPDATE */
      // Emission rate: higher during shift, double score power-up, combo freeze, or elevated combo
      const isDoubleScore = activePowerUp?.type === 'DOUBLE_SCORE';
      const isComboFreeze = activePowerUp?.type === 'COMBO_FREEZE';
      const trailSpawnRate = isDimensionShiftActive ? 6 : (isDoubleScore || isComboFreeze) ? 5 : comboMultiplier >= 4 ? 3 : 2;
      for (let s = 0; s < trailSpawnRate; s++) {
        emitTrailParticle(
          laneX.current,
          jumpY.current + (isSliding ? 0.3 : 0.8),
          0.0,
          isDimensionShiftActive || isDoubleScore || isComboFreeze,
          comboMultiplier * (isDoubleScore ? 2 : 1)
        );
      }
      /* NEW CODE ADDITIONS END: TRAIL PARTICLES EMISSION & BUFFER UPDATE */
    }

    /* NEW CODE ADDITIONS START: UPDATE TRAIL PARTICLES PHYSICS & BUFFER */
    if (
      particleSystemRef.current &&
      particlePositionsRef.current &&
      particleColorsRef.current &&
      particlesPoolRef.current
    ) {
      const positions = particlePositionsRef.current;
      const colors = particleColorsRef.current;
      const pool = particlesPoolRef.current;

      for (let i = 0; i < pool.length; i++) {
        const p = pool[i];
        if (p.active) {
          p.x += p.vx * delta;
          p.y += p.vy * delta;
          p.z += (p.vz - speed * 0.3) * delta;
          p.life -= delta;

          if (p.life <= 0) {
            p.active = false;
            positions[i * 3 + 1] = -100; // Hide offscreen
          } else {
            const lifeRatio = p.life / p.maxLife;
            positions[i * 3 + 0] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;

            colors[i * 3 + 0] = p.r * lifeRatio;
            colors[i * 3 + 1] = p.g * lifeRatio;
            colors[i * 3 + 2] = p.b * lifeRatio;
          }
        } else {
          positions[i * 3 + 1] = -100;
        }
      }

      particleSystemRef.current.geometry.attributes.position.needsUpdate = true;
      particleSystemRef.current.geometry.attributes.color.needsUpdate = true;
    }
    /* NEW CODE ADDITIONS END: UPDATE TRAIL PARTICLES PHYSICS & BUFFER */

    // Move Grid Floor
    if (gridFloorRef.current) {
      gridFloorRef.current.position.z += speed * delta;
      if (gridFloorRef.current.position.z > 0) {
        gridFloorRef.current.position.z = -20;
      }
    }

    // Move & Check Obstacles with Intangibility
    if (obstaclesGroupRef.current) {
      const zSpeed = speed * delta;

      for (let i = obstaclesGroupRef.current.children.length - 1; i >= 0; i--) {
        const obs = obstaclesGroupRef.current.children[i];
        obs.position.z += zSpeed;

        /* NEW CODE ADDITIONS START: INTANGIBLE OBSTACLE VISUALS */
        obs.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            const mat = child.material as THREE.MeshStandardMaterial;
            if (isDimensionShiftActive) {
              mat.transparent = true;
              mat.opacity = 0.35;
              mat.wireframe = true;
              mat.emissive.setHex(0xe056fd);
            } else {
              mat.transparent = false;
              mat.opacity = 1.0;
              mat.wireframe = false;
              mat.emissive.setHex(0x990022);
            }
          }
        });
        /* NEW CODE ADDITIONS END: INTANGIBLE OBSTACLE VISUALS */

        // Collision Check
        const distZ = Math.abs(obs.position.z - 0);
        const sameLane = playerLane === obs.userData.lane;

        if (distZ < 0.8 && sameLane) {
          /* NEW CODE ADDITIONS START: INTANGIBILITY & SHIELD COLLISION PHASE */
          const isInvulnerable = isDimensionShiftActive || activePowerUp?.type === 'SHIELD';
          if (isInvulnerable) {
            if (!obs.userData.phased) {
              obs.userData.phased = true;
              emitOrbBurst(obs.position.x, 1.5, obs.position.z, comboMultiplier);
              if (activePowerUp?.type === 'SHIELD' && !isDimensionShiftActive) {
                audioSynth.playShieldDeflect();
              }
              phaseThroughObstacle();
            }
          } else {
            const type = obs.userData.type;
            let hit = false;

            if (type === 'BARRIER-LOW' && jumpY.current < 1.0) hit = true;
            if (type === 'BARRIER-HIGH' && !isSliding) hit = true;
            if (type === 'PILLAR') hit = true;

            if (hit) {
              audioSynth.playHit();
              emitOrbBurst(obs.position.x, 1.5, obs.position.z, 1);
              takeDamage(35);
              obstaclesGroupRef.current.remove(obs);
            }
          }
          /* NEW CODE ADDITIONS END: INTANGIBILITY & SHIELD COLLISION PHASE */
        }

        // Cleanup offscreen
        if (obs.position.z > 10) {
          obstaclesGroupRef.current.remove(obs);
        }
      }

      /* NEW CODE ADDITIONS START: DYNAMIC SPEED-ADAPTIVE SPAWNING */
      const spawnThresholdZ = -120 - Math.min(60, (speed - 24) * 1.5);
      const spawnTargetZ = -180 - Math.min(80, (speed - 24) * 2.0);

      if (
        obstaclesGroupRef.current.children.length === 0 ||
        obstaclesGroupRef.current.children[obstaclesGroupRef.current.children.length - 1].position.z > spawnThresholdZ
      ) {
        spawnEntities(spawnTargetZ);
      }
      /* NEW CODE ADDITIONS END: DYNAMIC SPEED-ADAPTIVE SPAWNING */
    }

    // Move & Check Collectibles
    if (collectiblesGroupRef.current) {
      for (let i = collectiblesGroupRef.current.children.length - 1; i >= 0; i--) {
        const item = collectiblesGroupRef.current.children[i];
        item.position.z += speed * delta;
        item.rotation.y += delta * 3;

        /* NEW CODE ADDITIONS START: POWER UP CAPSULE GYRO ROTATION */
        if (item.userData.type === 'POWER_UP') {
          item.rotation.x += delta * 2.5;
          item.rotation.z += delta * 1.8;
        }
        /* NEW CODE ADDITIONS END: POWER UP CAPSULE GYRO ROTATION */

        const distZ = Math.abs(item.position.z - 0);
        const sameLane = playerLane === item.userData.lane;

        /* NEW CODE ADDITIONS START: POWER UP & COMBO ORB COLLECTION & MISS TRACKING */
        if (distZ < 1.3 && sameLane && !item.userData.collected) {
          item.userData.collected = true;
          if (item.userData.type === 'POWER_UP') {
            collectPowerUp(item.userData.powerUpType);
            emitOrbBurst(item.position.x, item.position.y, item.position.z, 10);
          } else {
            // Spawn particle spark explosion at orb location
            emitOrbBurst(item.position.x, item.position.y, item.position.z, comboMultiplier);
            collectOrb();
          }
          collectiblesGroupRef.current.remove(item);
        } else if (item.position.z > 2.0 && !item.userData.collected && !item.userData.missed) {
          item.userData.missed = true;
          // Only standard orbs break combo streaks if missed; powerups don't penalize combo
          if (item.userData.type !== 'POWER_UP') {
            missOrb();
          }
        }
        /* NEW CODE ADDITIONS END: POWER UP & COMBO ORB COLLECTION & MISS TRACKING */

        if (item.position.z > 10) {
          collectiblesGroupRef.current.remove(item);
        }
      }
    }

    // Render 3D Frame
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, isStarted && !isGameOver);

  const handleStart = () => {
    clearThreeGroups();
    audioSynth.init();
    startGame();
  };

  const handleReboot = () => {
    clearThreeGroups();
    resetGame();
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden font-mono select-none">
      <Scanlines />
      <Navbar />
      <Watermark />
      {/* NEW CODE ADDITIONS START: DAILY MISSION DRAWER & ALERT BANNER */}
      <DailyMissionDrawer />

      {/* MISSION ACCOMPLISHED CELEBRATION ALERT BANNER */}
      {missionAlert && missionAlert.active && (
        <div className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-in zoom-in-95 duration-200 w-11/12 max-w-lg">
          <div className="px-4 sm:px-6 py-3.5 bg-black/95 border-2 border-[#39FF14] text-white shadow-[0_0_35px_#39FF14aa] flex items-center justify-between gap-3 font-mono">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#39FF14]/20 border border-[#39FF14] text-[#39FF14] shrink-0">
                <Award className="w-5 h-5 animate-bounce" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-[#39FF14] font-black tracking-widest uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-ping" />
                  DIRECTIVE ACCOMPLISHED // REWARD UNLOCKED
                </div>
                <div className="text-xs sm:text-sm font-black text-white tracking-wide">
                  +{missionAlert.rewardPoints.toLocaleString()} PTS // {missionAlert.title}
                </div>
              </div>
            </div>
            <button
              onClick={dismissMissionAlert}
              className="p-1 text-gray-400 hover:text-white cursor-pointer transition-colors"
              title="Dismiss Alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {/* NEW CODE ADDITIONS END: DAILY MISSION DRAWER & ALERT BANNER */}

      {/* 3D RENDER CANVAS */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

      {/* START SCREEN */}
      {!isStarted && !isGameOver && (
        <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 text-center overflow-y-auto">
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 my-auto pt-16 sm:pt-0">
            {/* LEFT COLUMN: MISSION BRIEF & CONTROLS */}
            <div className="border-2 border-[#FF003C] p-5 sm:p-7 bg-black shadow-[0_0_30px_#FF003C66] flex flex-col justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter italic mb-1">
                  VOID <span className="text-[#FF003C]">NINJA</span>
                </h1>
                <p className="text-[10px] text-[#E056FD] tracking-[0.3em] uppercase mb-4">
                  Endless Dimension Runner // v4.0
                </p>

                {/* BEST DISTANCE TELEMETRY */}
                {bestDistance > 0 && (
                  <div className="mb-4 p-2.5 bg-[#FF003C]/10 border border-[#FF003C] flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-[#E056FD] font-bold">
                      <Trophy className="w-3.5 h-3.5 text-[#E056FD]" />
                      BEST DISTANCE
                    </span>
                    <span className="text-white font-black tracking-widest">
                      {Math.floor(bestDistance).toLocaleString()} M
                    </span>
                  </div>
                )}

                <div className="space-y-2 mb-5 text-left text-xs text-gray-400 border-t border-b border-[#333] py-3 font-mono">
                  <div className="flex justify-between">
                    <span>LANE MOVE</span>
                    <span className="text-white font-bold">[A/D] or [ARROWS]</span>
                  </div>
                  <div className="flex justify-between">
                    <span>JUMP</span>
                    <span className="text-white font-bold">[W] or [UP]</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SLIDE</span>
                    <span className="text-white font-bold">[S] or [DOWN]</span>
                  </div>
                  <div className="flex justify-between text-[#E056FD] font-bold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#FF003C]" />
                      DIMENSION SHIFT
                    </span>
                    <span className="text-white">[SHIFT] / [SPACE]</span>
                  </div>
                  <div className="flex justify-between text-[#FF003C] font-bold">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-[#E056FD]" />
                      COMBO STREAK
                    </span>
                    <span className="text-white">CONSECUTIVE ORBS (UP TO 8X)</span>
                  </div>
                  <div className="flex justify-between text-cyan-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-[#E056FD]" />
                      POWER CAPSULES
                    </span>
                    <span className="text-white">SHIELD / 2X OVERCLOCK</span>
                  </div>
                  <div className="flex justify-between text-[#39FF14] font-bold">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-[#39FF14]" />
                      DIMENSION TIERS
                    </span>
                    <span className="text-white">EVOLVES EVERY 2,000 M</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleStart} className="w-full py-3.5 text-base font-black tracking-widest shadow-[0_0_20px_#FF003C66]">
                INITIATE RUN
              </Button>
            </div>

            {/* RIGHT COLUMN: DAILY DIRECTIVE & TOP RUNNERS LEADERBOARD */}
            <div className="flex flex-col justify-start gap-4">
              {/* NEW CODE ADDITIONS START: START SCREEN DAILY DIRECTIVE WIDGET */}
              <div className="w-full border border-[#FF003C] bg-black/95 p-4 text-left font-mono shadow-[0_0_20px_#FF003C33]">
                <div className="flex items-center justify-between border-b border-[#FF003C]/40 pb-2 mb-2.5">
                  <span className="flex items-center gap-1.5 text-xs font-black tracking-widest text-[#FF003C] uppercase">
                    <Target className="w-4 h-4 animate-pulse" />
                    DAILY DIRECTIVE // {dailyMission.dateKey}
                  </span>
                  <span
                    className={`text-[9px] px-2 py-0.5 font-black tracking-widest uppercase ${
                      dailyMission.completed
                        ? 'bg-[#39FF14] text-black shadow-[0_0_8px_#39FF14]'
                        : 'bg-[#FF003C]/20 border border-[#FF003C] text-[#FF003C]'
                    }`}
                  >
                    {dailyMission.completed ? 'COMPLETED' : 'ACTIVE'}
                  </span>
                </div>

                <div className="text-sm font-black text-white tracking-wide mb-1">
                  {dailyMission.title}
                </div>
                <div className="text-xs text-gray-300 mb-3 font-mono">
                  {dailyMission.description}
                </div>

                <div className="p-2 bg-[#111] border border-[#222] flex items-center justify-between text-[10px] mb-2.5">
                  <span className="text-gray-400">BOUNTY REWARD:</span>
                  <span className="text-[#39FF14] font-black tracking-widest">
                    +{dailyMission.rewardPoints.toLocaleString()} PTS
                  </span>
                </div>

                <div className="flex items-center justify-between text-[9px] text-gray-400">
                  <span>PROGRESS: {dailyMission.currentProgress} / {dailyMission.targetValue}</span>
                  <button
                    onClick={() => toggleMissionDrawer(true)}
                    className="text-[#E056FD] hover:text-white font-bold underline cursor-pointer"
                  >
                    MISSION PANEL [M]
                  </button>
                </div>
              </div>
              {/* NEW CODE ADDITIONS END: START SCREEN DAILY DIRECTIVE WIDGET */}

              <TopRunnersList />
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {isGameOver && (
        <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="border-2 border-[#FF003C] p-8 max-w-md w-full bg-black shadow-[0_0_40px_#FF003Caa]">
            <h1 className="text-4xl font-black text-[#FF003C] tracking-tighter italic mb-1 animate-pulse">
              SYNC LOST
            </h1>
            <p className="text-xs text-[#E056FD] tracking-[0.2em] uppercase mb-6">
              Dimension Boundary Breach
            </p>

            {/* NEW CODE ADDITIONS START: LOCAL STORAGE GAME OVER STATS WITH COMBO HUD */}
            <div className="mb-6 space-y-3">
              {/* Record Notification */}
              {Math.floor(distance) >= Math.floor(bestDistance) && Math.floor(distance) > 0 && (
                <div className="py-1 px-3 bg-[#FF003C] text-black text-[10px] font-black tracking-widest flex items-center justify-center gap-1.5 shadow-[0_0_12px_#FF003C]">
                  <Flame className="w-3.5 h-3.5 fill-black" />
                  NEW BEST DISTANCE RECORD REACHED
                </div>
              )}

              {/* Best Distance vs Current Distance Box */}
              <div className="grid grid-cols-2 gap-3 text-left font-mono">
                <div className="p-3 bg-black border border-[#FF003C] shadow-[0_0_15px_#FF003C33]">
                  <div className="flex items-center gap-1 text-[9px] text-[#FF003C] tracking-widest uppercase mb-1">
                    <Compass className="w-3 h-3" />
                    DISTANCE
                  </div>
                  <div className="text-xl font-black text-white tracking-tight">
                    {Math.floor(distance)} <span className="text-xs text-gray-400 font-normal">M</span>
                  </div>
                </div>

                <div className="p-3 bg-black border border-[#E056FD] shadow-[0_0_15px_#E056FD33]">
                  <div className="flex items-center gap-1 text-[9px] text-[#E056FD] tracking-widest uppercase mb-1">
                    <Trophy className="w-3 h-3" />
                    BEST DISTANCE
                  </div>
                  <div className="text-xl font-black text-[#E056FD] tracking-tight">
                    {Math.floor(bestDistance)} <span className="text-xs text-purple-300 font-normal">M</span>
                  </div>
                </div>
              </div>

              {/* Complementary Stats Breakdown with Max Combo */}
              <div className="border border-[#333] bg-black/60 p-3 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-[11px] tracking-wider">RUN SCORE</span>
                  <span className="text-white font-bold tracking-widest">{score.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-[11px] tracking-wider">TOP SCORE</span>
                  <span className="text-gray-300 font-bold tracking-widest">{topScore.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-[11px] tracking-wider flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[#FF003C]" />
                    MAX COMBO STREAK
                  </span>
                  <span className="text-[#FF003C] font-bold tracking-widest">
                    {maxCombo} ORBS {maxCombo >= 10 ? `[${comboRank}]` : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-[11px] tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#E056FD]" />
                    ORBS RECOVERED
                  </span>
                  <span className="text-[#E056FD] font-bold tracking-widest">{orbs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-[11px] tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3 text-[#39FF14]" />
                    DIMENSION TIER
                  </span>
                  <span className="text-[#39FF14] font-bold tracking-widest">
                    TIER {Math.min(5, Math.floor(distance / 2000) + 1)} // {getDimensionTierPreset(distance).name.split('//')[1]?.trim() || 'VOID'}
                  </span>
                </div>
              </div>
            </div>
            {/* NEW CODE ADDITIONS END: LOCAL STORAGE GAME OVER STATS WITH COMBO HUD */}

            <Button onClick={handleReboot} className="w-full py-4 text-base">
              REBOOT SYSTEM
            </Button>
          </div>
        </div>
      )}

      {/* DEVICE CONTROLS OVERLAY */}
      {isStarted && !isGameOver && (
        <>
          <VirtualJoystick />
          <div className="fixed bottom-8 right-8 z-50 hidden md:block">
            <ControlSettings />
          </div>
        </>
      )}
    </div>
  );
};

export default App;