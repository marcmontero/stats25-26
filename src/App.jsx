import React, { useState, Suspense, lazy } from 'react';
import { fetchStats } from './api/fechStats.js';
import PlayerList from './components/playerList.jsx';
import MatchSelector from './components/matchSelector.jsx';
import BasicMatchView from './components/BasicMatchView.jsx';
import StatsTable from "./components/StatsTables.jsx";
import PlayerStatsByMatch from "./components/PlayerStatsByMatch.jsx";
// Aquests tres porten llibreries pesades (gràfics, PDF, Excel) que només
// calen si l'usuari les obre de veritat: es carreguen a demanda perquè
// l'aplicació arrenqui molt més ràpid.
const PlayerEvolutionCharts = lazy(() => import("./components/PlayerEvolutionCharts.jsx"));
const TopQuintetsAnalysis = lazy(() => import("./components/TopQuintetsAnalysis.jsx"));
const ExportReports = lazy(() => import("./components/ExportReports.jsx"));
import QuartersAnalysis from './components/QuartersAnalysis.jsx';
import NextOpponent from './components/NextOpponent.jsx';
import { isFeminineTeam, playerWord } from './utils/genderWords.js';
import { supabase, usernameToInternalEmail } from './supabaseClient.js';
import './App.css';

// Les fotos de perfil ja no viuen al codi: cada usuari puja/canvia la seva
// des de l'app (es guarden a Supabase Storage, bucket "avatars").

const TEAMS_CONFIG = {
  'senior-a-masc': {
    name: 'Senior A Masculí',
    code: 'SR·A',
    keywords: ['badalones', 'corbacho'],
    statsType: 'advanced', // Stats completes amb quintets
    // Les URLs antigues (temporada passada) queden fora: apuntaven
    // directament a msstats i el navegador les bloqueja per CORS. Ara
    // només es fan servir les que arriben via discoveredUrls.json
    // (camins locals com /stats/<match_id>.json).
    urls: []
  },
  'senior-fem': {
    name: 'Senior Femení',
    code: 'SR·F',
    keywords: ['badalones', 'corbacho'],
    statsType: 'advanced',
    urls: []
  },
  'senior-b-masc': {
    name: 'Senior B Masculí',
    code: 'SR·B',
    keywords: ['badalones', 'corbacho'],
    statsType: 'advanced',
    urls: []
  },
  'senior-c-masc': {
    name: 'Senior C Masculí',
    code: 'SR·C',
    keywords: ['badalones', 'corbacho'],
    statsType: 'advanced',
    urls: []
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
    urls: []
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
    urls: []
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
    urls: []
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

const TopBar = ({ variant = "default", teamName, onBackToTeams, onLogout }) => (
  <header className="site-topbar">
    <div className="site-topbar-inner">
      <div className="site-topbar-brand">
        <img
          src="https://i.imghippo.com/files/Wnel8089NE.png"
          alt="AE Badalonès"
          className="site-topbar-logo"
        />
        <span className="site-topbar-name">A.E. Badalonès</span>
      </div>

      {variant === "team" && (
        <div className="site-topbar-crumbs">
          <button className="site-topbar-crumb-link" onClick={onBackToTeams}>
            Equips
          </button>
          <span className="site-topbar-crumb-sep">/</span>
          <span className="site-topbar-crumb-current">{teamName}</span>
        </div>
      )}

      {variant === "team" && (
        <button className="site-topbar-logout" onClick={onLogout}>
          Tancar sessió
        </button>
      )}
    </div>
  </header>
);

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
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoMsg, setPhotoMsg] = useState(null);

  // Config d'equips: comen\u00e7a amb els partits escrits a m\u00e0 (TEAMS_CONFIG)
  // i s'hi van afegint els descoberts autom\u00e0ticament (veure projecte
  // calendari-fcbq-sync) sense esborrar mai els que ja hi havia.
  const [teamsConfig, setTeamsConfig] = useState(TEAMS_CONFIG);

  // Estats de l'aplicació
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  // Vista activa del menú d'anàlisi: només una alhora (com un menú de
  // veritat, no botons que s'acumulen). null = cap vista oberta.
  const [activeView, setActiveView] = useState(null);
  const toggleView = (view) => setActiveView((prev) => (prev === view ? null : view));

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
        profileImage: profile.profile_image_url || "",
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
    setActiveView(null);
  };

  // ========== CANVIAR CONTRASENYA ==========
  const handleChangePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true };
  };

  // ========== CANVIAR FOTO DE PERFIL ==========
  const handleChangePhoto = async (file) => {
    if (!file || !currentUser) return { success: false, message: 'Cap fitxer seleccionat' };
    if (!file.type.startsWith('image/')) {
      return { success: false, message: 'Ha de ser una imatge' };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, message: "La imatge no pot pesar més de 5MB" };
    }

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(currentUser.username, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      return { success: false, message: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(currentUser.username);

    // "Cache-busting": sense això, el navegador podria seguir mostrant la
    // foto vella durant un temps perquè la URL no ha canviat de text.
    const freshUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    const { error: dbError } = await supabase
      .from('profiles')
      .update({ profile_image_url: freshUrl })
      .eq('username', currentUser.username);

    if (dbError) {
      return { success: false, message: dbError.message };
    }

    setCurrentUser((prev) => ({ ...prev, profileImage: freshUrl }));
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
    setActiveView(null);
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
    setActiveView(null);
  };

  const handleBackToMatches = () => {
    setSelectedMatch(null);
    setActiveView(null);
  };

  // ========== PANTALLA DE LOGIN ==========
  if (!isAuthenticated) {
    return (
      <>
        <TopBar variant="login" />
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
      </>
    );
  }

  const availableTeams = getAvailableTeams();

  // ========== PANTALLA DE SELECCIÓ D'EQUIPS ==========
  if (!selectedTeam) {
    return (
      <>
        <TopBar variant="teams" />
        <div className="app">
        <div className="welcome-bar">
          <div className="welcome-identity">
            <label className="avatar-upload" title="Canviar foto">
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
              <span className="avatar-upload-badge">{photoUploading ? '···' : '✎'}</span>
              <input
                type="file"
                accept="image/*"
                disabled={photoUploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = ''; // permet tornar a triar el mateix fitxer despres
                  if (!file) return;
                  setPhotoUploading(true);
                  setPhotoMsg(null);
                  const result = await handleChangePhoto(file);
                  setPhotoUploading(false);
                  if (!result.success) {
                    setPhotoMsg(result.message);
                  }
                }}
              />
            </label>
            <div>
              <div className="welcome-name">{currentUser.name}</div>
              <div className="welcome-position">{currentUser.position}</div>
              {photoMsg && <div className="form-message form-message--error" style={{ marginTop: 4 }}>{photoMsg}</div>}
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
      </>
    );
  }

  const currentTeam = teamsConfig[selectedTeam];

  // ========== PANTALLA DE LOADING ==========
  if (loading) {
    return (
      <>
        <TopBar variant="team" teamName={currentTeam.name} onBackToTeams={handleBackToTeams} onLogout={handleLogout} />
        <div className="app">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <h2 className="loading-text">Carregant {currentTeam.name}...</h2>
          </div>
        </div>
      </>
    );
  }

  // ========== PANTALLA PRINCIPAL AMB ESTADÍSTIQUES ==========
  return (
    <>
      <TopBar variant="team" teamName={currentTeam.name} onBackToTeams={handleBackToTeams} onLogout={handleLogout} />
      <div className="app">
        <div className="team-header">
          <h1 className="team-header-title">
            <img 
              src="https://i.imghippo.com/files/Wnel8089NE.png" 
              alt="AE Badalonès" 
              className="team-logo"
            />
            {currentTeam.name}
          </h1>
        </div>

      {!selectedMatch && <NextOpponent teamKey={selectedTeam} />}

      {!selectedMatch && (
        <div className="buttons-container">
          <h3 className="menu-title">Opcions d'anàlisi</h3>
          <div className="menu-options">
            <button className={`tab-button ${activeView === 'stats' ? 'tab-button--active' : ''}`} onClick={() => toggleView('stats')}>
              Mitjana stats
            </button>

            <button className={`tab-button ${activeView === 'playerStats' ? 'tab-button--active' : ''}`} onClick={() => toggleView('playerStats')}>
              Stats per {playerWord(isFeminineTeam(selectedTeam), false)}
            </button>

            <button className={`tab-button ${activeView === 'evolution' ? 'tab-button--active' : ''}`} onClick={() => toggleView('evolution')}>
              Gràfics d'evolució
            </button>

            {/* OPCIONS PER STATSTYPE ADVANCED */}
            {currentTeam.statsType === 'advanced' && (
              <button className={`tab-button ${activeView === 'topQuintets' ? 'tab-button--active' : ''}`} onClick={() => toggleView('topQuintets')}>
                Top quintets
              </button>
            )}

            <button className={`tab-button ${activeView === 'export' ? 'tab-button--active' : ''}`} onClick={() => toggleView('export')}>
              Exportar informes
            </button>
          </div>
        </div>
      )}

      <Suspense fallback={<div className="loading-container"><div className="loading-spinner"></div></div>}>
        {activeView === 'stats' && <StatsTable matches={matches} isFeminine={isFeminineTeam(selectedTeam)} />}
        {activeView === 'playerStats' && <PlayerStatsByMatch matches={matches} isFeminine={isFeminineTeam(selectedTeam)} />}
        {activeView === 'evolution' && <PlayerEvolutionCharts matches={matches} isFeminine={isFeminineTeam(selectedTeam)} />}
        {activeView === 'topQuintets' && currentTeam.statsType === 'advanced' && <TopQuintetsAnalysis matches={matches} />}
        {activeView === 'export' && <ExportReports matches={matches} teamName={currentTeam.name} isFeminine={isFeminineTeam(selectedTeam)} />}
      </Suspense>

      {!selectedMatch ? (
        <MatchSelector matches={matches} onSelectMatch={setSelectedMatch} />
      ) : (
        <>
          {/* Mostrar vistes segons statsType */}
          {currentTeam.statsType === 'basic' ? (
            <>
              <div className="match-title-container">
                <h2>{selectedMatch?.matchResult}</h2>
              </div>
              <button className="back-button" onClick={handleBackToMatches}>
                Tornar a Partits
              </button>
              <QuartersAnalysis match={selectedMatch} isFeminine={isFeminineTeam(selectedTeam)} />
              <BasicMatchView match={selectedMatch} isFeminine={isFeminineTeam(selectedTeam)} />
            </>
          ) : (
            <>
              <PlayerList match={selectedMatch} onBack={handleBackToMatches} isFeminine={isFeminineTeam(selectedTeam)} />
            </>
          )}
        </>
      )}
      </div>
    </>
  );
};

export default App;