import Time "mo:base/Time";
import Text "mo:base/Text";
import Char "mo:base/Char";
import Array "mo:base/Array";
import Random "mo:base/Random";

module {
    // Generate unique IDs
    public func generateId(prefix: Text): Text {
        let timestamp = Time.now();
        prefix # "-" # Int.toText(timestamp);
    };

    // Validate email format (basic)
    public func isValidEmail(email: Text): Bool {
        Text.contains(email, #char '@') and Text.size(email) > 5;
    };

    // Sanitize text input
    public func sanitizeText(input: Text): Text {
        // Remove dangerous characters and trim whitespace
        let trimmed = Text.trim(input, #char ' ');
        if (Text.size(trimmed) == 0) {
            "";
        } else {
            trimmed;
        };
    };

    // Validate asset file format
    public func isValidVRFormat(format: Text): Bool {
        let validFormats = ["fbx", "obj", "gltf", "glb", "unity", "unreal", "blend"];
        Array.find<Text>(validFormats, func(f) = f == Text.toLowercase(format)) != null;
    };

    // Calculate file size in human readable format
    public func formatFileSize(bytes: Nat): Text {
        if (bytes < 1024) {
            Nat.toText(bytes) # " B";
        } else if (bytes < 1024 * 1024) {
            Nat.toText(bytes / 1024) # " KB";
        } else if (bytes < 1024 * 1024 * 1024) {
            Nat.toText(bytes / (1024 * 1024)) # " MB";
        } else {
            Nat.toText(bytes / (1024 * 1024 * 1024)) # " GB";
        };
    };

    // Validate price (must be positive)
    public func isValidPrice(price: Nat): Bool {
        price > 0;
    };

    // Convert ICP to e8s (smallest unit)
    public func icpToE8s(icp: Float): Nat {
        let e8s = icp * 100_000_000.0;
        Int.abs(Float.toInt(e8s));
    };

    // Convert e8s to ICP
    public func e8sToIcp(e8s: Nat): Float {
        Float.fromInt(e8s) / 100_000_000.0;
    };
}
