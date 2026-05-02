import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/utils/axiosInstance";
import ProductCard from "../components/ProductCard";

/* ─── Font inject ─── */
if (!document.querySelector("#poppins-font")) {
  const l = document.createElement("link");
  l.id = "poppins-font";
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap";
  document.head.appendChild(l);
}

/* ─── Styles ─── */
const css = `
  .sr-root, .sr-root * { font-family: 'Poppins', sans-serif; box-sizing: border-box; }

  .sr-page {
    min-height: 100vh;
    background: #f6f7ff;
    padding: 2.5rem 1.25rem 5rem;
  }

  .sr-inner { max-width: 1200px; margin: 0 auto; }

  /* ── Header ── */
  .sr-header { margin-bottom: 2rem; }

  .sr-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: 'Poppins', sans-serif;
    font-size: 0.72rem;
    font-weight: 600;
    color: #6366f1;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    margin-bottom: 1rem;
    transition: color 0.15s;
  }
  .sr-back-btn:hover { color: #4f46e5; }

  .sr-title-row {
    display: flex;
    align-items: flex-end;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 0.4rem;
  }
  .sr-title {
    font-size: clamp(1.4rem, 3vw, 1.9rem);
    font-weight: 800;
    color: #1a1d3a;
    letter-spacing: -0.03em;
    line-height: 1.2;
    margin: 0;
  }
  .sr-title em {
    font-style: normal;
    background: linear-gradient(135deg, #f472b6, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .sr-count-badge {
    display: inline-flex;
    align-items: center;
    background: #eef1ff;
    border: 1px solid #dde0ff;
    color: #6366f1;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 3px 11px;
    border-radius: 100px;
    margin-bottom: 4px;
  }
  .sr-subtitle {
    font-size: 0.78rem;
    color: #9da3ba;
    font-weight: 400;
    margin: 0;
  }

  /* ── Search bar (inline refine) ── */
  .sr-search-wrap {
    margin-top: 1.25rem;
    margin-bottom: 0.25rem;
    max-width: 520px;
  }
  .sr-search-bar {
    display: flex;
    align-items: center;
    height: 44px;
    background: #fff;
    border: 1.5px solid #e2e5f5;
    border-radius: 100px;
    padding: 0 6px 0 16px;
    gap: 8px;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-shadow: 0 2px 8px rgba(99,102,241,0.05);
  }
  .sr-search-bar:focus-within {
    border-color: #a78bfa;
    box-shadow: 0 0 0 3px rgba(167,139,250,0.12);
  }
  .sr-search-icon { color: #c4b5fd; flex-shrink: 0; }
  .sr-search-input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-family: 'Poppins', sans-serif;
    font-size: 0.85rem;
    color: #1a1d3a;
    font-weight: 500;
  }
  .sr-search-input::placeholder { color: #c4b5fd; font-weight: 400; }
  .sr-search-btn {
    height: 32px;
    padding: 0 18px;
    border: none;
    border-radius: 100px;
    background: linear-gradient(135deg, #f472b6, #818cf8);
    color: #fff;
    font-family: 'Poppins', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.12s;
    flex-shrink: 0;
  }
  .sr-search-btn:hover { opacity: 0.88; }
  .sr-search-btn:active { transform: scale(0.97); }

  /* ── Grid ── */
  .sr-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.25rem;
    animation: srFadeIn 0.4s ease both;
  }
  @keyframes srFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

  /* ── Skeleton grid ── */
  .sr-skeleton-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.25rem;
  }
  .sr-skeleton-card {
    background: #fff;
    border: 1px solid #eaecf5;
    border-radius: 18px;
    overflow: hidden;
  }
  .sr-skeleton-img { height: 180px; background: #f0f2fa; }
  .sr-skeleton-body { padding: 0.9rem 1rem; display: flex; flex-direction: column; gap: 8px; }
  .sr-skeleton-line {
    height: 11px;
    border-radius: 6px;
    background: linear-gradient(90deg, #f0f2fa 25%, #e6e9f5 50%, #f0f2fa 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* ── Empty state ── */
  .sr-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 42vh;
    text-align: center;
    gap: 0.6rem;
    padding: 2rem;
    animation: srFadeIn 0.4s ease both;
  }
  .sr-empty-icon {
    width: 72px; height: 72px;
    border-radius: 50%;
    background: #eef1ff;
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  .sr-empty h3 {
    font-size: 1rem;
    font-weight: 700;
    color: #1a1d3a;
    margin: 0;
  }
  .sr-empty p {
    font-size: 0.8rem;
    color: #9da3ba;
    margin: 0;
    max-width: 280px;
    line-height: 1.65;
  }
  .sr-empty-tip {
    background: #fff;
    border: 1px solid #eaecf5;
    border-radius: 14px;
    padding: 0.85rem 1.25rem;
    margin-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 5px;
    text-align: left;
    max-width: 300px;
    width: 100%;
  }
  .sr-empty-tip-label {
    font-size: 0.65rem;
    font-weight: 700;
    color: #6366f1;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .sr-empty-tip li {
    font-size: 0.75rem;
    color: #6b7280;
    list-style: none;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .sr-empty-tip li::before { content: '•'; color: #c4b5fd; font-size: 1.1rem; line-height: 0; }
`;

/* ─── Skeleton card ─── */
const SkeletonCard = () => (
  <div className="sr-skeleton-card">
    <div className="sr-skeleton-img" />
    <div className="sr-skeleton-body">
      <div className="sr-skeleton-line" style={{ width: "65%" }} />
      <div className="sr-skeleton-line" style={{ width: "40%" }} />
      <div className="sr-skeleton-line" style={{ width: "85%", marginTop: 4 }} />
    </div>
  </div>
);

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get("q") || "";
  const [pets, setPets]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputVal, setInputVal] = useState(q);

  useEffect(() => {
    setInputVal(q);
    (async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/pets/approved");
        const all = res.data?.pets || res.data || [];
        const normalized = all.map((p) => {
          const copy = { ...p };
          if (!Array.isArray(copy.images)) {
            copy.images = copy.image ? [copy.image] : [];
          }
          return copy;
        });
        const qLower = q.toLowerCase();
        setPets(normalized.filter((p) => (p.name || "").toLowerCase().includes(qLower)));
      } catch (err) {
        console.error("Search fetch error:", err);
        setPets([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [q]);

  const handleSearch = (e) => {
    e.preventDefault();
    const val = inputVal.trim();
    if (val) setSearchParams({ q: val });
  };

  return (
    <div className="sr-root sr-page">
      <style>{css}</style>

      <div className="sr-inner">
        {/* Header */}
        <div className="sr-header">
          <button className="sr-back-btn" onClick={() => navigate(-1)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>

          <div className="sr-title-row">
            <h1 className="sr-title">
              Results for <em>"{q}"</em>
            </h1>
            {!loading && (
              <span className="sr-count-badge">
                {pets.length} {pets.length === 1 ? "pet" : "pets"}
              </span>
            )}
          </div>
          <p className="sr-subtitle">
            {loading ? "Searching across all listings…" : pets.length > 0
              ? `Showing ${pets.length} matching result${pets.length !== 1 ? "s" : ""}`
              : "No matches found — try a different keyword"}
          </p>

          {/* Refine search */}
          <div className="sr-search-wrap">
            <form className="sr-search-bar" onSubmit={handleSearch}>
              <svg className="sr-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                className="sr-search-input"
                placeholder="Refine your search…"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
              />
              <button type="submit" className="sr-search-btn">Search</button>
            </form>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="sr-skeleton-grid">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : pets.length === 0 ? (
          <div className="sr-empty">
            <div className="sr-empty-icon">🔍</div>
            <h3>No pets found for "{q}"</h3>
            <p>We couldn't find any pets matching your search. Try adjusting your keywords.</p>
            <div className="sr-empty-tip">
              <div className="sr-empty-tip-label">💡 Search tips</div>
              <ul style={{ margin: 0, padding: 0 }}>
                <li>Check the spelling of your search term</li>
                <li>Try a broader term like "dog" or "cat"</li>
                <li>Search by breed or category</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="sr-grid">
            {pets.map((pet) => (
              <ProductCard key={pet._id || pet.id} pet={pet} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}