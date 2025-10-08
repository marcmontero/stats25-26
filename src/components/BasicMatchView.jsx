import React from 'react';
import './BasicMatchView.css';

const BasicMatchView = ({ match }) => {
  if (!match || !match.players) {
    return <p>No hi ha dades disponibles</p>;
  }

  // Ordenar jugadors per dorsal
  const sortedPlayers = [...match.players].sort((a, b) => {
    const dorsalA = parseInt(a.dorsal) || 999;
    const dorsalB = parseInt(b.dorsal) || 999;
    return dorsalA - dorsalB;
  });

  // Determinar quants quarts té el partit (normalment 8 per categories base)
  const maxQuarters = 8;

  // Funció per determinar si un jugador va jugar en un quart específic
  const playedInQuarter = (player, quarterNumber) => {
    if (!player.inOutsList || player.inOutsList.length === 0) return false;

    // Duració del partit en minuts (48 minuts per categories base)
    const totalMinutes = 48;
    // Cada quart dura: 48 minuts / 8 quarts = 6 minuts
    const quarterDuration = totalMinutes / maxQuarters;
    
    // Temps d'inici i final del quart
    const quarterStart = (quarterNumber - 1) * quarterDuration;
    const quarterEnd = quarterNumber * quarterDuration;

    // Ordenar events per temps
    const sortedEvents = [...player.inOutsList].sort((a, b) => 
      (a.minuteAbsolut || 0) - (b.minuteAbsolut || 0)
    );

    // Comprovar si el jugador estava dins de la pista durant aquest quart
    let isOnCourt = false;
    
    for (const event of sortedEvents) {
      const eventTime = event.minuteAbsolut || 0;
      
      // Si l'event és abans del quart, només actualitzem l'estat
      if (eventTime < quarterStart) {
        isOnCourt = event.type === "IN_TYPE";
        continue;
      }
      
      // Si l'event és dins del quart
      if (eventTime >= quarterStart && eventTime < quarterEnd) {
        if (event.type === "IN_TYPE") {
          return true; // Va entrar durant aquest quart
        }
        isOnCourt = event.type === "IN_TYPE";
      }
      
      // Si l'event és després del quart, parem
      if (eventTime >= quarterEnd) {
        break;
      }
    }
    
    // Si estava a pista abans del quart i no va sortir durant el quart
    return isOnCourt;
  };

  // Determinar si és capità
  const isCaptain = (player) => {
    return player.captain === true || player.isCaptain === true;
  };

  return (
    <div className="basic-match-container">
      {/* BOXSCORE */}
      <div className="boxscore-section">
        <h2>📊 Boxscore</h2>
        <div className="boxscore-table-wrapper">
          <table className="boxscore-table">
            <thead>
              <tr>
                <th>Dorsal</th>
                <th>Nom del Jugador</th>
                <th>Minuts</th>
                <th>Punts</th>
                <th>TL</th>
                <th>T2</th>
                <th>T3</th>
                <th>REB</th>
                <th>AST</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => (
                <tr key={index} className={player.starting ? 'titular-row' : ''}>
                  <td className="dorsal-cell">{player.dorsal}</td>
                  <td className="player-name-cell">
                    {player.name} {isCaptain(player) && <span className="captain-badge">C</span>}
                  </td>
                  <td>{player.timePlayed?.toFixed(0) || 0}'</td>
                  <td className="points-cell">{player.data?.score || 0}</td>
                  <td>
                    {player.data?.shotsOfOneSuccessful || 0}/{player.data?.shotsOfOneAttempted || 0}
                  </td>
                  <td>
                    {player.data?.shotsOfTwoSuccessful || 0}/{player.data?.shotsOfTwoAttempted || 0}
                  </td>
                  <td>
                    {player.data?.shotsOfThreeSuccessful || 0}/{player.data?.shotsOfThreeAttempted || 0}
                  </td>
                  <td>{player.data?.totalRebounds || 0}</td>
                  <td>{player.data?.assists || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GRAELLA DE QUARTS */}
      <div className="quarters-grid-section">
        <h2>🕐 Entrades per Quart</h2>
        <div className="quarters-table-wrapper">
          <table className="quarters-table">
            <thead>
              <tr>
                <th className="player-column">Nom dels Jugadors</th>
                <th className="dorsal-column">Núm. del Jugador</th>
                {Array.from({ length: maxQuarters }, (_, i) => (
                  <th key={i} className="quarter-column">{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => {
                const isPlayerCaptain = isCaptain(player);
                return (
                  <tr key={index}>
                    <td className="player-name-cell-grid">
                      {player.name} {isPlayerCaptain && <span className="captain-badge">C</span>}
                    </td>
                    <td className="dorsal-cell-grid">{player.dorsal}</td>
                    {Array.from({ length: maxQuarters }, (_, quarterIndex) => {
                      const played = playedInQuarter(player, quarterIndex + 1);
                      return (
                        <td key={quarterIndex} className="quarter-cell">
                          {played ? (
                            <span className="played-mark">✕</span>
                          ) : (
                            <span className="not-played"></span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BasicMatchView;