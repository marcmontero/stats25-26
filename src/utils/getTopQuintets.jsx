export const getTopQuintets = (matches) => {
    const quintetos = {};

    const addQuintet = (lineup, plusMinus) => {
      const lineupKey = lineup.join("-");
      if (!quintetos[lineupKey]) {
        quintetos[lineupKey] = { lineup, plusMinus: 0 };
      }
      quintetos[lineupKey].plusMinus += plusMinus;
    };

    matches.forEach(match => {
      // Format nou: fetchStats.js ja aporta els quintets pre-calculats de
      // l'API (més fiables que la reconstrucció d'aquí sota).
      if (match.quintets) {
        match.quintets.forEach(({ lineup, plusMinus }) => addQuintet(lineup, plusMinus));
        return;
      }

      // Format antic: reconstrucció a partir de score + inOutsList.
      const players = match.players;
      const scoreEvents = match.score;

      scoreEvents.forEach(event => {
        const { minuteAbsolute, local, visit } = event;

        const playersOnCourt = players
          .filter(player =>
            player.inOutsList.some(entry =>
              entry.minuteAbsolut <= minuteAbsolute &&
              (entry.type === "IN_TYPE" || entry.type === "OUT_TYPE")
            )
          )
          .map(player => player.name)
          .sort();

        if (playersOnCourt.length === 5) {
          const differential = local - visit;
          addQuintet(playersOnCourt, differential);
        }
      });
    });

    const sortedQuintets = Object.values(quintetos).sort((a, b) => b.plusMinus - a.plusMinus);

    return {
      best: sortedQuintets.slice(0, 3),
      worst: sortedQuintets.slice(-3),
    };
  };
