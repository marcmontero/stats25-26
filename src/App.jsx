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
import QuartersAnalysis from './components/QuartersAnalysis.jsx';
import { supabase, usernameToInternalEmail } from './supabaseClient.js';
import './App.css';

//imports imgs
import funtaimg from "../public/img/funtane.png";
import entrenaimg from "../public/img/entrena.png";
import aleximg from "../public/img/alex.png";


// ========== FOTOS DE PERFIL (opcional per usuari; si no n'hi ha, ==========
// ========== es mostra un cercle amb la inicial del nom) ==========
const IMAGE_MAP = {
  'uri.entrena': entrenaimg,
  'marc.funtane': funtaimg,
  'alex.medialdea': aleximg,
};

const TEAMS_CONFIG = {
  'senior-a-masc': {
    name: 'Senior A Masculí',
    code: 'SR·A',
    keywords: ['badalones', 'corbacho'],
    statsType: 'advanced', // Stats completes amb quintets
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68d837bf74669700015de350?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e2a8ac1c33a20001316262?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68eaad84891381000122f075?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68f3f2c39ebdaf000182d13a?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68fd22f101d7c6000167d505?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/6910d6b3530d2e0001540b97?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/6918e1e05ac4ad0001771ed0?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/69236e1b5ac4ad0001792697?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/693eb6d14741c10001404c6a?currentSeason=true'
    ]
  },
  'senior-fem': {
    name: 'Senior Femení',
    code: 'SR·F',
    keywords: ['badalones', 'corbacho'],
    statsType: 'advanced',
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68d92b028c9c3a0001345470?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e2bd419163a800012e059a?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68ebf8ad2ea75e0001d08a0c?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68f53f7445422400012a0008?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68fe7fd21497f2000189152e?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/690f6bc9530d2e0001538e1e?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/691a2cdd5ac4ad0001778d7f?currentSeason=true'
    ]
  },
  'senior-b-masc': {
    name: 'Senior B Masculí',
    code: 'SR·B',
    keywords: ['badalones', 'corbacho'],
    statsType: 'advanced',
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68d96f2574669700015e123d?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e1732f1c33a200013122ab?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68ebe3fc941d0d00012ab2a6?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68f400f9104e420001aea222?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68fe665201d7c6000112137d?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/690f839c530d2e000153a090?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/691a14f1edca8300012f183f?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/69230a705ac4ad000178fe99?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/693d9412161a7100013846b3?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/69876a6ec7b83b000105ec41?currentSeason=true'
    ]
  },
  'senior-c-masc': {
    name: 'Senior C Masculí',
    code: 'SR·C',
    keywords: ['badalones', 'corbacho'],
    statsType: 'advanced',
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68d9554874669700015e0a3f?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e1416d9163a800012d9bdf?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68ebca032ea75e0001d073d7?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68fe4bf81497f2000188f646?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/690fa80cfa539d0001a23769?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/6918dc705ac4ad0001771baa?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/692335645ac4ad00017909b7?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/692b209f7c9e680001d52909?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/693f1dc94741c10001407163?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/6948371e42a2e200012f8bfe?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/6963d6fe2264680001925481?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/696bd38c252d140001bcd89f?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/697652682baa68000161d5c7?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/697f7fbf8386d90001a6fc49?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/6988eef8c7b83b0001067309?currentSeason=true'

    ]
  },
  'u25-masc': {
    name: 'U25 Masculí',
    code: 'U25',
    keywords: ['badalones', 'corbacho'],
    statsType: 'advanced',
    urls: []
  },
  'u20-masc': {
    name: 'U20 Masculí',
    code: 'U20',
    keywords: ['badalones', 'corbacho'],
    statsType: 'advanced',
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68d977198c9c3a000134679d?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e15c079163a800012da843?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68ebe3d2941d0d00012ab244?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68f3b15f104e420001ae7250?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68fe4f3901d7c600011207d9?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/6910c69f530d2e0001540422?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/691a1297edca8300012f171e?currentSeason=true'
    ]
  },
  'junior-masc': {
    name: 'Júnior Masculí',
    code: 'JUN',
    keywords: ['badalones', 'corbacho'],
    statsType: 'advanced',
    urls: []
  },
  'cadet-masc': {
    name: 'Cadet Masculí',
    code: 'CAD',
    keywords: ['badalones', 'corbacho'],
    statsType: 'advanced',
    urls: []
  },
  'infantil-masc': {
    name: 'Infantil Masculí',
    code: 'INF',
    keywords: ['badalones', 'corbacho'],
    statsType: 'basic',
    urls: []
  },
  'preinfantil-masc': {
    name: 'Preinfantil Masculí',
    code: 'PRE',
    keywords: ['badalones', 'corbacho'],
    statsType: 'basic',
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68e0f1e19163a800012d6fe2?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68eb79f0941d0d00012a8cbf?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68f4b6dc454224000114adad?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/68fc8c7d45422400012a9469?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/69106472fa539d0001a2529e?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/6919adfc5ac4ad000177450e?currentSeason=true',
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/693e97fa4741c10001403543?currentSeason=true'
      
    ]
  },
  'preinfantil-fem': {
    name: 'Preinfantil Femení',
    code: 'PRE·F',
    keywords: ['badalones', 'corbacho'],
    statsType: 'basic',
    urls: []
  },
  'mini-negre-fem': {
    name: 'Mini Negre Femení',
    code: 'MN·N',
    keywords: ['badalones', 'corbacho'],
    statsType: 'basic',
    urls: []
  },
  'mini-vermell-fem': {
    name: 'Mini Vermell Femení',
    code: 'MN·V',
    keywords: ['badalones', 'corbacho'],
    statsType: 'basic',
    urls: []
  },
  'mini-masc': {
    name: 'Mini Masculí',
    code: 'MINI',
    keywords: ['badalones', 'corbacho'],
    statsType: 'basic',
    urls: [
      'https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/693e95734741c100014032fc?currentSeason=true'
    ]
  },
  'premini-negre-masc': {
    name: 'Pre-Mini Negre Masculí',
    code: 'PM·N',
    keywords: ['badalones', 'corbacho'],
    statsType: 'basic',
    urls: []
  },
  'premini-vermell-masc': {
    name: 'Pre-Mini Vermell Masculí',
    code: 'PM·V',
    keywords: ['badalones', 'corbacho'],
    statsType: 'basic',
    urls: []
  },
  'u25-fem': {
    name: 'U25 Femení',
    code: 'U25·F',
    keywords: ['badalones', 'corbacho'],
    statsType: 'advanced',
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
  const [loginLoading, setLoginLoading] = useState(false);

  // Canvi de contrasenya
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordMsg, setChangePasswordMsg] = useState(null);

  // Config d'equips: comen\u00e7a amb els partits escrits a m\u00e0 (TEAMS_CONFIG)
  // i s'hi van afegint els descoberts autom\u00e0ticament (veure projecte
  // calendari-fcbq-sync) sense esborrar mai els que ja hi havia.
  const [teamsConfig, setTeamsConfig] = useState(TEAMS_CONFIG);

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

  // ========== EFECTE PER RECUPERAR SESSIÓ (Supabase la gestiona sola) ==========
  React.useEffect(() => {
    const loadSession = async (session) => {
      if (!session?.user) {
        setIsAuthenticated(false);
        setCurrentUser(null);
        return;
      }

      // L'email intern porta el nom d'usuari al davant (usuari@badalones-app.local)
      const uname = session.user.email.split('@')[0];

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', uname)
        .single();

      if (error || !profile) {
        console.error('No s\'ha trobat el perfil per aquest usuari:', error);
        setIsAuthenticated(false);
        setCurrentUser(null);
        return;
      }

      setCurrentUser({
        username: profile.username,
        name: profile.name,
        role: profile.role,
        position: profile.position,
        profileImage: IMAGE_MAP[profile.username] || "",
        teams: profile.teams,
      });
      setIsAuthenticated(true);
    };

    // Sessió ja activa (recarregar la pàgina, per exemple)
    supabase.auth.getSession().then(({ data: { session } }) => loadSession(session));

    // Escoltem canvis (login, logout...) en temps real
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      loadSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // ========== EFECTE PER FUSIONAR LES URLS DESCOBERTES AUTOMÀTICAMENT ==========
  React.useEffect(() => {
    const mergeDiscoveredUrls = async () => {
      try {
        const res = await fetch(`/discoveredUrls.json?t=${Date.now()}`);
        if (!res.ok) return;
        const { teams: discovered } = await res.json();
        if (!discovered) return;

        setTeamsConfig((prev) => {
          const merged = { ...prev };
          Object.entries(discovered).forEach(([teamKey, urls]) => {
            if (!merged[teamKey] || !Array.isArray(urls) || urls.length === 0) return;
            const existingUrls = merged[teamKey].urls || [];
            const existingIds = new Set(
              existingUrls.map((u) => (u.match(/getJsonWithMatchStats\/([a-zA-Z0-9]+)/) || [])[1])
            );
            const newUrls = urls.filter(
              (u) => !existingIds.has((u.match(/getJsonWithMatchStats\/([a-zA-Z0-9]+)/) || [])[1])
            );
            if (newUrls.length > 0) {
              merged[teamKey] = {
                ...merged[teamKey],
                urls: [...existingUrls, ...newUrls],
              };
            }
          });
          return merged;
        });
      } catch (error) {
        // Si el fitxer no existeix encara o falla la crida, no passa res:
        // simplement es queden les URLs que ja teníem escrites a mà.
        console.warn('No s\'han pogut carregar les URLs descobertes automàticament:', error);
      }
    };

    mergeDiscoveredUrls();
  }, []);

  // ========== FUNCIONS D'AUTENTICACIÓ ==========
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    const email = usernameToInternalEmail(username);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoginLoading(false);

    if (error) {
      setLoginError("Usuari o contrasenya incorrectes");
    }
    // Si no hi ha error, l'onAuthStateChange de dalt ja s'encarrega
    // d'actualitzar isAuthenticated/currentUser automàticament.
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
  };

  // ========== CANVIAR CONTRASENYA ==========
  const handleChangePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true };
  };

  // ========== CONTROL D'ACCÉS ==========
  const hasAccessToTeam = (teamId) => {
    if (!currentUser) return false;
    if (currentUser.teams === 'all') return true;
    return currentUser.teams.includes(teamId);
  };

  const getAvailableTeams = () => {
    if (!currentUser) return {};
    if (currentUser.teams === 'all') return teamsConfig;

    const availableTeams = {};
    currentUser.teams.forEach(teamId => {
      if (teamsConfig[teamId]) {
        availableTeams[teamId] = teamsConfig[teamId];
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

    const team = teamsConfig[teamId];
    
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
          <div className="scoreboard-eyebrow">
            <span className="scoreboard-dot"></span>
            Consola d'estadístiques
          </div>
          <h1 className="login-title">Inicia sessió</h1>
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
            <div style={{ marginTop: '15px', marginBottom: '10px' }} />
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
            <button className="login-button" type="submit" disabled={loginLoading}>
              {loginLoading ? 'Entrant...' : 'Entrar'}
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
        <div className="welcome-bar">
          <div className="welcome-identity">
            {currentUser.profileImage ? (
              <img
                src={currentUser.profileImage}
                alt={currentUser.name}
                className="welcome-avatar"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="welcome-avatar welcome-avatar--fallback">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="welcome-name">{currentUser.name}</div>
              <div className="welcome-position">{currentUser.position}</div>
            </div>
          </div>
          <div className="welcome-actions">
            <button
              className="ghost-button"
              onClick={() => {
                setShowChangePassword(!showChangePassword);
                setChangePasswordMsg(null);
                setNewPassword("");
                setConfirmPassword("");
              }}
            >
              Canviar contrasenya
            </button>
            <button className="ghost-button ghost-button--danger" onClick={handleLogout}>
              Tancar sessió
            </button>
          </div>
        </div>

        {showChangePassword && (
          <div className="panel panel--narrow">
            <h3 className="panel-title">Canviar contrasenya</h3>
            <div className="input-group">
              <label>Contrasenya nova</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínim 6 caràcters"
              />
            </div>
            <div className="input-group">
              <label>Repeteix-la</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeteix la contrasenya nova"
              />
            </div>
            {changePasswordMsg && (
              <div className={`form-message ${changePasswordMsg.success ? 'form-message--success' : 'form-message--error'}`}>
                {changePasswordMsg.text}
              </div>
            )}
            <button
              className="login-button"
              onClick={async () => {
                if (newPassword.length < 6) {
                  setChangePasswordMsg({ success: false, text: 'Ha de tenir com a mínim 6 caràcters' });
                  return;
                }
                if (newPassword !== confirmPassword) {
                  setChangePasswordMsg({ success: false, text: 'Les contrasenyes no coincideixen' });
                  return;
                }
                const result = await handleChangePassword(newPassword);
                if (result.success) {
                  setChangePasswordMsg({ success: true, text: 'Contrasenya actualitzada correctament!' });
                  setNewPassword("");
                  setConfirmPassword("");
                } else {
                  setChangePasswordMsg({ success: false, text: result.message });
                }
              }}
            >
              Guardar contrasenya nova
            </button>
          </div>
        )}

        <img 
          src="https://i.imghippo.com/files/XfcX1130LYo.png" 
          alt="AE Badalonès" 
          className="club-logo"
        />
        <h1 className="page-title">Estadístiques AE Badalonès</h1>
        <div className="page-subtitle">Temporada 2025-2026 · #somDimonis</div>
        
        <div className="teams-grid">
          {Object.entries(availableTeams).map(([teamId, team]) => (
            <button
              key={teamId}
              onClick={() => handleSelectTeam(teamId)}
              disabled={team.urls.length === 0}
              className="team-card"
            >
              <span className="team-card-code">{team.code}</span>
              <span className="team-card-name">{team.name}</span>
              {team.urls.length > 0 ? (
                <span className="team-card-matches">
                  {team.urls.length} {team.urls.length === 1 ? 'partit' : 'partits'}
                </span>
              ) : (
                <span className="team-card-matches team-card-matches--empty">
                  Sense partits
                </span>
              )}
            </button>
          ))}
        </div>

        {Object.keys(availableTeams).length === 0 && (
          <div className="empty-state">
            No tens accés a cap equip
          </div>
        )}
      </div>
    );
  }

  const currentTeam = teamsConfig[selectedTeam];

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
          <h3 className="menu-title">Opcions d'anàlisi</h3>
          <div className="menu-options">
            <button className={`tab-button ${showStats ? 'tab-button--active' : ''}`} onClick={() => setShowStats(!showStats)}>
              Mitjana stats
            </button>

            <button className={`tab-button ${showPlayerStats ? 'tab-button--active' : ''}`} onClick={() => setShowPlayerStats(!showPlayerStats)}>
              Stats per jugadora
            </button>

            <button className={`tab-button ${showEvolution ? 'tab-button--active' : ''}`} onClick={() => setShowEvolution(!showEvolution)}>
              Gràfics d'evolució
            </button>

            {/* OPCIONS PER STATSTYPE ADVANCED */}
            {currentTeam.statsType === 'advanced' && (
              <button className={`tab-button ${showTopQuintets ? 'tab-button--active' : ''}`} onClick={() => setShowTopQuintets(!showTopQuintets)}>
                Top quintets
              </button>
            )}

            <button className={`tab-button ${showExport ? 'tab-button--active' : ''}`} onClick={() => setShowExport(!showExport)}>
              Exportar informes
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
          
          {/* Mostrar vistes segons statsType */}
          {currentTeam.statsType === 'basic' ? (
            <>
              <QuartersAnalysis match={selectedMatch} />
              <BasicMatchView match={selectedMatch} />
            </>
          ) : (
            <>
              <PlayerList players={selectedMatch.players} />
              <QuintetList quintetStats={getQuintetStats(selectedMatch)} />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default App;
