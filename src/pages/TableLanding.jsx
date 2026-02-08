import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const TABLE_VIBES = [
  {
    emoji: "🌅",
    tagline: "Sunset spot",
    gradient: "from-amber-100/40 via-ocean-100/60 to-ocean-200/50",
    accent: "text-amber-700",
  },
  {
    emoji: "🌴",
    tagline: "Beach corner",
    gradient: "from-ocean-100/80 via-ocean-200/40 to-ocean-300/30",
    accent: "text-ocean-700",
  },
  {
    emoji: "🌊",
    tagline: "Ocean breeze",
    gradient: "from-ocean-50/90 via-ocean-200/50 to-ocean-400/30",
    accent: "text-ocean-800",
  },
  {
    emoji: "☀️",
    tagline: "Island view",
    gradient: "from-sand-100/50 via-ocean-100/70 to-ocean-200/50",
    accent: "text-wood-dark",
  },
  {
    emoji: "🍃",
    tagline: "Cozy nook",
    gradient: "from-ocean-100/60 via-ocean-150/50 to-sand-200/40",
    accent: "text-ocean-700",
  },
  {
    emoji: "✨",
    tagline: "Best seat",
    gradient: "from-ocean-200/40 via-ocean-100/70 to-ocean-300/40",
    accent: "text-palm",
  },
];

export default function TableLanding() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockTables = [
      { id: "1", slug: "table-1", name: "Table 1" },
      { id: "2", slug: "table-2", name: "Table 2" },
      { id: "3", slug: "table-3", name: "Table 3" },
    ];

    // If Supabase isn't connected, show mock tables
    if (!supabase) {
      setTables(mockTables);
      setLoading(false);
      return;
    }

    supabase
      .from("tables")
      .select("id, slug, name")
      .eq("is_active", true)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setTables(data);
        } else {
          // Fallback to mock tables if query fails or returns empty
          setTables(mockTables);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching tables:", err);
        setTables(mockTables);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-island-page flex flex-col relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(100vw,680px)] h-[380px] bg-ocean-200/30 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-bold text-orange-600 mb-2">
            Siaro Kaw
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Pick your spot · Scan or tap to order
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-orange-300 border-t-orange-500 animate-spin" />
            <p>Loading tables…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-3xl mx-auto">
            {tables.map((t, i) => {
              const vibe = TABLE_VIBES[i % TABLE_VIBES.length];
              return (
                <Link
                  key={t.id}
                  to={`/order/${t.slug}`}
                  className="group block rounded-3xl overflow-hidden border-2 border-white bg-white/95 shadow-lg transition-all hover:-translate-y-2"
                >
                  <div
                    className={`relative p-8 text-center bg-gradient-to-br ${vibe.gradient}`}
                  >
                    <span className="text-5xl mb-2 block">{vibe.emoji}</span>
                    <span className="text-ocean-900 font-bold text-xl mt-4 block">
                      {t.name}
                    </span>
                    <p className={`text-sm font-medium mt-1 ${vibe.accent}`}>
                      {vibe.tagline}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-orange-600 border border-orange-100 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      Mangaon ta!
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
