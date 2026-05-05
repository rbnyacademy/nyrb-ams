// /api/movement — Movement_Screen tab
const { fetchSheet } = require('./_sheet');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const rows = await fetchSheet('Movement_Screen');
    const sessions = [];

    rows.forEach(row => {
      const player = row['Player'] || row['player'] || row['Name'] || row['name'];
      if (!player) return;
      sessions.push({
        player,
        date:    row['Date']    || row['date']    || null,
        session: row['Session'] || row['session'] || null,
        notes:   row['Notes']  || row['notes']   || '',
        lb: {
          'Squat':       toNum(row['LB Squat']       || row['Squat LB']    || row['Squat']),
          'Hinge (RDL)': toNum(row['LB Hinge']       || row['Hinge LB']    || row['Hinge'] || row['RDL']),
          'Split Squat': toNum(row['LB Split Squat']  || row['Split LB']   || row['Split Squat']),
          'Push-up':     toNum(row['UB Push-up']      || row['Push-up UB'] || row['Push-up'] || row['Push Up']),
        },
        ub: {
          'Squat':       toNum(row['UB Squat']        || row['Squat UB']),
          'Hinge (RDL)': toNum(row['UB Hinge']        || row['Hinge UB']),
          'Split Squat': toNum(row['UB Split Squat']   || row['Split UB']),
          'Push-up':     toNum(row['UB Push-up']       || row['Push-up UB'] || row['Push Up UB']),
        },
      });
    });

    // Sort by date descending (most recent first)
    sessions.sort((a, b) => (b.date||'').localeCompare(a.date||''));

    res.status(200).json(sessions);
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
