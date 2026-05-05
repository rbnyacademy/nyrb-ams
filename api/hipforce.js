// /api/hipforce — VALD_HipForce tab
const { fetchSheet } = require('./_sheet');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const rows = await fetchSheet('VALD_HipForce');
    const byPlayer = {};

    rows.forEach(row => {
      const player = row['Player'] || row['player'] || row['Name'] || row['name'];
      if (!player) return;
      if (!byPlayer[player]) byPlayer[player] = [];
      byPlayer[player].push({
        date:  row['Date']  || row['date']  || null,
        hab_l: toNum(row['HAb Left']  || row['Abduction Left']  || row['hab_l'] || row['HAB L']),
        hab_r: toNum(row['HAb Right'] || row['Abduction Right'] || row['hab_r'] || row['HAB R']),
        had_l: toNum(row['HAd Left']  || row['Adduction Left']  || row['had_l'] || row['HAD L']),
        had_r: toNum(row['HAd Right'] || row['Adduction Right'] || row['had_r'] || row['HAD R']),
        age:   row['Age Group'] || row['Age'] || row['age'] || row['AgeGroup'] || null,
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
