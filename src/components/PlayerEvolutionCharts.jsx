import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./PlayerEvolutionCharts.css";

const PlayerEvolutionCharts = ({ matches }) => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState("points");

  // Obtener lista de jugadoras únicas
  const playersList = Array.from(
    new Set(matches.flatMap(match => match.players.map(player => player.name)))
  );

  // Preparar datos para la jugadora seleccionada
  const getPlayerData = () => {
    if (!selectedPlayer) return [];

    return matches.map((match, index) => {
      const playerData = match.players.find(p => p.name === selectedPlayer);
      
      return {
        jornada: `J${index + 1}`,
        puntos: playerData?.data?.score || 0,
        minutos: playerData?.timePlayed || 0,
        tl: playerData?.data?.shotsOfOneSuccessful || 0,
        t2: playerData?.data?.shootingOfTwoSuccessfulPoint?.length || 0,
        t3: playerData?.data?.shootingOfThreeSuccessfulPoint?.length || 0,
        plusMinus: playerData?.inOut || 0,
        plusMinusPerMin: playerData?.timePlayed > 0 
          ? (playerData.inOut / playerData.timePlayed).toFixed(2) 
          : 0,
      };
    });
  };

  const data = getPlayerData();

  const metrics = {
    points: { label: "Punts per Partit", dataKey: "puntos", color: "#c41230" },
    minutes: { label: "Minuts Jugats", dataKey: "minutos", color: "#1a1a1a" },
    plusMinus: { label: "Més/Menys", dataKey: "plusMinus", color: "#28a745" },
    plusMinusPerMin: { label: "±/Min", dataKey: "plusMinusPerMin", color: "#007bff" },
    tl: { label: "Tirs Lliures Anotats", dataKey: "tl", color: "#fd7e14" },
    t2: { label: "Tirs de 2 Anotats", dataKey: "t2", color: "#6f42c1" },
    t3: { label: "Triples Anotats", dataKey: "t3", color: "#e83e8b" },
  };

  const currentMetric = metrics[selectedMetric];

  return (
    <div className="evolution-charts-container">
      <h2>Gràfics d'Evolució</h2>

      <div className="charts-controls">
        <div className="control-group">
          <label>Selecciona una Jugadora:</label>
          <select onChange={(e) => setSelectedPlayer(e.target.value)} value={selectedPlayer || ""}>
            <option value="">-- Seleccionar --</option>
            {playersList.map((player, index) => (
              <option key={index} value={player}>
                {player}
              </option>
            ))}
          </select>
        </div>

        {selectedPlayer && (
          <div className="control-group">
            <label>Mètrica:</label>
            <select onChange={(e) => setSelectedMetric(e.target.value)} value={selectedMetric}>
              <option value="points">Punts</option>
              <option value="minutes">Minuts</option>
              <option value="plusMinus">Més/Menys</option>
              <option value="plusMinusPerMin">±/Min</option>
              <option value="tl">Tirs Lliures</option>
              <option value="t2">Tirs de 2</option>
              <option value="t3">Triples</option>
            </select>
          </div>
        )}
      </div>

      {selectedPlayer && data.length > 0 && (
        <div className="chart-wrapper">
          <h3>{currentMetric.label}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="jornada" 
                stroke="#666"
                style={{ fontSize: '13px' }}
              />
              <YAxis 
                stroke="#666"
                style={{ fontSize: '13px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '2px solid #c41230',
                  borderRadius: '8px',
                  padding: '10px'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Line 
                type="monotone" 
                dataKey={currentMetric.dataKey}
                name={currentMetric.label}
                stroke={currentMetric.color}
                strokeWidth={3}
                dot={{ fill: currentMetric.color, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Estadísticas resumidas */}
          <div className="stats-summary">
            <div className="stat-card">
              <span className="stat-label">Mitjana</span>
              <span className="stat-value">
                {(data.reduce((sum, d) => sum + Number(d[currentMetric.dataKey]), 0) / data.length).toFixed(2)}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Màxim</span>
              <span className="stat-value">
                {Math.max(...data.map(d => Number(d[currentMetric.dataKey])))}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Mínim</span>
              <span className="stat-value">
                {Math.min(...data.map(d => Number(d[currentMetric.dataKey])))}
              </span>
            </div>
          </div>
        </div>
      )}

      {!selectedPlayer && (
        <div className="empty-state">
          <p>Selecciona una jugadora per veure la seva evolució</p>
        </div>
      )}
    </div>
  );
};

export default PlayerEvolutionCharts;