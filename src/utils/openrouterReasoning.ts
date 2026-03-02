const GPT5_AUTO_MODEL_MARKERS = ['gpt-5.1', 'gpt-5.2', 'openai/gpt-5.1', 'openai/gpt-5.2']

export const isGpt5Auto = (modelId: string) => {
  const normalized = modelId.trim().toLowerCase()
  return GPT5_AUTO_MODEL_MARKERS.some((marker) => normalized.includes(marker))
}
