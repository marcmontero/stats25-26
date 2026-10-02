import React from "react";
import "./matchSelector.css";

const MatchSelector = ({ matches, onSelectMatch }) => {
  return (
    <div className="match-selector">
      <div className="button-container">
        {matches
          .sort((a, b) => new Date(a.date) - new Date(b.date)) // Ordenar per data
          .map((match, index) => {
            const ownIsTeamA = match.teamA?.teamIdIntern === match.idTeam;
            const opponent = ownIsTeamA ? match.teamB?.name : match.teamA?.name;
            const matchResult = match.matchResult || "Resultat desconegut";

            return (
              <button key={match.matchId} className="match-button" onClick={() => onSelectMatch(match)}>
                <span className="match-day">Jornada {index + 1}</span>
                {match.category && <span className="team-name">{match.category}</span>}
                <span className="match-result">{matchResult}</span>
                {opponent && <span className="team-name">vs {opponent}</span>}
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default MatchSelector;
