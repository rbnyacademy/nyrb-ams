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
    const byPlayer = {};
    rows.forEach(row => {
      const player = `${row['GivenName'] || ''} ${row['FamilyName'] || ''}`.trim();
      if (!player) return;
      const mas = toNum(row['M.A.S']);
      if (mas === null) return;
      if (!byPlayer[player]) byPlayer[player] = [];
      byPlayer[player].push({
        age:      row['Age Group'] || null,
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
