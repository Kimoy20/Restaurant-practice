import { Link } from "react-router-dom";

export default function AboutBusiness() {
  return (
    <div className="min-h-screen bg-island-page relative pb-10 flex flex-col items-center justify-center overflow-x-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-ocean-300/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-palm/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-20 flex-1 flex flex-col items-center justify-center z-10">
        
        <div className="text-center mb-10 w-full animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-gradient-to-br from-ocean-500 to-ocean-700 shadow-xl mb-8 transform -rotate-[5deg] hover:rotate-0 transition-transform duration-500">
            <span className="text-5xl">🥥</span>
          </div>

          <p className="text-sm font-black uppercase tracking-[0.3em] text-ocean-500 mb-4 inline-block px-4 py-1.5 bg-ocean-50/50 rounded-full border border-ocean-100/50 shadow-inner">Our Story</p>

          <h1 className="heading-display text-5xl md:text-7xl font-black text-ocean-950 mb-8 tracking-tight bg-gradient-to-r from-ocean-900 to-ocean-700 bg-clip-text text-transparent">
            Siaro Kaw BBQ
          </h1>
          
          <div className="relative p-10 md:p-14 bg-white/70 backdrop-blur-xl border border-white/50 shadow-island-lg rounded-[3rem]">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sand-400 via-palm to-sand-400"></div>
            
            <p className="text-lg md:text-xl text-ocean-800 font-medium leading-relaxed mb-6 italic">
              "Bringing the authentic taste of the islands specifically to your table."
            </p>

            <p className="text-sand-700 text-sm md:text-base leading-relaxed mb-10">
              At <strong className="text-ocean-900 text-lg">Siaro Kaw</strong>, we believe that food is more than just a meal—it's an experience that brings people together. Born from the vibrant culture of Siargao, our kitchen specializes in crafting unforgettable dishes featuring the freshest local catch and our signature wood-fired barbecue techniques. We pair tradition with modern flavors to create a dining experience you won't forget.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/customer-tables"
                className="w-full sm:w-auto btn-primary py-4 px-10 rounded-2xl font-black text-lg shadow-ocean-400/50 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <span>Choose a Table</span>
                <span className="text-2xl">➔</span>
              </Link>
            </div>
            
          </div>
        </div>

      </div>

      <footer className="mt-8 py-12 px-6 text-center border-t border-ocean-100/50 w-full bg-white/30 backdrop-blur-sm relative z-10">
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
    </div>
  );
}
