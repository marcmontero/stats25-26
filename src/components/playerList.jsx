import React from "react";
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
  if (!inOutsList || inOutsList.length === 0) return null;

  const events = [...inOutsList].sort(
    (a, b) => (a.minuteAbsolut ?? 0) - (b.minuteAbsolut ?? 0)
  );

  const intervals = [];
  let openIn = null;

  for (const ev of events) {
    const minute = ev.minuteAbsolut ?? 0;
    if (ev.type === "IN_TYPE") {
      if (openIn !== null) {
        intervals.push(
          `${formatMinutesSeconds(openIn)}-${formatMinutesSeconds(minute)}`
        );
      }
      openIn = minute;
    } else if (ev.type === "OUT_TYPE") {
      if (openIn !== null) {
        intervals.push(
          `${formatMinutesSeconds(openIn)}-${formatMinutesSeconds(minute)}`
        );
        openIn = null;
      }
    }
  }

  return intervals.length ? intervals.map((i) => `[${i}]`).join(" ") : null;
};

// Percentatge d'encert, amb "—" quan no hi ha cap intent (igual que les
// pàgines oficials d'estadístiques).
const pct = (made, attempted) => {
  if (!attempted) return "—";
  return `${Math.round((made / attempted) * 100)}%`;
};

const TeamBoxScore = ({ team, isOwnTeam }) => {
  const players = team?.players || [];
  const sortedPlayers = [...players].sort((a, b) => {
    const dorsalA = parseInt(a.dorsal) || 999;
    const dorsalB = parseInt(b.dorsal) || 999;
    return dorsalA - dorsalB;
  });

  const totals = players.reduce(
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

  return (
    <div className="team-box">
      <div className={`team-box-header ${isOwnTeam ? "team-box-header--own" : "team-box-header--rival"}`}>
        <span className="team-box-name">{team?.name || "—"}</span>
        <span className="team-box-score">{totals.pts}</span>
      </div>
      <div className="team-box-table-wrapper">
        <table className="team-box-table">
          <thead>
            <tr>
              <th className="col-dorsal">#</th>
              <th className="col-name">Jugador/a</th>
              <th>Min</th>
              <th>Pts</th>
              <th>T2C</th>
              <th>T2I</th>
              <th>T2%</th>
              <th>T3C</th>
              <th>T3I</th>
              <th>T3%</th>
              <th>TLC</th>
              <th>TLI</th>
              <th>TL%</th>
              <th>FC</th>
              <th>±</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => {
              const plusMinus = player.inOut ?? 0;
              const intervals = formatIntervals(player.inOutsList);
              return (
                <React.Fragment key={`${player.dorsal}-${index}`}>
                  <tr className={player.starting ? "starting-row" : ""}>
                    <td className="col-dorsal">{player.dorsal}</td>
                    <td className="col-name">
                      {player.starting && <span className="starting-dot" aria-hidden="true" />}
                      {player.name}
                      {player.captain && <span className="captain-tag">C</span>}
                    </td>
                    <td>{formatMinutesSeconds(player.timePlayed || 0)}</td>
                    <td className="col-pts">{player.data?.score || 0}</td>
                    <td>{player.data?.shotsOfTwoSuccessful || 0}</td>
                    <td>{player.data?.shotsOfTwoAttempted || 0}</td>
                    <td>{pct(player.data?.shotsOfTwoSuccessful, player.data?.shotsOfTwoAttempted)}</td>
                    <td>{player.data?.shotsOfThreeSuccessful || 0}</td>
                    <td>{player.data?.shotsOfThreeAttempted || 0}</td>
                    <td>{pct(player.data?.shotsOfThreeSuccessful, player.data?.shotsOfThreeAttempted)}</td>
                    <td>{player.data?.shotsOfOneSuccessful || 0}</td>
                    <td>{player.data?.shotsOfOneAttempted || 0}</td>
                    <td>{pct(player.data?.shotsOfOneSuccessful, player.data?.shotsOfOneAttempted)}</td>
                    <td>{player.data?.personalFouls || 0}</td>
                    <td className={plusMinus >= 0 ? "positive" : "negative"}>
                      {plusMinus > 0 ? `+${plusMinus}` : plusMinus}
                    </td>
                  </tr>
                  {intervals && (
                    <tr className="intervals-row">
                      <td></td>
                      <td colSpan="14" className="intervals-cell">{intervals}</td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td colSpan="2">Total equip</td>
              <td>{formatMinutesSeconds(totals.min)}</td>
              <td>{totals.pts}</td>
              <td>{totals.t2m}</td>
              <td>{totals.t2a}</td>
              <td>{pct(totals.t2m, totals.t2a)}</td>
              <td>{totals.t3m}</td>
              <td>{totals.t3a}</td>
              <td>{pct(totals.t3m, totals.t3a)}</td>
              <td>{totals.tlm}</td>
              <td>{totals.tla}</td>
              <td>{pct(totals.tlm, totals.tla)}</td>
              <td>{totals.fc}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

const PlayerList = ({ match }) => {
  if (!match?.teams || match.teams.length < 2) {
    return <p className="empty-state">No hi ha dades disponibles</p>;
  }

  const [teamA, teamB] = match.teams;
  const ownIsTeamA = teamA?.teamIdIntern === match.idTeam;

  return (
    <div className="player-list-container">
      <TeamBoxScore team={teamA} isOwnTeam={ownIsTeamA} />
      <TeamBoxScore team={teamB} isOwnTeam={!ownIsTeamA} />
    </div>
  );
};

export default PlayerList;
