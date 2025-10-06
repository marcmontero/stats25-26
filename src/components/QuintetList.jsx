import React from "react";
import "./QuintetList.css";

const QuintetList = ({ quintetStats }) => {
  return (
    <div className="quintet-list">
      <h2>Més/Menys per quintet</h2>
      {quintetStats.length > 0 ? (
        quintetStats.map((quintet, index) => (
          <div key={index} className={`quintet ${quintet.plusMinus >= 0 ? "positive" : "negative"}`}>
            <p>👥 <strong>Jugadores:</strong> {quintet.lineup.join(", ")}</p>
            <p>📈 <strong>Més/Menys:</strong> {quintet.plusMinus}</p>
          </div>
        ))
      ) : (
        <p>No hi ha dades dels quintets.</p>
      )}
    </div>
  );
};

export default QuintetList;
