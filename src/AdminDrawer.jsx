import { useState, useEffect } from "react";
import { savePin, clearPin, fetchAllPins } from "./lib/tablePins";

export default function AdminDrawer({ open, onClose }) {
  const [stats, setStats] = useState({ totalOrders: 0, totalIncome: 0 });
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPinManagement, setShowPinManagement] = useState(false);
  const [pins, setPins] = useState({});
  const [pinInputs, setPinInputs] = useState({});

  useEffect(() => {
    if (open) {
      const globalOrders = JSON.parse(
        localStorage.getItem("global_completed_orders") || "[]",
      );
      console.log("Debug - Global Orders:", globalOrders); // Debug line
      const income = globalOrders.reduce(
        (sum, order) => sum + (order.total || 0),
        0,
      );
      setStats({
        totalOrders: globalOrders.length,
        totalIncome: income,
      });
      setHistory(globalOrders.reverse()); // Show newest first

      // Load PINs
      loadPins();
    } else {
      setShowHistory(false);
      setShowPinManagement(false);
    }
  }, [open]);

  const loadPins = async () => {
    const fetchedPins = await fetchAllPins();
    setPins(fetchedPins);
    setPinInputs(fetchedPins);
  };

  const handlePinChange = (tableId, value) => {
    setPinInputs((prev) => ({ ...prev, [tableId]: value }));
  };

  const saveTablePin = async (tableId) => {
    const pin = pinInputs[tableId];
    if (pin && pin.trim()) {
      await savePin(tableId, pin.trim());
      await loadPins();
    }
  };

  const removeTablePin = async (tableId) => {
    await clearPin(tableId);
    await loadPins();
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-ocean-900/40 backdrop-blur-md z-[60] animate-fade-in"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-full max-w-sm bg-gradient-to-b from-ocean-950 to-ocean-900 text-white z-[70] transition-transform duration-500 ease-out shadow-2xl ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-8 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-palm">
                {showPinManagement
                  ? "PIN Management"
                  : showHistory
                    ? "Order History"
                    : "Sales Dashboard"}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ocean-400 mt-1">
                Management Console
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all font-black"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {!showHistory && !showPinManagement ? (
              /* Summary View */
              <div className="space-y-6 animate-fade-in-up">
                <button
                  onClick={() => setShowPinManagement(true)}
                  className="w-full text-left bg-white/5 rounded-[2rem] p-8 border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-all"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all text-4xl group-hover:translate-x-1 group-hover:-translate-y-1">
                    🔑
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ocean-400 mb-2">
                    Table PINs
                  </p>
                  <h3 className="text-2xl font-black text-white mb-2">
                    Manage Access
                  </h3>
                  <div className="flex items-center gap-2 text-palm text-[9px] font-black uppercase tracking-widest">
                    <span>Set PINs</span>
                    <span className="group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setShowHistory(true)}
                  className="w-full text-left bg-white/5 rounded-[2rem] p-8 border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-all"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all text-4xl group-hover:translate-x-1 group-hover:-translate-y-1">
                    🧾
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ocean-400 mb-2">
                    Total Orders
                  </p>
                  <h3 className="text-5xl font-black text-white">
                    {stats.totalOrders}
                  </h3>
                  <div className="mt-4 flex items-center gap-2 text-palm text-[9px] font-black uppercase tracking-widest">
                    <span>View Details</span>
                    <span className="group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </button>

                <div className="bg-gradient-to-br from-palm/20 to-transparent rounded-[2rem] p-8 border border-palm/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20 text-4xl">
                    💰
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-palm/80 mb-2">
                    Total Income
                  </p>
                  <h3 className="text-5xl font-black text-white">
                    ₱{stats.totalIncome.toFixed(0)}
                  </h3>
                </div>
              </div>
            ) : showPinManagement ? (
              /* PIN Management View */
              <div className="space-y-4 animate-fade-in-up">
                <button
                  onClick={() => setShowPinManagement(false)}
                  className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-ocean-400 hover:text-palm flex items-center gap-2 transition-colors"
                >
                  ← Back to Summary
                </button>

                <div className="space-y-3">
                  {["1", "2", "3", "4", "5", "6"].map((tableId) => (
                    <div
                      key={tableId}
                      className="bg-white/5 rounded-2xl p-4 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-black text-white uppercase tracking-wider text-sm">
                          Table {tableId}
                        </h4>
                        {pins[tableId] && (
                          <span className="text-xs px-2 py-1 bg-palm/20 text-palm rounded-full font-black">
                            🔑 Protected
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Enter PIN (1-100)"
                          value={pinInputs[tableId] || ""}
                          onChange={(e) =>
                            handlePinChange(
                              tableId,
                              e.target.value.replace(/[^0-9]/g, ""),
                            )
                          }
                          className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-center font-black focus:outline-none focus:border-palm text-sm"
                        />
                        <button
                          onClick={() => saveTablePin(tableId)}
                          className="px-4 py-2 bg-palm text-white rounded-xl font-black text-xs hover:bg-palm/80 transition-all"
                        >
                          Set
                        </button>
                        {pins[tableId] && (
                          <button
                            onClick={() => removeTablePin(tableId)}
                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl font-black text-xs hover:bg-red-500/30 transition-all"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                  <p className="text-xs font-medium text-amber-400">
                    💡 PINs allow customers to access specific tables. Share the
                    PIN with customers who need access to their table.
                  </p>
                </div>
              </div>
            ) : (
              /* History List View */
              <div className="space-y-4 animate-fade-in-right">
                <button
                  onClick={() => setShowHistory(false)}
                  className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-ocean-400 hover:text-palm flex items-center gap-2 transition-colors"
                >
                  ← Back to Summary
                </button>

                {history.length === 0 ? (
                  <div className="py-20 text-center opacity-30">
                    <p className="text-sm font-bold uppercase tracking-widest">
                      No orders yet
                    </p>
                  </div>
                ) : (
                  history.map((order, idx) => {
                    console.log(`Debug - Order ${idx}:`, order); // Debug line
                    return (
                      <div
                        key={idx}
                        className="bg-white/5 rounded-3xl p-5 border border-white/10 hover:border-white/20 transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-black text-palm uppercase tracking-wider text-sm">
                              {order.tableName || "Unknown Table"}
                            </h4>
                            <p className="text-xs font-bold text-white mb-1">
                              {order.customerName || "Walk-in Customer"}
                            </p>
                            <p className="text-[10px] text-ocean-500 font-medium">
                              {new Date(order.timestamp).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}{" "}
                              • {new Date(order.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-sm font-black text-white px-3 py-1 bg-white/5 rounded-full">
                            ₱{order.total?.toFixed(0)}
                          </span>
                        </div>

                        <div className="space-y-1 opacity-70 border-t border-white/5 pt-3">
                          {order.items.map((item, iIdx) => (
                            <div
                              key={iIdx}
                              className="flex justify-between text-[10px] font-medium tracking-tight"
                            >
                              <span className="text-ocean-200">
                                {item.quantity}× {item.name}
                              </span>
                              <span className="text-ocean-400">
                                ₱{(item.price * item.quantity).toFixed(0)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!showHistory && !showPinManagement && (
            <div className="pt-8 border-t border-white/10 mt-auto flex flex-col gap-4">
              <button
                onClick={() => {
                  if (
                    confirm("Are you sure you want to clear all sales data?")
                  ) {
                    localStorage.removeItem("global_completed_orders");
                    setStats({ totalOrders: 0, totalIncome: 0 });
                    setHistory([]);
                  }
                }}
                className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-ocean-500 hover:text-red-400 transition-colors"
              >
                Clear Sales History
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("current_user");
                  window.location.href = "/login";
                }}
                className="w-full py-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                Log Out
              </button>
              <p className="text-center text-[9px] text-ocean-600 mt-2 uppercase tracking-tighter">
                Authorized Personnel Only
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
