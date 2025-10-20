import Foundation
import Security

/// Manages secure storage of FairPlay content keys in iOS Keychain
class SecureStorageManager {
    
    static let shared = SecureStorageManager()
    
    private let service = "com.profitlab.vdocipher.fairplay"
    
    private init() {}
    
    // MARK: - Save Content Key
    
    /// Save persistable content key data to Keychain
    func saveContentKey(_ data: Data, forVideoId videoId: String) -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: videoId,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
        ]
        
        // Delete existing key first
        SecItemDelete(query as CFDictionary)
        
        // Add new key
        let status = SecItemAdd(query as CFDictionary, nil)
        
        if status == errSecSuccess {
            print("[v0] Content key saved successfully for videoId: \(videoId)")
            return true
        } else {
            print("[v0] Failed to save content key. Status: \(status)")
            return false
        }
    }
    
    // MARK: - Retrieve Content Key
    
    /// Retrieve persistable content key data from Keychain
    func getContentKey(forVideoId videoId: String) -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: videoId,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        if status == errSecSuccess, let data = result as? Data {
            print("[v0] Content key retrieved successfully for videoId: \(videoId)")
            return data
        } else {
            print("[v0] Failed to retrieve content key. Status: \(status)")
            return nil
        }
    }
    
    // MARK: - Delete Content Key
    
    /// Delete content key from Keychain
    func deleteContentKey(forVideoId videoId: String) -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: videoId
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        
        if status == errSecSuccess || status == errSecItemNotFound {
            print("[v0] Content key deleted successfully for videoId: \(videoId)")
            return true
        } else {
            print("[v0] Failed to delete content key. Status: \(status)")
            return false
        }
    }
    
    // MARK: - Save Metadata
    
    /// Save video metadata (title, expiry date, etc.)
    func saveMetadata(_ metadata: [String: Any], forVideoId videoId: String) -> Bool {
        guard let jsonData = try? JSONSerialization.data(withJSONObject: metadata) else {
            print("[v0] Failed to serialize metadata")
            return false
        }
        
        let key = "\(videoId)_metadata"
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecValueData as String: jsonData,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
        ]
        
        SecItemDelete(query as CFDictionary)
        let status = SecItemAdd(query as CFDictionary, nil)
        
        return status == errSecSuccess
    }
    
    // MARK: - Retrieve Metadata
    
    /// Retrieve video metadata
    func getMetadata(forVideoId videoId: String) -> [String: Any]? {
        let key = "\(videoId)_metadata"
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        if status == errSecSuccess,
           let data = result as? Data,
           let metadata = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            return metadata
        }
        
        return nil
    }
    
    // MARK: - Delete All
    
    /// Delete all stored keys and metadata
    func deleteAll() -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        return status == errSecSuccess || status == errSecItemNotFound
    }
}
