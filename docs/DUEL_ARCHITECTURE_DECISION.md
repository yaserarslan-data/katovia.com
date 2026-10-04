# Reaction Duel V1 decision

The existing static hosting can safely serve a small casual target-link product with no additional backend. `/d/?id=v1.N` is a real static player file, not a 404 rewrite or fake clean route. Token is a strict versioned integer reaction target 0–60,000 ms; unknown versions, malformed, duplicate and out-of-range IDs fail safely. It carries no name/identity/PII. The query may be visible in ordinary hosting logs; it contains only the target. No public-write API or cloud resource is added.

The reusable Reaction engine provides performance.now timing, random crypto delay, early-tap retry, one completion per attempt and interruption. Duel has separate state and never consumes a Daily result. Scores are rounded to integer ms before target comparison; lower wins, higher loses, equal ties. Rematch retries the same target; sharing after completion sends the new player's target.

Targets and client timings are editable. This is explicitly a **casual, non-authoritative** challenge, not authenticated competition, a leaderboard or proof of fairness across devices. The UI states this. No server persistence, anti-cheat, secret score or cross-device authoritative record is claimed. Such competitive/server features remain future work requiring a separate reviewed storage/identity/abuse design. Current v1 is reliable without assuming an unconfigured provider's free quota.

`/d/` is noindex and absent from sitemap. General `/challenge/` is indexable. Metadata is generic; personal dynamic OG cards/opaque short IDs require future hosting support and are not implemented. No billing, payment, Firebase/Google Cloud project or hosting change occurred.
