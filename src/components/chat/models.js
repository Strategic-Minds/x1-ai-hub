export const MODELS = [
  { id: "automatic", label: "Auto", provider: "AI HUB", note: "Best model for the task" },
  { id: "gpt_5_6_luna", label: "GPT-5 Luna", provider: "ChatGPT", note: "Fast & capable" },
  { id: "gpt_6_astra", label: "GPT-6 Astra", provider: "ChatGPT", note: "Most advanced OpenAI" },
  { id: "claude-sonnet-5", label: "Sonnet 5", provider: "Claude", note: "Balanced Anthropic" },
  { id: "claude_opus_5", label: "Opus 5", provider: "Claude", note: "Deep reasoning" },
  { id: "gemini_3_8_flash", label: "Gemini 3.8 Flash", provider: "Gemini", note: "Fast Google model" },
];

export const MODEL_MAP = Object.fromEntries(MODELS.map((m) => [m.id, m]));