import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Save, Trash2 } from 'lucide-react';
import Footer from '../Footer';

interface CompanyProfileData {
  company_name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  description: string;
  industry: string;
  company_size: string;
  founded_year: string;
  logo_url: string | null;
  logo?: string; 
}

const CompanyProfile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<CompanyProfileData>({
    company_name: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    description: '',
    industry: '',
    company_size: '',
    founded_year: '',
    logo_url: null
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5000/company/profile', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          const responseData = await response.json();
          // Handle the new response format where profile data is nested under 'data'
          const profileData = responseData.data || responseData;
          
          setProfileData(profileData);
          if (profileData.logo_url) {
            setPreviewUrl(profileData.logo_url);
          } else if (profileData.logo) {
            setPreviewUrl(`http://localhost:5000/uploads/${profileData.logo}`);
          }
        } else {
          throw new Error('Échec de la récupération des données du profil');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil :', error);
        setError('Impossible de charger les données du profil');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      
      Object.entries(profileData).forEach(([key, value]) => {
        if (key !== 'logo_url' && key !== 'logo' && value !== null) {
          formData.append(key, value);
        }
      });
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const response = await fetch('http://localhost:5000/company/update', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la mise à jour du profil');
      }

      const responseData = await response.json();
      // Handle the new response format where updated data might be nested under 'data'
      const updatedData = responseData.data || responseData;
      
      setProfileData(updatedData);
      if (updatedData.logo_url) {
        setPreviewUrl(updatedData.logo_url);
      } else if (updatedData.logo) {
        setPreviewUrl(`http://localhost:5000/uploads/${updatedData.logo}`);
      }
      setSuccessMessage('Profil mis à jour avec succès !');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil :', error);
      setError(error instanceof Error ? error.message : 'Échec de la mise à jour du profil');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Chargement du profil...</p>
        </div>
        <Footer /> 
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-purple-400 hover:text-purple-300 mb-6"
          >
            <ArrowLeft className="mr-2" /> Retour au tableau de bord
          </button>

          <h1 className="text-3xl font-bold mb-8">Profil de l'entreprise</h1>

          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-600 text-white p-4 rounded-lg mb-6">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Logo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Logo de l'entreprise</label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Logo de l'entreprise" 
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-700"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                        Pas de logo
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 flex space-x-1">
                      <label 
                        htmlFor="logo-upload"
                        className="bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-500"
                      >
                        <Upload className="h-4 w-4" />
                        <input 
                          id="logo-upload"
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoChange}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {logoFile ? (
                      <p>Sélectionné : {logoFile.name}</p>
                    ) : (
                      <p>Télécharger un nouveau logo d'entreprise (JPG, PNG)</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium mb-2">
                  Nom de l'entreprise *
                </label>
                <input
                  id="company_name"
                  type="text"
                  name="company_name"
                  value={profileData.company_name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Téléphone
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-2">
                  Localisation
                </label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  value={profileData.location}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Website */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium mb-2">
                  Site web
                </label>
                <input
                  id="website"
                  type="url"
                  name="website"
                  value={profileData.website}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={profileData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Industry */}
              <div>
                <label htmlFor="industry" className="block text-sm font-medium mb-2">
                  Secteur d'activité
                </label>
                <input
                  id="industry"
                  type="text"
                  name="industry"
                  value={profileData.industry}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Company Size */}
              <div>
                <label htmlFor="company_size" className="block text-sm font-medium mb-2">
                  Taille de l'entreprise
                </label>
                <select
                  id="company_size"
                  name="company_size"
                  value={profileData.company_size}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Sélectionnez</option>
                  <option value="1-10">1-10 employés</option>
                  <option value="11-50">11-50 employés</option>
                  <option value="51-200">51-200 employés</option>
                  <option value="201-500">201-500 employés</option>
                  <option value="500+">Plus de 500 employés</option>
                </select>
              </div>

              {/* Founded Year */}
              <div>
                <label htmlFor="founded_year" className="block text-sm font-medium mb-2">
                  Année de création
                </label>
                <input
                  id="founded_year"
                  type="number"
                  name="founded_year"
                  value={profileData.founded_year}
                  onChange={handleInputChange}
                  min={1800}
                  max={new Date().getFullYear()}
                  className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-gray-800 text-gray-400 hover:text-white px-6 py-3 rounded shadow-sm"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded shadow-sm flex items-center"
              >
                {isSaving ? (
                  <svg
                    className="animate-spin mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                ) : (
                  <Save className="mr-2 h-5 w-5" />
                )}
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer /> 
    </>
  );
};

export default CompanyProfile;
