import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from './store/useGameStore';
import { useInputStore } from './store/useInputStore';
import { useUniversalInput } from './hooks/useUniversalInput';
import { useGameLoop } from './hooks/useGameLoop';
import { Navbar } from './components/layout/Navbar';
import { Scanlines } from './components/layout/Scanlines';
import { Watermark } from './components/layout/Watermark';
import { Button } from './components/common/Button';
import { ControlSettings } from './components/UI/ControlSettings';
import { VirtualJoystick } from './components/UI/VirtualJoystick';
import { AudioSynth as audioSynth } from './services/AudioSynth';

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
    collectOrb,
    takeDamage,
  } = useGameStore();

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

  // World objects
  const gridFloorRef = useRef<THREE.GridHelper | null>(null);
  const obstaclesGroupRef = useRef<THREE.Group | null>(null);
  const collectiblesGroupRef = useRef<THREE.Group | null>(null);

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
  };

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

    const dirLight = new THREE.DirectionalLight(0xff003c, 1.2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const purplePointLight = new THREE.PointLight(0xe056fd, 2, 30);
    purplePointLight.position.set(0, 5, -5);
    scene.add(purplePointLight);

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

    scene.add(playerGroup);
    playerGroupRef.current = playerGroup;

    // Dimension Side Pillars
    for (let i = 0; i < 30; i++) {
      const pGeo = new THREE.BoxGeometry(1, 15, 1);
      const pMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xff003c : 0xe056fd,
        wireframe: true,
      });
      const leftPillar = new THREE.Mesh(pGeo, pMat);
      leftPillar.position.set(-8, 5, -i * 12);
      scene.add(leftPillar);

      const rightPillar = new THREE.Mesh(pGeo, pMat);
      rightPillar.position.set(8, 5, -i * 12);
      scene.add(rightPillar);
    }

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
    obsGroup.position.z = zTarget; // <--- CRITICAL FIX: Group handles the Z depth
    let obsGeo: THREE.BufferGeometry;
    let obsMat: THREE.Material = new THREE.MeshStandardMaterial({
      color: 0xff003c,
      emissive: 0x990022,
    });

    if (type === 'BARRIER-LOW') {
      obsGeo = new THREE.BoxGeometry(2.2, 1.0, 0.6);
      const mesh = new THREE.Mesh(obsGeo, obsMat);
      mesh.position.set(chosenLane * 3.0, 0.5, 0); // Z is 0 relative to the group
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

    obsGroup.userData = { lane: chosenLane, type };
    obstaclesGroupRef.current.add(obsGroup);

    // Collectible Orb in a different lane
    const orbLane = lanes.find((l) => l !== chosenLane) || 0;
    const orbGeo = new THREE.SphereGeometry(0.4, 12, 12);
    const orbMat = new THREE.MeshBasicMaterial({ color: 0xe056fd, wireframe: true });
    const orbMesh = new THREE.Mesh(orbGeo, orbMat);
    orbMesh.position.set(orbLane * 3.0, 1.2, zTarget);
    orbMesh.userData = { lane: orbLane, collected: false };
    collectiblesGroupRef.current.add(orbMesh);
  };

  // Main 3D Game Loop
  useGameLoop((delta) => {
    if (!isStarted || isGameOver) return;

    updateTick(delta);

    animTime.current += delta * (speed * 0.4);

    // Target X Position based on Lane (-1, 0, 1)
    const targetX = playerLane * 3.0;
    laneX.current = THREE.MathUtils.lerp(laneX.current, targetX, 0.2);

    // Jumping Physics
    if (isJumping) {
      if (jumpY.current === 0) {
        jumpVY.current = 14.0;
        audioSynth.playJump();
      }
      jumpY.current += jumpVY.current * delta;
      jumpVY.current -= 32.0 * delta; // Gravity

      if (jumpY.current <= 0) {
        jumpY.current = 0;
        jumpVY.current = 0;
        setJumping(false);
      }
    }

    // Sliding Physics & Native Delta Timer (Replaces setTimeout leak)
    let playerScaleY = 1.0;
    if (isSliding) {
      if (slideTimer.current <= 0) slideTimer.current = 0.6; // 600ms slide
      playerScaleY = 0.4;
      slideTimer.current -= delta;

      if (slideTimer.current <= 0) {
        slideTimer.current = 0;
        setSliding(false);
      }
    } else {
      slideTimer.current = 0;
    }

    // Update Player Mesh Position
    if (playerGroupRef.current) {
      playerGroupRef.current.position.x = laneX.current;
      playerGroupRef.current.position.y = jumpY.current;
      playerGroupRef.current.scale.y = playerScaleY;

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
    }

    // Move Grid Floor
    if (gridFloorRef.current) {
      gridFloorRef.current.position.z += speed * delta;
      if (gridFloorRef.current.position.z > 0) {
        gridFloorRef.current.position.z = -20;
      }
    }

    // Move & Check Obstacles
    if (obstaclesGroupRef.current) {
      const zSpeed = speed * delta;

      for (let i = obstaclesGroupRef.current.children.length - 1; i >= 0; i--) {
        const obs = obstaclesGroupRef.current.children[i];
        obs.position.z += zSpeed;

        // Collision Check
        const distZ = Math.abs(obs.position.z - 0);
        const sameLane = playerLane === obs.userData.lane;

        if (distZ < 0.8 && sameLane) {
          const type = obs.userData.type;
          let hit = false;

          if (type === 'BARRIER-LOW' && jumpY.current < 1.0) hit = true;
          if (type === 'BARRIER-HIGH' && !isSliding) hit = true;
          if (type === 'PILLAR') hit = true;

          if (hit) {
            audioSynth.playHit();
            takeDamage(35);
            obstaclesGroupRef.current.remove(obs);
          }
        }

        // Cleanup offscreen
        if (obs.position.z > 10) {
          obstaclesGroupRef.current.remove(obs);
        }
      }

      // Spawn new obstacles ahead
      if (
        obstaclesGroupRef.current.children.length === 0 ||
        obstaclesGroupRef.current.children[obstaclesGroupRef.current.children.length - 1].position.z > -120
      ) {
        spawnEntities(-180);
      }
    }

    // Move & Check Collectibles
    if (collectiblesGroupRef.current) {
      for (let i = collectiblesGroupRef.current.children.length - 1; i >= 0; i--) {
        const orb = collectiblesGroupRef.current.children[i];
        orb.position.z += speed * delta;
        orb.rotation.y += delta * 3;

        const distZ = Math.abs(orb.position.z - 0);
        const sameLane = playerLane === orb.userData.lane;

        if (distZ < 1.2 && sameLane && !orb.userData.collected) {
          orb.userData.collected = true;
          audioSynth.playCollect();
          collectOrb();
          collectiblesGroupRef.current.remove(orb);
        }

        if (orb.position.z > 10) {
          collectiblesGroupRef.current.remove(orb);
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

      {/* 3D RENDER CANVAS */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

      {/* START SCREEN */}
      {!isStarted && !isGameOver && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="border-2 border-[#FF003C] p-8 max-w-md w-full bg-black shadow-[0_0_30px_#FF003C66]">
            <h1 className="text-4xl font-black text-white tracking-tighter italic mb-2">
              VOID <span className="text-[#FF003C]">NINJA</span>
            </h1>
            <p className="text-[10px] text-[#E056FD] tracking-[0.3em] uppercase mb-8">
              Endless Dimension Runner // v3.0
            </p>

            <div className="space-y-3 mb-8 text-left text-xs text-gray-400 border-t border-b border-[#333] py-4">
              <div className="flex justify-between">
                <span>LANE MOVE</span>
                <span className="text-white">[A/D] or [ARROWS]</span>
              </div>
              <div className="flex justify-between">
                <span>JUMP</span>
                <span className="text-white">[W] or [UP]</span>
              </div>
              <div className="flex justify-between">
                <span>SLIDE</span>
                <span className="text-white">[S] or [DOWN]</span>
              </div>
            </div>

            <Button onClick={handleStart} className="w-full py-4 text-base">
              INITIATE RUN
            </Button>
          </div>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {isGameOver && (
        <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="border-2 border-[#FF003C] p-8 max-w-md w-full bg-black shadow-[0_0_40px_#FF003Caa]">
            <h1 className="text-4xl font-black text-[#FF003C] tracking-tighter italic mb-2 animate-pulse">
              SYNC LOST
            </h1>
            <p className="text-xs text-[#E056FD] tracking-[0.2em] uppercase mb-6">
              Dimension Boundary Breach
            </p>

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