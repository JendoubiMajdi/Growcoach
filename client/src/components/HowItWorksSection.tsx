import React, { useState } from 'react';
import { User, Briefcase, ArrowRight } from 'lucide-react';

const HowItWorksSection = () => {
  const [activeTab, setActiveTab] = useState<'candidates' | 'companies'>('candidates');

  const candidateSteps = [
    {
      title: 'Créez votre profil',
      description: 'Inscrivez-vous et créez votre profil professionnel avec vos compétences, votre expérience et vos préférences de carrière.',
      image: 'https://images.pexels.com/photos/3760069/pexels-photo-3760069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      title: 'Évaluation des compétences',
      description: 'Passez nos évaluations sur mesure pour vérifier vos compétences et vous démarquer auprès des employeurs potentiels.',
      image: 'https://images.pexels.com/photos/8867431/pexels-photo-8867431.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      title: 'Recevoir des matchs',
      description: 'Notre algorithme d`IA vous proposera des emplois qui correspondent à vos compétences et à vos objectifs de carrière.',
      image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      title: 'Postuler et se connecter',
      description: 'Postulez en un clic et connectez-vous directement avec les entreprises intéressées par votre profil.',
      image: 'https://images.pexels.com/photos/3205570/pexels-photo-3205570.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    }
  ];

  const companySteps = [
    {
      title: 'Créer un profil d`entreprise',
      description: 'Créez le profil de votre entreprise en mettant en valeur votre culture, vos avantages et ce qui vous rend unique.',
      image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      title: 'Publier des offres d`emploi',
      description: 'Créez des offres d’emploi détaillées avec les compétences, l’expérience et d’autres préférences requises.',
      image: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      title: 'Examiner les candidats sélectionnés',
      description: 'Parcourez les candidats présélectionnés qui correspondent aux exigences de votre poste.',
      image: 'https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      title: 'Connectez-vous et embauchez',
      description: 'Contactez les candidats, planifiez des entretiens et prenez des décisions d`embauche en toute confiance.',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    }
  ];

  const activeSteps = activeTab === 'candidates' ? candidateSteps : companySteps;

  return (
    <section id="how-it-works" className="py-20 bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 bg-purple-900/30 text-purple-400 rounded-full text-sm font-medium mb-4">
            Comment ça marche
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Processus simple, résultats puissants
          </h2>
          <p className="text-xl text-gray-400">
            Notre plateforme permet aux candidats et aux entreprises de trouver facilement leur partenaire idéal.
          </p>
          
          <div className="mt-8 inline-flex p-1 bg-gray-800 rounded-lg">
            <button
              className={`flex items-center px-5 py-2 rounded-md transition-all ${
                activeTab === 'candidates' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('candidates')}
            >
              <User className="h-5 w-5 mr-2" />
              Pour les candidats
            </button>
            <button
              className={`flex items-center px-5 py-2 rounded-md transition-all ${
                activeTab === 'companies' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('companies')}
            >
              <Briefcase className="h-5 w-5 mr-2" />
              Pour les entreprises
            </button>
          </div>
        </div>

        <div className="space-y-16 mt-8">
          {activeSteps.map((step, index) => (
            <div 
              key={index} 
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-16`}
            >
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold">
                    {index + 1}
                  </div>
                  <ArrowRight className="h-5 w-5 mx-3 text-purple-400" />
                  <h3 className="text-2xl font-bold">{step.title}</h3>
                </div>
                <p className="text-lg text-gray-400 mb-6">{step.description}</p>
              </div>
              
              <div className="flex-1 w-full">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-blue-600/20 rounded-xl translate-x-2 translate-y-2"></div>
                  <img 
                    src={step.image} 
                    alt={step.title} 
                    className="relative z-10 w-full h-64 md:h-80 object-cover rounded-xl shadow-xl shadow-purple-900/20"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;