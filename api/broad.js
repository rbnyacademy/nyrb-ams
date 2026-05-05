// /api/broad — Broad_Jump tab
const { fetchSheet } = require('./_sheet');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const rows = await fetchSheet('Broad_Jump');
    const byPlayer = {};

    rows.forEach(row => {
      const player = row['Player'] || row['player'] || row['Name'] || row['name'];
      if (!player) return;
      byPlayer[player] = {
        date: row['Date'] || row['date'] || null,
        dist: row['Distance'] || row['Dist'] || row['dist'] || row['Result'] || null,
        age:  row['Age Group'] || row['Age'] || row['age'] || row['AgeGroup'] || null,
      };
    });

    res.status(200).json(byPlayer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
