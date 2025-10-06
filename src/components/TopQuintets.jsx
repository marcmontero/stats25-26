import React from "react";
import "./TopQuintets.css";

const TopQuintets = ({ topQuintets }) => {
  return (
    <div className="top-quintets">
      <h2>Millors Quintets</h2>
      {topQuintets.best.map((quintet, index) => (
        <div key={index} className="quintet positive">
          <p>👥 <strong>{quintet.lineup.join(", ")}</strong></p>
          <p>📈 <strong>Més/Menys:</strong> {quintet.plusMinus}</p>
        </div>
      ))}

      <h2>Pitjors Quintets</h2>
      {topQuintets.worst.map((quintet, index) => (
        <div key={index} className="quintet negative">
          <p>👥 <strong>{quintet.lineup.join(", ")}</strong></p>
          <p>📉 <strong>Més/Menys:</strong> {quintet.plusMinus}</p>
        </div>
      ))}
    </div>
  );
};

export default TopQuintets;
