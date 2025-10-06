import React from "react";
import "./PlayerList.css";

// === Helpers para intervalos absolutos (00:00 → 40:00) ===
const toAbsClock = (absMinute) => {
  const min = Math.floor(absMinute || 0);
  const sec = Math.round((absMinute - min) * 60); // si vinieran decimales
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const buildIntervalsAbsolute = (inOutsList = []) => {
  const events = [...(inOutsList || [])].sort(
    (a, b) => (a.minuteAbsolut ?? 0) - (b.minuteAbsolut ?? 0)
  );

  const intervals = [];
  let openIn = null;

  for (const ev of events) {
    const minute = ev.minuteAbsolut ?? 0;
    if (ev.type === "IN_TYPE") {
      if (openIn !== null) {
        // dos IN seguidos → cerramos al siguiente IN
        intervals.push({ inAbs: openIn, outAbs: minute });
      }
      openIn = minute;
    } else if (ev.type === "OUT_TYPE") {
      if (openIn !== null) {
        intervals.push({ inAbs: openIn, outAbs: minute });
        openIn = null;
      }
    }
  }
  return intervals;
};

const formatAbsInterval = ({ inAbs, outAbs }) =>
  `${toAbsClock(inAbs)} - ${toAbsClock(outAbs)}`;

const PlayerList = ({ players }) => {
  return (
    <div className="player-list">
      <h2>Estadístiques del partit</h2>
      <table>
        <thead>
          <tr>
            <th>Dorsal</th>
            <th>Jugadora</th>
            <th>Min</th>
            <th>Punts</th>
            <th>TL</th>
            <th>T2</th>
            <th>T3</th>
            <th>±</th>
            <th>±/Min</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => {
            const plusMinus = player.inOut ?? 0;
            const minutesPlayed = player.timePlayed || 0;
            const plusMinusPerMinute =
              minutesPlayed > 0 ? (plusMinus / minutesPlayed).toFixed(2) : "0.00";

            // Calcular intervalos absolutos
            const intervals = buildIntervalsAbsolute(player.inOutsList);
            const intervalsText = intervals.length
              ? intervals.map((iv) => `[${formatAbsInterval(iv)}]`).join(" ")
              : "(Sense dades)";

            return (
              <React.Fragment key={index}>
                {/* Fila principal con stats */}
                <tr>
                  <td>{player.dorsal}</td>
                  <td>{player.name}</td>
                  <td>{minutesPlayed}</td>
                  <td>{player.data?.score || 0}</td>
                  <td>
                    {`${player.data?.shotsOfOneSuccessful || 0}/${
                      player.data?.shotsOfOneAttempted || 0
                    }`}
                  </td>
                  <td>{player.data?.shootingOfTwoSuccessfulPoint?.length || 0}</td>
                  <td>{player.data?.shootingOfThreeSuccessfulPoint?.length || 0}</td>
                  <td className={plusMinus >= 0 ? "positive" : "negative"}>
                    {plusMinus}
                  </td>
                  <td className={plusMinusPerMinute >= 0 ? "positive" : "negative"}>
                    {plusMinusPerMinute}
                  </td>
                </tr>

                {/* Fila extra con intervalos absolutos */}
                <tr className="intervals-row">
                  <td colSpan={9} style={{ fontStyle: "italic", fontSize: "0.9em" }}>
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
