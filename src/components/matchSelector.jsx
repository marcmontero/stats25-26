import React from "react";
import "./matchSelector.css";

const MatchSelector = ({ matches, onSelectMatch }) => {
  // Función para formatear el nombre del equipo
  const formatTeamName = (name) => {
    if (!name) return "";
    return name.includes("CORBACHO") ? "Senior Fem" : name;
  };

  return (
    <div className="match-selector">
      <div className="button-container">
        {matches
          .sort((a, b) => new Date(a.date) - new Date(b.date)) // Ordenar por fecha
          .map((match, index) => {
            const localTeam = formatTeamName(match.teamA?.name);
            const awayTeam = formatTeamName(match.teamB?.name);
            const matchResult = match.matchResult || "Resultado Desconocido";

            return (
              <button key={match.matchId} className="match-button" onClick={() => onSelectMatch(match)}>
                <span className="match-day">Jornada {index + 1}</span>
                <span className="team-name">{localTeam}</span>
                <span className="match-result">{matchResult}</span>
                <span className="team-name">{awayTeam}</span>
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default MatchSelector;
