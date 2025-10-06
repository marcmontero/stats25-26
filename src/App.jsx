import React, { useEffect, useState } from 'react';
import { fetchStats } from './api/fechStats.js';
import PlayerList from './components/playerList.jsx';
import MatchSelector from './components/matchSelector.jsx';
import QuintetList from './components/QuintetList.jsx';
import { getQuintetStats } from './utils/QuintetStats.jsx';
import StatsTable from "./components/StatsTables.jsx";
import PlayerStatsByMatch from "./components/PlayerStatsByMatch.jsx";
import './App.css';

// Configuración de equipos con sus URLs
const TEAMS_CONFIG = {
  'senior-a-masc': {
    name: 'SENIOR A MASC',
    icon: '🏀',
    color: '#007bff',
    keywords: ['badalones', 'corbacho'],
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68d837bf74669700015de350?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e2a8ac1c33a20001316262?currentSeason=true'
    ]
  },
  'senior-fem': {
    name: 'SENIOR FEM',
    icon: '🏀',
    color: '#e83e8b',
    keywords: ['badalones', 'corbacho'],
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68d92b028c9c3a0001345470?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e2bd419163a800012e059a?currentSeason=true'
    ]
  },
  'senior-b-masc': {
    name: 'SENIOR B MASC',
    icon: '🏀',
    color: '#28a745',
    keywords: ['badalones', 'corbacho'],
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68d96f2574669700015e123d?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e1732f1c33a200013122ab?currentSeason=true'
  
    ]
  },
  'senior-c-masc': {
    name: 'SENIOR C MASC',
    icon: '🏀',
    color: '#17a2b8',
    keywords: ['badalones', 'corbacho'],
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68d9554874669700015e0a3f?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e1416d9163a800012d9bdf?currentSeason=true'
    ]
  },
  'u20-masc': {
    name: 'U20 MASC',
    icon: '🏀',
    color: '#ffc107',
    keywords: ['badalones', 'corbacho'],
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68d977198c9c3a000134679d?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e15c079163a800012da843?currentSeason=true'
    ]
  },
  'cadet-a-masc': {
    name: 'CADET A MASC',
    icon: '🏀',
    color: '#6f42c1',
    keywords: ['badalones', 'corbacho'],
    urls: [
      // Añadir URLs aquí
    ]
  },
  'cadet-b-masc': {
    name: 'CADET B MASC',
    icon: '🏀',
    color: '#fd7e14',
    keywords: ['badalones', 'corbacho'],
    urls: [
      // Añadir URLs aquí
    ]
  }
};

const App = () => {
  // Estados para login
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Estados principales
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estados de visualización
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "1234") {
      setIsAuthenticated(true);
    } else {
      alert("Credenciales incorrectas");
    }
  };

  // Cargar datos del equipo seleccionado
  const handleSelectTeam = async (teamId) => {
    const team = TEAMS_CONFIG[teamId];
    
    if (team.urls.length === 0) {
      alert(`No hay partidos configurados para ${team.name}`);
      return;
    }

    setSelectedTeam(teamId);
    setLoading(true);
    setShowPlayerStats(false);
    setShowStats(false);
    setSelectedMatch(null);

    try {
      // Pasar las keywords del equipo al fetchStats
      const data = await fetchStats(team.urls, team.keywords);
      setMatches(data);
      console.log(`📊 ${data.length} partidos cargados para ${team.name}`);
    } catch (error) {
      console.error('Error al cargar equipo:', error);
      alert('Error al cargar los partidos');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToTeams = () => {
    setSelectedTeam(null);
    setSelectedMatch(null);
    setMatches([]);
    setShowPlayerStats(false);
    setShowStats(false);
  };

  const handleBackToMatches = () => {
    setSelectedMatch(null);
    setShowStats(false);
    setShowPlayerStats(false);
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
                placeholder="Escriu la contrasenya"
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

  // Pantalla de selección de equipos
  if (!selectedTeam) {
    return (
      <div className="app">
        <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>
          🏀 Estadístiques Basquet 2024-2025
        </h1>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          padding: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {Object.entries(TEAMS_CONFIG).map(([teamId, team]) => (
            <button
              key={teamId}
              onClick={() => handleSelectTeam(teamId)}
              disabled={team.urls.length === 0}
              style={{
                background: team.urls.length > 0 ? team.color : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                padding: '30px 20px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: team.urls.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => {
                if (team.urls.length > 0) {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
              }}
            >
              <span style={{ fontSize: '40px' }}>{team.icon}</span>
              <span>{team.name}</span>
              {team.urls.length > 0 ? (
                <span style={{ fontSize: '14px', opacity: 0.9 }}>
                  {team.urls.length} partits
                </span>
              ) : (
                <span style={{ fontSize: '12px', opacity: 0.7 }}>
                  Sense partits
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{
          marginTop: '40px',
          padding: '20px',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px'
        }}>
          💡 Per afegir partits, edita el fitxer <code>src/App.jsx</code> i afegeix les URLs a l'equip corresponent
        </div>
      </div>
    );
  }

  // Vista del equipo seleccionado
  const currentTeam = TEAMS_CONFIG[selectedTeam];

  if (loading) {
    return (
      <div className="app">
        <h1>Carregant {currentTeam.name}...</h1>
        <div style={{ textAlign: 'center', padding: '50px', fontSize: '48px' }}>
          ⏳
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header con navegación */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        marginBottom: '20px',
        background: currentTeam.color,
        color: 'white',
        borderRadius: '10px'
      }}>
        <button
          onClick={handleBackToTeams}
          style={{
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '2px solid white',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          ← Tornar a Equips
        </button>

        <h1 style={{ margin: 0 }}>
          {currentTeam.icon} {currentTeam.name}
        </h1>

        <div style={{ width: '150px' }}></div> {/* Spacer para centrar el título */}
      </div>

      {/* Botones de opciones */}
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
          <button className="back-button" onClick={handleBackToMatches}>
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