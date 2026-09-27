import axios from "axios";

// ============================================================================
// ADAPTADOR: API nova (header/boxscore/stints/scoreEvolution) -> mateixa
// estructura que ja consumeixen tots els components existents (App.jsx,
// PlayerList, StatsTables, QuintetList, PlayerStatsByMatch, QuartersAnalysis,
// BasicMatchView, PlayerEvolutionCharts, TopQuintetsAnalysis, ExportReports).
//
// Objectiu: NO tocar cap altre fitxer. Aquí es reconstrueixen els mateixos
// camps que esperava l'API vella (score, teams, players[].data, inOutsList,
// timePlayed, inOut...) a partir de les dades noves.
//
// LIMITACIONS CONEGUDES (veure missatge que acompanya aquest fitxer):
// - L'API nova no dona rebots ni assistències (totalRebounds/assists es
//   deixen a 0; BasicMatchView les mostrarà totes a 0).
// - BasicMatchView.jsx i QuartersAnalysis.jsx assumeixen 8 quarts de 6 min
//   (48 min, format de categories base). Per a categories de 4 períodes
//   (sènior/júnior, 10 min/període, 40 min) el desglossament per "quarts"
//   d'aquests dos components NO reflectirà correctament els 4 quarts reals.
//   La resta de components (PlayerList, StatsTables, QuintetList,
//   PlayerStatsByMatch, PlayerEvolutionCharts, TopQuintetsAnalysis,
//   ExportReports) no depenen d'això i funcionen igual de bé.
// ============================================================================

// Categories base (8 períodes) juguen quarts de 6 minuts (48 min en total);
// categories sènior/júnior (4 períodes) juguen quarts de 10 minuts (40 min).
const periodLengthMinutes = (numPeriods) => (numPeriods === 8 ? 6 : 10);

// scoreEvolution ve amb un rellotge que compta ENRERE dins de cada període
// (p. ex. period 1, minute 10 -> inici; period 4, minute 0 second 4 -> gairebé
// el final). Ho convertim a minuts absoluts des de l'inici del partit, igual
// que feia servir minuteAbsolute a l'API vella.
const absoluteMinuteFromEvent = (event, periodMinutes) => {
  const remaining = (event.minute ?? 0) + (event.second ?? 0) / 60;
  return (event.period - 1) * periodMinutes + (periodMinutes - remaining);
};

// Reconstrueix un "inOutsList" (esdeveniments IN_TYPE/OUT_TYPE en minuts
// absoluts, mateix format que l'API vella) a partir dels "stints" (trams
// continus en pista) de l'API nova.
const buildInOutsList = (playerStints) => {
  if (!playerStints) return [];
  const events = [];
  playerStints.forEach((stint) => {
    events.push({ minuteAbsolut: stint.startSeconds / 60, type: "IN_TYPE" });
    events.push({ minuteAbsolut: stint.endSeconds / 60, type: "OUT_TYPE" });
  });
  return events;
};

const stintsIndexByUuid = (stintsSide) => {
  const index = {};
  (stintsSide || []).forEach((p) => {
    index[p.uuid] = p.stints;
  });
  return index;
};

// L'API nova ja dona els quintets (combinacions de 5 jugadores en pista)
// pre-calculats a `lineups`, amb el seu +/- real — molt més fiable que
// reconstruir-ho a partir de score+inOutsList. Els adaptem al mateix format
// {lineup, plusMinus} que ja produïa (amb sort/errors) l'algoritme antic.
const buildQuintets = (lineupsSide) =>
  (lineupsSide || [])
    .map((entry) => ({
      lineup: (entry.players || []).map((p) => p.actorName).sort(),
      plusMinus: entry.onCourtPlusMinus || 0,
    }))
    .sort((a, b) => b.plusMinus - a.plusMinus);

// Adapta un jugador del boxscore (període 0 = totals del partit sencer) al
// format de jugador que ja esperen els components existents.
const adaptPlayer = (player, teamIdIntern, stintsByUuid) => {
  const acc = player.accumulated || {};
  const computed = player.computed || {};

  return {
    dorsal: player.dorsal,
    name: player.name,
    starting: player.starting,
    captain: player.captain,
    teamId: teamIdIntern,
    timePlayed: (computed.seconds || 0) / 60,
    inOut: computed.onCourtPlusMinus || 0,
    inOutsList: buildInOutsList(stintsByUuid[player.uuid]),
    data: {
      score: acc.pts || 0,
      shotsOfOneSuccessful: acc.ftm || 0,
      shotsOfOneAttempted: acc.fta || 0,
      shotsOfTwoSuccessful: acc.t2m || 0,
      shotsOfTwoAttempted: acc.t2a || 0,
      shotsOfThreeSuccessful: acc.t3m || 0,
      shotsOfThreeAttempted: acc.t3a || 0,
      personalFouls: acc.fc || 0,
      // No disponible a l'API nova.
      totalRebounds: 0,
      assists: 0,
      // Alguns components només miren la longitud d'aquests arrays.
      shootingOfTwoSuccessfulPoint: Array(acc.t2m || 0).fill(null),
      shootingOfThreeSuccessfulPoint: Array(acc.t3m || 0).fill(null),
    },
  };
};

// Transforma una resposta completa de l'API nova en l'objecte de partit que
// esperen App.jsx i la resta de components. Separada de fetchStats perquè es
// pugui provar sense fer cap crida de xarxa.
export const adaptMatchResponse = (data, index, keywords) => {
  const { header, boxscore, stints, scoreEvolution, lineups } = data;
  const periodMinutes = periodLengthMinutes((header.periods || []).length || 4);

  const totals = boxscore.find((b) => b.period === 0) || boxscore[0];

  const localUuid = header.localTeam.uuid;
  const visitUuid = header.visitorTeam.uuid;

  const localStintsIdx = stintsIndexByUuid(stints?.local);
  const visitStintsIdx = stintsIndexByUuid(stints?.visitor);

  const localPlayers = (totals.local.players || []).map((p) =>
    adaptPlayer(p, localUuid, localStintsIdx)
  );
  const visitPlayers = (totals.visitor.players || []).map((p) =>
    adaptPlayer(p, visitUuid, visitStintsIdx)
  );

  const teams = [
    { name: header.localTeam.name, teamIdIntern: localUuid, players: localPlayers },
    { name: header.visitorTeam.name, teamIdIntern: visitUuid, players: visitPlayers },
  ];

  // Cerca de l'equip propi, exactament igual que abans (per keywords, amb
  // el mateix fallback "maristes/badalones/cultural" si no en passem cap).
  let targetTeam = null;
  if (keywords && keywords.length > 0) {
    targetTeam = teams.find((team) => {
      const teamName = team.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return keywords.some((keyword) => teamName.includes(keyword.toLowerCase()));
    });
  } else {
    targetTeam = teams.find((team) => {
      const text = team.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return ["maristes", "badalones", "cultural"].some((word) => text.includes(word));
    });
  }
  if (!targetTeam) {
    console.warn(`⚠️ No se encontró equipo con keywords:`, keywords);
    console.warn(`Usando el primer equipo: ${teams[0]?.name}`);
    targetTeam = teams[0];
  }
  console.log(
    `📝 Equipos en Partido ${index + 1}:`,
    teams.map((team) => team.name)
  );
  console.log(`✅ Equipo seleccionado: ${targetTeam?.name}`);

  const localTeam = teams[0];
  const visitTeam = teams[1];
  const matchResult = `${localTeam.name} ${header.score.local} - ${header.score.visitor} ${visitTeam.name}`;

  // Mateix format que l'antic "score": array d'events amb minuteAbsolute +
  // marcador acumulat en aquell instant.
  const score = (scoreEvolution || []).map((event) => ({
    minuteAbsolute: absoluteMinuteFromEvent(event, periodMinutes),
    local: event.local,
    visit: event.visitor,
  }));

  return {
    matchId: `Partido ${index + 1}`,
    date: header.date,
    category: header.categoryName,
    periods: header.periods || [],
    matchResult,
    idTeam: targetTeam ? targetTeam.teamIdIntern : null,
    players: targetTeam ? targetTeam.players : [],
    score,
    teams,
    localId: localUuid,
    visitId: visitUuid,
    teamA: localTeam,
    teamB: visitTeam,
    // Quintets ja calculats per l'API nova (veure buildQuintets més amunt),
    // nomes de l'equip identificat com a "nostre".
    quintets: buildQuintets(targetTeam === localTeam ? lineups?.local : lineups?.visitor),
  };
};

export const fetchStats = async (urls, keywords = null) => {
  const settled = await Promise.allSettled(urls.map((url) => axios.get(url)));

  const failedCount = settled.filter((r) => r.status === "rejected").length;
  if (failedCount > 0) {
    console.warn(
      `⚠️ ${failedCount} de ${urls.length} URLs de stats han fallat (probablement bloqueig CORS d'URLs antigues); es continua amb la resta.`
    );
  }

  return settled
    .filter((r) => r.status === "fulfilled")
    .map((r, index) => {
      try {
        return adaptMatchResponse(r.value.data, index, keywords);
      } catch (error) {
        console.error("Error adaptant les dades d'un partit:", error);
        return null;
      }
    })
    .filter(Boolean);
};
