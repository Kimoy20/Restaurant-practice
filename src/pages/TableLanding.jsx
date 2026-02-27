import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { fetchAllPins, savePin, clearPin } from "../lib/tablePins";
import AdminDrawer from "../AdminDrawer";

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
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    const currentUser = localStorage.getItem("current_user");
    const userRole = localStorage.getItem("user_role");

    if (!currentUser || !userRole) {
      navigate("/login", { replace: true });
      return;
    }

    // Only allow owners/staff to access this page
    if (userRole === "customer") {
      navigate("/customer-tables", { replace: true });
      return;
    }
  }, [navigate]);

  const [tables, setTables] = useState([]);
  const [activeTableOrders, setActiveTableOrders] = useState({}); // tableId -> list of active order IDs
  const [loading, setLoading] = useState(true);
  const [manualStatuses, setManualStatuses] = useState(() => {
    return JSON.parse(localStorage.getItem("manual_table_statuses") || "{}");
  });
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [passwordInputs, setPasswordInputs] = useState({});
  const [tablePasswords, setTablePasswords] = useState(() => {
    return JSON.parse(localStorage.getItem("table_passwords") || "{}");
  });

  const handleSetPassword = async (tableId, tableName) => {
    const val = parseInt(passwordInputs[tableId] || "", 10);
    if (!val || val < 1 || val > 100) {
      alert("Please enter a number between 1 and 100.");
      return;
    }
    const result = await savePin(tableId, val);
    const updated = { ...tablePasswords, [tableId]: String(val) };
    setTablePasswords(updated);
    setPasswordInputs((prev) => ({ ...prev, [tableId]: "" }));
    alert(
      `✔ Password for ${tableName} set to ${val}${result.source === "supabase" ? " (synced to cloud ☁️)" : " (saved locally)"}`,
    );
  };

  const handleClearPassword = async (tableId) => {
    await clearPin(tableId);
    const updated = { ...tablePasswords };
    delete updated[tableId];
    setTablePasswords(updated);
  };

  useEffect(() => {
    const mockTables = [
      { id: "1", slug: "table-1", name: "Table 1" },
      { id: "2", slug: "table-2", name: "Table 2" },
      { id: "3", slug: "table-3", name: "Table 3" },
      { id: "4", slug: "table-4", name: "Table 4" },
      { id: "5", slug: "table-5", name: "Table 5" },
      { id: "6", slug: "table-6", name: "Table 6" },
    ];

    const loadData = async () => {
      setLoading(true);

      // Load PINs from Supabase (or fall back to localStorage)
      const pins = await fetchAllPins();
      setTablePasswords(pins);

      if (!supabase) {
        setTables(mockTables);
        setActiveTableOrders({});
        setLoading(false);
        return;
      }

      try {
        const { data: tableData, error: tableError } = await supabase
          .from("tables")
          .select("id, slug, name")
          .eq("is_active", true);

        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("table_id")
          .in("status", ["pending", "preparing", "ready"]);

        if (tableError) {
          console.warn(
            "Supabase table fetch error, using mock data:",
            tableError,
          );
          setTables(mockTables);
          setActiveTableOrders({});
        } else if (tableData && tableData.length > 0) {
          if (tableData.length < 6) {
            const extraTables = mockTables.slice(tableData.length);
            setTables([...tableData, ...extraTables]);
          } else {
            setTables(tableData);
          }
        } else {
          setTables(mockTables);
        }

        if (!orderError && orderData && orderData.length > 0) {
          const tableOrders = {};
          orderData.forEach((o) => {
            if (!tableOrders[o.table_id]) tableOrders[o.table_id] = [];
            tableOrders[o.table_id].push(o.id);
          });
          setActiveTableOrders(tableOrders);
        } else {
          setActiveTableOrders({});
        }
      } catch (err) {
        console.error("Critical fetch error:", err);
        setTables(mockTables);
        setActiveTableOrders({});
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleManualStatusChange = (tableId, status) => {
    const newStatuses = { ...manualStatuses, [tableId]: status };
    setManualStatuses(newStatuses);
    localStorage.setItem("manual_table_statuses", JSON.stringify(newStatuses));
  };

  const getTableStatus = (table) => {
    // Priority 1: Manual Override
    if (manualStatuses[table.id] === "occupied") return "occupied_available";
    if (manualStatuses[table.id] === "available") return "available";

    const activeOrderIds = activeTableOrders[table.id] || [];
    const myActiveOrders = JSON.parse(
      localStorage.getItem("my_active_orders") || "[]",
    );

    // Check if I have a local session for this table (even if not synced/mock)
    const hasLocalSession = myActiveOrders.some(
      (o) =>
        o.tableId === table.id ||
        o.tableId === table.slug ||
        (typeof o === "string" && activeOrderIds.includes(o)),
    );

    if (activeOrderIds.length === 0) {
      return hasLocalSession ? "my_session" : "available";
    }

    const isMine = activeOrderIds.some((id) =>
      myActiveOrders.some((mo) => mo.id === id || mo === id),
    );

    return isMine ? "my_session" : "occupied_available";
  };

  return (
    <div className="min-h-screen bg-island-page flex flex-col relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(100vw,680px)] h-[380px] bg-ocean-200/30 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative z-10 w-full">
        {/* Burger Menu Button */}
        <div className="absolute top-8 right-8 z-20">
          <button
            onClick={() => setIsAdminOpen(true)}
            className="w-14 h-14 rounded-3xl bg-white/40 backdrop-blur-xl border-2 border-white/80 shadow-island-sm flex flex-col gap-1.5 items-center justify-center hover:bg-white/90 hover:scale-110 active:scale-95 transition-all group"
            aria-label="Open Sales Dashboard"
          >
            <div className="w-6 h-0.5 bg-ocean-900/60 rounded-full group-hover:bg-palm transition-colors"></div>
            <div className="w-6 h-0.5 bg-ocean-900/60 rounded-full group-hover:bg-palm transition-colors"></div>
            <div className="w-4 h-0.5 bg-ocean-900/60 rounded-full group-hover:bg-palm transition-colors self-start ml-[13px]"></div>
          </button>
        </div>

        <div className="max-w-2xl text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-black text-ocean-950 mb-4 tracking-tight">
            Siaro Kaw
          </h1>
          <p className="text-xl md:text-2xl text-ocean-700 font-bold mb-6 italic">
            "Experience the heartbeat of Siargao on every plate."
          </p>
          <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] p-6 border border-white/40 shadow-inner">
            <p className="text-sand-700 text-sm md:text-base leading-relaxed font-medium">
              Welcome to Siaro Kaw, where island tradition meets modern flavors.
              Our kitchen celebrates Siargao's rich bounties—from the freshest
              morning catch to our signature wood-fired BBQ. Relax, soak in the
              breeze, and choose your spot below to begin your island feast.
            </p>
          </div>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-ocean-200"></div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-ocean-400">
              Pick your spot to order
            </p>
            <div className="h-px w-12 bg-ocean-200"></div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-orange-300 border-t-orange-500 animate-spin" />
            <p>Loading tables…</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-3xl mx-auto">
            {tables.map((t, i) => {
              const vibe = TABLE_VIBES[i % TABLE_VIBES.length];
              const status = getTableStatus(t);

              const isTaken = status === "taken";
              const isMySession = status === "my_session";
              const isOccupiedAvailable = status === "occupied_available";

              return (
                <div
                  key={t.id}
                  className="relative group bg-white/95 rounded-[2.5rem] border-2 border-white shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden flex flex-col"
                >
                  {/* Upper clickable area */}
                  <Link to={`/order/${t.slug}`} className="block flex-1">
                    <div
                      className={`p-8 pt-10 pb-6 text-center bg-gradient-to-br ${vibe.gradient} h-full`}
                    >
                      <span
                        className={`text-6xl mb-4 block transition-transform duration-700 ${isTaken ? "grayscale" : "group-hover:scale-110 group-hover:rotate-6"}`}
                      >
                        {isTaken
                          ? "🔒"
                          : isOccupiedAvailable
                            ? "🍽️"
                            : vibe.emoji}
                      </span>
                      <span
                        className={`text-ocean-950 font-black text-2xl tracking-tight block ${isTaken ? "opacity-50" : ""}`}
                      >
                        {t.name}
                      </span>
                      <p
                        className={`text-sm font-bold mt-2 tracking-wide uppercase opacity-70 ${isTaken ? "text-sand-600" : isOccupiedAvailable ? "text-ocean-600" : vibe.accent}`}
                      >
                        {isTaken
                          ? "Table is taken"
                          : isOccupiedAvailable
                            ? "Add to order"
                            : vibe.tagline}
                      </p>

                      <div
                        className={`mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                          isMySession
                            ? "bg-palm text-white border-2 border-palm/20 shadow-[0_0_20px_rgba(20,83,45,0.3)]"
                            : isTaken
                              ? "bg-sand-100 text-sand-500 border border-sand-200"
                              : isOccupiedAvailable
                                ? "bg-amber-50 text-amber-700 border-2 border-amber-200 group-hover:bg-amber-500 group-hover:text-white"
                                : "bg-white/90 text-ocean-800 border-2 border-ocean-100/50 group-hover:bg-ocean-600 group-hover:text-white group-hover:border-ocean-400"
                        }`}
                      >
                        {isMySession
                          ? "✨ Add Order"
                          : isTaken
                            ? "Occupied"
                            : status === "available"
                              ? "Mangaon ta!"
                              : isOccupiedAvailable
                                ? "🍽️ Add Order"
                                : vibe.tagline}
                      </div>
                    </div>
                  </Link>

                  {/* Dropdown + Password area */}
                  <div
                    className={`p-6 pt-0 bg-gradient-to-br ${vibe.gradient} space-y-3`}
                  >
                    <div className="pt-4 border-t border-ocean-950/5">
                      <select
                        value={
                          manualStatuses[t.id] ||
                          (isTaken || isMySession ? "occupied" : "available")
                        }
                        onChange={(e) =>
                          handleManualStatusChange(t.id, e.target.value)
                        }
                        className="w-full bg-white/50 backdrop-blur-md border border-white/80 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-ocean-900 focus:outline-none focus:ring-2 focus:ring-palm/30 transition-all cursor-pointer hover:bg-white/80 text-center"
                      >
                        <option value="available">🟢 Available</option>
                        <option value="occupied">🔴 Occupied</option>
                      </select>
                    </div>

                    {/* Table Password */}
                    <div className="pt-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-ocean-500 mb-1.5">
                        🔑 Customer PIN (1–100)
                      </p>
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          placeholder={
                            tablePasswords[t.id]
                              ? `Current: ${tablePasswords[t.id]}`
                              : "Enter 1-100"
                          }
                          value={passwordInputs[t.id] || ""}
                          onChange={(e) =>
                            setPasswordInputs((prev) => ({
                              ...prev,
                              [t.id]: e.target.value,
                            }))
                          }
                          className="flex-1 bg-white/70 border border-white/80 rounded-xl px-3 py-2 text-xs font-bold text-ocean-900 focus:outline-none focus:ring-2 focus:ring-palm/30"
                        />
                        <button
                          onClick={() => handleSetPassword(t.id, t.name)}
                          className="bg-palm/90 hover:bg-palm text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all"
                        >
                          Set
                        </button>
                        {tablePasswords[t.id] && (
                          <button
                            onClick={() => handleClearPassword(t.id)}
                            className="bg-red-100 hover:bg-red-500 text-red-600 hover:text-white text-[9px] font-black uppercase tracking-widest px-2 py-2 rounded-xl transition-all"
                            title="Clear password"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      {tablePasswords[t.id] && (
                        <p className="text-[9px] text-palm font-bold mt-1">
                          ✔ PIN active: {tablePasswords[t.id]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer className="mt-24 py-12 px-6 text-center border-t border-ocean-100/50 w-full bg-white/30 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-ocean-500">
            Created by Kim Guartel
          </p>
          <p className="text-[11px] font-medium text-ocean-700/80 leading-relaxed max-w-lg mx-auto">
            This website was created by Kim Guartel, an Information Technology
            student passionate about web development, system design, and
            innovative digital solutions. Dedicated to creating user-friendly
            and efficient applications, Kim aims to deliver quality projects
            with creativity and technical excellence.
          </p>
          <div className="pt-4 border-t border-ocean-200/50 flex flex-col items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ocean-400">
              kimoygwapo@gmail.com
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-ocean-400">
              © 2026 Kim Guartel. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      <AdminDrawer open={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
}
