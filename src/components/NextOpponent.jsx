import React, { useState, useEffect } from "react";
import "./NextOpponent.css";

const parseMatchDate = (dateStr, timeStr) => {
  const [day, month, year] = dateStr.split("/").map(Number);
  const [hour, minute] = (timeStr || "00:00").split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
};

const DAY_NAMES = ["Diumenge", "Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte"];

const formatDayLabel = (dateStr) => {
  const [day, month, year] = dateStr.split("/").map(Number);
  const date = new Date(year, month - 1, day);
  return `${DAY_NAMES[date.getDay()]} ${day}/${month}`;
};

const StreakDots = ({ streak = [] }) => (
  <span className="streak-dots">
    {streak.map((r, i) => (
      <span key={i} className={`streak-dot ${r}`} title={r === "win" ? "Victòria" : "Derrota"} />
    ))}
  </span>
);

const TeamStanding = ({ label, standing }) => {
  if (!standing) return null;
  return (
    <div className="next-opponent-standing">
      <span className="next-opponent-standing-label">{label}</span>
      <span className="next-opponent-standing-rank">{standing.rank}è</span>
      <span className="next-opponent-standing-record">
        {standing.won}V-{standing.lost}D
      </span>
      <span className="next-opponent-standing-pts">
        {standing.pointsFor}-{standing.pointsAgainst}
      </span>
      <StreakDots streak={standing.streak} />
    </div>
  );
};

const RosterTable = ({ roster = [], opponentName }) => (
  <div className="opponent-roster-wrapper">
    <table className="opponent-roster-table">
      <thead>
        <tr>
          <th className="col-dorsal">#</th>
          <th className="col-name">Jugador/a</th>
          <th>PJ</th>
          <th>Min/P</th>
          <th>Pts/P</th>
          <th>T2/P</th>
          <th>T3/P</th>
          <th>TL</th>
          <th>FC/P</th>
          <th>±/P</th>
        </tr>
      </thead>
      <tbody>
        {roster.map((p, i) => (
          <tr key={i}>
            <td className="col-dorsal">{p.dorsal}</td>
            <td className="col-name">{p.name}</td>
            <td>{p.gamesPlayed}</td>
            <td>{p.avgMinutes}</td>
            <td className="col-pts">{p.avgPoints}</td>
            <td>{p.avgT2m}</td>
            <td>{p.avgT3m}</td>
            <td>{p.totalFtm}/{p.totalFta} ({p.ftPer}%)</td>
            <td>{p.avgFouls}</td>
            <td className={p.avgPlusMinus >= 0 ? "positive" : "negative"}>
              {p.avgPlusMinus > 0 ? `+${p.avgPlusMinus}` : p.avgPlusMinus}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <p className="opponent-roster-note">
      L'API de temporada no dona els intents de tir de 2/3 — només els encistellats (T2/P, T3/P). El % només es pot calcular per als tirs lliures.
    </p>
  </div>
);

const NextOpponent = ({ teamKey }) => {
  const [data, setData] = useState(null);
  const [checked, setChecked] = useState(false);
  const [showFullRoster, setShowFullRoster] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/next_opponent.json?t=${Date.now()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled) return;
        setData(json?.teams?.[teamKey] || null);
        setChecked(true);
      })
      .catch(() => {
        if (!cancelled) setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [teamKey]);

  if (!checked || !data) return null;

  const matchDate = parseMatchDate(data.date, data.time);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysUntil = Math.round((matchDate - startOfToday) / (1000 * 60 * 60 * 24));

  let countdownLabel = null;
  if (daysUntil === 0) countdownLabel = "Avui";
  else if (daysUntil === 1) countdownLabel = "Demà";
  else if (daysUntil > 1) countdownLabel = `D'aquí ${daysUntil} dies`;

  return (
    <div className="next-opponent-card">
      <div className="next-opponent-header">
        <span className="next-opponent-eyebrow">Proper rival</span>
        {countdownLabel && <span className="next-opponent-countdown">{countdownLabel}</span>}
      </div>
      <div className="next-opponent-main">
        <span className="next-opponent-name">{data.opponent}</span>
        <span className={`next-opponent-venue-tag ${data.isHome ? "home" : "away"}`}>
          {data.isHome ? "A casa" : "Fora"}
        </span>
      </div>
      <div className="next-opponent-details">
        {formatDayLabel(data.date)} · {data.time}
        {data.venueName ? ` · ${data.venueName}` : ""}
      </div>
      {(data.ownStanding || data.opponentStanding) && (
        <div className="next-opponent-standings">
          <TeamStanding label="AEB" standing={data.ownStanding} />
          <TeamStanding label={data.opponent} standing={data.opponentStanding} />
        </div>
      )}
      {data.opponentSeason && (
        <div className="next-opponent-scorers">
          <span className="next-opponent-scorers-label">
            Temporada {data.opponentSeason.season ? `${data.opponentSeason.season} ` : ""}de {data.opponent} — {data.opponentSeason.wins}V-{data.opponentSeason.losses}D
            {data.opponentSeason.avgPointsFor != null &&
              ` · ${data.opponentSeason.avgPointsFor}-${data.opponentSeason.avgPointsAgainst} punts/partit`}
          </span>
          <div className="next-opponent-scorers-list">
            {data.opponentSeason.topScorers?.map((p, i) => (
              <span className="scorer-chip" key={i}>
                <span className="scorer-dorsal">{p.dorsal}</span>
                {p.name} <strong>{p.avgPoints} p/p</strong>
              </span>
            ))}
          </div>
          {data.opponentSeason.roster?.length > 0 && (
            <>
              <button
                className="show-roster-button"
                onClick={() => setShowFullRoster((v) => !v)}
              >
                {showFullRoster ? "Amagar" : "Veure"} tota la plantilla de {data.opponent} →
              </button>
              {showFullRoster && (
                <RosterTable roster={data.opponentSeason.roster} opponentName={data.opponent} />
              )}
            </>
          )}
        </div>
      )}
      {!data.opponentSeason && data.opponentTopScorers?.length > 0 && (
        <div className="next-opponent-scorers">
          <span className="next-opponent-scorers-label">Màximes anotadores {data.opponent}</span>
          <div className="next-opponent-scorers-list">
            {data.opponentTopScorers.map((p, i) => (
              <span className="scorer-chip" key={i}>
                <span className="scorer-dorsal">{p.dorsal}</span>
                {p.name} <strong>{p.points}p</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NextOpponent;
