"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

export interface UtilityItem {
  id: string;
  name: string;
  category: "POWER" | "WATER" | "GAS" | "SEWER" | "TELECOM" | "TRANSIT" | "BUILDING";
  depth: string;
  status: "ACTIVE" | "ALERT" | "CLEAR";
  ulpin: string;
  details: string;
}

export default function CadastreViewer3D({
  onSelectItem,
  activeLayers,
}: {
  onSelectItem: (item: UtilityItem) => void;
  activeLayers: Record<string, boolean>;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b132b);
    scene.fog = new THREE.FogExp2(0x0b132b, 0.012);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(36, 20, 38);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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
    controls.maxPolarAngle = Math.PI / 2 + 0.18;
    controls.target.set(0, -3.5, 0);

    // Realistic Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 0.9);
    scene.add(hemiLight);

    const keySun = new THREE.DirectionalLight(0xfffaed, 2.0);
    keySun.position.set(45, 60, 30);
    keySun.castShadow = true;
    keySun.shadow.mapSize.width = 2048;
    keySun.shadow.mapSize.height = 2048;
    scene.add(keySun);

    const rimBlue = new THREE.DirectionalLight(0x38bdf8, 0.8);
    rimBlue.position.set(-30, 20, -30);
    scene.add(rimBlue);

    const undergroundFill = new THREE.DirectionalLight(0x818cf8, 0.5);
    undergroundFill.position.set(0, -20, 20);
    scene.add(undergroundFill);

    const interactiveMeshes: THREE.Mesh[] = [];

    // --- 1. Procedural Asphalt Road & Sidewalk Cross-Section ---
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e2229, roughness: 0.9 });
    const road = new THREE.Mesh(new THREE.BoxGeometry(42, 0.4, 10), roadMat);
    road.position.set(0, 0, 3);
    road.receiveShadow = true;
    scene.add(road);

    // Zebra Crossings & Double Yellow Lane Dividers
    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const yLine1 = new THREE.Mesh(new THREE.PlaneGeometry(42, 0.15), yellowMat);
    yLine1.rotation.x = -Math.PI / 2;
    yLine1.position.set(0, 0.22, 2.8);
    scene.add(yLine1);
    const yLine2 = new THREE.Mesh(new THREE.PlaneGeometry(42, 0.15), yellowMat);
    yLine2.rotation.x = -Math.PI / 2;
    yLine2.position.set(0, 0.22, 3.2);
    scene.add(yLine2);

    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xf1f5f9 });
    for (let i = -4; i <= 4; i++) {
      const zebra = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 4), whiteMat);
      zebra.rotation.x = -Math.PI / 2;
      zebra.position.set(i * 1.3, 0.22, 3);
      scene.add(zebra);
    }

    // Concrete Sidewalk with Curb Depth
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 });
    const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(42, 0.8, 12), curbMat);
    sidewalk.position.set(0, 0.2, -7.5);
    sidewalk.receiveShadow = true;
    scene.add(sidewalk);

    // Streetlamp Poles & Guardrails
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.2 });
    for (let x = -16; x <= 16; x += 10) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 6, 12), metalMat);
      pole.position.set(x, 3.2, -1.8);
      scene.add(pole);

      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8), metalMat);
      arm.rotation.z = Math.PI / 3;
      arm.position.set(x + 0.7, 6.2, -1.8);
      scene.add(arm);

      // Light Fixture
      const fixture = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.3), new THREE.MeshBasicMaterial({ color: 0xffedd5 }));
      fixture.position.set(x + 1.4, 6.4, -1.8);
      scene.add(fixture);
    }

    // --- 2. Subsurface Retaining Chamber & Depth Ticks ---
    const soilMat = new THREE.MeshStandardMaterial({
      color: 0x1c2438,
      roughness: 0.8,
      metalness: 0.1,
    });

    const backSoil = new THREE.Mesh(new THREE.BoxGeometry(42, 14, 1), soilMat);
    backSoil.position.set(0, -7, -13.5);
    scene.add(backSoil);

    const leftSoil = new THREE.Mesh(new THREE.BoxGeometry(1, 14, 22), soilMat);
    leftSoil.position.set(-21, -7, -3);
    scene.add(leftSoil);

    const rightSoil = new THREE.Mesh(new THREE.BoxGeometry(1, 14, 22), soilMat);
    rightSoil.position.set(21, -7, -3);
    scene.add(rightSoil);

    const bedrock = new THREE.Mesh(new THREE.BoxGeometry(42, 1, 22), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    bedrock.position.set(0, -14, -3);
    scene.add(bedrock);

    // Floor Grid at -14m
    const subGrid = new THREE.GridHelper(42, 21, 0x0ea5e9, 0x1e293b);
    subGrid.position.set(0, -13.9, -3);
    scene.add(subGrid);

    // Depth Elevation Markers
    const createDepthMarker = (y: number, label: string) => {
      const line = new THREE.Mesh(
        new THREE.PlaneGeometry(0.2, 22),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.3 })
      );
      line.rotation.x = Math.PI / 2;
      line.rotation.y = Math.PI / 2;
      line.position.set(-20.4, y, -3);
      scene.add(line);
    };
    createDepthMarker(-2, "-2m (Telecom/Power)");
    createDepthMarker(-4, "-4m (Water Supply)");
    createDepthMarker(-6, "-6m (Gas Mains)");
    createDepthMarker(-10, "-10m (Subway Transit)");

    // --- 3. LoD2 Commercial Buildings with Concrete/Glass Façades ---
    const createCommercialBuilding = (x: number, z: number, w: number, d: number, floors: number, name: string, ulpin: string) => {
      const bGroup = new THREE.Group();
      const floorH = 2.8;
      const totalH = floors * floorH;

      // Concrete Structural Core
      const coreMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.8,
        roughness: 0.1,
        transparent: true,
        opacity: 0.75
      });

      for (let f = 0; f < floors; f++) {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, d), coreMat);
        slab.position.set(0, f * floorH + 0.15, 0);
        slab.castShadow = true;
        bGroup.add(slab);

        const glass = new THREE.Mesh(new THREE.BoxGeometry(w - 0.2, floorH - 0.3, d - 0.2), glassMat);
        glass.position.set(0, f * floorH + floorH / 2, 0);
        bGroup.add(glass);

        // Mullion Frames
        const mullion = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(w - 0.15, floorH - 0.25, d - 0.15)),
          new THREE.LineBasicMaterial({ color: 0x38bdf8 })
        );
        mullion.position.set(0, f * floorH + floorH / 2, 0);
        bGroup.add(mullion);
      }

      // Base Foundation Extrusion
      const foundMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
      const foundation = new THREE.Mesh(new THREE.BoxGeometry(w, 2.5, d), foundMat);
      foundation.position.set(0, -1.25, 0);
      bGroup.add(foundation);

      bGroup.position.set(x, 0.4, z);
      bGroup.userData = {
        id: `BLD-${x}`,
        name: name,
        category: "BUILDING",
        depth: `+0.0m to +${totalH.toFixed(1)}m`,
        status: "ACTIVE",
        ulpin: ulpin,
        details: `LoD2 Multi-Tier Asset. Subsurface foundation down to -2.5m MSL.`
      } as UtilityItem;

      scene.add(bGroup);

      // Hitbox for raycasting
      const hitGeo = new THREE.BoxGeometry(w, totalH, d);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.set(x, totalH / 2 + 0.4, z);
      hitMesh.userData = bGroup.userData;
      scene.add(hitMesh);
      interactiveMeshes.push(hitMesh);
    };

    createCommercialBuilding(-12, -7.5, 10, 8, 7, "Metro Tower Plaza (Block A)", "IND80219481920-V000160-A1");
    createCommercialBuilding(2, -7.5, 12, 8, 9, "DoLR Urban Cadastre Tower", "IND80219481920-V000220-B2");
    createCommercialBuilding(14, -7.5, 8, 8, 5, "Commercial Exchange (Block C)", "IND80219481920-V000120-C3");

    // --- 4. Subsurface Subway Transit Corridor with Interior Columns & Rail Tracks ---
    if (activeLayers.TRANSIT) {
      const tunnelMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.6,
        side: THREE.DoubleSide
      });
      const tunnelBox = new THREE.Mesh(new THREE.BoxGeometry(42, 4.5, 7.5), tunnelMat);
      tunnelBox.position.set(0, -9.5, 3.5);
      tunnelBox.userData = {
        id: "TUNNEL-METRO-L3",
        name: "Metro Transit Corridor Phase 2",
        category: "TRANSIT",
        depth: "-7.0m to -11.5m (MSL)",
        status: "ACTIVE",
        ulpin: "IND80219481920-U070120-M9",
        details: "Reinforced concrete transit box with central structural columns and dual rail lines."
      } as UtilityItem;

      // Central Support Columns
      const colMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
      for (let x = -16; x <= 16; x += 8) {
        const col = new THREE.Mesh(new THREE.BoxGeometry(0.6, 4.3, 0.6), colMat);
        col.position.set(x, -9.5, 3.5);
        scene.add(col);
      }

      // Dual Steel Rail Tracks & Ballast
      const railMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.1 });
      const ballastMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
      
      const ballast = new THREE.Mesh(new THREE.BoxGeometry(42, 0.3, 6.5), ballastMat);
      ballast.position.set(0, -11.5, 3.5);
      scene.add(ballast);

      const r1 = new THREE.Mesh(new THREE.BoxGeometry(42, 0.15, 0.25), railMat);
      r1.position.set(0, -11.3, 2.0);
      const r2 = new THREE.Mesh(new THREE.BoxGeometry(42, 0.15, 0.25), railMat);
      r2.position.set(0, -11.3, 3.0);
      const r3 = new THREE.Mesh(new THREE.BoxGeometry(42, 0.15, 0.25), railMat);
      r3.position.set(0, -11.3, 4.0);
      const r4 = new THREE.Mesh(new THREE.BoxGeometry(42, 0.15, 0.25), railMat);
      r4.position.set(0, -11.3, 5.0);
      scene.add(r1);
      scene.add(r2);
      scene.add(r3);
      scene.add(r4);

      scene.add(tunnelBox);
      interactiveMeshes.push(tunnelBox);
    }

    // --- 5. Highly Detailed Multi-Utility Pipe Mesh Generator with Junction Manholes ---
    const createPipelineNetwork = (
      points: [number, number, number][],
      color: number,
      radius: number,
      name: string,
      cat: UtilityItem["category"],
      depthText: string,
      ulpin: string,
      hasManholes = true
    ) => {
      const curvePoints = points.map(p => new THREE.Vector3(...p));
      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const tubeGeo = new THREE.TubeGeometry(curve, 96, radius, 18, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.15,
        metalness: 0.5,
        emissive: color,
        emissiveIntensity: 0.4
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);

      tubeMesh.userData = {
        id: `UTIL-${name.replace(/\s+/g, "_")}`,
        name: name,
        category: cat,
        depth: depthText,
        status: "ACTIVE",
        ulpin: ulpin,
        details: `Subsurface utility trunk monitored with real-time 3D spatial buffer envelope.`
      } as UtilityItem;

      scene.add(tubeMesh);
      interactiveMeshes.push(tubeMesh);

      // Add Vertical Junction Drops / Inspection Shafts
      if (hasManholes) {
        const juncMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.3 });
        points.slice(1, -1).forEach(pt => {
          const shaftH = Math.abs(pt[1]);
          const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.6, radius * 1.6, shaftH, 16), juncMat);
          shaft.position.set(pt[0], -shaftH / 2, pt[2]);
          scene.add(shaft);

          // Surface Manhole Cover
          const cover = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.8, radius * 1.8, 0.08, 16), metalMat);
          cover.position.set(pt[0], 0.24, pt[2]);
          scene.add(cover);
        });
      }
    };

    // Magenta: High-Capacity Telecom Optic Fiber
    if (activeLayers.TELECOM) {
      createPipelineNetwork(
        [[-21, -1.8, 6.5], [-8, -1.8, 5.5], [1, -2.2, 1.5], [10, -2.2, -0.5], [21, -2.2, -0.5]],
        0xec4899,
        0.32,
        "High-Speed Optic Fiber Trunk (BSNL/Jio)",
        "TELECOM",
        "-1.8m to -2.2m Depth",
        "IND80219481920-U018025-F4"
      );
    }

    // Lime Green: Potable Water Distribution Mains
    if (activeLayers.WATER) {
      createPipelineNetwork(
        [[-21, -3.4, 4.5], [-6, -3.4, 4.5], [3, -3.8, 6.5], [12, -3.8, 6.5], [21, -3.8, 6.5]],
        0x84cc16,
        0.5,
        "Potable Water Supply Main (400mm)",
        "WATER",
        "-3.4m to -3.8m Depth",
        "IND80219481920-U032038-W1"
      );
    }

    // Yellow: High-Pressure Natural Gas Conduit
    if (activeLayers.GAS) {
      createPipelineNetwork(
        [[-21, -5.0, 0.5], [-4, -5.0, 0.5], [6, -5.4, 2.5], [15, -5.4, 4.0], [21, -5.4, 4.0]],
        0xfacc15,
        0.42,
        "High-Pressure Natural Gas Pipeline",
        "GAS",
        "-5.0m to -5.4m Depth",
        "IND80219481920-U045050-G8"
      );
    }

    // Blue: Deep Storm Sewer Trunk (800mm)
    if (activeLayers.SEWER) {
      createPipelineNetwork(
        [[-21, -6.8, -3.5], [-5, -6.8, -2.5], [7, -7.2, 0.5], [21, -7.2, 1.5]],
        0x0284c7,
        0.65,
        "Deep Storm Sewer Trunk (800mm)",
        "SEWER",
        "-6.8m to -7.2m Depth",
        "IND80219481920-U058062-S2"
      );
    }

    // --- 6. Raycasting Interaction ---
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
  }, [activeLayers, onSelectItem]);

  return <div ref={mountRef} className="w-full h-full min-h-[500px] cursor-grab active:cursor-grabbing rounded-xl overflow-hidden shadow-2xl" />;
}
