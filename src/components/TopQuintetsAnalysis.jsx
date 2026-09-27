import React from "react";
import "./TopQuintetsAnalysis.css";
import "./PlayerList.css";
import { getTopQuintets } from "../utils/getTopQuintets.jsx";

// "MARC LLAMAS JORDAN" -> { first: "Marc", rest: "Llamas Jordan" }
const splitName = (fullName = "") => {
  const toTitleCase = (s) => s.charAt(0) + s.slice(1).toLowerCase();
  const words = fullName.trim().split(/\s+/).map(toTitleCase);
  return { first: words[0] || "", rest: words.slice(1).join(" ") };
};

const nameOf = (player) => (typeof player === "string" ? player : player.name);
const dorsalOf = (player) => (typeof player === "string" ? null : player.dorsal);

const QuintetRow = ({ quintet, rank, isBest }) => (
  <div className="quintet-row">
    <span className="quintet-rank">{rank}</span>
    <div className="quintet-players">
      {quintet.lineup.map((player, i) => {
        const { first, rest } = splitName(nameOf(player));
        const dorsal = dorsalOf(player);
        return (
          <div className="quintet-chip" key={i}>
            {dorsal !== null && <span className="quintet-chip-dorsal">{dorsal}</span>}
            <span className="quintet-chip-name">
              {first}
              <span className="quintet-chip-lastname">{rest}</span>
            </span>
          </div>
        );
      })}
    </div>
    <span className={`pm-pill quintet-pm ${quintet.plusMinus >= 0 ? "positive" : "negative"}`}>
      {quintet.plusMinus > 0 ? `+${quintet.plusMinus}` : quintet.plusMinus}
    </span>
    {isBest && <span className="best-tag">Millor balanç</span>}
  </div>
);

const TopQuintetsAnalysis = ({ matches }) => {
  const { best, worst } = getTopQuintets(matches);

  if (best.length === 0) {
    return (
      <div className="stats-card">
        <h3>Anàlisi de quintets de la temporada</h3>
        <p className="empty-state">
          Encara no hi ha prou dades de quintets acumulades per a aquest equip.
        </p>
      </div>
    );
  }

  return (
    <div className="top-quintets-container">
      <div className="quintets-summary">
        <div className="summary-card">
          <span className="summary-label">Quintets diferents</span>
          <span className="summary-value">{best.length + worst.length}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Partits analitzats</span>
          <span className="summary-value">{matches.length}</span>
        </div>
      </div>

      <div className="stats-card">
        <h3>Millors quintets</h3>
        <div className="quintets-list">
          {best.map((quintet, index) => (
            <QuintetRow key={index} quintet={quintet} rank={index + 1} isBest={index === 0} />
          ))}
        </div>
      </div>

      <div className="stats-card">
        <h3>Pitjors quintets</h3>
        <div className="quintets-list">
          {worst.map((quintet, index) => (
            <QuintetRow key={index} quintet={quintet} rank={index + 1} isBest={false} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopQuintetsAnalysis;
