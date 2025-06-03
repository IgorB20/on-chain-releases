import { createDecipheriv } from "crypto";
import fs from "fs";
import path from "path";

/**
 
Decrypts an AES-256-CBC encrypted file that includes the IV in the first 16 bytes.*,
@param encryptedFilePath Path to the encrypted binary file,
@param base64Key Base64-encoded 32-byte AES key,
@returns Buffer of the decrypted data*/
export const decryptAes256Cbc = (
  encryptedFilePath: string,
  base64Key: string
): Buffer => {
  const encryptedBuffer = fs.readFileSync(encryptedFilePath);
  const key = Buffer.from(base64Key, "base64");
  const iv = encryptedBuffer.slice(0, 16);
  const ciphertext = encryptedBuffer.slice(16);

  const decipher = createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted;
};

const decryptedData = decryptAes256Cbc(
  path.resolve("./QmcvBx3pgCXia9bMTRaYvsqA6SN4tUxBTJDZxcDqMrohQM"),
  "XYeDzclgPQ2hmQRvLy6Qy/7domIfL9qv2y0kX6ZVLOg="
);

// decode as text
console.log(decryptedData.toString("utf-8"));
