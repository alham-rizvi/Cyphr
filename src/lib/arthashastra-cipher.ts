export type TraceStep = {
  index: number;
  input: number;
  keyByte: number;
  output: number;
};

export type CipherResult = {
  text: string;
  bytes: number[];
  trace: TraceStep[];
};

function hashSeed(key: string, seed: number) {
  let hash = (2166136261 ^ seed) >>> 0;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash || 0x9e3779b9;
}

function createKeyStream(key: string, seed: number, length: number) {
  let state = hashSeed(key, seed);
  return Array.from({ length }, () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state & 0xff;
  });
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const clean = value.replace(/\s/g, "");
  const binary = atob(clean);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export function encrypt(plainText: string, key: string, seed: number): CipherResult {
  if (!key) throw new Error("A key is required.");
  const input = new TextEncoder().encode(plainText);
  const stream = createKeyStream(key, seed, input.length);
  const output = input.map((byte, index) => byte ^ (stream[index] ?? 0));
  return {
    text: bytesToBase64(output),
    bytes: Array.from(output),
    trace: Array.from(input.slice(0, 16), (byte, index) => ({
      index,
      input: byte,
      keyByte: stream[index] ?? 0,
      output: output[index] ?? 0,
    })),
  };
}

export function decrypt(cipherText: string, key: string, seed: number): CipherResult {
  if (!key) throw new Error("A key is required.");
  const input = base64ToBytes(cipherText);
  const stream = createKeyStream(key, seed, input.length);
  const output = input.map((byte, index) => byte ^ (stream[index] ?? 0));
  return {
    text: new TextDecoder("utf-8", { fatal: true }).decode(output),
    bytes: Array.from(output),
    trace: Array.from(input.slice(0, 16), (byte, index) => ({
      index,
      input: byte,
      keyByte: stream[index] ?? 0,
      output: output[index] ?? 0,
    })),
  };
}

export function keyScore(key: string) {
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((rule) => rule.test(key)).length;
  return Math.min(100, key.length * 5 + variety * 10);
}

export const testVectors = [
  { name: "Empty message", text: "", key: "rajya", seed: 1 },
  { name: "Single byte", text: "A", key: "kautilya", seed: 7 },
  { name: "ASCII phrase", text: "Protect the treasury", key: "artha", seed: 322 },
  { name: "Numerals", text: "Revenue: 64000", key: "kosha-2026", seed: 64 },
  { name: "Punctuation", text: "Move @ dawn; quietly!", key: "duta", seed: 19 },
  { name: "Unicode Devanagari", text: "अर्थशास्त्र", key: "नीति", seed: 108 },
  { name: "Emoji", text: "Treaty sealed 🤝", key: "mandala", seed: 12 },
  { name: "Multiline", text: "north\nsouth\neast\nwest", key: "chakra", seed: 4 },
  { name: "Repeated symbols", text: "AAAAAAAAAAAAAAAA", key: "nonrepeating", seed: 99 },
  { name: "Long dispatch", text: "A confidential dispatch must remain legible after a complete round trip. ".repeat(8), key: "strategic-council", seed: 2048 },
];

export function runCipherTests() {
  return testVectors.map((test) => {
    try {
      const cipher = encrypt(test.text, test.key, test.seed).text;
      const restored = decrypt(cipher, test.key, test.seed).text;
      return { ...test, pass: restored === test.text, cipher: cipher.slice(0, 24) };
    } catch {
      return { ...test, pass: false, cipher: "error" };
    }
  });
}
