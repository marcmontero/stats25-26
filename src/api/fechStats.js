import axios from "axios";

export const fetchStats = async (urls, keywords = null) => {
  try {
    const responses = await Promise.all(urls.map((url) => axios.get(url)));

    return responses.map((response, index) => {
      const teams = response.data.teams;
      console.log(
        `📝 Equipos en Partido ${index + 1}:`,
        teams.map((team) => team.name)
      );

      // Buscar el equipo correcto
      let targetTeam = null;

      if (keywords && keywords.length > 0) {
        // Si hay keywords, buscar por ellas
        targetTeam = teams.find((team) => {
          const teamName = team.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

          return keywords.some((keyword) => 
            teamName.includes(keyword.toLowerCase())
          );
        });
      } else {
        // Si no hay keywords, buscar "MARISTES", "BADALONÈS" o "CULTURAL" (legacy)
        targetTeam = teams.find((team) => {
          const text = team.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

          return ["maristes", "badalones", "cultural"].some((word) => 
            text.includes(word)
          );
        });
      }

      // Si no encontramos equipo con keywords, tomar el primer equipo
      if (!targetTeam) {
        console.warn(`⚠️ No se encontró equipo con keywords:`, keywords);
        console.warn(`Usando el primer equipo: ${teams[0]?.name}`);
        targetTeam = teams[0];
      }

      console.log(`✅ Equipo seleccionado: ${targetTeam?.name}`);

      // Obtener equipos local y visitante
      const localTeam = teams[0];
      const visitTeam = teams[1];

      // Extraer marcador final desde el array `score`
      const finalScore = response.data.score[response.data.score.length - 1];
      const localScore = finalScore ? finalScore.local : "N/A";
      const visitScore = finalScore ? finalScore.visit : "N/A";

      const matchResult = `${localTeam.name} ${localScore} - ${visitScore} ${visitTeam.name}`;

      // 🔥 RETORNAR TOTES LES DADES NECESSÀRIES
      return {
        matchId: `Partido ${index + 1}`,
        matchResult,
        idTeam: targetTeam ? targetTeam.teamIdIntern : null,
        players: targetTeam ? targetTeam.players : [],
        
        // 🆕 Afegir dades per QuartersAnalysis
        score: response.data.score || [],
        teams: response.data.teams || [],
        localId: response.data.localId,
        visitId: response.data.visitId,
        
        // 🆕 Guardar també les dades originals per si de cas
        teamA: localTeam,
        teamB: visitTeam,
      };
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return [];
  }
};