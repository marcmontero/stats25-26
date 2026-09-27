import React, { useState } from "react";
import "./PlayerList.css";

// Convertir minutos decimales a MM:SS
const formatMinutesSeconds = (decimalMinutes) => {
  const totalSeconds = Math.round(decimalMinutes * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

// Formatear intervalos de tiempo absoluto
const formatIntervals = (inOutsList = []) => {
  if (!inOutsList || inOutsList.length === 0) return [];

  const events = [...inOutsList].sort(
    (a, b) => (a.minuteAbsolut ?? 0) - (b.minuteAbsolut ?? 0)
  );

  const intervals = [];
  let openIn = null;

  for (const ev of events) {
    const minute = ev.minuteAbsolut ?? 0;
    if (ev.type === "IN_TYPE") {
      if (openIn !== null) {
        intervals.push([openIn, minute]);
      }
      openIn = minute;
    } else if (ev.type === "OUT_TYPE") {
      if (openIn !== null) {
        intervals.push([openIn, minute]);
        openIn = null;
      }
    }
  }

  return intervals;
};

const PLAYERS_PAGE_SIZE = 8;

const teamTotals = (players = []) =>
  players.reduce(
    (acc, p) => {
      acc.min += p.timePlayed || 0;
      acc.pts += p.data?.score || 0;
      acc.t2m += p.data?.shotsOfTwoSuccessful || 0;
      acc.t2a += p.data?.shotsOfTwoAttempted || 0;
      acc.t3m += p.data?.shotsOfThreeSuccessful || 0;
      acc.t3a += p.data?.shotsOfThreeAttempted || 0;
      acc.tlm += p.data?.shotsOfOneSuccessful || 0;
      acc.tla += p.data?.shotsOfOneAttempted || 0;
      acc.fc += p.data?.personalFouls || 0;
      return acc;
    },
    { min: 0, pts: 0, t2m: 0, t2a: 0, t3m: 0, t3a: 0, tlm: 0, tla: 0, fc: 0 }
  );

const sortByDorsal = (players = []) =>
  [...players].sort((a, b) => (parseInt(a.dorsal) || 999) - (parseInt(b.dorsal) || 999));

// ========== PESTANYA: ESTADÍSTIQUES ==========
const StatsTab = ({ teamA, teamB, selectedKey, onSelectTeam }) => {
  const [showAll, setShowAll] = useState(false);
  const team = selectedKey === "A" ? teamA : teamB;
  const sortedPlayers = sortByDorsal(team?.players);
  const visiblePlayers = showAll ? sortedPlayers : sortedPlayers.slice(0, PLAYERS_PAGE_SIZE);

  return (
    <div className="stats-card">
      <div className="stats-card-header">
        <div>
          <h3>Estadístiques dels jugadors</h3>
          <span className="legend">
            <span className="legend-dot" /> Cinc inicial
          </span>
        </div>
        <select
          className="team-select"
          value={selectedKey}
          onChange={(e) => {
            onSelectTeam(e.target.value);
            setShowAll(false);
          }}
        >
          <option value="A">{teamA?.name}</option>
          <option value="B">{teamB?.name}</option>
        </select>
      </div>

      <div className="stats-table-wrapper">
        <table className="stats-table">
          <thead>
            <tr>
              <th className="col-dorsal">#</th>
              <th className="col-name">Jugador</th>
              <th>Min</th>
              <th>Pts</th>
              <th>T2</th>
              <th>T3</th>
              <th>TL</th>
              <th>FC</th>
              <th>±</th>
              <th className="col-chevron"></th>
            </tr>
          </thead>
          <tbody>
            {visiblePlayers.map((player, index) => {
              const plusMinus = player.inOut ?? 0;
              return (
                <tr key={`${player.dorsal}-${index}`}>
                  <td className="col-dorsal">{player.dorsal}</td>
                  <td className="col-name">
                    {player.starting && <span className="starting-dot" aria-hidden="true" />}
                    {player.name}
                    {player.captain && <span className="captain-tag">C</span>}
                  </td>
                  <td>{formatMinutesSeconds(player.timePlayed || 0)}</td>
                  <td className="col-pts">{player.data?.score || 0}</td>
                  <td>{player.data?.shotsOfTwoSuccessful || 0}/{player.data?.shotsOfTwoAttempted || 0}</td>
                  <td>{player.data?.shotsOfThreeSuccessful || 0}/{player.data?.shotsOfThreeAttempted || 0}</td>
                  <td>{player.data?.shotsOfOneSuccessful || 0}/{player.data?.shotsOfOneAttempted || 0}</td>
                  <td>{player.data?.personalFouls || 0}</td>
                  <td>
                    <span className={`pm-pill ${plusMinus >= 0 ? "positive" : "negative"}`}>
                      {plusMinus > 0 ? `+${plusMinus}` : plusMinus}
                    </span>
                  </td>
                  <td className="col-chevron">›</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!showAll && sortedPlayers.length > PLAYERS_PAGE_SIZE && (
        <div className="stats-table-footer">
          <span>Mostrant {visiblePlayers.length} de {sortedPlayers.length} jugadors</span>
          <button className="show-all-button" onClick={() => setShowAll(true)}>
            Veure tots els jugadors →
          </button>
        </div>
      )}
    </div>
  );
};

// ========== PESTANYA: ROTACIONS ==========
const RotationsTab = ({ teamA, teamB, selectedKey, onSelectTeam }) => {
  const team = selectedKey === "A" ? teamA : teamB;
  const sortedPlayers = sortByDorsal(team?.players);

  return (
    <div className="stats-card">
      <div className="stats-card-header">
        <div>
          <h3>Rotacions</h3>
          <span className="legend">Intervals en pista per jugador</span>
        </div>
        <select className="team-select" value={selectedKey} onChange={(e) => onSelectTeam(e.target.value)}>
          <option value="A">{teamA?.name}</option>
          <option value="B">{teamB?.name}</option>
        </select>
      </div>

      <div className="rotations-list">
        {sortedPlayers.map((player, index) => {
          const intervals = formatIntervals(player.inOutsList);
          return (
            <div className="rotation-row" key={`${player.dorsal}-${index}`}>
              <div className="rotation-player">
                {player.starting && <span className="starting-dot" aria-hidden="true" />}
                <span className="rotation-dorsal">{player.dorsal}</span>
                {player.name}
              </div>
              <div className="rotation-intervals">
                {intervals.length === 0 ? (
                  <span className="rotation-empty">No ha jugat</span>
                ) : (
                  intervals.map(([from, to], i) => (
                    <span className="rotation-chip" key={i}>
                      {formatMinutesSeconds(from)}–{formatMinutesSeconds(to)}
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ========== PESTANYA: RESUM ==========
const SummaryTab = ({ match, teamA, teamB }) => {
  const totalsA = teamTotals(teamA?.players);
  const totalsB = teamTotals(teamB?.players);
  const periods = match.periods || [];

  const rows = [
    { label: "Punts", a: totalsA.pts, b: totalsB.pts },
    { label: "Tirs de 2", a: `${totalsA.t2m}/${totalsA.t2a}`, b: `${totalsB.t2m}/${totalsB.t2a}` },
    { label: "Triples", a: `${totalsA.t3m}/${totalsA.t3a}`, b: `${totalsB.t3m}/${totalsB.t3a}` },
    { label: "Tirs lliures", a: `${totalsA.tlm}/${totalsA.tla}`, b: `${totalsB.tlm}/${totalsB.tla}` },
    { label: "Faltes", a: totalsA.fc, b: totalsB.fc },
  ];

  return (
    <div className="stats-card">
      <div className="stats-card-header">
        <div>
          <h3>Resum del partit</h3>
          <span className="legend">Comparativa d'equips</span>
        </div>
      </div>

      {periods.length > 0 && (
        <div className="periods-row">
          {periods.map((p) => (
            <div className="period-chip" key={p.period}>
              <span className="period-chip-label">P{p.period}</span>
              <span className="period-chip-score">{p.local}-{p.visitor}</span>
            </div>
          ))}
        </div>
      )}

      <table className="summary-table">
        <thead>
          <tr>
            <th className="col-name">{teamA?.name}</th>
            <th></th>
            <th>{teamB?.name}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="summary-value">{row.a}</td>
              <td className="summary-label">{row.label}</td>
              <td className="summary-value">{row.b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PlayerList = ({ match }) => {
  if (!match?.teams || match.teams.length < 2) {
    return <p className="empty-state">No hi ha dades disponibles</p>;
  }

  const [teamA, teamB] = match.teams;
  const ownIsTeamA = teamA?.teamIdIntern === match.idTeam;
  const [selectedKey, setSelectedKey] = useState(ownIsTeamA ? "A" : "B");
  const [activeTab, setActiveTab] = useState("stats");

  const heroTeam = selectedKey === "A" ? teamA : teamB;
  const heroTotals = teamTotals(heroTeam?.players);
  const [heroMainName, ...heroRest] = (heroTeam?.name || "").split(" - ");
  const heroSubName = heroRest.join(" - ");

  return (
    <div className="match-detail">
      <div className="match-hero">
        <div className="match-hero-badge">
          {match.category ? `${match.category} · ` : ""}Partit finalitzat
        </div>
        <div className="match-hero-main">
          <div className="match-hero-team">
            <span className="match-hero-accent" />
            <div>
              <div className="match-hero-team-name">{heroMainName}</div>
              {heroSubName && <div className="match-hero-team-sub">{heroSubName}</div>}
            </div>
          </div>
          <div className="match-hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">{heroTotals.pts}</span>
              <span className="hero-stat-label">Punts</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">{heroTotals.t3m}</span>
              <span className="hero-stat-label">Triples</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">{heroTotals.tlm}/{heroTotals.tla}</span>
              <span className="hero-stat-label">Tirs lliures</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">{heroTotals.fc}</span>
              <span className="hero-stat-label">Faltes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="match-tabs">
        <button className={activeTab === "stats" ? "active" : ""} onClick={() => setActiveTab("stats")}>
          Estadístiques
        </button>
        <button className={activeTab === "rotations" ? "active" : ""} onClick={() => setActiveTab("rotations")}>
          Rotacions
        </button>
        <button className={activeTab === "summary" ? "active" : ""} onClick={() => setActiveTab("summary")}>
          Resum
        </button>
      </div>

      {activeTab === "stats" && (
        <StatsTab teamA={teamA} teamB={teamB} selectedKey={selectedKey} onSelectTeam={setSelectedKey} />
      )}
      {activeTab === "rotations" && (
        <RotationsTab teamA={teamA} teamB={teamB} selectedKey={selectedKey} onSelectTeam={setSelectedKey} />
      )}
      {activeTab === "summary" && <SummaryTab match={match} teamA={teamA} teamB={teamB} />}
    </div>
  );
};

export default PlayerList;
