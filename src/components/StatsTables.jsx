import React from "react";
import "./StatsTables.css";

const StatsTable = ({ matches }) => {
  if (matches.length === 0) {
    return <p>Cargando datos...</p>;
  }

  const playerStats = {};

  matches.forEach((match) => {
    match.players.forEach((player) => {
      if (!playerStats[player.name]) {
        playerStats[player.name] = {
          gamesPlayed: 0,
          points: 0,
          totalMinutes: 0,
          freeThrowsMade: 0,
          freeThrowsAttempted: 0,
          twoPointersMade: 0,
          threePointersMade: 0,
          totalPlusMinus: 0, // 🔹 Guardar el más/menos total
        };
      }

      playerStats[player.name].gamesPlayed += 1;
      playerStats[player.name].points += player.data?.score || 0;
      playerStats[player.name].totalMinutes += player.timePlayed || 0;
      playerStats[player.name].freeThrowsMade +=
        player.data?.shotsOfOneSuccessful ?? 0;
      playerStats[player.name].freeThrowsAttempted +=
        player.data?.shotsOfOneAttempted ?? 0;
      playerStats[player.name].twoPointersMade +=
        player.data?.shootingOfTwoSuccessfulPoint?.length || 0;
      playerStats[player.name].threePointersMade +=
        player.data?.shootingOfThreeSuccessfulPoint?.length || 0;
      playerStats[player.name].totalPlusMinus += player.inOut || 0; // 🔹 Acumulamos el más/menos total
    });
  });

  const playerAverages = Object.entries(playerStats).map(([name, stats]) => {
    const avgMinutes = stats.totalMinutes / stats.gamesPlayed || 1; // Promedio de minutos jugados
    const avgPlusMinus = (stats.totalPlusMinus / stats.gamesPlayed).toFixed(1); // Promedio de ±
    const plusMinusPerMinute =
      avgMinutes > 0 ? (stats.totalPlusMinus / avgMinutes).toFixed(2) : "0.00"; // 🔹 CORRECTO

    return {
      name,
      avgMinutes: avgMinutes.toFixed(1),
      avgPoints: (stats.points / stats.gamesPlayed).toFixed(1),
      avgFreeThrows: `${stats.freeThrowsMade}/${stats.freeThrowsAttempted}`,
      avgTwoPointers: (stats.twoPointersMade / stats.gamesPlayed).toFixed(1),
      avgThreePointers: (stats.threePointersMade / stats.gamesPlayed).toFixed(
        1
      ),
      avgPlusMinus,
      plusMinusPerMinute, // 🔹 Añadir ±/Min correcto
    };
  });

  return (
    <div className="stats-table">
      <h2>Mitjana per partit</h2>
      <table>
        <thead>
          <tr>
            <th>Jugadora</th>
            <th>Min</th>
            <th>Punts</th>
            <th>TL</th>
            <th>T2</th>
            <th>T3</th>
            <th>±</th>
            <th>±/Min</th> {/* Nueva columna */}
          </tr>
        </thead>
        <tbody>
          {playerAverages.map((player, index) => (
            <tr key={index}>
              <td>{player.name}</td>
              <td>{player.avgMinutes}</td>
              <td>{player.avgPoints}</td>
              <td>{player.avgFreeThrows}</td>
              <td>{player.avgTwoPointers}</td>
              <td>{player.avgThreePointers}</td>
              <td className={player.avgPlusMinus < 0 ? "negative" : "positive"}>
                {player.avgPlusMinus}
              </td>
              <td
                className={
                  player.plusMinusPerMinute < 0 ? "negative" : "positive"
                }
              >
                {player.plusMinusPerMinute}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatsTable;
