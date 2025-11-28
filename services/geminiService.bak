import { GoogleGenAI, Type, Schema } from "@google/genai";
import { WorkoutExercise } from "../types";

// Schema definition for structured output
const exerciseSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: "训练动作名称 (Name of the exercise in Chinese)",
      },
      nameEn: {
        type: Type.STRING,
        description: "训练动作英文标准名称 (Standard English Name, e.g. 'Cable Crossover')",
      },
      equipment: {
        type: Type.STRING,
        description: "使用的器械类型，如'鹦鹉螺固定器械', '大剪刀/绳索', '哑铃', '杠铃' (Equipment type)",
      },
      description: {
        type: Type.STRING,
        description: "简要的动作指导和要领 (Brief instructions in Chinese)",
      },
      rating: {
        type: Type.NUMBER,
        description: "针对该部位的增肌效果评分 1-10分 (Effectiveness rating 1-10)",
      },
      difficulty: {
        type: Type.STRING,
        enum: ["Beginner", "Intermediate", "Advanced"],
        description: "难度等级 (Difficulty level)",
      },
      reps: {
        type: Type.STRING,
        description: "建议的组数和次数，例如 '4组 8-12次' (Recommended sets and reps in Chinese)",
      },
      gifUrl: {
        type: Type.STRING,
        description: "A direct URL to a standard exercise demonstration GIF from Wikimedia Commons or similar open source. Example: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Barbell_Bench_Press.gif'. If unknown, leave empty.",
      }
    },
    required: ["name", "nameEn", "description", "rating", "difficulty", "reps", "equipment"],
  },
};

export const fetchExercises = async (muscleName: string): Promise<WorkoutExercise[]> => {
  // Access process.env.API_KEY inside the function to prevent top-level module crash
  // if process is undefined during initial bundle evaluation.
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("API Key is missing");
    throw new Error("API Key is missing. Please configure process.env.API_KEY in your environment.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `针对"${muscleName}"，请提供5-6个最高效的增肌训练动作。
      
      **重要要求**:
      1. 必须包含多种器械类型，不要局限于哑铃和杠铃。
      2. 必须包含 **固定器械 (Nautilus/鹦鹉螺, Hammer Strength)**。
      3. 必须包含 **绳索/滑轮 (Cable/大剪刀)** 动作。
      4. **关键**: 尽最大努力提供该动作在 Wikimedia Commons 上的 .gif 链接。这对于用户体验至关重要。如果找不到确切的，找最接近的变体。
      
      请给出动作名称、英文名、器械类型、详细但简练的执行说明、1-10分的推荐指数评分、难度、建议的组数次数以及GIF链接。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: exerciseSchema,
        systemInstruction: "你是一位世界级的健美教练。你精通各种训练流派，特别是器械训练（如鹦鹉螺 Nautilus）、绳索训练（如大剪刀/Cable Crossover）以及传统自由重量。你的目标是提供多样化、高强度的训练计划，并尽可能提供视觉参考链接。",
      },
    });

    const text = response.text;
    if (!text) {
      return [];
    }

    const data = JSON.parse(text) as WorkoutExercise[];
    
    // Sort by rating descending
    return data.sort((a, b) => b.rating - a.rating);

  } catch (error) {
    console.error("Error fetching exercises:", error);
    throw error;
  }
};