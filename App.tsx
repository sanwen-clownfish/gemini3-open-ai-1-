import React, { useState, useEffect } from 'react';
import { BodyModel } from './components/BodyModel';
import { ExercisePanel } from './components/ExercisePanel';
import { fetchExercises } from './services/aiService';
import { MuscleId, WorkoutExercise } from './types';
import { Activity } from 'lucide-react';

const App: React.FC = () => {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleId | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleMuscleSelect = async (muscleId: MuscleId) => {
    if (muscleId === selectedMuscle) return; // Don't reload if same muscle

    setSelectedMuscle(muscleId);
    setLoading(true);
    setError(null);
    setExercises([]); // Clear previous results immediately

    // Precise anatomical mapping for AI context
    const muscleNameMap: Record<MuscleId, string> = {
      // Chest
      upper_chest: "上胸肌 (Clavicular Head of Pectoralis Major)",
      middle_chest: "胸大肌中部 (Sternal Head of Pectoralis Major)",
      lower_chest: "下胸肌 (Abdominal Head of Pectoralis Major)",
      outer_chest: "胸肌外沿 (Outer Costal fibers of Pectoralis)",

      // Back
      traps: "斜方肌 (Trapezius)",
      lats: "背阔肌 (Latissimus Dorsi)",
      rhomboids: "菱形肌 (Rhomboids)",
      teres: "大圆肌和小圆肌 (Teres Major and Minor)",
      lower_back: "竖脊肌 (Erector Spinae)",
      
      // Shoulders
      front_delt: "三角肌前束 (Anterior Deltoid)",
      side_delt: "三角肌中束 (Lateral Deltoid)",
      rear_delt: "三角肌后束 (Posterior Deltoid)",
      
      // Arms - Biceps
      biceps_long: "肱二头肌长头 (Long Head of Biceps Brachii - Outer peak)",
      biceps_short: "肱二头肌短头 (Short Head of Biceps Brachii - Inner thickness)",
      brachialis: "肱肌 (Brachialis - Muscle underneath biceps)",
      
      // Arms - Triceps
      triceps_long: "肱三头肌长头 (Long Head of Triceps Brachii)",
      triceps_lateral: "肱三头肌外侧头 (Lateral Head of Triceps Brachii)",
      
      forearms: "前臂屈肌和伸肌 (Forearms)",
      
      // Core
      abs_upper: "上腹直肌 (Upper Rectus Abdominis)",
      abs_lower: "下腹直肌 (Lower Rectus Abdominis)",
      obliques: "腹外斜肌 (External Obliques)",
      
      // Legs
      quads: "股四头肌 (Quadriceps)",
      hamstrings: "腘绳肌 (Hamstrings)",
      calves: "小腿肌群 (Calves)",
      glutes: "臀大肌 (Glutes)",
      
      head: "颈部肌肉 (Neck Muscles)"
    };

    try {
      const results = await fetchExercises(muscleNameMap[muscleId] || muscleId);
      setExercises(results);
    } catch (err: any) {
      setError(err.message || "获取训练数据失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-black text-white">
      {/* Mobile Overlay Title */}
      <div className="md:hidden absolute top-0 left-0 w-full z-20 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-2 text-blue-500">
            <Activity className="w-6 h-6" />
            <h1 className="font-bold text-lg text-white">NeuroMuscle AI</h1>
        </div>
      </div>

      {/* Left Side: 3D Model */}
      <div className="h-[55vh] md:h-full md:w-[60%] lg:w-[65%] relative">
        <BodyModel selectedMuscle={selectedMuscle} onSelectMuscle={handleMuscleSelect} />
      </div>

      {/* Right Side: Exercise Panel */}
      <div className="h-[45vh] md:h-full md:w-[40%] lg:w-[35%] relative z-10 shadow-2xl">
        <ExercisePanel 
          loading={loading} 
          exercises={exercises} 
          selectedMuscle={selectedMuscle}
          error={error}
        />
      </div>
    </div>
  );
};

export default App;