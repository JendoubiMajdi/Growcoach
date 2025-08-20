import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer';

const API_BASE_URL = 'http://localhost:5000';

interface CompanySignupData {
  company_name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone: string;
  location: string;
  website: string;
  description: string;
  logo: File | null;
  industry: string;
  company_size: string;
  founded_year: string;
  terms_accepted: boolean;
}

const CompanySignup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CompanySignupData>({
    company_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    location: '',
    website: '',
    description: '',
    logo: null,
    industry: '',
    company_size: '',
    founded_year: '',
    terms_accepted: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fieldRefs = {
    company_name: React.useRef<HTMLInputElement>(null),
    email: React.useRef<HTMLInputElement>(null),
    password: React.useRef<HTMLInputElement>(null),
    confirm_password: React.useRef<HTMLInputElement>(null),
    phone: React.useRef<HTMLInputElement>(null),
    location: React.useRef<HTMLInputElement>(null),
    website: React.useRef<HTMLInputElement>(null),
    description: React.useRef<HTMLTextAreaElement>(null),
    industry: React.useRef<HTMLSelectElement>(null),
    company_size: React.useRef<HTMLSelectElement>(null),
    founded_year: React.useRef<HTMLInputElement>(null),
    terms_accepted: React.useRef<HTMLInputElement>(null),
  };

  const educationRefs = useRef<Array<HTMLInputElement | null>>([]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.company_name.trim()) newErrors.company_name = 'Le nom de l\'entreprise est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Format d\'email invalide';
    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    else if (formData.password.length < 8) newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    if (formData.password !== formData.confirm_password) newErrors.confirm_password = 'Les mots de passe ne correspondent pas';
    if (!formData.industry) newErrors.industry = 'Le secteur d\'activité est requis';
    if (!formData.terms_accepted) newErrors.terms_accepted = 'Vous devez accepter les conditions';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        logo: e.target.files![0]
      }));
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsSubmitting(true);

  try {
    const formDataToSend = new FormData();

    // Append all required fields
    formDataToSend.append('company_name', formData.company_name);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('confirm_password', formData.confirm_password); // Add this line
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('location', formData.location);
    formDataToSend.append('website', formData.website);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('industry', formData.industry);
    formDataToSend.append('company_size', formData.company_size);
    formDataToSend.append('founded_year', formData.founded_year);
    formDataToSend.append('terms_accepted', formData.terms_accepted.toString());

    if (formData.logo) {
      formDataToSend.append('logo', formData.logo, formData.logo.name);
    }

    const response = await fetch(`${API_BASE_URL}/company/signup`, {
      method: 'POST',
      body: formDataToSend,
    });

    const result = await response.json();

    if (!response.ok) {
      setErrors({ form: result.error || 'Échec de l\'inscription. Veuillez réessayer.' });
      return;
    }

    if (result.success) {
      // Store token and user info from the nested data object
      localStorage.setItem('authToken', result.data.token);
      localStorage.setItem('userType', result.data.user_type);
      localStorage.setItem('userId', result.data.company_id);
      
      // Show success message
      alert('Inscription réussie ! Votre compte est en attente d\'approbation par un administrateur.');
      
      // Redirect to company dashboard (make sure this route exists)
      navigate('/company-dashboard');
    } else {
      setErrors({ form: result.error || 'Échec de l\'inscription. Veuillez réessayer.' });
    }

  } catch (error) {
    console.error('Error during company signup:', error);
    setErrors({
      form: error instanceof Error ? error.message : 'Échec de l\'inscription. Veuillez réessayer.'
    });
  } finally {
    setIsSubmitting(false);
  }
};

  const companySizes = [
    { value: '', label: 'Sélectionnez la taille de l`entreprise' },
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1001-5000', label: '1001-5000 employees' },
    { value: '5000+', label: '5000+ employees' }
  ];

  const industries = [
    { value: '', label: 'Sélectionner le secteur d’activité' },
    { value: 'Technology', label: 'Technologie' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Healthcare', label: 'Santé' },
    { value: 'Education', label: 'Éducation' },
    { value: 'Manufacturing', label: 'Manufacturière' },
    { value: 'Retail', label: 'Commerce de détail' },
    { value: 'Hospitality', label: 'Hôtellerie et restauration' },
    { value: 'Other', label: 'Autre' }
  ];

  return (
    <>
      <div className="min-h-screen pt-24 pb-12 bg-gray-900 text-gray-100 px-4">
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-center mb-8 text-purple-400">Inscription de l'entreprise</h1>
            
            {errors.form && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">Informations sur l'entreprise</h2>
                
                <div>
                  <label className="block mb-2 text-sm font-medium">nom de l'entreprise *</label>
                  <input
                    type="text"
                    name="company_name"
                    ref={fieldRefs.company_name}
                    value={formData.company_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 bg-gray-700 rounded-lg ${errors.company_name ? 'border border-red-500' : ''}`}
                  />
                  {errors.company_name && <p className="mt-1 text-sm text-red-400">{errors.company_name}</p>}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">E-mail *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 bg-gray-700 rounded-lg ${errors.email ? 'border border-red-500' : ''}`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Mot de passe *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 bg-gray-700 rounded-lg ${errors.password ? 'border border-red-500' : ''}`}
                    />
                    {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium">Confirmez le mot de passe *</label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 bg-gray-700 rounded-lg ${errors.confirm_password ? 'border border-red-500' : ''}`}
                    />
                    {errors.confirm_password && <p className="mt-1 text-sm text-red-400">{errors.confirm_password}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium">Emplacement</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Site Web</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Industrie *</label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 bg-gray-700 rounded-lg ${errors.industry ? 'border border-red-500' : ''}`}
                    >
                      {industries.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.industry && <p className="mt-1 text-sm text-red-400">{errors.industry}</p>}
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium">Taille de l'entreprise</label>
                    <select
                      name="company_size"
                      value={formData.company_size}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                    >
                      {companySizes.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Année de fondation</label>
                  <input
                    type="number"
                    name="founded_year"
                    value={formData.founded_year}
                    onChange={handleInputChange}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Logo de l'entreprise</label>
                  <input
                    type="file"
                    name="logo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Description de l'entreprise</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                    placeholder="Tell us about your company..."
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="pt-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      name="terms_accepted"
                      checked={formData.terms_accepted}
                      onChange={handleCheckboxChange}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      required
                    />
                  </div>
                  <label className="ml-2 text-sm">
                    J'accepte les{' '}
                    <a href="#" className="text-purple-400 hover:underline">
                       termes et conditions
                    </a>
                  </label>
                </div>
                {errors.terms_accepted && (
                  <p className="mt-1 text-sm text-red-400">{errors.terms_accepted}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Traitement...' : 'Register Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CompanySignup;