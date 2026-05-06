// /api/broad — Broad_Jump tab
const { fetchSheet } = require('./_sheet');
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const rows = await fetchSheet('Broad_Jump');
    const byPlayer = {};
    rows.forEach(row => {
      const player = `${row['GivenName'] || ''} ${row['FamilyName'] || ''}`.trim();
      if (!player) return;
      if (!byPlayer[player]) byPlayer[player] = [];
      byPlayer[player].push({
        date:     row['Date'] || null,
        distance: row['Distance (ft\' inches")'] || null,
        age:      row['Age Group'] || null,
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
