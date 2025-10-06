import axios from "axios";

export const fetchStats = async (urls) => {
  try {
    const responses = await Promise.all(urls.map((url) => axios.get(url)));

    return responses.map((response, index) => {
      const teams = response.data.teams;
      console.log(
        `📝 Equipos en Partido ${index + 1}:`,
        teams.map((team) => team.name)
      );

      // Buscar equipo "BADALONÈS" o "MARISTES"
      const badalonesTeam = teams.find((team) => {
        const text = team.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        return ["maristes", "badalones", "cultural"].some((word) => text.includes(word));
      });

      // Obtener equipos local y visitante
      const localTeam = teams[0]; // Suponemos que el primer equipo es local
      const visitTeam = teams[1]; // Suponemos que el segundo equipo es visitante

      // Extraer marcador final desde el array `score`
      const finalScore = response.data.score[response.data.score.length - 1]; // Último elemento es el marcador final
      const localScore = finalScore ? finalScore.local : "N/A";
      const visitScore = finalScore ? finalScore.visit : "N/A";

      const matchResult = `${localTeam.name} ${localScore} - ${visitScore} ${visitTeam.name}`;

      return {
        matchId: `Partido ${index + 1}`,
        matchResult, // Guardamos el marcador
        idTeam: badalonesTeam ? badalonesTeam.teamIdIntern : null,
        players: badalonesTeam ? badalonesTeam.players : [],
      };
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return [];
  }
};
