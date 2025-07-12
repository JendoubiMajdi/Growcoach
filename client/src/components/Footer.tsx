import React from 'react';
import { BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const links = {
    company: [
      { name: 'À propos de nous', href: '#' },
      { name: 'Notre équipe', href: '#' },
      { name: 'Carrières', href: '#' },
      { name: 'Presse', href: '#' },
    ],
    platform: [
      { name: 'Pour les candidats', href: '#' },
      { name: 'Pour les entreprises', href: '#' },
      { name: 'Tarifs', href: '#' },
      { name: 'Histoires de réussite', href: '#' },
    ],
    resources: [
      { name: 'Blogue', href: '#' },
      { name: 'Guides de carrière', href: '#' },
      { name: 'Tutoriels', href: '#' },
      { name: 'Centre d`aide', href: '#' },
    ],
    legal: [
      { name: 'politique de confidentialité', href: '#' },
      { name: 'Conditions d`utilisation', href: '#' },
      { name: 'Politique en matière de cookies', href: '#' },
      { name: 'Conformité RGPD', href: '#' },
    ],
  };

  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center space-x-2 mb-6">
              <img
                src="http://localhost:5000/uploads/1.png"
                alt="Growcoach Logo"
                className="h-10 w-10 object-contain"
                style={{ borderRadius: '4px' }}
              />
              <span className="text-xl font-bold text-white">Growcoach</span>
            </a>
            <p className="mb-6 max-w-md">
              La plateforme de carrière intelligente qui connecte les candidats à leurs emplois idéaux et les entreprises aux talents parfaits, grâce à la mise en correspondance alimentée par l'IA.
            </p>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-purple-500" />
                <a href="mailto:contact@growcoach.com" className="hover:text-white transition-colors">
                  contact@grow-coach.org
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-purple-500" />
                <a href="tel:+1234567890" className="hover:text-white transition-colors">
                  (+216) 27 707 357
                </a>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-purple-500 flex-shrink-0 mt-1" />
                <address className="not-italic">
                  Bureau A8-2, Imm. Golden Towers, Centre Urbain Nord, Tunis
                </address>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Entreprise</h3>
            <ul className="space-y-4">
              {links.company.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="hover:text-white hover:underline transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Plate-forme</h3>
            <ul className="space-y-4">
              {links.platform.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="hover:text-white hover:underline transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Ressources</h3>
            <ul className="space-y-4">
              {links.resources.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="hover:text-white hover:underline transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>&copy; {currentYear} Growcoach. Tous droits réservés.</p>
          </div>
          
          <div className="flex space-x-4">
            <a 
              href="#" 
              className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;