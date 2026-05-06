const { fetchSheet } = require('./_sheet');
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const rows = await fetchSheet('CMJ_VALD');
    return res.status(200).json(Object.keys(rows[0] || {}));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
