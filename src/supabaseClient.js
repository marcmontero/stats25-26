import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Falten les variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
    'Configura-les al fitxer .env (local) o a les variables d\'entorn de Netlify.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// L'usuari només fa servir "nom d'usuari", però Supabase Auth necessita
// un email intern per gestionar el compte. El generem de manera
// determinista i mai el mostrem enlloc.
export const usernameToInternalEmail = (username) =>
  `${username.toLowerCase().trim()}@badalones-app.local`;
