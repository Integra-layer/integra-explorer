/**
 * Minimal bech32 decoder for converting Cosmos bech32 addresses to EVM hex.
 * Supports both bech32 (BIP173) used by Cosmos SDK addresses.
 */

const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

function bech32Polymod(values: number[]): number {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const b = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      if ((b >> i) & 1) chk ^= GEN[i];
    }
  }
  return chk;
}

function hrpExpand(hrp: string): number[] {
  const ret: number[] = [];
  for (const c of hrp) ret.push(c.charCodeAt(0) >> 5);
  ret.push(0);
  for (const c of hrp) ret.push(c.charCodeAt(0) & 31);
  return ret;
}

function convertBits(
  data: number[],
  fromBits: number,
  toBits: number,
  pad: boolean,
): number[] | null {
  let acc = 0;
  let bits = 0;
  const ret: number[] = [];
  const maxv = (1 << toBits) - 1;
  for (const value of data) {
    if (value < 0 || value >> fromBits) return null;
    acc = (acc << fromBits) | value;
    bits += fromBits;
    while (bits >= toBits) {
      bits -= toBits;
      ret.push((acc >> bits) & maxv);
    }
  }
  if (pad) {
    if (bits > 0) ret.push((acc << (toBits - bits)) & maxv);
  } else if (bits >= fromBits || (acc << (toBits - bits)) & maxv) {
    return null;
  }
  return ret;
}

function bech32Decode(
  bechString: string,
): { hrp: string; data: number[] } | null {
  const lower = bechString.toLowerCase();
  const pos = lower.lastIndexOf("1");
  if (pos < 1 || pos + 7 > lower.length || lower.length > 90) return null;

  const hrp = lower.slice(0, pos);
  const dataChars = lower.slice(pos + 1);
  const data: number[] = [];

  for (const c of dataChars) {
    const idx = CHARSET.indexOf(c);
    if (idx === -1) return null;
    data.push(idx);
  }

  if (bech32Polymod([...hrpExpand(hrp), ...data]) !== 1) return null;

  return { hrp, data: data.slice(0, data.length - 6) };
}

/**
 * Convert a bech32 Cosmos address (integra... or integravaloper...)
 * to a checksummed-lowercase EVM hex address (0x...).
 */
export function bech32ToEvmAddress(bech32Address: string): string | null {
  const decoded = bech32Decode(bech32Address);
  if (!decoded) return null;

  const bytes = convertBits(decoded.data, 5, 8, false);
  if (!bytes || bytes.length !== 20) return null;

  return (
    "0x" +
    bytes.map((b) => b.toString(16).padStart(2, "0")).join("")
  );
}
