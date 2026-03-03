export const SUPABASE_CONFIG_STORAGE_KEY = 'nibble_supabase_config_v1'

export type SupabaseLocalConfig = {
  url: string
  anonKey: string
}

const normalizeConfig = (value: unknown): SupabaseLocalConfig | null => {
  if (!value || typeof value !== 'object') {
    return null
  }
  const config = value as Record<string, unknown>
  const url = typeof config.url === 'string' ? config.url.trim() : ''
  const anonKey = typeof config.anonKey === 'string' ? config.anonKey.trim() : ''
  if (!url || !anonKey) {
    return null
  }
  return { url, anonKey }
}

export const readLocalSupabaseConfig = (): SupabaseLocalConfig | null => {
  if (typeof window === 'undefined') {
    return null
  }
  const raw = window.localStorage.getItem(SUPABASE_CONFIG_STORAGE_KEY)
  if (!raw) {
    return null
  }
  try {
    return normalizeConfig(JSON.parse(raw))
  } catch {
    return null
  }
}

export const saveLocalSupabaseConfig = (config: SupabaseLocalConfig) => {
  if (typeof window === 'undefined') {
    return
  }
  const payload: SupabaseLocalConfig = {
    url: config.url.trim(),
    anonKey: config.anonKey.trim(),
  }
  window.localStorage.setItem(SUPABASE_CONFIG_STORAGE_KEY, JSON.stringify(payload))
}

export const clearLocalSupabaseConfig = () => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(SUPABASE_CONFIG_STORAGE_KEY)
}
