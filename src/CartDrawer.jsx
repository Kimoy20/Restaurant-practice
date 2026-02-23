export default function CartDrawer({
  open,
  onClose,
  cart,
  sessionOrders = [],
  onUpdateQty,
  onSubmit,
}) {
  const currentTotal = cart.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  // Aggregate items from all session orders
  const sessionItemMap = new Map();
  sessionOrders.forEach(order => {
    order.items.forEach(item => {
      if (sessionItemMap.has(item.id)) {
        const existing = sessionItemMap.get(item.id);
        existing.quantity += item.quantity;
      } else {
        sessionItemMap.set(item.id, { ...item });
      }
    });
  });
  const sessionItems = Array.from(sessionItemMap.values());
  const sessionTotal = sessionItems.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-ocean-900/30 backdrop-blur-sm z-20 animate-fade-in"
          onClick={onClose}
          aria-hidden
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white/95 backdrop-blur-md shadow-island-xl z-30 flex flex-col transition-transform duration-400 ease-out border-l border-ocean-100/80 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={open ? { animation: "slideInRight 0.35s ease-out" } : undefined}
      >
        {/* Header */}
        <div className="p-5 border-b border-ocean-100/80 bg-gradient-to-r from-ocean-50/90 to-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden>
                🛒
              </span>
              <h2 className="heading-display text-xl text-palm">Your plate</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sand-500 hover:bg-ocean-100/60 hover:text-ocean-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Items Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-8">
          {/* Currently Adding */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-ocean-400 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-palm animate-pulse"></span>
              Adding Now
            </h3>
            {cart.length === 0 ? (
              <div className="text-center py-8 rounded-2xl bg-ocean-50/50 border border-dashed border-ocean-200">
                <p className="text-sand-500 text-xs font-medium">Your plate is currently empty.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {cart.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center gap-3 p-3 rounded-2xl bg-white border border-ocean-100/60 shadow-inner"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ocean-900 truncate text-sm">
                        {item.name}
                      </p>
                      <p className="text-xs text-sand-600 font-bold">
                        ₱{Number(item.price).toFixed(0)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 scale-90">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg border-2 border-sand-300 text-sand-600 hover:bg-sand-100 transition-colors"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-xs font-black text-ocean-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg border-2 border-ocean-300 bg-ocean-50 text-ocean-700 hover:bg-ocean-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Already Ordered */}
          {sessionItems.length > 0 && (
            <div className="pt-6 border-t border-ocean-100/50">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-ocean-400 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ocean-300"></span>
                Already Ordered
              </h3>
              <ul className="space-y-2 opacity-80">
                {sessionItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center gap-3 p-3 rounded-xl bg-ocean-50/30 border border-ocean-100/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ocean-800 truncate text-xs">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-sand-500">
                        {item.quantity} {item.quantity > 1 ? 'orders' : 'order'} — ₱{(item.price * item.quantity).toFixed(0)}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 text-[10px] font-black text-ocean-300 uppercase tracking-tighter">
                      <span>Kitchen</span>
                      <span className="animate-pulse">🔥</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between items-center px-1">
                <span className="text-[10px] font-black text-ocean-400 uppercase tracking-widest">Ordered Total</span>
                <span className="text-xs font-black text-ocean-600">₱{sessionTotal.toFixed(0)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-ocean-100/80 bg-gradient-to-r from-ocean-50/90 to-white">
          <div className="flex justify-between items-center font-semibold text-ocean-900 mb-4 px-1">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-ocean-400">Add to Bill</span>
              <span className="text-2xl font-black text-palm leading-none mt-1">
                ₱{currentTotal.toFixed(0)}
              </span>
            </div>
            {sessionItems.length > 0 && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-ocean-400">Total Run</span>
                <span className="text-sm font-black text-ocean-950 mt-1">
                  ₱{(currentTotal + sessionTotal).toFixed(0)}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={cart.length === 0}
            className="w-full btn-primary py-4 text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-palm/20 disabled:opacity-50 disabled:grayscale transition-all"
          >
            Mangaon ta! — Send order
          </button>
        </div>
      </div>
    </>
  );
}
