export type MuscleId = string;

export interface WorkoutExercise {
  id?: string;
  name: string;
  nameEn?: string;
  muscles: MuscleId[]; // affected muscles
  equipment?: string;
  difficulty?: "beginner" | "intermediate" | "advanced" | string;
  rating?: number;
  steps?: string[]; // instructions
  notes?: string;
}
