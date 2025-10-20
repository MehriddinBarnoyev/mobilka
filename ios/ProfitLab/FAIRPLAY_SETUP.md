# FairPlay DRM Offline Playback Setup Guide

This guide explains how to implement FairPlay DRM protected offline video playback for VdoCipher on iOS.

## Overview

The implementation includes:
- **FairPlay DRM**: Secure offline downloads with Apple's FairPlay Streaming
- **Keychain Storage**: Secure storage of persistable content keys
- **License Management**: Automatic handling of license expiry
- **Progress Tracking**: Real-time download progress events
- **React Native Bridge**: Full integration with JavaScript

## Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     React Native (JS)                        │
│  OfflineDownloadManager.ts → VdoCipherOfflineModule         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  Native iOS (Swift)                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         VdoCipherOfflineModule.swift                  │  │
│  │  (React Native Bridge + Event Emitter)               │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │       FairPlayDownloadManager.swift                   │  │
│  │  • AVAssetDownloadTask                               │  │
│  │  • AVContentKeySession                               │  │
│  │  • FairPlay SPC/CKC flow                             │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │       SecureStorageManager.swift                      │  │
│  │  • Keychain API                                       │  │
│  │  • Persistable content key storage                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## Files Added

### Swift Files
1. **SecureStorageManager.swift** - Keychain management for DRM keys
2. **FairPlayDownloadManager.swift** - Core FairPlay download logic
3. **VdoCipherOfflineModule.swift** - React Native bridge module

### Bridge Files
4. **VdoCipherOfflineModule-Bridge.m** - Objective-C bridge header

### TypeScript Files
5. **native-modules/OfflineDownloadManager.ts** - Updated with event listeners

## Installation Steps

### 1. Add Files to Xcode

1. Open your iOS project in Xcode
2. Right-click on your project → "Add Files to [ProjectName]"
3. Add all Swift files:
   - `SecureStorageManager.swift`
   - `FairPlayDownloadManager.swift`
   - `VdoCipherOfflineModule.swift`
4. Add the bridge file:
   - `VdoCipherOfflineModule-Bridge.m`

### 2. Configure Build Settings

In Xcode, go to Build Settings and ensure:
- **Swift Language Version**: Swift 5.0+
- **Install Objective-C Compatibility Header**: YES

### 3. Add Required Capabilities

1. Go to your target → "Signing & Capabilities"
2. Add **Background Modes** capability
3. Enable:
   - ✅ Audio, AirPlay, and Picture in Picture
   - ✅ Background fetch
   - ✅ Background processing

### 4. Update Info.plist

Add the following keys:

\`\`\`xml
<key>UIBackgroundModes</key>
<array>
    <string>audio</string>
    <string>fetch</string>
    <string>processing</string>
</array>

<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
</dict>
\`\`\`

### 5. VdoCipher Integration

To integrate with VdoCipher's actual API, you need to:

1. **Parse playbackInfo JSON** to extract:
   - HLS manifest URL
   - FairPlay certificate URL
   - FairPlay license server URL

2. **Update VdoCipherOfflineModule.swift** line 60-65:

\`\`\`swift
// Parse the playbackInfo JSON
guard let playbackData = playbackInfo.data(using: .utf8),
      let json = try? JSONSerialization.jsonObject(with: playbackData) as? [String: Any],
      let hlsUrl = json["sources"]?["hls"] as? String,
      let drmInfo = json["drm"] as? [String: Any],
      let certificateUrl = drmInfo["certificateUrl"] as? String,
      let licenseUrl = drmInfo["licenseUrl"] as? String else {
    rejecter("INVALID_PLAYBACK_INFO", "Failed to parse playback info", nil)
    return
}
\`\`\`

3. **Add VdoCipher headers** to license requests in `FairPlayDownloadManager.swift`:

\`\`\`swift
request.setValue(otp, forHTTPHeaderField: "X-VdoCipher-OTP")
request.setValue(playbackInfo, forHTTPHeaderField: "X-VdoCipher-PlaybackInfo")
\`\`\`

## Usage in React Native

### Basic Download

\`\`\`typescript
import { OfflineDownload } from './native-modules/OfflineDownloadManager';

// Start download
const result = await OfflineDownload.downloadVideo(
  videoId,
  otp,
  playbackInfo
);

console.log('Download started:', result.downloadId);
\`\`\`

### Track Progress

\`\`\`typescript
// Listen for progress updates
const progressListener = OfflineDownload.addDownloadProgressListener((event) => {
  console.log(`Download ${event.videoId}: ${event.progress}%`);
  setProgress(event.progress);
});

// Listen for completion
const completeListener = OfflineDownload.addDownloadCompleteListener((event) => {
  console.log(`Download completed: ${event.videoId}`);
  Alert.alert('Success', 'Video downloaded!');
});

// Listen for errors
const errorListener = OfflineDownload.addDownloadErrorListener((event) => {
  console.error(`Download error: ${event.error}`);
  Alert.alert('Error', event.error);
});

// Cleanup
return () => {
  progressListener.remove();
  completeListener.remove();
  errorListener.remove();
};
\`\`\`

### Play Offline Video

\`\`\`typescript
try {
  const videoInfo = await OfflineDownload.playOfflineVideo(videoId);
  
  // Use videoInfo.localPath to play the video
  // The FairPlay license is automatically handled
  console.log('Playing offline video:', videoInfo.localPath);
  
} catch (error) {
  if (error.code === 'LICENSE_EXPIRED') {
    Alert.alert('License Expired', 'Please re-download the video');
  }
}
\`\`\`

### Remove Download

\`\`\`typescript
await OfflineDownload.removeDownload(videoId);
console.log('Download removed');
\`\`\`

## Security Features

### 1. FairPlay DRM Protection
- Videos are encrypted with Apple's FairPlay Streaming
- Content keys are persistable and stored securely
- No raw video files are exposed

### 2. Keychain Storage
- All DRM keys stored in iOS Keychain
- Keys are accessible only after device unlock
- Automatic cleanup on app uninstall

### 3. License Expiry
- Licenses expire based on VdoCipher settings
- Playback automatically fails when license expires
- Users must re-download to renew license

### 4. Secure Cleanup
- Downloaded files are removed on delete
- DRM keys are invalidated and removed
- Metadata is cleared from Keychain

## Testing

### On Simulator
FairPlay DRM does NOT work on iOS Simulator. You will see:
\`\`\`
VdoCipher video playback (FairPlay Streaming) is not supported on simulators.
Please run the application on physical iOS device.
\`\`\`

### On Physical Device
1. Build and run on a physical iOS device
2. Ensure you have a valid VdoCipher OTP and playbackInfo
3. Test download, progress tracking, and offline playback
4. Verify license expiry handling

## Troubleshooting

### Module Not Found
- Ensure all Swift files are added to the correct target
- Clean build folder: Xcode → Product → Clean Build Folder
- Delete `ios/build` and rebuild

### FairPlay Errors
- Verify certificate URL is correct
- Check license server URL and authentication
- Ensure OTP and playbackInfo are valid
- Test on physical device (not simulator)

### Download Fails
- Check network connectivity
- Verify HLS manifest URL is accessible
- Check Xcode console for detailed error logs
- Ensure background modes are enabled

### License Expired
- This is expected behavior when license expires
- User must re-download the video
- Check VdoCipher dashboard for license duration settings

## Production Checklist

- [ ] Parse VdoCipher playbackInfo correctly
- [ ] Add VdoCipher authentication headers
- [ ] Test on physical iOS devices
- [ ] Verify license expiry handling
- [ ] Test background downloads
- [ ] Implement proper error handling
- [ ] Add analytics for download success/failure
- [ ] Test with various network conditions
- [ ] Verify Keychain security
- [ ] Test app reinstall scenarios

## Additional Resources

- [Apple FairPlay Streaming Documentation](https://developer.apple.com/streaming/fps/)
- [AVFoundation Programming Guide](https://developer.apple.com/documentation/avfoundation)
- [VdoCipher iOS SDK Documentation](https://www.vdocipher.com/docs/ios)
- [Keychain Services Documentation](https://developer.apple.com/documentation/security/keychain_services)

## Support

For issues specific to:
- **FairPlay implementation**: Check Apple Developer Forums
- **VdoCipher integration**: Contact VdoCipher support
- **React Native bridge**: Check React Native documentation
