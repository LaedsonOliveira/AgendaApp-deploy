import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keyLength: number
) => Promise<Buffer>;

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [saltHex, keyHex] = passwordHash.split(":");
  if (!saltHex || !keyHex || !/^[a-f0-9]+$/i.test(saltHex + keyHex)) return false;

  const expectedKey = Buffer.from(keyHex, "hex");
  const derivedKey = await scrypt(password, Buffer.from(saltHex, "hex"), expectedKey.length);
  return expectedKey.length === derivedKey.length && timingSafeEqual(expectedKey, derivedKey);
}