export const getQuintetStats = (matchData) => {
    if (!matchData || !matchData.score || !matchData.teams) {
        console.warn("⚠️ Datos del partido incompletos.");
        return [];
    }

    const { score, teams, localId, visitId } = matchData;
    const players = teams.flatMap(team => team.players);

    // Lista de cambios de cada jugador
    const playerMinutes = players.map(player => ({
        name: player.name,
        teamId: player.teamId,
        inOuts: player.inOutsList || []
    }));

    const quintetos = {};

    // Recorremos los eventos de puntuación
    score.forEach(event => {
        const { local, visit, minuteAbsolute } = event;

        // Determinar qué jugadores estaban en pista en este minuto
        const lineup = playerMinutes
            .filter(player => 
                player.inOuts.some(entry => 
                    entry.minuteAbsolut <= minuteAbsolute &&
                    (entry.type === "IN_TYPE" || entry.type === "OUT_TYPE")
                )
            )
            .map(player => player.name)
            .sort();

        if (lineup.length === 5) {
            const lineupKey = lineup.join('-');

            if (!quintetos[lineupKey]) {
                quintetos[lineupKey] = { lineup, plusMinus: 0 };
            }

            // Determinar qué equipo anotó
            const puntos = local - visit;
            const anotadorEsLocal = local > visit;

            // Ajustamos el más/menos dependiendo del equipo que anotó
            if (anotadorEsLocal && playerMinutes.some(p => p.teamId === localId)) {
                quintetos[lineupKey].plusMinus += puntos;
            } else if (!anotadorEsLocal && playerMinutes.some(p => p.teamId === visitId)) {
                quintetos[lineupKey].plusMinus -= puntos;
            }
        }
    });

    // Convertimos a array y ordenamos por impacto
    return Object.values(quintetos).sort((a, b) => b.plusMinus - a.plusMinus);
};
