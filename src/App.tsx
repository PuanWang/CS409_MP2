import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Grid2X2,
  List,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { artwork, displayName, getResource, loadKanto, number } from "./api";
import type { Pokemon } from "./api";

function Art({
  pokemon,
  className = "",
}: {
  pokemon: Pokemon;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className={`art-placeholder ${className}`}>Artwork unavailable</span>
  ) : (
    <img
      className={className}
      src={artwork(pokemon)}
      alt={displayName(pokemon.name)}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
function Types({ pokemon }: { pokemon: Pokemon }) {
  return (
    <span className="badges">
      {pokemon.types.map((t) => (
        <span key={t.type.name} className={`badge type-${t.type.name}`}>
          {t.type.name}
        </span>
      ))}
    </span>
  );
}
function App() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const location = useLocation();
  useEffect(() => {
    let active = true;
    setError(false);
    setProgress(0);
    loadKanto((n) => {
      if (active) setProgress(n);
    })
      .then((data) => {
        if (active) setPokemon(data);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <div className="app">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="header">
        <Link to="/" className="brand">
          <span className="pokeball" />
          <span>
            kanto<span className="brand-dot">.</span>
          </span>
          <span className="brand-caption">A POKÉMON FIELD GUIDE</span>
        </Link>
        <nav aria-label="Main navigation">
          <NavLink
            to="/gallery"
            className={({ isActive }) =>
              isActive || location.pathname === "/" ? "active" : ""
            }
          >
            <Grid2X2 size={16} />
            Explore
          </NavLink>
          <NavLink to="/list">
            <List size={17} />
            Pokédex
          </NavLink>
        </nav>
        <span className="edition">
          VOL. 01 <span> / </span> KANTO REGION
        </span>
      </header>
      <main id="main">
        {error ? (
          <section className="state-panel" role="alert">
            <h1>The trail went quiet.</h1>
            <p>
              We couldn’t reach PokéAPI. Check your connection and try again.
            </p>
            <button
              className="primary"
              onClick={() => setAttempt((a) => a + 1)}
            >
              Try again
            </button>
          </section>
        ) : !pokemon.length ? (
          <section className="state-panel" role="status">
            <span className="pokeball loading" />
            <h1>Opening your field guide…</h1>
            <p>Discovering the original 151 Pokémon · {progress} / 151</p>
            <progress value={progress} max={151} />
          </section>
        ) : (
          <Routes>
            <Route path="/" element={<Explore pokemon={pokemon} />} />
            <Route path="/gallery" element={<Explore pokemon={pokemon} />} />
            <Route path="/list" element={<Explore pokemon={pokemon} list />} />
            <Route path="/pokemon/:id" element={<Detail pokemon={pokemon} />} />
            <Route
              path="*"
              element={
                <section className="state-panel">
                  <h1>This path is uncharted.</h1>
                  <Link to="/gallery">Return to the field guide →</Link>
                </section>
              }
            />
          </Routes>
        )}
      </main>
      <footer>
        <Link className="footer-brand" to="/">
          kanto.
        </Link>
        <span>A little curiosity. A whole world to discover.</span>
        <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">
          Data & artwork via PokéAPI <ArrowUpRight size={13} />
        </a>
        <span className="copyright">
          Pokémon © Nintendo / Creatures / GAME FREAK
        </span>
      </footer>
    </div>
  );
}
function Explore({
  pokemon,
  list = false,
}: {
  pokemon: Pokemon[];
  list?: boolean;
}) {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const selected = (params.get("types") || "").split(",").filter(Boolean);
  const sort = params.get("sort") || "id";
  const descending = params.get("order") === "desc";
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }
  const types = [
    ...new Set(pokemon.flatMap((p) => p.types.map((t) => t.type.name))),
  ].sort();
  const shown = pokemon
    .filter(
      (p) =>
        (displayName(p.name).includes(query.toLowerCase().trim()) ||
          number(p.id).includes(query.trim())) &&
        (!selected.length ||
          p.types.some((t) => selected.includes(t.type.name))),
    )
    .sort((a, b) => {
      const result =
        sort === "name"
          ? a.name.localeCompare(b.name)
          : sort === "weight"
            ? a.weight - b.weight
            : a.id - b.id;
      return (descending ? -result : result) || a.id - b.id;
    });
  const feature = pokemon.find((p) => p.id === 1)!;
  const search = params.toString() ? `?${params}` : "";
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="status-dot" /> THE ORIGINAL 151. ENDLESS DISCOVERY.
          </span>
          <h1>
            Big adventures.
            <br />
            Little <em>creatures.</em>
          </h1>
          <p>
            From your first partner to the rarest find.
            <br />
            Meet the Pokémon that started it all.
          </p>
          <div className="hero-meta">
            <span>
              <BookOpen size={16} /> Your guide to the Kanto region
            </span>
            <span className="meta-divider" /> EST. 1996
          </div>
        </div>
        <Link
          to="/pokemon/1"
          className="hero-feature"
          aria-label="Discover Bulbasaur"
        >
          <span className="feature-orbit" />
          <span className="feature-spark spark-one">✳</span>
          <span className="feature-spark spark-two">+</span>
          <span className="feature-label">MEET YOUR FIRST PARTNER</span>
          <Art pokemon={feature} />
          <div className="feature-caption">
            <div>
              <span className="mono">001 / SEED POKÉMON</span>
              <strong>Small seed. Big potential.</strong>
            </div>
            <span className="round-arrow">
              <ArrowUpRight size={21} />
            </span>
          </div>
        </Link>
      </section>
      <section className="collection" aria-label="Pokémon collection">
        <div className="collection-heading">
          <div>
            <span className="eyebrow">THE FIELD COLLECTION</span>
            <h2>
              {list ? "Your Pokédex" : "Find your next favorite"}
              <span className="count-tag">151</span>
            </h2>
          </div>
          <div className="view-toggle" aria-label="View mode">
            <Link to={`/gallery${search}`} className={!list ? "selected" : ""}>
              <Grid2X2 size={16} /> Gallery
            </Link>
            <Link to={`/list${search}`} className={list ? "selected" : ""}>
              <List size={17} /> List
            </Link>
          </div>
        </div>
        <div className="toolbar">
          <div className="search-field">
            <Search size={19} />
            <input
              aria-label="Search Pokémon"
              placeholder="Search by name or number…"
              value={query}
              onChange={(e) => update("q", e.target.value)}
            />
            {query && (
              <button aria-label="Clear search" onClick={() => update("q", "")}>
                <X size={17} />
              </button>
            )}
            <span className="search-hint">#001–151</span>
          </div>
          <div className="sort-controls">
            <label htmlFor="sort">
              <SlidersHorizontal size={15} /> Sort by
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => update("sort", e.target.value)}
            >
              <option value="id">Pokédex number</option>
              <option value="name">Name</option>
              <option value="weight">Weight</option>
            </select>
            <button
              className="order-button"
              onClick={() => update("order", descending ? "asc" : "desc")}
              aria-label={
                descending
                  ? "Order: descending. Switch to ascending"
                  : "Order: ascending. Switch to descending"
              }
            >
              <ArrowDown size={16} className={descending ? "reversed" : ""} />
              {descending ? "Descending" : "Ascending"}
            </button>
          </div>
        </div>
        <div className="filters">
          <span className="filter-label">TYPE</span>
          <button
            className={!selected.length ? "filter active" : "filter"}
            onClick={() => update("types", "")}
          >
            All types
          </button>
          {types.map((type) => (
            <button
              key={type}
              aria-pressed={selected.includes(type)}
              className={`filter ${selected.includes(type) ? "active" : ""}`}
              onClick={() =>
                update(
                  "types",
                  selected.includes(type)
                    ? selected.filter((t) => t !== type).join(",")
                    : [...selected, type].join(","),
                )
              }
            >
              <span className={`type-dot type-${type}`} />
              {type}
            </button>
          ))}
        </div>
        <div className="results-meta" aria-live="polite">
          <span>
            Showing <strong>{shown.length}</strong> of 151 Pokémon
            {selected.length > 1 ? " · Matching any selected type" : ""}
          </span>
          {query || selected.length ? (
            <button
              className="text-button"
              onClick={() => {
                const next = new URLSearchParams(params);
                next.delete("q");
                next.delete("types");
                setParams(next);
              }}
            >
              Clear filters <X size={13} />
            </button>
          ) : (
            <span>
              Go on, take a closer look <ArrowDown size={13} />
            </span>
          )}
        </div>
        {!shown.length ? (
          <div className="state-panel">
            <Search size={30} />
            <h2>No Pokémon in sight.</h2>
            <p>Try another name, number, or type.</p>
            <button className="primary" onClick={() => setParams({})}>
              Reset search & filters
            </button>
          </div>
        ) : (
          <div className={list ? "pokemon-list" : "pokemon-grid"}>
            {shown.map((p) => (
              <Link
                className={`pokemon-card tone-${p.types[0].type.name}`}
                key={p.id}
                to={`/pokemon/${p.id}`}
                state={{
                  ids: shown.map((p) => p.id),
                  returnTo: `${list ? "/list" : "/gallery"}${search}`,
                }}
              >
                <div className="card-art">
                  <span className="card-number">{number(p.id)}</span>
                  <span className="card-arrow">
                    <ArrowUpRight size={17} />
                  </span>
                  <Art pokemon={p} />
                  <span className="art-ring" />
                </div>
                <div className="card-info">
                  <div>
                    <span className="list-number">{number(p.id)}</span>
                    <h3>{displayName(p.name)}</h3>
                    <Types pokemon={p} />
                  </div>
                  <span className="card-weight">
                    {p.weight / 10} <small>kg</small>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="collection-end">
          <span className="pokeball" />
          <span>Every great journey starts with a little curiosity.</span>
          <span className="mono">KANTO / 001–151</span>
        </div>
      </section>
    </>
  );
}
function Detail({ pokemon }: { pokemon: Pokemon[] }) {
  const { id } = useParams();
  const location = useLocation();
  const p = pokemon.find((p) => String(p.id) === id);
  const [description, setDescription] = useState("");
  useEffect(() => {
    let active = true;
    setDescription("");
    if (p)
      getResource<{
        flavor_text_entries: {
          flavor_text: string;
          language: { name: string };
        }[];
      }>(`pokemon-species/${p.id}`)
        .then((data) => {
          if (active)
            setDescription(
              data.flavor_text_entries
                .find((e) => e.language.name === "en")
                ?.flavor_text.replace(/[\n\f]/g, " ") || "",
            );
        })
        .catch(() => {});
    return () => {
      active = false;
    };
  }, [p]);
  if (!p)
    return (
      <section className="state-panel">
        <h1>Pokémon not found.</h1>
        <p>This guide covers Kanto Pokémon #001–151.</p>
        <Link to="/gallery">Back to the collection →</Link>
      </section>
    );
  const state = location.state as { ids?: number[]; returnTo?: string } | null;
  const contextIds = state?.ids?.filter((id) =>
    pokemon.some((p) => p.id === id),
  );
  const ids = contextIds?.includes(p.id)
    ? contextIds
    : pokemon.map((p) => p.id);
  const index = ids.indexOf(p.id);
  const previous = pokemon.find(
    (p) => p.id === ids[(index - 1 + ids.length) % ids.length],
  )!;
  const next = pokemon.find((p) => p.id === ids[(index + 1) % ids.length])!;
  return (
    <section className="detail">
      <Link className="back-link" to={state?.returnTo || "/gallery"}>
        <ArrowLeft size={17} /> Back to collection
      </Link>
      <div className="detail-layout">
        <div className={`detail-art tone-${p.types[0].type.name}`}>
          <span className="detail-number">{number(p.id)}</span>
          <span className="detail-ring" />
          <Art key={p.id} pokemon={p} />
          <span className="eyebrow">KANTO FIELD NOTES / {number(p.id)}</span>
        </div>
        <div className="detail-content">
          <span className="eyebrow">THE ORIGINAL 151 · KANTO REGION</span>
          <h1>{displayName(p.name)}</h1>
          <Types pokemon={p} />
          <p className="description">
            {description ||
              "Discover this Pokémon’s measurements, abilities, and base stats below."}
          </p>
          <dl className="measurements">
            <div>
              <dt>HEIGHT</dt>
              <dd>
                {p.height / 10} <small>m</small>
              </dd>
            </div>
            <div>
              <dt>WEIGHT</dt>
              <dd>
                {p.weight / 10} <small>kg</small>
              </dd>
            </div>
            <div>
              <dt>BASE EXPERIENCE</dt>
              <dd>{p.base_experience ?? "—"}</dd>
            </div>
          </dl>
          <h2>Natural abilities</h2>
          <div className="abilities">
            {p.abilities.map((a) => (
              <span key={a.ability.name}>
                {displayName(a.ability.name)}
                {a.is_hidden && <small>Hidden</small>}
              </span>
            ))}
          </div>
          <div className="stats-heading">
            <h2>Base stats</h2>
            <span>Total {p.stats.reduce((s, t) => s + t.base_stat, 0)}</span>
          </div>
          <div className="stats">
            {p.stats.map((s) => (
              <div className="stat" key={s.stat.name}>
                <span>{displayName(s.stat.name)}</span>
                <strong>{s.base_stat}</strong>
                <meter
                  min={0}
                  max={255}
                  value={s.base_stat}
                  aria-label={s.stat.name}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <nav className="detail-navigation" aria-label="Browse Pokémon">
        <Link to={`/pokemon/${previous.id}`} state={state}>
          <ArrowLeft />
          <span>
            <small>PREVIOUS</small>
            <strong>
              {number(previous.id)} {displayName(previous.name)}
            </strong>
          </span>
        </Link>
        <span className="position">
          {index + 1} / {ids.length}
          <small>{state?.ids ? "CURRENT COLLECTION" : "KANTO POKÉDEX"}</small>
        </span>
        <Link to={`/pokemon/${next.id}`} state={state}>
          <span>
            <small>NEXT</small>
            <strong>
              {number(next.id)} {displayName(next.name)}
            </strong>
          </span>
          <ArrowRight />
        </Link>
      </nav>
    </section>
  );
}
export default App;
