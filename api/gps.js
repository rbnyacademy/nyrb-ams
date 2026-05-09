// /api/gps — GPS_Daily tab
const { fetchSheet } = require('./_sheet');
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const rows = await fetchSheet('GPS_Daily');
    const byPlayer = {};
    const posMap = {};
    const ageMap = {};
    rows.forEach(row => {
      const player = row['Name'];
      if (!player) return;
      const pos = row['Position'] || '';
      const age = row['Age Group'] || '';
      if (pos) posMap[player] = normalizePos(pos);
      if (age) ageMap[player] = age.trim();
      if (!byPlayer[player]) byPlayer[player] = [];
      byPlayer[player].push({
        date:    row['Date']                              || null,
        session: row['Session Type']                      || null,
        md:      row['MD (-)']                            || null,
        pos:     row['Position']                          || null,
        age:     row['Age Group']                         || null,
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
        mins:    toNum(row['Session Length (Mins)']),
      });
    });
    Object.keys(byPlayer).forEach(p => {
      byPlayer[p].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    });
    const latest = {};
    Object.keys(byPlayer).forEach(p => {
      const sessions = byPlayer[p].filter(s => s.dist);
      if (sessions.length) latest[p] = { ...sessions[sessions.length - 1], player: p, pos: posMap[p] || 'MF' };
    });
    const allDates = [...new Set(rows.map(r => r['Date']).filter(Boolean))].sort();
    const matchSessions = rows.filter(r => r['MD (-)'] === 'MD' && r['Distance (m)']);
    const matchByDate = {};
    matchSessions.forEach(r => {
      const d = r['Date'];
      const player = r['Name'];
      if (!d || !player) return;
      if (!matchByDate[d]) matchByDate[d] = { label: r['Session Type'], data: [] };
      matchByDate[d].data.push({
        name:    player,
        pos:     r['Position']                          || null,
        age:     r['Age Group']                         || null,
        date:    d,
        session: r['Session Type'],
        md:      'MD',
        dist:    toNum(r['Distance (m)']),
        hsr:     toNum(r['Distance (HSR) (m)']),
        sprint:  toNum(r['Distance(speed |Sprinting) (m)']),
        expl:    toNum(r['Explosive Distance (m)']),
        dpm:     toNum(r['Distance / min (m)']),
        maxspd:  toNum(r['Speed (max.) (m/s)']),
        acc:     toNum(r['Accelerations (high)']),
        dec:     toNum(r['Decelerations (high)']),
        hml:     toNum(r['HMLD (m)']),
        mins:    toNum(r['Game Minutes']),
      });
    });
    const matchList = Object.entries(matchByDate).sort(([a], [b]) => a.localeCompare(b));
    const weeklyMap = {};
    rows.forEach(r => {
      const d = r['Date'];
      if (!d) return;
      const date = new Date(d);
      if (isNaN(date)) return;
      const wk = `${date.getFullYear()}-W${String(getWeekNumber(date)).padStart(2, '0')}`;
      if (!weeklyMap[wk]) weeklyMap[wk] = { dist: [], dpm: [], hsr: [], sprint: [], expl: [], maxspd: [], acc: [], dec: [] };
      const mapped = {
        dist:   toNum(r['Distance (m)']),
        dpm:    toNum(r['Distance / min (m)']),
        hsr:    toNum(r['Distance (HSR) (m)']),
        sprint: toNum(r['Distance(speed |Sprinting) (m)']),
        expl:   toNum(r['Explosive Distance (m)']),
        maxspd: toNum(r['Speed (max.) (m/s)']),
        acc:    toNum(r['Accelerations (high)']),
        dec:    toNum(r['Decelerations (high)']),
      };
      Object.keys(mapped).forEach(k => {
        if (mapped[k] != null) weeklyMap[wk][k].push(mapped[k]);
      });
    });
    const teamWeekly = {};
    Object.keys(weeklyMap).sort().forEach(wk => {
      teamWeekly[wk] = {};
      Object.keys(weeklyMap[wk]).forEach(k => {
        const vals = weeklyMap[wk][k];
        teamWeekly[wk][k] = vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
      });
    });
    res.status(200).json({
      players: Object.keys(byPlayer).sort(),
      pos_map: posMap,
      age_map: ageMap,
      gps: byPlayer,
      latest,
      all_dates: allDates,
      match_list: matchList,
      team_weekly: teamWeekly,
      week_keys: Object.keys(teamWeekly).sort(),
    });
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
function normalizePos(pos) {
  const p = String(pos).trim().toUpperCase();
  if (p.includes('GK') || p.includes('GOAL')) return 'GK';
  if (p.includes('CB') || p.includes('CENTER BACK') || p.includes('CENTRE BACK')) return 'CB';
  if (p.includes('FB') || p.includes('FULL') || p.includes('BACK')) return 'FB';
  if (p.includes('MF') || p.includes('MID')) return 'MF';
  if (p.includes('FW') || p.includes('FOR') || p.includes('ATT')) return 'FW';
  return String(pos).trim();
}
function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}
