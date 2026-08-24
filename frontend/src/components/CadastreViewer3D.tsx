"use client";

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { BuildingRecord, PropertyUnit, SubsurfaceAsset } from "@/data/cadastreHierarchy";

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
  focusFloor: (floorNum: number) => void;
}

interface CadastreViewerProps {
  buildings: BuildingRecord[];
  subsurfaceAssets: SubsurfaceAsset[];
  selectedBuilding: BuildingRecord | null;
  selectedUnit: PropertyUnit | null;
  selectedSubsurface: SubsurfaceAsset | null;
  activeFloorFilter: number | null;
  showUnderground: boolean;
  onSelectBuilding: (b: BuildingRecord) => void;
  onSelectUnit: (u: PropertyUnit, b: BuildingRecord) => void;
  onSelectSubsurface: (s: SubsurfaceAsset) => void;
  onTelemetryUpdate?: (data: TelemetryData) => void;
}

const CadastreViewer3D = forwardRef<CadastreViewerRef, CadastreViewerProps>(({
  buildings = [],
  subsurfaceAssets = [],
  selectedBuilding,
  selectedUnit,
  selectedSubsurface,
  activeFloorFilter,
  showUnderground = true,
  onSelectBuilding,
  onSelectUnit,
  onSelectSubsurface,
  onTelemetryUpdate
}, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [hoveredLabel, setHoveredLabel] = useState<{ title: string; subtitle: string; depth: string; x: number; y: number } | null>(null);

  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.set(38, 16, 44);
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
    focusFloor: (floorNum: number) => {
      if (controlsRef.current) {
        controlsRef.current.target.set(0, floorNum * 2.4, 0);
        controlsRef.current.update();
      }
    }
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
    camera.position.set(38, 16, 44);
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

    // Advanced Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xfffbf0, 2.2);
    sun.position.set(45, 65, 35);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    scene.add(sun);

    const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.6);
    fillLight.position.set(-30, 25, -20);
    scene.add(fillLight);

    const interactiveMeshes: THREE.Mesh[] = [];

    // --- 1. Ground Surface & Roadway ---
    const sidewalk = new THREE.Mesh(
      new THREE.BoxGeometry(44, 0.4, 11),
      new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.9 })
    );
    sidewalk.position.set(0, 0, -5.5);
    sidewalk.receiveShadow = true;
    scene.add(sidewalk);

    const road = new THREE.Mesh(
      new THREE.BoxGeometry(44, 0.25, 4.2),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95 })
    );
    road.position.set(0, -0.05, 1);
    road.receiveShadow = true;
    scene.add(road);

    const curb = new THREE.Mesh(
      new THREE.BoxGeometry(44, 0.15, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 })
    );
    curb.position.set(0, 0.05, -1.0);
    scene.add(curb);

    const yLine = new THREE.Mesh(
      new THREE.PlaneGeometry(44, 0.12),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    yLine.rotation.x = -Math.PI / 2;
    yLine.position.set(0, 0.09, 1);
    scene.add(yLine);

    // --- 2. Subterranean Bedrock Chamber ---
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

    // --- 3. ARCHITECTURAL BIM BUILDINGS (LOD-3 Mullions, Columns, Spandrels) ---
    const bldPositions = [
      { x: -13, z: -5.5, w: 9, d: 7 },
      { x: 3, z: -5.5, w: 11, d: 7 },
      { x: 16, z: -5.5, w: 8, d: 7 }
    ];

    buildings.forEach((bld, idx) => {
      const pos = bldPositions[idx] || { x: (idx - 1) * 14, z: -5.5, w: 8, d: 7 };
      const floorH = 2.4;
      const bGroup = new THREE.Group();
      const totalFloors = bld.floorsCount;
      const totalH = totalFloors * floorH;
      const isSelectedBld = selectedBuilding?.id === bld.id;

      const slabMat = new THREE.MeshStandardMaterial({
        color: isSelectedBld ? 0x0284c7 : 0xe2e8f0,
        roughness: 0.6
      });

      const columnMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 });
      const spandrelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

      // Core Structure
      const core = new THREE.Mesh(
        new THREE.BoxGeometry(pos.w * 0.35, totalH, pos.d * 0.35),
        new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 })
      );
      core.position.set(0, totalH / 2, 0);
      core.castShadow = true;
      bGroup.add(core);

      // Floor-by-Floor Construction
      for (let f = 1; f <= totalFloors; f++) {
        const floorY = (f - 1) * floorH;
        const isFloorActive = activeFloorFilter === f || (selectedUnit && selectedUnit.floorNumber === f && isSelectedBld);
        const isGhost = f > (totalFloors - bld.ghostFloorsCount);

        const glassMat = new THREE.MeshStandardMaterial({
          color: isFloorActive ? 0x38bdf8 : (isGhost ? 0xe11d48 : 0x0284c7),
          metalness: 0.4,
          roughness: 0.1,
          transparent: true,
          opacity: isFloorActive ? 0.92 : 0.55,
          emissive: isFloorActive ? 0x0284c7 : (isGhost ? 0x9f1239 : 0x000000),
          emissiveIntensity: isFloorActive ? 0.6 : (isGhost ? 0.4 : 0.0)
        });

        // Floor Slab
        const slab = new THREE.Mesh(new THREE.BoxGeometry(pos.w, 0.22, pos.d), slabMat);
        slab.position.set(0, floorY + 0.11, 0);
        slab.castShadow = true;
        slab.receiveShadow = true;
        bGroup.add(slab);

        // Spandrel Band
        const spandrel = new THREE.Mesh(new THREE.BoxGeometry(pos.w - 0.05, 0.35, pos.d - 0.05), spandrelMat);
        spandrel.position.set(0, floorY + 0.32, 0);
        bGroup.add(spandrel);

        // Vision Glass
        const glass = new THREE.Mesh(new THREE.BoxGeometry(pos.w - 0.1, floorH - 0.55, pos.d - 0.1), glassMat);
        glass.position.set(0, floorY + (floorH - 0.55) / 2 + 0.45, 0);
        bGroup.add(glass);

        // Structural Columns
        const colPositions = [
          [-pos.w/2 + 0.25, -pos.d/2 + 0.25],
          [pos.w/2 - 0.25, -pos.d/2 + 0.25],
          [-pos.w/2 + 0.25, pos.d/2 - 0.25],
          [pos.w/2 - 0.25, pos.d/2 - 0.25]
        ];
        colPositions.forEach(([cx, cz]) => {
          const col = new THREE.Mesh(new THREE.BoxGeometry(0.3, floorH - 0.22, 0.3), columnMat);
          col.position.set(cx, floorY + floorH / 2, cz);
          col.castShadow = true;
          bGroup.add(col);
        });

        // Mullions
        for (let mx = -pos.w/2 + 1.8; mx < pos.w/2; mx += 1.8) {
          const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, floorH - 0.22, 0.15), columnMat);
          fin.position.set(mx, floorY + floorH / 2, pos.d/2 + 0.02);
          bGroup.add(fin);
        }

        // Click Hit Mesh per floor
        const floorHit = new THREE.Mesh(
          new THREE.BoxGeometry(pos.w + 0.5, floorH, pos.d + 0.5),
          new THREE.MeshBasicMaterial({ visible: false })
        );
        floorHit.position.set(pos.x, floorY + floorH / 2 + 0.2, pos.z);

        const matchedUnit = (bld.units || []).find(u => u.floorNumber === f) || {
          unitId: `U-${f}01`,
          floorNumber: f,
          unitCode: `Unit F${f}`,
          useType: "RESIDENTIAL",
          elevationRange: `+${floorY.toFixed(1)}m to +${(floorY + floorH).toFixed(1)}m MSL`,
          zMin: floorY,
          zMax: floorY + floorH,
          carpetAreaSqm: pos.w * pos.d * 0.8,
          volumeM3: pos.w * pos.d * 0.8 * floorH,
          ulpin3D: `${bld.ulpin2D}-V${Math.round(floorY).toString().padStart(3, '0')}${Math.round(floorY + floorH).toString().padStart(3, '0')}-F${f}`,
          ownerName: `Unit Owner F${f}`,
          udsShareSqft: (pos.w * pos.d * 0.8) * 10,
          status: "REGISTERED"
        };

        floorHit.userData = {
          type: "UNIT",
          building: bld,
          unit: matchedUnit,
          label: `${bld.name} — Floor ${f}`,
          depth: `Elevation: +${floorY.toFixed(1)}m to +${(floorY + floorH).toFixed(1)}m MSL`
        };

        scene.add(floorHit);
        interactiveMeshes.push(floorHit);
      }

      // Rooftop Plant Room & Chillers
      const plantRoom = new THREE.Mesh(
        new THREE.BoxGeometry(pos.w * 0.45, 1.4, pos.d * 0.45),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 })
      );
      plantRoom.position.set(0, totalH + 0.7, 0);
      bGroup.add(plantRoom);

      const chillerMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.3 });
      const chiller1 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.4, 16), chillerMat);
      chiller1.position.set(-pos.w * 0.25, totalH + 0.3, 0);
      const chiller2 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.4, 16), chillerMat);
      chiller2.position.set(pos.w * 0.25, totalH + 0.3, 0);
      bGroup.add(chiller1);
      bGroup.add(chiller2);

      bGroup.position.set(pos.x, 0.2, pos.z);
      scene.add(bGroup);
    });

    // --- 4. PROCEDURAL BOTANICAL TREES (Articulated Canopies & Subsurface Root Cages) ---
    const createNaturalTree = (x: number, z: number, r: number, name: string, species: string, age: number, ulpin: string) => {
      const tGroup = new THREE.Group();

      const barkMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.95 });
      const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8, flatShading: true });
      const highlightFoliageMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.75, flatShading: true });

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.42, 2.6, 12), barkMat);
      trunk.position.set(0, 1.3, 0);
      trunk.castShadow = true;
      tGroup.add(trunk);

      const branch1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 1.2, 8), barkMat);
      branch1.position.set(-0.35, 2.2, 0.1);
      branch1.rotation.z = Math.PI / 5;
      tGroup.add(branch1);

      const branch2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 1.2, 8), barkMat);
      branch2.position.set(0.35, 2.3, -0.1);
      branch2.rotation.z = -Math.PI / 5;
      tGroup.add(branch2);

      // Multi-tier Canopies
      const mainCanopy = new THREE.Mesh(new THREE.DodecahedronGeometry(r * 0.9, 1), foliageMat);
      mainCanopy.position.set(0, 3.4, 0);
      mainCanopy.castShadow = true;
      tGroup.add(mainCanopy);

      const subCanopy1 = new THREE.Mesh(new THREE.DodecahedronGeometry(r * 0.65, 1), highlightFoliageMat);
      subCanopy1.position.set(-r * 0.5, 3.0, 0.2);
      subCanopy1.castShadow = true;
      tGroup.add(subCanopy1);

      const subCanopy2 = new THREE.Mesh(new THREE.DodecahedronGeometry(r * 0.6, 1), highlightFoliageMat);
      subCanopy2.position.set(r * 0.45, 3.2, -0.25);
      subCanopy2.castShadow = true;
      tGroup.add(subCanopy2);

      // Subsurface Root Exclusion Cylinder (-2.8m)
      const rootCage = new THREE.Mesh(
        new THREE.CylinderGeometry(2.1, 1.8, 2.8, 16, 4, true),
        new THREE.MeshBasicMaterial({ color: 0x16a34a, wireframe: true, transparent: true, opacity: 0.45 })
      );
      rootCage.position.set(0, -1.4, 0);
      tGroup.add(rootCage);

      tGroup.position.set(x, 0.1, z);
      scene.add(tGroup);

      const hit = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.2, r * 1.2, 7.5), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.set(x, 1.8, z);
      hit.userData = {
        type: "SUBSURFACE",
        subsurface: {
          id: "SUB-TREE",
          name,
          category: "ROOT_ZONE",
          depthRange: "0.0m to -2.8m Subsurface",
          zMin: -2.8,
          zMax: 0.0,
          owner: "Ward 114 Urban Forestry Council",
          ulpin3D: ulpin,
          clearanceBufferM: 3.5,
          details: `Protected Botanical Personhood Entity (${species}, ${age} Years). Statutory 3m root exclusion zone.`
        },
        label: name,
        depth: "0.0m to -2.8m Subsurface"
      };
      scene.add(hit);
      interactiveMeshes.push(hit);
    };

    createNaturalTree(-19, -1, 1.7, "Heritage Neem Tree", "Azadirachta indica", 45, "IND338421049280-ECO0042");
    createNaturalTree(-7, -1, 1.9, "Heritage Peepal Tree", "Ficus religiosa", 60, "IND338421049280-ECO0043");
    createNaturalTree(6, -1, 1.75, "Urban Rain Tree", "Samanea saman", 30, "IND338421049280-ECO0044");
    createNaturalTree(19, -1, 1.85, "Protected Banyan Canopy", "Ficus benghalensis", 75, "IND338421049280-ECO0045");

    // --- 5. SUBTERRANEAN METRO TRAIN & INDUSTRIAL FLANGED CONDUITS ---
    const trainGroup = new THREE.Group();
    if (showUnderground) {
      // Metro Platform & Dual Rails
      const platform = new THREE.Mesh(
        new THREE.BoxGeometry(44, 0.5, 6.8),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 })
      );
      platform.position.set(0, -9.85, 5);
      platform.receiveShadow = true;
      scene.add(platform);

      const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
      for (let sx = -21; sx <= 21; sx += 1.4) {
        const sleeper = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 2.6), sleeperMat);
        sleeper.position.set(sx, -9.54, 5);
        scene.add(sleeper);
      }

      const railMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
      const rail1 = new THREE.Mesh(new THREE.BoxGeometry(44, 0.12, 0.08), railMat);
      rail1.position.set(0, -9.44, 4.3);
      const rail2 = new THREE.Mesh(new THREE.BoxGeometry(44, 0.12, 0.08), railMat);
      rail2.position.set(0, -9.44, 5.7);
      scene.add(rail1);
      scene.add(rail2);

      // Stainless Articulated Train
      const stainlessSteelMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.85, roughness: 0.25 });
      const liveryCyanMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.3 });
      const glassTintMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1, emissive: 0x38bdf8, emissiveIntensity: 0.2 });
      const hvacMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 });

      const buildMetroCar = (offsetX: number, isLead: boolean, isRear: boolean) => {
        const car = new THREE.Group();
        const carLen = 8.5;
        const carH = 2.3;
        const carW = 2.1;

        const body = new THREE.Mesh(new THREE.BoxGeometry(carLen, carH, carW), stainlessSteelMat);
        body.position.set(0, carH / 2 + 0.15, 0);
        body.castShadow = true;
        car.add(body);

        const stripe = new THREE.Mesh(new THREE.BoxGeometry(carLen + 0.02, 0.25, carW + 0.02), liveryCyanMat);
        stripe.position.set(0, 0.9, 0);
        car.add(stripe);

        const windowBand = new THREE.Mesh(new THREE.BoxGeometry(carLen * 0.85, 0.75, carW + 0.04), glassTintMat);
        windowBand.position.set(0, 1.5, 0);
        car.add(windowBand);

        const hvac1 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.25, 1.3), hvacMat);
        hvac1.position.set(-1.8, carH + 0.25, 0);
        const hvac2 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.25, 1.3), hvacMat);
        hvac2.position.set(1.8, carH + 0.25, 0);
        car.add(hvac1);
        car.add(hvac2);

        if (isLead) {
          const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.05, 1.2, 4), stainlessSteelMat);
          nose.rotation.z = Math.PI / 2;
          nose.rotation.y = Math.PI / 4;
          nose.position.set(carLen / 2 + 0.35, 1.25, 0);
          car.add(nose);

          const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 1.6), glassTintMat);
          windshield.position.set(carLen / 2 + 0.55, 1.55, 0);
          car.add(windshield);
        }

        car.position.set(offsetX, 0, 0);
        return car;
      };

      const carLead = buildMetroCar(4.6, true, false);
      const carRear = buildMetroCar(-4.6, false, true);
      trainGroup.add(carLead);
      trainGroup.add(carRear);
      trainGroup.position.set(0, -9.45, 5);
      scene.add(trainGroup);

      const metroHit = new THREE.Mesh(new THREE.BoxGeometry(22, 3.5, 6.8), new THREE.MeshBasicMaterial({ visible: false }));
      metroHit.position.set(0, -9.45, 5);
      metroHit.userData = {
        type: "SUBSURFACE",
        subsurface: subsurfaceAssets.find(s => s.category === "METRO") || {
          id: "SUB-MTR",
          name: "CMRL Metro Line 2 Underground Tunnel",
          category: "METRO",
          depthRange: "-8.5m to -12.0m MSL",
          zMin: -12.0,
          zMax: -8.5,
          owner: "Chennai Metro Rail Ltd",
          ulpin3D: "IND338421049280-U085120-M2",
          clearanceBufferM: 15.0,
          details: "Subterranean rapid transit box. Stainless steel twin-car formation."
        },
        label: "CMRL Metro Line 2 Tunnel",
        depth: "-8.5m to -12.0m MSL"
      };
      scene.add(metroHit);
      interactiveMeshes.push(metroHit);

      // Industrial Flanged Utility Pipelines
      const makePipe = (pts: [number, number, number][], color: number, rad: number, asset: SubsurfaceAsset) => {
        const pGroup = new THREE.Group();
        const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));

        const tube = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 64, rad, 16, false),
          new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.5, emissive: color, emissiveIntensity: 0.35 })
        );
        tube.castShadow = true;
        pGroup.add(tube);

        // Flange Rings
        const flangeMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
        for (let t = 0.1; t <= 0.9; t += 0.2) {
          const pt = curve.getPointAt(t);
          const tangent = curve.getTangentAt(t);
          const flange = new THREE.Mesh(new THREE.CylinderGeometry(rad * 1.35, rad * 1.35, 0.12, 16), flangeMat);
          flange.position.copy(pt);
          flange.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
          pGroup.add(flange);
        }
        scene.add(pGroup);

        const hit = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, rad * 2, 8, false), new THREE.MeshBasicMaterial({ visible: false }));
        hit.userData = {
          type: "SUBSURFACE",
          subsurface: asset,
          label: asset.name,
          depth: asset.depthRange
        };
        scene.add(hit);
        interactiveMeshes.push(hit);
      };

      const telecomAsset = subsurfaceAssets.find(s => s.category === "TELECOM") || {
        id: "SUB-TEL", name: "BSNL Gigabit Optic Fiber Backbone", category: "TELECOM", depthRange: "-1.8m to -2.2m MSL", zMin: -2.2, zMax: -1.8, owner: "Bharat Sanchar Nigam Ltd", ulpin3D: "IND338421049280-U018022-T1", clearanceBufferM: 1.5, details: "Optic fiber backbone."
      };
      const waterAsset = subsurfaceAssets.find(s => s.category === "WATER") || {
        id: "SUB-WTR", name: "Municipal 500mm Water Trunk Main", category: "WATER", depthRange: "-3.4m to -3.8m MSL", zMin: -3.8, zMax: -3.4, owner: "Chennai MetroWater Board", ulpin3D: "IND338421049280-U034038-W4", clearanceBufferM: 2.0, details: "Potable distribution main."
      };
      const gasAsset = subsurfaceAssets.find(s => s.category === "GAS") || {
        id: "SUB-GAS", name: "GAIL High-Pressure Natural Gas Conduit", category: "GAS", depthRange: "-5.2m to -5.6m MSL", zMin: -5.6, zMax: -5.2, owner: "GAIL (India) Limited", ulpin3D: "IND338421049280-U052056-G9", clearanceBufferM: 3.0, details: "19 Bar gas conduit."
      };

      makePipe([[-22, -1.8, 2.5], [-8, -1.8, 2.0], [2, -2.0, 0.5], [22, -2.0, -1.0]], 0xec4899, 0.28, telecomAsset);
      makePipe([[-22, -3.4, 0.5], [-6, -3.4, 0.5], [4, -3.8, 2.5], [22, -3.8, 2.5]], 0x059669, 0.42, waterAsset);
      makePipe([[-22, -5.2, -1.5], [-4, -5.2, -1.5], [6, -5.6, 0.5], [22, -5.6, 1.8]], 0xd97706, 0.38, gasAsset);
    }

    // --- 6. RAYCASTER FOR INTERACTIVE EXPLORATION ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, true);

      if (hits.length > 0 && hits[0].object.userData?.label) {
        const u = hits[0].object.userData;
        setHoveredLabel({
          title: u.label,
          subtitle: u.type === "UNIT" ? `ULPIN: ${u.unit?.ulpin3D}` : `Owner: ${u.subsurface?.owner}`,
          depth: u.depth,
          x: e.clientX - rect.left + 15,
          y: e.clientY - rect.top - 15
        });
        return;
      }
      setHoveredLabel(null);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, true);

      if (hits.length > 0 && hits[0].object.userData) {
        const u = hits[0].object.userData;
        if (u.type === "UNIT") {
          onSelectBuilding(u.building);
          onSelectUnit(u.unit, u.building);
        } else if (u.type === "SUBSURFACE") {
          onSelectSubsurface(u.subsurface);
        }
      }
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
        if (onTelemetryUpdate && cameraRef.current) {
          const cam = cameraRef.current;
          onTelemetryUpdate({
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
  }, [buildings, subsurfaceAssets, selectedBuilding, selectedUnit, selectedSubsurface, activeFloorFilter, showUnderground]);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing bg-slate-100" />

      {hoveredLabel && (
        <div
          className="absolute z-30 pointer-events-none bg-[#090d16]/95 text-slate-100 border border-slate-700 px-3 py-2 rounded shadow-2xl text-[11px] font-mono backdrop-blur-md"
          style={{ left: hoveredLabel.x, top: hoveredLabel.y }}
        >
          <div className="font-bold text-white flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            {hoveredLabel.title}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{hoveredLabel.subtitle}</div>
          <div className="text-[10px] text-cyan-400 font-semibold mt-0.5">{hoveredLabel.depth}</div>
        </div>
      )}
    </div>
  );
});

CadastreViewer3D.displayName = "CadastreViewer3D";
export default CadastreViewer3D;
