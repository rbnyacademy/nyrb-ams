// /api/mas — MAS_Testing tab
const { fetchSheet } = require('./_sheet');
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const rows = await fetchSheet('MAS_Testing');
    const byPlayer = {};
    rows.forEach(row => {
      const player = `${row['GivenName'] || ''} ${row['FamilyName'] || ''}`.trim();
      if (!player) return;
      const mas = toNum(row['M.A.S']);
      if (mas === null) return;           // skip rows with no MAS score
      if (!byPlayer[player]) byPlayer[player] = [];
      byPlayer[player].push({
        age:      row['Age Group'] || row['Age'] || null,
        distance: toNum(row['Overall Distance']),
        time:     toNum(row['Time (s)']),
        mas,
      });
    });
    // Sort each player's records best first
    Object.keys(byPlayer).forEach(p => {
      byPlayer[p].sort((a, b) => b.mas - a.mas);
    });
    res.status(200).json(byPlayer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
function toNum(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}
