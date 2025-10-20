import Foundation
import AVFoundation

/// Manages FairPlay DRM protected video downloads for offline playback
class FairPlayDownloadManager: NSObject {
    
    static let shared = FairPlayDownloadManager()
    
    private var activeDownloads: [String: AVAggregateAssetDownloadTask] = [:]
    private var downloadSessions: [String: AVAssetDownloadURLSession] = [:]
    private var contentKeySessions: [String: AVContentKeySession] = [:]
    
    // Progress callbacks
    var onProgress: ((String, Double) -> Void)?
    var onComplete: ((String) -> Void)?
    var onError: ((String, Error) -> Void)?
    
    private override init() {
        super.init()
    }
    
    // MARK: - Download Video
    
    /// Start downloading a video with FairPlay DRM protection
    /// - Parameters:
    ///   - videoId: Unique identifier for the video
    ///   - hlsUrl: HLS manifest URL
    ///   - certificateUrl: FairPlay certificate URL
    ///   - licenseUrl: FairPlay license server URL
    ///   - title: Video title for display
    func downloadVideo(
        videoId: String,
        hlsUrl: String,
        certificateUrl: String,
        licenseUrl: String,
        title: String
    ) throws {
        print("[v0] ========== DOWNLOAD START ==========")
        print("[v0] Starting FairPlay download for videoId: \(videoId)")
        print("[v0] HLS URL: \(hlsUrl)")
        print("[v0] Certificate URL: \(certificateUrl)")
        print("[v0] License URL: \(licenseUrl)")
        print("[v0] Title: \(title)")
        print("[v0] Device: \(UIDevice.current.model)")
        print("[v0] iOS Version: \(UIDevice.current.systemVersion)")
        
        // Check if running on simulator
        #if targetEnvironment(simulator)
        print("[v0] ⚠️ WARNING: Running on simulator - FairPlay may not work")
        #else
        print("[v0] ✅ Running on physical device")
        #endif
        
        guard let url = URL(string: hlsUrl) else {
            print("[v0] ❌ ERROR: Invalid HLS URL: \(hlsUrl)")
            throw NSError(domain: "FairPlayDownloadManager", code: 1001, userInfo: [
                NSLocalizedDescriptionKey: "Invalid HLS URL"
            ])
        }
        
        print("[v0] ✅ HLS URL validated successfully")
        
        // Create AVURLAsset
        print("[v0] Creating AVURLAsset...")
        let asset = AVURLAsset(url: url)
        print("[v0] ✅ AVURLAsset created")
        
        // Create content key session for FairPlay
        print("[v0] Creating AVContentKeySession for FairPlay...")
        let contentKeySession = AVContentKeySession(keySystem: .fairPlayStreaming)
        let delegate = FairPlayContentKeyDelegate(
            videoId: videoId,
            certificateUrl: certificateUrl,
            licenseUrl: licenseUrl
        )
        contentKeySession.setDelegate(delegate, queue: DispatchQueue.main)
        contentKeySession.addContentKeyRecipient(asset)
        
        contentKeySessions[videoId] = contentKeySession
        print("[v0] ✅ Content key session created and delegate set")
        
        // Create download session
        print("[v0] Creating background URLSession...")
        let config = URLSessionConfiguration.background(withIdentifier: "com.profitlab.vdocipher.download.\(videoId)")
        config.isDiscretionary = false
        config.sessionSendsLaunchEvents = true
        
        let session = AVAssetDownloadURLSession(
            configuration: config,
            assetDownloadDelegate: self,
            delegateQueue: OperationQueue.main
        )
        
        downloadSessions[videoId] = session
        print("[v0] ✅ Download session created")
        
        // Start download task
        print("[v0] Creating aggregate asset download task...")
        guard let task = session.aggregateAssetDownloadTask(
            with: asset,
            mediaSelections: [asset.preferredMediaSelection],
            assetTitle: title,
            assetArtworkData: nil,
            options: [AVAssetDownloadTaskMinimumRequiredMediaBitrateKey: 265000]
        ) else {
            print("[v0] ❌ ERROR: Failed to create download task")
            throw NSError(domain: "FairPlayDownloadManager", code: 1002, userInfo: [
                NSLocalizedDescriptionKey: "Failed to create download task"
            ])
        }
        
        activeDownloads[videoId] = task
        print("[v0] ✅ Download task created")
        
        // Save metadata
        print("[v0] Saving download metadata...")
        let metadata: [String: Any] = [
            "videoId": videoId,
            "title": title,
            "hlsUrl": hlsUrl,
            "startDate": Date().timeIntervalSince1970,
            "status": "downloading"
        ]
        let saved = SecureStorageManager.shared.saveMetadata(metadata, forVideoId: videoId)
        print("[v0] Metadata save result: \(saved ? "✅ Success" : "❌ Failed")")
        
        task.resume()
        print("[v0] ✅ Download task resumed and started")
        print("[v0] ========== DOWNLOAD INITIATED ==========")
    }
    
    // MARK: - Get All Downloads
    
    /// Get all downloaded videos with their status
    func getAllDownloads() -> [[String: Any]] {
        print("[v0] Getting all downloads")
        
        var downloads: [[String: Any]] = []
        
        // Get all stored metadata
        let fileManager = FileManager.default
        guard let documentsPath = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first else {
            return downloads
        }
        
        // Check for downloaded assets
        do {
            let contents = try fileManager.contentsOfDirectory(at: documentsPath, includingPropertiesForKeys: nil)
            
            for url in contents {
                if url.pathExtension == "movpkg" {
                    let videoId = url.deletingPathExtension().lastPathComponent
                    
                    if let metadata = SecureStorageManager.shared.getMetadata(forVideoId: videoId) {
                        var downloadInfo = metadata
                        downloadInfo["localPath"] = url.path
                        downloadInfo["progress"] = 100.0
                        downloadInfo["status"] = "completed"
                        downloads.append(downloadInfo)
                    }
                }
            }
        } catch {
            print("[v0] Error reading downloads directory: \(error)")
        }
        
        // Add active downloads
        for (videoId, _) in activeDownloads {
            if let metadata = SecureStorageManager.shared.getMetadata(forVideoId: videoId) {
                var downloadInfo = metadata
                downloadInfo["status"] = "downloading"
                downloads.append(downloadInfo)
            }
        }
        
        print("[v0] Found \(downloads.count) downloads")
        return downloads
    }
    
    // MARK: - Remove Download
    
    /// Remove a downloaded video and its DRM keys
    func removeDownload(videoId: String) throws {
        print("[v0] Removing download for videoId: \(videoId)")
        
        // Cancel active download if exists
        if let task = activeDownloads[videoId] {
            task.cancel()
            activeDownloads.removeValue(forKey: videoId)
        }
        
        // Invalidate content key session
        if let session = contentKeySessions[videoId] {
            session.invalidateAllKeys()
            contentKeySessions.removeValue(forKey: videoId)
        }
        
        // Delete downloaded file
        let fileManager = FileManager.default
        if let documentsPath = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first {
            let assetPath = documentsPath.appendingPathComponent("\(videoId).movpkg")
            
            if fileManager.fileExists(atPath: assetPath.path) {
                try fileManager.removeItem(at: assetPath)
                print("[v0] Deleted asset file at: \(assetPath.path)")
            }
        }
        
        // Delete DRM keys and metadata
        _ = SecureStorageManager.shared.deleteContentKey(forVideoId: videoId)
        
        print("[v0] Download removed successfully for videoId: \(videoId)")
    }
    
    // MARK: - Get Offline Video
    
    /// Get offline video information for playback
    func getOfflineVideo(videoId: String) -> [String: Any]? {
        print("[v0] Getting offline video for videoId: \(videoId)")
        
        let fileManager = FileManager.default
        guard let documentsPath = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first else {
            return nil
        }
        
        let assetPath = documentsPath.appendingPathComponent("\(videoId).movpkg")
        
        guard fileManager.fileExists(atPath: assetPath.path) else {
            print("[v0] Offline video not found at: \(assetPath.path)")
            return nil
        }
        
        guard let metadata = SecureStorageManager.shared.getMetadata(forVideoId: videoId) else {
            print("[v0] Metadata not found for videoId: \(videoId)")
            return nil
        }
        
        var videoInfo = metadata
        videoInfo["localPath"] = assetPath.path
        videoInfo["videoId"] = videoId
        
        return videoInfo
    }
}

// MARK: - AVAssetDownloadDelegate

extension FairPlayDownloadManager: AVAssetDownloadDelegate {
    
    func urlSession(
        _ session: URLSession,
        aggregateAssetDownloadTask: AVAggregateAssetDownloadTask,
        didLoad timeRange: CMTimeRange,
        totalTimeRangesLoaded loadedTimeRanges: [NSValue],
        timeRangeExpectedToLoad: CMTimeRange,
        for mediaSelection: AVMediaSelection
    ) {
        var percentComplete = 0.0
        for value in loadedTimeRanges {
            let loadedTimeRange = value.timeRangeValue
            percentComplete += loadedTimeRange.duration.seconds / timeRangeExpectedToLoad.duration.seconds
        }
        
        percentComplete *= 100
        
        // Find videoId for this task
        if let videoId = activeDownloads.first(where: { $0.value == aggregateAssetDownloadTask })?.key {
            print("[v0] 📊 Download progress for \(videoId): \(String(format: "%.1f", percentComplete))%")
            print("[v0]    Loaded ranges: \(loadedTimeRanges.count)")
            print("[v0]    Expected duration: \(timeRangeExpectedToLoad.duration.seconds)s")
            onProgress?(videoId, percentComplete)
        }
    }
    
    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        guard let downloadTask = task as? AVAggregateAssetDownloadTask else { return }
        
        // Find videoId for this task
        guard let videoId = activeDownloads.first(where: { $0.value == downloadTask })?.key else {
            print("[v0] ⚠️ WARNING: Could not find videoId for completed task")
            return
        }
        
        if let error = error {
            print("[v0] ========== DOWNLOAD FAILED ==========")
            print("[v0] ❌ Download failed for \(videoId)")
            print("[v0] Error domain: \(error._domain)")
            print("[v0] Error code: \(error._code)")
            print("[v0] Error description: \(error.localizedDescription)")
            print("[v0] Full error: \(error)")
            
            // Check for common error types
            let nsError = error as NSError
            if nsError.domain == NSURLErrorDomain {
                print("[v0] 🌐 Network error detected")
                switch nsError.code {
                case NSURLErrorNotConnectedToInternet:
                    print("[v0]    → No internet connection")
                case NSURLErrorTimedOut:
                    print("[v0]    → Request timed out")
                case NSURLErrorCannotFindHost:
                    print("[v0]    → Cannot find host")
                case NSURLErrorCannotConnectToHost:
                    print("[v0]    → Cannot connect to host")
                default:
                    print("[v0]    → Other network error: \(nsError.code)")
                }
            }
            
            onError?(videoId, error)
            
            // Update metadata
            if var metadata = SecureStorageManager.shared.getMetadata(forVideoId: videoId) {
                metadata["status"] = "failed"
                metadata["error"] = error.localizedDescription
                metadata["errorCode"] = nsError.code
                metadata["errorDomain"] = nsError.domain
                _ = SecureStorageManager.shared.saveMetadata(metadata, forVideoId: videoId)
                print("[v0] ✅ Error metadata saved")
            }
            print("[v0] ========================================")
        } else {
            print("[v0] ========== DOWNLOAD COMPLETED ==========")
            print("[v0] ✅ Download completed successfully for \(videoId)")
            
            // Check if file exists
            let fileManager = FileManager.default
            if let documentsPath = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first {
                let assetPath = documentsPath.appendingPathComponent("\(videoId).movpkg")
                let exists = fileManager.fileExists(atPath: assetPath.path)
                print("[v0] File exists at path: \(exists ? "✅ Yes" : "❌ No")")
                print("[v0] Expected path: \(assetPath.path)")
                
                if exists {
                    do {
                        let attributes = try fileManager.attributesOfItem(atPath: assetPath.path)
                        let fileSize = attributes[.size] as? Int64 ?? 0
                        print("[v0] File size: \(fileSize) bytes (\(Double(fileSize) / 1024 / 1024) MB)")
                    } catch {
                        print("[v0] ⚠️ Could not get file attributes: \(error)")
                    }
                }
            }
            
            onComplete?(videoId)
            
            // Update metadata
            if var metadata = SecureStorageManager.shared.getMetadata(forVideoId: videoId) {
                metadata["status"] = "completed"
                metadata["completedDate"] = Date().timeIntervalSince1970
                _ = SecureStorageManager.shared.saveMetadata(metadata, forVideoId: videoId)
                print("[v0] ✅ Completion metadata saved")
            }
            print("[v0] ==========================================")
        }
        
        // Cleanup
        activeDownloads.removeValue(forKey: videoId)
        downloadSessions.removeValue(forKey: videoId)
        print("[v0] 🧹 Cleaned up download session for \(videoId)")
    }
}

// MARK: - FairPlay Content Key Delegate

class FairPlayContentKeyDelegate: NSObject, AVContentKeySessionDelegate {
    
    let videoId: String
    let certificateUrl: String
    let licenseUrl: String
    
    init(videoId: String, certificateUrl: String, licenseUrl: String) {
        self.videoId = videoId
        self.certificateUrl = certificateUrl
        self.licenseUrl = licenseUrl
        super.init()
    }
    
    func contentKeySession(
        _ session: AVContentKeySession,
        didProvide keyRequest: AVContentKeyRequest
    ) {
        print("[v0] ========== FAIRPLAY KEY REQUEST ==========")
        print("[v0] 🔑 FairPlay key request received for videoId: \(videoId)")
        print("[v0] Certificate URL: \(certificateUrl)")
        print("[v0] License URL: \(licenseUrl)")
        
        // Request application certificate
        guard let certUrl = URL(string: certificateUrl) else {
            print("[v0] ❌ ERROR: Invalid certificate URL: \(certificateUrl)")
            keyRequest.processContentKeyResponseError(NSError(
                domain: "FairPlay",
                code: 2001,
                userInfo: [NSLocalizedDescriptionKey: "Invalid certificate URL"]
            ))
            return
        }
        
        print("[v0] 📡 Fetching FairPlay certificate from: \(certUrl)")
        
        URLSession.shared.dataTask(with: certUrl) { [weak self] certData, response, error in
            guard let self = self else { return }
            
            if let error = error {
                print("[v0] ❌ Failed to fetch certificate: \(error.localizedDescription)")
                print("[v0] Full error: \(error)")
                keyRequest.processContentKeyResponseError(error)
                return
            }
            
            if let httpResponse = response as? HTTPURLResponse {
                print("[v0] 📥 Certificate response status: \(httpResponse.statusCode)")
                print("[v0] Response headers: \(httpResponse.allHeaderFields)")
            }
            
            guard let certData = certData else {
                print("[v0] ❌ No certificate data received")
                keyRequest.processContentKeyResponseError(NSError(
                    domain: "FairPlay",
                    code: 2002,
                    userInfo: [NSLocalizedDescriptionKey: "No certificate data"]
                ))
                return
            }
            
            print("[v0] ✅ Certificate received: \(certData.count) bytes")
            
            // Create SPC (Server Playback Context)
            print("[v0] 🔐 Creating SPC (Server Playback Context)...")
            do {
                let contentIdentifier = self.videoId.data(using: .utf8)!
                print("[v0] Content identifier: \(self.videoId)")
                
                let spcData = try keyRequest.makeStreamingContentKeyRequestData(
                    forApp: certData,
                    contentIdentifier: contentIdentifier,
                    options: nil
                )
                
                print("[v0] ✅ SPC created: \(spcData.count) bytes")
                
                // Request CKC (Content Key Context) from license server
                self.requestCKC(spcData: spcData, keyRequest: keyRequest)
                
            } catch {
                print("[v0] ❌ Failed to create SPC: \(error.localizedDescription)")
                print("[v0] Full error: \(error)")
                keyRequest.processContentKeyResponseError(error)
            }
        }.resume()
    }
    
    private func requestCKC(spcData: Data, keyRequest: AVContentKeyRequest) {
        print("[v0] ========== CKC REQUEST ==========")
        print("[v0] 📡 Requesting CKC from license server...")
        print("[v0] License URL: \(licenseUrl)")
        print("[v0] SPC data size: \(spcData.count) bytes")
        
        guard let licenseUrl = URL(string: licenseUrl) else {
            print("[v0] ❌ ERROR: Invalid license URL: \(licenseUrl)")
            keyRequest.processContentKeyResponseError(NSError(
                domain: "FairPlay",
                code: 2003,
                userInfo: [NSLocalizedDescriptionKey: "Invalid license URL"]
            ))
            return
        }
        
        var request = URLRequest(url: licenseUrl)
        request.httpMethod = "POST"
        request.httpBody = spcData
        request.setValue("application/octet-stream", forHTTPHeaderField: "Content-Type")
        
        print("[v0] 📤 Sending POST request to license server...")
        
        URLSession.shared.dataTask(with: request) { [weak self] ckcData, response, error in
            guard let self = self else { return }
            
            if let error = error {
                print("[v0] ❌ Failed to fetch CKC: \(error.localizedDescription)")
                print("[v0] Full error: \(error)")
                keyRequest.processContentKeyResponseError(error)
                return
            }
            
            if let httpResponse = response as? HTTPURLResponse {
                print("[v0] 📥 CKC response status: \(httpResponse.statusCode)")
                print("[v0] Response headers: \(httpResponse.allHeaderFields)")
                
                if httpResponse.statusCode != 200 {
                    print("[v0] ⚠️ WARNING: Non-200 status code received")
                }
            }
            
            guard let ckcData = ckcData else {
                print("[v0] ❌ No CKC data received")
                keyRequest.processContentKeyResponseError(NSError(
                    domain: "FairPlay",
                    code: 2004,
                    userInfo: [NSLocalizedDescriptionKey: "No CKC data"]
                ))
                return
            }
            
            print("[v0] ✅ CKC received: \(ckcData.count) bytes")
            
            // Create persistable content key
            print("[v0] 💾 Creating persistable content key...")
            do {
                let persistableKey = try keyRequest.persistableContentKey(
                    fromKeyVendorResponse: ckcData,
                    options: nil
                )
                
                print("[v0] ✅ Persistable key created: \(persistableKey.count) bytes")
                
                // Save to Keychain
                print("[v0] 🔐 Saving content key to Keychain...")
                let saved = SecureStorageManager.shared.saveContentKey(persistableKey, forVideoId: self.videoId)
                print("[v0] Keychain save result: \(saved ? "✅ Success" : "❌ Failed")")
                
                // Process the key response
                print("[v0] ✅ Processing content key response...")
                let keyResponse = AVContentKeyResponse(fairPlayStreamingKeyResponseData: ckcData)
                keyRequest.processContentKeyResponse(keyResponse)
                
                print("[v0] ✅ FairPlay key processed and saved successfully")
                print("[v0] =====================================")
                
            } catch {
                print("[v0] ❌ Failed to create persistable key: \(error.localizedDescription)")
                print("[v0] Full error: \(error)")
                keyRequest.processContentKeyResponseError(error)
            }
        }.resume()
    }
}
