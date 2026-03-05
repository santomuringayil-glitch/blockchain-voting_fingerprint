import crypto from "crypto";

export function hashFingerprint(passphrase) {
    return crypto.createHash("sha256").update(passphrase).digest("hex");
}
