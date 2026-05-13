import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function SuperAdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const userRole = localStorage.getItem("user_role");

  useEffect(() => {
    if (userRole !== "super_admin") {
      navigate("/login");
      return;
    }
    loadData();
  }, [userRole, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: allUsers, error: allErr } = await supabase
        .from("users")
        .select("id, role, is_approved");

      if (allErr) throw allErr;

      const owners = allUsers.filter(u => u.role === "owner");
      setStats({
        total: allUsers.length,
        approved: owners.filter(u => u.is_approved).length,
        pending: owners.filter(u => !u.is_approved).length
      });

      setPendingUsers(owners.filter(u => !u.is_approved));
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ is_approved: true })
        .eq("id", userId);

      if (error) throw error;
      setMessage("User approved successfully! ✅");
      loadData();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error approving user:", err);
    }
  };

  const handleReject = async (userId) => {
    if (!confirm("Reject this business request?")) return;
    try {
      const { error } = await supabase.from("users").delete().eq("id", userId);
      if (error) throw error;
      setMessage("Request removed.");
      loadData();
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

  return (
    <div className="min-h-screen bg-[#051118] text-white selection:bg-palm/30">
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-ocean-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-palm/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-palm/10 border border-palm/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-palm">
                System Administrator
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-white">
              Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-palm to-ocean-400">Center</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/table" className="text-xs font-black uppercase tracking-widest text-ocean-400 hover:text-white transition-colors">
              Exit to App
            </Link>
            <button 
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black text-xs hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Pending Requests", val: stats.pending, color: "text-amber-400", bg: "bg-amber-400/5" },
            { label: "Approved Owners", val: stats.approved, color: "text-palm", bg: "bg-palm/5" },
            { label: "Total Platform Users", val: stats.total, color: "text-ocean-400", bg: "bg-ocean-400/5" }
          ].map((s, i) => (
            <div key={i} className={`p-8 rounded-[2rem] border border-white/5 ${s.bg} backdrop-blur-md`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">{s.label}</p>
              <p className={`text-4xl font-black ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black">Business Approvals</h2>
            <div className="h-px flex-grow mx-8 bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          {message && (
            <div className="mb-8 p-4 bg-palm/20 border border-palm/40 text-white rounded-2xl font-bold text-center animate-bounce-short">
              {message}
            </div>
          )}

          <div className="grid gap-6">
            {pendingUsers.length === 0 ? (
              <div className="py-20 text-center opacity-40">
                <div className="text-6xl mb-6">🏝️</div>
                <h3 className="text-xl font-bold italic">The island is quiet...</h3>
                <p className="text-sm">No new businesses are waiting for approval.</p>
              </div>
            ) : (
              pendingUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 transition-all duration-500"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-ocean-800 to-ocean-950 flex items-center justify-center text-2xl border border-white/10 group-hover:scale-110 transition-transform">
                      🏬
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-palm transition-colors">{user.email}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Awaiting owner status</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <button 
                      onClick={() => handleApprove(user.id)}
                      className="flex-1 md:flex-none px-10 py-4 bg-palm text-white rounded-2xl font-black text-sm hover:shadow-[0_0_30px_rgba(45,212,191,0.3)] hover:scale-105 active:scale-95 transition-all"
                    >
                      Approve Business
                    </button>
                    <button 
                      onClick={() => handleReject(user.id)}
                      className="p-4 bg-white/5 text-white/40 border border-white/10 rounded-2xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                      title="Reject"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer info */}
        <footer className="mt-16 text-center opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">Siaro Kaw Administrative Interface v1.0</p>
        </footer>
      </div>
    </div>
  );
}
