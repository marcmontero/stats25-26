import React, { useState } from 'react';
import { fetchStats } from './api/fechStats.js';
import PlayerList from './components/playerList.jsx';
import MatchSelector from './components/matchSelector.jsx';
import QuintetList from './components/QuintetList.jsx';
import BasicMatchView from './components/BasicMatchView.jsx';
import { getQuintetStats } from './utils/QuintetStats.jsx';
import StatsTable from "./components/StatsTables.jsx";
import PlayerStatsByMatch from "./components/PlayerStatsByMatch.jsx";
import PlayerEvolutionCharts from "./components/PlayerEvolutionCharts.jsx";
import TopQuintetsAnalysis from "./components/TopQuintetsAnalysis.jsx";
import ExportReports from "./components/ExportReports.jsx";
import './App.css';

//imports imgs
import funtaimg from "../public/img/funtane.png";
import juliimg from "../public/img/juli.png";
import teixidoimg from "../public/img/teixido.png";
import entrenaimg from "../public/img/entrena.png";
import manelimg from "../public/img/manel.png";
import aleximg from "../public/img/alex.png";


// Importar imatges de perfil (si estan a src/img/)
// Si les imatges NO existeixen, comenta aquestes línies


// ========== CONFIGURACIÓ D'USUARIS I PERMISOS ==========
const USERS_CONFIG = {
  'uri.entrena': {
    password: 'uri2025',
    name: 'Uri Entrena',
    role: 'admin',
    position: 'Director Tècnic',
    profileImage: entrenaimg, // Importada des de src/img/
    teams: 'all'
  },
  'juli.jimenez': {
    password: 'juli2025',
    name: 'Juli Jimenez',
    role: 'coach',
    position: 'Entrenador Senior A Masculí',
    profileImage: juliimg,
    teams: ['senior-a-masc', 'senior-b-masc']
  },
  'lluis.carreras': {
    password: 'lluis2025',
    name: 'Lluis Carreras',
    role: 'coach',
    position: 'Ajudant Senior A Masculí',
    profileImage: "",
    teams: ['senior-a-masc', 'senior-b-masc']
  },
  'manel.padilla': {
    password: 'manel2025',
    name: 'Manel Padilla',
    role: 'coach',
    position: 'Entrenador Senior Femení, U20 Masculí i Cadet A Masculí',
    profileImage: manelimg,
    teams: ['senior-c-masc', 'u20-masc', 'senior-fem', 'cadet-a-masc']
  },
  'marc.funtane': {
    password: 'marc2025',
    name: 'Marc Funtané',
    role: 'coach',
    position: 'Entrenador Senior B Masculí',
    profileImage: funtaimg,
    teams: ['senior-a-masc', 'senior-b-masc', 'senior-c-masc']
  },
  'jordi.serra': {
    password: 'jordi2025',
    name: 'Jordi Serra',
    role: 'coach',
    position: 'Ajudant Senior B Masculí i Senior C Masculí',
    profileImage: '',
    teams: ['senior-a-masc', 'senior-b-masc', 'senior-c-masc', 'u20-masc']
  },
  'carles.teixido': {
    password: 'carles2025',
    name: 'Carles Teixidó',
    role: 'coach',
    position: 'Entrenador Senior C Masculí',
    profileImage: teixidoimg,
    teams: ['senior-b-masc', 'senior-c-masc', 'u20-masc']
  },
  'alex.medialdea': {
    password: 'alex2025',
    name: 'Alex Medialdea',
    role: 'coach',
    position: 'Entrenador Cadet B Masculí',
    profileImage: aleximg,
    teams: ['cadet-b-masc']
  }
};

const TEAMS_CONFIG = {
  'senior-a-masc': {
    name: 'Senior A Masculí',
    icon: '🏀',
    keywords: ['badalones', 'corbacho'],
    statsType: 'advanced', // Stats completes amb quintets
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68d837bf74669700015de350?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e2a8ac1c33a20001316262?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchMoves/68eaad84891381000122f075?currentSeason=true'
    ]
  },
  'senior-fem': {
    name: 'Senior Femení',
    icon: '🏀',
    keywords: ['badalones', 'corbacho'],
    statsType: 'advanced',
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68d92b028c9c3a0001345470?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e2bd419163a800012e059a?currentSeason=true'
    ]
  },
  'senior-b-masc': {
    name: 'Senior B Masculí',
    icon: '🏀',
    keywords: ['badalones', 'corbacho'],
    statsType: 'advanced',
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68d96f2574669700015e123d?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e1732f1c33a200013122ab?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchMoves/68ebe3fc941d0d00012ab2a6?currentSeason=true'
    ]
  },
  'senior-c-masc': {
    name: 'Senior C Masculí',
    icon: '🏀',
    keywords: ['badalones', 'corbacho'],
    statsType: 'advanced',
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68d9554874669700015e0a3f?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e1416d9163a800012d9bdf?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchMoves/68ebca032ea75e0001d073d7?currentSeason=true'
    ]
  },
  'u20-masc': {
    name: 'U20 Masculí',
    icon: '🏀',
    keywords: ['badalones', 'corbacho'],
    statsType: 'advanced',
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68d977198c9c3a000134679d?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e15c079163a800012da843?currentSeason=true'
    ]
  },
  'cadet-a-masc': {
    name: 'Cadet A Masculí',
    icon: '🏀',
    keywords: ['badalones', 'corbacho'],
    statsType: 'advanced',
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e109131c33a2000130eb71?currentSeason=true'
    ]
  },
  'cadet-b-masc': {
    name: 'Cadet B Masculí',
    icon: '🏀',
    keywords: ['badalones', 'corbacho'],
    statsType: 'advanced',
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e2464d1c33a20001313d9d?currentSeason=true'
    ]
  },
  'infantil-fem': {
    name: 'Infantil Femení',
    icon: '🏀',
    keywords: ['badalones', 'corbacho'],
    statsType: 'basic', // Stats simplificades per categories de base
    urls: []
  },
  'preinfantil-masc': {
    name: 'Preinfantil Masculí',
    icon: '⛹️',
    keywords: ['badalones', 'corbacho'],
    statsType: 'basic',
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e0f1e19163a800012d6fe2?currentSeason=true'
    ]
  },
  'mini-negre-fem': {
    name: 'Mini Negre Femení',
    icon: '🏀',
    keywords: ['badalones', 'corbacho'],
    statsType: 'basic',
    urls: []
  },
  'mini-vermell-fem': {
    name: 'Mini Vermell Femení',
    icon: '🏀',
    keywords: ['badalones', 'corbacho'],
    statsType: 'basic',
    urls: []
  },
  'mini-masc': {
    name: 'Mini Masculí',
    icon: '⛹️',
    keywords: ['badalones', 'corbacho'],
    statsType: 'basic',
    urls: []
  },
  'premini-negre-masc': {
    name: 'Pre-Mini Negre Masculí',
    icon: '🏀',
    keywords: ['badalones', 'corbacho'],
    statsType: 'basic',
    urls: []
  },
  'premini-vermell-masc': {
    name: 'Pre-Mini Vermell Masculí',
    icon: '🏀',
    keywords: ['badalones', 'corbacho'],
    statsType: 'basic',
    urls: []
  },
  'premini-fem': {
    name: 'Pre-Mini Femení',
    icon: '⛹️',
    keywords: ['badalones', 'corbacho'],
    statsType: 'basic',
    urls: []
  }
};

const App = () => {
  // Estats d'autenticació
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Estats de l'aplicació
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showEvolution, setShowEvolution] = useState(false);
  const [showTopQuintets, setShowTopQuintets] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // ========== EFECTE PER RECUPERAR SESSIÓ ==========
  React.useEffect(() => {
    const savedUser = localStorage.getItem('badalones_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setIsAuthenticated(true);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error al recuperar sessió:', error);
        localStorage.removeItem('badalones_user');
      }
    }
  }, []);

  // ========== FUNCIONS D'AUTENTICACIÓ ==========
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError("");

    const user = USERS_CONFIG[username.toLowerCase().trim()];

    if (user && user.password === password) {
      const userData = {
        username: username.toLowerCase().trim(),
        name: user.name,
        role: user.role,
        position: user.position,
        profileImage: user.profileImage,
        teams: user.teams
      };
      
      setIsAuthenticated(true);
      setCurrentUser(userData);
      
      // Guardar a localStorage si l'usuari ha marcat "Recordar-me"
      if (rememberMe) {
        localStorage.setItem('badalones_user', JSON.stringify(userData));
      }
    } else {
      setLoginError("Usuari o contrasenya incorrectes");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUsername("");
    setPassword("");
    setSelectedTeam(null);
    setSelectedMatch(null);
    setMatches([]);
    setShowPlayerStats(false);
    setShowStats(false);
    setShowEvolution(false);
    setShowTopQuintets(false);
    setShowExport(false);
    
    // Eliminar de localStorage
    localStorage.removeItem('badalones_user');
  };

  // ========== CONTROL D'ACCÉS ==========
  const hasAccessToTeam = (teamId) => {
    if (!currentUser) return false;
    if (currentUser.teams === 'all') return true;
    return currentUser.teams.includes(teamId);
  };

  const getAvailableTeams = () => {
    if (!currentUser) return {};
    if (currentUser.teams === 'all') return TEAMS_CONFIG;

    const availableTeams = {};
    currentUser.teams.forEach(teamId => {
      if (TEAMS_CONFIG[teamId]) {
        availableTeams[teamId] = TEAMS_CONFIG[teamId];
      }
    });
    return availableTeams;
  };

  // ========== HANDLERS ==========
  const handleSelectTeam = async (teamId) => {
    if (!hasAccessToTeam(teamId)) {
      alert('No tens accés a aquest equip');
      return;
    }

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
    setShowExport(false);
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
    setShowExport(false);
  };

  const handleBackToMatches = () => {
    setSelectedMatch(null);
    setShowStats(false);
    setShowPlayerStats(false);
    setShowEvolution(false);
    setShowTopQuintets(false);
    setShowExport(false);
  };

  // ========== PANTALLA DE LOGIN ==========
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
                onChange={(e) => {
                  setUsername(e.target.value);
                  setLoginError("");
                }}
                placeholder="nom.cognom"
                autoComplete="username"
              />
            </div>
            <div className="input-group">
              <label>Contrasenya</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError("");
                }}
                placeholder="Escriu la contrasenya"
                autoComplete="current-password"
              />
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '15px',
              marginBottom: '10px'
            }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: '#c41230'
                }}
              />
              <label 
                htmlFor="rememberMe"
                style={{
                  fontSize: '14px',
                  color: '#555',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Recordar la meva sessió
              </label>
            </div>
            {loginError && (
              <div style={{
                color: '#c41230',
                fontSize: '14px',
                marginTop: '10px',
                textAlign: 'center',
                fontWeight: '600'
              }}>
                {loginError}
              </div>
            )}
            <button className="login-button" type="submit">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  const availableTeams = getAvailableTeams();

  // ========== PANTALLA DE SELECCIÓ D'EQUIPS ==========
  if (!selectedTeam) {
    return (
      <div className="app">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '15px 20px',
          background: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {currentUser.profileImage ? (
              <img 
                src={currentUser.profileImage} 
                alt={currentUser.name}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #c41230',
                  boxShadow: '0 2px 8px rgba(196, 18, 48, 0.3)'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #c41230 0%, #a00f26 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: '700',
                boxShadow: '0 2px 8px rgba(196, 18, 48, 0.3)'
              }}>
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>
                Benvingut, {currentUser.name}
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: '#666', 
                marginTop: '3px',
                lineHeight: '1.4'
              }}>
                {currentUser.position}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              background: '#c41230',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
          >
            Tancar Sessió
          </button>
        </div>

        <img 
          src="https://i.imghippo.com/files/XfcX1130LYo.png" 
          alt="AE Badalonès" 
          className="club-logo"
        />
        <h1>Estadístiques AE Badalonès 2025-2026</h1>
        <h2>#somDimonis</h2>
        
        <div className="teams-grid">
          {Object.entries(availableTeams).map(([teamId, team]) => (
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

        {Object.keys(availableTeams).length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            fontSize: '16px'
          }}>
            No tens accés a cap equip
          </div>
        )}
      </div>
    );
  }

  const currentTeam = TEAMS_CONFIG[selectedTeam];

  // ========== PANTALLA DE LOADING ==========
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

  // ========== PANTALLA PRINCIPAL AMB ESTADÍSTIQUES ==========
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
        <button
          onClick={handleLogout}
          className="team-header-button"
        >
          Tancar Sessió
        </button>
      </div>

      {!selectedMatch && (
        <div className="buttons-container">
          <h3 className="menu-title">Opcions d'Anàlisi</h3>
          <div className="menu-options">
            <button className="stats-button" onClick={() => setShowStats(!showStats)}>
              <span className="menu-icon">📊</span>
              <span>{showStats ? "Ocultar Mitjana Stats" : "Mitjana Stats"}</span>
            </button>

            <button className="player-stats-button" onClick={() => setShowPlayerStats(!showPlayerStats)}>
              <span className="menu-icon">👤</span>
              <span>{showPlayerStats ? "Ocultar Stats Jugadora" : "Stats per Jugadora"}</span>
            </button>

            <button className="stats-button" onClick={() => setShowEvolution(!showEvolution)}>
              <span className="menu-icon">📈</span>
              <span>{showEvolution ? "Ocultar Gràfics" : "Gràfics d'Evolució"}</span>
            </button>

            {/* Només mostrar Top Quintets per equips amb statsType 'advanced' */}
            {currentTeam.statsType === 'advanced' && (
              <button className="player-stats-button" onClick={() => setShowTopQuintets(!showTopQuintets)}>
                <span className="menu-icon">🏆</span>
                <span>{showTopQuintets ? "Ocultar Top Quintets" : "Top Quintets"}</span>
              </button>
            )}

            <button className="stats-button" onClick={() => setShowExport(!showExport)}>
              <span className="menu-icon">📥</span>
              <span>{showExport ? "Ocultar Exportació" : "Exportar Informes"}</span>
            </button>
          </div>
        </div>
      )}

      {showStats && <StatsTable matches={matches} />}
      {showPlayerStats && <PlayerStatsByMatch matches={matches} />}
      {showEvolution && <PlayerEvolutionCharts matches={matches} />}
      {showTopQuintets && currentTeam.statsType === 'advanced' && <TopQuintetsAnalysis matches={matches} />}
      {showExport && <ExportReports matches={matches} teamName={currentTeam.name} />}

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
          {currentTeam.statsType === 'advanced' && (
            <QuintetList quintetStats={getQuintetStats(selectedMatch)} />
          )}
        </>
      )}
    </div>
  );
};

export default App;