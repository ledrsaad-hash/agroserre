const SYNC_ERROR_EVENT = 'agroserre:sync-error'

export function emitSyncError(message: string): void {
  window.dispatchEvent(new CustomEvent(SYNC_ERROR_EVENT, { detail: message }))
}

export function onSyncError(handler: (message: string) => void): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<string>).detail)
  window.addEventListener(SYNC_ERROR_EVENT, listener)
  return () => window.removeEventListener(SYNC_ERROR_EVENT, listener)
}
