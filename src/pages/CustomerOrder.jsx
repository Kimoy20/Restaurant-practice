import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import MenuGrid from "../MenuGrid";
import CartDrawer from "../CartDrawer";

export default function CustomerOrder() {
  const { tableId } = useParams();
  const [table, setTable] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderSent, setOrderSent] = useState(false);

  const mockMenuItems = [
    {
      id: "p1",
      name: "Kinilaw",
      description: "Fresh tuna ceviche with local citrus.",
      price: 180,
      category: "Pulutan",
      image_url: null,
    },
    {
      id: "p2",
      name: "Pork Sisig",
      description: "Sizzling pork sisig with crispy edges.",
      price: 200,
      category: "Pulutan",
      image_url: null,
    },
    {
      id: "m1",
      name: "Grilled Fish",
      description: "Fresh catch of the day, perfectly grilled.",
      price: 280,
      category: "Main",
      image_url: null,
    },
    {
      id: "d1",
      name: "Coconut Shake",
      description: "Fresh buko shake, refreshingly tropical.",
      price: 120,
      category: "Drinks",
      image_url: null,
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!supabase) {
          setTable({ id: "1", slug: tableId, name: `${tableId}` });
          setMenuItems(mockMenuItems);
          setLoading(false);
          return;
        }

        const { data: tableData, error: tableError } = await supabase
          .from("tables")
          .select("id, slug, name")
          .eq("slug", tableId)
          .single();

        const { data: menuData, error: menuError } = await supabase
          .from("menu_items")
          .select("*")
          .eq("is_available", true);

        if (tableData) setTable(tableData);
        if (menuData && menuData.length > 0) {
          setMenuItems(menuData);
        } else {
          // Fallback to mock items if query returns empty
          setMenuItems(mockMenuItems);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error loading menu:", err);
        setTable({ id: "1", slug: tableId, name: `${tableId}` });
        setMenuItems(mockMenuItems);
        setLoading(false);
      }
    };
    loadData();
  }, [tableId]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing)
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      return [...prev, { ...item, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (itemId, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== itemId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity: qty } : i)),
      );
    }
  };

  const submitOrder = async () => {
    if (!supabase) {
      setOrderSent(true);
      setTimeout(() => {
        setOrderSent(false);
        setCart([]);
      }, 2000);
      return;
    }

    // TODO: Submit order to Supabase
    setOrderSent(true);
    setTimeout(() => {
      setOrderSent(false);
      setCart([]);
    }, 2000);
  };

  const cartTotal = cart.reduce(
    (sum, i) => sum + Number(i.price) * i.quantity,
    0,
  );
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-island-page flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-ocean-300 border-t-ocean-600 animate-spin" />
          <p className="text-ocean-700 font-medium">Loading menu…</p>
        </div>
      </div>
    );
  }

  if (orderSent) {
    return (
      <div className="min-h-screen bg-island-page flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">✨</div>
          <h1 className="text-3xl md:text-4xl font-bold text-ocean-900 mb-2">
            Salamat!
          </h1>
          <p className="text-ocean-700 mb-6">
            Your order has been sent to the kitchen
          </p>
          <button
            onClick={() => setOrderSent(false)}
            className="btn-primary px-8 py-3 rounded-2xl"
          >
            Order More
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-island-page">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b-2 border-ocean-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Back Button */}
          <Link
            to="/table"
            className="inline-flex items-center gap-2 text-ocean-700 hover:text-ocean-900 font-semibold transition-colors group"
          >
            <span className="text-2xl group-hover:-translate-x-1 transition-transform">
              ←
            </span>
            <span className="hidden sm:inline">Back</span>
          </Link>

          {/* Table Info */}
          <div className="text-center">
            <h1 className="heading-display text-2xl sm:text-3xl text-ocean-900">
              {table?.name || "Siaro Kaw"}
            </h1>
            <p className="text-sm text-ocean-600 font-medium">
              Pick your favorites
            </p>
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative inline-flex items-center gap-2 bg-gradient-to-r from-ocean-500 to-ocean-600 text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:from-ocean-600 hover:to-ocean-700 active:scale-95"
          >
            <span className="text-lg">🛒</span>
            <span className="hidden sm:inline">Cart</span>
            <span className="inline-flex items-center justify-center min-w-6 h-6 ml-1 bg-white/30 rounded-full text-xs font-bold">
              {cartCount}
            </span>
          </button>
        </div>
      </header>

      {/* Menu Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <MenuGrid items={menuItems} onAdd={addToCart} />
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQty={updateQuantity}
        onSubmit={submitOrder}
      />
    </div>
  );
}
