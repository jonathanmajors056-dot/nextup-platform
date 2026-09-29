const encoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer) {
  const binary = Array.from(new Uint8Array(bytes), (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function createAccessToken(secret: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode("measuresure-private-access"));
  return `v1.${toBase64Url(signature)}`;
}

export async function isValidAccessToken(token: string | undefined, secret: string) {
  if (!token || !secret) return false;
  return token === await createAccessToken(secret);
}
