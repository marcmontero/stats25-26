import React, { useState } from "react";
import "./PlayerStatsByMatch.css";

const PlayerStatsByMatch = ({ matches }) => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Obtener la lista de jugadores únicos
  const playersList = Array.from(
    new Set(matches.flatMap(match => match.players.map(player => player.name)))
  );

  // Filtrar estadísticas solo para la jugadora seleccionada
  const filteredStats = selectedPlayer
    ? matches.map(match => {
        const playerData = match.players.find(player => player.name === selectedPlayer);
        return {
          match: match.matchResult,
          minutes: playerData?.timePlayed || 0,
          points: playerData?.data?.score || 0,
          freeThrowsMade: playerData?.data?.shotsOfOneSuccessful ?? 0, // ✅ Corrección TL anotados
          freeThrowsAttempted: playerData?.data?.shotsOfOneAttempted ?? 0, // ✅ Corrección TL intentados
          twoPointers: playerData?.data?.shootingOfTwoSuccessfulPoint?.length || 0,
          threePointers: playerData?.data?.shootingOfThreeSuccessfulPoint?.length || 0,
          plusMinus: playerData?.inOut || 0,
          plusMinusPerMinute:
            playerData?.timePlayed > 0
              ? (playerData.inOut / playerData.timePlayed).toFixed(2)
              : "0.00",
        };
      })
    : [];

  // Calcular los promedios si hay datos
  const averageStats =
    filteredStats.length > 0
      ? {
          match: "Mitjana",
          minutes: (filteredStats.reduce((sum, stat) => sum + stat.minutes, 0) / filteredStats.length).toFixed(1),
          points: (filteredStats.reduce((sum, stat) => sum + stat.points, 0) / filteredStats.length).toFixed(1),
          freeThrowsMade: (filteredStats.reduce((sum, stat) => sum + stat.freeThrowsMade, 0) / filteredStats.length).toFixed(1),
          freeThrowsAttempted: (filteredStats.reduce((sum, stat) => sum + stat.freeThrowsAttempted, 0) / filteredStats.length).toFixed(1),
          twoPointers: (filteredStats.reduce((sum, stat) => sum + stat.twoPointers, 0) / filteredStats.length).toFixed(1),
          threePointers: (filteredStats.reduce((sum, stat) => sum + stat.threePointers, 0) / filteredStats.length).toFixed(1),
          plusMinus: (filteredStats.reduce((sum, stat) => sum + stat.plusMinus, 0) / filteredStats.length).toFixed(1),
          plusMinusPerMinute: (
            filteredStats.reduce((sum, stat) => sum + parseFloat(stat.plusMinusPerMinute), 0) / filteredStats.length
          ).toFixed(2),
        }
      : null;

  return (
    <div className="player-stats-container">
      <h2>Estadístiques per jugadora</h2>

      {/* Selector de Jugadora */}
      <div className="player-selector">
        <label>Selecciona una jugadora:</label>
        <select onChange={(e) => setSelectedPlayer(e.target.value)} value={selectedPlayer || ""}>
          <option value="">-- Seleccionar --</option>
          {playersList.map((player, index) => (
            <option key={index} value={player}>
              {player}
            </option>
          ))}
        </select>
      </div>

      {/* Mostrar estadísticas si hay una jugadora seleccionada */}
      {selectedPlayer && (
        <table className="player-stats-table">
          <thead>
            <tr>
              <th>Partit</th>
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
            {filteredStats.map((stat, index) => (
              <tr key={index}>
                <td>{stat.match}</td>
                <td>{stat.minutes}</td>
                <td>{stat.points}</td>
                <td>{`${stat.freeThrowsMade}/${stat.freeThrowsAttempted}`}</td> {/* ✅ Mostrar TL correctamente */}
                <td>{stat.twoPointers}</td>
                <td>{stat.threePointers}</td>
                <td className={stat.plusMinus >= 0 ? "positive" : "negative"}>
                  {stat.plusMinus}
                </td>
                <td className={stat.plusMinusPerMinute >= 0 ? "positive" : "negative"}>
                  {stat.plusMinusPerMinute}
                </td>
              </tr>
            ))}

            {/* 🔹 Fila de Promedio */}
            {averageStats && (
              <tr className="average-row">
                <td>{averageStats.match}</td>
                <td>{averageStats.minutes}</td>
                <td>{averageStats.points}</td>
                <td>{`${averageStats.freeThrowsMade}/${averageStats.freeThrowsAttempted}`}</td> {/* ✅ Mostrar TL promedio */}
                <td>{averageStats.twoPointers}</td>
                <td>{averageStats.threePointers}</td>
                <td className={averageStats.plusMinus >= 0 ? "positive" : "negative"}>
                  {averageStats.plusMinus}
                </td>
                <td className={averageStats.plusMinusPerMinute >= 0 ? "positive" : "negative"}>
                  {averageStats.plusMinusPerMinute}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PlayerStatsByMatch;
