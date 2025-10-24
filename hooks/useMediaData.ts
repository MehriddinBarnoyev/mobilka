"use client"

import type React from "react"

import { useCallback, useRef, useState } from "react"
import type { Item, UserResponse, ApiResponse } from "../types/shared"
import {processApiResponse} from '../utils/dataTransform';
import api from '../core/api/apiService';

export const useMediaData = () => {
  const [items, setItems] = useState<Item[]>([])
  const [user, setUser] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const isFetchingRef = useRef(false)
  const mountedRef = useRef(true)

  const safeSetState = useCallback(<T,>(setter: React.Dispatch<React.SetStateAction<T>>) => {
    return (value: React.SetStateAction<T>) => {
      if (mountedRef.current) setter(value)
    }
  }, [])

  const setItemsSafe = safeSetState(setItems)
  const setUserSafe = safeSetState(setUser)
  const setLoadingSafe = safeSetState(setLoading)
  const setRefreshingSafe = safeSetState(setRefreshing)

  const fetchUserThenData = useCallback(
    async (isRefresh = false) => {
      if (isFetchingRef.current && !isRefresh) return
      isFetchingRef.current = true

      try {
        if (!isRefresh) setLoadingSafe(true)

        const userRes = await api.get<UserResponse>("/services/userms/api/account")
        const u = userRes.data
        setUserSafe(u)

        if (!u?.passwordReset) {
          isFetchingRef.current = false
          return { requiresPasswordReset: true }
        }

        const userId = u.id
        const response = await api.get<ApiResponse>(
          `https://assoodiq.devops.uz/services/videoedums/api/user-accesses/media/${userId}`,
        )

        const allItems = processApiResponse(response.data)
        setItemsSafe(allItems)

        return { requiresPasswordReset: false, items: allItems }
      } catch (e: any) {
        console.error("API ERROR:", e?.response?.data || e.message || e)
        return { error: e?.response?.status === 401 ? "UNAUTHORIZED" : "FETCH_ERROR" }
      } finally {
        isFetchingRef.current = false
        if (!isRefresh) setLoadingSafe(false)
        if (isRefresh) setRefreshingSafe(false)
      }
    },
    [setItemsSafe, setLoadingSafe, setUserSafe, setRefreshingSafe],
  )

  const onRefresh = useCallback(async () => {
    setRefreshingSafe(true)
    await fetchUserThenData(true)
  }, [fetchUserThenData, setRefreshingSafe])

  return {
    items,
    user,
    loading,
    refreshing,
    fetchUserThenData,
    onRefresh,
    mountedRef,
  }
}
