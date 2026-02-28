import { getOpenRouterApiKey, OPENROUTER_MISSING_KEY_MESSAGE } from '../storage/openrouterKey'

type OpenRouterFetchOptions = {
  body?: Record<string, unknown>
  signal?: AbortSignal
}

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

export const fetchOpenRouter = async (
  path: string,
  { body, signal }: OpenRouterFetchOptions = {},
): Promise<Response> => {
  const apiKey = getOpenRouterApiKey()
  if (!apiKey) {
    throw new Error(OPENROUTER_MISSING_KEY_MESSAGE)
  }

  return fetch(`${OPENROUTER_BASE}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  })
}

export const fetchOpenRouterModels = async () => {
  const response = await fetchOpenRouter('/models')
  if (!response.ok) {
    throw new Error(await response.text())
  }
  const payload = (await response.json()) as { data?: Array<{ id: string; name?: string; context_length?: number | null }> }
  return Array.isArray(payload.data)
    ? payload.data.map((model) => ({
        id: model.id,
        name: model.name,
        context_length: model.context_length ?? null,
      }))
    : []
}
