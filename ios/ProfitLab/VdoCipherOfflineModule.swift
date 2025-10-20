import Foundation
import React

@objc(VdoCipherOfflineModule)
class VdoCipherOfflineModule: RCTEventEmitter {
    
    private var hasListeners = false
    
    override init() {
        super.init()
        setupDownloadCallbacks()
    }
    
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    // MARK: - Event Emitter Setup
    
    override func supportedEvents() -> [String]! {
        return [
            "onDownloadProgress",
            "onDownloadComplete",
            "onDownloadError"
        ]
    }
    
    override func startObserving() {
        hasListeners = true
    }
    
    override func stopObserving() {
        hasListeners = false
    }
    
    // MARK: - Setup Callbacks
    
    private func setupDownloadCallbacks() {
        let manager = FairPlayDownloadManager.shared
        
        manager.onProgress = { [weak self] videoId, progress in
            guard let self = self, self.hasListeners else { return }
            self.sendEvent(withName: "onDownloadProgress", body: [
                "videoId": videoId,
                "progress": progress
            ])
        }
        
        manager.onComplete = { [weak self] videoId in
            guard let self = self, self.hasListeners else { return }
            self.sendEvent(withName: "onDownloadComplete", body: [
                "videoId": videoId
            ])
        }
        
        manager.onError = { [weak self] videoId, error in
            guard let self = self, self.hasListeners else { return }
            self.sendEvent(withName: "onDownloadError", body: [
                "videoId": videoId,
                "error": error.localizedDescription
            ])
        }
    }
    
    // MARK: - Download Video
    
    @objc
    func downloadVideo(
        _ videoId: String,
        otp: String,
        playbackInfo: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        print("[v0] ========== RN BRIDGE: downloadVideo ==========")
        print("[v0] Called from React Native")
        print("[v0] VideoId: \(videoId)")
        print("[v0] OTP length: \(otp.count) characters")
        print("[v0] PlaybackInfo length: \(playbackInfo.count) characters")
        print("[v0] Thread: \(Thread.isMainThread ? "Main" : "Background")")
        
        // TODO: Parse VdoCipher playbackInfo to extract HLS URL and FairPlay URLs
        // For now, using placeholder values
        // In production, you would parse the playbackInfo JSON to get:
        // - HLS manifest URL
        // - FairPlay certificate URL
        // - FairPlay license server URL
        
        print("[v0] ⚠️ TODO: Parse playbackInfo JSON to extract URLs")
        print("[v0] PlaybackInfo preview: \(String(playbackInfo.prefix(200)))...")
        
        // Placeholder implementation
        let hlsUrl = "https://example.com/video.m3u8" // Extract from playbackInfo
        let certificateUrl = "https://license.vdocipher.com/cert" // VdoCipher cert URL
        let licenseUrl = "https://license.vdocipher.com/license" // VdoCipher license URL
        let title = "Video \(videoId)"
        
        print("[v0] Using placeholder URLs:")
        print("[v0]   HLS: \(hlsUrl)")
        print("[v0]   Cert: \(certificateUrl)")
        print("[v0]   License: \(licenseUrl)")
        
        do {
            try FairPlayDownloadManager.shared.downloadVideo(
                videoId: videoId,
                hlsUrl: hlsUrl,
                certificateUrl: certificateUrl,
                licenseUrl: licenseUrl,
                title: title
            )
            
            let result: [String: Any] = [
                "downloadId": videoId,
                "status": "downloading",
                "message": "Download started successfully"
            ]
            
            print("[v0] ✅ Download initiated successfully")
            print("[v0] Resolving promise with: \(result)")
            resolver(result)
            print("[v0] ================================================")
        } catch {
            print("[v0] ❌ Download failed with error:")
            print("[v0] Error: \(error.localizedDescription)")
            print("[v0] Full error: \(error)")
            print("[v0] Rejecting promise")
            rejecter("DOWNLOAD_ERROR", error.localizedDescription, error)
            print("[v0] ================================================")
        }
    }
    
    // MARK: - Get All Downloads
    
    @objc
    func getAllDownloads(
        _ resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        print("[v0] ========== RN BRIDGE: getAllDownloads ==========")
        print("[v0] Called from React Native")
        
        let downloads = FairPlayDownloadManager.shared.getAllDownloads()
        
        print("[v0] Found \(downloads.count) downloads")
        
        let result = downloads.map { download -> [String: Any] in
            let mapped: [String: Any] = [
                "videoId": download["videoId"] as? String ?? "",
                "title": download["title"] as? String ?? "",
                "status": download["status"] as? String ?? "unknown",
                "progress": download["progress"] as? Double ?? 0.0,
                "localPath": download["localPath"] as? String ?? ""
            ]
            print("[v0]   - \(mapped["videoId"] ?? "unknown"): \(mapped["status"] ?? "unknown") (\(mapped["progress"] ?? 0)%)")
            return mapped
        }
        
        print("[v0] ✅ Resolving with \(result.count) downloads")
        resolver(result)
        print("[v0] ================================================")
    }
    
    // MARK: - Play Offline Video
    
    @objc
    func playOfflineVideo(
        _ videoId: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        print("[v0] ========== RN BRIDGE: playOfflineVideo ==========")
        print("[v0] Called from React Native")
        print("[v0] VideoId: \(videoId)")
        
        guard let videoInfo = FairPlayDownloadManager.shared.getOfflineVideo(videoId: videoId) else {
            print("[v0] ❌ Offline video not found for videoId: \(videoId)")
            rejecter("VIDEO_NOT_FOUND", "Offline video not found", nil)
            print("[v0] ====================================================")
            return
        }
        
        print("[v0] ✅ Video found: \(videoInfo)")
        
        // Check if content key is still valid
        print("[v0] 🔐 Checking content key validity...")
        guard let contentKey = SecureStorageManager.shared.getContentKey(forVideoId: videoId) else {
            print("[v0] ❌ Content key not found or expired")
            rejecter("LICENSE_EXPIRED", "Video license has expired", nil)
            print("[v0] ====================================================")
            return
        }
        
        print("[v0] ✅ Content key found: \(contentKey.count) bytes")
        print("[v0] ✅ Resolving with video info")
        resolver(videoInfo)
        print("[v0] ====================================================")
    }
    
    // MARK: - Remove Download
    
    @objc
    func removeDownload(
        _ videoId: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        print("[v0] ========== RN BRIDGE: removeDownload ==========")
        print("[v0] Called from React Native")
        print("[v0] VideoId: \(videoId)")
        
        do {
            try FairPlayDownloadManager.shared.removeDownload(videoId: videoId)
            print("[v0] ✅ Download removed successfully")
            resolver(["success": true, "videoId": videoId])
            print("[v0] ===================================================")
        } catch {
            print("[v0] ❌ Remove failed: \(error.localizedDescription)")
            print("[v0] Full error: \(error)")
            rejecter("REMOVE_ERROR", error.localizedDescription, error)
            print("[v0] ===================================================")
        }
    }
}
