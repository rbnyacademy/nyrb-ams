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
      if (!byPlayer[player]) byPlayer[player] = [];
      byPlayer[player].push({
        distance: toNum(row['Overall Distance']),
        time:     toNum(row['Time (s)']),
        mas:      toNum(row['M.A.S']),
      });
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
