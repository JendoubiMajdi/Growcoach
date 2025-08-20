import React, { useState, useEffect } from 'react';
import { Search, Bell, LogOut, User, Briefcase, Building2, ChevronRight, Star, BookOpen, FileText, List, X, Bookmark, BookmarkCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../Footer';

const API_BASE_URL = 'http://localhost:5000';

interface Education {
  degree: string;
  field_of_study?: string;
  school: string;
  start_date: string;
  end_date?: string;
}

interface Experience {
  position: string;
  company: string;
  start_date: string;
  end_date?: string;
  title?: string;
}

interface ProfessionalFormation {
  title: string;
  institution: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

interface Project {
  name: string;
  description: string;
  link?: string;
}

interface Profile {
  _id: string;
  avatar?: string;
  first_name: string;
  last_name: string;
  bio?: string;
  skills?: string[];
  education?: Education[];
  experience?: Experience[];
  professional_formation?: ProfessionalFormation[];
  projects?: Project[];
  status?: string; // Added to fix the error
  // ...other fields...
}

interface Notification {
  id: number;
  text: string;
  time: string;
  unread: boolean;
}

type Job = {
  _id: string;
  job_title?: string;
  looking_for_profile?: string;
  required_skills?: string[];
  company_logo?: string;
  company?: {
    company_name: string;
    company_logo: string;
    company_location: string;
  };
  company_name?: string;
  company_id?: string;
  company_location?: string;
  matchPercentage?: number;
  location?: string;
  posted?: string;
  created_at?: string;
  applicants?: string[];
  salary?: string;
  required_experience?: string;
};

const CandidateDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jobsError, setJobsError] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<'jobs' | 'saved'>('jobs');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  const [isRefreshingSavedJobs, setIsRefreshingSavedJobs] = useState(false);
  const navigate = useNavigate();

  const [lastAppliedJob, setLastAppliedJob] = useState<{
    job_title: string;
    company_name: string;
    company_logo: string;
    company_bio: string;
    required_skills: string[];
    application_date: string;
    status: string;
    matchPercentage: number;
  } | null>(null);

  const [bioExpanded, setBioExpanded] = useState(false);
  const [expandedFormationDesc, setExpandedFormationDesc] = useState<{ [key: number]: boolean }>({});
  const [expandedProjectDesc, setExpandedProjectDesc] = useState<{ [key: number]: boolean }>({});

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return 'yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/candidate/profile`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        const responseData = await response.json();
        // Handle the new response format where profile data is nested under 'data'
        const profileData = responseData.data || responseData;
        setProfile(profileData);
      } catch (e) {
        setProfile(null);
      }
    };
    fetchProfile();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setIsRefreshingSavedJobs(true);
      const response = await fetch(`${API_BASE_URL}/candidate/saved-jobs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (response.ok) {
        const responseData = await response.json();
        // Handle the new response format where saved jobs are nested under 'data'
        const savedJobsData = responseData.data || responseData.saved_jobs || [];
        setSavedJobs(savedJobsData);
        setSavedJobIds(savedJobsData.map((job: Job) => job._id));
      }
    } catch (e) {
      setSavedJobs([]);
      setSavedJobIds([]);
    } finally {
      setIsRefreshingSavedJobs(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/candidate/saved-jobs`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        if (response.ok) {
          const responseData = await response.json();
          // Handle the new response format where saved jobs are nested under 'data'
          const savedJobsData = responseData.data || responseData.saved_jobs || [];
          setSavedJobs(savedJobsData);
          setSavedJobIds(savedJobsData.map((job: Job) => job._id));
        }
      } catch (e) {
        setSavedJobs([]);
        setSavedJobIds([]);
      }
    };
    fetchSavedJobs();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setJobsError('');
      try {
        const response = await fetch(`${API_BASE_URL}/jobs`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Échec de la récupération des offres d’emploi');
        const data = await response.json();
        const jobsWithMatch = data.map((job: Job) => {
          const matchPercentage = profile ? calculateMatchPercentage(job.required_skills, profile.skills) : 0;
          return {
            ...job,
            matchPercentage,
            company_logo: job.company?.company_logo ? `${API_BASE_URL}/uploads/${job.company.company_logo}` : "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=100"
          };
        });
        setJobs(jobsWithMatch);
      } catch (error) {
        setJobsError(error instanceof Error ? error.message : 'Échec de la récupération des offres d’emploi');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, [profile]);

  const calculateMatchPercentage = (requiredSkills: string[] = [], userSkills: string[] = []) => {
    if (!requiredSkills?.length || !userSkills?.length) return 0;
    const matchedSkills = requiredSkills.filter(skill =>
      userSkills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
    );
    return Math.round((matchedSkills.length / requiredSkills.length) * 100);
  };

  const filteredJobs = jobs.filter(job => {
    const searchLower = searchQuery.toLowerCase();
    return (
      job.job_title?.toLowerCase().includes(searchLower) ||
      job.looking_for_profile?.toLowerCase().includes(searchLower) ||
      (job.required_skills && job.required_skills.some(skill => skill.toLowerCase().includes(searchLower))) ||
      job.company_name?.toLowerCase().includes(searchLower)
    );
  });

  const displayedJobs = activeTab === 'saved'
    ? savedJobs
    : filteredJobs;

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint to blacklist the token
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear localStorage and redirect, even if backend call fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      navigate('/login');
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleApply = async (jobId: string, currentApplicants: string[] = []) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setAlertMessage('Vous devez être connecté pour postuler.');
        setAlertType('error');
        setShowAlert(true);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/job/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ candidate_id: userId })
      });

      if (response.ok) {
        setAlertMessage('Candidature soumise avec succès !');
        setAlertType('success');
        setShowAlert(true);
        const updatedApplicants = [...currentApplicants, userId];
        setJobs(jobs.map(j => j._id === jobId ? { ...j, applicants: updatedApplicants } : j));
      } else {
        const data = await response.json();
        setAlertMessage(data.error || 'Échec de la candidature.');
        setAlertType('error');
        setShowAlert(true);
      }
    } catch (e) {
      setAlertMessage('Échec de la candidature. Veuillez réessayer.');
      setAlertType('error');
      setShowAlert(true);
    }
  };

  const handleToggleSaveJob = async (jobId: string) => {
    const isSaved = savedJobIds.includes(jobId);
    
    // Set loading state
    setSavingJobId(jobId);
    
    // Optimistically update the UI
    setSavedJobIds(prev =>
      isSaved ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
    
    try {
      const endpoint = isSaved ? 'unsave-job' : 'save-job';
      const response = await fetch(`${API_BASE_URL}/candidate/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ job_id: jobId }),
      });

      if (response.ok) {
        // Update the saved jobs list
        if (isSaved) {
          // Remove from saved jobs
          setSavedJobs(prev => prev.filter(job => job._id !== jobId));
        } else {
          // Add to saved jobs - find the job from the jobs list
          const jobToSave = jobs.find(job => job._id === jobId);
          if (jobToSave) {
            setSavedJobs(prev => [...prev, jobToSave]);
          }
        }
        
        // Show success message
        setAlertMessage(isSaved ? 'Offre retirée des favoris!' : 'Offre ajoutée aux favoris!');
        setAlertType('success');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 2000);
      } else {
        // Revert the optimistic update on error
        setSavedJobIds(prev =>
          isSaved ? [...prev, jobId] : prev.filter(id => id !== jobId)
        );
        
        setAlertMessage('Erreur lors de la sauvegarde. Veuillez réessayer.');
        setAlertType('error');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    } catch (e) {
      // Revert the optimistic update on error
      setSavedJobIds(prev =>
        isSaved ? [...prev, jobId] : prev.filter(id => id !== jobId)
      );
      
      setAlertMessage('Erreur lors de la sauvegarde. Veuillez réessayer.');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } finally {
      // Clear loading state
      setSavingJobId(null);
    }
  };

  // Helper to check if bio is long
  const isBioLong = profile?.bio && profile.bio.length > 120;

  // Add this helper function inside your component:
  const getProfileCompletion = (profile: Profile | null) => {
    if (!profile) return 0;
    let total = 7;
    let score = 0;
    if (profile.avatar) score++;
    if (profile.bio && profile.bio.length > 10) score++;
    if (profile.skills && profile.skills.length > 0) score++;
    if (profile.education && profile.education.length > 0) score++;
    if (profile.experience && profile.experience.length > 0) score++;
    if (profile.professional_formation && profile.professional_formation.length > 0) score++;
    if (profile.projects && profile.projects.length > 0) score++;
    return Math.round((score / total) * 100);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src={`${API_BASE_URL}/uploads/1.png`}
                alt="Growcoach Logo"
                className="h-12 w-12 object-contain"
                style={{ borderRadius: '4px' }}
              />
              <span className="text-xl font-bold">Growcoach</span>
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition"
                aria-label="Profile menu"
                aria-expanded={showProfileMenu}
              >
                {profile?.avatar ? (
                  <img
                    src={profile?.avatar ? `${API_BASE_URL}/uploads/${profile.avatar}` : "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=100"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=100";
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                    {profile?.first_name?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="hidden md:inline">
                  {profile ? `${profile.first_name} ${profile.last_name}` : 'User'}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/candidate-profile');
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-700 w-full text-left"
                  >
                    <User className="h-4 w-4" /> Profil
                  </button>
                  <div className="border-t border-gray-700 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-700 w-full text-left text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 border-b border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'jobs' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
              >
                <Briefcase className="h-4 w-4" />
                Correspondances
              </button>
              <button
                onClick={() => {
                  setActiveTab('saved');
                  fetchSavedJobs(); // Refresh saved jobs when switching to saved tab
                }}
                className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'saved' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
              >
                <BookOpen className="h-4 w-4" />
                Offres sauvegardées
                {isRefreshingSavedJobs && (
                  <div className="animate-spin rounded-full h-3 w-3 border-t border-b border-purple-400 ml-1"></div>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="relative w-full max-w-3xl mx-auto">
            <div className="flex items-center">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search jobs by title, skills, or company..."
                className="w-full pl-12 pr-6 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {activeTab === 'jobs' ? 'Offres' : 'Offres sauvegardées'}
              </h2>
              <span className="text-gray-400 flex items-center gap-2">
                {displayedJobs.length} {displayedJobs.length === 1 ? 'job' : 'jobs'} trouvé
                {activeTab === 'saved' && isRefreshingSavedJobs && (
                  <div className="animate-spin rounded-full h-4 w-4 border-t border-b border-purple-400"></div>
                )}
              </span>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : jobsError ? (
              <div className="bg-gray-800 p-8 rounded-lg text-center">
                <p className="text-red-400">{jobsError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 text-purple-500 hover:text-purple-400"
                >
                  Réessayer
                </button>
              </div>
            ) : displayedJobs.length > 0 ? (
              <div className="space-y-4">
                {displayedJobs.map((job) => {
                  const matchPercentage = profile ? calculateMatchPercentage(job.required_skills, profile.skills) : 0;
                  const isJobSaved = savedJobIds.includes(job._id);
                  const isJobSaving = savingJobId === job._id;
                  
                  return (
                    <div key={job._id} className={`bg-gray-800 p-6 rounded-lg shadow hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1 ${isJobSaved ? 'ring-2 ring-purple-500/30' : ''} ${isJobSaving ? 'opacity-70' : ''}`}>
                      <div className="flex items-start gap-4">
                        <img
                          src={job.company_logo}
                          alt={job.company_name || "Company"}
                          className="w-16 h-16 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=100";
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-semibold">{job.job_title}</h3>
                              <p className="text-purple-400">{job.company_name}</p>
                            </div>
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                              {matchPercentage}% Correspondance
                            </span>
                          </div>

                          <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {job.company_location || job.location}
                            </span>
                            <span>{job.salary || 'Salary not specified'}</span>
                            {/* Add job posting date */}
                            <span>
                              {job.created_at ? `Publié le ${formatDate(job.created_at)}` : 'Date inconnue'}
                            </span>
                          </div>

                          <div className="mt-4">
                            {/* Fix: Add "En recherche de" before profile */}
                            <h4 className="font-medium text-white mb-2">En recherche de :</h4>
                            <p className="text-gray-400">{job.looking_for_profile || 'Non spécifié'}</p>
                          </div>

                          <div className="mt-4">
                            <h4 className="font-medium text-white mb-2">Compétences requises</h4>
                            <div className="flex flex-wrap gap-2">
                              {job.required_skills?.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full hover:bg-purple-500 transition"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mt-6 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleSaveJob(job._id)}
                                className="p-2 rounded-full hover:bg-purple-900/30 transition-all duration-200 disabled:opacity-50"
                                aria-label={savedJobIds.includes(job._id) ? "Unsave job" : "Save job"}
                                title={savedJobIds.includes(job._id) ? "Unsave job" : "Save job"}
                                type="button"
                                disabled={savingJobId === job._id}
                              >
                                {savingJobId === job._id ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-400"></div>
                                ) : savedJobIds.includes(job._id) ? (
                                  <BookmarkCheck className="h-5 w-5 text-purple-400 transition-all duration-200" />
                                ) : (
                                  <Bookmark className="h-5 w-5 text-gray-400 hover:text-purple-400 transition-all duration-200" />
                                )}
                              </button>
                              {job.applicants && job.applicants.includes(localStorage.getItem('userId') || '') ? (
                                <button
                                  className="px-4 py-2 bg-green-500 text-white rounded-lg cursor-default"
                                  disabled
                                >
                                  Candidature envoyée
                                </button>
                              ) : (
                                <div className="relative group flex items-center">
                                  <button
                                    className={`px-4 py-2 rounded-lg transition-colors
                                      ${profile?.status !== 'active'
                                        ? 'bg-gray-500 cursor-not-allowed'
                                        : 'bg-purple-600 text-white hover:bg-purple-500'}
                                    `}
                                    onClick={() => {
                                      if (profile?.status !== 'active') {
                                        setAlertMessage("Votre compte doit être vérifié par l'administrateur avant de postuler à une offre.");
                                        setAlertType('error');
                                        setShowAlert(true);
                                        return;
                                      }
                                      handleApply(job._id, job.applicants);
                                    }}
                                    disabled={profile?.status !== 'active'}
                                    type="button"
                                  >
                                    Postuler maintenant
                                  </button>
                                  {profile?.status !== 'active' && (
                                    <span className="absolute left-1/2 -top-10 -translate-x-1/2 whitespace-nowrap bg-gray-900 text-red-400 text-xs px-3 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                      Vous devez attendre la validation de votre compte par un administrateur.
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : activeTab === 'saved' ? (
              <div className="bg-gray-800 p-8 rounded-lg text-center mb-4">
                <p className="text-gray-400">Il n'y a aucune offre sauvegardée.</p>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="mt-4 px-4 py-2 text-purple-500 hover:text-purple-400 transition-colors"
                >
                  Parcourir les offres disponibles
                </button>
              </div>
            ) : (
              <div className="bg-gray-800 p-8 rounded-lg text-center">
                <p className="text-gray-400">Aucun emploi ne correspond à votre recherche.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 text-purple-500 hover:text-purple-400"
                >
                  Effacer la recherche
                </button>
              </div>
            )}
          </div>

          <div className="lg:w-1/3 space-y-6">

            {/* Profile Card with Enhanced Design */}
            <div className="bg-gray-800/90 p-6 rounded-lg shadow-lg border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 backdrop-blur-sm">
              {/* Avatar and Name Row */}
              <div className="flex items-center gap-4 mb-2">
                <div className="relative flex-shrink-0">
                  {profile?.avatar ? (
                    <img
                      src={`${API_BASE_URL}/uploads/${profile.avatar}`}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/30 hover:border-purple-500/70 transition-all"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-2xl text-white">
                      {profile?.first_name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-300 to-blue-200 bg-clip-text text-transparent">
                    {profile ? `${profile.first_name} ${profile.last_name}` : '...'}
                  </h3>
                </div>
              </div>
              {/* Bio under avatar and name */}
              <div className="mb-6 text-sm text-gray-400 break-words">
                <span className={bioExpanded ? '' : 'line-clamp-2'}>
                  {profile?.bio || 'Your position'}
                </span>
                {isBioLong && (
                  <button
                    className="ml-2 text-purple-400 hover:underline focus:outline-none"
                    onClick={() => setBioExpanded((prev) => !prev)}
                  >
                    {bioExpanded ? 'Lire moins' : 'Lire plus'}
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {profile?.education && Array.isArray(profile.education) && profile.education.length > 0 && (
                  <div>
                    <h4 className="font-medium text-white flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-purple-300" /> Education
                    </h4>
                    {profile.education.map((edu, idx) => (
                      <div key={idx} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/30 mb-2">
                        <p className="font-medium text-white">{edu.degree}</p>
                        <p className="text-purple-200">{edu.school}</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {edu.start_date ? formatDate(edu.start_date) : 'N/A'} -{' '}
                          {edu.end_date ? formatDate(edu.end_date) : 'Present'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {profile?.experience && Array.isArray(profile.experience) && profile.experience.length > 0 && (
                  <div>
                    <h4 className="font-medium text-white flex items-center gap-2 mb-2">
                      <Briefcase className="h-4 w-4 text-purple-300" /> Expérience professionnelle
                    </h4>
                    {profile.experience.map((exp, idx) => (
                      <div key={idx} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/30 mb-2">
                        <p className="font-medium text-white">{exp.position || exp.title}</p>
                        <p className="text-purple-200">{exp.company}</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {exp.start_date ? formatDate(exp.start_date) : 'N/A'} -{' '}
                          {exp.end_date ? formatDate(exp.end_date) : 'Present'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Professional Formation */}
                {profile?.professional_formation && Array.isArray(profile.professional_formation) && profile.professional_formation.length > 0 && (
                  <div>
                    <h4 className="font-medium text-white flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-purple-300" /> Formation professionnelle
                    </h4>
                    {profile.professional_formation.map((formation, idx) => (
                      <div key={idx} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/30 mb-2">
                        <p className="font-medium text-white">{formation.title}</p>
                        <p className="text-purple-200">{formation.institution}</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {formation.start_date ? formatDate(formation.start_date) : 'N/A'} -{' '}
                          {formation.end_date ? formatDate(formation.end_date) : 'Present'}
                        </p>
                        {formation.description && (
                          <p className="text-gray-400 text-xs mt-1">
                            <span className={expandedFormationDesc[idx] ? '' : 'line-clamp-2'}>
                              {formation.description}
                            </span>
                            {formation.description.length > 120 && (
                              <button
                                className="ml-2 text-purple-400 hover:underline focus:outline-none"
                                onClick={() =>
                                  setExpandedFormationDesc((prev) => ({
                                    ...prev,
                                    [idx]: !prev[idx],
                                  }))
                                }
                              >
                                {expandedFormationDesc[idx] ? 'Lire moins' : 'Lire plus'}
                              </button>
                            )}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Projects */}
                {profile?.projects && Array.isArray(profile.projects) && profile.projects.length > 0 && (
                  <div>
                    <h4 className="font-medium text-white flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-purple-300" /> Projets
                    </h4>
                    {profile.projects.map((project, idx) => (
                      <div key={idx} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/30 mb-2">
                        <p className="font-medium text-white">{project.name}</p>
                        <p className="text-gray-400 text-xs mt-1">
                          <span className={expandedProjectDesc[idx] ? '' : 'line-clamp-2'}>
                            {project.description}
                          </span>
                          {project.description.length > 120 && (
                            <button
                              className="ml-2 text-purple-400 hover:underline focus:outline-none"
                              onClick={() =>
                                setExpandedProjectDesc((prev) => ({
                                  ...prev,
                                  [idx]: !prev[idx],
                                }))
                              }
                            >
                              {expandedProjectDesc[idx] ? 'Lire moins' : 'Lire plus'}
                            </button>
                          )}
                        </p>
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:underline text-xs"
                          >
                            Voir le projet
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-white mb-2">Compétences clés</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills?.slice(0, 6).map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="px-2.5 py-1 bg-purple-900/50 text-purple-100 text-xs rounded-full border border-purple-700/50 hover:bg-purple-800/70 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Profile completion line */}
                <div className="mt-6 w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300 font-medium">Complétion du profil</span>
                    <span className="text-sm font-bold text-purple-400">{getProfileCompletion(profile)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${getProfileCompletion(profile)}%` }}
                    ></div>
                  </div>
                </div>

                <button
                  className="mt-4 w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:from-purple-700 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 flex items-center justify-center gap-2"
                  onClick={() => navigate('/candidate-profile')}
                >
                  <User className="h-4 w-4" />
                  {getProfileCompletion(profile) === 100 ? 'Voir / Modifier le profil' : 'Compléter votre profil'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Alert Popup */}
      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="relative bg-gray-800 rounded-lg border-2 border-purple-400 p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-purple-300">
                {alertType === 'success' ? 'Success' : 'Error'}
              </h3>
              <button
                onClick={() => setShowAlert(false)}
                className="text-purple-300 hover:text-white p-1 rounded-full hover:bg-purple-900 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className={alertType === 'success' ? 'text-green-400' : 'text-red-400'}>
                {alertMessage}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowAlert(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition"
              >
                D'accord
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;