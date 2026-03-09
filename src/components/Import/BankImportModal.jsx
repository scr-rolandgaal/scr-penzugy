import { useState, useRef } from 'react';
import { parseOTPFile, parseOTPPaste, importRowToTransaction } from '../../utils/importUtils';
import { formatHUF } from '../../utils/formatters';
import { EXPENSE_CATEGORIES } from '../../data/sampleData';

export default function BankImportModal({
  onClose,
  onImport,
  incomeCategories,
  expenseCategories,
  onAddCategory,
  onAddExpenseCategory,
}) {
  const [tab, setTab] = useState('file');
  const [pasteText, setPasteText] = useState('');
  const [rows, setRows] = useState(null);
  const [categories, setCategories] = useState({});
  const [projectTypes, setProjectTypes] = useState({});
  const [newCatInputs, setNewCatInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const incomeCategs = incomeCategories?.length ? incomeCategories : ['Egyéb bevétel'];
  const expenseCategs = expenseCategories?.length ? expenseCategories : EXPENSE_CATEGORIES;

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseOTPFile(new Uint8Array(buffer));
      setRows(parsed);
    } catch {
      alert('Nem sikerült a fájl feldolgozása. Ellenőrizd, hogy OTP Business XLS/XLSX formátumú-e.');
    }
    setLoading(false);
  }

  function handleParse() {
    if (!pasteText.trim()) return;
    const parsed = parseOTPPaste(pasteText);
    setRows(parsed);
  }

  function reset() {
    setRows(null);
    setCategories({});
    setProjectTypes({});
    setNewCatInputs({});
    setPasteText('');
  }

  async function handleImport() {
    if (!rows?.length) return;
    const txs = rows.map((row, i) =>
      importRowToTransaction(row, {
        category: categories[i] || (row.type === 'bevétel' ? incomeCategs[0] : expenseCategs[0]),
        projectType: projectTypes[i] || null,
      })
    );
    setLoading(true);
    try {
      await onImport(txs);
      onClose();
    } catch (err) {
      setLoading(false);
      alert(`Import sikertelen — az adatbázis hibát jelzett:\n\n${err.message}\n\nEllenőrizd a Supabase kapcsolatot és a táblastruktúrát.`);
    }
  }

  function handleAddNewCat(i, row) {
    const name = newCatInputs[i]?.trim();
    if (!name) return;
    if (row.type === 'bevétel') {
      onAddCategory?.(name);
    } else {
      onAddExpenseCategory?.(name);
    }
    setCategories((p) => ({ ...p, [i]: name }));
    setNewCatInputs((p) => ({ ...p, [i]: '' }));
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 1000, width: '98vw' }}>
        {/* Fejléc */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Bank Import — OTP Business</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold bg-transparent border-none p-0 cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Tab váltó */}
        <div className="flex gap-1 mb-4 border border-gray-200 rounded-lg overflow-hidden">
          {[['file', '📁 Fájl feltöltés'], ['paste', '📋 Beillesztés (Ctrl+V)']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => { setTab(id); reset(); }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tab === id ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Fájl feltöltés */}
        {tab === 'file' && !rows && (
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-purple-400 transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) fileRef.current.files = e.dataTransfer.files;
              handleFile({ target: { files: e.dataTransfer.files } });
            }}
          >
            <p className="text-3xl mb-2">📊</p>
            <p className="text-gray-600 text-sm font-medium mb-1">Húzd ide az OTP XLS/XLSX fájlt</p>
            <p className="text-gray-400 text-xs">vagy kattints a fájl kiválasztásához</p>
            <input
              ref={fileRef}
              type="file"
              accept=".xls,.xlsx"
              className="hidden"
              onChange={handleFile}
            />
            {loading && <p className="text-purple-500 text-sm mt-4">Feldolgozás...</p>}
          </div>
        )}

        {/* Beillesztés */}
        {tab === 'paste' && !rows && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-400">
              Nyisd meg az OTP Business webes felületet, jelöld ki a tranzakciós táblázatot (Ctrl+A), másold (Ctrl+C), majd illeszd be ide.
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Illeszd be ide a táblázatot..."
              className="w-full h-40 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-purple-400 resize-none"
            />
            <button onClick={handleParse} className="btn-primary py-2 text-sm">
              Elemzés
            </button>
          </div>
        )}

        {/* Eredmény táblázat */}
        {rows && (
          <>
            {rows.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-sm">Nem sikerült tranzakciókat azonosítani.</p>
                <p className="text-xs mt-1">Ellenőrizd, hogy OTP Business formátumú fájlt töltöttél-e fel.</p>
                <button onClick={reset} className="mt-4 text-purple-500 text-sm underline">← Vissza</button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-3">
                  <span className="font-semibold text-gray-700">{rows.length}</span> tranzakció azonosítva. Ellenőrizd és állítsd be a kategóriákat:
                </p>
                <div className="overflow-auto max-h-72 border border-gray-100 rounded-lg">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-500 font-semibold w-24">Dátum</th>
                        <th className="px-3 py-2 text-left text-gray-500 font-semibold">Partner</th>
                        <th className="px-3 py-2 text-right text-gray-500 font-semibold w-28">Összeg</th>
                        <th className="px-3 py-2 text-left text-gray-500 font-semibold w-44">Kategória</th>
                        <th className="px-3 py-2 text-left text-gray-500 font-semibold w-28">Proj. típus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i} className="border-t border-gray-50 hover:bg-gray-50">
                          <td className="px-3 py-1.5 text-gray-600">{row.date}</td>
                          <td className="px-3 py-1.5 text-gray-600 max-w-0 w-full">
                            <span className="block truncate">{row.partner || row.description || '—'}</span>
                          </td>
                          <td className={`px-3 py-1.5 font-medium text-right whitespace-nowrap ${
                            row.type === 'bevétel' ? 'text-green-600' : 'text-red-500'
                          }`}>
                            {row.type === 'bevétel' ? '+' : '−'}{formatHUF(row.amount)}
                          </td>
                          <td className="px-3 py-1.5">
                            {categories[i] === '__new__' ? (
                              <div className="flex gap-1">
                                <input
                                  value={newCatInputs[i] || ''}
                                  onChange={(e) => setNewCatInputs((p) => ({ ...p, [i]: e.target.value }))}
                                  onKeyDown={(e) => e.key === 'Enter' && handleAddNewCat(i, row)}
                                  className="flex-1 text-xs border border-purple-300 rounded px-1 py-0.5 focus:outline-none min-w-0"
                                  placeholder="Kategória neve"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleAddNewCat(i, row)}
                                  className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded shrink-0"
                                >
                                  OK
                                </button>
                                <button
                                  onClick={() => setCategories((p) => ({ ...p, [i]: '' }))}
                                  className="text-xs text-gray-400 hover:text-gray-600 px-1"
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <select
                                value={categories[i] || ''}
                                onChange={(e) => setCategories((p) => ({ ...p, [i]: e.target.value }))}
                                className="w-full text-xs border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:border-purple-400"
                              >
                                <option value="">— válassz —</option>
                                {(row.type === 'bevétel' ? incomeCategs : expenseCategs).map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                                <option value="__new__">+ Új kategória...</option>
                              </select>
                            )}
                          </td>
                          <td className="px-3 py-1.5">
                            <select
                              value={projectTypes[i] || ''}
                              onChange={(e) => setProjectTypes((p) => ({ ...p, [i]: e.target.value || null }))}
                              className="w-full text-xs border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:border-purple-400"
                            >
                              <option value="">—</option>
                              <option value="havi">Havi</option>
                              <option value="egyszeri">Egyszeri</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={reset}
                    className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50"
                  >
                    ← Vissza
                  </button>
                  <button onClick={handleImport} className="btn-primary flex-1 py-2 text-sm">
                    {rows.length} tranzakció importálása
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
