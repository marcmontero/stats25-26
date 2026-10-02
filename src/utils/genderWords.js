// Les claus dels equips femenins sempre acaben en "fem" (senior-fem,
// u25-fem, preinfantil-fem, mini-negre-fem, mini-vermell-fem...), i les
// masculines en "masc" — no cal cap camp nou a teams.json.
export const isFeminineTeam = (teamKey = "") => teamKey.endsWith("fem");

const capitalizeFirst = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const playerWord = (isFeminine, capitalize = true) => {
  const word = isFeminine ? "jugadora" : "jugador";
  return capitalize ? capitalizeFirst(word) : word;
};

export const playersWord = (isFeminine, capitalize = true) => {
  const word = isFeminine ? "jugadores" : "jugadors";
  return capitalize ? capitalizeFirst(word) : word;
};
