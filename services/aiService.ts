export type WorkoutExercise = {
  name: string;
  description: string;
  setsReps: string;
  focus: string;
  score: number; // 推荐指数 (0–10)
};

const BASE_URL =
  import.meta.env.VITE_SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1";

const API_KEY = import.meta.env.VITE_SILICONFLOW_API_KEY;

/**
 * Call DeepSeek / SiliconFlow and return structured JSON for exercises.
 */
export async function fetchExercises(prompt: string): Promise<WorkoutExercise[]> {
  if (!API_KEY) {
    throw new Error(
      "缺少 SiliconFlow API 密钥。请在 .env.local 设置 VITE_SILICONFLOW_API_KEY。"
    );
  }

  const url = `${BASE_URL}/chat/completions`;

  const body = {
    model: "deepseek-ai/DeepSeek-V2.5",
    messages: [
      {
        role: "system",
        content: `
你是一个专业健身教练。无论用户输入什么，你必须严格输出 "JSON 数组"，每个项目包含以下字段（且必须用中文）：

[
  {
    "name": "动作名称",
    "description": "详细中文描述（含动作步骤）",
    "setsReps": "建议组数和次数，例如：3组 8-12次",
    "focus": "训练重点，例如：胸肌下束 / 精准刺激 / 核心稳定",
    "score": 数字（0–10） // 推荐指数
  }
]

严格只返回 JSON，不允许附加说明。
        `,
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.1,
    max_tokens: 1000,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SiliconFlow API 错误: ${res.status} ${text}`);
  }

  const data = await res.json();

  // Extract content
  const content =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.text ??
    data?.data?.[0]?.content ??
    "";

  if (!content) {
    throw new Error("SiliconFlow 返回内容为空");
  }

  // Try normal JSON parse
  try {
    return JSON.parse(content);
  } catch (e) {
    // Try to extract JSON using regex
    const match = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
  }

  // Fallback to avoid UI crash
  return [
    {
      name: "解析失败",
      description: content,
      setsReps: "3组 10次",
      focus: "通用训练",
      score: 5,
    },
  ];
}
