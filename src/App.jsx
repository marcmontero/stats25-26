import React, { useState } from 'react';
import { fetchStats } from './api/fechStats.js';
import PlayerList from './components/playerList.jsx';
import MatchSelector from './components/matchSelector.jsx';
import QuintetList from './components/QuintetList.jsx';
import { getQuintetStats } from './utils/QuintetStats.jsx';
import StatsTable from "./components/StatsTables.jsx";
import PlayerStatsByMatch from "./components/PlayerStatsByMatch.jsx";
import PlayerEvolutionCharts from "./components/PlayerEvolutionCharts.jsx";
import TopQuintetsAnalysis from "./components/TopQuintetsAnalysis.jsx";
import './App.css';

const TEAMS_CONFIG = {
  'senior-a-masc': {
    name: 'Senior A Masculí',
    icon: '🏀',
    keywords: ['badalones', 'corbacho'],
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68d837bf74669700015de350?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e2a8ac1c33a20001316262?currentSeason=true'
    ]
  },
  'senior-fem': {
    name: 'Senior Femení',
    icon: '🏀',
    keywords: ['badalones', 'corbacho'],
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68d92b028c9c3a0001345470?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e2bd419163a800012e059a?currentSeason=true'
    ]
  },
  'senior-b-masc': {
    name: 'Senior B Masculí',
    icon: '🏀',
    keywords: ['badalones', 'corbacho'],
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68d96f2574669700015e123d?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e1732f1c33a200013122ab?currentSeason=true'
    ]
  },
  'senior-c-masc': {
    name: 'Senior C Masculí',
    icon: '🏀',
    keywords: ['badalones', 'corbacho'],
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68d9554874669700015e0a3f?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e1416d9163a800012d9bdf?currentSeason=true'
    ]
  },
  'u20-masc': {
    name: 'U20 Masculí',
    icon: '🏀',
    keywords: ['badalones', 'corbacho'],
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68d977198c9c3a000134679d?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e15c079163a800012da843?currentSeason=true'
    ]
  },
  'cadet-a-masc': {
    name: 'Cadet A Masculí',
    icon: '🏀',
    keywords: ['badalones', 'corbacho'],
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e109131c33a2000130eb71?currentSeason=true'
    ]
  },
  'cadet-b-masc': {
    name: 'Cadet B Masculí',
    icon: '🏀',
    keywords: ['badalones', 'corbacho'],
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e2464d1c33a20001313d9d?currentSeason=true'
    ]
  }
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showEvolution, setShowEvolution] = useState(false);
  const [showTopQuintets, setShowTopQuintets] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "1234") {
      setIsAuthenticated(true);
    } else {
      alert("Credencials incorrectes");
    }
  };

  const handleSelectTeam = async (teamId) => {
    const team = TEAMS_CONFIG[teamId];
    
    if (team.urls.length === 0) {
      alert(`No hi ha partits configurats per ${team.name}`);
      return;
    }

    setSelectedTeam(teamId);
    setLoading(true);
    setShowPlayerStats(false);
    setShowStats(false);
    setShowEvolution(false);
    setShowTopQuintets(false);
    setSelectedMatch(null);

    try {
      const data = await fetchStats(team.urls, team.keywords);
      setMatches(data);
      console.log(`📊 ${data.length} partits carregats per ${team.name}`);
    } catch (error) {
      console.error('Error al carregar equip:', error);
      alert('Error al carregar els partits');
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
    setShowEvolution(false);
    setShowTopQuintets(false);
  };

  const handleBackToMatches = () => {
    setSelectedMatch(null);
    setShowStats(false);
    setShowPlayerStats(false);
    setShowEvolution(false);
    setShowTopQuintets(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="login-wrapper">
        <div className="login-container">
          <img 
            src="https://i.imghippo.com/files/XfcX1130LYo.png" 
            alt="AE Badalonès" 
            className="club-logo"
          />
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

  if (!selectedTeam) {
    return (
      <div className="app">
        <img 
          src="https://i.imghippo.com/files/XfcX1130LYo.png" 
          alt="AE Badalonès" 
          className="club-logo"
        />
        <h1>Estadístiques AE Badalonès 2024-2025</h1>
        
        <div className="teams-grid">
          {Object.entries(TEAMS_CONFIG).map(([teamId, team]) => (
            <button
              key={teamId}
              onClick={() => handleSelectTeam(teamId)}
              disabled={team.urls.length === 0}
              className="team-card"
            >
              <span className="team-card-icon">{team.icon}</span>
              <span className="team-card-name">{team.name}</span>
              {team.urls.length > 0 ? (
                <span className="team-card-matches">
                  {team.urls.length} {team.urls.length === 1 ? 'partit' : 'partits'}
                </span>
              ) : (
                <span className="team-card-matches" style={{ color: '#999' }}>
                  Sense partits
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentTeam = TEAMS_CONFIG[selectedTeam];

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2 className="loading-text">Carregant {currentTeam.name}...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="team-header">
        <button onClick={handleBackToTeams} className="team-header-button">
          Tornar a Equips
        </button>
        <h1 className="team-header-title">
          <img 
            src="https://i.imghippo.com/files/Wnel8089NE.png" 
            alt="AE Badalonès" 
            className="team-logo"
          />
          {currentTeam.name}
        </h1>
        <div className="team-header-spacer"></div>
      </div>

      {!selectedMatch && (
        <div className="buttons-container">
          <button className="stats-button" onClick={() => setShowStats(!showStats)}>
            {showStats ? "Ocultar Mitjana Stats" : "Mostrar Mitjana Stats"}
          </button>

          <button className="player-stats-button" onClick={() => setShowPlayerStats(!showPlayerStats)}>
            {showPlayerStats ? "Ocultar Stats per Jugadora" : "Mostrar Stats per Jugadora"}
          </button>

          <button className="stats-button" onClick={() => setShowEvolution(!showEvolution)}>
            {showEvolution ? "Ocultar Gràfics" : "Mostrar Gràfics d'Evolució"}
          </button>

          <button className="player-stats-button" onClick={() => setShowTopQuintets(!showTopQuintets)}>
            {showTopQuintets ? "Ocultar Top Quintets" : "Mostrar Top Quintets"}
          </button>
        </div>
      )}

      {showStats && <StatsTable matches={matches} />}
      {showPlayerStats && <PlayerStatsByMatch matches={matches} />}
      {showEvolution && <PlayerEvolutionCharts matches={matches} />}
      {showTopQuintets && <TopQuintetsAnalysis matches={matches} />}

      {!selectedMatch ? (
        <MatchSelector matches={matches} onSelectMatch={setSelectedMatch} />
      ) : (
        <>
          <div className="match-title-container">
            <h2>{selectedMatch?.matchResult}</h2>
          </div>
          <button className="back-button" onClick={handleBackToMatches}>
            Tornar a Partits
          </button>
          <PlayerList players={selectedMatch.players} />
          <QuintetList quintetStats={getQuintetStats(selectedMatch)} />
        </>
      )}
    </div>
  );
};

export default App;