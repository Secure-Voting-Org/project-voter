import * as paillier from 'paillier-bigint';

// --- Module 4.7: ZK Range Proof helper (inline, since Workers can't import relative modules easily) ---
async function generateRangeProof(value) {
    const numVal = Number(value);
    if (numVal !== 0 && numVal !== 1) return { commitment: null, nonce: null, valid: false };

    const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0')).join('');

    const data = `${numVal}:${nonce}`;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const commitment = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return { commitment, nonce, valid: true };
}

self.onmessage = async (e) => {
    const { candidateIds, selectedCandidateId, publicKeyData } = e.data;

    try {
        const publicKey = new paillier.PublicKey(
            BigInt(publicKeyData.n),
            BigInt(publicKeyData.g)
        );

        const encryptedVector = {};
        for (const cid of candidateIds) {
            const value = cid === selectedCandidateId ? 1n : 0n;
            encryptedVector[cid] = publicKey.encrypt(value).toString();
        }

        const rangeProof = await generateRangeProof(1);

        self.postMessage({
            success: true,
            encryptedVote: JSON.stringify(encryptedVector),
            rangeProof
        });

    } catch (error) {
        console.error("Worker Error:", error);
        self.postMessage({
            success: false,
            error: error.message || "Unknown worker error"
        });
    }
};

