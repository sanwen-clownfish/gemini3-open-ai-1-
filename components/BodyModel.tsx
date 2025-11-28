import React, { useState, useRef } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { MuscleId } from '../types';

interface BodyPartProps {
  position: [number, number, number];
  args: any; 
  muscleId: MuscleId | null;
  selectedMuscle: MuscleId | null;
  onSelect: (id: MuscleId) => void;
  rotation?: [number, number, number];
  scale?: [number, number, number];
  name?: string;
  shape?: 'capsule' | 'box' | 'sphere' | 'cylinder';
}

const BodyPart = ({ 
  position, 
  args, 
  muscleId, 
  selectedMuscle, 
  onSelect, 
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  name,
  shape = 'capsule'
}: BodyPartProps) => {
  const [hovered, setHovered] = useState(false);
  const mesh = useRef<THREE.Mesh>(null);
  
  const isSelected = muscleId && selectedMuscle === muscleId;
  const isInteractive = !!muscleId;

  // Lighter base colors for better visibility
  const baseColorInteractive = 0xa1a1aa; // Zinc 400 (Silver-ish)
  const baseColorStatic = 0x52525b;      // Zinc 600 (Darker Grey)
  const highlightColor = 0x60a5fa;       // Blue 400
  const hoverColor = 0xe4e4e7;           // Zinc 200 (Almost white)

  useFrame((state) => {
    if (mesh.current) {
      // Cast material to MeshStandardMaterial to access specific properties
      const material = mesh.current.material as THREE.MeshStandardMaterial;

      // Lerp logic could be added for smoother color transition, but direct set is snappier here
      if (isSelected) {
        material.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
        material.color.setHex(highlightColor);
        material.emissive.setHex(0x1d4ed8); // Deep blue glow
      } else if (hovered && isInteractive) {
         material.emissiveIntensity = 0.3;
         material.color.setHex(hoverColor);
         material.emissive.setHex(0x000000);
      } else {
        material.emissiveIntensity = 0;
        material.emissive.setHex(0x000000);
        // Set brighter base color
        material.color.setHex(isInteractive ? baseColorInteractive : baseColorStatic);
      }
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (isInteractive && muscleId) {
      e.stopPropagation();
      onSelect(muscleId);
    }
  };

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh
        ref={mesh as any}
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); isInteractive && setHovered(true); }}
        onPointerOut={() => setHovered(false)}
      >
        {shape === 'capsule' && <capsuleGeometry args={args} />}
        {shape === 'box' && <boxGeometry args={args} />}
        {shape === 'sphere' && <sphereGeometry args={args} />}
        {shape === 'cylinder' && <cylinderGeometry args={args} />}
        
        <meshStandardMaterial
          roughness={0.4} // Slightly rougher to catch more light
          metalness={0.3} // Reduced metalness so it's not too dark/reflective
          color={isInteractive ? "#a1a1aa" : "#52525b"} // Initial color match
        />
      </mesh>
      {hovered && isInteractive && name && (
        <Html position={[0, 0, 0]} distanceFactor={8} center style={{pointerEvents: 'none', zIndex: 100}}>
          <div className="bg-white/90 text-black text-xs px-2 py-1.5 rounded-md border border-white/50 whitespace-nowrap font-bold shadow-xl backdrop-blur-md transform -translate-y-8">
            {name}
          </div>
        </Html>
      )}
    </group>
  );
};

export const BodyModel: React.FC<{ selectedMuscle: MuscleId | null, onSelectMuscle: (id: MuscleId) => void }> = ({ selectedMuscle, onSelectMuscle }) => {
  return (
    <div className="w-full h-full relative bg-gradient-to-b from-zinc-800 to-black">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 1.5, 4.8]} fov={40} />
        
        {/* Improved Lighting Setup for Visibility */}
        <ambientLight intensity={1.2} /> {/* High ambient light base */}
        
        {/* Main Front Light */}
        <directionalLight position={[0, 2, 5]} intensity={2.0} color="#ffffff" />
        
        {/* Top Rim Light */}
        <spotLight position={[0, 6, 0]} intensity={1.5} color="#ffffff" castShadow />
        
        {/* Side Fill Lights */}
        <spotLight position={[5, 2, 5]} angle={0.6} penumbra={0.5} intensity={1.5} color="#bfdbfe" /> {/* Blue tint fill */}
        <spotLight position={[-5, 2, 5]} angle={0.6} penumbra={0.5} intensity={1.5} color="#e4e4e7" /> {/* White fill */}
        
        {/* Back Light for rim effect */}
        <pointLight position={[0, 2, -3]} intensity={1.5} color="#3b82f6" /> 
        
        <group position={[0, -1.2, 0]}>
            
            {/* ================= HEAD ================= */}
            <BodyPart position={[0, 3.9, 0]} args={[0.32, 0.45, 4, 16]} muscleId="head" name="头部/颈部" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />

            {/* ================= CHEST (DETAILED) ================= */}
            <group position={[0, 0, 0]}>
                 {/* Upper Chest (Clavicular) - Angled */}
                 <BodyPart position={[-0.25, 3.25, 0.22]} args={[0.45, 0.2, 0.15]} shape="box" rotation={[0, 0, -0.2]} muscleId="upper_chest" name="上胸 (Upper)" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
                 <BodyPart position={[0.25, 3.25, 0.22]} args={[0.45, 0.2, 0.15]} shape="box" rotation={[0, 0, 0.2]} muscleId="upper_chest" name="上胸 (Upper)" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
                 
                 {/* Middle Chest (Sternal) - Main Mass */}
                 <BodyPart position={[-0.22, 2.95, 0.28]} args={[0.42, 0.35, 0.18]} shape="box" muscleId="middle_chest" name="中胸 (Middle)" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
                 <BodyPart position={[0.22, 2.95, 0.28]} args={[0.42, 0.35, 0.18]} shape="box" muscleId="middle_chest" name="中胸 (Middle)" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
                 
                 {/* Lower Chest (Costal) - Bottom Edge */}
                 <BodyPart position={[-0.25, 2.7, 0.25]} args={[0.4, 0.15, 0.12]} shape="box" rotation={[0, 0, 0.1]} muscleId="lower_chest" name="下胸 (Lower)" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
                 <BodyPart position={[0.25, 2.7, 0.25]} args={[0.4, 0.15, 0.12]} shape="box" rotation={[0, 0, -0.1]} muscleId="lower_chest" name="下胸 (Lower)" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />

                 {/* Outer Chest - Vertical Definition */}
                 <BodyPart position={[-0.5, 2.95, 0.22]} args={[0.12, 0.5, 0.12]} shape="box" rotation={[0, 0, 0.1]} muscleId="outer_chest" name="外沿 (Outer)" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
                 <BodyPart position={[0.5, 2.95, 0.22]} args={[0.12, 0.5, 0.12]} shape="box" rotation={[0, 0, -0.1]} muscleId="outer_chest" name="外沿 (Outer)" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
            </group>

            {/* ================= BACK (DETAILED) ================= */}
            <group>
                {/* Traps - Upper Diamond */}
                <BodyPart position={[0, 3.45, -0.2]} args={[0.5, 0.4, 0.2]} shape="cylinder" rotation={[0, 0, 0]} muscleId="traps" name="斜方肌" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
                {/* Rhomboids - Middle Center */}
                <BodyPart position={[0, 2.9, -0.25]} args={[0.4, 0.5, 0.1]} shape="box" muscleId="rhomboids" name="菱形肌" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
                {/* Lats - The Wings */}
                <BodyPart position={[-0.55, 2.5, -0.2]} args={[0.25, 1.1, 0.1]} shape="box" rotation={[0, 0, 0.2]} muscleId="lats" name="背阔肌" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
                <BodyPart position={[0.55, 2.5, -0.2]} args={[0.25, 1.1, 0.1]} shape="box" rotation={[0, 0, -0.2]} muscleId="lats" name="背阔肌" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
                {/* Teres - Upper Outer Back */}
                <BodyPart position={[-0.6, 3.0, -0.15]} args={[0.15, 0.2, 0.1]} shape="box" rotation={[0, 0, 0.3]} muscleId="teres" name="大圆肌" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
                <BodyPart position={[0.6, 3.0, -0.15]} args={[0.15, 0.2, 0.1]} shape="box" rotation={[0, 0, -0.3]} muscleId="teres" name="大圆肌" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
                {/* Lower Back */}
                <BodyPart position={[0, 2.0, -0.25]} args={[0.25, 0.5, 0.15]} shape="box" muscleId="lower_back" name="竖脊肌" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
            </group>

            {/* ================= SHOULDERS (DELTS) ================= */}
            {/* Side Delt - The Cap */}
            <BodyPart position={[-0.85, 3.3, 0]} args={[0.26]} shape="sphere" muscleId="side_delt" name="中束" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
            <BodyPart position={[0.85, 3.3, 0]} args={[0.26]} shape="sphere" muscleId="side_delt" name="中束" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
            {/* Front Delt */}
            <BodyPart position={[-0.7, 3.25, 0.18]} args={[0.18]} shape="sphere" muscleId="front_delt" name="前束" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
            <BodyPart position={[0.7, 3.25, 0.18]} args={[0.18]} shape="sphere" muscleId="front_delt" name="前束" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
            {/* Rear Delt */}
            <BodyPart position={[-0.7, 3.25, -0.18]} args={[0.18]} shape="sphere" muscleId="rear_delt" name="后束" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
            <BodyPart position={[0.7, 3.25, -0.18]} args={[0.18]} shape="sphere" muscleId="rear_delt" name="后束" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />

            {/* ================= ARMS (DETAILED) ================= */}
            {/* Left Arm */}
            <group position={[-0.95, 2.5, 0]}>
                 {/* Biceps Long Head (Outer) */}
                 <BodyPart position={[-0.08, 0, 0.1]} args={[0.07, 0.55, 4, 16]} shape="capsule" muscleId="biceps_long" name="长头" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
                 {/* Biceps Short Head (Inner) */}
                 <BodyPart position={[0.08, 0, 0.1]} args={[0.07, 0.5, 4, 16]} shape="capsule" muscleId="biceps_short" name="短头" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
                 {/* Brachialis (Side/Under) */}
                 <BodyPart position={[-0.12, -0.1, 0.05]} args={[0.05, 0.3, 4, 16]} shape="capsule" muscleId="brachialis" name="肱肌" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
                 
                 {/* Triceps Long Head (Inner Back) */}
                 <BodyPart position={[0.06, 0.05, -0.12]} args={[0.08, 0.55, 4, 16]} shape="capsule" muscleId="triceps_long" name="三头-长头" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
                 {/* Triceps Lateral Head (Outer Back) */}
                 <BodyPart position={[-0.08, 0.15, -0.1]} args={[0.07, 0.4, 4, 16]} shape="capsule" muscleId="triceps_lateral" name="三头-外侧头" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
                 
                 {/* Forearm */}
                 <BodyPart position={[0, -0.7, 0]} args={[0.11, 0.65, 4, 16]} rotation={[0, 0, 0.1]} muscleId="forearms" name="前臂" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
            </group>

             {/* Right Arm */}
            <group position={[0.95, 2.5, 0]}>
                 {/* Biceps Long Head (Outer) */}
                 <BodyPart position={[0.08, 0, 0.1]} args={[0.07, 0.55, 4, 16]} shape="capsule" muscleId="biceps_long" name="长头" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
                 {/* Biceps Short Head (Inner) */}
                 <BodyPart position={[-0.08, 0, 0.1]} args={[0.07, 0.5, 4, 16]} shape="capsule" muscleId="biceps_short" name="短头" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
                  {/* Brachialis (Side/Under) */}
                 <BodyPart position={[0.12, -0.1, 0.05]} args={[0.05, 0.3, 4, 16]} shape="capsule" muscleId="brachialis" name="肱肌" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
                 
                 {/* Triceps Long Head (Inner Back) */}
                 <BodyPart position={[-0.06, 0.05, -0.12]} args={[0.08, 0.55, 4, 16]} shape="capsule" muscleId="triceps_long" name="三头-长头" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
                 {/* Triceps Lateral Head (Outer Back) */}
                 <BodyPart position={[0.08, 0.15, -0.1]} args={[0.07, 0.4, 4, 16]} shape="capsule" muscleId="triceps_lateral" name="三头-外侧头" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
                 
                 {/* Forearm */}
                 <BodyPart position={[0, -0.7, 0]} args={[0.11, 0.65, 4, 16]} rotation={[0, 0, -0.1]} muscleId="forearms" name="前臂" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
            </group>

            {/* ================= CORE ================= */}
             {/* Upper Abs */}
             <BodyPart position={[0, 2.3, 0.2]} args={[0.32, 0.35, 0.1]} shape="box" muscleId="abs_upper" name="上腹" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
             {/* Lower Abs */}
             <BodyPart position={[0, 1.85, 0.2]} args={[0.3, 0.45, 0.1]} shape="box" muscleId="abs_lower" name="下腹" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
             {/* Obliques */}
             <BodyPart position={[-0.35, 2.1, 0.15]} args={[0.15, 0.7, 4, 16]} shape="capsule" muscleId="obliques" name="腹外斜肌" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
             <BodyPart position={[0.35, 2.1, 0.15]} args={[0.15, 0.7, 4, 16]} shape="capsule" muscleId="obliques" name="腹外斜肌" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />

            {/* ================= HIPS/LEGS ================= */}
            {/* Glutes */}
             <BodyPart position={[0, 1.25, -0.2]} args={[0.48, 0.45, 0.3]} shape="box" muscleId="glutes" name="臀大肌" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />

            {/* Quads */}
            <BodyPart position={[-0.35, 0.3, 0.15]} args={[0.24, 1.2, 4, 16]} muscleId="quads" name="股四头肌" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
            <BodyPart position={[0.35, 0.3, 0.15]} args={[0.24, 1.2, 4, 16]} muscleId="quads" name="股四头肌" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />

            {/* Hamstrings */}
            <BodyPart position={[-0.35, 0.3, -0.15]} args={[0.22, 1.2, 4, 16]} muscleId="hamstrings" name="腘绳肌" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
            <BodyPart position={[0.35, 0.3, -0.15]} args={[0.22, 1.2, 4, 16]} muscleId="hamstrings" name="腘绳肌" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />

            {/* Calves */}
            <BodyPart position={[-0.4, -1.0, -0.1]} args={[0.17, 1.0, 4, 16]} muscleId="calves" name="小腿" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />
            <BodyPart position={[0.4, -1.0, -0.1]} args={[0.17, 1.0, 4, 16]} muscleId="calves" name="小腿" selectedMuscle={selectedMuscle} onSelect={onSelectMuscle} />

        </group>

        <ContactShadows opacity={0.4} scale={15} blur={2.5} far={4} color="#000000" />
        <Environment preset="city" />
        <OrbitControls 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 1.5} 
            minDistance={3.5} 
            maxDistance={9} 
            enablePan={false}
        />
      </Canvas>
      
      <div className="absolute top-4 left-4 z-10 pointer-events-none select-none">
         <h1 className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-white drop-shadow-lg">
            3D 肌肉解剖 (Pro)
         </h1>
         <p className="text-xs text-blue-200/70 mt-1 max-w-[200px] leading-relaxed">
            高精度分层模型。点击任意肌肉束（如肱二头肌长头、胸肌外沿）获取专家级指导。
         </p>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none flex flex-col gap-2">
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[#a1a1aa] border border-zinc-500"></div>
            <span className="text-[10px] text-zinc-300 uppercase tracking-widest">可交互部位</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-blue-500 border border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
            <span className="text-[10px] text-blue-300 uppercase tracking-widest">已选中目标</span>
         </div>
      </div>
    </div>
  );
};