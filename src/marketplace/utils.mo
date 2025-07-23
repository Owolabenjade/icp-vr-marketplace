import Time "mo:base/Time";
import Float "mo:base/Float";
import Int "mo:base/Int";

module {
    // Marketplace fee percentage (2.5%)
    private let MARKETPLACE_FEE_PERCENT: Float = 2.5;
    
    // Escrow timeout (24 hours in nanoseconds)
    private let ESCROW_TIMEOUT_NS: Int = 24 * 60 * 60 * 1_000_000_000;

    // Calculate marketplace fee
    public func calculateMarketplaceFee(amount: Nat): Nat {
        let fee = Float.fromInt(amount) * (MARKETPLACE_FEE_PERCENT / 100.0);
        Int.abs(Float.toInt(fee));
    };

    // Calculate seller earnings after marketplace fee
    public func calculateSellerEarnings(amount: Nat): Nat {
        let fee = calculateMarketplaceFee(amount);
        if (amount > fee) {
            amount - fee;
        } else {
            0;
        };
    };

    // Check if escrow has expired
    public func isEscrowExpired(createdAt: Int): Bool {
        let now = Time.now();
        let expirationTime = createdAt + ESCROW_TIMEOUT_NS;
        now > expirationTime;
    };

    // Generate transaction ID
    public func generateTransactionId(): Text {
        let timestamp = Time.now();
        "txn-" # Int.toText(timestamp);
    };

    // Generate listing ID
    public func generateListingId(): Text {
        let timestamp = Time.now();
        "listing-" # Int.toText(timestamp);
    };

    // Validate purchase amount
    public func isValidPurchaseAmount(amount: Nat): Bool {
        amount > 0;
    };

    // Get escrow expiration time
    public func getEscrowExpiration(createdAt: Int): Int {
        createdAt + ESCROW_TIMEOUT_NS;
    };

    // Convert ICP to e8s for display
    public func formatIcpAmount(e8s: Nat): Text {
        let icp = Float.fromInt(e8s) / 100_000_000.0;
        Float.toText(icp) # " ICP";
    };
}
