export const DEFAULT_SNACK_SYSTEM_OVERLAY = ''

export const DEFAULT_SYZYGY_POST_PROMPT = ''

export const DEFAULT_SYZYGY_REPLY_PROMPT = ''

export const resolveSnackSystemOverlay = (overlay: string | null | undefined) => {
  const trimmed = overlay?.trim()
  return trimmed && trimmed.length > 0 ? overlay ?? '' : DEFAULT_SNACK_SYSTEM_OVERLAY
}

export const resolveSyzygyPostPrompt = (prompt: string | null | undefined) => {
  const trimmed = prompt?.trim()
  return trimmed && trimmed.length > 0 ? prompt ?? '' : DEFAULT_SYZYGY_POST_PROMPT
}

export const resolveSyzygyReplyPrompt = (prompt: string | null | undefined) => {
  const trimmed = prompt?.trim()
  return trimmed && trimmed.length > 0 ? prompt ?? '' : DEFAULT_SYZYGY_REPLY_PROMPT
}
