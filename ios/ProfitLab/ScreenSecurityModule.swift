import Foundation
import React
import UIKit

@objc(ScreenSecurityModule)
class ScreenSecurityModule: RCTEventEmitter {
  
  private var hasListeners = false
  
  override init() {
    super.init()
    setupScreenCaptureMonitoring()
  }
  
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  // MARK: - Event Emitter Setup
  override func supportedEvents() -> [String]! {
    return ["onScreenCaptured", "onScreenCaptureEnded"]
  }
  
  override func startObserving() {
    hasListeners = true
  }
  
  override func stopObserving() {
    hasListeners = false
  }
  
  // MARK: - Screen Capture Monitoring
  private func setupScreenCaptureMonitoring() {
    if #available(iOS 11.0, *) {
      NotificationCenter.default.addObserver(
        self,
        selector: #selector(screenCaptureDidChange),
        name: UIScreen.capturedDidChangeNotification,
        object: nil
      )
      
      NotificationCenter.default.addObserver(
        self,
        selector: #selector(userDidTakeScreenshot),
        name: UIApplication.userDidTakeScreenshotNotification,
        object: nil
      )
    }
  }
  
  @objc
  private func screenCaptureDidChange() {
    guard hasListeners else { return }
    
    if #available(iOS 11.0, *) {
      let isCaptured = UIScreen.main.isCaptured
      
      if isCaptured {
        sendEvent(withName: "onScreenCaptured", body: [
          "isCaptured": true,
          "timestamp": Date().timeIntervalSince1970,
          "type": "recording"
        ])
      } else {
        sendEvent(withName: "onScreenCaptureEnded", body: [
          "isCaptured": false,
          "timestamp": Date().timeIntervalSince1970
        ])
      }
    }
  }
  
  @objc
  private func userDidTakeScreenshot() {
    guard hasListeners else { return }
    
    sendEvent(withName: "onScreenCaptured", body: [
      "isCaptured": true,
      "timestamp": Date().timeIntervalSince1970,
      "type": "screenshot"
    ])
    
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
      self?.sendEvent(withName: "onScreenCaptureEnded", body: [
        "isCaptured": false,
        "timestamp": Date().timeIntervalSince1970
      ])
    }
  }
  
  // MARK: - Public Methods
  @objc
  func isScreenBeingCaptured(
    _ resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    if #available(iOS 11.0, *) {
      resolver(["isCaptured": UIScreen.main.isCaptured])
    } else {
      resolver(["isCaptured": false])
    }
  }
  
  deinit {
    NotificationCenter.default.removeObserver(self)
  }
}
