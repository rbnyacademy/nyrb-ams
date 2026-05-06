// /api/cmj — VALD_CMJ tab
const { fetchSheet } = require('./_sheet');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const rows = await fetchSheet('VALD_CMJ'); if (req.query.debug) return res.status(200).json(Object.keys(rows[0] || {}));
    const byPlayer = {};

    rows.forEach(row => {
      const player = row['Player'] || row['player'] || row['Name'] || row['name'];
      if (!player) return;
      if (!byPlayer[player]) byPlayer[player] = [];
      byPlayer[player].push({
        date:   row['Date']   || row['date']   || null,
height: toNum(row['Jump Height (In cm)'] || row['Jump Height'] || row['Height'] || row['CMJ Height']),
rsi:    toNum(row['RSI-modified [m/s]'] || row['RSI-modified'] || row['RSI'] || row['RSImod']),
power:  toNum(row['Peak Power / BM [W/kg]'] || row['Peak Power / E'] || row['Peak Power'] || row['Power/BM'] || row['Power']),
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
