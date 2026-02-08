export default function CartDrawer({
  open,
  onClose,
  cart,
  onUpdateQty,
  onSubmit,
}) {
  const total = cart.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

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
              <h2 className="heading-display text-xl text-palm">Your order</h2>
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

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-ocean-100/60 flex items-center justify-center text-3xl">
                🍽️
              </div>
              <p className="text-sand-600 font-medium">Walay laman.</p>
              <p className="text-sand-500 text-sm mt-1">
                Add items from the menu!
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center gap-3 p-3 rounded-2xl bg-white border border-ocean-100/60 shadow-inner"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ocean-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-sm text-sand-600">
                      ₱{Number(item.price).toFixed(0)} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                      className="w-9 h-9 rounded-xl border-2 border-sand-300 text-sand-600 hover:bg-sand-100 hover:border-sand-400 transition-colors font-medium"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-ocean-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                      className="w-9 h-9 rounded-xl border-2 border-ocean-300 bg-ocean-50 text-ocean-700 hover:bg-ocean-100 transition-colors font-medium"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-ocean-100/80 bg-gradient-to-r from-ocean-50/90 to-white">
          <div className="flex justify-between items-center font-semibold text-ocean-900 mb-4">
            <span>Total</span>
            <span className="text-2xl font-bold text-palm">
              ₱{total.toFixed(0)}
            </span>
          </div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={cart.length === 0}
            className="w-full btn-primary py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Mangaon ta! — Send order
          </button>
        </div>
      </div>
    </>
  );
}
