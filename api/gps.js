// /api/gps — GPS_Daily tab
const { fetchSheet } = require('./_sheet');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const rows = await fetchSheet('GPS_Daily');
    const byPlayer = {};
    const posMap = {};

    rows.forEach(row => {
      const player = row['Name'];
      if (!player) return;

      const pos = row['Position'] || '';
      if (pos) posMap[player] = normalizePos(pos);

      if (!byPlayer[player]) byPlayer[player] = [];

      byPlayer[player].push({
        date:    row['Date']                              || null,
        session: row['Session Type']                      || null,
        md:      row['MD (-)']                            || null,
        pos:     row['Position']                          || null,
        dist:    toNum(row['Distance (m)']),
        hsr:     toNum(row['Distance (HSR) (m)']),
        vhsr:    toNum(row['Distance (VHSR) (m)']),
        sprint:  toNum(row['Distance(speed |Sprinting) (m)']),
        dpm:     toNum(row['Distance / min (m)']),
        maxspd:  toNum(row['Speed (max.) (m/s)']),
        expl:    toNum(row['Explosive Distance (m)']),
        acc:     toNum(row['Accelerations (high)']),
        dec:     toNum(row['Decelerations (high)']),
        hml:     toNum(row['HMLD (m)']),
        mins:    toNum(row['Game Minutes']),
      });
