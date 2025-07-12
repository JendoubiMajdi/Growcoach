import React from 'react';
import { FileSearch, BarChart3, Zap, Users, Shield, TrendingUp, Lightbulb } from "lucide-react";

const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}) => {
  return (
    <div className="group bg-gray-800/50 hover:bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1">
      <div className="w-12 h-12 bg-purple-900/50 group-hover:bg-purple-900 rounded-lg flex items-center justify-center mb-5 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{description}</p>
    </div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <Lightbulb className="h-6 w-6 text-purple-400" />,
      title: 'Algorithme de correspondance par IA',
      description: 'Notre système de correspondance avancé connecte les candidats aux offres d’emploi en fonction de leurs compétences, de leur expérience et de leurs préférences en matière de lieu de travail.'
    },
    {
      icon: <FileSearch className="h-6 w-6 text-purple-400" />,
      title: 'Évaluation des compétences',
      description: 'Évaluez vos compétences grâce à nos outils d’évaluation complets afin d’améliorer la précision de la correspondance avec les offres d’emploi.'
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-purple-400" />,
      title: 'Tableau de bord analytique',
      description: 'Obtenez des informations détaillées sur les performances des candidatures et les opportunités d’amélioration.'
    },
    {
      icon: <Zap className="h-6 w-6 text-purple-400" />,
      title: 'Candidature rapide',
      description: 'Postulez aux offres correspondantes en un seul clic, simplifiant ainsi le processus de candidature.'
    },
    {
      icon: <Users className="h-6 w-6 text-purple-400" />,
      title: 'Réserve de talents',
      description: 'Les entreprises peuvent constituer une réserve de candidats présélectionnés pour de futures offres d’emploi.'
    },
    {
      icon: <Shield className="h-6 w-6 text-purple-400" />,
      title: 'Contrôles de confidentialité',
      description: 'Contrôlez qui peut voir votre profil et quelles informations sont partagées avec les employeurs.'
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-purple-400" />,
      title: 'Parcours de progression de carrière',
      description: 'Recevez des recommandations personnalisées sur les compétences à développer pour atteindre votre carrière de rêve.'
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-purple-400" />,
      title: 'Recommandations intelligentes',
      description: 'Recevez des offres d’emploi correspondant à vos objectifs et aspirations professionnels.'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 bg-purple-900/30 text-purple-400 rounded-full text-sm font-medium mb-4">
            Fonctionnalités de la plateforme
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Tout ce dont vous avez besoin pour réussir votre carrière
          </h2>
          <p className="text-xl text-gray-400">
            Growcoach fournit des fonctionnalités puissantes pour les candidats et les entreprises, créant des correspondances parfaites basées sur les compétences, l'expérience et l'adéquation culturelle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;