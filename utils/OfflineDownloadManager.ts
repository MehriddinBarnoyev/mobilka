import { NativeModules, NativeEventEmitter, Platform } from "react-native"

console.log("[v0] Loading native modules", {
  platform: Platform.OS,
  VdoCipherOfflineModule: !!NativeModules.VdoCipherOfflineModule,
  ScreenSecurityModule: !!NativeModules.ScreenSecurityModule,
})

const VdoCipherOfflineModule = NativeModules.VdoCipherOfflineModule || null
const ScreenSecurityModule = NativeModules.ScreenSecurityModule || null

// Type definitions
export interface DownloadResult {
  downloadId: string
  status: string
  message?: string
}

export interface OfflineVideo {
  videoId: string
  status: "completed" | "downloading" | "queued" | "failed" | "pending"
  progress: number
  title?: string
  localPath?: string
  playbackInfo?: string
}

export interface ScreenCaptureEvent {
  isCaptured: boolean
  timestamp: number
  type?: "recording" | "screenshot"
}

export interface DownloadProgressEvent {
  videoId: string
  progress: number
}

export interface DownloadCompleteEvent {
  videoId: string
}

export interface DownloadErrorEvent {
  videoId: string
  error: string
}

let screenSecurityEmitter: NativeEventEmitter | null = null
let downloadEmitter: NativeEventEmitter | null = null

const getScreenSecurityEmitter = (): NativeEventEmitter | null => {
  console.log("[v0] getScreenSecurityEmitter called", {
    platform: Platform.OS,
    moduleAvailable: !!ScreenSecurityModule,
    emitterExists: !!screenSecurityEmitter,
  })

  if (Platform.OS !== "ios" || !ScreenSecurityModule) {
    console.log("[v0] Screen security emitter not available")
    return null
  }

  if (!screenSecurityEmitter) {
    try {
      console.log("[v0] Creating new NativeEventEmitter for ScreenSecurityModule")
      screenSecurityEmitter = new NativeEventEmitter(ScreenSecurityModule)
      console.log("[v0] NativeEventEmitter created successfully")
    } catch (error) {
      console.warn("[v0] Failed to create event emitter:", error)
      return null
    }
  }

  return screenSecurityEmitter
}

const getDownloadEmitter = (): NativeEventEmitter | null => {
  console.log("[v0] getDownloadEmitter called", {
    platform: Platform.OS,
    moduleAvailable: !!VdoCipherOfflineModule,
    emitterExists: !!downloadEmitter,
  })

  if (Platform.OS !== "ios" || !VdoCipherOfflineModule) {
    console.log("[v0] Download emitter not available")
    return null
  }

  if (!downloadEmitter) {
    try {
      console.log("[v0] Creating new NativeEventEmitter for VdoCipherOfflineModule")
      downloadEmitter = new NativeEventEmitter(VdoCipherOfflineModule)
      console.log("[v0] Download NativeEventEmitter created successfully")
    } catch (error) {
      console.warn("[v0] Failed to create download event emitter:", error)
      return null
    }
  }

  return downloadEmitter
}

// Offline Download API for iOS with FairPlay DRM
export const OfflineDownload = {
  /**
   * Check if the module is available
   */
  isAvailable: (): boolean => {
    const available = Platform.OS === "ios" && VdoCipherOfflineModule !== null
    console.log("[v0] OfflineDownload.isAvailable:", available)
    return available
  },

  /**
   * Download a video for offline playback with FairPlay DRM
   */
  downloadVideo: async (videoId: string, otp: string, playbackInfo: string): Promise<DownloadResult> => {
    console.log("[v0] ========== JS: downloadVideo ==========")
    console.log("[v0] Called from JavaScript")
    console.log("[v0] VideoId:", videoId)
    console.log("[v0] OTP length:", otp.length, "characters")
    console.log("[v0] PlaybackInfo length:", playbackInfo.length, "characters")
    console.log("[v0] Platform:", Platform.OS)
    console.log("[v0] Module available:", !!VdoCipherOfflineModule)

    if (Platform.OS !== "ios") {
      console.error("[v0] ❌ ERROR: Not iOS platform")
      throw new Error("iOS only feature")
    }

    if (!VdoCipherOfflineModule) {
      console.error("[v0] ❌ ERROR: VdoCipherOfflineModule not available")
      console.error("[v0] Please add the native iOS module to your Xcode project")
      console.error("[v0] See ios/INSTALLATION.md for setup instructions")
      throw new Error("VdoCipherOfflineModule not available. Please add the native iOS module to your Xcode project.")
    }

    console.log("[v0] ✅ All checks passed, calling native module...")

    try {
      const result = await VdoCipherOfflineModule.downloadVideo(videoId, otp, playbackInfo)
      console.log("[v0] ✅ Native module returned successfully")
      console.log("[v0] Result:", JSON.stringify(result, null, 2))
      console.log("[v0] ===========================================")
      return result
    } catch (error) {
      console.error("[v0] ❌ Native module call failed")
      console.error("[v0] Error:", error)
      console.error("[v0] Error type:", typeof error)
      console.error("[v0] Error keys:", error ? Object.keys(error) : "null")
      console.log("[v0] ===========================================")
      throw error
    }
  },

  /**
   * Get all downloaded videos
   */
  getAllDownloads: async (): Promise<OfflineVideo[]> => {
    console.log("[v0] ========== JS: getAllDownloads ==========")
    console.log("[v0] Platform:", Platform.OS)
    console.log("[v0] Module available:", !!VdoCipherOfflineModule)

    if (Platform.OS !== "ios") {
      console.log("[v0] Not iOS, returning empty array")
      return []
    }

    if (!VdoCipherOfflineModule) {
      console.warn("[v0] ⚠️ OfflineDownload module not available")
      return []
    }

    try {
      console.log("[v0] Calling native getAllDownloads...")
      const downloads = await VdoCipherOfflineModule.getAllDownloads()
      console.log("[v0] ✅ Received", downloads.length, "downloads")
      downloads.forEach((d: any, i: number) => {
        console.log(`[v0]   ${i + 1}. ${d.videoId}: ${d.status} (${d.progress}%)`)
      })
      console.log("[v0] =============================================")
      return downloads
    } catch (error) {
      console.error("[v0] ❌ getAllDownloads error:", error)
      console.log("[v0] =============================================")
      return []
    }
  },

  /**
   * Get offline video playback information
   */
  playOfflineVideo: async (videoId: string): Promise<OfflineVideo> => {
    if (Platform.OS !== "ios") {
      throw new Error("iOS only feature")
    }

    if (!VdoCipherOfflineModule) {
      throw new Error("VdoCipherOfflineModule not available")
    }

    try {
      return await VdoCipherOfflineModule.playOfflineVideo(videoId)
    } catch (error) {
      console.error("[v0] OfflineDownload.playOfflineVideo error:", error)
      throw error
    }
  },

  /**
   * Remove a downloaded video
   */
  removeDownload: async (videoId: string): Promise<{ success: boolean; videoId: string }> => {
    console.log("[v0] OfflineDownload.removeDownload called", { videoId })

    if (Platform.OS !== "ios") {
      throw new Error("iOS only feature")
    }

    if (!VdoCipherOfflineModule) {
      throw new Error("VdoCipherOfflineModule not available")
    }

    try {
      const result = await VdoCipherOfflineModule.removeDownload(videoId)
      console.log("[v0] OfflineDownload.removeDownload result:", result)
      return result
    } catch (error) {
      console.error("[v0] OfflineDownload.removeDownload error:", error)
      throw error
    }
  },

  /**
   * Listen for download progress events
   */
  addDownloadProgressListener: (callback: (event: DownloadProgressEvent) => void) => {
    console.log("[v0] OfflineDownload.addDownloadProgressListener called")

    const emitter = getDownloadEmitter()

    if (!emitter) {
      console.warn("[v0] Download event emitter not available")
      return { remove: () => {} }
    }

    try {
      const subscription = emitter.addListener("onDownloadProgress", callback)
      console.log("[v0] Download progress listener added successfully")
      return subscription
    } catch (error) {
      console.error("[v0] Failed to add download progress listener:", error)
      return { remove: () => {} }
    }
  },

  /**
   * Listen for download complete events
   */
  addDownloadCompleteListener: (callback: (event: DownloadCompleteEvent) => void) => {
    console.log("[v0] OfflineDownload.addDownloadCompleteListener called")

    const emitter = getDownloadEmitter()

    if (!emitter) {
      console.warn("[v0] Download event emitter not available")
      return { remove: () => {} }
    }

    try {
      const subscription = emitter.addListener("onDownloadComplete", callback)
      console.log("[v0] Download complete listener added successfully")
      return subscription
    } catch (error) {
      console.error("[v0] Failed to add download complete listener:", error)
      return { remove: () => {} }
    }
  },

  /**
   * Listen for download error events
   */
  addDownloadErrorListener: (callback: (event: DownloadErrorEvent) => void) => {
    console.log("[v0] OfflineDownload.addDownloadErrorListener called")

    const emitter = getDownloadEmitter()

    if (!emitter) {
      console.warn("[v0] Download event emitter not available")
      return { remove: () => {} }
    }

    try {
      const subscription = emitter.addListener("onDownloadError", callback)
      console.log("[v0] Download error listener added successfully")
      return subscription
    } catch (error) {
      console.error("[v0] Failed to add download error listener:", error)
      return { remove: () => {} }
    }
  },
}

// Screen Security API for iOS
export const ScreenSecurity = {
  /**
   * Check if the module is available
   */
  isAvailable: (): boolean => {
    const available = Platform.OS === "ios" && ScreenSecurityModule !== null
    console.log("[v0] ScreenSecurity.isAvailable:", available)
    return available
  },

  /**
   * Check if screen is currently being captured
   */
  isScreenBeingCaptured: async (): Promise<{ isCaptured: boolean }> => {
    console.log("[v0] ScreenSecurity.isScreenBeingCaptured called")

    if (Platform.OS !== "ios") {
      return { isCaptured: false }
    }

    if (!ScreenSecurityModule) {
      console.warn("[v0] ScreenSecurity module not available")
      return { isCaptured: false }
    }

    try {
      const result = await ScreenSecurityModule.isScreenBeingCaptured()
      console.log("[v0] ScreenSecurity.isScreenBeingCaptured result:", result)
      return result
    } catch (error) {
      console.error("[v0] ScreenSecurity.isScreenBeingCaptured error:", error)
      return { isCaptured: false }
    }
  },

  /**
   * Listen for screen capture events
   */
  addScreenCaptureListener: (callback: (event: ScreenCaptureEvent) => void) => {
    console.log("[v0] ScreenSecurity.addScreenCaptureListener called")

    const emitter = getScreenSecurityEmitter()

    if (!emitter) {
      console.warn("[v0] Event emitter not available - screen capture detection disabled")
      return { remove: () => {} }
    }

    try {
      const subscription = emitter.addListener("onScreenCaptured", callback)
      console.log("[v0] Screen capture listener added successfully")
      return subscription
    } catch (error) {
      console.error("[v0] Failed to add screen capture listener:", error)
      return { remove: () => {} }
    }
  },

  /**
   * Listen for screen capture ended events
   */
  addScreenCaptureEndedListener: (callback: (event: ScreenCaptureEvent) => void) => {
    console.log("[v0] ScreenSecurity.addScreenCaptureEndedListener called")

    const emitter = getScreenSecurityEmitter()

    if (!emitter) {
      console.warn("[v0] Event emitter not available - screen capture detection disabled")
      return { remove: () => {} }
    }

    try {
      const subscription = emitter.addListener("onScreenCaptureEnded", callback)
      console.log("[v0] Screen capture ended listener added successfully")
      return subscription
    } catch (error) {
      console.error("[v0] Failed to add screen capture ended listener:", error)
      return { remove: () => {} }
    }
  },
}
