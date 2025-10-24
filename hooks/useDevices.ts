"use client"

import { useState, useEffect, useCallback } from "react"
import axios, { type AxiosError } from "axios"
import DeviceInfo from "react-native-device-info"
import api from "../core/api/apiService"
import {DeviceBinding} from '../app/components/core/DeviceCard';

interface UserResponse {
  createdBy: string
  createdDate: string
  lastModifiedBy: string
  lastModifiedDate: string
  id: number
  login: string
}

interface CheckResponse {
  allowed: boolean
  devices: DeviceBinding[]
}

interface ErrorBodyMaybe extends Partial<CheckResponse> {
  message?: string
}

const ACCOUNT_PATH = "/services/userms/api/account"
const CHECK_PATH = "/services/videoedums/api/device-bindings/check"
const DELETE_PATH = (id: number) => `/services/videoedums/api/device-bindings/${id}`

export function useDevices() {
  const [userLogin, setUserLogin] = useState<string | null>(null)
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [checking, setChecking] = useState<boolean>(true)
  const [loadingList, setLoadingList] = useState<boolean>(true)
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [devices, setDevices] = useState<DeviceBinding[]>([])
  const [errorMsg, setErrorMsg] = useState<string>("")
  const [refreshing, setRefreshing] = useState<boolean>(false)

  const applyServerData = (data: unknown): boolean => {
    const body = data as ErrorBodyMaybe | CheckResponse | undefined
    if (body && typeof body === "object") {
      if (typeof (body as CheckResponse).allowed === "boolean") {
        setAllowed((body as CheckResponse).allowed)
      } else {
        setAllowed(null)
      }

      const arr = Array.isArray((body as CheckResponse).devices) ? (body as CheckResponse).devices : []

      setDevices(arr)
      return true
    }
    return false
  }

  const checkDevices = useCallback(async (): Promise<void> => {
    if (!userLogin || !deviceId) return

    const payload = { deviceId, userLogin, status: "ACTIVE" as const }
    setErrorMsg("")
    setChecking(true)
    setLoadingList(true)

    try {
      const res = await api.post<CheckResponse>(CHECK_PATH, payload)
      applyServerData(res.data)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const aerr = err as AxiosError<ErrorBodyMaybe>
        if (aerr.response?.data && applyServerData(aerr.response.data)) {
          // Data applied from error response
        } else {
          const status = aerr.response?.status
          setErrorMsg(status ? `So'rov xatosi: ${status}` : "Tarmoq yoki server xatosi")
          setAllowed((prev) => (prev === null ? false : prev))
        }
      } else {
        setErrorMsg("Noma'lum xato yuz berdi")
      }
    } finally {
      setChecking(false)
      setLoadingList(false)
    }
  }, [userLogin, deviceId])

  const removeDevice = useCallback(
    async (id: number): Promise<void> => {
      await api.delete<void>(DELETE_PATH(id))
      await checkDevices()
    },
    [checkDevices],
  )

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await checkDevices()
    setRefreshing(false)
  }, [checkDevices])

  useEffect(() => {
    ;(async () => {
      try {
        const userRes = await api.get<UserResponse>(ACCOUNT_PATH)
        setUserLogin(userRes.data.login)
      } catch {
        setErrorMsg("Foydalanuvchi ma'lumotlarini olishda xatolik")
      }
      try {
        const id = await DeviceInfo.getUniqueId()
        setDeviceId(id || null)
      } catch {
        setErrorMsg("Qurilma ID olinmadi")
      }
    })()
  }, [])

  useEffect(() => {
    if (userLogin && deviceId) {
      void checkDevices()
    }
  }, [userLogin, deviceId, checkDevices])

  return {
    userLogin,
    deviceId,
    checking,
    loadingList,
    allowed,
    devices,
    errorMsg,
    refreshing,
    checkDevices,
    removeDevice,
    onRefresh,
    setDevices,
  }
}
