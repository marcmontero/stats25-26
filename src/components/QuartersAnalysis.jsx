import React from "react";
import "./QuartersAnalysis.css";

const QuartersAnalysis = ({ match }) => {
  if (!match || !match.score || !match.teams) {
    return <p>No hi ha dades disponibles per analitzar els quarts</p>;
  }

  const { score, teams, localId, visitId } = match;

  // Identificar quin equip som (Badalonès)
  const ourTeam = teams.find(team => 
    team.name.toLowerCase().includes('badalon') || 
    team.name.toLowerCase().includes('corbacho')
  );

  if (!ourTeam) {
    console.warn('No s\'ha pogut identificar l\'equip del Badalonès');
    return <p>No s'ha pogut identificar l'equip</p>;
  }

  const isLocalTeam = ourTeam.teamIdIntern === localId;

  // Funció per obtenir la puntuació en un moment determinat
  const getScoreAtTime = (time) => {
    const sortedScore = [...score].sort((a, b) => 
      (a.minuteAbsolute || 0) - (b.minuteAbsolute || 0)
    );

    let lastScore = { local: 0, visit: 0 };
    for (const event of sortedScore) {
      if ((event.minuteAbsolute || 0) <= time) {
        lastScore = { local: event.local, visit: event.visit };
      } else {
        break;
      }
    }

    return lastScore;
  };

  // Funció per obtenir jugadores en pista durant un quart
  const getPlayersInQuarter = (quarterNumber) => {
    const quarterStart = (quarterNumber - 1) * 6;
    const quarterEnd = quarterNumber * 6;

    const playersOnCourt = ourTeam.players.filter(player => {
      if (!player.inOutsList || player.inOutsList.length === 0) return false;

      const sortedEvents = [...player.inOutsList].sort((a, b) => 
        (a.minuteAbsolut || 0) - (b.minuteAbsolut || 0)
      );

      let isOnCourt = false;

      for (const event of sortedEvents) {
        const eventTime = event.minuteAbsolut || 0;

        if (eventTime < quarterStart) {
          isOnCourt = event.type === "IN_TYPE";
          continue;
        }

        if (eventTime >= quarterStart && eventTime < quarterEnd) {
          if (event.type === "IN_TYPE") {
            return true;
          }
          isOnCourt = event.type === "IN_TYPE";
        }

        if (eventTime >= quarterEnd) {
          break;
        }
      }

      return isOnCourt;
    });

    return playersOnCourt.sort((a, b) => {
      const dorsalA = parseInt(a.dorsal) || 999;
      const dorsalB = parseInt(b.dorsal) || 999;
      return dorsalA - dorsalB;
    });
  };

  // Funció per calcular el +/- d'un quart
  const getQuarterPlusMinus = (quarterNumber) => {
    const quarterStart = (quarterNumber - 1) * 6;
    const quarterEnd = quarterNumber * 6;

    const startScore = getScoreAtTime(quarterStart);
    const endScore = getScoreAtTime(quarterEnd);

    const ourPointsStart = isLocalTeam ? startScore.local : startScore.visit;
    const oppPointsStart = isLocalTeam ? startScore.visit : startScore.local;
    const ourPointsEnd = isLocalTeam ? endScore.local : endScore.visit;
    const oppPointsEnd = isLocalTeam ? endScore.visit : endScore.local;

    const ourPoints = ourPointsEnd - ourPointsStart;
    const opponentPoints = oppPointsEnd - oppPointsStart;
    const plusMinus = ourPoints - opponentPoints;

    return {
      ourPoints,
      opponentPoints,
      plusMinus
    };
  };

  // Generar dades per tots els 8 quarts
  const quartersData = [];
  for (let i = 1; i <= 8; i++) {
    const players = getPlayersInQuarter(i);
    const stats = getQuarterPlusMinus(i);
    
    quartersData.push({
      quarter: i,
      players,
      ...stats
    });
  }

  // Calcular estadístiques globals
  const bestQuarter = quartersData.reduce((best, current) => 
    current.plusMinus > best.plusMinus ? current : best
  );
  
  const worstQuarter = quartersData.reduce((worst, current) => 
    current.plusMinus < worst.plusMinus ? current : worst
  );

  const totalPoints = quartersData.reduce((sum, q) => sum + q.ourPoints, 0);
  const totalOpponentPoints = quartersData.reduce((sum, q) => sum + q.opponentPoints, 0);

  return (
    <div className="quarters-analysis-container">
      <h2>Anàlisi per Quarts</h2>

      {/* Resum superior */}
      <div className="quarters-summary-top">
        <div className="summary-row">
          <div className="summary-item">
            <span className="summary-item-label">Millor Quart</span>
            <span className={`summary-item-value ${bestQuarter.plusMinus >= 0 ? 'positive' : 'negative'}`}>
              Q{bestQuarter.quarter} ({bestQuarter.plusMinus > 0 ? '+' : ''}{bestQuarter.plusMinus})
            </span>
          </div>
          
          <div className="summary-divider"></div>
          
          <div className="summary-item">
            <span className="summary-item-label">Pitjor Quart</span>
            <span className={`summary-item-value ${worstQuarter.plusMinus >= 0 ? 'positive' : 'negative'}`}>
              Q{worstQuarter.quarter} ({worstQuarter.plusMinus > 0 ? '+' : ''}{worstQuarter.plusMinus})
            </span>
          </div>
          
          <div className="summary-divider"></div>
          
          <div className="summary-item">
            <span className="summary-item-label">Total Punts</span>
            <span className="summary-item-value">
              {totalPoints} - {totalOpponentPoints}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de 8 quarts */}
      <div className="quarters-grid">
        {quartersData.map((quarter) => (
          <div key={quarter.quarter} className="quarter-card">
            {/* Header amb número de quart i puntuació */}
            <div className="quarter-header">
              <h3>Quart {quarter.quarter}</h3>
              <span className={`quarter-score ${quarter.plusMinus >= 0 ? 'positive' : 'negative'}`}>
                {quarter.ourPoints} - {quarter.opponentPoints}
              </span>
            </div>

            {/* Més/Menys del quart */}
            <div className="quarter-plus-minus">
              <span className="pm-icon">{quarter.plusMinus >= 0 ? '📈' : '📉'}</span>
              <span className={`pm-value ${quarter.plusMinus >= 0 ? 'positive' : 'negative'}`}>
                {quarter.plusMinus > 0 ? '+' : ''}{quarter.plusMinus}
              </span>
            </div>

            {/* Jugadores en pista */}
            <div className="quarter-players">
              <h4>{quarter.players.length} {quarter.players.length === 1 ? 'Jugadora' : 'Jugadores'} a pista:</h4>
              <div className="players-list">
                {quarter.players.length > 0 ? (
                  quarter.players.map((player, idx) => (
                    <span key={idx} className="player-badge-quarter">
                      <span className="player-dorsal-badge">{player.dorsal}</span>
                      <span className="player-name-badge">{player.name.split(' ')[0]}</span>
                    </span>
                  ))
                ) : (
                  <span className="no-players">Sense dades</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuartersAnalysis;