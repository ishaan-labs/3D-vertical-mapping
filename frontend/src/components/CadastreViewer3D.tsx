"use client";

import React, { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060b17);
    scene.fog = new THREE.FogExp2(0x060b17, 0.01);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(38, 14, 44);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.target.set(0, 3, 0);

    const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.1);
    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.position.set(45, 60, 30);
    sun.castShadow = true;
    scene.add(sun);

    const interactiveMeshes: THREE.Mesh[] = [];

    // Roadway & Sidewalk
    const road = new THREE.Mesh(new THREE.BoxGeometry(42, 0.4, 9), new THREE.MeshStandardMaterial({ color: 0x181e29 }));
    road.position.set(0, 0, 3);
    scene.add(road);

    const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(42, 0.7, 11), new THREE.MeshStandardMaterial({ color: 0x475569 }));
    sidewalk.position.set(0, 0.2, -7);
    scene.add(sidewalk);

    // Subsurface Soil Retaining Chamber
    const earthMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const backSoil = new THREE.Mesh(new THREE.BoxGeometry(42, 13, 1), earthMat);
    backSoil.position.set(0, -6.5, -12.5);
    scene.add(backSoil);

    const bedrock = new THREE.Mesh(new THREE.BoxGeometry(42, 1, 20), new THREE.MeshStandardMaterial({ color: 0x020617 }));
    bedrock.position.set(0, -13, -3);
    scene.add(bedrock);

    // --- 3D Trees with Subsurface Root Exclusion Chambers ---
    const createTree = (x: number, z: number, crownRadius: number) => {
      const treeGroup = new THREE.Group();

      // Trunk
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21 });
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 3.5, 8), trunkMat);
      trunk.position.set(0, 1.75, 0);
      treeGroup.add(trunk);

      // Foliage Canopy
      const leavesMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        roughness: 0.6,
        emissive: 0x059669,
        emissiveIntensity: 0.25
      });
      const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(crownRadius, 1), leavesMat);
      canopy.position.set(0, 4.2, 0);
      treeGroup.add(canopy);

      // Subsurface Root Zone Bulb (-0.5m to -3.0m)
      const rootMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        wireframe: true,
        transparent: true,
        opacity: 0.35
      });
      const rootBulb = new THREE.Mesh(new THREE.SphereGeometry(1.8, 12, 12), rootMat);
      rootBulb.position.set(0, -1.5, 0);
      treeGroup.add(rootBulb);

      treeGroup.position.set(x, 0.35, z);
      treeGroup.userData = {
        id: `TREE-${x}`,
        name: "Heritage Neem Canopy (Urban Bio-Shield)",
        category: "ECO_TREE",
        depth: "-2.5m (Root Zone) to +6.5m (Canopy)",
        status: "ACTIVE",
        ulpin: "IND338421049280-E002506-T1",
        details: "Protected urban tree canopy. Sequestration: 22.5 kg CO2/yr. Mandatory 3m subterranean root clearance."
      } as UtilityItem;

      scene.add(treeGroup);

      const hit = new THREE.Mesh(new THREE.CylinderGeometry(crownRadius, crownRadius, 8), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.set(x, 2, z);
      hit.userData = treeGroup.userData;
      scene.add(hit);
      interactiveMeshes.push(hit);
    };

    if (showGreenEcosystem) {
      createTree(-18, -2.5, 1.8);
      createTree(-6, -2.5, 2.2);
      createTree(8, -2.5, 1.9);
      createTree(19, -2.5, 2.1);
    }

    // High-Rise Buildings
    const createBuilding = (x: number, z: number, w: number, d: number, sanctioned: number, ghost: number, name: string) => {
      const bGroup = new THREE.Group();
      const floorH = 2.4;
      const coreMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9 });
      const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.85, roughness: 0.12, transparent: true, opacity: 0.82 });

      for (let f = 0; f < sanctioned; f++) {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(w, 0.25, d), coreMat);
        slab.position.set(0, f * floorH + 0.12, 0);
        bGroup.add(slab);

        const glass = new THREE.Mesh(new THREE.BoxGeometry(w - 0.15, floorH - 0.25, d - 0.15), glassMat);
        glass.position.set(0, f * floorH + floorH / 2, 0);
        bGroup.add(glass);
      }

      if (highlightViolations && ghost > 0) {
        const ghostMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.6, transparent: true, opacity: 0.75 });
        for (let g = 0; g < ghost; g++) {
          const currentF = sanctioned + g;
          const ghostBox = new THREE.Mesh(new THREE.BoxGeometry(w, floorH - 0.2, d), ghostMat);
          ghostBox.position.set(0, currentF * floorH + floorH / 2, 0);
          bGroup.add(ghostBox);
        }
      }

      // Rooftop Green Garden
      if (showGreenEcosystem) {
        const greenRoof = new THREE.Mesh(new THREE.BoxGeometry(w - 0.4, 0.2, d - 0.4), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
        greenRoof.position.set(0, (sanctioned + ghost) * floorH + 0.15, 0);
        bGroup.add(greenRoof);
      }

      bGroup.position.set(x, 0.35, z);
      scene.add(bGroup);

      const hitMesh = new THREE.Mesh(new THREE.BoxGeometry(w, (sanctioned + ghost) * floorH + 3, d), new THREE.MeshBasicMaterial({ visible: false }));
      hitMesh.position.set(x, ((sanctioned + ghost) * floorH) / 2 + 0.35, z);
      hitMesh.userData = { id: `BLD-${x}`, name, category: ghost > 0 ? "GHOST_FLOOR" : "BUILDING", depth: `+0.0m to +${((sanctioned + ghost) * floorH).toFixed(1)}m`, status: ghost > 0 ? "ALERT" : "CLEAR", ulpin: "IND338421049280-V000720-B2", details: "Volumetric Cadastre." };
      scene.add(hitMesh);
      interactiveMeshes.push(hitMesh);
    };

    createBuilding(-12, -7, 10, 8, 6, 2, "Metro Tower Plaza");
    createBuilding(2, -7, 12, 8, 8, 0, "DoLR State Cadastral Twin HQ");
    createBuilding(14, -7, 8, 8, 5, 1, "Commercial Exchange");

    // Subsurface Metro & Animated Train
    const tunnel = new THREE.Mesh(new THREE.BoxGeometry(42, 4.2, 7.5), new THREE.MeshStandardMaterial({ color: 0x1e293b, side: THREE.DoubleSide }));
    tunnel.position.set(0, -9.5, 3.5);
    scene.add(tunnel);

    const trainGroup = new THREE.Group();
    const carBody = new THREE.Mesh(new THREE.BoxGeometry(9, 2.4, 3.2), new THREE.MeshStandardMaterial({ color: 0x7c3aed }));
    trainGroup.add(carBody);
    trainGroup.position.set(0, -9.8, 3.5);
    scene.add(trainGroup);

    // Subsurface Utilities
    const createPipeline = (points: [number, number, number][], color: number, radius: number) => {
      const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, radius, 16, false), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.45 }));
      scene.add(tube);
    };

    if (activeLayers.TELECOM) createPipeline([[-21, -1.8, 6.5], [-8, -1.8, 5.5], [1, -2.2, 1.5], [21, -2.2, -0.5]], 0xec4899, 0.32);
    if (activeLayers.WATER) createPipeline([[-21, -3.4, 4.5], [-6, -3.4, 4.5], [3, -3.8, 6.5], [21, -3.8, 6.5]], 0x84cc16, 0.48);

    // Raycast Click Handler
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, true);
      if (hits.length > 0) {
        onSelectItem(hits[0].object.userData as UtilityItem);
      }
    };
    renderer.domElement.addEventListener("click", handleClick);

    let reqId: number;
    let clock = new THREE.Clock();
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      trainGroup.position.x = ((t * 7) % 52) - 26;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      renderer.domElement.removeEventListener("click", handleClick);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [activeLayers, highlightViolations, showDroneCorridor, showGreenEcosystem, onSelectItem]);

  return <div ref={mountRef} className="w-full h-full min-h-[500px] cursor-grab active:cursor-grabbing rounded-2xl overflow-hidden" />;
}
