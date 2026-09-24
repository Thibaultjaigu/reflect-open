/** The OpenAI-compatible Requesty API root. */
export const REQUESTY_BASE_URL = 'https://router.requesty.ai/v1'

/** Optional attribution headers Requesty uses for app identification. */
export function requestyAttributionHeaders(): Record<string, string> {
  return {
    'HTTP-Referer': 'https://reflect.app',
    'X-Title': 'Reflect',
  }
}
