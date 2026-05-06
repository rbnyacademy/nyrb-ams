// /api/movement — Movement_Screen tab
const { fetchSheet } = require('./_sheet');
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const rows = await fetchSheet('Movement_Screen');
    const byPlayer = {};
    rows.forEach(row => {
      const player = `${row['GivenName'] || ''} ${row['FamilyName'] || ''}`.trim();
      if (!player) return;
      if (!byPlayer[player]) byPlayer[player] = [];
      byPlayer[player].push({
        date:       row['Date'] || null,
        age:        row['Age Group'] || null,
        squat:      toNum(row['Squat']),
        hinge:      toNum(row['Hinge hands on hips']),
        splitSquat: toNum(row['Split squats']),
        pushups:    toNum(row['Pushups']),
      });
    });
    Object.keys(byPlayer).forEach(p => {
      byPlayer[p].sort((a, b) => (a.date||'').localeCompare(b.date||''));
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
