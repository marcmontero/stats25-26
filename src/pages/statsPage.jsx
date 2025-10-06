import React from "react";
import "./statsPage.css";

const StatsPage = ({ matches }) => {
  if (matches.length === 0) {
    return <p>Cargando datos...</p>;
  }

  // 🔹 Calcular estadísticas medias por jugadora
  const playerStats = {};

  matches.forEach(match => {
    match.players.forEach(player => {
      if (!playerStats[player.name]) {
        playerStats[player.name] = {
          gamesPlayed: 0,
          points: 0,
          minutes: 0,
          freeThrowsMade: 0,
          freeThrowsAttempted: 0,
          twoPointersMade: 0,
          threePointersMade: 0
        };
      }

      playerStats[player.name].gamesPlayed += 1;
      playerStats[player.name].points += player.data?.score || 0;
      playerStats[player.name].minutes += player.timePlayed || 0;
      playerStats[player.name].freeThrowsMade += player.data?.freeThrowsMade || 0;
      playerStats[player.name].freeThrowsAttempted += player.data?.freeThrowsAttempted || 0;
      playerStats[player.name].twoPointersMade += player.data?.shootingOfTwoSuccessfulPoint?.length || 0;
      playerStats[player.name].threePointersMade += player.data?.shootingOfThreeSuccessfulPoint?.length || 0;
    });
  });

  // 🔹 Calcular promedios
  const playerAverages = Object.entries(playerStats).map(([name, stats]) => ({
    name,
    avgPoints: (stats.points / stats.gamesPlayed).toFixed(1),
    avgMinutes: (stats.minutes / stats.gamesPlayed).toFixed(1),
    avgFreeThrows: `${stats.freeThrowsMade}/${stats.freeThrowsAttempted}`,
    avgTwoPointers: stats.twoPointersMade / stats.gamesPlayed,
    avgThreePointers: stats.threePointersMade / stats.gamesPlayed
  }));

  return (
    <div className="stats-page">
      <h2>📊 Promedios por Partido</h2>
      <table>
        <thead>
          <tr>
            <th>Jugador</th>
            <th>Minutos</th>
            <th>Puntos</th>
            <th>TL</th>
            <th>T2</th>
            <th>T3</th>
          </tr>
        </thead>
        <tbody>
          {playerAverages.map((player, index) => (
            <tr key={index}>
              <td>{player.name}</td>
              <td>{player.avgMinutes}</td>
              <td>{player.avgPoints}</td>
              <td>{player.avgFreeThrows}</td>
              <td>{player.avgTwoPointers.toFixed(1)}</td>
              <td>{player.avgThreePointers.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatsPage;
