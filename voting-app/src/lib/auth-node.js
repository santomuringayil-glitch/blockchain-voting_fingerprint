import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(plainText) {
    return bcrypt.hash(plainText, SALT_ROUNDS);
}

export async function verifyPassword(plainText, hashValue) {
    return bcrypt.compare(plainText, hashValue);
}
