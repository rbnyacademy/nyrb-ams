// /api/broad — Broad_Jump tab
const { fetchSheet } = require('./_sheet');
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const rows = await fetchSheet('Broad_Jump');
    const byPlayer = {};
    rows.forEach(row => {
      const first = (row['GivenName'] || '').trim();
      const last  = (row['FamilyName'] || '').trim();
      if (!first && !last) return;
      const player = `${first} ${last}`.trim();
      const dist = parseFloat(row['Distance (cm)']);
      if (isNaN(dist)) return;
      if (!byPlayer[player]) byPlayer[player] = [];
      byPlayer[player].push({
        date: row['Date'] || null,
        dist: dist,
        age:  row['Age Group'] || row['Age'] || null,
      });
    });
    // Sort each player's records by date
    Object.keys(byPlayer).forEach(p => {
      byPlayer[p].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    });
    res.status(200).json(byPlayer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
