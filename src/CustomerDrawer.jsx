import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

export default function CustomerDrawer({ open, onClose, tableId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadOrders();
    }
  }, [open, tableId]);

  const loadOrders = async () => {
    setLoading(true);
    
    try {
      console.log("CustomerDrawer: Loading orders for tableId:", tableId);
      
      // Get local orders first
      const localOrders = JSON.parse(localStorage.getItem('my_active_orders') || '[]');
      const filteredLocal = tableId
        ? localOrders.filter(o => o.tableId === tableId)
        : localOrders;

      console.log("CustomerDrawer: Local orders found:", filteredLocal.length);

      // Check if user is PIN authenticated for this table
      const pinAuth = JSON.parse(localStorage.getItem("pin_authenticated_tables") || "{}");
      console.log("CustomerDrawer: PIN auth data:", pinAuth);
      
      // Try multiple table ID formats for PIN auth check
      const tableNumericId = tableId?.replace('table-', '');
      const tableSlugId = tableId;
      
      const isPinAuthenticated = pinAuth[tableNumericId]?.authenticated || 
                               pinAuth[tableSlugId]?.authenticated || 
                               false;
      
      console.log("CustomerDrawer: PIN auth check:", {
        tableNumericId,
        tableSlugId,
        isPinAuthenticated
      });

      let supabaseOrders = [];
      
      // If PIN authenticated, fetch orders from Supabase
      if (isPinAuthenticated) {
        try {
          console.log("CustomerDrawer: Fetching Supabase orders for table:", tableNumericId);
          
          const { data: orderData, error: orderError } = await supabase
            .from("orders")
            .select("id, created_at, customer_name")
            .eq("table_id", tableNumericId)
            .in("status", ["pending", "preparing", "ready"])
            .order("created_at", { ascending: false });

          console.log("CustomerDrawer: Supabase orders result:", { data: orderData, error: orderError });

          if (orderError) {
            console.error("CustomerDrawer: Supabase order error:", orderError);
          }

          if (orderData && orderData.length > 0) {
            // Fetch order items for each order
            const { data: orderItemsData, error: itemsError } = await supabase
              .from("order_items")
              .select("order_id, quantity, notes, menu_items(id, name, price, category)")
              .in("order_id", orderData.map(o => o.id));

            console.log("CustomerDrawer: Order items result:", { data: orderItemsData, error: itemsError });

            if (itemsError) {
              console.error("CustomerDrawer: Order items error:", itemsError);
            }

            // Combine orders with their items
            supabaseOrders = orderData.map(order => {
              const items = orderItemsData
                ? orderItemsData
                    .filter(item => item.order_id === order.id)
                    .map(item => ({
                      id: item.menu_items.id,
                      name: item.menu_items.name,
                      price: item.menu_items.price,
                      category: item.menu_items.category,
                      quantity: item.quantity,
                      notes: item.notes
                    }))
                : [];

              return {
                id: order.id,
                tableId: tableId,
                items: items,
                timestamp: order.created_at,
                customerName: order.customer_name || "Guest",
                fromSupabase: true,
              };
            });
          } else {
            // Add mock order for testing if no real orders exist
            console.log("CustomerDrawer: No Supabase orders, adding mock order for testing");
            supabaseOrders = [
              {
                id: "mock-order-123",
                tableId: tableId,
                items: [
                  {
                    id: "mock-item-1",
                    name: "Sample Kinilaw",
                    price: 180,
                    category: "Pulutan",
                    quantity: 2,
                    notes: "Mock order for testing"
                  },
                  {
                    id: "mock-item-2", 
                    name: "Sample Pork Sisig",
                    price: 200,
                    category: "Pulutan",
                    quantity: 1,
                    notes: "Mock order for testing"
                  }
                ],
                timestamp: new Date().toISOString(),
                customerName: "Sample Customer",
                fromSupabase: false,
                isMock: true,
              },
            ];
          }
        } catch (error) {
          console.error("CustomerDrawer: Error fetching Supabase orders:", error);
        }
      }

      // Combine local and Supabase orders, prioritize Supabase
      const allOrders = [...supabaseOrders, ...filteredLocal];
      console.log("CustomerDrawer: Final orders array:", allOrders);
      setOrders(allOrders);
    } catch (error) {
      console.error("CustomerDrawer: Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const grandTotal = orders.reduce((sum, order) => {
    return sum + (order.items?.reduce((s, i) => s + Number(i.price) * (i.quantity || 1), 0) || 0);
  }, 0);

  const tableName = tableId
    ? `Table ${tableId.replace("table-", "")}`
    : "My Orders";

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
          {loading ? (
            <div className="mb-6 bg-ocean-800/50 border border-ocean-700/50 rounded-2xl px-5 py-4 text-center">
              <div className="w-6 h-6 border-2 border-palm/50 border-t-palm rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-ocean-300 text-sm font-medium">Loading orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="mb-6 bg-palm/20 border border-palm/30 rounded-2xl px-5 py-4 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-palm/70">
                  Total Bill
                </p>
                <p className="text-2xl font-black text-white">
                  ₱{grandTotal.toFixed(0)}
                </p>
              </div>
              <div className="text-3xl">🧾</div>
            </div>
          ) : (
            <div className="mb-6 bg-ocean-800/30 border border-ocean-700/30 rounded-2xl px-5 py-4 text-center">
              <p className="text-ocean-400 text-sm font-medium">No orders yet</p>
              <p className="text-ocean-500 text-xs mt-1">Add items to see your orders here</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-4 animate-fade-in-up">
              {loading ? (
                <div className="py-20 text-center">
                  <div className="w-8 h-8 border-2 border-palm/30 border-t-palm rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-ocean-400 text-sm">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-20 text-center opacity-30">
                  <p className="text-4xl mb-4">🍽️</p>
                  <p className="text-sm font-bold uppercase tracking-widest">
                    No orders yet
                  </p>
                  <p className="text-xs mt-2 font-medium">
                    Start ordering to see them here
                  </p>
                </div>
              ) : (
                orders.map((order, orderIndex) => (
                  <div
                    key={order.id || orderIndex}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 space-y-3"
                  >
                    {/* Order Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-ocean-400">
                          Order #{order.id?.slice(-8) || `Local-${orderIndex + 1}`}
                        </p>
                        {order.customerName && (
                          <p className="text-xs text-palm font-medium mt-1">
                            👤 {order.customerName}
                          </p>
                        )}
                        <p className="text-xs text-ocean-300 mt-1">
                          {order.timestamp
                            ? new Date(order.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Just now"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-white">
                          ₱{order.items?.reduce((s, i) => s + Number(i.price) * (i.quantity || 1), 0).toFixed(0) || 0}
                        </p>
                        {order.fromSupabase ? (
                          <span className="text-[8px] bg-palm/20 text-palm px-2 py-1 rounded-full font-black">
                            Kitchen
                          </span>
                        ) : order.isMock ? (
                          <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-black">
                            Sample
                          </span>
                        ) : (
                          <span className="text-[8px] bg-ocean-500/20 text-ocean-400 px-2 py-1 rounded-full font-black">
                            Local
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2">
                      {order.items?.map((item, itemIndex) => (
                        <div
                          key={item.id || itemIndex}
                          className="flex justify-between items-center bg-ocean-800/30 rounded-xl px-4 py-3"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-bold text-white">
                              {item.name}
                            </p>
                            <p className="text-xs text-ocean-400">
                              {item.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-palm">
                              ₱{Number(item.price).toFixed(0)}
                            </p>
                            <p className="text-xs text-ocean-300">
                              x{item.quantity || 1}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Logout Section */}
          <div className="pt-4 border-t border-ocean-800/50">
            <button
              onClick={() => {
                // Clear customer session
                localStorage.removeItem("current_user");
                localStorage.removeItem("user_role");
                // Clear PIN authentications
                localStorage.removeItem("pin_authenticated_tables");
                // Navigate to login
                window.location.href = "/login";
              }}
              className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 hover:text-red-300 font-black text-sm py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
