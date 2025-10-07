import React from "react";
import "./TopQuintetsAnalysis.css";

const TopQuintetsAnalysis = ({ matches }) => {
  // Función para obtener todos los quintetos de todos los partidos
  const getAllQuintets = () => {
    const quintetsMap = {};

    matches.forEach((match) => {
      const players = match.players;
      
      // Obtener todos los eventos de entrada/salida
      const allEvents = [];
      players.forEach(player => {
        if (player.inOutsList) {
          player.inOutsList.forEach(event => {
            allEvents.push({
              time: event.minuteAbsolut || 0,
              type: event.type,
              playerName: player.name,
              plusMinus: player.inOut || 0
            });
          });
        }
      });

      // Ordenar eventos por tiempo
      allEvents.sort((a, b) => a.time - b.time);

      // Rastrear jugadores en pista
      const onCourt = new Set();
      let lastTime = 0;

      allEvents.forEach((event, index) => {
        if (event.type === "IN_TYPE") {
          onCourt.add(event.playerName);
        } else if (event.type === "OUT_TYPE") {
          onCourt.delete(event.playerName);
        }

        // Si hay exactamente 5 jugadores en pista
        if (onCourt.size === 5) {
          const lineup = Array.from(onCourt).sort();
          const lineupKey = lineup.join(" | ");
          
          const timeOnCourt = index < allEvents.length - 1 
            ? allEvents[index + 1].time - event.time 
            : 0;

          if (!quintetsMap[lineupKey]) {
            quintetsMap[lineupKey] = {
              players: lineup,
              totalTime: 0,
              totalPlusMinus: 0,
              appearances: 0
            };
          }

          // Calcular el +/- del quinteto
          const quintetPlayers = players.filter(p => lineup.includes(p.name));
          const avgPlusMinus = quintetPlayers.reduce((sum, p) => sum + (p.inOut || 0), 0) / quintetPlayers.length;

          quintetsMap[lineupKey].totalTime += timeOnCourt;
          quintetsMap[lineupKey].totalPlusMinus += avgPlusMinus * timeOnCourt;
          quintetsMap[lineupKey].appearances += 1;
        }

        lastTime = event.time;
      });
    });

    // Convertir a array y calcular promedios
    return Object.values(quintetsMap)
      .map(quintet => ({
        ...quintet,
        avgPlusMinus: quintet.totalTime > 0 
          ? (quintet.totalPlusMinus / quintet.totalTime).toFixed(2)
          : 0,
        totalTimeFormatted: quintet.totalTime.toFixed(1)
      }))
      .filter(q => q.totalTime > 2); // Filtrar quintetos con menos de 2 minutos
  };

  const allQuintets = getAllQuintets();
  
  // Ordenar por +/-
  const sortedByPlusMinus = [...allQuintets].sort((a, b) => 
    parseFloat(b.avgPlusMinus) - parseFloat(a.avgPlusMinus)
  );

  // Top 5 mejores y peores
  const topQuintets = sortedByPlusMinus.slice(0, 5);
  const worstQuintets = sortedByPlusMinus.slice(-5).reverse();

  return (
    <div className="top-quintets-container">
      <h2>Anàlisi de Quintets de la Temporada</h2>

      <div className="quintets-summary">
        <div className="summary-card">
          <span className="summary-label">Total Quintets</span>
          <span className="summary-value">{allQuintets.length}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Partits Analitzats</span>
          <span className="summary-value">{matches.length}</span>
        </div>
      </div>

      <div className="quintets-sections">
        {/* Top 5 Mejores */}
        <div className="quintets-section">
          <h3 className="section-title best">Top 5 Millors Quintets</h3>
          <div className="quintets-list">
            {topQuintets.map((quintet, index) => (
              <div key={index} className="quintet-card best">
                <div className="quintet-rank">#{index + 1}</div>
                <div className="quintet-info">
                  <div className="quintet-players">
                    {quintet.players.map((player, i) => (
                      <span key={i} className="player-badge">
                        {player}
                      </span>
                    ))}
                  </div>
                  <div className="quintet-stats">
                    <div className="stat">
                      <span className="stat-label">±</span>
                      <span className={`stat-value ${parseFloat(quintet.avgPlusMinus) >= 0 ? 'positive' : 'negative'}`}>
                        {parseFloat(quintet.avgPlusMinus) > 0 ? '+' : ''}{quintet.avgPlusMinus}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Minuts</span>
                      <span className="stat-value">{quintet.totalTimeFormatted}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Aparicions</span>
                      <span className="stat-value">{quintet.appearances}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Peores */}
        <div className="quintets-section">
          <h3 className="section-title worst">Top 5 Pitjors Quintets</h3>
          <div className="quintets-list">
            {worstQuintets.map((quintet, index) => (
              <div key={index} className="quintet-card worst">
                <div className="quintet-rank">#{index + 1}</div>
                <div className="quintet-info">
                  <div className="quintet-players">
                    {quintet.players.map((player, i) => (
                      <span key={i} className="player-badge">
                        {player}
                      </span>
                    ))}
                  </div>
                  <div className="quintet-stats">
                    <div className="stat">
                      <span className="stat-label">±</span>
                      <span className="stat-value negative">{quintet.avgPlusMinus}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Minuts</span>
                      <span className="stat-value">{quintet.totalTimeFormatted}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Aparicions</span>
                      <span className="stat-value">{quintet.appearances}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopQuintetsAnalysis;