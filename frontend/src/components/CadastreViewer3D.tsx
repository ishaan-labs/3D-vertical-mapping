"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export interface UnitData {
  id: string;
  name: string;
  strata: string;
  zMin: number;
  zMax: number;
  owner: string;
  ulpin: string;
  color: number;
}

export const SAMPLE_UNITS: UnitData[] = [
  { id: "U1", name: "Metro Line 3 (Phase 2)", strata: "Underground (U)", zMin: -8, zMax: -4, owner: "Chennai Metro Rail Ltd", ulpin: "IND80219481920-U048028-9A", color: 0x8b5cf6 },
  { id: "U2", name: "Basement Parking B1", strata: "Underground (U)", zMin: -3, zMax: 0, owner: "Society Common Area", ulpin: "IND80219481920-U01E000-3F", color: 0x64748b },
  { id: "F1", name: "Commercial Unit 101", strata: "Vertical Real Estate (V)", zMin: 0.5, zMax: 3.5, owner: "Aditya Retail Corp", ulpin: "IND80219481920-V005023-B1", color: 0x3b82f6 },
  { id: "F2", name: "Residential Flat 201", strata: "Vertical Real Estate (V)", zMin: 4.0, zMax: 7.0, owner: "Ishaan Srivastava", ulpin: "IND80219481920-V028046-C2", color: 0x10b981 },
  { id: "F3", name: "Residential Flat 301", strata: "Vertical Real Estate (V)", zMin: 7.5, zMax: 10.5, owner: "Kavya Sharma", ulpin: "IND80219481920-V04B069-D3", color: 0x06b6d4 },
  { id: "A1", name: "Solar Air-Rights Envelope", strata: "Air Rights (A)", zMin: 11.5, zMax: 14.5, owner: "GreenEnergy Lease", ulpin: "IND80219481920-A073091-E4", color: 0xf59e0b },
];

export default function CadastreViewer3D({
  onSelectUnit,
  isXRay,
  explodedOffset
}: {
  onSelectUnit: (unit: UnitData) => void;
  isXRay: boolean;
  explodedOffset: number;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(26, 20, 26);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(15, 30, 20);
    scene.add(dirLight);

    // Ground Surface (Z=0)
    const groundGeo = new THREE.PlaneGeometry(24, 24);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: isXRay ? 0.25 : 0.95,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const grid = new THREE.GridHelper(24, 24, 0x38bdf8, 0x334155);
    scene.add(grid);

    // Volumetric 3D Parcels
    const meshes: THREE.Mesh[] = [];
    SAMPLE_UNITS.forEach((unit, idx) => {
      const h = unit.zMax - unit.zMin;
      const isUnderground = unit.zMin < 0;

      let currentZMin = unit.zMin;
      if (!isUnderground && explodedOffset > 0) {
        currentZMin += idx * explodedOffset * 1.5;
      }

      const geo = new THREE.BoxGeometry(8, h, 8);
      const mat = new THREE.MeshStandardMaterial({
        color: unit.color,
        transparent: true,
        opacity: isUnderground && !isXRay ? 0.35 : 0.85,
        roughness: 0.3,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, currentZMin + h / 2, 0);
      mesh.userData = unit;
      scene.add(mesh);
      meshes.push(mesh);

      const edgeGeo = new THREE.EdgesGeometry(geo);
      const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
      const wireframe = new THREE.LineSegments(edgeGeo, edgeMat);
      mesh.add(wireframe);
    });

    // Subsurface Metro Tunnel Tube
    const tunnelGeo = new THREE.CylinderGeometry(1.8, 1.8, 26, 16);
    const tunnelMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: isXRay ? 0.9 : 0.4,
    });
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    tunnel.rotation.z = Math.PI / 2;
    tunnel.position.set(0, -6, 2);
    scene.add(tunnel);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const selected = intersects[0].object.userData as UnitData;
        onSelectUnit(selected);
      }
    };

    renderer.domElement.addEventListener("click", handleClick);

    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      scene.rotation.y += 0.002;
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
  }, [isXRay, explodedOffset, onSelectUnit]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[500px] cursor-pointer rounded-xl overflow-hidden shadow-2xl border border-slate-800"
    />
  );
}
