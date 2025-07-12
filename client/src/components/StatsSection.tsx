import React from 'react';
import { Activity, Briefcase, Users, Target } from 'lucide-react';

const StatsSection = () => {
  const stats = [
    {
      icon: <Users className="h-8 w-8 text-purple-400" />,
      value: '15,000+',
      label: 'Utilisateurs actifs',
      description: 'Professionnels et entreprises utilisant quotidiennement notre plateforme'
    },
    {
      icon: <Briefcase className="h-8 w-8 text-purple-400" />,
      value: '5,000+',
      label: 'Emplois affichés',
      description: 'De nouvelles opportunités s`ajoutent chaque jour dans tous les secteurs d`activité'
    },
    {
      icon: <Activity className="h-8 w-8 text-purple-400" />,
      value: '92%',
      label: 'Taux de correspondance',
      description: 'Taux de réussite de notre algorithme de correspondance IA'
    },
    {
      icon: <Target className="h-8 w-8 text-purple-400" />,
      value: '3x',
      label: 'Embauche plus rapide',
      description: 'Réduire le délai d`embauche par rapport aux méthodes traditionnelles'
    }
  ];

  return (
    <section className="py-20 bg-gray-900 overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-40 -right-40 w-80 h-80 bg-purple-700/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 -left-40 w-80 h-80 bg-blue-700/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-3 py-1 bg-purple-900/30 text-purple-400 rounded-full text-sm font-medium mb-4">
            Impact sur la plateforme
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Faire la différence dans le recrutement
          </h2>
          <p className="text-xl text-gray-400">
            Notre plateforme transforme la façon dont les candidats trouvent des emplois et dont les entreprises découvrent les talents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-gradient-to-b from-gray-800 to-gray-800/40 backdrop-blur-sm p-8 rounded-xl border border-gray-700 transition-all duration-300 hover:border-purple-500/30 hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-5">{stat.icon}</div>
                <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </h3>
                <p className="text-xl font-semibold text-white mb-3">{stat.label}</p>
                <p className="text-gray-400">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;