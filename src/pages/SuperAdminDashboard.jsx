import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, approvedOwners: 0, pendingOwners: 0, customers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // "pending", "approved", or "customers"
  const navigate = useNavigate();

  const userRole = localStorage.getItem("user_role");

  useEffect(() => {
    if (userRole !== "super_admin") {
      navigate("/login");
      return;
    }

    loadData();

    const subscription = supabase
      .channel("admin_sync_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userRole, navigate]);

  const loadData = async () => {
    setError(null);
    try {
      const { data: allUsers, error: allErr } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (allErr) throw allErr;

      if (allUsers) {
        setStats({
          total: allUsers.length,
          approvedOwners: allUsers.filter(u => u.role === "owner" && u.is_approved).length,
          pendingOwners: allUsers.filter(u => u.role === "owner" && !u.is_approved).length,
          customers: allUsers.filter(u => u.role === "customer").length
        });
        setUsers(allUsers);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
      setError("Database Error: Could not load users. Check RLS policies.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ is_approved: newStatus })
        .eq("id", userId);

      if (error) throw error;
      setMessage(newStatus ? "Access approved! ✅" : "Access revoked. 🔒");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Database error:", err);
      alert("Error: Check Supabase RLS policies!");
    }
  };

  const handleReject = async (userId) => {
    if (!confirm("Permanently delete this user?")) return;
    try {
      const { error } = await supabase.from("users").delete().eq("id", userId);
      if (error) throw error;
      setMessage("User deleted. 🗑️");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error rejecting user:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#051118] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-palm/20 border-t-palm animate-spin" />
      </div>
    );
  }

  const pendingList = users.filter(u => u.role === "owner" && !u.is_approved);
  const approvedList = users.filter(u => u.role === "owner" && u.is_approved);
  const customerList = users.filter(u => u.role === "customer");
  
  const displayList = activeTab === "pending" ? pendingList 
                    : activeTab === "approved" ? approvedList 
                    : customerList;

  return (
    <div className="min-h-screen bg-[#051118] text-white selection:bg-palm/30">
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-ocean-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-palm/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-white mb-2">
              Super <span className="text-palm">Admin</span>
            </h1>
            <p className="text-ocean-400 font-bold uppercase tracking-[0.2em] text-[10px]">Managing {stats.total} Users</p>
          </div>
          <button 
            onClick={() => { localStorage.clear(); navigate("/login"); }}
            className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black text-xs hover:bg-red-500 hover:text-white transition-all"
          >
            Sign Out
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 backdrop-blur-md">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Pending</p>
            <p className="text-3xl font-black text-amber-400">{stats.pendingOwners}</p>
          </div>
          <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 backdrop-blur-md">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Owners</p>
            <p className="text-3xl font-black text-palm">{stats.approvedOwners}</p>
          </div>
          <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 backdrop-blur-md">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Customers</p>
            <p className="text-3xl font-black text-ocean-400">{stats.customers}</p>
          </div>
          <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 backdrop-blur-md">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Total</p>
            <p className="text-3xl font-black text-white">{stats.total}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white/5 p-2 rounded-2xl w-fit border border-white/10 backdrop-blur-md">
          <button 
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === "pending" ? "bg-palm text-white" : "text-white/40 hover:text-white"}`}
          >
            Pending ({pendingList.length})
          </button>
          <button 
            onClick={() => setActiveTab("approved")}
            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === "approved" ? "bg-palm text-white" : "text-white/40 hover:text-white"}`}
          >
            Owners ({approvedList.length})
          </button>
          <button 
            onClick={() => setActiveTab("customers")}
            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === "customers" ? "bg-palm text-white" : "text-white/40 hover:text-white"}`}
          >
            Customers ({customerList.length})
          </button>
        </div>

        {/* User List */}
        <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-xl">
          {message && (
            <div className="mb-8 p-4 bg-palm/20 border border-palm/40 text-white rounded-2xl font-bold text-center animate-bounce-short text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-bold text-center text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-4">
            {displayList.length === 0 ? (
              <div className="py-20 text-center opacity-40">
                <p className="text-6xl mb-4">🏝️</p>
                <p className="font-bold">No users in this category.</p>
              </div>
            ) : (
              displayList.map((user) => (
                <div 
                  key={user.id} 
                  className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${user.role === 'customer' ? 'bg-ocean-900' : 'bg-palm/20 text-palm'}`}>
                      {user.role === 'customer' ? '🛒' : '👨‍🍳'}
                    </div>
                    <div>
                      <h3 className="font-black text-lg">{user.email}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                        {user.role.toUpperCase()} • Joined {new Date(user.created_at || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {activeTab === "pending" ? (
                      <>
                        <button onClick={() => handleUpdateStatus(user.id, true)} className="flex-1 md:flex-none px-8 py-3 bg-palm text-white rounded-xl font-black text-xs hover:scale-105 transition-all">Approve</button>
                        <button onClick={() => handleReject(user.id)} className="px-4 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all">Reject</button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleReject(user.id)}
                        className="flex-1 md:flex-none px-6 py-3 bg-white/5 text-red-400 border border-white/10 rounded-xl font-black text-xs hover:bg-red-500 hover:text-white transition-all"
                      >
                        Delete User
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <footer className="mt-12 text-center">
          <Link to="/table" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-palm transition-colors">
            Return to Public Dashboard
          </Link>
        </footer>
      </div>
    </div>
  );
}
