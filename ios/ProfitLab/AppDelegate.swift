import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import AudioToolbox

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?
  private var reactNativeDelegate: ReactNativeDelegate?
  private var reactNativeFactory: RCTReactNativeFactory?
  private var secureField: UITextField?

  // MARK: - App Start
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {

    // React Native initialization
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    let mainWindow = UIWindow(frame: UIScreen.main.bounds)
    window = mainWindow

    factory.startReactNative(
      withModuleName: "ProfitLab",
      in: mainWindow,
      launchOptions: launchOptions
    )

    // 📸 Screenshot kuzatuvchi
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(onUserDidTakeScreenshot),
      name: UIApplication.userDidTakeScreenshotNotification,
      object: nil
    )

    // 🎥 Screen recording kuzatuvchi
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(onScreenCaptureStatusChanged),
      name: UIScreen.capturedDidChangeNotification,
      object: nil
    )

    // App lifecycle kuzatuvchi
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(applicationDidBecomeActive),
      name: UIApplication.didBecomeActiveNotification,
      object: nil
    )

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(applicationDidEnterBackground),
      name: UIApplication.didEnterBackgroundNotification,
      object: nil
    )

    DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
      self.setupSecureOverlay()
    }

    return true
  }

  // MARK: - Lifecycle
  @objc func applicationDidBecomeActive() {
    updateSecureOverlay()
  }

  @objc func applicationDidEnterBackground() {
    removeSecureOverlay()
  }

  // MARK: - Screenshot event
  @objc func onUserDidTakeScreenshot() {
    print("⚠️ Screenshot detected!")

    // Vibratsiya berish
    AudioServicesPlaySystemSound(kSystemSoundID_Vibrate)

    // Qora overlay
    secureField?.backgroundColor = .black
    secureField?.alpha = 1.0

    // Alert ko‘rsatish
    showScreenshotWarning()
  }

  // MARK: - Screen Recording status
  @objc func onScreenCaptureStatusChanged() {
    updateSecureOverlay()
  }

  // MARK: - Secure Overlay Management
  private func setupSecureOverlay() {
    guard let win = self.window, secureField == nil else { return }

    let secureTextField = UITextField(frame: win.bounds)
    secureTextField.isSecureTextEntry = true
    secureTextField.isUserInteractionEnabled = false
    secureTextField.backgroundColor = .clear
    secureTextField.alpha = 0.0
    win.addSubview(secureTextField)
    win.bringSubviewToFront(secureTextField)
    secureField = secureTextField

    updateSecureOverlay()
  }

  private func removeSecureOverlay() {
    secureField?.removeFromSuperview()
    secureField = nil
  }

  private func updateSecureOverlay() {
    guard let win = self.window else { return }

    if UIScreen.main.isCaptured {
      secureField?.backgroundColor = .black
      secureField?.alpha = 1.0
      win.bringSubviewToFront(secureField!)
    } else {
      secureField?.backgroundColor = .clear
      secureField?.alpha = 0.0
    }
  }

  // MARK: - Alert when screenshot is taken
  private func showScreenshotWarning() {
    guard let win = self.window else { return }

    let alert = UIAlertController(
      title: "❌ Screenshot taqiqlangan",
      message: "Bu ilova mualliflik huquqi bilan himoyalangan. Screenshot olish ma’lumot xavfsizligi siyosatiga zid.",
      preferredStyle: .alert
    )

    alert.addAction(UIAlertAction(title: "Tushunarli", style: .default, handler: { _ in
      // Alert yopilgach, overlayni tiklash
      self.updateSecureOverlay()
    }))

    win.rootViewController?.present(alert, animated: true, completion: nil)
  }
}

// MARK: - React Native Delegate
class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    return bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
