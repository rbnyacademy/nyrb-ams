// /api/505 — 505_Testing tab
const { fetchSheet } = require('./_sheet');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const rows = await fetchSheet('505_Testing');
    const byPlayer = {};

    rows.forEach(row => {
      const player = row['Player'] || row['player'] || row['Name'] || row['name'];
      if (!player) return;
      if (!byPlayer[player]) byPlayer[player] = [];
      byPlayer[player].push({
        date: row['Date'] || row['date'] || null,
        time: toNum(row['Time'] || row['Result'] || row['505 Time'] || row['time'] || row['Total Time']),
        age:  row['Age Group'] || row['Age'] || row['age'] || row['AgeGroup'] || null,
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
