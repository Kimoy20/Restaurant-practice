import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import MenuGrid from "../MenuGrid";
import CustomerDrawer from "../CustomerDrawer";

export default function CustomerMenu() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

        const savedCustomItems = JSON.parse(localStorage.getItem('custom_menu_items') || '[]');
        if (menuData && menuData.length > 0) {
          setMenuItems([...menuData, ...savedCustomItems]);
        } else {
          setMenuItems([...mockMenuItems, ...savedCustomItems]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        const savedCustomItems = JSON.parse(localStorage.getItem('custom_menu_items') || '[]');
        setMenuItems([...mockMenuItems, ...savedCustomItems]);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-island-page flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-ocean-100 border-t-ocean-600 animate-spin" />
          <p className="text-ocean-700 font-bold tracking-widest uppercase text-xs">Loading Menu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-island-page">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-ocean-100/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Back Button */}
          <Link
            to="/table"
            className="inline-flex items-center gap-2 text-ocean-700 hover:text-palm font-bold transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-ocean-50 flex items-center justify-center group-hover:bg-ocean-100 group-hover:-translate-x-1 transition-all">
              <span className="text-xl">←</span>
            </div>
          </Link>

          {/* Info */}
          <div className="text-center flex flex-col items-center gap-1">
            <h1 className="heading-display text-2xl sm:text-4xl text-ocean-950 font-black">
              Explore Our Menu
            </h1>
            <p className="text-[10px] text-ocean-400 font-black uppercase tracking-[0.2em]">
              Siargao · Siaro Kaw
            </p>
          </div>

          {/* Burger Menu Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-10 h-10 rounded-xl bg-white/40 backdrop-blur-xl flex flex-col items-center justify-center gap-1.5 hover:bg-ocean-50/80 transition-all border border-ocean-100/50 group shadow-sm ml-2"
          >
            <div className="w-5 h-[2px] bg-ocean-900 rounded-full group-hover:bg-palm transition-colors"></div>
            <div className="w-5 h-[2px] bg-ocean-900 rounded-full group-hover:bg-palm transition-colors"></div>
            <div className="w-3 h-[2px] bg-ocean-900 rounded-full self-start ml-2.5 group-hover:bg-palm transition-colors mt-[-1px]"></div>
          </button>
        </div>
      </header>

      {/* Menu Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative pb-24">
        <MenuGrid items={menuItems} /> {/* Using MenuGrid without onAdd makes it view-only */}
      </main>

      <footer className="mt-auto py-12 px-6 text-center border-t border-ocean-100/50 w-full bg-white/30 backdrop-blur-sm relative z-10">
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-ocean-500">
            Created by Kim Guartel
          </p>
          <p className="text-[11px] font-medium text-ocean-700/80 leading-relaxed max-w-lg mx-auto">
            This website was created by Kim Guartel, an Information Technology student passionate about web development, system design, and innovative digital solutions. Dedicated to creating user-friendly and efficient applications, Kim aims to deliver quality projects with creativity and technical excellence.
          </p>
          <div className="pt-4 border-t border-ocean-200/50 flex flex-col items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ocean-400">
              kimoygwapo@gmail.com
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-ocean-400">
              © 2026 Kim Guartel. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Customer Drawer (shows orders / logout) */}
      <CustomerDrawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
