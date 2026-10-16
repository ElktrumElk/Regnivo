import { useEffect, useState } from 'react'

export function useResource<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  function load() {
    loader().then(setData).catch(handleError).finally(finishLoading)
  }

  function handleError(reason: unknown) {
    setError(reason instanceof Error ? reason.message : 'Unable to load this view.')
  }

  function finishLoading() { setLoading(false) }

  // The loader is a stable named API function supplied by each screen.
  useEffect(load, [loader])
  return { data, error, loading, setData }
}
