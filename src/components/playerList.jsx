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
  if (!inOutsList || inOutsList.length === 0) return "-";

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

  return intervals.length ? intervals.map((i) => `[${i}]`).join(" ") : "-";
};

const PlayerList = ({ players }) => {
  // Ordenar jugadores por dorsal
  const sortedPlayers = [...players].sort((a, b) => {
    const dorsalA = parseInt(a.dorsal) || 999;
    const dorsalB = parseInt(b.dorsal) || 999;
    return dorsalA - dorsalB;
  });

  return (
    <div className="player-list-container">
      <table className="player-list-table">
        {" "}
        <thead>
          <tr>
            <th>Nº</th>
            <th>Nom</th>
            <th>T</th>
            <th>Min</th>
            <th>Pts</th>
            <th>TL</th>
            <th>T2</th>
            <th>T3</th>
            <th>±</th>
            <th>±/Min</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player, index) => {
            const plusMinus = player.inOut ?? 0;
            const minutesPlayed = player.timePlayed || 0;
            const plusMinusPerMinute =
              minutesPlayed > 0
                ? (plusMinus / minutesPlayed).toFixed(2)
                : "0.00";

            // Tiros libres
            const tlMade = player.data?.shotsOfOneSuccessful ?? 0;
            const tlAttempted = player.data?.shotsOfOneAttempted ?? 0;
            const tlText = tlAttempted > 0 ? `${tlMade}/${tlAttempted}` : "0/0";

            // Tiros de 2
            const t2Made = player.data?.shotsOfTwoSuccessful ?? 0;
            const t2Attempted = player.data?.shotsOfTwoAttempted ?? 0;
            const t2Text = `${t2Made}/${t2Attempted}`;

            // Tiros de 3
            const t3Made = player.data?.shotsOfThreeSuccessful ?? 0;
            const t3Attempted = player.data?.shotsOfThreeAttempted ?? 0;
            const t3Text = `${t3Made}/${t3Attempted}`;

            // Formatear intervalos
            const intervalsText = formatIntervals(player.inOutsList);

            return (
              <React.Fragment key={index}>
                {/* Fila principal con stats */}
                <tr className={player.starting ? "titular-row" : ""}>
                  <td className="dorsal-cell">{player.dorsal}</td>
                  <td className="player-name">{player.name}</td>
                  <td className="titular-cell">{player.starting ? "X" : ""}</td>
                  <td className="minutes-cell">
                    {formatMinutesSeconds(minutesPlayed)}
                  </td>
                  <td className="points-cell">{player.data?.score || 0}</td>
                  <td className="shots-cell">{tlText}</td>
                  <td className="shots-cell">{t2Text}</td>
                  <td className="shots-cell">{t3Text}</td>
                  <td className={plusMinus >= 0 ? "positive" : "negative"}>
                    {plusMinus > 0 ? `+${plusMinus}` : plusMinus}
                  </td>
                  <td
                    className={
                      plusMinusPerMinute >= 0 ? "positive" : "negative"
                    }
                  >
                    {plusMinusPerMinute}
                  </td>
                </tr>

                {/* Fila extra con intervalos */}
                <tr className="intervals-row">
                  <td colSpan="10" className="intervals-cell">
                    {intervalsText}
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerList;
