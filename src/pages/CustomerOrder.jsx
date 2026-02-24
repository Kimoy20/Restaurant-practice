import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import MenuGrid from "../MenuGrid";
import CartDrawer from "../CartDrawer";
import Receipt from "../Receipt";
import CustomerDrawer from "../CustomerDrawer";

export default function CustomerOrder() {
  const { tableId } = useParams();
  const userRole = localStorage.getItem("user_role");
  const isCustomer = userRole === "customer";
  const [table, setTable] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const [isTakenByOther, setIsTakenByOther] = useState(false);
  const [sessionOrders, setSessionOrders] = useState([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [showQuickScroll, setShowQuickScroll] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

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
          setTable({ id: "1", slug: tableId, name: `Table ${tableId}` });
          setMenuItems(mockMenuItems);
          setLoading(false);
          return;
        }

        let tableData = null;
        let tableError = null;
        let menuData = null;

        try {
          const { data: tData, error: tErr } = await supabase
            .from("tables")
            .select("id, slug, name")
            .eq("slug", tableId)
            .single();
          tableData = tData;
          tableError = tErr;

          const { data: mData } = await supabase
            .from("menu_items")
            .select("*")
            .eq("is_available", true);
          menuData = mData;
        } catch (e) {
          console.error("Supabase fetch error:", e);
        }

        let currentTable = tableData;
        if (tableError || !tableData) {
          console.warn("Table fetch issue, using fallback:", tableError);
          // Standard mapping: slug table-1 -> id 1, table-2 -> id 2 ...
          const numericId = tableId.split("-")[1] || "1";
          currentTable = {
            id: numericId,
            slug: tableId,
            name: `Table ${numericId}`,
          };
        }
        setTable(currentTable);

        const currentActiveOrders = JSON.parse(
          localStorage.getItem("my_active_orders") || "[]",
        );
        const tableSessionOrders = currentActiveOrders.filter(
          (o) => o.tableId === tableId,
        );
        setSessionOrders(tableSessionOrders);

        // Only query active orders if we have a table ID
        let activeOrderData = null;
        if (supabase && currentTable?.id) {
          try {
            const { data } = await supabase
              .from("orders")
              .select("id")
              .eq("table_id", currentTable.id)
              .in("status", ["pending", "preparing", "ready"])
              .limit(1);
            activeOrderData = data;
          } catch (e) {
            console.error("Active order fetch error:", e);
          }
        }

        if (activeOrderData && activeOrderData.length > 0) {
          const activeOrderId = activeOrderData[0].id;
          const isActiveForMe = currentActiveOrders.some(
            (o) => o.id === activeOrderId || o === activeOrderId,
          );
          setHasActiveOrder(isActiveForMe || tableSessionOrders.length > 0);
          setIsTakenByOther(!isActiveForMe && tableSessionOrders.length === 0);
        } else {
          setHasActiveOrder(tableSessionOrders.length > 0);
          setIsTakenByOther(false);
        }

        const savedCustomItems = JSON.parse(
          localStorage.getItem("custom_menu_items") || "[]",
        );
        if (menuData && menuData.length > 0) {
          setMenuItems([...menuData, ...savedCustomItems]);
        } else {
          setMenuItems([...mockMenuItems, ...savedCustomItems]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        const savedCustomItems = JSON.parse(
          localStorage.getItem("custom_menu_items") || "[]",
        );
        setMenuItems([...mockMenuItems, ...savedCustomItems]);
        setLoading(false);
      }
    };
    loadData();
  }, [tableId]);

  useEffect(() => {
    const onScroll = () => {
      setShowQuickScroll(window.scrollY > 250);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isCategoryOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsCategoryOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isCategoryOpen]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    const height = document.documentElement.scrollHeight;
    window.scrollTo({ top: height, behavior: "smooth" });
  };

  const categoryOrder = ["Pulutan", "Main", "Drinks", "Other"];
  const categories = Array.from(
    new Set((menuItems || []).map((i) => i.category || "Other")),
  ).sort((a, b) => {
    const ai = categoryOrder.indexOf(a);
    const bi = categoryOrder.indexOf(b);
    const aRank = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
    const bRank = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
    return aRank - bRank;
  });

  const categoryId = (cat) => cat.toLowerCase().replace(/\s+/g, "-");

  const scrollToCategory = (cat) => {
    const el = document.getElementById(categoryId(cat));
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsCategoryOpen(false);
  };

  const handleAddNewItem = (newItem) => {
    setMenuItems((prev) => [...prev, newItem]);
    const localCustomItems = JSON.parse(
      localStorage.getItem("custom_menu_items") || "[]",
    );
    localStorage.setItem(
      "custom_menu_items",
      JSON.stringify([...localCustomItems, newItem]),
    );
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const quantityToAdd = 1; // You can pass actual qty here if needed
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
    if (!table?.id || cart.length === 0) {
      alert("Cannot submit order: missing table or cart is empty.");
      return;
    }

    const orderId = crypto.randomUUID();
    const total = cart.reduce(
      (sum, i) => sum + Number(i.price) * i.quantity,
      0,
    );

    // Prepare main order data for Supabase
    const orderPayload = {
      id: orderId,
      table_id: table.id,
      status: "pending",
    };

    console.log(
      "Submitting main order to Supabase with payload:",
      orderPayload,
    );

    try {
      // 1️⃣ Insert main order into orders table
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([orderPayload])
        .select()
        .single();

      if (orderError) {
        console.error("Supabase order insert error:", orderError);
        alert(
          `Failed to save order: ${orderError.message || JSON.stringify(orderError)}`,
        );
        return;
      }

      console.log("Main order successfully saved to Supabase ✅", orderData);

      // 2️⃣ Insert each item into order_items table
      const itemsToInsert = cart.map((item) => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        notes: "",
      }));

      console.log("Inserting order items:", itemsToInsert);

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (itemsError) {
        console.error("Order items insert error:", itemsError);
        alert(
          `Failed to save order items: ${itemsError.message || JSON.stringify(itemsError)}`,
        );
        return;
      }

      console.log("Order items successfully saved to Supabase ✅");

      // Save order ID to localStorage to track "ownership"
      const myOrders = JSON.parse(
        localStorage.getItem("my_active_orders") || "[]",
      );
      const newOrder = {
        id: orderId,
        tableId: tableId,
        items: [...cart],
        timestamp: orderPayload.timestamp,
      };
      localStorage.setItem(
        "my_active_orders",
        JSON.stringify([...myOrders, newOrder]),
      );

      // Also update manual status to "occupied" so it reflects everywhere
      const manualStatuses = JSON.parse(
        localStorage.getItem("manual_table_statuses") || "{}",
      );
      if (table?.id) {
        manualStatuses[table.id] = "occupied";
        localStorage.setItem(
          "manual_table_statuses",
          JSON.stringify(manualStatuses),
        );
      }

      setSessionOrders((prev) => [...prev, newOrder]);
      setCart([]);
      setCartOpen(false);
      setHasActiveOrder(true);
      setShowOrderSuccess(true);
      setTimeout(() => setShowOrderSuccess(false), 3000);
    } catch (err) {
      console.error("Unexpected error during order submission:", err);
      alert(`Unexpected error: ${err.message || JSON.stringify(err)}`);
    }
  };

  const handleCheckout = () => {
    console.log("Handle checkout initiated. sessionOrders:", sessionOrders);
    if (!sessionOrders || sessionOrders.length === 0) {
      alert("No orders to checkout yet!");
      return;
    }

    // Aggregate ALL items from ALL orders in this session
    const allItems = [];
    const itemMap = new Map();

    sessionOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (itemMap.has(item.id)) {
          const existing = itemMap.get(item.id);
          existing.quantity += item.quantity;
        } else {
          itemMap.set(item.id, { ...item });
        }
      });
    });

    const finalOrder = {
      id: "BILL-" + tableId + "-" + Date.now().toString().slice(-4),
      items: Array.from(itemMap.values()),
      total: Array.from(itemMap.values()).reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      ),
      tableId: tableId,
      tableName: table?.name || `Table ${tableId.split("-")[1] || ""}`,
      timestamp: new Date().toISOString(),
    };

    setSubmittedOrder(finalOrder);
    setIsCheckingOut(true);
  };

  const finalizeCheckout = () => {
    // Record this order globally for sales tracking
    if (submittedOrder) {
      const globalOrders = JSON.parse(
        localStorage.getItem("global_completed_orders") || "[]",
      );
      localStorage.setItem(
        "global_completed_orders",
        JSON.stringify([...globalOrders, submittedOrder]),
      );
    }

    // Clear local session for THIS table
    const myOrders = JSON.parse(
      localStorage.getItem("my_active_orders") || "[]",
    );
    const remainingOrders = myOrders.filter((o) => o.tableId !== tableId);
    localStorage.setItem("my_active_orders", JSON.stringify(remainingOrders));

    // Reset manual status if it was occupied
    const manualStatuses = JSON.parse(
      localStorage.getItem("manual_table_statuses") || "{}",
    );
    if (table?.id) {
      delete manualStatuses[table.id];
      localStorage.setItem(
        "manual_table_statuses",
        JSON.stringify(manualStatuses),
      );
    }

    setSubmittedOrder(null);
    setSessionOrders([]);
    setHasActiveOrder(false);
    setIsCheckingOut(false);
    window.location.href = "/table";
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
          <div className="w-16 h-16 rounded-full border-4 border-ocean-100 border-t-ocean-600 animate-spin" />
          <p className="text-ocean-700 font-bold tracking-widest uppercase text-xs">
            Loading Menu
          </p>
        </div>
      </div>
    );
  }

  if (isTakenByOther) {
    return (
      <div className="min-h-screen bg-island-page flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white/90 backdrop-blur-xl p-10 rounded-[3rem] border-2 border-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sand-400 via-palm to-sand-400"></div>
          <span className="text-7xl mb-6 block">🔒</span>
          <h1 className="text-3xl font-black text-ocean-950 mb-4 tracking-tight">
            Table is taken
          </h1>
          <p className="text-ocean-700 font-medium leading-relaxed mb-8">
            This table currently has an active order. If you're with this group,
            please ask them to add to their order!
          </p>
          <button
            onClick={() => (window.location.href = "/table")}
            className="w-full btn-secondary py-4"
          >
            Choose another table
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-island-page">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-ocean-100/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          {/* Back Button */}
          <Link
            to={
              localStorage.getItem("user_role") === "customer"
                ? "/about"
                : "/table"
            }
            className="inline-flex items-center gap-2 text-ocean-700 hover:text-palm font-bold transition-all group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-ocean-50 flex items-center justify-center group-hover:bg-ocean-100 group-hover:-translate-x-1 transition-all">
              <span className="text-lg sm:text-xl">←</span>
            </div>
          </Link>

          {/* Table Info & Actions */}
          <div className="text-center flex flex-col items-center gap-1">
            <h1 className="heading-display text-xl sm:text-4xl text-ocean-950 font-black">
              {table?.name || "Siaro Kaw"}
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-[9px] sm:text-[10px] text-ocean-400 font-black uppercase tracking-[0.2em]">
                {hasActiveOrder
                  ? "Dugang Order — Add More"
                  : "Island BBQ & Kitchen"}
              </p>
              {!isCustomer && hasActiveOrder && (
                <button
                  onClick={handleCheckout}
                  className="bg-palm/10 text-palm hover:bg-palm hover:text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border border-palm/20"
                >
                  Done Eating 🍽️
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Cart Button - Only for Owners */}
            {!isCustomer && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative inline-flex items-center gap-2 bg-gradient-to-br from-ocean-500 via-ocean-600 to-ocean-800 text-white font-black px-4 py-2.5 sm:px-6 sm:py-3 rounded-2xl shadow-lg border border-white/20 hover:shadow-ocean-200/50 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <span className="text-xl">🛒</span>
                <span className="hidden sm:inline text-xs uppercase tracking-wider">
                  My Plate
                </span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-palm text-[10px] text-white ring-4 ring-white shadow-lg animate-fade-in">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Burger Menu Button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/40 backdrop-blur-xl flex flex-col items-center justify-center gap-1.5 hover:bg-ocean-50/80 transition-all border border-ocean-100/50 group shadow-sm ml-2"
            >
              <div className="w-4 sm:w-5 h-[2.5px] bg-ocean-900 rounded-full group-hover:bg-palm transition-colors"></div>
              <div className="w-4 sm:w-5 h-[2.5px] bg-ocean-900 rounded-full group-hover:bg-palm transition-colors"></div>
              <div className="w-2.5 sm:w-3 h-[2.5px] bg-ocean-900 rounded-full self-start ml-3 group-hover:bg-palm transition-colors mt-[-1px]"></div>
            </button>
          </div>
        </div>
      </header>

      {/* Menu Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative">
        {showOrderSuccess && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-palm text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white/20 animate-bounce">
            <span className="text-xl">✅</span>
            <span className="text-xs font-black uppercase tracking-widest">
              Order sent to kitchen!
            </span>
          </div>
        )}
        <MenuGrid
          items={menuItems}
          onAdd={isCustomer ? undefined : addToCart}
          onAddNewItem={isCustomer ? undefined : handleAddNewItem}
        />
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        sessionOrders={sessionOrders}
        onUpdateQty={updateQuantity}
        onSubmit={submitOrder}
      />

      {/* Receipt View */}
      {submittedOrder && (
        <Receipt order={submittedOrder} onClose={finalizeCheckout} />
      )}

      {/* Customer Drawer */}
      <CustomerDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        tableId={tableId}
      />

      {!isCustomer && (showQuickScroll || categories.length > 1) && (
        <div className="fixed right-4 bottom-6 z-40 flex flex-col gap-2 items-end">
          {categories.length > 1 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCategoryOpen((v) => !v)}
                className="h-12 px-4 rounded-2xl bg-white/85 backdrop-blur-xl border border-ocean-100/60 shadow-island-sm text-ocean-900 font-black hover:bg-white transition-all active:scale-95"
                aria-label="Open categories"
                aria-expanded={isCategoryOpen}
                title="Categories"
              >
                Categories
              </button>

              {isCategoryOpen && (
                <div className="absolute right-0 bottom-14 w-48 bg-white/95 backdrop-blur-xl border border-ocean-100/60 rounded-2xl shadow-xl overflow-hidden">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => scrollToCategory(cat)}
                      className="w-full text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-ocean-800 hover:bg-ocean-50 transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {showQuickScroll && (
            <>
              <button
                type="button"
                onClick={scrollToTop}
                className="w-12 h-12 rounded-2xl bg-white/85 backdrop-blur-xl border border-ocean-100/60 shadow-island-sm text-ocean-900 font-black hover:bg-white transition-all active:scale-95"
                aria-label="Scroll to top"
                title="Top"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={scrollToBottom}
                className="w-12 h-12 rounded-2xl bg-white/85 backdrop-blur-xl border border-ocean-100/60 shadow-island-sm text-ocean-900 font-black hover:bg-white transition-all active:scale-95"
                aria-label="Scroll to bottom"
                title="Bottom"
              >
                ↓
              </button>
            </>
          )}
        </div>
      )}

      {isCategoryOpen && !isCustomer && (
        <button
          type="button"
          className="fixed inset-0 z-30 cursor-default"
          aria-label="Close categories"
          onClick={() => setIsCategoryOpen(false)}
        />
      )}
    </div>
  );
}
