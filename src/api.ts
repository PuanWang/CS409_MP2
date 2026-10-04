import axios from "axios";
export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: { type: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  stats: { base_stat: number; stat: { name: string } }[];
  sprites: {
    front_default: string;
    other: { "official-artwork": { front_default: string } };
  };
}
const client = axios.create({
  baseURL: "https://pokeapi.co/api/v2/",
  timeout: 20000,
});
const pending = new Map<string, Promise<unknown>>();
export function getResource<T>(path: string): Promise<T> {
  const key = `kanto-v1:${path}`;
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const cached = JSON.parse(saved);
      if (Date.now() - cached.time < 604800000)
        return Promise.resolve(cached.data);
    }
  } catch {
    /* Storage may be disabled. Network fetching still works. */
  }
  if (!pending.has(path)) {
    pending.set(
      path,
      client
        .get<T>(path)
        .then(({ data }) => {
          try {
            localStorage.setItem(
              key,
              JSON.stringify({ time: Date.now(), data }),
            );
          } catch {
            /* Cache is optional. */
          }
          return data;
        })
        .finally(() => pending.delete(path)),
    );
  }
  return pending.get(path) as Promise<T>;
}
export async function loadKanto(
  onProgress: (count: number) => void,
): Promise<Pokemon[]> {
  const entries = await getResource<{
    pokemon_species: { name: string; url: string }[];
  }>("generation/1");
  const ids = entries.pokemon_species
    .map((p) => Number(p.url.split("/").filter(Boolean).pop()))
    .sort((a, b) => a - b);
  const results: Pokemon[] = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      while (next < ids.length) {
        const id = ids[next++];
        results.push(await getResource<Pokemon>(`pokemon/${id}`));
        onProgress(results.length);
      }
    }),
  );
  return results.sort((a, b) => a.id - b.id);
}
export const artwork = (p: Pokemon) =>
  p.sprites.other["official-artwork"].front_default || p.sprites.front_default;
export const number = (id: number) => `#${String(id).padStart(3, "0")}`;
export const displayName = (name: string) => name.replaceAll("-", " ");
