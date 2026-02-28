export const OPENROUTER_API_KEY_STORAGE_KEY = 'nibble_openrouter_api_key'

export const getOpenRouterApiKey = (): string => {
  if (typeof window === 'undefined') {
    return ''
  }
  return window.localStorage.getItem(OPENROUTER_API_KEY_STORAGE_KEY)?.trim() ?? ''
}

export const saveOpenRouterApiKey = (apiKey: string) => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(OPENROUTER_API_KEY_STORAGE_KEY, apiKey.trim())
}

export const clearOpenRouterApiKey = () => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(OPENROUTER_API_KEY_STORAGE_KEY)
}

export const hasOpenRouterApiKey = () => getOpenRouterApiKey().length > 0

export const OPENROUTER_MISSING_KEY_MESSAGE =
  '未设置 OpenRouter API Key，请先前往 设置 → OpenRouter API Key 保存后再试。'
