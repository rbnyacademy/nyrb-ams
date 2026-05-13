// /api/mas — MAS_Testing tab
const { fetchSheet } = require('./_sheet');

function toNum(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? null : n;
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const rows = await fetchSheet('MAS_Testing');

    if (!rows || rows.length === 0) {
      return res.status(200).json({});
    }

    // Log exact keys from the sheet so we can confirm column names
    const keys = Object.keys(rows[0]);
    console.log('[MAS] row count:', rows.length);
    console.log('[MAS] columns:', JSON.stringify(keys));

    const byPlayer = {};
    rows.forEach(row => {
      const first = (row['GivenName'] || '').trim();
      const last  = (row['FamilyName'] || '').trim();
      if (!first && !last) return;
      const player = `${first} ${last}`.trim();

      // Find the MAS score key dynamically — handles M.A.S, MAS, etc.
      const masKey = keys.find(k => k.replace(/[\.\s]/g,'').toUpperCase() === 'MAS');
      const masRaw = masKey ? row[masKey] : null;
      const mas = toNum(masRaw);
      if (mas === null) return;

      if (!byPlayer[player]) byPlayer[player] = [];
      byPlayer[player].push({
        age:      row['Age Group'] || row['Age'] || null,
        distance: toNum(row['Overall Distance']),
        time:     toNum(row['Time (s)']),
        mas,
      });
    });

    Object.keys(byPlayer).forEach(p => {
      byPlayer[p].sort((a, b) => b.mas - a.mas);
    });

    res.status(200).json(byPlayer);
  } catch (err) {
    console.error('[MAS] error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
