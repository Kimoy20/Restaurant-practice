import { useState } from "react";

const CATEGORY_EMOJIS = {
  Pulutan: "🍤",
  Main: "🍲",
  Drinks: "🥤",
  Other: "🍽️",
};

export default function MenuGrid({ items, onAdd }) {
  const [quantities, setQuantities] = useState({});

  const byCategory = items.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categoryOrder = ["Pulutan", "Main", "Drinks", "Other"];
  const sortedCategories = Object.entries(byCategory).sort(
    ([a], [b]) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b),
  );

  const getQuantity = (itemId) => quantities[itemId] || 1;

  const updateQuantity = (itemId, change) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + change),
    }));
  };

  const handleAddToCart = (item) => {
    const qty = getQuantity(item.id);
    // Add the item multiple times based on quantity selected
    for (let i = 0; i < qty; i++) {
      onAdd(item);
    }
    // Reset quantity for this item
    setQuantities((prev) => ({ ...prev, [item.id]: 1 }));
  };

  return (
    <div className="w-full space-y-10 pb-8">
      {sortedCategories.map(([category, list], idx) => (
        <section
          key={category}
          id={category.toLowerCase().replace(/\s+/g, "-")}
          className="animate-fade-in"
        >
          {/* Category Header */}
          <div className="px-4 sm:px-6 mb-8 scroll-mt-24">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-4xl">
                {CATEGORY_EMOJIS[category] || "🍽️"}
              </span>
              <div>
                <h2 className="heading-display text-3xl sm:text-4xl bg-gradient-to-r from-ocean-700 to-ocean-600 bg-clip-text text-transparent">
                  {category}
                </h2>
                <p className="text-sand-600 text-sm font-medium">
                  {list.length}{" "}
                  {list.length === 1 ? "dish" : "delicious dishes"}
                </p>
              </div>
            </div>
            <div className="h-1 w-16 bg-gradient-to-r from-ocean-500 to-ocean-300 rounded-full" />
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 px-4 sm:px-6">
            {list.map((item) => (
              <div
                key={item.id}
                className="group h-full rounded-3xl overflow-hidden bg-white/95 backdrop-blur-sm border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-ocean-200 flex flex-col"
              >
                {/* Image Container */}
                {item.image_url ? (
                  <div className="relative w-full h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-ocean-100 to-sand-100">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ) : (
                  <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-ocean-100 via-ocean-50 to-sand-100 flex items-center justify-center text-6xl transition-transform duration-300 group-hover:scale-110">
                    {CATEGORY_EMOJIS[category] || "🍽️"}
                  </div>
                )}

                {/* Content Container */}
                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  {/* Title */}
                  <h3 className="font-bold text-ocean-900 text-lg sm:text-xl group-hover:text-palm transition-colors line-clamp-2">
                    {item.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sand-600 text-sm mt-2 flex-1 line-clamp-2 leading-relaxed">
                    {item.description || "Fresh and delicious — Mangaon ta!"}
                  </p>

                  {/* Price & Quantity & Button */}
                  <div className="mt-5 pt-4 border-t border-ocean-100/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs text-sand-500 font-medium">
                          Price
                        </span>
                        <span className="text-ocean-700 font-bold text-2xl">
                          ₱{Number(item.price).toFixed(0)}
                        </span>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2 bg-ocean-50 rounded-2xl p-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-ocean-700 hover:bg-ocean-100 transition-colors font-bold text-lg"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-bold text-ocean-900">
                          {getQuantity(item.id)}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-ocean-700 hover:bg-ocean-100 transition-colors font-bold text-lg"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className="w-full btn-primary text-sm font-bold py-3 rounded-2xl transition-all duration-300 group-hover:shadow-lg active:scale-95"
                    >
                      <span>✨ Add {getQuantity(item.id)} to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
