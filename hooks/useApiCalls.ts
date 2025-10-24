"use client"

import { useState, useCallback } from "react"
import { parseApiError } from "../utils/api-helpers"

export function useApiCall<T = void>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (apiCall: () => Promise<T>): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await apiCall()
      return result
    } catch (err) {
      const errorMessage = parseApiError(err)
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return {
    loading,
    error,
    execute,
    clearError,
  }
}
