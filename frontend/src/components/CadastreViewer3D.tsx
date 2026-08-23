"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

export interface UtilityItem {
  id: string;
  name: string;
  category: "POWER" | "WATER" | "GAS" | "SEWER" | "TELECOM" | "TRANSIT" | "BUILDING" | "AIRSPACE" | "GHOST_FLOOR";
  depth: string;
  status: "ACTIVE" | "ALERT" | "CLEAR";
  ulpin: string;
  details: string;
}

export default function CadastreViewer3D({
  onSelectItem,
  activeLayers,
  highlightViolations = true,
  showDroneCorridor = true
}: {
  onSelectItem: (item: UtilityItem) => void;
  activeLayers: Record<string, boolean>;
  highlightViolations?: boolean;
  showDroneCorridor?: boolean;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.009);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(42, 28, 48);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.15;
    controls.target.set(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keySun = new THREE.DirectionalLight(0xfffaed, 2.0);
    keySun.position.set(50, 70, 35);
    keySun.castShadow = true;
    scene.add(keySun);

    const rimBlue = new THREE.DirectionalLight(0x38bdf8, 0.8);
    rimBlue.position.set(-30, 20, -30);
    scene.add(rimBlue);

    const interactiveMeshes: THREE.Mesh[] = [];

    // --- 1. Surface Asphalt & Sidewalk ---
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e2229, roughness: 0.9 });
    const road = new THREE.Mesh(new THREE.BoxGeometry(44, 0.4, 10), roadMat);
    road.position.set(0, 0, 3);
    road.receiveShadow = true;
    scene.add(road);

    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const yLine = new THREE.Mesh(new THREE.PlaneGeometry(44, 0.2), yellowMat);
    yLine.rotation.x = -Math.PI / 2;
    yLine.position.set(0, 0.22, 3);
    scene.add(yLine);

    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 });
    const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(44, 0.8, 12), sidewalkMat);
    sidewalk.position.set(0, 0.2, -7.5);
    sidewalk.receiveShadow = true;
    scene.add(sidewalk);

    // --- 2. Subsurface Retaining Chamber ---
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x1c2438, roughness: 0.8 });
    const backSoil = new THREE.Mesh(new THREE.BoxGeometry(44, 14, 1), soilMat);
    backSoil.position.set(0, -7, -13.5);
    scene.add(backSoil);

    const leftSoil = new THREE.Mesh(new THREE.BoxGeometry(1, 14, 22), soilMat);
    leftSoil.position.set(-22, -7, -3);
    scene.add(leftSoil);

    const rightSoil = new THREE.Mesh(new THREE.BoxGeometry(1, 14, 22), soilMat);
    rightSoil.position.set(22, -7, -3);
    scene.add(rightSoil);

    const bedrock = new THREE.Mesh(new THREE.BoxGeometry(44, 1, 22), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    bedrock.position.set(0, -14, -3);
    scene.add(bedrock);

    // --- 3. High-Rise Tower with Ghost Floor & Air Rights Bounding ---
    const createBuildingWithAudits = (
      x: number, z: number, w: number, d: number,
      sanctionedFloors: number, unauthorizedGhostFloors: number,
      name: string, ulpin: string
    ) => {
      const bGroup = new THREE.Group();
      const floorH = 2.6;
      const coreMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.8,
        roughness: 0.1,
        transparent: true,
        opacity: 0.75
      });

      for (let f = 0; f < sanctionedFloors; f++) {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, d), coreMat);
        slab.position.set(0, f * floorH + 0.15, 0);
        bGroup.add(slab);

        const glass = new THREE.Mesh(new THREE.BoxGeometry(w - 0.2, floorH - 0.3, d - 0.2), glassMat);
        glass.position.set(0, f * floorH + floorH / 2, 0);
        bGroup.add(glass);

        const mullion = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(w - 0.15, floorH - 0.25, d - 0.15)),
          new THREE.LineBasicMaterial({ color: 0x38bdf8 })
        );
        mullion.position.set(0, f * floorH + floorH / 2, 0);
        bGroup.add(mullion);
      }

      if (highlightViolations && unauthorizedGhostFloors > 0) {
        const ghostMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xef4444,
          emissiveIntensity: 0.6,
          transparent: true,
          opacity: 0.7
        });

        for (let g = 0; g < unauthorizedGhostFloors; g++) {
          const currentF = sanctionedFloors + g;
          const ghostBox = new THREE.Mesh(new THREE.BoxGeometry(w, floorH - 0.2, d), ghostMat);
          ghostBox.position.set(0, currentF * floorH + floorH / 2, 0);

          const redWire = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(w, floorH - 0.2, d)),
            new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 })
          );
          ghostBox.add(redWire);
          bGroup.add(ghostBox);
        }
      }

      const totalSanctionedH = (sanctionedFloors + unauthorizedGhostFloors) * floorH;
      const airBoxGeo = new THREE.BoxGeometry(w + 1, 3.5, d + 1);
      const airBoxMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        wireframe: true,
        transparent: true,
        opacity: 0.45
      });
      const airRightsVolume = new THREE.Mesh(airBoxGeo, airBoxMat);
      airRightsVolume.position.set(0, totalSanctionedH + 1.75, 0);
      bGroup.add(airRightsVolume);

      bGroup.position.set(x, 0.4, z);

      bGroup.userData = {
        id: `BLD-${x}`,
        name: name,
        category: unauthorizedGhostFloors > 0 ? "GHOST_FLOOR" : "BUILDING",
        depth: `+0.0m to +${totalSanctionedH.toFixed(1)}m (MSL)`,
        status: unauthorizedGhostFloors > 0 ? "ALERT" : "CLEAR",
        ulpin: ulpin,
        details: unauthorizedGhostFloors > 0
          ? `CRITICAL FAR BREACH: ${unauthorizedGhostFloors} Unauthorized Ghost Floors detected above sanctioned height. Total annual tax evasion: ₹14.8 Lakhs.`
          : `Fully compliant ISO 19152 volumetric strata asset.`
      } as UtilityItem;

      scene.add(bGroup);

      const hitMesh = new THREE.Mesh(new THREE.BoxGeometry(w, totalSanctionedH + 4, d), new THREE.MeshBasicMaterial({ visible: false }));
      hitMesh.position.set(x, (totalSanctionedH + 4) / 2 + 0.4, z);
      hitMesh.userData = bGroup.userData;
      scene.add(hitMesh);
      interactiveMeshes.push(hitMesh);
    };

    createBuildingWithAudits(-12, -7.5, 10, 8, 6, 2, "Metro Tower Plaza (Block A)", "IND80219481920-V000160-A1");
    createBuildingWithAudits(2, -7.5, 12, 8, 8, 0, "DoLR State Cadastral Twin HQ", "IND80219481920-V000220-B2");
    createBuildingWithAudits(14, -7.5, 8, 8, 5, 1, "Commercial Exchange (Block C)", "IND80219481920-V000120-C3");

    // --- 4. Glowing Drone Sky Delivery Corridor ---
    if (showDroneCorridor) {
      const droneTubeGeo = new THREE.CylinderGeometry(3.5, 3.5, 46, 24, 1, true);
      const droneTubeMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        wireframe: true,
        transparent: true,
        opacity: 0.35
      });
      const droneTube = new THREE.Mesh(droneTubeGeo, droneTubeMat);
      droneTube.rotation.z = Math.PI / 2;
      droneTube.position.set(0, 27.5, -4);
      droneTube.userData = {
        id: "DRONE-CORRIDOR-01",
        name: "DGCA Municipal Drone Delivery Skyway Corridor",
        category: "AIRSPACE",
        depth: "+80.0m to +95.0m (MSL Airspace)",
        status: "ACTIVE",
        ulpin: "IND80219481920-A080095-D1",
        details: "Designated Urban Air Mobility (UAM) corridor with active 3D geo-fence."
      } as UtilityItem;

      scene.add(droneTube);
      interactiveMeshes.push(droneTube);

      const droneOrb = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x22d3ee })
      );
      droneOrb.position.set(-6, 27.5, -4);
      scene.add(droneOrb);
    }

    // --- 5. Subsurface Metro Transit Box ---
    if (activeLayers.TRANSIT) {
      const tunnelMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, side: THREE.DoubleSide });
      const tunnelBox = new THREE.Mesh(new THREE.BoxGeometry(44, 4.5, 7.5), tunnelMat);
      tunnelBox.position.set(0, -9.5, 3.5);
      tunnelBox.userData = {
        id: "TUNNEL-METRO-L3",
        name: "Metro Transit Corridor Phase 2",
        category: "TRANSIT",
        depth: "-7.0m to -11.5m (MSL)",
        status: "ACTIVE",
        ulpin: "IND80219481920-U070120-M9",
        details: "Reinforced concrete transit box with dual rail lines."
      } as UtilityItem;

      scene.add(tunnelBox);
      interactiveMeshes.push(tunnelBox);
    }

    // --- 6. Color-Coded Subsurface Pipelines ---
    const createPipeline = (points: [number, number, number][], color: number, radius: number, name: string, cat: UtilityItem["category"], depthText: string, ulpin: string) => {
      const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
      const tubeMesh = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 64, radius, 16, false),
        new THREE.MeshStandardMaterial({ color, roughness: 0.2, metalness: 0.4, emissive: color, emissiveIntensity: 0.4 })
      );
      tubeMesh.userData = { id: `UTIL-${name.replace(/\s+/g, "_")}`, name, category: cat, depth: depthText, status: "ACTIVE", ulpin, details: "Active 3D utility conduit." } as UtilityItem;
      scene.add(tubeMesh);
      interactiveMeshes.push(tubeMesh);
    };

    if (activeLayers.TELECOM) createPipeline([[-22, -1.8, 6.5], [-8, -1.8, 5.5], [1, -2.2, 1.5], [22, -2.2, -0.5]], 0xec4899, 0.32, "BSNL Optic Fiber Main", "TELECOM", "-1.8m to -2.2m", "IND80219481920-U018022-F9");
    if (activeLayers.WATER) createPipeline([[-22, -3.4, 4.5], [-6, -3.4, 4.5], [3, -3.8, 6.5], [22, -3.8, 6.5]], 0x84cc16, 0.5, "Potable Water Main", "WATER", "-3.4m to -3.8m", "IND80219481920-U034038-W4");
    if (activeLayers.GAS) createPipeline([[-22, -5.0, 0.5], [-4, -5.0, 0.5], [6, -5.4, 2.5], [22, -5.4, 4.0]], 0xfacc15, 0.42, "High-Pressure Gas Conduit", "GAS", "-5.0m to -5.4m", "IND80219481920-U048052-G1");

    // --- 7. Raycasting ---
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

    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
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
  }, [activeLayers, highlightViolations, showDroneCorridor, onSelectItem]);

  return <div ref={mountRef} className="w-full h-full min-h-[500px] cursor-grab active:cursor-grabbing rounded-xl overflow-hidden shadow-2xl" />;
}
