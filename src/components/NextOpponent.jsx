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

const NextOpponent = ({ teamKey }) => {
  const [data, setData] = useState(null);
  const [checked, setChecked] = useState(false);

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
            Temporada de {data.opponent} — {data.opponentSeason.wins}V-{data.opponentSeason.losses}D
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
    </div>
  );
};

export default NextOpponent;
