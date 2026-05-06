// /api/gps — GPS_Daily tab
// Returns player GPS data grouped by player name
const { fetchSheet } = require('./_sheet');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const rows = await fetchSheet('GPS_Daily');

    // Group sessions by player
    const byPlayer = {};
    const posMap = {};

    rows.forEach(row => {
      const player = row['Player'] || row['player'] || row['Name'] || row['name'];
      if (!player) return;

      const pos = row['Position'] || row['Pos'] || row['position'] || row['pos'] || '';
      if (pos) posMap[player] = normalizePos(pos);

      if (!byPlayer[player]) byPlayer[player] = [];

      byPlayer[player].push({
        date:    row['Date']        || row['date']        || null,
        session: row['Session']     || row['session']     || null,
        md:      row['MD']          || row['md']          || null,
        pos:     row['Position']    || row['Pos']         || row['position'] || null,
        dist:    toNum(row['Total Distance'] || row['dist'] || row['Distance']),
        hsr:     toNum(row['HSR']   || row['hsr']         || row['High Speed Running']),
        sprint:  toNum(row['Sprint']|| row['sprint']      || row['Sprint Distance']),
        expl:    toNum(row['Explosive'] || row['expl']    || row['Explosive Distance']),
        dpm:     toNum(row['Dist/Min'] || row['dpm']      || row['Distance per Minute']),
        maxspd:  toNum(row['Max Speed'] || row['maxspd']  || row['Top Speed']),
        acc:     toNum(row['Acc']   || row['acc']         || row['Accelerations']),
        dec:     toNum(row['Dec']   || row['dec']         || row['Decelerations']),
        hml:     toNum(row['HML']   || row['hml']         || row['High Metabolic Load']),
        mins:    toNum(row['Minutes'] || row['mins']      || row['Min']),
      });
    });

    // Sort each player's sessions by date
    Object.keys(byPlayer).forEach(p => {
      byPlayer[p].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    });

    // Build latest session per player
    const latest = {};
    Object.keys(byPlayer).forEach(p => {
      const sessions = byPlayer[p].filter(s => s.dist);
      if (sessions.length) latest[p] = { ...sessions[sessions.length - 1], player: p, pos: posMap[p] || 'MF' };
    });

    // All unique dates
    const allDates = [...new Set(rows.map(r => r['Date'] || r['date']).filter(Boolean))].sort();

    // Match days (sessions where MD = 'MD')
    const matchSessions = rows.filter(r => (r['MD'] || r['md']) === 'MD' && (r['Total Distance'] || r['dist']));
    const matchByDate = {};
    matchSessions.forEach(r => {
      const d = r['Date'] || r['date'];
      const player = r['Player'] || r['player'] || r['Name'] || r['name'];
      const sess = r['Session'] || r['session'] || 'Match';
      if (!d || !player) return;
      if (!matchByDate[d]) matchByDate[d] = { label: sess, data: [] };
      matchByDate[d].data.push({
        name:   player,
        pos:    r['Position'] || r['Pos'] || null,
        date:   d,
        session: sess,
        md:     'MD',
        dist:   toNum(r['Total Distance'] || r['dist']),
        hsr:    toNum(r['HSR'] || r['hsr']),
        sprint: toNum(r['Sprint'] || r['sprint']),
        expl:   toNum(r['Explosive'] || r['expl']),
        dpm:    toNum(r['Dist/Min'] || r['dpm']),
        maxspd: toNum(r['Max Speed'] || r['maxspd']),
        acc:    toNum(r['Acc'] || r['acc']),
        dec:    toNum(r['Dec'] || r['dec']),
        hml:    toNum(r['HML'] || r['hml']),
        mins:   toNum(r['Minutes'] || r['mins']),
      });
    });
    const matchList = Object.entries(matchByDate).sort(([a], [b]) => a.localeCompare(b));

    // Team weekly averages
    const weeklyMap = {};
    rows.forEach(r => {
      const d = r['Date'] || r['date'];
      if (!d) return;
      const date = new Date(d);
      if (isNaN(date)) return;
      const wk = `${date.getFullYear()}-W${String(getWeekNumber(date)).padStart(2,'0')}`;
      if (!weeklyMap[wk]) weeklyMap[wk] = { dist:[], dpm:[], hsr:[], sprint:[], expl:[], maxspd:[], acc:[], dec:[] };
      ['dist','dpm','hsr','sprint','expl','maxspd','acc','dec'].forEach(k => {
        const v = toNum(r['Total Distance'] || r['dist'] || r['Distance']);
        const mapped = {
          dist:   toNum(r['Total Distance'] || r['dist']),
          dpm:    toNum(r['Dist/Min'] || r['dpm']),
          hsr:    toNum(r['HSR'] || r['hsr']),
          sprint: toNum(r['Sprint'] || r['sprint']),
          expl:   toNum(r['Explosive'] || r['expl']),
          maxspd: toNum(r['Max Speed'] || r['maxspd']),
          acc:    toNum(r['Acc'] || r['acc']),
          dec:    toNum(r['Dec'] || r['dec']),
        };
        if (mapped[k] != null) weeklyMap[wk][k].push(mapped[k]);
      });
    });
    const teamWeekly = {};
    Object.keys(weeklyMap).sort().forEach(wk => {
      teamWeekly[wk] = {};
      Object.keys(weeklyMap[wk]).forEach(k => {
        const vals = weeklyMap[wk][k];
        teamWeekly[wk][k] = vals.length ? +(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : null;
      });
    });

    res.status(200).json({
      players: Object.keys(byPlayer).sort(),
      pos_map: posMap,
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
  return pos.trim();
}

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}
