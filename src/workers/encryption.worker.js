import * as paillier from 'paillier-bigint';

self.onmessage = async (e) => {
    const { candidateId, publicKeyData } = e.data;

    try {
        console.log("Worker: Starting encryption...");

        // Reconstruct Public Key
        const publicKey = new paillier.PublicKey(
            BigInt(publicKeyData.n),
            BigInt(publicKeyData.g)
        );

        // Encrypt the candidate ID (must be a number or convertible to BigInt)
        // paillier-bigint encrypts BigInts.
        const encrypted = publicKey.encrypt(BigInt(candidateId));

        console.log("Worker: Encryption complete.");

        // Send back the hex string (or decimal string) of the BigInt
        self.postMessage({
            success: true,
            encryptedVote: encrypted.toString()
        });

    } catch (error) {
        console.error("Worker Error:", error);
        self.postMessage({
            success: false,
            error: error.message
        });
    }
};
