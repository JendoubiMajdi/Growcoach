import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
  id: number;
  content: string;
  name: string;
  role: string;
  rating: number;
  image: string;
  type: 'candidate' | 'company';
}

const TestimonialsSection = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      content: "Growcoach m'a trouvé un emploi parfaitement adapté à mes compétences et à mes objectifs de carrière. Les correspondances basées sur l'IA étaient incroyablement pertinentes, et j'ai trouvé le poste de mes rêves en deux semaines !",
      name: "Sarah Johnson",
      role: "Concepteur UX",
      rating: 5,
      image: "https://images.pexels.com/photos/773371/pexels-photo-773371.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      type: 'candidate'
    },
    {
      id: 2,
      content: "En tant que start-up technologique, trouver des développeurs possédant les compétences requises était toujours un défi, jusqu'à ce que nous découvrions Growcoach. Leur algorithme de mise en relation nous a permis de trouver des candidats possédant non seulement des compétences techniques, mais aussi une excellente adéquation culturelle.",
      name: "Michael Chen",
      role: "CTO",
      rating: 5,
      image: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      type: 'company'
    },
    {
      id: 3,
      content: "Les évaluations de compétences sur Growcoach m'ont aidé à identifier mes points faibles. Après avoir travaillé sur ces compétences, j'ai obtenu de bien meilleures correspondances et j'ai décroché un poste qui a considérablement fait progresser ma carrière.",
      name: "David Rodriguez",
      role: "Full Stack Developer",
      rating: 4,
      image: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      type: 'candidate'
    },
    {
      id: 4,
      content: "Notre processus de recrutement a été 70 % plus efficace depuis que nous utilisons Growcoach. Les candidats présélectionnés nous font gagner un temps précieux et la qualité des correspondances est exceptionnelle.",
      name: "Rebecca Taylor",
      role: "HR Director",
      rating: 5,
      image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      type: 'company'
    }
  ];

  const [activeType, setActiveType] = useState<'all' | 'candidate' | 'company'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredTestimonials = activeType === 'all' 
    ? testimonials 
    : testimonials.filter(t => t.type === activeType);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredTestimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + filteredTestimonials.length) % filteredTestimonials.length);
  };

  return (
    <section className="py-20 bg-gray-900/70">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 bg-purple-900/30 text-purple-400 rounded-full text-sm font-medium mb-4">
            Histoires de réussite
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-xl text-gray-400">
            Expériences réelles de candidats et d'entreprises qui ont trouvé leur partenaire idéal sur Growcoach.
          </p>
          
          <div className="mt-8 inline-flex p-1 bg-gray-800 rounded-lg">
            <button
              className={`px-5 py-2 rounded-md transition-all ${
                activeType === 'all' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => {
                setActiveType('all');
                setCurrentIndex(0);
              }}
            >
              Toutes les histoires
            </button>
            <button
              className={`px-5 py-2 rounded-md transition-all ${
                activeType === 'candidate' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => {
                setActiveType('candidate');
                setCurrentIndex(0);
              }}
            >
              Candidats
            </button>
            <button
              className={`px-5 py-2 rounded-md transition-all ${
                activeType === 'company' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => {
                setActiveType('company');
                setCurrentIndex(0);
              }}
            >
              Entreprises
            </button>
          </div>
        </div>

        {filteredTestimonials.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="bg-gray-800 rounded-2xl p-8 md:p-10 shadow-xl border border-gray-700">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-purple-500/30 flex-shrink-0">
                    <img 
                      src={filteredTestimonials[currentIndex].image} 
                      alt={filteredTestimonials[currentIndex].name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${i < filteredTestimonials[currentIndex].rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} 
                        />
                      ))}
                    </div>
                    
                    <blockquote className="text-lg md:text-xl italic text-gray-300 mb-6">
                      "{filteredTestimonials[currentIndex].content}"
                    </blockquote>
                    
                    <div>
                      <p className="font-bold text-white text-lg">{filteredTestimonials[currentIndex].name}</p>
                      <p className="text-gray-400">
                        {filteredTestimonials[currentIndex].role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-5 left-0 right-0 flex justify-center gap-4">
                <button 
                  onClick={prevTestimonial}
                  className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-600 transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={nextTestimonial}
                  className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-600 transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="mt-12 flex justify-center">
              {filteredTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 mx-1 rounded-full ${index === currentIndex ? 'bg-purple-500' : 'bg-gray-600'}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;