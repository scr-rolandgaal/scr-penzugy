import * as XLSX from 'xlsx';

// Fejléc sor megkeresése (OTP-nél meta-adatok vannak felette)
function detectHeaderRow(rows) {
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const row = rows[i];
    if (!row) continue;
    const joined = row.map((c) => String(c || '')).join(' ').toLowerCase();
    if (
      joined.includes('könyvelés') ||
      joined.includes('összeg') ||
      joined.includes('dátuma') ||
      joined.includes('értéknap') ||
      joined.includes('ellenoldali')
    ) {
      return i;
    }
  }
  return -1;
}

function parseDate(raw) {
  if (!raw) return '';
  if (typeof raw === 'number') {
    // Excel serial dátum
    const d = XLSX.SSF.parse_date_code(raw);
    return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
  }
  // Trailing dot fix: "2026.01.05." → "2026.01.05"
  const s = String(raw).trim().replace(/\.$/, '');
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  // YYYY.MM.DD vagy DD.MM.YYYY stb.
  const parts = s.split(/[.\-\/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return s;
}

function parseAmount(raw) {
  if (raw === undefined || raw === null || raw === '') return null;
  if (typeof raw === 'number') return raw;
  const cleaned = String(raw).replace(/\s/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function buildRows(rows, headerIndex) {
  if (headerIndex < 0 || headerIndex >= rows.length - 1) return [];

  const headers = rows[headerIndex].map((h) => String(h || '').trim().toLowerCase());

  // OTP: "Értéknap", általános: "Könyvelés dátuma", "Dátum"
  const dateIdx = headers.findIndex(
    (h) => h.includes('értéknap') || h.includes('könyvelés') || h.includes('dátum')
  );
  const amountIdx = headers.findIndex(
    (h) => h.includes('összeg') && !h.includes('egyenleg')
  );
  const descIdx = headers.findIndex(
    (h) => h.includes('közlemény') || h.includes('megjegyzés')
  );
  // OTP: "Ellenoldali név" (col 6) vs "Ellenoldali számlaszám" (col 5) — prefer the name column
  const partnerIdx = (() => {
    const idx = headers.findIndex((h) => h.includes('ellenoldali') && h.includes('név'));
    if (idx >= 0) return idx;
    return headers.findIndex((h) => h.includes('partner') || h === 'név');
  })();

  const result = [];
  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => !c && c !== 0)) continue;

    const rawAmount = amountIdx >= 0 ? row[amountIdx] : null;
    const amount = parseAmount(rawAmount);
    if (amount === null) continue;

    result.push({
      date: parseDate(dateIdx >= 0 ? row[dateIdx] : ''),
      amount: Math.abs(Math.round(amount)),
      type: amount >= 0 ? 'bevétel' : 'kiadás',
      partner: String(partnerIdx >= 0 ? (row[partnerIdx] || '') : '').trim(),
      description: String(descIdx >= 0 ? (row[descIdx] || '') : '').trim(),
    });
  }
  return result;
}

export function parseOTPFile(buffer) {
  // Detect if the "XLS" file is actually an HTML file (OTP exports this way)
  const firstBytes = new Uint8Array(buffer.slice ? buffer.slice(0, 10) : buffer.buffer.slice(0, 10));
  const prefix = String.fromCharCode(...firstBytes).toLowerCase().trim();

  let workbook;
  if (prefix.startsWith('<') || prefix.startsWith('<!') || prefix.includes('html')) {
    // HTML file: decode to string and parse
    // OTP HTML has 3 tables → 3 sheets: Sheet1=meta, Sheet2=filter, Sheet3=transactions
    const decoder = new TextDecoder('utf-8');
    const htmlString = decoder.decode(buffer);
    workbook = XLSX.read(htmlString, { type: 'string' });
  } else {
    workbook = XLSX.read(buffer, { type: 'array' });
  }

  // Keresés: melyik sheet tartalmazza a tranzakciós fejlécet ÉS van adat utána?
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });
    const headerIndex = detectHeaderRow(rows);
    // Csak akkor fogadjuk el, ha van legalább 1 sor a fejléc után
    if (headerIndex >= 0 && headerIndex < rows.length - 1) {
      const result = buildRows(rows, headerIndex);
      if (result.length > 0) return result;
    }
  }

  return [];
}

export function parseOTPPaste(text) {
  const lines = text.split('\n').filter((l) => l.trim());
  const rows = lines.map((l) => l.split('\t'));
  const headerIndex = detectHeaderRow(rows);
  return buildRows(rows, headerIndex);
}

export function importRowToTransaction(row, overrides = {}) {
  return {
    date: row.date || new Date().toISOString().slice(0, 10),
    type: row.type,
    category: row.type === 'bevétel' ? 'Egyéb bevétel' : 'Egyéb',
    partner: row.partner || '',
    amount: row.amount,
    vatRate: 27,
    status: 'fizetve',
    notes: row.description || '',
    projectType: null,
    ...overrides,
  };
}
