import React from 'react';
import { WorkoutExercise, MuscleId } from '../types';
import { Loader2, Star, Dumbbell, AlertCircle, ExternalLink } from 'lucide-react';

interface ExercisePanelProps {
  loading: boolean;
  exercises: WorkoutExercise[];
  selectedMuscle: MuscleId | null;
  error: string | null;
}

const RatingBar: React.FC<{ rating: number }> = ({ rating }) => {
  const percentage = (rating / 10) * 100;
  
  let color = "bg-red-500";
  if (rating >= 7) color = "bg-green-500";
  else if (rating >= 4) color = "bg-yellow-500";

  return (
    <div className="w-full h-2 bg-zinc-800 rounded-full mt-2 overflow-hidden">
      <div 
        className={`h-full ${color} transition-all duration-500 ease-out`} 
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
        case 'Beginner': return '初学者';
        case 'Intermediate': return '进阶';
        case 'Advanced': return '高阶';
        default: return difficulty;
    }
};

export const ExercisePanel: React.FC<ExercisePanelProps> = ({ loading, exercises, selectedMuscle, error }) => {
  
  const getMuscleDisplayName = (id: MuscleId) => {
    const map: Record<MuscleId, string> = {
      // Chest
      upper_chest: "上胸 (Upper Chest)",
      middle_chest: "中胸 (Middle Chest)",
      lower_chest: "下胸 (Lower Chest)",
      outer_chest: "胸肌外沿 (Outer Chest)",
      
      // Back
      traps: "斜方肌 (Trapezius)",
      lats: "背阔肌 (Lats)",
      rhomboids: "菱形肌 (Rhomboids)",
      teres: "大圆肌/小圆肌 (Teres)",
      lower_back: "竖脊肌 (Lower Back)",
      
      // Shoulders
      front_delt: "三角肌前束 (Front Delt)",
      side_delt: "三角肌中束 (Side Delt)",
      rear_delt: "三角肌后束 (Rear Delt)",
      
      // Arms
      biceps_long: "肱二头肌-长头 (Long Head)",
      biceps_short: "肱二头肌-短头 (Short Head)",
      brachialis: "肱肌 (Brachialis)",
      triceps_long: "肱三头肌-长头 (Long Head)",
      triceps_lateral: "肱三头肌-外侧头 (Lateral Head)",
      forearms: "前臂 (Forearms)",
      
      // Core
      abs_upper: "上腹肌 (Upper Abs)",
      abs_lower: "下腹肌 (Lower Abs)",
      obliques: "腹外斜肌/人鱼线 (Obliques)",
      
      // Legs
      quads: "股四头肌 (Quads)",
      hamstrings: "腘绳肌 (Hamstrings)",
      calves: "小腿 (Calves)",
      glutes: "臀大肌 (Glutes)",
      
      head: "颈部 (Neck)"
    };
    return map[id] || id;
  };

  if (!selectedMuscle) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center text-zinc-500 bg-zinc-900 border-l border-zinc-800">
        <Dumbbell className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-xl font-semibold mb-2">请选择肌肉部位</h2>
        <p className="max-w-xs text-sm">
            点击 3D 模型上的具体肌肉区域。
            <br/><br/>
            例如：点击手臂外侧选择<span className="text-zinc-300">长头</span>，点击胸肌上方选择<span className="text-zinc-300">上胸</span>。
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-zinc-950 border-l border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-2xl font-bold text-white capitalize flex items-center gap-3">
            {getMuscleDisplayName(selectedMuscle)}
            {loading && <Loader2 className="animate-spin text-blue-500 w-6 h-6" />}
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          {loading ? "正在分析生物力学结构..." : `AI 专项训练指南`}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3 text-red-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
            </div>
        )}

        {!loading && !error && exercises.length === 0 && (
            <div className="text-zinc-500 text-center py-10">
                未找到相关训练动作，请重新选择。
            </div>
        )}

        {!loading && (exercises || []).map((exercise, idx) => (
          <div 
            key={idx} 
            className="group bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500/50 rounded-xl p-5 transition-all duration-300 shadow-lg shadow-black/20"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-semibold text-zinc-100">{exercise.name}</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                exercise.difficulty === 'Advanced' ? 'bg-purple-500/20 text-purple-400' :
                exercise.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {getDifficultyLabel(exercise.difficulty)}
              </div>
            </div>

            {/* GIF Preview Section */}
            {exercise.gifUrl && (
              <div className="mb-4 rounded-lg overflow-hidden border border-zinc-800 bg-black/40 relative h-48 flex items-center justify-center group-hover:border-blue-500/20 transition-colors">
                <img 
                  src={exercise.gifUrl} 
                  alt={exercise.name}
                  loading="lazy"
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    // Hide image container if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) target.parentElement.style.display = 'none';
                  }}
                />
              </div>
            )}

            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              {exercise.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
               <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50">
                    <span className="text-xs text-zinc-500 block mb-1">建议组数/次数</span>
                    <span className="text-sm font-medium text-zinc-200">{exercise.reps}</span>
               </div>
               <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50">
                    <span className="text-xs text-zinc-500 block mb-1">训练重点</span>
                    <span className="text-sm font-medium text-zinc-200">精准刺激</span>
               </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-1">
                <div className="flex items-center gap-1.5 text-blue-400">
                    <Star className="w-4 h-4 fill-blue-400" />
                    <span className="font-bold text-sm">推荐指数</span>
                </div>
                <span className="text-2xl font-bold text-white">{exercise.rating}<span className="text-zinc-600 text-base font-normal">/10</span></span>
              </div>
              <RatingBar rating={exercise.rating} />
            </div>
          </div>
        ))}
        
         {/* Loading Skeletons */}
         {loading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 animate-pulse">
                <div className="h-6 bg-zinc-800 rounded w-2/3 mb-4"></div>
                <div className="h-48 bg-zinc-800/50 rounded w-full mb-4"></div> {/* Image skeleton */}
                <div className="h-4 bg-zinc-800 rounded w-full mb-2"></div>
                <div className="h-4 bg-zinc-800 rounded w-5/6 mb-6"></div>
            </div>
        ))}

      </div>
    </div>
  );
};