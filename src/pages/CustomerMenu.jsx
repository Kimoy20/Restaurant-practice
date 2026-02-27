import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import MenuGrid from "../MenuGrid";
import CustomerDrawer from "../CustomerDrawer";

export default function CustomerMenu() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
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
        let menuData = null;

        if (supabase) {
          try {
            const { data: mData } = await supabase
              .from("menu_items")
              .select("*")
              .eq("is_available", true);
            menuData = mData;
          } catch (e) {
            console.error("Supabase fetch error:", e);
          }
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
  }, []);

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

  return (
    <div className="min-h-screen bg-island-page">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-ocean-100/30">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 py-2 sm:py-4 flex items-center justify-between">
          {/* Back Button */}
          <Link
            to="/customer-tables"
            className="inline-flex items-center gap-1 sm:gap-2 text-ocean-700 hover:text-palm font-bold transition-all group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-ocean-50 flex items-center justify-center group-hover:bg-ocean-100 group-hover:-translate-x-1 transition-all">
              <span className="text-base sm:text-xl">←</span>
            </div>
          </Link>

          {/* Info */}
          <div className="text-center flex flex-col items-center gap-1">
            <h1 className="heading-display text-lg sm:text-4xl text-ocean-950 font-black">
              Explore Our Menu
            </h1>
            <p className="text-[8px] sm:text-[10px] text-ocean-400 font-black uppercase tracking-[0.2em]">
              Siargao · Siaro Kaw
            </p>
          </div>

          {/* Burger Menu Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/40 backdrop-blur-xl flex flex-col items-center justify-center gap-1 hover:bg-ocean-50/80 transition-all border border-ocean-100/50 group shadow-sm ml-1 sm:ml-2"
          >
            <div className="w-3 sm:w-5 h-[2px] bg-ocean-900 rounded-full group-hover:bg-palm transition-colors"></div>
            <div className="w-3 sm:w-5 h-[2px] bg-ocean-900 rounded-full group-hover:bg-palm transition-colors"></div>
            <div className="w-2 sm:w-3 h-[2px] bg-ocean-900 rounded-full self-start ml-1 sm:ml-2 group-hover:bg-palm transition-colors mt-[-1px]"></div>
          </button>
        </div>
      </header>

      {/* Menu Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-6 py-6 sm:py-12 relative pb-20 sm:pb-24">
        <MenuGrid items={menuItems} />{" "}
        {/* Using MenuGrid without onAdd makes it view-only */}
      </main>

      <footer className="mt-auto py-8 sm:py-12 px-4 sm:px-6 text-center border-t border-ocean-100/50 w-full bg-white/30 backdrop-blur-sm relative z-10">
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-ocean-500">
            Created by Kim Guartel
          </p>
          <p className="text-[10px] sm:text-[11px] font-medium text-ocean-700/80 leading-relaxed max-w-lg mx-auto">
            This website was created by Kim Guartel, an Information Technology
            student passionate about web development, system design, and
            innovative digital solutions. Dedicated to creating user-friendly
            and efficient applications, Kim aims to deliver quality projects
            with creativity and technical excellence.
          </p>
          <div className="pt-4 border-t border-ocean-200/50 flex flex-col items-center gap-2">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-ocean-400">
              kimoygwapo@gmail.com
            </p>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-ocean-400">
              © 2026 Kim Guartel. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Customer Drawer (shows orders / logout) */}
      <CustomerDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {(showQuickScroll || categories.length > 1) && (
        <div className="fixed right-2 sm:right-4 bottom-4 sm:bottom-6 z-40 flex flex-col gap-2 items-end">
          {categories.length > 1 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCategoryOpen((v) => !v)}
                className="h-10 sm:h-12 px-3 sm:px-4 rounded-2xl bg-white/85 backdrop-blur-xl border border-ocean-100/60 shadow-island-sm text-ocean-900 font-black hover:bg-white transition-all active:scale-95 text-xs sm:text-sm"
                aria-label="Open categories"
                aria-expanded={isCategoryOpen}
                title="Categories"
              >
                Categories
              </button>

              {isCategoryOpen && (
                <div className="absolute right-0 bottom-14 w-40 sm:w-48 bg-white/95 backdrop-blur-xl border border-ocean-100/60 rounded-2xl shadow-xl overflow-hidden">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => scrollToCategory(cat)}
                      className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs font-black uppercase tracking-widest text-ocean-800 hover:bg-ocean-50 transition-colors"
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
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/85 backdrop-blur-xl border border-ocean-100/60 shadow-island-sm text-ocean-900 font-black hover:bg-white transition-all active:scale-95"
                aria-label="Scroll to top"
                title="Top"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={scrollToBottom}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/85 backdrop-blur-xl border border-ocean-100/60 shadow-island-sm text-ocean-900 font-black hover:bg-white transition-all active:scale-95"
                aria-label="Scroll to bottom"
                title="Bottom"
              >
                ↓
              </button>
            </>
          )}
        </div>
      )}

      {isCategoryOpen && (
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
