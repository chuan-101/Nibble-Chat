const SUPABASE_HOST_SUFFIX = '.supabase.co'
const SUPABASE_REF_PATTERN = /^[a-z0-9-]+$/
const MIN_REF_LENGTH = 6
const MAX_REF_LENGTH = 40

const parseSupabaseHostRef = (hostname: string): string | null => {
  const lowerHostname = hostname.toLowerCase()
  if (!lowerHostname.endsWith(SUPABASE_HOST_SUFFIX)) {
    return null
  }
  const ref = lowerHostname.slice(0, -SUPABASE_HOST_SUFFIX.length)
  if (!ref || !SUPABASE_REF_PATTERN.test(ref)) {
    return null
  }
  return ref
}

const normalizeSupabaseUrl = (value: string) => {
  try {
    const parsed = new URL(value)
    const ref = parseSupabaseHostRef(parsed.hostname)
    if (!ref) {
      return null
    }
    return {
      url: `${parsed.protocol}//${parsed.hostname}`,
      ref,
    }
  } catch {
    return null
  }
}

export const normalizeSupabaseProjectInput = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) {
    return {
      error: '请输入 Supabase Project ID（ref）或完整 Project URL。',
    }
  }

  if (/^https?:\/\//i.test(trimmed)) {
    const normalized = normalizeSupabaseUrl(trimmed)
    if (!normalized) {
      return {
        error: '请输入有效的 Supabase Project URL（需包含 .supabase.co）。',
      }
    }
    return normalized
  }

  const ref = trimmed.toLowerCase()
  if (!SUPABASE_REF_PATTERN.test(ref)) {
    return {
      error: 'Project ID（ref）仅支持小写字母、数字和连字符（-）。',
    }
  }
  if (ref.length < MIN_REF_LENGTH || ref.length > MAX_REF_LENGTH) {
    return {
      error: `Project ID（ref）长度需在 ${MIN_REF_LENGTH}-${MAX_REF_LENGTH} 个字符之间。`,
    }
  }

  return {
    url: `https://${ref}${SUPABASE_HOST_SUFFIX}`,
    ref,
  }
}

export const getSupabaseProjectInputDisplay = (url: string) => {
  const normalized = normalizeSupabaseUrl(url.trim())
  return normalized?.ref ?? url
}
