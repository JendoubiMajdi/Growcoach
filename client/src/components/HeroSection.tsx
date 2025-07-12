import React from 'react';
import { ChevronRight, Briefcase, User } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-gray-900/0 pointer-events-none"></div>
      
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-700/20 rounded-full blur-3xl"></div>
        <div className="absolute top-60 -left-40 w-80 h-80 bg-blue-700/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Trouvez l’offre idéale <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">pour vous</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              La plateforme de carrière intelligente connecte les candidats aux postes idéaux et les entreprises aux talents parfaits. Optimisée par l'IA, elle garantit la meilleure adéquation pour les deux parties.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <a 
                href="/signup" 
                className="group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg font-medium shadow-lg shadow-purple-700/20 hover:shadow-purple-700/40 transition-all duration-300 hover:-translate-y-0.5"
              >
                <User className="w-5 h-5" />
                <span>Pour les candidats</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              
              <a 
                href="/company-signup" 
                className="group flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-all duration-300 hover:-translate-y-0.5"
              >
                <Briefcase className="w-5 h-5" />
                <span>Pour les entreprises</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="relative w-full aspect-square max-w-xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-blue-600/20 rounded-2xl"></div>
              <img 
                src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Professional team collaboration" 
                className="relative z-10 w-full h-full object-cover rounded-2xl shadow-2xl shadow-blue-900/30"
              />
              
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl opacity-70 blur-2xl"></div>
            </div>
          </div>
        </div>
        
        <div className="mt-20 pt-8 border-t border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-4xl font-bold text-white">500+</p>
            <p className="text-gray-400 mt-2">Entreprises</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-white">10k+</p>
            <p className="text-gray-400 mt-2">Candidats</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-white">95%</p>
            <p className="text-gray-400 mt-2">Taux de réussite</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-white">7k+</p>
            <p className="text-gray-400 mt-2">Correspondances d'emploi</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
