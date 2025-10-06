export const getTopQuintets = (matches) => {
    const quintetos = {};
  
    matches.forEach(match => {
      const players = match.players;
      const scoreEvents = match.score;
  
      // 🔹 Recorrer cada evento de puntuación
      scoreEvents.forEach(event => {
        const { minuteAbsolute, local, visit } = event;
  
        // 🔹 Detectar qué jugadoras estaban en pista en ese minuto
        const playersOnCourt = players
          .filter(player =>
            player.inOutsList.some(entry =>
              entry.minuteAbsolut <= minuteAbsolute &&
              (entry.type === "IN_TYPE" || entry.type === "OUT_TYPE")
            )
          )
          .map(player => player.name)
          .sort(); // Ordenar para que las combinaciones sean únicas
  
        // 🔹 Solo consideramos combinaciones de 5 jugadoras exactas
        if (playersOnCourt.length === 5) {
          const lineupKey = playersOnCourt.join("-");
  
          if (!quintetos[lineupKey]) {
            quintetos[lineupKey] = { lineup: playersOnCourt, plusMinus: 0 };
          }
  
          // 🔹 Sumar el impacto de este quinteto
          const differential = local - visit;
          quintetos[lineupKey].plusMinus += differential;
        }
      });
    });
  
    // 🔹 Ordenar quintetos por impacto total
    const sortedQuintets = Object.values(quintetos).sort((a, b) => b.plusMinus - a.plusMinus);
  
    return {
      best: sortedQuintets.slice(0, 3),  // 🔥 3 mejores quintetos
      worst: sortedQuintets.slice(-3),   // ❌ 3 peores quintetos
    };
  };
  