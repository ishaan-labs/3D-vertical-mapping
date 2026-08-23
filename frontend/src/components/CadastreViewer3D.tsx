"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

export interface UtilityItem {
  id: string;
  name: string;
  category: "POWER" | "WATER" | "GAS" | "SEWER" | "TELECOM" | "TRANSIT" | "BUILDING" | "AIRSPACE" | "GHOST_FLOOR" | "ECO_TREE";
  depth: string;
  status: "ACTIVE" | "ALERT" | "CLEAR";
  ulpin: string;
  details: string;
}

export default function CadastreViewer3D({
  onSelectItem,
  activeLayers,
  highlightViolations = true,
  showDroneCorridor = true,
  showGreenEcosystem = true
}: {
  onSelectItem: (item: UtilityItem) => void;
  activeLayers: Record<string, boolean>;
  highlightViolations?: boolean;
  showDroneCorridor?: boolean;
  showGreenEcosystem?: boolean;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredTag, setHoveredTag] = useState<{ name: string; depth: string; x: number; y: number } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040814);
    scene.fog = new THREE.FogExp2(0x040814, 0.007);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 1000);
    camera.position.set(44, 18, 50);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.12;
    controls.target.set(0, 4, 0);

    // Dynamic Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.2);
    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xffffff, 2.6);
    sun.position.set(50, 70, 40);
    sun.castShadow = true;
    scene.add(sun);

    const cyanRim = new THREE.DirectionalLight(0x06b6d4, 1.5);
    cyanRim.position.set(-35, 15, -25);
    scene.add(cyanRim);

    const interactiveMeshes: THREE.Mesh[] = [];

    // --- 1. Tactical Holographic Ground Grid (Z = 0m) ---
    const groundGrid = new THREE.GridHelper(60, 30, 0x10b981, 0x1e293b);
    groundGrid.position.set(0, 0.05, 0);
    scene.add(groundGrid);

    // Asphalt Main Boulevard
    const road = new THREE.Mesh(
      new THREE.BoxGeometry(46, 0.3, 10),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 })
    );
    road.position.set(0, 0, 4);
    road.receiveShadow = true;
    scene.add(road);

    // Glowing Yellow Lane Dividers
    const yMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const yLine = new THREE.Mesh(new THREE.PlaneGeometry(46, 0.15), yMat);
    yLine.rotation.x = -Math.PI / 2;
    yLine.position.set(0, 0.18, 4);
    scene.add(yLine);

    // Pedestrian Promenade
    const sidewalk = new THREE.Mesh(
      new THREE.BoxGeometry(46, 0.5, 12),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 })
    );
    sidewalk.position.set(0, 0.15, -7);
    sidewalk.receiveShadow = true;
    scene.add(sidewalk);

    // --- 2. Subsurface Geological Matrix (-15m Bedrock) ---
    const subGrid = new THREE.GridHelper(46, 23, 0x06b6d4, 0x0f172a);
    subGrid.position.set(0, -12.9, -2);
    scene.add(subGrid);

    const retainingWallMat = new THREE.MeshStandardMaterial({ color: 0x090f1e, roughness: 0.9 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(46, 13, 1), retainingWallMat);
    backWall.position.set(0, -6.5, -13);
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1, 13, 22), retainingWallMat);
    leftWall.position.set(-23, -6.5, -2);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(1, 13, 22), retainingWallMat);
    rightWall.position.set(23, -6.5, -2);
    scene.add(rightWall);

    // --- 3. LoD2.8 Architectural Strata Towers ---
    const createStrataTower = (
      x: number, z: number, w: number, d: number,
      sanctionedFloors: number, ghostFloors: number,
      name: string, ulpin: string
    ) => {
      const bGroup = new THREE.Group();
      const floorH = 2.4;
      const slabMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.75
      });

      // Internal Concrete Elevator Core
      const core = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.35, (sanctionedFloors + ghostFloors) * floorH, d * 0.35),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 })
      );
      core.position.set(0, ((sanctionedFloors + ghostFloors) * floorH) / 2, 0);
      bGroup.add(core);

      // Floor Slabs & Windows
      for (let f = 0; f < sanctionedFloors; f++) {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(w, 0.22, d), slabMat);
        slab.position.set(0, f * floorH + 0.11, 0);
        bGroup.add(slab);

        const glass = new THREE.Mesh(new THREE.BoxGeometry(w - 0.1, floorH - 0.22, d - 0.1), glassMat);
        glass.position.set(0, f * floorH + floorH / 2, 0);
        bGroup.add(glass);

        const frame = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(w, floorH - 0.2, d)),
          new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 })
        );
        frame.position.set(0, f * floorH + floorH / 2, 0);
        bGroup.add(frame);
      }

      // Unauthorized Ghost Floors (Fluorescent Red Violation Envelopes)
      if (highlightViolations && ghostFloors > 0) {
        const ghostMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xdc2626,
          emissiveIntensity: 0.7,
          transparent: true,
          opacity: 0.75
        });

        for (let g = 0; g < ghostFloors; g++) {
          const currentF = sanctionedFloors + g;
          const ghostBox = new THREE.Mesh(new THREE.BoxGeometry(w, floorH - 0.2, d), ghostMat);
          ghostBox.position.set(0, currentF * floorH + floorH / 2, 0);

          const redWire = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(w + 0.1, floorH - 0.15, d + 0.1)),
            new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 })
          );
          ghostBox.add(redWire);
          bGroup.add(ghostBox);
        }
      }

      // Rooftop Green Garden
      if (showGreenEcosystem) {
        const garden = new THREE.Mesh(
          new THREE.BoxGeometry(w - 0.4, 0.25, d - 0.4),
          new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.3 })
        );
        garden.position.set(0, (sanctionedFloors + ghostFloors) * floorH + 0.15, 0);
        bGroup.add(garden);
      }

      const totalH = (sanctionedFloors + ghostFloors) * floorH;
      bGroup.position.set(x, 0.35, z);

      bGroup.userData = {
        id: `BLD-${x}`,
        name: name,
        category: ghostFloors > 0 ? "GHOST_FLOOR" : "BUILDING",
        depth: `+0.0m to +${totalH.toFixed(1)}m (MSL)`,
        status: ghostFloors > 0 ? "ALERT" : "CLEAR",
        ulpin: ulpin,
        details: ghostFloors > 0
          ? `BYLAW VIOLATION: ${ghostFloors} Unauthorized Ghost Floors detected. Uncollected Property Tax: ₹14.8 Lakhs/yr.`
          : `ISO 19152 Compliant Volumetric Strata Asset.`
      } as UtilityItem;

      scene.add(bGroup);

      const hitMesh = new THREE.Mesh(new THREE.BoxGeometry(w, totalH + 3, d), new THREE.MeshBasicMaterial({ visible: false }));
      hitMesh.position.set(x, (totalH + 3) / 2 + 0.35, z);
      hitMesh.userData = bGroup.userData;
      scene.add(hitMesh);
      interactiveMeshes.push(hitMesh);
    };

    createStrataTower(-14, -7, 10, 8, 6, 2, "Metro Tower Plaza (Block A)", "IND338421049280-V000540-A1");
    createStrataTower(0, -7, 12, 8, 8, 0, "DoLR State Cadastral Twin HQ", "IND338421049280-V000720-B2");
    createStrataTower(14, -7, 9, 8, 5, 1, "Commercial Exchange (Block C)", "IND338421049280-V000420-C3");

    // --- 4. Subsurface Metro Transit Box & Animated High-Speed Train ---
    const tunnel = new THREE.Mesh(
      new THREE.BoxGeometry(46, 4.2, 7.5),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.6, side: THREE.DoubleSide })
    );
    tunnel.position.set(0, -9.5, 4);
    scene.add(tunnel);

    const trainGroup = new THREE.Group();
    const carBody = new THREE.Mesh(
      new THREE.BoxGeometry(10, 2.4, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.2, metalness: 0.7 })
    );
    const headLight = new THREE.PointLight(0xa855f7, 4, 12);
    headLight.position.set(5.2, 0, 0);
    trainGroup.add(carBody);
    trainGroup.add(headLight);
    trainGroup.position.set(0, -9.8, 4);
    scene.add(trainGroup);

    // --- 5. Subsurface Utility Networks & Flowing Laser Particles ---
    const createPipeline = (points: [number, number, number][], color: number, radius: number) => {
      const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
      const tubeMesh = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 64, radius, 16, false),
        new THREE.MeshStandardMaterial({ color, roughness: 0.2, metalness: 0.5, emissive: color, emissiveIntensity: 0.5 })
      );
      scene.add(tubeMesh);
      return curve;
    };

    let optCurve: THREE.CatmullRomCurve3 | null = null;
    let waterCurve: THREE.CatmullRomCurve3 | null = null;
    if (activeLayers.TELECOM) optCurve = createPipeline([[-23, -1.8, 7], [-8, -1.8, 6], [1, -2.2, 2], [23, -2.2, 0]], 0xec4899, 0.32);
    if (activeLayers.WATER) waterCurve = createPipeline([[-23, -3.4, 5], [-6, -3.4, 5], [3, -3.8, 7], [23, -3.8, 7]], 0x84cc16, 0.48);
    if (activeLayers.GAS) createPipeline([[-23, -5.0, 1], [-4, -5.0, 1], [6, -5.4, 3], [23, -5.4, 4.5]], 0xfacc15, 0.42);

    // Pulsing Laser Orbs
    const optOrb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    scene.add(optOrb);
    const waterOrb = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), new THREE.MeshBasicMaterial({ color: 0xd9f99d }));
    scene.add(waterOrb);

    // --- 6. 3D Trees with Subsurface Root Envelopes ---
    const createTree = (x: number, z: number, crownRadius: number) => {
      const treeGroup = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, 3.2, 8), new THREE.MeshStandardMaterial({ color: 0x451a03 }));
      trunk.position.set(0, 1.6, 0);
      treeGroup.add(trunk);

      const canopy = new THREE.Mesh(
        new THREE.DodecahedronGeometry(crownRadius, 1),
        new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5, emissive: 0x059669, emissiveIntensity: 0.3 })
      );
      canopy.position.set(0, 3.8, 0);
      treeGroup.add(canopy);

      const rootMat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.4 });
      const rootBulb = new THREE.Mesh(new THREE.SphereGeometry(1.9, 12, 12), rootMat);
      rootBulb.position.set(0, -1.6, 0);
      treeGroup.add(rootBulb);

      treeGroup.position.set(x, 0.35, z);
      scene.add(treeGroup);

      const hit = new THREE.Mesh(new THREE.CylinderGeometry(crownRadius, crownRadius, 7), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.set(x, 2, z);
      hit.userData = {
        id: `TREE-${x}`,
        name: "Heritage Neem Canopy (Urban Bio-Shield)",
        category: "ECO_TREE",
        depth: "-2.5m (Root Zone) to +6.0m (Canopy)",
        status: "ACTIVE",
        ulpin: "IND338421049280-E002506-T1",
        details: "Protected urban tree canopy. Sequestration: 22.5 kg CO2/yr. Mandatory 3m root clearance."
      } as UtilityItem;
      scene.add(hit);
      interactiveMeshes.push(hit);
    };

    if (showGreenEcosystem) {
      createTree(-20, -2, 1.8);
      createTree(-7, -2, 2.1);
      createTree(7, -2, 1.9);
      createTree(20, -2, 2.0);
    }

    // --- 7. Raycaster for Hover & Click ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, true);

      if (hits.length > 0) {
        let target = hits[0].object;
        while (target && !target.userData?.name && target.parent) {
          target = target.parent as THREE.Mesh;
        }
        if (target && target.userData?.name) {
          setHoveredTag({
            name: target.userData.name,
            depth: target.userData.depth,
            x: e.clientX - rect.left + 15,
            y: e.clientY - rect.top - 15
          });
          return;
        }
      }
      setHoveredTag(null);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, true);

      if (hits.length > 0) {
        let target = hits[0].object;
        while (target && !target.userData?.name && target.parent) {
          target = target.parent as THREE.Mesh;
        }
        if (target && target.userData?.name) {
          onSelectItem(target.userData as UtilityItem);
        }
      }
    };

    renderer.domElement.addEventListener("mousemove", handlePointerMove);
    renderer.domElement.addEventListener("click", handleClick);

    // Animation Loop
    let reqId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Subway Train Movement
      trainGroup.position.x = ((t * 8) % 56) - 28;

      // Laser Particle Flow
      if (optCurve) {
        const pt = optCurve.getPoint((t * 0.3) % 1);
        optOrb.position.copy(pt);
      }
      if (waterCurve) {
        const pt = waterCurve.getPoint((t * 0.2) % 1);
        waterOrb.position.copy(pt);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("mousemove", handlePointerMove);
      renderer.domElement.removeEventListener("click", handleClick);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [activeLayers, highlightViolations, showDroneCorridor, showGreenEcosystem, onSelectItem]);

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing rounded-2xl overflow-hidden" />

      {/* Floating 3D Hover Tag Tooltip */}
      {hoveredTag && (
        <div
          className="absolute z-20 pointer-events-none bg-[#050b18]/95 border border-cyan-500/50 p-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono"
          style={{ left: hoveredTag.x, top: hoveredTag.y }}
        >
          <div className="font-bold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            {hoveredTag.name}
          </div>
          <div className="text-[10px] text-cyan-400 mt-0.5">{hoveredTag.depth}</div>
        </div>
      )}
    </div>
  );
}
