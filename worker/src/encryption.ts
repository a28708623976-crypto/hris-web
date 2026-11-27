const encoder = new TextEncoder();
function base64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}
function bytes(text: string) {
  return Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
}
async function key(secret: string) {
  const value = bytes(secret);
  if (value.byteLength !== 32)
    throw new Error("ENCRYPTION_KEY must be base64 encoded 32 bytes");
  return crypto.subtle.importKey("raw", value, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}
export async function encrypt(value: unknown, secret: string, context: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: encoder.encode(context) },
    await key(secret),
    encoder.encode(JSON.stringify(value)),
  );
  return JSON.stringify({
    v: 1,
    iv: base64(iv),
    data: base64(new Uint8Array(encrypted)),
  });
}
export async function decrypt<T>(
  value: string,
  secret: string,
  context: string,
): Promise<T> {
  const data = JSON.parse(value);
  if (data.v !== 1) throw new Error("Unknown ciphertext version");
  const plain = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: bytes(data.iv),
      additionalData: encoder.encode(context),
    },
    await key(secret),
    bytes(data.data),
  );
  return JSON.parse(new TextDecoder().decode(plain));
}
