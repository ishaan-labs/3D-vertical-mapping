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
  showGreenEcosystem = true
}: {
  onSelectItem: (item: UtilityItem) => void;
  activeLayers: Record<string, boolean>;
  highlightViolations?: boolean;
  showGreenEcosystem?: boolean;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredTag, setHoveredTag] = useState<{ name: string; depth: string; x: number; y: number } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xedf2f7); // Crisp civic daylit sky
    scene.fog = new THREE.Fog(0xedf2f7, 50, 180);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 1000);
    camera.position.set(42, 20, 48);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.08;
    controls.target.set(0, 4, 0);

    // Natural Sunlight Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xfffaed, 1.8);
    sun.position.set(50, 75, 40);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    scene.add(sun);

    const skyFill = new THREE.DirectionalLight(0xb0c4de, 0.6);
    skyFill.position.set(-30, 20, -20);
    scene.add(skyFill);

    const interactiveMeshes: THREE.Mesh[] = [];

    // --- 1. Institutional Base Grid & Paved Surface (Z = 0m) ---
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 });
    const ground = new THREE.Mesh(new THREE.BoxGeometry(48, 0.4, 28), groundMat);
    ground.position.set(0, -0.2, 0);
    ground.receiveShadow = true;
    scene.add(ground);

    const cadastralGrid = new THREE.GridHelper(48, 24, 0x94a3b8, 0xcbd5e1);
    cadastralGrid.position.set(0, 0.02, 0);
    scene.add(cadastralGrid);

    // Asphalt Municipal Roadway
    const road = new THREE.Mesh(
      new THREE.BoxGeometry(46, 0.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 })
    );
    road.position.set(0, 0.05, 5);
    road.receiveShadow = true;
    scene.add(road);

    // Road Markings
    const yMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const yLine = new THREE.Mesh(new THREE.PlaneGeometry(46, 0.15), yMat);
    yLine.rotation.x = -Math.PI / 2;
    yLine.position.set(0, 0.16, 5);
    scene.add(yLine);

    // Paver Sidewalk
    const sidewalk = new THREE.Mesh(
      new THREE.BoxGeometry(46, 0.35, 10),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.6 })
    );
    sidewalk.position.set(0, 0.1, -4.5);
    sidewalk.receiveShadow = true;
    scene.add(sidewalk);

    // --- 2. Subsurface Retaining Chamber (-12m Depth) ---
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
    const backSoil = new THREE.Mesh(new THREE.BoxGeometry(46, 12, 1), soilMat);
    backSoil.position.set(0, -6, -9.5);
    scene.add(backSoil);

    const bedrock = new THREE.Mesh(new THREE.BoxGeometry(46, 1, 18), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    bedrock.position.set(0, -12, -0.5);
    scene.add(bedrock);

    // --- 3. Institutional Buildings (Architectural BIM Quality) ---
    const createCivicBuilding = (
      x: number, z: number, w: number, d: number,
      sanctionedFloors: number, ghostFloors: number,
      name: string, ulpin: string
    ) => {
      const bGroup = new THREE.Group();
      const floorH = 2.4;
      const slabMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        metalness: 0.4,
        roughness: 0.1,
        transparent: true,
        opacity: 0.75
      });
      const frameMat = new THREE.LineBasicMaterial({ color: 0x64748b });

      // Core Structure
      const core = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.4, (sanctionedFloors + ghostFloors) * floorH, d * 0.4),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 })
      );
      core.position.set(0, ((sanctionedFloors + ghostFloors) * floorH) / 2, 0);
      bGroup.add(core);

      // Floor Slabs
      for (let f = 0; f < sanctionedFloors; f++) {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), slabMat);
        slab.position.set(0, f * floorH + 0.1, 0);
        bGroup.add(slab);

        const glass = new THREE.Mesh(new THREE.BoxGeometry(w - 0.1, floorH - 0.2, d - 0.1), glassMat);
        glass.position.set(0, f * floorH + floorH / 2, 0);
        bGroup.add(glass);

        const frame = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(w, floorH - 0.2, d)),
          frameMat
        );
        frame.position.set(0, f * floorH + floorH / 2, 0);
        bGroup.add(frame);
      }

      // Unauthorized Ghost Floors (Clearly Tagged in Municipal Crimson)
      if (highlightViolations && ghostFloors > 0) {
        const ghostMat = new THREE.MeshStandardMaterial({
          color: 0xdc2626,
          transparent: true,
          opacity: 0.65,
          roughness: 0.2
        });

        for (let g = 0; g < ghostFloors; g++) {
          const currentF = sanctionedFloors + g;
          const ghostBox = new THREE.Mesh(new THREE.BoxGeometry(w, floorH - 0.2, d), ghostMat);
          ghostBox.position.set(0, currentF * floorH + floorH / 2, 0);

          const redWire = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(w + 0.1, floorH - 0.15, d + 0.1)),
            new THREE.LineBasicMaterial({ color: 0xb91c1c, linewidth: 2 })
          );
          ghostBox.add(redWire);
          bGroup.add(ghostBox);
        }
      }

      // Rooftop Green Terrace
      if (showGreenEcosystem) {
        const garden = new THREE.Mesh(
          new THREE.BoxGeometry(w - 0.3, 0.2, d - 0.3),
          new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 })
        );
        garden.position.set(0, (sanctionedFloors + ghostFloors) * floorH + 0.1, 0);
        bGroup.add(garden);
      }

      const totalH = (sanctionedFloors + ghostFloors) * floorH;
      bGroup.position.set(x, 0.2, z);

      bGroup.userData = {
        id: `BLD-${x}`,
        name: name,
        category: ghostFloors > 0 ? "GHOST_FLOOR" : "BUILDING",
        depth: `+0.0m to +${totalH.toFixed(1)}m (MSL)`,
        status: ghostFloors > 0 ? "ALERT" : "CLEAR",
        ulpin: ulpin,
        details: ghostFloors > 0
          ? `FAR BREACH: ${ghostFloors} Unauthorized Floors detected above sanctioned height. Recovery: ₹4.82 Cr.`
          : `ISO 19152 Compliant Cadastral Strata Record.`
      } as UtilityItem;

      scene.add(bGroup);

      const hitMesh = new THREE.Mesh(new THREE.BoxGeometry(w, totalH + 2, d), new THREE.MeshBasicMaterial({ visible: false }));
      hitMesh.position.set(x, totalH / 2 + 0.2, z);
      hitMesh.userData = bGroup.userData;
      scene.add(hitMesh);
      interactiveMeshes.push(hitMesh);
    };

    createCivicBuilding(-13, -5, 9, 7, 6, 2, "Plot 42/A Commercial Plaza", "IND338421049280-V000540-A1");
    createCivicBuilding(0, -5, 11, 7, 8, 0, "DoLR State Cadastral Headquarters", "IND338421049280-V000720-B2");
    createCivicBuilding(13, -5, 8, 7, 5, 1, "Metropolitan Financial Exchange", "IND338421049280-V000420-C3");

    // --- 4. Subsurface Transit & Utility Pipelines ---
    const tunnel = new THREE.Mesh(
      new THREE.BoxGeometry(46, 3.8, 6.5),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8, side: THREE.DoubleSide })
    );
    tunnel.position.set(0, -8.5, 4.5);
    scene.add(tunnel);

    const train = new THREE.Mesh(
      new THREE.BoxGeometry(9, 2.2, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3 })
    );
    train.position.set(0, -8.6, 4.5);
    scene.add(train);

    const createPipe = (points: [number, number, number][], color: number, radius: number) => {
      const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 64, radius, 16, false),
        new THREE.MeshStandardMaterial({ color, roughness: 0.3 })
      );
      scene.add(tube);
    };

    if (activeLayers.TELECOM) createPipe([[-23, -1.8, 7], [-8, -1.8, 6], [1, -2.2, 2], [23, -2.2, 0]], 0xdb2777, 0.28);
    if (activeLayers.WATER) createPipe([[-23, -3.2, 5], [-6, -3.2, 5], [3, -3.6, 7], [23, -3.6, 7]], 0x16a34a, 0.42);

    // --- 5. Natural Trees with Subsurface Root Buffer ---
    const createNaturalTree = (x: number, z: number, r: number) => {
      const tGroup = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.3, 2.8, 8),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 })
      );
      trunk.position.set(0, 1.4, 0);
      tGroup.add(trunk);

      const canopy = new THREE.Mesh(
        new THREE.DodecahedronGeometry(r, 1),
        new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 })
      );
      canopy.position.set(0, 3.4, 0);
      tGroup.add(canopy);

      // Root exclusion zone
      const rootCage = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0x16a34a, wireframe: true, transparent: true, opacity: 0.25 })
      );
      rootCage.position.set(0, -1.5, 0);
      tGroup.add(rootCage);

      tGroup.position.set(x, 0.1, z);
      scene.add(tGroup);
    };

    if (showGreenEcosystem) {
      createNaturalTree(-19, -1, 1.6);
      createNaturalTree(-7, -1, 1.9);
      createNaturalTree(6, -1, 1.7);
      createNaturalTree(19, -1, 1.8);
    }

    // --- Raycasting ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

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

    renderer.domElement.addEventListener("click", handleClick);

    // Animation Loop
    let reqId: number;
    const clock = new THREE.Clock();
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      train.position.x = ((t * 7) % 52) - 26;
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
      renderer.domElement.removeEventListener("click", handleClick);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [activeLayers, highlightViolations, showGreenEcosystem, onSelectItem]);

  return <div ref={mountRef} className="w-full h-full min-h-[520px] cursor-grab active:cursor-grabbing rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100" />;
}
