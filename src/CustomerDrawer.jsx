import { useState, useEffect } from "react";

export default function CustomerDrawer({ open, onClose, tableId }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (open) {
      const all = JSON.parse(localStorage.getItem('my_active_orders') || '[]');
      // Filter to only show orders belonging to the current table
      const filtered = tableId
        ? all.filter(o => o.tableId === tableId)
        : all;
      setOrders([...filtered].reverse());
    }
  }, [open, tableId]);

  const grandTotal = orders.reduce((sum, order) => {
    return sum + (order.items?.reduce((s, i) => s + Number(i.price) * (i.quantity || 1), 0) || 0);
  }, 0);

  const tableName = tableId
    ? `Table ${tableId.replace('table-', '')}`
    : 'My Orders';

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-ocean-900/40 backdrop-blur-md z-[60] animate-fade-in"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-gradient-to-b from-ocean-950 to-ocean-900 text-white z-[70] transition-transform duration-500 ease-out shadow-2xl ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-8 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-palm">
                My Orders
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ocean-400 mt-1">
                {tableName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all font-black"
            >
              ✕
            </button>
          </div>

          {/* Grand Total Banner */}
          {orders.length > 0 && (
            <div className="mb-6 bg-palm/20 border border-palm/30 rounded-2xl px-5 py-4 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-palm/70">Total Bill</p>
                <p className="text-2xl font-black text-white">₱{grandTotal.toFixed(0)}</p>
              </div>
              <span className="text-3xl">🧾</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-4 animate-fade-in-up">
              {orders.length === 0 ? (
                <div className="py-20 text-center opacity-30">
                  <p className="text-4xl mb-4">🍽️</p>
                  <p className="text-sm font-bold uppercase tracking-widest">No orders yet</p>
                  <p className="text-xs mt-2 font-medium">Your waiter will add orders to your table.</p>
                </div>
              ) : (
                orders.map((order, idx) => {
                  const itemsTotal = order.items?.reduce((sum, i) => sum + (Number(i.price) * (i.quantity || 1)), 0) || 0;
                  return (
                    <div key={idx} className="bg-white/5 rounded-3xl p-5 border border-white/10 hover:border-white/20 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-black text-palm uppercase tracking-wider text-sm">
                            Order #{order.id || (idx + 1)}
                          </h4>
                          <p className="text-[10px] text-ocean-500 font-medium">
                            {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-sm font-black text-white px-3 py-1 bg-white/5 rounded-full">
                          ₱{itemsTotal.toFixed(0)}
                        </span>
                      </div>
                      
                      <div className="space-y-1 opacity-70 border-t border-white/5 pt-3">
                        {order.items?.map((item, iIdx) => (
                          <div key={iIdx} className="flex justify-between text-[10px] font-medium tracking-tight">
                            <span className="text-ocean-200">
                              {item.quantity}× {item.name}
                            </span>
                            <span className="text-ocean-400">₱{(item.price * item.quantity).toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 mt-auto">
            <button 
              onClick={() => {
                localStorage.removeItem('current_user');
                window.location.href = '/login';
              }}
              className="w-full py-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
