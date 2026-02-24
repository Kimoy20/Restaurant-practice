import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { hashPassword, verifyPassword } from "../lib/crypto";

export default function Login() {
  const [role, setRole] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegister) {
        // Create account
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select("email")
          .eq("email", email)
          .maybeSingle();

        if (checkError && checkError.code !== "PGRST116") {
          console.error("Check error:", checkError);
          setError("Registration failed. Please try again.");
          return;
        }

        if (existingUser) {
          setError("Email already exists. Please sign in.");
          return;
        }

        const hashedPassword = await hashPassword(password);
        const { data, error } = await supabase
          .from("users")
          .insert([
            {
              id: crypto.randomUUID(),
              email,
              password: hashedPassword,
              role,
            },
          ])
          .select();

        if (error) {
          console.error("Registration error:", error);
          setError(`Registration failed: ${error.message}`);
          return;
        }

        localStorage.setItem("current_user", email);
        localStorage.setItem("user_role", role);
        navigate(role === "customer" ? "/customer-tables" : "/table", {
          replace: true,
        });
      } else {
        // Login
        // Default admin backdoor just in case
        if (email === "admin@siarokaw.com" && password === "admin") {
          localStorage.setItem("current_user", email);
          localStorage.setItem("user_role", "owner");
          navigate("/table", { replace: true });
          return;
        }

        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.error("Login error:", error);
          setError("An error occurred. Please try again.");
          return;
        }

        if (!user) {
          setError("Invalid email or password.");
          return;
        }

        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
          setError("Invalid email or password.");
          return;
        }

        // Check if the role matches the registered role
        if (user.role !== role) {
          setError(
            `This account is registered as an ${user.role}. Please select the correct role.`,
          );
          return;
        }

        localStorage.setItem("current_user", email);
        localStorage.setItem("user_role", role);
        navigate(role === "customer" ? "/customer-tables" : "/table", {
          replace: true,
        });
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError(`An error occurred: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-island-page relative flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-ocean-300/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-palm/10 rounded-full blur-[100px]" />

      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/40 shadow-island-lg rounded-[2.5rem] p-8 sm:p-10 z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-ocean-500 to-ocean-700 shadow-lg mb-6">
            <span className="text-3xl">🌴</span>
          </div>
          <h1 className="heading-display text-3xl font-extrabold text-ocean-950 mb-2">
            {role === null
              ? "Welcome to Siaro Kaw"
              : isRegister
                ? "Create Account"
                : "Welcome Back"}
          </h1>
          <p className="text-sand-600 font-medium">
            {role === null
              ? "Who is visiting us today?"
              : isRegister
                ? "Join Siaro Kaw Kitchen Staff"
                : "Sign in to access the dashboard"}
          </p>
        </div>

        {role === null ? (
          <div className="space-y-4">
            <button
              onClick={() => setRole("customer")}
              className="w-full btn-secondary py-5 rounded-2xl font-black text-xl shadow-sm transition-all flex flex-col items-center justify-center gap-1 hover:border-palm/50 hover:bg-palm/5"
            >
              <span>I am a Customer</span>
              <span className="text-xs font-medium text-ocean-600 tracking-wider">
                Sign in to view the Island Menu
              </span>
            </button>
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-ocean-100/50"></div>
              <span className="flex-shrink-0 mx-4 text-ocean-300 text-xs font-black uppercase tracking-widest">
                OR
              </span>
              <div className="flex-grow border-t border-ocean-100/50"></div>
            </div>
            <button
              onClick={() => setRole("owner")}
              className="w-full btn-primary py-4 rounded-2xl font-black text-lg shadow-ocean-400/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              I am an Owner
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-black uppercase tracking-widest text-ocean-700 mb-2 ml-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="chef@siarokaw.com"
                  className="w-full px-5 py-4 rounded-2xl bg-white/50 border border-ocean-100/50 text-ocean-900 placeholder:text-sand-400 focus:outline-none focus:ring-4 focus:ring-ocean-500/20 focus:border-ocean-500 transition-all font-medium shadow-sm"
                  autoComplete="email"
                  autoFocus={!isRegister}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-black uppercase tracking-widest text-ocean-700 mb-2 ml-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 rounded-2xl bg-white/50 border border-ocean-100/50 text-ocean-900 placeholder:text-sand-400 focus:outline-none focus:ring-4 focus:ring-ocean-500/20 focus:border-ocean-500 transition-all font-medium shadow-sm"
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm font-bold px-4 py-3 rounded-xl border border-red-100/50 flex items-center gap-2">
                  <span>⚠️</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full btn-primary py-4 rounded-2xl font-black text-lg shadow-ocean-400/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isRegister ? "Register" : "Sign In"}
                <span className="text-xl">➔</span>
              </button>
            </form>

            <div className="mt-8 text-center border-t border-ocean-100/50 pt-8">
              <button
                type="button"
                onClick={() => {
                  setRole(null);
                  setError("");
                }}
                className="text-xs font-black uppercase tracking-widest text-ocean-400 hover:text-ocean-600 transition-colors mb-4 block w-full"
              >
                ← Back to User Selection
              </button>
              <p className="text-sand-600 text-sm font-medium">
                {isRegister
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError("");
                  }}
                  className="text-ocean-600 font-extrabold hover:text-ocean-800 transition-colors"
                >
                  {isRegister ? "Sign in instead" : "Create one now"}
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
