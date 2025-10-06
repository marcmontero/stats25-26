import React, { useEffect, useState } from 'react';
import { fetchStats } from './api/fechStats.js';
import PlayerList from './components/playerList.jsx';
import MatchSelector from './components/matchSelector.jsx';
import QuintetList from './components/QuintetList.jsx';
import { getQuintetStats } from './utils/QuintetStats.jsx';
import StatsTable from "./components/StatsTables.jsx";
import TopQuintets from "./components/TopQuintets.jsx";
import PlayerStatsByMatch from "./components/PlayerStatsByMatch.jsx";
import './App.css';

const App = () => {
  const matchUrls = [
'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68d9717d8c9c3a000134658d?currentSeason=true',
'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e2bd419163a800012e059a?currentSeason=true'
]
  
  // Estados para login
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Otros estados de la app
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showTopQuintets, setShowTopQuintets] = useState(false);
  const [topQuintets, setTopQuintets] = useState({ best: [], worst: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función simple de autenticación (usuario: "admin", contraseña: "1234")
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "Ari" && password === "Cegata") {
      setIsAuthenticated(true);
    } else {
      alert("Credenciales incorrectas");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const getStats = async () => {
        try {
          const data = await fetchStats(matchUrls);
          setMatches(data);
          setTopQuintets(getTopQuintets(data));
          setLoading(false);
        } catch (error) {
          setError(error);
          setLoading(false);
        }
      };

      getStats();
    }
  }, [isAuthenticated]);

  const handleBack = () => {
    setSelectedMatch(null);
    setShowStats(false);
    setShowPlayerStats(false);
    setShowTopQuintets(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="login-wrapper">
        <div className="login-container">
          <h1>Inicia Sessió</h1>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Usuari</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Escriu el teu usuari"
              />
            </div>
            <div className="input-group">
              <label>Contrasenya</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Escriu la contrasenyaa"
              />
            </div>
            <button className="login-button" type="submit">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>Estadístiques Senior Fem Maristes 2025-2026</h1>

      {/* Mostrar botones de opciones solo si no se ha seleccionado un partido */}
      {!selectedMatch && (
        <div className="buttons-container">
          <button className="stats-button" onClick={() => setShowStats(!showStats)}>
            {showStats ? "❌ Ocultar mitjana stats" : "📊 Mostrar mitjana stats"}
          </button>

          <button className="player-stats-button" onClick={() => setShowPlayerStats(!showPlayerStats)}>
            {showPlayerStats ? "❌ Ocultar stats per jugadora" : "👤 Mostrar Stats per jugadora"}
          </button>
        </div>
      )}

      {/* Mostrar Stats Medias */}
      {showStats && <StatsTable matches={matches} />}

      {/* Mostrar Stats individuales por jugadora */}
      {showPlayerStats && <PlayerStatsByMatch matches={matches} />}

      {/* Mostrar selector de partidos o el partido seleccionado */}
      {!selectedMatch ? (
        <MatchSelector matches={matches} onSelectMatch={setSelectedMatch} />
      ) : (
        <>
          <div className="match-title-container">
            <h2>{selectedMatch?.matchResult}</h2>
          </div>
          <button className="back-button" onClick={handleBack}>
            🔙 Volver a Partidos
          </button>
          <PlayerList players={selectedMatch.players} />
          <QuintetList quintetStats={getQuintetStats(selectedMatch)} />
        </>
      )}
    </div>
  );
};

export default App;
