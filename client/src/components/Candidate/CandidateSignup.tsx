import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Education, Experience, CandidateSignupData } from '../../types';
import Footer from '../Footer';

const API_BASE_URL = 'http://localhost:5000';

// Add these types if not present
export interface ProfessionalFormation {
  title: string;
  institution: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

export interface Project {
  name: string;
  description: string;
  link?: string;
}

const CandidateSignup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CandidateSignupData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    location: '',
    bio: '',
    skills: [],
    terms_accepted: false,
    education: [],
    experience: [],
    professional_formation: [],
    projects: [],
  });
  
  const [currentSkill, setCurrentSkill] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

const [showModal, setShowModal] = useState(false);
const [hasGrowCoach, setHasGrowCoach] = useState<boolean | null>(null);
const [selectedFormations, setSelectedFormations] = useState<string[]>([]);
const [otherFormation, setOtherFormation] = useState('');
const [loading, setLoading] = useState(false);

  const formationsList = [
    '5S et le Management Visuel',
    'A4Q Certified Selenium 4 Tester Foundation',
    'ACP° Agile Certified Practitioner°',
    'Angular',
    'Bootcamp Design Thinking',
    'Business Analysis',
    'Business Process Management & BPMN',
    'Certification IATF16949 :2016',
    'COBIT°',
    'Communication et Prise de Parole en Public',
    'Conduite de Changement',
    'Devop Engineering Foundation',
    'DOFD° Devops Foundation',
    'Formation PRINCE2 Agile°',
    'Formation PRINCE2',
    'Gestion de conflit',
    'Gestion de stress',
    'ISO 13485 :2016',
    'ISO 14644 :2015',
    'ISO 14971 :2019',
    'ISO 31000 : 2018',
    'ISO/IEC 27001 Foundation',
    'ISTQB° Agile tester foundation level',
    'ISTQB° CTFL 4.0 : Certified Tester Foundation Level',
    'ITIL° 4 Foundation',
    "Leadership et Gestion de l'équipe",
    'Lean Management',
    'Lean Sig Sigma',
    'Management 3.0',
    'Management Par les valeurs',
    'Marquage CE',
    'Microsoft Project',
    'Minitab',
    'MRPG',
    'PMI Agile Certified Practitioner ( PMI-ACP )°',
    'PMP° Project Management Professional°',
    'Profiling DISC',
    'Programmation Neuro-Linguistique (PNL)',
    'PSM° Professional Scrum Master',
    'PSPO Professional Scrum Product Owner',
    'Python',
    'QRQC',
    'Service Integration and Management (SIAM)',
    'Team Building',
    'TPM',
    'Autre'
  ];

  const fieldRefs = {
    first_name: React.useRef<HTMLInputElement>(null),
    last_name: React.useRef<HTMLInputElement>(null),
    email: React.useRef<HTMLInputElement>(null),
    password: React.useRef<HTMLInputElement>(null),
    confirm_password: React.useRef<HTMLInputElement>(null),
    phone: React.useRef<HTMLInputElement>(null),
    location: React.useRef<HTMLInputElement>(null),
    bio: React.useRef<HTMLTextAreaElement>(null),
    terms_accepted: React.useRef<HTMLInputElement>(null),
    // Add refs for dynamic fields if needed (education, experience, etc.)
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) newErrors.first_name = 'Le prénom est requis';
    if (!formData.last_name.trim()) newErrors.last_name = 'Le nom est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Format d\'email invalide';
    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    else if (formData.password.length < 8) newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    if (formData.password !== formData.confirm_password) newErrors.confirm_password = 'Les mots de passe ne correspondent pas';
    if (!formData.terms_accepted) newErrors.terms_accepted = 'Vous devez accepter les conditions';

    setErrors(newErrors);

    // Scroll to the first error field
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      if (fieldRefs[firstErrorField] && fieldRefs[firstErrorField].current) {
        fieldRefs[firstErrorField].current!.scrollIntoView({ behavior: 'smooth', block: 'center' });
        fieldRefs[firstErrorField].current!.focus();
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
      const { name } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: e.target.files![0]
      }));
    }
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        school: '',
        degree: '',
        start_date: '',
        end_date: '',
        description: ''
      }]
    }));
  };

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    setFormData(prev => {
      const newEducation = [...prev.education];
      newEducation[index] = {
        ...newEducation[index],
        [field]: value
      };
      return {
        ...prev,
        education: newEducation
      };
    });
  };

  const removeEducation = (index: number) => {
    setFormData(prev => {
      const newEducation = [...prev.education];
      newEducation.splice(index, 1);
      return {
        ...prev,
        education: newEducation
      };
    });
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        title: '',
        company: '',
        start_date: '',
        end_date: '',
        description: ''
      }]
    }));
  };

  const handleExperienceChange = (index: number, field: keyof Experience, value: string) => {
    setFormData(prev => {
      const newExperience = [...prev.experience];
      newExperience[index] = {
        ...newExperience[index],
        [field]: value
      };
      return {
        ...prev,
        experience: newExperience
      };
    });
  };

  const removeExperience = (index: number) => {
    setFormData(prev => {
      const newExperience = [...prev.experience];
      newExperience.splice(index, 1);
      return {
        ...prev,
        experience: newExperience
      };
    });
  };

  // Professional Formation
  const addProfessionalFormation = () => {
    setFormData(prev => ({
      ...prev,
      professional_formation: [
        ...(prev.professional_formation || []),
        { title: '', institution: '', start_date: '', end_date: '', description: '' }
      ]
    }));
  };

  const handleProfessionalFormationChange = (index: number, field: keyof ProfessionalFormation, value: string) => {
    setFormData(prev => {
      const newFormations = [...(prev.professional_formation || [])];
      newFormations[index] = { ...newFormations[index], [field]: value };
      return { ...prev, professional_formation: newFormations };
    });
  };

  const removeProfessionalFormation = (index: number) => {
    setFormData(prev => {
      const newFormations = [...(prev.professional_formation || [])];
      newFormations.splice(index, 1);
      return { ...prev, professional_formation: newFormations };
    });
  };

  // Projects
  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        { name: '', description: '', link: '' }
      ]
    }));
  };

  const handleProjectChange = (index: number, field: keyof Project, value: string) => {
    setFormData(prev => {
      const newProjects = [...(prev.projects || [])];
      newProjects[index] = { ...newProjects[index], [field]: value };
      return { ...prev, projects: newProjects };
    });
  };

  const removeProject = (index: number) => {
    setFormData(prev => {
      const newProjects = [...(prev.projects || [])];
      newProjects.splice(index, 1);
      return { ...prev, projects: newProjects };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setShowModal(true);
  };

// Check if you have the right variable names in your form data
const submitFinalForm = async () => {
  try {
    setLoading(true);
    
    const formDataToSend = new FormData();
    
    // Make sure these match your actual form state variable names
    formDataToSend.append('first_name', formData.first_name);
    formDataToSend.append('last_name', formData.last_name);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('confirm_password', formData.password);
    
    // Add all form fields from your existing formData state
    formDataToSend.append('phone', formData.phone || '');
    formDataToSend.append('location', formData.location || '');
    formDataToSend.append('bio', formData.bio || '');
    formDataToSend.append('skills', formData.skills?.join(',') || '');
    formDataToSend.append('terms_accepted', 'true');
    
    // Add files (these should be File objects from your form state)
    if (formData.avatar) {
      formDataToSend.append('avatar', formData.avatar);
    }
    if (formData.resume) {
      formDataToSend.append('resume', formData.resume);
    }
    
    // Add education, experience, etc.
    formDataToSend.append('education_count', formData.education?.length.toString() || '0');
    formData.education?.forEach((edu, index) => {
      formDataToSend.append(`education[${index}][school]`, edu.school || '');
      formDataToSend.append(`education[${index}][degree]`, edu.degree || '');
      formDataToSend.append(`education[${index}][start_date]`, edu.start_date || '');
      formDataToSend.append(`education[${index}][end_date]`, edu.end_date || '');
      formDataToSend.append(`education[${index}][description]`, edu.description || '');
    });
    
    // Add experience
    formDataToSend.append('experience_count', formData.experience?.length.toString() || '0');
    formData.experience?.forEach((exp, index) => {
      formDataToSend.append(`experience[${index}][title]`, exp.title || '');
      formDataToSend.append(`experience[${index}][company]`, exp.company || '');
      formDataToSend.append(`experience[${index}][start_date]`, exp.start_date || '');
      formDataToSend.append(`experience[${index}][end_date]`, exp.end_date || '');
      formDataToSend.append(`experience[${index}][description]`, exp.description || '');
    });
    
    // Add professional formation
    formDataToSend.append('professional_formation_count', formData.professional_formation?.length.toString() || '0');
    formData.professional_formation?.forEach((pf, index) => {
      formDataToSend.append(`professional_formation[${index}][title]`, pf.title || '');
      formDataToSend.append(`professional_formation[${index}][institution]`, pf.institution || '');
      formDataToSend.append(`professional_formation[${index}][start_date]`, pf.start_date || '');
      formDataToSend.append(`professional_formation[${index}][end_date]`, pf.end_date || '');
      formDataToSend.append(`professional_formation[${index}][description]`, pf.description || '');
    });
    
    // Add projects
    formDataToSend.append('projects_count', formData.projects?.length.toString() || '0');
    formData.projects?.forEach((project, index) => {
      formDataToSend.append(`projects[${index}][name]`, project.name || '');
      formDataToSend.append(`projects[${index}][description]`, project.description || '');
      formDataToSend.append(`projects[${index}][link]`, project.link || '');
    });

    console.log('Submitting registration data to /candidate/signup');

    // Use the new candidate signup endpoint
    const response = await fetch(`${API_BASE_URL}/candidate/signup`, {
      method: 'POST',
      body: formDataToSend, // Send as FormData, not JSON
    });

    const result = await response.json();
    console.log('Registration response:', result);

    if (response.ok && result.success) {
      // Registration successful
      if (result.data && result.data.token) {
        // Store the auth token
        localStorage.setItem('authToken', result.data.token);
        
        // Show success message
        alert('Inscription réussie ! Bienvenue sur GrowCoach.');
        
        // Fix: Change to match the route in App.tsx
        navigate('/candidate-dashboard');
      } else {
        // Registration successful but no token (maybe needs admin approval)
        alert('Inscription réussie ! Votre compte est en attente d\'approbation.');
        navigate('/login');
      }
    } else {
      // Registration failed
      console.error('Registration failed:', result);
      setErrors({ form: result.error || 'Erreur lors de l\'inscription. Veuillez réessayer.' });
    }
  } catch (error) {
    console.error('Network error during registration:', error);
    setErrors({ form: 'Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.' });
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <div className="min-h-screen pt-24 pb-12 bg-gray-900 text-gray-100 px-4">
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-center mb-8 text-purple-400">Inscription des candidats</h1>
            
            {errors.form && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">Informations de base</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Prénom *</label>
                    <input
                      type="text"
                      name="first_name"
                      ref={fieldRefs.first_name}
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 bg-gray-700 rounded-lg ${errors.first_name ? 'border border-red-500' : ''}`}
                    />
                    {errors.first_name && <p className="mt-1 text-sm text-red-400">{errors.first_name}</p>}
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium">Nom de famille *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 bg-gray-700 rounded-lg ${errors.last_name ? 'border border-red-500' : ''}`}
                    />
                    {errors.last_name && <p className="mt-1 text-sm text-red-400">{errors.last_name}</p>}
                  </div>
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
                  <label className="block mb-2 text-sm font-medium">Avatar</label>
                  <input
                    type="file"
                    name="avatar"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Biographie</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">Compétences</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    placeholder="Add a skill"
                    className="flex-1 px-4 py-2 bg-gray-700 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map(skill => (
                    <div key={skill} className="flex items-center bg-gray-700 px-3 py-1 rounded-full">
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-gray-400 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <h2 className="text-xl font-semibold">Éducation</h2>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                  >
                    Ajouter une éducation
                  </button>
                </div>
                
                {formData.education.map((edu, index) => (
                  <div key={index} className="space-y-4 p-4 bg-gray-700/50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">École *</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">Degré *</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">Année de début</label>
                        <input
                          type="number"
                          min="1900"
                          max={new Date().getFullYear() + 10}
                          value={edu.start_date || ''}
                          onChange={(e) => handleEducationChange(index, 'start_date', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                          placeholder="ex: 2020"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">Année de fin</label>
                        <input
                          type="number"
                          min="1900"
                          max={new Date().getFullYear() + 10}
                          value={edu.end_date || ''}
                          onChange={(e) => handleEducationChange(index, 'end_date', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                          placeholder="ex: 2023"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block mb-1 text-sm font-medium">Description</label>
                      <textarea
                        value={edu.description}
                        onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Supprimer l'éducation
                    </button>
                  </div>
                ))}
              </div>

              {/* Experience */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <h2 className="text-xl font-semibold">Expérience professionnelle</h2>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                  >
                    Ajouter de l'expérience
                  </button>
                </div>
                
                {formData.experience.map((exp, index) => (
                  <div key={index} className="space-y-4 p-4 bg-gray-700/50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">Titre *</label>
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">Entreprise *</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">Date de début *</label>
                        <input
                          type="date"
                          value={exp.start_date}
                          onChange={(e) => handleExperienceChange(index, 'start_date', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">Date de fin *</label>
                        <input
                          type="date"
                          value={exp.end_date || ''}
                          onChange={(e) => handleExperienceChange(index, 'end_date', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">Année de début</label>
                        <input
                          type="number"
                          min="1900"
                          max={new Date().getFullYear() + 10}
                          value={exp.start_date || ''}
                          onChange={(e) => handleExperienceChange(index, 'start_date', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                          placeholder="ex: 2018"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">Année de fin</label>
                        <input
                          type="number"
                          min="1900"
                          max={new Date().getFullYear() + 10}
                          value={exp.end_date || ''}
                          onChange={(e) => handleExperienceChange(index, 'end_date', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                          placeholder="ex: 2022"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block mb-1 text-sm font-medium">Description</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Supprimer l'expérience
                    </button>
                  </div>
                ))}
              </div>

              {/* Professional Formation */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <h2 className="text-xl font-semibold">Formation professionnelle</h2>
                  <button
                    type="button"
                    onClick={addProfessionalFormation}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                  >
                    Ajouter une formation
                  </button>
                </div>
                {formData.professional_formation?.map((formation, index) => (
                  <div key={index} className="space-y-4 p-4 bg-gray-700/50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">Titre *</label>
                        <input
                          type="text"
                          value={formation.title}
                          onChange={e => handleProfessionalFormationChange(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">Institution *</label>
                        <input
                          type="text"
                          value={formation.institution}
                          onChange={e => handleProfessionalFormationChange(index, 'institution', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">Date de début *</label>
                        <input
                          type="date"
                          value={formation.start_date}
                          onChange={e => handleProfessionalFormationChange(index, 'start_date', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">Date de fin *</label>
                        <input
                          type="date"
                          value={formation.end_date || ''}
                          onChange={e => handleProfessionalFormationChange(index, 'end_date', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">Année de début</label>
                        <input
                          type="number"
                          min="1900"
                          max={new Date().getFullYear() + 10}
                          value={formation.start_date || ''}
                          onChange={e => handleProfessionalFormationChange(index, 'start_date', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                          placeholder="ex: 2019"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">Année de fin</label>
                        <input
                          type="number"
                          min="1900"
                          max={new Date().getFullYear() + 10}
                          value={formation.end_date || ''}
                          onChange={e => handleProfessionalFormationChange(index, 'end_date', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                          placeholder="ex: 2021"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block mb-1 text-sm font-medium">Description</label>
                      <textarea
                        value={formation.description}
                        onChange={e => handleProfessionalFormationChange(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeProfessionalFormation(index)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Supprimer la formation
                    </button>
                  </div>
                ))}
              </div>

              {/* Projects */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <h2 className="text-xl font-semibold">Projets</h2>
                  <button
                    type="button"
                    onClick={addProject}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                  >
                    Ajouter un projet
                  </button>
                </div>
                
                {formData.projects?.map((project, index) => (
                  <div key={index} className="space-y-4 p-4 bg-gray-700/50 rounded-lg">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Nom du projet *</label>
                      <input
                        type="text"
                        value={project.name}
                        onChange={e => handleProjectChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Description *</label>
                      <textarea
                        value={project.description}
                        onChange={e => handleProjectChange(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Lien (optionnel)</label>
                      <input
                        type="url"
                        value={project.link || ''}
                        onChange={e => handleProjectChange(index, 'link', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProject(index)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Supprimer le projet
                    </button>
                  </div>
                ))}
              </div>

              {/* Resume */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">Cv</h2>
                <div>
                  <label className="block mb-2 text-sm font-medium">Télécharger le CV (PDF)</label>
                  <input
                    type="file"
                    name="resume"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg"
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
                      ref={fieldRefs.terms_accepted}
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
                  {isSubmitting ? 'Traitement...' : 'Créer un compte'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* GrowCoach Formation Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-purple-400 mb-4 text-center">Growcoach Formation</h2>
              <p className="text-gray-300 mb-6 text-center">Avez-vous suivi une formation chez Growcoach ?</p>
              
              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={() => setHasGrowCoach(true)}
                  className="px-6 py-2 bg-gray-300 hover:bg-gray-500 rounded-lg text-black font-medium transition-colors"
                >
                  Oui
                </button>
                <button
                  onClick={() => submitFinalForm()}
                  className="px-6 py-2 bg-purple-500 hover:bg-purple- rounded-lg text-black font-medium transition-colors"
                >
                  Non
                </button>
              </div>

              {hasGrowCoach === true && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Choisissez votre formation</label>
                    <div className="max-h-56 overflow-y-auto pr-2 rounded border border-gray-700 bg-gray-700/30">
                      {formationsList.map((formation, idx) => (
                        <div key={idx}>
                          <label className="flex items-center gap-2 mb-2 cursor-pointer">
                            <input
                              type="checkbox"
                              value={formation}
                              checked={selectedFormations.includes(formation)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setSelectedFormations(prev => [...prev, formation]);
                                } else {
                                  setSelectedFormations(prev => prev.filter(f => f !== formation));
                                  if (formation === 'Autre') setOtherFormation('');
                                }
                              }}
                              className="accent-purple-500"
                            />
                            <span>{formation}</span>
                          </label>
                          {formation === 'Autre' && selectedFormations.includes('Autre') && (
                            <input
                              type="text"
                              value={otherFormation}
                              onChange={e => setOtherFormation(e.target.value)}
                              placeholder="Veuillez préciser votre formation"
                              className="mt-1 mb-2 px-3 py-2 bg-gray-700 rounded-lg w-full text-gray-100 border border-gray-600"
                              autoFocus
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => submitFinalForm()}
                    className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium transition-colors mt-4"
                  >
                    Confirmer et soumettre
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer /> 
    </>
  );
};

export default CandidateSignup;