import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { fetchAllPins } from "../lib/tablePins";

const TABLE_VIBES = [
  {
    emoji: "🌊",
    gradient: "from-blue-200 to-cyan-100",
    accent: "text-blue-600",
    tagline: "Ocean View",
  },
  {
    emoji: "🌴",
    gradient: "from-emerald-200 to-teal-100",
    accent: "text-emerald-600",
    tagline: "Under the Palms",
  },
  {
    emoji: "🏄",
    gradient: "from-orange-200 to-amber-100",
    accent: "text-orange-600",
    tagline: "Surfer's Corner",
  },
  {
    emoji: "🥥",
    gradient: "from-yellow-200 to-orange-100",
    accent: "text-yellow-600",
    tagline: "Coconut Shade",
  },
  {
    emoji: "🌺",
    gradient: "from-rose-200 to-pink-100",
    accent: "text-rose-600",
    tagline: "Tropical Breeze",
  },
  {
    emoji: "☀️",
    gradient: "from-amber-200 to-yellow-100",
    accent: "text-amber-600",
    tagline: "Sunset Deck",
  },
];

export default function CustomerTableLanding() {
  const navigate = useNavigate();

  // Check if user is authenticated - Updated for Vercel deployment
  useEffect(() => {
    const currentUser = localStorage.getItem("current_user");
    const userRole = localStorage.getItem("user_role");

    console.log("Auth check:", { currentUser, userRole });

    if (!currentUser || !userRole) {
      console.log("Redirecting to login - no auth data");
      navigate("/login", { replace: true });
      return;
    }

    // Only allow customers to access this page
    if (userRole !== "customer") {
      console.log("Redirecting to login - wrong role:", userRole);
      navigate("/login", { replace: true });
      return;
    }

    console.log("Authentication passed");
  }, [navigate]);

  const [tables, setTables] = useState([]);
  const [activeTableOrders, setActiveTableOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [pins, setPins] = useState({}); // { tableId: "42" }
  const [pinModal, setPinModal] = useState(null); // { tableSlug, tableId, tableName }
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const handleTableClick = (e, t, isTaken) => {
    if (isTaken) {
      e.preventDefault();
      return;
    }
    const required = pins[t.id];
    if (required) {
      e.preventDefault();
      setPinInput("");
      setPinError("");
      setPinModal({ tableSlug: t.slug, tableId: t.id, tableName: t.name });
    }
  };

  const handlePinSubmit = () => {
    const required = pins[pinModal.tableId];
    if (pinInput.trim() === required) {
      // Store successful PIN authentication with both ID formats
      const pinAuth = JSON.parse(
        localStorage.getItem("pin_authenticated_tables") || "{}",
      );
      const tableNumericId = pinModal.tableId;
      const tableSlugId = pinModal.tableSlug;

      // Store with both numeric ID and slug for compatibility
      pinAuth[tableNumericId] = {
        authenticated: true,
        timestamp: Date.now(),
        tableName: pinModal.tableName,
      };
      pinAuth[tableSlugId] = {
        authenticated: true,
        timestamp: Date.now(),
        tableName: pinModal.tableName,
      };

      localStorage.setItem("pin_authenticated_tables", JSON.stringify(pinAuth));

      console.log("PIN authenticated for:", {
        tableNumericId,
        tableSlugId,
        pinAuth,
      });

      setPinModal(null);
      setPinInput("");
      setPinError("");
      // Navigate to the order page for this table
      navigate(`/order/${pinModal.tableSlug}`);
    } else {
      setPinError("Wrong PIN. Please try again.");
      setPinInput("");
    }
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

      // Always fetch PINs first (Supabase or fallback local)
      const fetchedPins = await fetchAllPins();
      setPins(fetchedPins);

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

  const getTableStatus = (t) => {
    // If ANY pin is set for this table, it's accessible (just PIN-protected) - never 'taken'
    if (pins[t.id]) return "pin_protected";

    const manualStatuses = JSON.parse(
      localStorage.getItem("manual_table_statuses") || "{}",
    );
    // If manually set to occupied, allow adding orders
    if (manualStatuses[t.id] === "occupied") return "occupied";

    const myOrders = JSON.parse(
      localStorage.getItem("my_active_orders") || "[]",
    );
    const isMySession = myOrders.some((o) => o.tableId === t.slug);
    if (isMySession) return "my_session";

    const hasGlobalOrder =
      activeTableOrders[t.id] && activeTableOrders[t.id].length > 0;
    // If table has global orders but no PIN protection, it's available for viewing
    if (hasGlobalOrder) return "available";

    return "available";
  };

  return (
    <div className="min-h-screen bg-island-page relative pb-8 sm:pb-10 flex flex-col items-center justify-center">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col">
        <div className="text-center mb-8 sm:mb-16 relative z-10 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white shadow-xl mb-4 sm:mb-8 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <span className="text-3xl sm:text-4xl">🌴</span>
          </div>
          <h1 className="heading-display text-3xl sm:text-5xl md:text-7xl font-black text-ocean-950 mb-2 sm:mb-4 tracking-tight">
            Choose Your Spot
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-ocean-700 font-bold mb-4 sm:mb-6 italic">
            "Pick a table to view your menu and orders."
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-orange-300 border-t-orange-500 animate-spin" />
            <p>Loading tables…</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 w-full max-w-3xl mx-auto">
            {tables.map((t, i) => {
              const vibe = TABLE_VIBES[i % TABLE_VIBES.length];
              const status = getTableStatus(t);

              const isTaken = false; // Never taken anymore
              const isMySession = status === "my_session";
              const isPinProtected = status === "pin_protected";

              // Only taken tables are blocked, but we never have taken tables anymore
              const isBlocked = false;

              return (
                <div
                  key={t.id}
                  className="relative group bg-white/95 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-white shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden flex flex-col"
                >
                  <Link
                    to={`/order/${t.slug}`}
                    className="block flex-1"
                    onClick={(e) => handleTableClick(e, t, false)}
                  >
                    <div
                      className={`p-4 sm:p-8 pb-6 sm:pb-10 text-center bg-gradient-to-br ${vibe.gradient} h-full`}
                    >
                      <span
                        className={`text-4xl sm:text-6xl mb-2 sm:mb-4 block transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6`}
                      >
                        {isPinProtected ? "🔑" : vibe.emoji}
                      </span>
                      <span className="text-ocean-950 font-black text-lg sm:text-2xl tracking-tight block">
                        {t.name}
                      </span>
                      <p
                        className={`text-xs sm:text-sm font-bold mt-1 sm:mt-2 tracking-wide uppercase opacity-70 ${
                          isPinProtected ? "text-amber-600" : vibe.accent
                        }`}
                      >
                        {isPinProtected ? "Your Table" : vibe.tagline}
                      </p>

                      <div
                        className={`mt-3 sm:mt-6 inline-flex items-center gap-2 rounded-2xl px-3 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                          isMySession
                            ? "bg-palm text-white border-2 border-palm/20 shadow-[0_0_20px_rgba(20,83,45,0.3)]"
                            : isPinProtected
                              ? "bg-amber-50 text-amber-700 border-2 border-amber-200 group-hover:bg-amber-500 group-hover:text-white"
                              : "bg-white/90 text-ocean-800 border-2 border-ocean-100/50 group-hover:bg-ocean-600 group-hover:text-white group-hover:border-ocean-400"
                        }`}
                      >
                        {isMySession
                          ? "✨ View Order"
                          : isPinProtected
                            ? "🔑 Enter PIN"
                            : "Select this table"}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PIN Modal */}
      {pinModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-ocean-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 w-full max-w-sm shadow-2xl border border-ocean-100 animate-fade-in-up">
            <div className="text-center mb-4 sm:mb-6">
              <span className="text-4xl sm:text-5xl block mb-2 sm:mb-3">
                🔑
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-ocean-950">
                Enter Table PIN
              </h2>
              <p className="text-xs sm:text-sm text-ocean-600 mt-1 font-medium">
                {pinModal.tableName} requires a PIN from your waiter.
              </p>
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter PIN (1–100)"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value.replace(/[^0-9]/g, ""));
                setPinError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
              className="w-full px-3 sm:px-5 py-3 sm:py-4 rounded-2xl bg-ocean-50 border-2 border-ocean-100 text-center text-lg sm:text-2xl font-black text-ocean-900 focus:outline-none focus:border-palm tracking-[0.3em] mb-3 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:_hidden [&::-webkit-inner-spin-button]:_hidden"
              autoFocus
            />
            {pinError && (
              <p className="text-red-500 text-xs font-bold text-center mb-3">
                {pinError}
              </p>
            )}
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setPinModal(null)}
                className="flex-1 py-2 sm:py-3 rounded-2xl bg-ocean-50 text-ocean-600 font-black text-xs sm:text-sm hover:bg-ocean-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handlePinSubmit}
                className="flex-1 py-2 sm:py-3 rounded-2xl bg-gradient-to-br from-palm to-ocean-700 text-white font-black text-xs sm:text-sm hover:opacity-90 transition-all shadow-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-12 sm:mt-24 py-8 sm:py-12 px-4 sm:px-6 text-center border-t border-ocean-100/50 w-full bg-white/30 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-ocean-500">
            Created by Kim Guartel
          </p>
          <p className="text-[10px] sm:text-[11px] font-medium text-ocean-700/80 leading-relaxed max-w-lg mx-auto">
            This website was created by Kim Guartel, an Information Technology
            student passionate about web development, system design, and
            innovative digital solutions. Dedicated to creating user-friendly
            and efficient applications, Kim aims to deliver quality projects
            with creativity and technical excellence.
          </p>
          <div className="pt-4 border-t border-ocean-200/50 flex flex-col items-center gap-2">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-ocean-400">
              kimoygwapo@gmail.com
            </p>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-ocean-400">
              © 2026 Kim Guartel. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
