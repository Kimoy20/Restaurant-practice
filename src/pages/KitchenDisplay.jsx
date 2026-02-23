import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
}

export default function KitchenDisplay() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    if (!supabase) {
      setOrders([
        {
          id: '1',
          table: { name: 'Table 1' },
          status: 'pending',
          created_at: new Date().toISOString(),
          order_items: [
            { menu_item: { name: 'Kinilaw' }, quantity: 2 },
            { menu_item: { name: 'Coconut Shake' }, quantity: 1 },
          ],
        },
      ])
      setLoading(false)
      return
    }

    const { data: ordersData, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        created_at,
        table_id,
        tables ( name ),
        order_items (
          quantity,
          menu_items ( name )
        )
      `)
      .in('status', ['pending', 'preparing'])
      .order('created_at', { ascending: true })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setOrders(
      (ordersData || []).map((o) => ({
        id: o.id,
        table: o.tables,
        status: o.status,
        created_at: o.created_at,
        order_items: (o.order_items || []).map((oi) => ({
          menu_item: oi.menu_items,
          quantity: oi.quantity,
        })),
      }))
    )
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    if (!supabase) return

    const channel = supabase
      .channel('orders-kds')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        () => fetchOrders()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const setStatus = async (orderId, status) => {
    if (!supabase) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      )
      return
    }
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId)
    fetchOrders()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
        <div className="w-12 h-12 rounded-full border-2 border-blue-400/50 border-t-blue-300 animate-spin mb-4" />
        <p className="text-blue-200 font-medium">Loading orders…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-5 md:p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-400/30">
              <span className="text-2xl" aria-hidden>👨‍🍳</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                Kitchen Dashboard
              </h1>
              <p className="text-blue-400 text-xs font-black uppercase tracking-[0.2em]">
                Siaro Kaw — Local BBQ & More
              </p>
            </div>
          </div>
          <div className="mt-4 max-w-xl">
            <p className="text-slate-400 text-sm leading-relaxed">
              Welcome to the heart of Siaro Kaw. This dashboard provides real-time updates for all active orders. 
              Manage incoming tickets, track preparation status, and ensure every guest gets their Siargao feast 
              at its freshest.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="px-5 py-3 rounded-2xl bg-slate-800 border border-slate-700/50">
            <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Active Tickets</p>
            <p className="text-2xl font-black text-blue-100">{orders.length}</p>
          </div>
          <div className="px-5 py-3 rounded-2xl bg-slate-800 border border-slate-700/50 text-right">
            <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Status</p>
            <p className="text-sm font-black text-emerald-400 uppercase">Live & Connected</p>
          </div>
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {orders.length === 0 ? (
          <div className="col-span-full rounded-3xl bg-slate-800/40 border border-slate-700/50 p-12 text-center">
            <p className="text-slate-400">No active orders</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className={`rounded-3xl border-2 p-5 transition-all ${
                order.status === 'pending' ? 'border-orange-500/50 bg-slate-800' : 'border-blue-500/50 bg-slate-800/60'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="font-bold text-lg">{order.table?.name || 'Table?'}</span>
                  <span className="ml-2 text-slate-400 text-sm">{formatTime(order.created_at)}</span>
                </div>
                <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-slate-700">
                  {order.status}
                </span>
              </div>

              <ul className="space-y-2 mb-5">
                {order.order_items?.map((oi, idx) => (
                  <li key={idx} className="flex justify-between text-sm py-2 px-3 rounded-xl bg-slate-700/50">
                    <span>{oi.quantity}× {oi.menu_item?.name}</span>
                  </li>
                ))}
              </ul>

              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => setStatus(order.id, 'preparing')}
                    className="flex-1 rounded-xl bg-orange-600 py-2.5 font-bold hover:bg-orange-500"
                  >
                    Start
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    onClick={() => setStatus(order.id, 'ready')}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 font-bold hover:bg-emerald-500"
                  >
                    Ready
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}