export type WorkoutExercise = any; // keep types flexible

const BASE_URL = import.meta.env.VITE_SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1";
const API_KEY = import.meta.env.VITE_SILICONFLOW_API_KEY;

/**
 * Calls SiliconFlow / DeepSeek via OpenAI-compatible Chat Completions.
 * Returns parsed JSON array of WorkoutExercise
 */
export async function fetchExercises(prompt: string) {
  if (!API_KEY) {
    throw new Error("Missing SiliconFlow API key. Set VITE_SILICONFLOW_API_KEY in your .env.local");
  }

  const url = BASE_URL + "/chat/completions";
  const body = {
    model: "deepseek-ai/DeepSeek-V2.5",
    messages: [
      { role: "system", content: "You are a helpful fitness assistant that returns JSON array of exercises matching the user's request." },
      { role: "user", content: prompt }
    ],
    temperature: 0.1,
    max_tokens: 800
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("SiliconFlow API error: " + res.status + " " + text);
  }

  const data = await res.json();
  // Try to extract content
  let content = "";
  if (data.choices && data.choices[0] && data.choices[0].message) {
    content = data.choices[0].message.content;
  } else if (data.choices && data.choices[0] && data.choices[0].text) {
    content = data.choices[0].text;
  } else if (data.data && data.data[0] && data.data[0].content) {
    content = data.data[0].content;
  }

  if (!content) {
    throw new Error("No content returned from SiliconFlow");
  }

  // Attempt to parse JSON from the model output
  try {
    const parsed = JSON.parse(content);
    return parsed;
  } catch (e) {
    // If parsing fails, try to extract JSON substring
    const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    // otherwise return raw content in an array
    return [{ raw: content }];
  }
}
