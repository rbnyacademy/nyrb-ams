const { fetchSheet } = require('./_sheet');
module.exports = async (req, res) => {
  try {
    const rows = await fetchSheet('CMJ_VALD');
    return res.status(200).json({ count: rows.length, sample: rows[0] });
  } catch (err) {
    return res.status(200).json({ error: err.message, stack: err.stack });
  }
};
