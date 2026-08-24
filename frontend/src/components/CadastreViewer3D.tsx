"use client";

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
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
  parcelId?: string;
  owner?: string;
  areaSqm?: number;
  volumeM3?: number;
  coordinates?: string;
  zMin?: number;
  zMax?: number;
  species?: string;
  botanicalName?: string;
  ageYears?: number;
  canopyRadiusM?: number;
  rootDepthM?: number;
  custodian?: string;
  fellingPenaltyInr?: number;
  annualCo2Kg?: number;
  taxRebateInr?: number;
}

export interface TelemetryData {
  cursorLat: string;
  cursorLon: string;
  cursorZ: string;
  camPitch: number;
  camBearing: number;
  fps: number;
}

export interface CadastreViewerRef {
  resetCamera: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setElevationFilter: (zLevel: number) => void;
}

const CadastreViewer3D = forwardRef<CadastreViewerRef, {
  onSelectItem: (item: UtilityItem | null) => void;
  activeLayers: Record<string, boolean>;
  activeTool?: string;
  elevationCutoff?: number;
  onTelemetryUpdate?: (data: TelemetryData) => void;
}>(({ onSelectItem, activeLayers, activeTool = "select", elevationCutoff = 100, onTelemetryUpdate }, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [hoveredItem, setHoveredItem] = useState<{ name: string; ulpin: string; depth: string; x: number; y: number } | null>(null);

  const onSelectItemRef = useRef(onSelectItem);
  useEffect(() => {
    onSelectItemRef.current = onSelectItem;
  }, [onSelectItem]);

  const onTelemetryRef = useRef(onTelemetryUpdate);
  useEffect(() => {
    onTelemetryRef.current = onTelemetryUpdate;
  }, [onTelemetryUpdate]);

  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.set(38, 15, 42);
        controlsRef.current.target.set(0, -1.5, 0);
        controlsRef.current.update();
      }
    },
    zoomIn: () => {
      if (cameraRef.current) cameraRef.current.position.multiplyScalar(0.85);
    },
    zoomOut: () => {
      if (cameraRef.current) cameraRef.current.position.multiplyScalar(1.15);
    },
    setElevationFilter: (zLevel: number) => {}
  }));

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.007);

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 1000);
    camera.position.set(38, 15, 42);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 + 0.04;
    controls.target.set(0, -1.5, 0);
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xfffdf5, 2.2);
    sun.position.set(45, 65, 35);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    scene.add(sun);

    const hemisphere = new THREE.HemisphereLight(0xffffff, 0x334155, 0.6);
    scene.add(hemisphere);

    const interactiveMeshes: THREE.Mesh[] = [];

    // 1. Surface Architecture & Road
    if (activeLayers.roads ?? true) {
      const sidewalk = new THREE.Mesh(
        new THREE.BoxGeometry(44, 0.4, 11),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85, metalness: 0.1 })
      );
      sidewalk.position.set(0, 0, -5.5);
      sidewalk.receiveShadow = true;
      scene.add(sidewalk);

      const road = new THREE.Mesh(
        new THREE.BoxGeometry(44, 0.25, 4),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 })
      );
      road.position.set(0, -0.05, 1);
      road.receiveShadow = true;
      scene.add(road);

      const yLine = new THREE.Mesh(
        new THREE.PlaneGeometry(44, 0.12),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b })
      );
      yLine.rotation.x = -Math.PI / 2;
      yLine.position.set(0, 0.09, 1);
      scene.add(yLine);
    }

    // 2. Subterranean Bedrock Matrix
    const bedrock = new THREE.Mesh(
      new THREE.BoxGeometry(44, 0.8, 22),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 })
    );
    bedrock.position.set(0, -11.5, 0);
    bedrock.receiveShadow = true;
    scene.add(bedrock);

    const subGrid = new THREE.GridHelper(44, 22, 0x0284c7, 0x1e293b);
    subGrid.position.set(0, -11.08, 0);
    scene.add(subGrid);

    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(44, 11.5, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.9 })
    );
    backWall.position.set(0, -5.75, -11);
    scene.add(backWall);

    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 11.5, 22),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.9 })
    );
    leftWall.position.set(-22, -5.75, 0);
    scene.add(leftWall);

    // 3. Subterranean Metro Box & Train (-8.5m)
    const trainGroup = new THREE.Group();
    if (activeLayers.metro ?? true) {
      const platform = new THREE.Mesh(
        new THREE.BoxGeometry(44, 0.6, 6.5),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })
      );
      platform.position.set(0, -9.6, 5);
      platform.receiveShadow = true;
      scene.add(platform);

      const railMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });
      const rail1 = new THREE.Mesh(new THREE.BoxGeometry(44, 0.12, 0.12), railMat);
      rail1.position.set(0, -9.25, 4.2);
      const rail2 = new THREE.Mesh(new THREE.BoxGeometry(44, 0.12, 0.12), railMat);
      rail2.position.set(0, -9.25, 5.8);
      scene.add(rail1);
      scene.add(rail2);

      const trainCar = new THREE.Mesh(
        new THREE.BoxGeometry(9.5, 2.2, 2.4),
        new THREE.MeshStandardMaterial({
          color: 0x6366f1,
          metalness: 0.4,
          roughness: 0.3,
          emissive: 0x4338ca,
          emissiveIntensity: 0.35
        })
      );
      trainCar.position.set(0, 1.1, 0);
      trainCar.castShadow = true;

      const winMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      for (let w = -3.5; w <= 3.5; w += 1.8) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 2.45), winMat);
        win.position.set(w, 1.25, 0);
        trainCar.add(win);
      }

      trainGroup.add(trainCar);
      trainGroup.position.set(0, -9.3, 5);
      scene.add(trainGroup);

      trainCar.userData = {
        id: "METRO-LINE",
        name: "CMRL Metro Corridor Phase 2",
        category: "TRANSIT",
        depth: "-8.5m to -11.0m MSL",
        status: "ACTIVE",
        ulpin: "IND338421049280-U085110-M2",
        parcelId: "TN-CHN-MTR-002",
        owner: "Chennai Metro Rail Ltd (CMRL)",
        areaSqm: 8400.0,
        volumeM3: 33600.0,
        coordinates: "13.0610° N, 80.2520° E",
        zMin: -11.0,
        zMax: -8.5,
        details: "Subterranean rapid transit corridor. Mandatory 15m structural foundation clearance buffer."
      } as UtilityItem;
      interactiveMeshes.push(trainCar);
    }

    // 4. Subsurface Conduits
    const createPipeline = (
      points: [number, number, number][],
      color: number,
      radius: number,
      name: string,
      depthStr: string,
      ulpin: string,
      category: "TELECOM" | "WATER" | "GAS",
      owner: string,
      zMin: number,
      zMax: number
    ) => {
      const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 64, radius, 16, false),
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.25,
          metalness: 0.4,
          emissive: color,
          emissiveIntensity: 0.45
        })
      );
      tube.castShadow = true;
      tube.userData = {
        id: `PIPE-${name}`,
        name,
        category,
        depth: depthStr,
        status: "ACTIVE",
        ulpin,
        parcelId: `UTIL-${category}-01`,
        owner,
        areaSqm: 420.0,
        volumeM3: 840.0,
        coordinates: "13.0612° N, 80.2524° E",
        zMin,
        zMax,
        details: "Subsurface municipal conduit. 2.0m excavation clearance buffer enforced under Municipal GIS."
      } as UtilityItem;
      scene.add(tube);
      interactiveMeshes.push(tube);
    };

    if (activeLayers.telecom ?? true) {
      createPipeline(
        [[-22, -1.8, 2.5], [-8, -1.8, 2.0], [2, -2.0, 0.5], [22, -2.0, -1.0]],
        0xec4899,
        0.32,
        "BSNL Gigabit Optic Fiber Main",
        "-1.8m to -2.2m Subsurface",
        "IND338421049280-U018022-T1",
        "TELECOM",
        "Bharat Sanchar Nigam Ltd (BSNL)",
        -2.2,
        -1.8
      );
    }

    if (activeLayers.water ?? true) {
      createPipeline(
        [[-22, -3.4, 0.5], [-6, -3.4, 0.5], [4, -3.8, 2.5], [22, -3.8, 2.5]],
        0x059669,
        0.48,
        "Municipal 500mm Water Trunk",
        "-3.4m to -3.8m Subsurface",
        "IND338421049280-U034038-W4",
        "WATER",
        "Chennai MetroWater Board (CMWSSB)",
        -3.8,
        -3.4
      );
    }

    if (activeLayers.gas ?? true) {
      createPipeline(
        [[-22, -5.2, -1.5], [-4, -5.2, -1.5], [6, -5.6, 0.5], [22, -5.6, 1.8]],
        0xd97706,
        0.42,
        "GAIL High-Pressure Gas Distribution",
        "-5.2m to -5.6m Subsurface",
        "IND338421049280-U052056-G9",
        "GAS",
        "GAIL (India) Limited",
        -5.6,
        -5.2
      );
    }

    // 5. High-Rise Architectural Buildings
    const createCivicBuilding = (
      x: number, z: number, w: number, d: number,
      sanctionedFloors: number, ghostFloors: number,
      name: string, ulpin: string, parcelId: string, owner: string
    ) => {
      const bGroup = new THREE.Group();
      const floorH = 2.4;
      const slabMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.1 });
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.1,
        roughness: 0.1,
        transparent: true,
        opacity: 0.65
      });
      const frameMat = new THREE.LineBasicMaterial({ color: 0x475569 });

      const core = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.35, (sanctionedFloors + ghostFloors) * floorH, d * 0.35),
        new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 })
      );
      core.position.set(0, ((sanctionedFloors + ghostFloors) * floorH) / 2, 0);
      bGroup.add(core);

      for (let f = 0; f < sanctionedFloors; f++) {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(w, 0.18, d), slabMat);
        slab.position.set(0, f * floorH + 0.09, 0);
        slab.castShadow = true;
        slab.receiveShadow = true;
        bGroup.add(slab);

        const glass = new THREE.Mesh(new THREE.BoxGeometry(w - 0.1, floorH - 0.18, d - 0.1), glassMat);
        glass.position.set(0, f * floorH + floorH / 2, 0);
        bGroup.add(glass);

        const frame = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(w, floorH - 0.18, d)),
          frameMat
        );
        frame.position.set(0, f * floorH + floorH / 2, 0);
        bGroup.add(frame);
      }

      if (ghostFloors > 0) {
        const ghostMat = new THREE.MeshStandardMaterial({
          color: 0xe11d48,
          transparent: true,
          opacity: 0.75,
          roughness: 0.2
        });

        for (let g = 0; g < ghostFloors; g++) {
          const currentF = sanctionedFloors + g;
          const ghostBox = new THREE.Mesh(new THREE.BoxGeometry(w, floorH - 0.18, d), ghostMat);
          ghostBox.position.set(0, currentF * floorH + floorH / 2, 0);

          const redWire = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(w + 0.1, floorH - 0.15, d + 0.1)),
            new THREE.LineBasicMaterial({ color: 0x9f1239, linewidth: 2 })
          );
          ghostBox.add(redWire);
          bGroup.add(ghostBox);
        }
      }

      const totalH = (sanctionedFloors + ghostFloors) * floorH;
      bGroup.position.set(x, 0.2, z);

      bGroup.userData = {
        id: `BLD-${x}`,
        name,
        category: ghostFloors > 0 ? "GHOST_FLOOR" : "BUILDING",
        depth: `+0.0m to +${totalH.toFixed(1)}m MSL`,
        status: ghostFloors > 0 ? "ALERT" : "CLEAR",
        ulpin,
        parcelId,
        owner,
        areaSqm: w * d * (sanctionedFloors + ghostFloors),
        volumeM3: w * d * totalH,
        coordinates: "13.0610° N, 80.2520° E",
        zMin: 0.0,
        zMax: totalH,
        details: ghostFloors > 0
          ? `FAR BREACH: ${ghostFloors} Unauthorized Floors detected above permitted envelope. Penalty: ₹4.82 Cr.`
          : `ISO 19152 LADM II Strata Title. Verified vertical cadastre.`
      } as UtilityItem;

      scene.add(bGroup);

      const hitMesh = new THREE.Mesh(new THREE.BoxGeometry(w, totalH + 2, d), new THREE.MeshBasicMaterial({ visible: false }));
      hitMesh.position.set(x, totalH / 2 + 0.2, z);
      hitMesh.userData = bGroup.userData;
      scene.add(hitMesh);
      interactiveMeshes.push(hitMesh);
    };

    if (activeLayers.buildings ?? true) {
      createCivicBuilding(-13, -5.5, 9, 7, 6, 2, "Plot 42/A Commercial Plaza", "IND338421049280-V000540-A1", "TS-842/A", "Apex Commercial Estates Ltd");
      createCivicBuilding(0, -5.5, 11, 7, 8, 0, "DoLR State Cadastral Headquarters", "IND338421049280-V000720-B2", "TS-842/B", "Department of Land Resources (DoLR)");
      createCivicBuilding(13, -5.5, 8, 7, 5, 1, "Metropolitan Financial Exchange", "IND338421049280-V000420-C3", "TS-842/C", "Metropolitan Financial Consortium");
    }

    // 6. Botanical Assets & Root Zones
    const createNaturalTree = (x: number, z: number, r: number, name: string, species: string, age: number, ulpin: string) => {
      const tGroup = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.32, 2.8, 12),
        new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 })
      );
      trunk.position.set(0, 1.4, 0);
      trunk.castShadow = true;
      tGroup.add(trunk);

      const canopy = new THREE.Mesh(
        new THREE.DodecahedronGeometry(r, 2),
        new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85, flatShading: true })
      );
      canopy.position.set(0, 3.4, 0);
      canopy.castShadow = true;
      tGroup.add(canopy);

      const rootCage = new THREE.Mesh(
        new THREE.SphereGeometry(2.1, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x16a34a, wireframe: true, transparent: true, opacity: 0.4 })
      );
      rootCage.position.set(0, -1.6, 0);
      tGroup.add(rootCage);

      tGroup.position.set(x, 0.1, z);
      scene.add(tGroup);

      const hit = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 7), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.set(x, 1.8, z);
      hit.userData = {
        id: `TREE-${x}`,
        name,
        category: "ECO_TREE",
        depth: "0.0m to -2.8m (Root Zone) / +7.7m (Canopy)",
        status: "ACTIVE",
        ulpin,
        parcelId: `ECO-${ulpin.slice(-6)}`,
        owner: "Ward 114 Urban Forestry Council",
        species,
        botanicalName: species,
        ageYears: age,
        canopyRadiusM: r,
        rootDepthM: 2.8,
        custodian: "Ward 114 Urban Forestry Council",
        fellingPenaltyInr: 720000,
        annualCo2Kg: 84.4,
        taxRebateInr: 717,
        coordinates: "13.0610° N, 80.2520° E",
        zMin: -2.8,
        zMax: 7.7,
        details: "Protected Botanical Personhood. Statutory 3m subsurface root exclusion zone enforced against excavation."
      } as UtilityItem;
      scene.add(hit);
      interactiveMeshes.push(hit);
    };

    if (activeLayers.trees ?? true) {
      createNaturalTree(-19, -1, 1.6, "Heritage Neem Tree", "Azadirachta indica", 45, "IND338421049280-ECO0042");
      createNaturalTree(-7, -1, 1.9, "Heritage Peepal Tree", "Ficus religiosa", 60, "IND338421049280-ECO0043");
      createNaturalTree(6, -1, 1.7, "Urban Rain Tree", "Samanea saman", 30, "IND338421049280-ECO0044");
      createNaturalTree(19, -1, 1.8, "Protected Banyan Canopy", "Ficus benghalensis", 75, "IND338421049280-ECO0045");
    }

    // 7. Raycaster & Telemetry
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
          setHoveredItem({
            name: target.userData.name,
            ulpin: target.userData.ulpin,
            depth: target.userData.depth,
            x: e.clientX - rect.left + 15,
            y: e.clientY - rect.top - 15
          });
          return;
        }
      }
      setHoveredItem(null);
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
          onSelectItemRef.current(target.userData as UtilityItem);
          return;
        }
      }
      onSelectItemRef.current(null);
    };

    renderer.domElement.addEventListener("mousemove", handlePointerMove);
    renderer.domElement.addEventListener("click", handleClick);

    let reqId: number;
    const clock = new THREE.Clock();
    let frameCount = 0;
    let lastTime = performance.now();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      trainGroup.position.x = ((t * 6.5) % 52) - 26;
      controls.update();
      renderer.render(scene, camera);

      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        if (onTelemetryRef.current && cameraRef.current) {
          const cam = cameraRef.current;
          onTelemetryRef.current({
            cursorLat: "13.0610° N",
            cursorLon: "80.2520° E",
            cursorZ: "+14.8m MSL",
            camPitch: Math.round(cam.rotation.x * (180 / Math.PI)),
            camBearing: Math.round(cam.rotation.y * (180 / Math.PI)),
            fps: frameCount
          });
        }
        frameCount = 0;
        lastTime = now;
      }
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("mousemove", handlePointerMove);
      renderer.domElement.removeEventListener("click", handleClick);
      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeLayers]);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing bg-slate-100" />

      {hoveredItem && (
        <div
          className="absolute z-30 pointer-events-none bg-[#090d16]/95 text-slate-100 border border-slate-700/80 px-3 py-2 rounded shadow-2xl text-[11px] font-mono backdrop-blur-md"
          style={{ left: hoveredItem.x, top: hoveredItem.y }}
        >
          <div className="font-bold text-white flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {hoveredItem.name}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{hoveredItem.ulpin}</div>
          <div className="text-[10px] text-cyan-400 font-semibold mt-0.5">{hoveredItem.depth}</div>
        </div>
      )}
    </div>
  );
});

CadastreViewer3D.displayName = "CadastreViewer3D";
export default CadastreViewer3D;
