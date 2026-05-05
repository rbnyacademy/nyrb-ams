// /api/mas — MAS_Testing tab
const { fetchSheet } = require('./_sheet');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const rows = await fetchSheet('MAS_Testing');
    const byPlayer = {};

    rows.forEach(row => {
      const player = row['Player'] || row['player'] || row['Name'] || row['name'];
      if (!player) return;
      if (!byPlayer[player]) byPlayer[player] = [];
      byPlayer[player].push({
        date: row['Date']     || row['date']     || null,
        age:  row['Age Group']|| row['Age']      || row['age'] || row['AgeGroup'] || null,
        dist: toNum(row['Distance'] || row['dist']|| row['Total Distance'] || row['Dist (m)']),
        time: toNum(row['Time']     || row['time']|| row['Duration'] || row['Time (s)']),
        mas:  toNum(row['MAS']      || row['mas'] || row['MAS Score'] || row['Speed (m/s)']),
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
