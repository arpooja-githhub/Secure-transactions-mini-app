// packages/crypto/src/envelope.ts
import crypto from "crypto";


// Convert hex to Buffer
function hexToBuffer(hex: string) {
  return Buffer.from(hex, "hex");
}

// Generate random 32-byte DEK
function generateDEK() {
  return crypto.randomBytes(32);
}

// This function now only takes masterKey + payload
export function encryptEnvelope(masterKey: Buffer, payload: unknown) {
  const dek = generateDEK();

  const payloadIv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", dek, payloadIv);

  const payloadBuffer = Buffer.from(JSON.stringify(payload), "utf8");
  const payloadCt = Buffer.concat([cipher.update(payloadBuffer), cipher.final()]);
  const payloadTag = cipher.getAuthTag();

  const dekWrapIv = crypto.randomBytes(12);
  const wrapCipher = crypto.createCipheriv("aes-256-gcm", masterKey, dekWrapIv);
  const dekWrapped = Buffer.concat([wrapCipher.update(dek), wrapCipher.final()]);
  const dekWrapTag = wrapCipher.getAuthTag();

  return {
    payload_nonce: payloadIv.toString("hex"),
    payload_ct: payloadCt.toString("hex"),
    payload_tag: payloadTag.toString("hex"),
    dek_wrap_nonce: dekWrapIv.toString("hex"),
    dek_wrapped: dekWrapped.toString("hex"),
    dek_wrap_tag: dekWrapTag.toString("hex"),
    alg: "AES-256-GCM",
    mk_version: 1,
  };
}

// Decrypt payload
export function decryptEnvelope(masterKey: Buffer, record: any) {
  const dekWrapped = hexToBuffer(record.dek_wrapped);
  const dekWrapNonce = hexToBuffer(record.dek_wrap_nonce);
  const dekWrapTag = hexToBuffer(record.dek_wrap_tag);

  const unwrap = crypto.createDecipheriv("aes-256-gcm", masterKey, dekWrapNonce);
  unwrap.setAuthTag(dekWrapTag);
  const dek = Buffer.concat([unwrap.update(dekWrapped), unwrap.final()]);

  const payloadCt = hexToBuffer(record.payload_ct);
  const payloadNonce = hexToBuffer(record.payload_nonce);
  const payloadTag = hexToBuffer(record.payload_tag);

  const decipher = crypto.createDecipheriv("aes-256-gcm", dek, payloadNonce);
  decipher.setAuthTag(payloadTag);

  const decrypted = Buffer.concat([decipher.update(payloadCt), decipher.final()]);
  return JSON.parse(decrypted.toString("utf8"));
}
