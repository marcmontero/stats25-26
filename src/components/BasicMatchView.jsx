import React from 'react';
import './BasicMatchView.css';

// Categories de promoció: el marcador electrònic només registra el
// resultat per quart i, com a molt, d'on vénen els punts de l'equip
// (tirs de 2/3/lliures) — no hi ha dades individuals de cap jugador/a
// (ni punts, ni minuts, ni faltes), ni res de pista (quintets,
// rotacions, mapa de tirs). Per això aquesta vista només mostra el que
// de debò existeix, en comptes d'una taula de jugadores buida.

const DistributionBar = ({ label, teamName, distribution }) => {
  if (!distribution) return null;
  const t2 = distribution.t2?.distPts ?? 0;
  const t3 = distribution.t3?.distPts ?? 0;
  const ft = distribution.ft?.distPts ?? 0;

  return (
    <div className="dist-row">
      <div className="dist-row-header">
        <span className="dist-team-name">{teamName}</span>
      </div>
      <div className="dist-bar">
        {t2 > 0 && <div className="dist-segment dist-t2" style={{ width: `${t2}%` }} title={`Tirs de 2: ${t2}%`} />}
        {t3 > 0 && <div className="dist-segment dist-t3" style={{ width: `${t3}%` }} title={`Tirs de 3: ${t3}%`} />}
        {ft > 0 && <div className="dist-segment dist-ft" style={{ width: `${ft}%` }} title={`Tirs lliures: ${ft}%`} />}
      </div>
      <div className="dist-legend-values">
        <span><span className="dist-dot dist-t2" /> T2: {t2}%</span>
        <span><span className="dist-dot dist-t3" /> T3: {t3}%</span>
        <span><span className="dist-dot dist-ft" /> TL: {ft}%</span>
      </div>
    </div>
  );
};

const BasicMatchView = ({ match }) => {
  if (!match?.teams || match.teams.length < 2) {
    return <p className="empty-state">No hi ha dades disponibles</p>;
  }

  const [teamA, teamB] = match.teams;
  const periods = match.periods || [];
  const hasDistribution = teamA.scoringDistribution || teamB.scoringDistribution;

  return (
    <div className="basic-match-container">
      {periods.length > 0 && (
        <div className="periods-section">
          <h2>Resultat per quart</h2>
          <div className="periods-table-wrapper">
            <table className="periods-table">
              <thead>
                <tr>
                  <th className="col-team-name"></th>
                  {periods.map((p) => (
                    <th key={p.period}>Q{p.period}</th>
                  ))}
                  <th className="col-total">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="col-team-name">{teamA.name}</td>
                  {periods.map((p) => (
                    <td key={p.period}>{p.local}</td>
                  ))}
                  <td className="col-total">{periods.reduce((s, p) => s + p.local, 0)}</td>
                </tr>
                <tr>
                  <td className="col-team-name">{teamB.name}</td>
                  {periods.map((p) => (
                    <td key={p.period}>{p.visitor}</td>
                  ))}
                  <td className="col-total">{periods.reduce((s, p) => s + p.visitor, 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {hasDistribution && (
        <div className="distribution-section">
          <h2>D'on vénen els punts</h2>
          <p className="distribution-subtitle">Percentatge de punts de cada equip segons el tipus de tir.</p>
          <DistributionBar teamName={teamA.name} distribution={teamA.scoringDistribution} />
          <DistributionBar teamName={teamB.name} distribution={teamB.scoringDistribution} />
        </div>
      )}

      <p className="basic-match-note">
        Aquesta categoria no té estadístiques individuals disponibles (ni punts, ni minuts, ni
        faltes per jugador/a) — l'acta digital d'aquest nivell només recull el resultat i el
        repartiment de punts de l'equip.
      </p>
    </div>
  );
};

export default BasicMatchView;
