import React from 'react';

const PlayerCard = ({ player }) => {
  return (
    <div className="player-card">
      <h2>{player.name} <span className="dorsal">#{player.dorsal}</span></h2>
      
      <div className="stats">
        <p><strong>Minuts:</strong> <span className="stat-value">{player.timePlayed}</span></p>
        <p><strong>Puntos:</strong> <span className="stat-value highlight">{player.data.score}</span></p>
        <p><strong>TL:</strong> <span className="stat-value">{player.data.shotsOfOneSuccessful}/{player.data.shotsOfOneAttempted}</span></p>
        <p><strong>T2:</strong> <span className="stat-value">{player.data.shotsOfTwoSuccessful}</span></p>
        <p><strong>T3:</strong> <span className="stat-value">{player.data.shotsOfThreeSuccessful}</span></p>
        <p>
          <strong>Més/Menys:</strong> 
          <span className={`stat-value plus-minus ${player.inOut < 0 ? "negative" : "positive"}`}>
            {player.inOut}
          </span>
        </p>
      </div>
    </div>
  );
};

export default PlayerCard;
