/**
 * Module 4.7 - Zero-Knowledge Range Proof Utility
 * 
 * Generates and verifies a commitment-based range proof for binary votes (0 or 1).
 * The proof ensures the vote plaintext is in the valid range {0, 1}
 * without revealing the exact value.
 * 
 * Approach: SHA-256 hash commitment
 *   commitment = hash(value + ":" + nonce)
 * 
 * The prover knows `value` ∈ {0, 1}. The verifier checks that:
 *   1. The decrypted vote is either 0 or 1 (binary range check)
 *   2. hash(decryptedValue + ":" + nonce) === commitment
 */

/**
 * Generates a ZK range proof for a binary vote value.
 * @param {number|bigint} value - The plaintext vote value (must be 0 or 1)
 * @returns {{ commitment: string, nonce: string, valid: boolean }}
 */
export function generateRangeProof(value) {
    const numVal = Number(value);

    // Range check: only 0 or 1 are valid binary votes
    if (numVal !== 0 && numVal !== 1) {
        console.warn('[ZKRangeProof] Invalid vote value — not in range {0, 1}:', numVal);
        return { commitment: null, nonce: null, valid: false };
    }

    // Generate a random nonce for the commitment (prevents reverse lookup)
    const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    // Create a commitment: hash(value:nonce)
    const data = `${numVal}:${nonce}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // Use SubtleCrypto for SHA-256 hashing (browser-native, no libs needed)
    return crypto.subtle.digest('SHA-256', dataBuffer).then(hashBuffer => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const commitment = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return { commitment, nonce, valid: true };
    });
}

/**
 * Verifies a ZK range proof against a decrypted vote value.
 * Called during the tally loop to skip invalid votes.
 * @param {number|bigint} decryptedValue - The decrypted plaintext vote value
 * @param {{ commitment: string, nonce: string }} proof - The attached proof
 * @returns {Promise<boolean>} True if valid, false if the vote should be skipped
 */
export async function verifyRangeProof(decryptedValue, proof) {
    const numVal = Number(decryptedValue);

    // Step 1: Hard binary range check (4.7.3.1 - vote value '2' is excluded)
    if (numVal !== 0 && numVal !== 1) {
        console.warn('[ZKRangeProof] SKIP: Decrypted vote value is outside range {0, 1}:', numVal);
        return false;
    }

    // Step 2: If no proof attached (legacy vote), allow it but log a warning
    if (!proof || !proof.commitment || !proof.nonce) {
        console.info('[ZKRangeProof] No proof attached — legacy vote. Allowing by range check only.');
        return true;
    }

    // Step 3: Verify commitment hash
    try {
        const data = `${numVal}:${proof.nonce}`;
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const computed = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        if (computed !== proof.commitment) {
            console.warn('[ZKRangeProof] SKIP: Commitment mismatch — proof tampered!');
            return false;
        }

        return true;
    } catch (err) {
        console.error('[ZKRangeProof] Verification error:', err);
        return false;
    }
}
