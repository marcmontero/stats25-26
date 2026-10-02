import React, { useState } from "react";
import "./PlayerList.css";
import { playerWord, playersWord } from "../utils/genderWords.js";

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

// "MARC LLAMAS JORDAN" -> { first: "Marc", rest: "Llamas Jordan" }
const splitName = (fullName = "") => {
  const toTitleCase = (s) => s.charAt(0) + s.slice(1).toLowerCase();
  const words = fullName.trim().split(/\s+/).map(toTitleCase);
  return { first: words[0] || "", rest: words.slice(1).join(" ") };
};

const TeamToggle = ({ teamA, teamB, selectedKey, onSelectTeam }) => (
  <div className="team-toggle">
    <button
      className={selectedKey === "A" ? "active" : ""}
      onClick={() => onSelectTeam("A")}
    >
      {teamA?.name}
    </button>
    <button
      className={selectedKey === "B" ? "active" : ""}
      onClick={() => onSelectTeam("B")}
    >
      {teamB?.name}
    </button>
  </div>
);

// ========== PESTANYA: ESTADÍSTIQUES ==========
const StatsTab = ({ teamA, teamB, selectedKey, onSelectTeam, isFeminine }) => {
  const team = selectedKey === "A" ? teamA : teamB;
  const sortedPlayers = sortByDorsal(team?.players);

  return (
    <div className="stats-card">
      <div className="stats-card-header">
        <div>
          <h3>Estadístiques dels {playersWord(isFeminine, false)}</h3>
          <span className="legend">
            <span className="legend-dot" /> Cinc inicial
          </span>
        </div>
        <TeamToggle teamA={teamA} teamB={teamB} selectedKey={selectedKey} onSelectTeam={onSelectTeam} />
      </div>

      <div className="stats-table-wrapper">
        <table className="stats-table">
          <thead>
            <tr>
              <th className="col-dorsal">#</th>
              <th className="col-name">{playerWord(isFeminine)}</th>
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
            {sortedPlayers.map((player, index) => {
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
    </div>
  );
};

// ========== PESTANYA: ROTACIONS ==========
const RotationsTab = ({ teamA, teamB, selectedKey, onSelectTeam, isFeminine }) => {
  const team = selectedKey === "A" ? teamA : teamB;
  const sortedPlayers = sortByDorsal(team?.players);

  return (
    <div className="stats-card">
      <div className="stats-card-header">
        <div>
          <h3>Rotacions</h3>
          <span className="legend">Intervals en pista per {playerWord(isFeminine, false)}</span>
        </div>
        <TeamToggle teamA={teamA} teamB={teamB} selectedKey={selectedKey} onSelectTeam={onSelectTeam} />
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

// ========== PESTANYA: QUINTETS ==========
const QUINTETS_PAGE_SIZE = 5;

const QuintetsTab = ({ match, selectedKey, teamA, teamB, onSelectTeam, isFeminine }) => {
  const [showAll, setShowAll] = useState(false);
  const [sortDir, setSortDir] = useState("desc");

  const team = selectedKey === "A" ? teamA : teamB;
  const quintets = team?.quintets || [];
  const sorted = [...quintets].sort((a, b) =>
    sortDir === "desc" ? b.plusMinus - a.plusMinus : a.plusMinus - b.plusMinus
  );
  const visible = showAll ? sorted : sorted.slice(0, QUINTETS_PAGE_SIZE);

  if (quintets.length === 0) {
    return (
      <div className="stats-card">
        <div className="stats-card-header">
          <div>
            <h3>Més/menys per quintet</h3>
            <span className="legend">Diferència de punts mentre els cinc {playersWord(isFeminine, false)} són a pista.</span>
          </div>
          <TeamToggle teamA={teamA} teamB={teamB} selectedKey={selectedKey} onSelectTeam={onSelectTeam} />
        </div>
        <p className="empty-state">No hi ha dades de quintets per a aquest equip.</p>
      </div>
    );
  }

  return (
    <div className="stats-card">
      <div className="stats-card-header">
        <div>
          <h3>Més/menys per quintet</h3>
          <span className="legend">Diferència de punts mentre els cinc {playersWord(isFeminine, false)} són a pista.</span>
        </div>
        <div className="quintets-header-controls">
          <TeamToggle teamA={teamA} teamB={teamB} selectedKey={selectedKey} onSelectTeam={onSelectTeam} />
          <button
            className="sort-toggle"
            onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
          >
            Més/menys {sortDir === "desc" ? "↓" : "↑"}
          </button>
        </div>
      </div>

      <div className="quintets-list">
        {visible.map((quintet, index) => (
          <div className="quintet-row" key={index}>
            <span className="quintet-rank">{index + 1}</span>
            <div className="quintet-players">
              {quintet.lineup.map((player, i) => {
                const { first, rest } = splitName(player.name);
                return (
                  <div className="quintet-chip" key={i}>
                    <span className="quintet-chip-dorsal">{player.dorsal}</span>
                    <span className="quintet-chip-name">
                      {first}
                      <span className="quintet-chip-lastname">{rest}</span>
                    </span>
                  </div>
                );
              })}
            </div>
            <span className={`pm-pill quintet-pm ${quintet.plusMinus >= 0 ? "positive" : "negative"}`}>
              {quintet.plusMinus > 0 ? `+${quintet.plusMinus}` : quintet.plusMinus}
            </span>
            {index === 0 && sortDir === "desc" && <span className="best-tag">Millor balanç</span>}
          </div>
        ))}
      </div>

      {!showAll && sorted.length > QUINTETS_PAGE_SIZE && (
        <div className="stats-table-footer">
          <button className="show-all-button" onClick={() => setShowAll(true)}>
            Veure tots els quintets →
          </button>
        </div>
      )}
    </div>
  );
};

const PlayerList = ({ match, onBack, isFeminine }) => {
  if (!match?.teams || match.teams.length < 2) {
    return <p className="empty-state">No hi ha dades disponibles</p>;
  }

  const [teamA, teamB] = match.teams;
  const ownIsTeamA = teamA?.teamIdIntern === match.idTeam;
  const [selectedKey, setSelectedKey] = useState(ownIsTeamA ? "A" : "B");
  const [activeTab, setActiveTab] = useState("stats");

  const totalsA = teamTotals(teamA?.players);
  const totalsB = teamTotals(teamB?.players);
  const ownWon = ownIsTeamA ? totalsA.pts > totalsB.pts : totalsB.pts > totalsA.pts;

  const [teamAName, ...teamARest] = (teamA?.name || "").split(" - ");
  const [teamBName, ...teamBRest] = (teamB?.name || "").split(" - ");
  const teamASub = teamARest.join(" - ");
  const teamBSub = teamBRest.join(" - ");

  return (
    <div className="match-detail">
      <div className="match-detail-topbar">
        <h2 className="match-detail-title">El partit, al detall</h2>
        {onBack && (
          <button className="match-back-button" onClick={onBack}>
            ← Tornar a partits
          </button>
        )}
      </div>

      <div className="match-hero">
        <div className="match-hero-badges">
          {match.category && <span className="match-hero-category">{match.category}</span>}
          <span className="match-hero-status">Finalitzat</span>
        </div>
        <div className="match-hero-scoreboard">
          <div className="match-hero-side">
            <div className="match-hero-team-name">{teamAName}</div>
            {teamASub && <div className="match-hero-team-sub">{teamASub}</div>}
            <span className="match-hero-role">Local</span>
          </div>
          <div className="match-hero-score">
            <span>{totalsA.pts}</span>
            <span className="match-hero-score-dash">—</span>
            <span>{totalsB.pts}</span>
          </div>
          <div className="match-hero-side match-hero-side--right">
            <div className="match-hero-team-name">{teamBName}</div>
            {teamBSub && <div className="match-hero-team-sub">{teamBSub}</div>}
            <span className="match-hero-role">Visitant</span>
          </div>
        </div>
        <div className="match-hero-result">
          <span className={`result-pill ${ownWon ? "win" : "loss"}`}>
            {ownWon ? "🏆 Victòria" : "Derrota"} AEB
          </span>
        </div>
      </div>

      <div className="match-tabs">
        <button className={activeTab === "stats" ? "active" : ""} onClick={() => setActiveTab("stats")}>
          Estadístiques
        </button>
        <button className={activeTab === "rotations" ? "active" : ""} onClick={() => setActiveTab("rotations")}>
          Rotacions
        </button>
        <button className={activeTab === "quintets" ? "active" : ""} onClick={() => setActiveTab("quintets")}>
          Quintets
        </button>
      </div>

      {activeTab === "stats" && (
        <StatsTab teamA={teamA} teamB={teamB} selectedKey={selectedKey} onSelectTeam={setSelectedKey} isFeminine={isFeminine} />
      )}
      {activeTab === "rotations" && (
        <RotationsTab teamA={teamA} teamB={teamB} selectedKey={selectedKey} onSelectTeam={setSelectedKey} isFeminine={isFeminine} />
      )}
      {activeTab === "quintets" && (
        <QuintetsTab match={match} teamA={teamA} teamB={teamB} selectedKey={selectedKey} onSelectTeam={setSelectedKey} isFeminine={isFeminine} />
      )}
    </div>
  );
};

export default PlayerList;
