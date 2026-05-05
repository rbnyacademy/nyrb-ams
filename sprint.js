// /api/sprint — Sprint_Testing tab
const { fetchSheet } = require('./_sheet');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const rows = await fetchSheet('Sprint_Testing');
    const byPlayer = {};

    rows.forEach(row => {
      const player = row['Player'] || row['player'] || row['Name'] || row['name'];
      if (!player) return;
      if (!byPlayer[player]) byPlayer[player] = [];
      byPlayer[player].push({
        date:   row['Date']    || row['date']    || null,
        s0_10:  toNum(row['0-10m'] || row['Split 0-10'] || row['0_10'] || row['s0_10']),
        s10_20: toNum(row['10-20m']|| row['Split 10-20']|| row['10_20']|| row['s10_20']),
        s20_30: toNum(row['20-30m']|| row['Split 20-30']|| row['20_30']|| row['s20_30']),
        total:  toNum(row['Total'] || row['30m Total']   || row['total']|| row['Time']),
        age:    row['Age Group'] || row['Age'] || row['age'] || row['AgeGroup'] || null,
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
