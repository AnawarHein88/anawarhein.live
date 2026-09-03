/* Change these before publishing. Client-side protection is not fully secure. */
window.ANAWARHEIN_ACCESS = {
  secret: 'CHANGE-THIS-AR-YONE-SECRET-2026',
  adminPin: '123456',
  sessionKey: 'anawarheinAccessSession'
};

window.AccessCore = (() => {
  const config = window.ANAWARHEIN_ACCESS;
  const EPOCH = Date.UTC(2026, 0, 1);
  const SLOT_MS = 5 * 60 * 1000;
  const MAX_SLOT = (1 << 18) - 1;
  const CODE_SPACE = 1 << 26;

  async function digest(value) {
    return new Uint8Array(await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(`${value}.${config.secret}`)
    ));
  }

  async function secretOffset() {
    const bytes = await digest('ANAWAR-HEIN-8-DIGIT-CODE');
    const value = (
      ((bytes[0] << 24) >>> 0) |
      (bytes[1] << 16) |
      (bytes[2] << 8) |
      bytes[3]
    ) >>> 0;
    return value % CODE_SPACE;
  }

  async function checksum(slot, memberBits) {
    const bytes = await digest(`${slot}.${memberBits}.access`);
    return bytes[0] & 15;
  }

  async function createCode(label, expiration) {
    const exp = Number(expiration);
    const slot = Math.ceil((exp - EPOCH) / SLOT_MS);

    if (!Number.isFinite(exp) || slot < 0 || slot > MAX_SLOT) {
      throw new Error('Code expiration date is outside the supported range.');
    }

    const memberHash = await digest(String(label).trim() || 'Member');
    const memberBits = memberHash[0] & 15;
    const check = await checksum(slot, memberBits);
    const payload = slot * 256 + memberBits * 16 + check;
    const encoded = (payload + await secretOffset()) % CODE_SPACE;

    return String(encoded).padStart(8, '0');
  }

  async function verifyCode(raw) {
    try {
      const code = String(raw).replace(/\D/g, '');

      if (!/^\d{8}$/.test(code)) {
        return { ok: false, error: 'ဂဏန်း 8 လုံး Code ထည့်ပါ' };
      }

      const encoded = Number(code);
      if (encoded >= CODE_SPACE) {
        return { ok: false, error: 'Code မမှန်ပါ' };
      }

      const payload = (encoded - await secretOffset() + CODE_SPACE) % CODE_SPACE;
      const slot = Math.floor(payload / 256);
      const memberBits = Math.floor(payload / 16) & 15;
      const suppliedCheck = payload & 15;

      if (await checksum(slot, memberBits) !== suppliedCheck) {
        return { ok: false, error: 'Code မမှန်ပါ' };
      }

      const exp = EPOCH + slot * SLOT_MS;
      if (Date.now() >= exp) {
        return { ok: false, error: 'Code သက်တမ်းကုန်သွားပါပြီ' };
      }

      return { ok: true, data: { v: 2, label: 'Member', exp, id: code } };
    } catch {
      return { ok: false, error: 'Code မမှန်ပါ' };
    }
  }

  function session() {
    try {
      return JSON.parse(localStorage.getItem(config.sessionKey) || 'null');
    } catch {
      return null;
    }
  }

  function saveSession(data) {
    localStorage.setItem(config.sessionKey, JSON.stringify(data));
  }

  return { createCode, verifyCode, session, saveSession };
})();
