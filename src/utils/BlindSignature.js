// Basic RSA Blind Signature Client Utils
/* global BigInt */

// Helper: Modular Exponentiation (base^exp % mod)
const modPow = (base, exp, mod) => {
    let result = BigInt(1);
    base = base % mod;
    while (exp > 0) {
        if (exp % BigInt(2) === BigInt(1)) result = (result * base) % mod;
        base = (base * base) % mod;
        exp /= BigInt(2);
    }
    return result;
};

// Helper: Generate Random BigInt in range [min, max)
const randomBigInt = (min, max) => {
    const range = max - min;
    const bits = range.toString(2).length;
    let num;
    do {
        // Simple random generation (not cryptographically secure for prod, but using Math.random for demo)
        // For prod, use window.crypto.getRandomValues
        let hex = "";
        for (let i = 0; i < Math.ceil(bits / 4); i++) {
            hex += Math.floor(Math.random() * 16).toString(16);
        }
        num = BigInt("0x" + hex);
    } while (num >= range);
    return min + num;
};

// Helper: GCD
const gcd = (a, b) => {
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
};

// Helper: Modular Inverse
// Helper: Modular Inverse
const modInverse = (a, m) => {
    let [m0, y, x] = [m, BigInt(0), BigInt(1)];
    if (m === BigInt(1)) return BigInt(0);
    while (a > BigInt(1)) {
        if (m === BigInt(0)) return BigInt(0);
        let q = a / m;
        [m, a] = [a % m, m];
        [y, x] = [x - q * y, y];
    }
    if (x < BigInt(0)) x += m0;
    return x;
};

const BlindSignature = {
    // Generate a random token (message) to be signed
    generateToken: () => {
        // Generate a large random number as the token
        // In practice, this should be smaller than n
        return randomBigInt(BigInt(1000000000), BigInt(9999999999)).toString();
    },

    // Blind the message: m' = (m * r^e) % n
    blind: (messageStr, eStr, nStr) => {
        const m = BigInt(messageStr);
        const e = BigInt(eStr);
        const n = BigInt(nStr);

        // Generate blinding factor r (random, coprime to n)
        let r;
        do {
            r = randomBigInt(BigInt(2), n - BigInt(1));
        } while (gcd(r, n) !== BigInt(1));

        // Calculate blinded message
        const r_e = modPow(r, e, n);
        const blinded = (m * r_e) % n;

        return {
            blinded: blinded.toString(),
            r: r.toString()
        };
    },

    // Unblind the signature: s = s' * r^-1 % n
    unblind: (blindedSignatureStr, rStr, nStr) => {
        const s_prime = BigInt(blindedSignatureStr);
        const r = BigInt(rStr);
        const n = BigInt(nStr);

        console.log("--- Unblinding ---");
        console.log("s' (Blinded Sig):", s_prime.toString());
        console.log("r (Factor):", r.toString());
        console.log("n:", n.toString());

        const r_inv = modInverse(r, n);
        console.log("r_inv:", r_inv.toString());

        const s = (s_prime * r_inv) % n;
        console.log("s (Unblinded):", s.toString());

        return s.toString();
    }
};

export default BlindSignature;
