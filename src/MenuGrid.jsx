import { useState } from "react";

const CATEGORY_EMOJIS = {
  Pulutan: "🍤",

  Main: "🍲",

  Drinks: "🥤",

  Other: "🍽️",
};

const FALLBACK_IMAGES = {
  Kinilaw:
    "https://th.bing.com/th/id/OIP.Hfvz244b7BZo-cccufK6QwHaFj?w=266&h=200&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",

  "Pork Sisig":
    "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&q=80&w=800",

  "Chicharon Bulaklak":
    "https://wfg32p.s3.amazonaws.com/media/dishes/chicharon-bulaklak_7628-reg.jpg",

  "Crispy Pata":
    "https://images.unsplash.com/photo-1520209268518-aec60b86a07ea?auto=format&fit=crop&q=80&w=800",

  Bagnet:
    "https://www.kuserrano.com/wp-content/uploads/2023/04/bagnet-kare-kare.jpg",

  "Grilled Tuna Belly":
    "https://images.unsplash.com/photo-1515002246320-80252b828131?auto=format&fit=crop&q=80&w=800",

  "Chicken Inasal":
    "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&q=80&w=800",

  "Sinigang na Baboy":
    "https://images.unsplash.com/photo-1548943487-a2e4d43b4859?auto=format&fit=crop&q=80&w=800",

  "Adobong Manok":
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800",

  "Lechon Kawali":
    "https://images.unsplash.com/photo-1512152272829-41b9d4c1daff?auto=format&fit=crop&q=80&w=800",

  "Coconut Shake":
    "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=800",

  "Mango Shake":
    "https://images.unsplash.com/photo-1546889564-9be98a3b83b3?auto=format&fit=crop&q=80&w=800",

  "Calamansi Juice":
    "https://images.unsplash.com/photo-1622597467836-f38240662c8b?auto=format&fit=crop&q=80&w=800",

  "Buko Juice":
    "https://images.unsplash.com/photo-1600350743152-e568ac04683a?auto=format&fit=crop&q=80&w=800",

  "Iced Coffee":
    "https://images.unsplash.com/photo-1461023058943-0708e5fcb1f0?auto=format&fit=crop&q=80&w=800",

  "Grilled Fish":
    "https://images.unsplash.com/photo-1515002246320-80252b828131?auto=format&fit=crop&q=80&w=800",
};

export default function MenuGrid({ items, onAdd, onAddNewItem, onDeleteItem }) {
  const [quantities, setQuantities] = useState({});

  const [isAdding, setIsAdding] = useState(false);

  const [newItem, setNewItem] = useState({
    name: "",

    description: "",

    price: "",

    image_url: "",

    category: "Pulutan",

    image_file: null,
  });

  const [customCategories, setCustomCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editItem, setEditItem] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category: "Pulutan",
    image_file: null,
  });

  const handleAddNewItem = (e) => {
    e.preventDefault();

    if (!newItem.name || !newItem.price) return;

    // Add new category if it's custom
    if (newItem.category && !categoryOrder.includes(newItem.category)) {
      setCustomCategories((prev) => [...prev, newItem.category]);
    }

    // Add item

    const submittedItem = {
      ...newItem,

      id: "custom-" + Date.now().toString(),

      price: Number(newItem.price),
    };

    // Handle image file if selected
    if (newItem.image_file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        submittedItem.image_url = reader.result;
        if (onAddNewItem) {
          onAddNewItem(submittedItem);
        }
      };
      reader.readAsDataURL(newItem.image_file);
    } else {
      if (onAddNewItem) {
        onAddNewItem(submittedItem);
      }
    }

    setIsAdding(false);

    setNewItem({
      name: "",

      description: "",

      price: "",

      image_url: "",

      category: "Pulutan",

      image_file: null,
    });
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !customCategories.includes(newCategory.trim())) {
      setCustomCategories((prev) => [...prev, newCategory.trim()]);
      setNewCategory("");
      setShowAddCategory(false);
    }
  };

  const handleDeleteItem = (itemId) => {
    setDeleteConfirm(itemId);
  };

  const confirmDelete = () => {
    if (deleteConfirm && onDeleteItem) {
      onDeleteItem(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setEditItem({
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      image_url: item.image_url || "",
      category: item.category || "Pulutan",
      image_file: null,
    });
  };

  const handleUpdateItem = (e) => {
    e.preventDefault();
    if (!editItem.name || !editItem.price || !editingItem) return;

    const updatedItem = {
      ...editingItem,
      name: editItem.name,
      description: editItem.description,
      price: Number(editItem.price),
      image_url: editItem.image_url,
      category: editItem.category,
    };

    // Handle image file if selected
    if (editItem.image_file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatedItem.image_url = reader.result;
        if (onAddNewItem) {
          onAddNewItem(updatedItem); // Use same callback for updates
        }
      };
      reader.readAsDataURL(editItem.image_file);
    } else {
      if (onAddNewItem) {
        onAddNewItem(updatedItem); // Use same callback for updates
      }
    }

    setEditingItem(null);
    setEditItem({
      name: "",
      description: "",
      price: "",
      image_url: "",
      category: "Pulutan",
      image_file: null,
    });
  };

  const byCategory = items.reduce((acc, item) => {
    const cat = item.category || "Other";

    if (!acc[cat]) acc[cat] = [];

    acc[cat].push(item);

    return acc;
  }, {});

  const categoryOrder = [
    "Pulutan",
    "Main",
    "Drinks",
    "Other",
    ...customCategories,
  ];

  const getAllCategories = () => {
    return [...categoryOrder];
  };

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
    <div className="w-full space-y-10 pb-8 relative">
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full border border-ocean-100 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-ocean-950">
                Add New Dish
              </h3>

              <button
                onClick={() => setIsAdding(false)}
                className="text-ocean-300 hover:text-red-500 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ocean-700 uppercase mb-1">
                  Name
                </label>

                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-ocean-50 border border-ocean-100 focus:outline-none focus:ring-2 focus:ring-palm"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  placeholder="Dish name..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ocean-700 uppercase mb-1">
                    Price (₱)
                  </label>

                  <input
                    required
                    type="number"
                    className="w-full px-4 py-3 rounded-xl bg-ocean-50 border border-ocean-100 focus:outline-none focus:ring-2 focus:ring-palm"
                    value={newItem.price}
                    onChange={(e) =>
                      setNewItem({ ...newItem, price: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ocean-700 uppercase mb-1">
                    Category
                  </label>

                  <input
                    type="text"
                    list="category-list"
                    className="w-full px-4 py-3 rounded-xl bg-ocean-50 border border-ocean-100 focus:outline-none focus:ring-2 focus:ring-palm font-medium"
                    value={newItem.category}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewItem({ ...newItem, category: value });

                      // Auto-add new category if it's not in the list and user presses Enter or Tab
                      if (value && !getAllCategories().includes(value)) {
                        const timer = setTimeout(() => {
                          if (
                            value &&
                            !customCategories.includes(value) &&
                            !["Pulutan", "Main", "Drinks", "Other"].includes(
                              value,
                            )
                          ) {
                            setCustomCategories((prev) => [...prev, value]);
                          }
                        }, 1000); // Add after 1 second of no typing
                        return () => clearTimeout(timer);
                      }
                    }}
                    placeholder="Type or select category..."
                  />

                  <datalist id="category-list">
                    <option value="Pulutan" />
                    <option value="Main" />
                    <option value="Drinks" />
                    <option value="Other" />
                    {customCategories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>

                  <p className="text-xs text-ocean-500 mt-1">
                    Type a new category or select from existing ones
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ocean-700 uppercase mb-1">
                  Description
                </label>

                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-ocean-50 border border-ocean-100 focus:outline-none focus:ring-2 focus:ring-palm"
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  placeholder="Short description..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ocean-700 uppercase mb-1">
                  Image
                </label>

                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-4 py-3 rounded-xl bg-ocean-50 border border-ocean-100 focus:outline-none focus:ring-2 focus:ring-palm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-palm file:text-white hover:file:bg-palm/80"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setNewItem({
                          ...newItem,
                          image_file: file,
                          image_url: "", // Clear URL when file is selected
                        });
                      }
                    }}
                  />

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-ocean-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-2 text-ocean-400 font-medium">
                        OR
                      </span>
                    </div>
                  </div>

                  <input
                    type="url"
                    className="w-full px-4 py-3 rounded-xl bg-ocean-50 border border-ocean-100 focus:outline-none focus:ring-2 focus:ring-palm"
                    value={newItem.image_url}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        image_url: e.target.value,
                        image_file: null, // Clear file when URL is entered
                      })
                    }
                    placeholder="https://..."
                  />
                </div>

                {newItem.image_file && (
                  <div className="mt-2 p-2 bg-ocean-50 rounded-lg">
                    <p className="text-xs text-ocean-600 font-medium">
                      Selected: {newItem.image_file.name}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-4 text-sm font-black mt-2"
              >
                Save Item
              </button>
            </form>
          </div>
        </div>
      )}

      {sortedCategories.map(([category, list], idx) => (
        <section
          key={category}
          id={category.toLowerCase().replace(/\s+/g, "-")}
          className="animate-fade-in"
        >
          {/* Category Header */}

          <div className="px-4 sm:px-6 mb-8 scroll-mt-24">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <span className="text-3xl sm:text-4xl">
                  {CATEGORY_EMOJIS[category] || "🍽️"}
                </span>

                <div>
                  <h2 className="heading-display text-2xl sm:text-5xl font-extrabold bg-gradient-to-r from-ocean-800 via-ocean-600 to-palm bg-clip-text text-transparent">
                    {category}
                  </h2>

                  <p className="text-sand-600 text-sm font-semibold tracking-wide uppercase mt-1">
                    {list.length} {list.length === 1 ? "dish" : "available"}
                  </p>
                </div>
              </div>

              {onAddNewItem && category === "Pulutan" && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="bg-white/80 backdrop-blur-md text-emerald-600 border-2 border-emerald-500/30 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 font-black px-4 py-2.5 sm:px-6 sm:py-3 rounded-2xl shadow-sm transition-all text-sm"
                >
                  + Add Menu Item
                </button>
              )}
            </div>

            <div className="h-1.5 w-24 bg-gradient-to-r from-ocean-500 via-ocean-300 to-transparent rounded-full shadow-sm" />
          </div>

          {/* Menu Items Grid */}

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 sm:px-6 lg:px-8">
            {list.map((item) => (
              <div
                key={item.id}
                className="group h-full rounded-[1.75rem] sm:rounded-[2.5rem] overflow-hidden bg-white/95 backdrop-blur-md border-2 border-white shadow-island hover:shadow-island-lg transition-all duration-500 hover:-translate-y-2 hover:border-ocean-200/50 flex flex-col"
              >
                {/* Image Container */}

                <div className="relative w-full h-40 sm:h-48 lg:h-52 overflow-hidden bg-gradient-to-br from-ocean-50 via-white to-sand-50">
                  {item.image_url || FALLBACK_IMAGES[item.name] ? (
                    <img
                      src={item.image_url || FALLBACK_IMAGES[item.name]}
                      alt={item.name}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl sm:text-7xl transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6">
                      {CATEGORY_EMOJIS[category] || "🍽️"}
                    </div>
                  )}

                  {/* Price Tag - positioned at left side bottom of image */}
                  <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-white/80 backdrop-blur-md px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-sm border border-white/50">
                    <span className="text-ocean-900 font-black text-sm sm:text-base">
                      ₱{Number(item.price).toFixed(0)}
                    </span>
                  </div>

                  {/* Action Buttons - Only show for owner */}
                  {onDeleteItem && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleEditItem(item)}
                        className="absolute top-3 left-3 sm:top-4 sm:left-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500/90 backdrop-blur-md flex items-center justify-center text-white hover:bg-blue-600 transition-all shadow-sm border border-white/50 group"
                        title="Edit item"
                      >
                        <span className="text-sm sm:text-base font-bold group-hover:scale-110 transition-transform">
                          ✏️
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="absolute top-3 left-14 sm:top-4 sm:left-14 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-500/90 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-600 transition-all shadow-sm border border-white/50 group"
                        title="Delete item"
                      >
                        <span className="text-sm sm:text-base font-bold group-hover:scale-110 transition-transform">
                          🗑️
                        </span>
                      </button>
                    </>
                  )}
                </div>

                {/* Content Container */}

                <div className="p-3 sm:p-4 lg:p-6 flex flex-col flex-1">
                  {/* Title */}

                  <h3 className="font-bold text-ocean-950 text-xs sm:text-sm lg:text-lg group-hover:text-palm transition-colors line-clamp-2 leading-tight">
                    {item.name}
                  </h3>

                  {/* Description */}

                  <p className="text-sand-600 text-xs mt-2 flex-1 line-clamp-2 leading-relaxed font-medium">
                    {item.description || "Fresh and delicious — Mangaon ta!"}
                  </p>

                  {/* Price & Quantity & Button */}

                  {onAdd && (
                    <div className="mt-2 sm:mt-3 lg:mt-4 pt-2 sm:pt-3 lg:pt-4 border-t border-ocean-50/50 space-y-2 sm:space-y-3 lg:space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="text-[8px] sm:text-[9px] lg:text-[10px] uppercase tracking-widest text-sand-400 font-black">
                            Select Quantity
                          </span>
                        </div>

                        <div className="flex items-center gap-1 bg-ocean-50/50 rounded-[1.25rem] p-1 border border-ocean-100/50 shadow-inner min-w-[70px] sm:min-w-[75px] lg:min-w-[85px] justify-center">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-4 h-4 sm:w-5 h-5 lg:w-6 lg:h-6 rounded-lg flex items-center justify-center text-ocean-700 hover:bg-white hover:shadow-sm transition-all font-bold text-xs sm:text-xs lg:text-sm active:scale-90"
                          >
                            −
                          </button>

                          <span className="w-3 sm:w-4 lg:w-5 text-center font-black text-ocean-950 text-[9px] sm:text-[10px] lg:text-xs">
                            {getQuantity(item.id)}
                          </span>

                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-4 h-4 sm:w-5 h-5 lg:w-6 lg:h-6 rounded-lg flex items-center justify-center text-ocean-700 hover:bg-white hover:shadow-sm transition-all font-bold text-xs sm:text-xs lg:text-sm active:scale-90"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className="w-full btn-primary text-[9px] sm:text-[10px] lg:text-[11px] font-black py-2 sm:py-2.5 lg:py-3 rounded-[1.25rem] transition-all duration-300 group-hover:shadow-ocean-200/50 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <span>Add to Cart</span>

                        <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs">
                          +{getQuantity(item.id)}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full border border-ocean-100 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-ocean-950">Edit Item</h3>

              <button
                onClick={() => setEditingItem(null)}
                className="text-ocean-300 hover:text-red-500 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ocean-700 uppercase mb-1">
                  Name
                </label>

                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-ocean-50 border border-ocean-100 focus:outline-none focus:ring-2 focus:ring-palm"
                  value={editItem.name}
                  onChange={(e) =>
                    setEditItem({ ...editItem, name: e.target.value })
                  }
                  placeholder="Dish name..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ocean-700 uppercase mb-1">
                    Price (₱)
                  </label>

                  <input
                    required
                    type="number"
                    className="w-full px-4 py-3 rounded-xl bg-ocean-50 border border-ocean-100 focus:outline-none focus:ring-2 focus:ring-palm"
                    value={editItem.price}
                    onChange={(e) =>
                      setEditItem({ ...editItem, price: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ocean-700 uppercase mb-1">
                    Category
                  </label>

                  <input
                    type="text"
                    list="category-list"
                    className="w-full px-4 py-3 rounded-xl bg-ocean-50 border border-ocean-100 focus:outline-none focus:ring-2 focus:ring-palm font-medium"
                    value={editItem.category}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditItem({ ...editItem, category: value });
                    }}
                    placeholder="Type or select category..."
                  />

                  <datalist id="category-list">
                    <option value="Pulutan" />
                    <option value="Main" />
                    <option value="Drinks" />
                    <option value="Other" />
                    {customCategories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ocean-700 uppercase mb-1">
                  Description
                </label>

                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-ocean-50 border border-ocean-100 focus:outline-none focus:ring-2 focus:ring-palm"
                  value={editItem.description}
                  onChange={(e) =>
                    setEditItem({ ...editItem, description: e.target.value })
                  }
                  placeholder="Short description..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ocean-700 uppercase mb-1">
                  Image
                </label>

                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-4 py-3 rounded-xl bg-ocean-50 border border-ocean-100 focus:outline-none focus:ring-2 focus:ring-palm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-palm file:text-white hover:file:bg-palm/80"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setEditItem({
                          ...editItem,
                          image_file: file,
                          image_url: "",
                        });
                      }
                    }}
                  />

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-ocean-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-2 text-ocean-400 font-medium">
                        OR
                      </span>
                    </div>
                  </div>

                  <input
                    type="url"
                    className="w-full px-4 py-3 rounded-xl bg-ocean-50 border border-ocean-100 focus:outline-none focus:ring-2 focus:ring-palm"
                    value={editItem.image_url}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        image_url: e.target.value,
                        image_file: null,
                      })
                    }
                    placeholder="https://..."
                  />
                </div>

                {editItem.image_file && (
                  <div className="mt-2 p-2 bg-ocean-50 rounded-lg">
                    <p className="text-xs text-ocean-600 font-medium">
                      Selected: {editItem.image_file.name}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-4 text-sm font-black mt-2"
              >
                Update Item
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/60 backdrop-blur-sm">
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-2xl max-w-sm w-full border border-ocean-100 animate-fade-in-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🗑️</span>
              </div>
              <h3 className="text-xl font-black text-ocean-950 mb-2">
                Delete Item?
              </h3>
              <p className="text-sm text-ocean-600">
                This action cannot be undone. The item will be permanently
                removed from the menu.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 py-3 rounded-xl bg-ocean-50 text-ocean-600 font-bold hover:bg-ocean-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-black hover:bg-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
