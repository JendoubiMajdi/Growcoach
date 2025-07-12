import React, { useState, useEffect } from 'react';
import { Search, User, LogOut, Briefcase, List, FileText, BookOpen, Edit, Users, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { JobPost, CompanyInfo, SimpleCandidate, JobFormData } from '../../types';
import Footer from '../Footer';
import ResumeViewer from './ResumeViewer'; 


const ApplicantsModal = ({ 
  applicants, 
  companyVerified, 
  verificationPending,
  onClose 
}: { 
  applicants: SimpleCandidate[],
  companyVerified: boolean,
  verificationPending: boolean,
  onClose: () => void
}) => {
  const [showVerificationRequest, setShowVerificationRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleSendVerificationRequest = async () => {
    try {
      const response = await fetch('http://localhost:5000/request-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        setRequestSent(true);
        setTimeout(() => setShowVerificationRequest(false), 2000);
      }
    } catch (error) {
      console.error('Erreur lors de l’envoi de la demande de vérification :', error);
    }
  };

  useEffect(() => {
    if (!companyVerified) {
      setShowVerificationRequest(true);
    }
  }, [companyVerified]);

  if (showVerificationRequest) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="relative bg-gray-800 rounded-lg border-2 border-purple-400 p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-purple-300">
              Vérification du compte requise
            </h3>
            <button 
              onClick={onClose}
              className="text-purple-300 hover:text-white p-1 rounded-full hover:bg-purple-900 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mb-6">
            {(verificationPending || requestSent) ? (
              <p className="text-green-400">Demande de vérification envoyée avec succès !</p>
            ) : (
              <p className="text-gray-300">
                Votre compte entreprise doit être vérifié avant que vous puissiez consulter les candidatures.
                Souhaitez-vous demander une vérification auprès de l'administrateur ?
              </p>
            )}
          </div>
          {!(verificationPending || requestSent) && (
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSendVerificationRequest}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition"
              >
                Demander une vérification
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

return (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
    <div className="relative bg-gray-800 rounded-xl border border-[#6D28D9] w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-gray-800 border-b border-[#6D28D9] p-4 flex items-center justify-between z-10">
        <h3 className="text-lg font-semibold text-white">Candidats pour ce poste</h3>
        <button 
          onClick={onClose}
          className="text-[#8B5CF6] hover:text-white p-1 rounded-full hover:bg-[#6D28D9] transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-2 scrollbar-thin scrollbar-thumb-[#8B5CF6] scrollbar-track-[#1E293B]">
        {applicants.length > 0 ? (
          <div className="divide-y divide-[#6D28D9]">
            {applicants.map((applicant) => (
              <div key={applicant.id} className="p-4 hover:bg-[#6D28D9]/10 transition-colors flex flex-col h-full rounded-lg bg-gray-800 border border-[#6D28D9]/30 relative">
                <div className="flex items-center justify-between gap-3 flex-1 min-w-0">
                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="bg-[#8B5CF6] text-white rounded-full w-10 h-10 flex items-center justify-center shrink-0">
                      {typeof applicant.lastName === 'string' ? applicant.lastName.charAt(0).toUpperCase() : ''}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-white truncate">
                        {applicant.firstName} {applicant.lastName}
                      </h4>
                      <p className="text-xs text-[#A78BFA] truncate">
                        {applicant.email || 'Aucun email'}
                      </p>
                    </div>
                  </div>
                  {/* Resume Button at the top right */}
                  {applicant.resume_url && (
                    <ResumeViewer
                      resumeUrl={applicant.resume_url}
                      adminCV={applicant.adminCV}
                      companyVerified={companyVerified}
                      verificationPending={verificationPending}
                      buttonClassName="px-3 py-1.5 bg-[#6D28D9] text-white rounded-md hover:bg-[#7C3AED] transition flex items-center gap-1.5 text-sm font-medium"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Users className="h-10 w-10 text-[#8B5CF6] mb-3" />
            <p className="text-[#A78BFA]">Aucun candidat pour le moment</p>
            <p className="text-sm text-[#7C3AED] mt-1">Les candidats apparaîtront ici lorsqu'ils postuleront</p>
          </div>
        )}
      </div>

      {/* Footer (optional) */}
      <div className="sticky bottom-0 bg-gray-800 border-t border-[#6D28D9] p-3 text-center">
        <p className="text-sm text-[#A78BFA]">{applicants.length} candidat{applicants.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
  </div>
);
};

const CompanyDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'candidates' | 'jobs'>('candidates');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidatesError, setCandidatesError] = useState('');
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [postJobError, setPostJobError] = useState('');
  const [postJobSuccess, setPostJobSuccess] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [showEditJobForm, setShowEditJobForm] = useState(false);
  const [candidates, setCandidates] = useState<SimpleCandidate[]>([]);
  const [verificationPending, setVerificationPending] = useState(false);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedJobApplicants, setSelectedJobApplicants] = useState<SimpleCandidate[]>([]);
  
  // Skills filter state
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);

  const defaultJobPost: JobFormData = {
    job_title: '',
    salary: '',
    looking_for_profile: '',
    required_experience: '',
    required_skills: [],
    required_skills_input: '',
    status: 'active'
  };

  const [jobPost, setJobPost] = useState<JobFormData>(defaultJobPost);
  const [currentSkill, setCurrentSkill] = useState(''); // <-- add this
  const [jobListings, setJobListings] = useState<JobPost[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  const navigate = useNavigate();

  const fetchCandidates = async () => {
    if (activeTab !== 'candidates') return;
    
    setLoadingCandidates(true);
    setCandidatesError('');
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/company/candidates', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      // Handle the new response format where candidates data might be nested under 'data'
      const candidatesData = responseData.data || responseData;
      setCandidates(candidatesData);
      
      // Extract all unique skills from candidates for the filter
      const allSkills = new Set<string>();
      candidatesData.forEach((candidate: any) => {
        if (candidate.skills && Array.isArray(candidate.skills)) {
          candidate.skills.forEach((skill: string) => {
            if (skill && skill.trim()) {
              allSkills.add(skill.toLowerCase().trim());
            }
          });
        }
      });
      setAvailableSkills(Array.from(allSkills).sort());
    } catch (error) {
      console.error('Erreur lors de la récupération des candidats :', error);
      setCandidatesError(error instanceof Error ? error.message : 'Échec de la récupération des candidats');
    } finally {
      setLoadingCandidates(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
  };

  const calculateDuration = (startDate?: string, endDate?: string | null) => {
    if (!startDate) return '';
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    let result = '';
    if (years > 0) result += `${years} an${years > 1 ? 's' : ''}`;
    if (months > 0) {
      if (result) result += ' ';
      result += `${months} mois`;
    }
    return result || 'Moins de 1 mois';
  };

  // Skills filter functions
  const handleAddSkillFilter = (skill: string) => {
    const normalizedSkill = skill.toLowerCase().trim();
    if (normalizedSkill && !selectedSkills.includes(normalizedSkill)) {
      setSelectedSkills([...selectedSkills, normalizedSkill]);
    }
    setSkillInput('');
    setShowSkillsDropdown(false);
  };

  const handleRemoveSkillFilter = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  const clearAllSkillFilters = () => {
    setSelectedSkills([]);
  };

  const handleSkillInputChange = (value: string) => {
    setSkillInput(value);
    setShowSkillsDropdown(value.length > 0);
  };

  const getFilteredSkillSuggestions = () => {
    if (!skillInput) return [];
    const inputLower = skillInput.toLowerCase();
    return availableSkills
      .filter(skill => 
        skill.includes(inputLower) && 
        !selectedSkills.includes(skill)
      )
      .slice(0, 10);
  };

  const fetchCompanyProfile = async () => {
    setLoadingProfile(true);
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/company/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      // Handle the new response format where profile data is nested under 'data'
      const profileData = responseData.data || responseData;
      
      if (profileData && profileData.logo) {
        setCompanyInfo({ ...profileData, logo_url: `http://localhost:5000/uploads/${profileData.logo}` });
      } else {
        setCompanyInfo(profileData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil de l’entreprise :', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await fetch('http://localhost:5000/refresh-token', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const fetchJobListings = async () => {
    if (activeTab !== 'jobs') return;

    setLoadingJobs(true);
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/company/jobs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      // Handle the new response format where job listings might be nested under 'data'
      const jobsData = responseData.data || responseData;
      
      // Ensure we always have an array
      setJobListings(Array.isArray(jobsData) ? jobsData : []);
    } catch (error) {
      console.error('Erreur lors de la récupération des offres d’emploi :', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError('');

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('No authentication token found');

      const response = await fetch('http://localhost:5000/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la déconnexion');
      }

      ['authToken', 'userType', 'userId', 'userName'].forEach(key => localStorage.removeItem(key));
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      setLogoutError(error instanceof Error ? error.message : 'Échec de la déconnexion');
      navigate('/', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleJobInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJobPost(prev => ({ ...prev, [name]: value }));
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPostingJob(true);
    setPostJobError('');
    setPostJobSuccess(false);

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('No authentication token found');

      const endpoint = isEditingJob && editingJobId 
        ? `http://localhost:5000/company/jobs/${editingJobId}`
        : 'http://localhost:5000/company/jobs';

      const body = {
        ...jobPost,
        required_skills: jobPost.required_skills, // <-- already an array now
      };

      const response = await fetch(endpoint, {
        method: isEditingJob ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la publication de l\'offre');
      }

      const updatedJob = await response.json();
      
      await fetchJobListings();
      
      setJobPost(defaultJobPost);
      setPostJobSuccess(true);
      setTimeout(() => setPostJobSuccess(false), 3000);
      
      if (isEditingJob) {
        setIsEditingJob(false);
        setEditingJobId(null);
      }
    } catch (error) {
      console.error('Job posting error:', error);
      setPostJobError(error instanceof Error ? error.message : 'Échec de la publication de l\'offre');
    } finally {
      setIsPostingJob(false);
    }
  };

  const handleToggleJobStatus = async (jobId: string, currentStatus: 'active' | 'closed') => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('No authentication token found');

      const newStatus = currentStatus === 'active' ? 'closed' : 'active';
      const response = await fetch(`http://localhost:5000/company/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Échec de la mise à jour du statut');
      
      await fetchJobListings();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de l’offre d’emploi :', error);
    }
  };

  const handleEditJob = (job: JobPost) => {
    setEditingJobId(job._id ?? null);
    setJobPost({
      job_title: job.job_title,
      salary: job.salary,
      looking_for_profile: job.looking_for_profile,
      required_experience: job.required_experience,
      required_skills: job.required_skills,
      required_skills_input: job.required_skills.join(', '),
      status: job.status || 'active'
    });
    setIsEditingJob(true);
    setShowEditJobForm(true);
  };

  const handleViewApplicants = async (job: JobPost) => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/company/jobs/${job._id}/applicants`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        // Handle the response format where applicants data is nested under 'data'
        const applicants = responseData.data || responseData;
        setSelectedJobApplicants(applicants);
        setShowApplicantsModal(true);
      } else {
        console.error('Échec de la récupération des candidats');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des candidats :', error);
    }
  };

  const filteredJobs = (Array.isArray(jobListings) ? jobListings : []).filter(job => {
    const searchLower = searchQuery.toLowerCase();
    return (
      job.job_title?.toLowerCase().includes(searchLower) ||
      job.looking_for_profile?.toLowerCase().includes(searchLower) ||
      job.required_skills?.some(skill => skill.toLowerCase().includes(searchLower))
    );
  });

  const filteredCandidates = candidates.filter(candidate => {
    // Search query filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      candidate.firstName?.toLowerCase().includes(searchLower) ||
      (typeof candidate.lastName === 'string' && candidate.lastName.toLowerCase().includes(searchLower)) ||
      candidate.skills?.some(skill => skill.toLowerCase().includes(searchLower)) ||
      (candidate.education?.degree && candidate.education.degree.toLowerCase().includes(searchLower)) ||
      (candidate.education?.institution && candidate.education.institution.toLowerCase().includes(searchLower)) ||
      (candidate.experience?.position && candidate.experience.position.toLowerCase().includes(searchLower)) ||
      (candidate.experience?.company && candidate.experience.company.toLowerCase().includes(searchLower))
    );

    // Skills filter
    const matchesSkills = selectedSkills.length === 0 || (
      candidate.skills && 
      selectedSkills.every(selectedSkill => 
        candidate.skills?.some(candidateSkill => 
          candidateSkill.toLowerCase().includes(selectedSkill.toLowerCase())
        )
      )
    );

    return matchesSearch && matchesSkills;
  });

  useEffect(() => { 
    fetchCompanyProfile();
    fetchJobListings(); // <-- Always fetch jobs on mount for stats
  }, []);

  useEffect(() => {
    if (activeTab === 'candidates') {
      fetchCandidates();
    }
    if (activeTab === 'jobs') {
      fetchJobListings(); // <-- Also fetch jobs when switching to jobs tab (for up-to-date list)
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) return;
      try {
        const response = await fetch('http://localhost:5000/company/verification-status', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        if (response.ok) {
          const responseData = await response.json();
          // Handle the new response format where verification status might be nested under 'data'
          const verificationData = responseData.data || responseData;
          setVerificationPending(verificationData.pending);
        }
      } catch (e) {
        setVerificationPending(false);
      }
    };
    fetchVerificationStatus();
  }, []);

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2">
                <img
                  src="http://localhost:5000/uploads/1.png"
                  alt="Growcoach Logo"
                  className="h-10 w-10 object-contain"
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
                  {companyInfo?.logo_url ? (
                    <img
                      src={companyInfo.logo_url}
                      alt="Company Logo"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                      {companyInfo?.company_name?.charAt(0) || 'C'}
                    </div>
                  )}
                  <span className="hidden md:inline">
                    {companyInfo?.company_name || 'Company'}
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/company-profile');
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-700 w-full text-left"
                    >
                      <User className="h-4 w-4" /> Profil
                    </button>
                    <div className="border-t border-gray-700 my-1"></div>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-700 w-full text-left text-red-400 disabled:opacity-50"
                    >
                      <LogOut className="h-4 w-4" />
                      {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
                    </button>
                    {logoutError && (
                      <div className="px-4 py-2 text-xs text-red-400">
                        {logoutError}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 border-b border-gray-700">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('candidates')}
                  className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'candidates' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
                >
                  <User className="h-4 w-4" />
                  Profils des candidats
                </button>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'jobs' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
                >
                  <List className="h-4 w-4" />
                  Mes offres d'emploi
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="mb-8">
            <div className="relative w-full max-w-3xl mx-auto">
              <div className="flex items-center">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder={activeTab === 'candidates'
                    ? "Recherchez des candidats par nom, compétences ou formation..."
                    : "Recherchez des emplois par titre, profil ou compétences..."}
                  className="w-full pl-12 pr-6 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {activeTab === 'candidates' ? (
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-2/3">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Candidats disponibles</h2>
                  <span className="text-gray-400">
                    {filteredCandidates.length} {filteredCandidates.length === 1 ? 'candidate' : 'candidates'} trouvé
                  </span>
                </div>

                {loadingCandidates ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : candidatesError ? (
                  <div className="bg-gray-800 p-8 rounded-lg text-center">
                    <p className="text-red-400">{candidatesError}</p>
                    <button
                      onClick={fetchCandidates}
                      className="mt-4 px-4 py-2 text-purple-500 hover:text-purple-400"
                    >
                      Réessayer
                    </button>
                  </div>
                ) : filteredCandidates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition transform hover:-translate-y-1 flex flex-col h-[340px] max-h-[340px] relative"
                      >
                        <div className="flex items-start space-x-4 p-6 pb-2">
                          <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center animate-pulse hover:animate-none">
                            {candidate.firstName?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-semibold">{candidate.firstName} {candidate.lastName}</h3>
                          </div>
                        </div>
                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto px-6 pb-2 scrollbar-thin scrollbar-thumb-[#8b5cf6] scrollbar-track-[#1E293B]">
                          {candidate.education && (
                            <div className="mt-3">
                              <h4 className="font-medium text-white flex items-center gap-2">
                                <BookOpen className="h-4 w-4" /> Education
                              </h4>
                              <div className="ml-6 mt-1">
                                <p className="text-gray-200">
                                  {candidate.education.degree || 'Not specified'}
                                  {candidate.education.field_of_study && ` in ${candidate.education.field_of_study}`}
                                </p>
                                <p className="text-gray-400">
                                  {candidate.education.school || candidate.education.institution || 'Unknown school'}
                                </p>
                                {candidate.education.start_date && (
                                  <p className="text-gray-500 text-sm mt-1">
                                    {formatDate(candidate.education.start_date)} - {candidate.education.end_date ? formatDate(candidate.education.end_date) : 'Present'}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {candidate.experience && (
                            <div className="mt-3">
                              <h4 className="font-medium text-white flex items-center gap-2">
                                <Briefcase className="h-4 w-4" /> Expérience
                              </h4>
                              <div className="ml-6 mt-1">
                                <p className="text-gray-200">
                                  {candidate.experience.position || 'No position specified'}
                                </p>
                                <p className="text-gray-400">
                                  {candidate.experience.company || 'Unknown company'}
                                </p>
                                {candidate.experience.start_date && (
                                  <div className="text-gray-500 text-sm mt-1">
                                    <p className="text-gray-500 text-sm mt-1">
                                      {formatDate(candidate.experience.start_date)} - {candidate.experience.end_date ? formatDate(candidate.experience.end_date) : 'Present'}
                                      {candidate.experience.start_date && (
                                        <span className="block text-gray-400 mt-1">
                                          Years of Experience: {calculateDuration(candidate.experience.start_date, candidate.experience.end_date)}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="mt-4">
                            <h4 className="font-medium text-white mb-2">Compétences</h4>
                            <div className="flex flex-wrap gap-2">
                              {candidate.skills?.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full hover:bg-purple-500 transition"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        {/* Fixed button at the bottom */}
                        <div className="p-6 pt-2 mt-auto">
                          {candidate.resume_url && (
                            <ResumeViewer
                              resumeUrl={candidate.resume_url}
                              adminCV={candidate.adminCV}
                              companyVerified={!!companyInfo?.verified}
                              verificationPending={verificationPending}
                              buttonClassName="px-3 py-1.5 bg-[#6D28D9] text-white rounded-md hover:bg-[#7C3AED] transition flex items-center gap-1.5 text-sm font-medium"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-800 p-8 rounded-lg text-center">
                    <p className="text-gray-400">Aucun candidat ne correspond à vos critères.</p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-4 px-4 py-2 text-purple-500 hover:text-purple-400"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>

              <div className="lg:w-1/3">
                <div className="bg-gray-800 p-6 rounded-lg shadow sticky top-32">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <FileText className="mr-2" /> Statistiques rapides
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-medium">Nombre total de candidats</h3>
                      <p className="text-2xl font-bold text-purple-500">{candidates.length}</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-medium">Offres d'emploi actives</h3>
                      <p className="text-2xl font-bold text-purple-500">
                        {(Array.isArray(jobListings) ? jobListings : []).filter(job => job.status === 'active').length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Skills Filter */}
                <div className="bg-gray-800 p-4 rounded-lg shadow mt-6">
                  <h3 className="text-lg font-semibold mb-3 text-white">Filtrer par compétences</h3>
                  
                  {/* Selected Skills Tags */}
                  {selectedSkills.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {selectedSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-purple-600 text-white text-xs rounded-full"
                          >
                            {skill}
                            <button
                              onClick={() => handleRemoveSkillFilter(skill)}
                              className="ml-1 hover:bg-purple-700 rounded-full p-0.5"
                              aria-label={`Remove ${skill} filter`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={clearAllSkillFilters}
                        className="text-xs text-purple-400 hover:text-purple-300 underline"
                      >
                        Effacer tous
                      </button>
                    </div>
                  )}

                  {/* Skills Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ajouter une compétence..."
                      className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400 text-sm"
                      value={skillInput}
                      onChange={(e) => handleSkillInputChange(e.target.value)}
                      onFocus={() => setShowSkillsDropdown(skillInput.length > 0)}
                      onBlur={() => setTimeout(() => setShowSkillsDropdown(false), 200)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && skillInput.trim()) {
                          e.preventDefault();
                          handleAddSkillFilter(skillInput.trim());
                        }
                      }}
                    />

                    {/* Skills Dropdown */}
                    {showSkillsDropdown && getFilteredSkillSuggestions().length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                        {getFilteredSkillSuggestions().map((skill, index) => (
                          <button
                            key={index}
                            onClick={() => handleAddSkillFilter(skill)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-600 text-white text-sm first:rounded-t-lg last:rounded-b-lg"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Add custom skill button */}
                    {skillInput.trim() && !getFilteredSkillSuggestions().includes(skillInput.toLowerCase().trim()) && (
                      <div className="absolute z-20 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
                        <button
                          onClick={() => handleAddSkillFilter(skillInput.trim())}
                          className="w-full px-3 py-2 text-left hover:bg-gray-600 text-white text-sm rounded-lg"
                        >
                          Ajouter "{skillInput.trim()}"
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Filter Summary */}
                  {selectedSkills.length > 0 && (
                    <div className="mt-2 text-xs text-gray-400">
                      {filteredCandidates.length} candidat{filteredCandidates.length > 1 ? 's' : ''} avec ces compétences
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-2/3">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Mes offres</h2>
                  <span className="text-gray-400">
                    {filteredJobs.length} {filteredJobs.length === 1 ? 'emploi' : 'emplois'} trouvé
                  </span>
                </div>

                {loadingJobs ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : filteredJobs.length > 0 ? (
                  <div className="space-y-4">
                    {filteredJobs.map((job) => (
                      <div key={job._id} className="bg-gray-800 p-6 rounded-lg shadow hover:bg-gray-700 transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-semibold">{job.job_title}</h3>
                            <p className="text-purple-400">{job.salary}</p>
                          </div>
                          <span
                            className={`px-3 py-1 text-xs rounded-full cursor-pointer ${job.status === 'active'
                              ? 'bg-green-600 text-white'
                              : 'bg-red-700 text-white'
                              }`}
                            onClick={() =>
                              job._id &&
                              (job.status === 'active' || job.status === 'closed') &&
                              handleToggleJobStatus(job._id, job.status)
                            }
                          >
                            {job.status}
                          </span>
                        </div>
                        <div className="mt-4 space-y-2">
                          <p className="text-gray-400">
                            <span className="font-medium text-white">Recherche :</span> {job.looking_for_profile}
                          </p>
                          <p className="text-gray-400">
                            <span className="font-medium text-white">Expérience :</span> {job.required_experience}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {job.required_skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-purple-500 text-white text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                          <p className="text-gray-400">
                            <span className="font-medium text-white">Candidats :</span> 
                            {Array.isArray(job.applicants) ? job.applicants.length : job.applicants || 0}
                          </p>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => handleEditJob(job)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleViewApplicants(job)}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition flex items-center gap-1"
                          >
                            <Users className="h-4 w-4" />
                            Voir les candidats
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-800 p-8 rounded-lg text-center">
                    <p className="text-gray-400">Aucune offre d'emploi ne correspond à votre recherche.</p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-4 px-4 py-2 text-purple-500 hover:text-purple-400"
                    >
                      Effacer la recherche
                    </button>
                  </div>
                )}
              </div>

              <div className="lg:w-1/3">
                <div className="bg-gray-800 p-6 rounded-lg shadow sticky top-32">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <Briefcase className="mr-2" /> {isEditingJob ? 'Modifier le travail' : 'Publier un nouvel emploi'}
                  </h2>
                  <form onSubmit={handlePostJob}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="job_title" className="block text-sm font-medium mb-1">Intitulé du poste</label>
                        <input
                          id="job_title"
                          type="text"
                          name="job_title"
                          placeholder="e.g. Frontend Developer"
                          className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={jobPost.job_title}
                          onChange={handleJobInputChange}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="salary" className="block text-sm font-medium mb-1">Fourchette salariale</label>
                        <input
                          id="salary"
                          type="text"
                          name="salary"
                          placeholder="e.g. 70 000 DTN - 90 000 DTN"
                          className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={jobPost.salary}
                          onChange={handleJobInputChange}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="looking_for_profile" className="block text-sm font-medium mb-1">Description du profil</label>
                        <textarea
                          id="looking_for_profile"
                          name="looking_for_profile"
                          placeholder="Quel type de candidat recherchez-vous ?"
                          className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={jobPost.looking_for_profile}
                          onChange={handleJobInputChange}
                          rows={3}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="required_skills" className="block text-sm font-medium mb-1">Compétences requises</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {Array.isArray(jobPost.required_skills) && jobPost.required_skills.map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-700 text-white rounded-full flex items-center gap-1">
                              {skill}
                              <button
                                type="button"
                                className="ml-1 text-xs text-white hover:text-red-400"
                                onClick={() => {
                                  setJobPost(prev => ({
                                    ...prev,
                                    required_skills: prev.required_skills.filter((_, i) => i !== idx)
                                  }));
                                }}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            id="required_skills"
                            type="text"
                            name="required_skills_input"
                            placeholder="Ajouter une compétence et appuyer sur Entrée"
                            className="flex-1 p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={currentSkill}
                            onChange={e => setCurrentSkill(e.target.value)}
                            onKeyDown={e => {
                              if ((e.key === 'Enter' || e.key === ',') && currentSkill.trim()) {
                                e.preventDefault();
                                if (
                                  !jobPost.required_skills.includes(currentSkill.trim().toLowerCase())
                                ) {
                                  setJobPost(prev => ({
                                    ...prev,
                                    required_skills: [...prev.required_skills, currentSkill.trim().toLowerCase()]
                                  }));
                                }
                                setCurrentSkill('');
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
                            onClick={() => {
                              if (currentSkill.trim() && !jobPost.required_skills.includes(currentSkill.trim().toLowerCase())) {
                                setJobPost(prev => ({
                                  ...prev,
                                  required_skills: [...prev.required_skills, currentSkill.trim().toLowerCase()]
                                }));
                                setCurrentSkill('');
                              }
                            }}
                          >
                            Ajouter
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="required_experience" className="block text-sm font-medium mb-1">Expérience requise</label>
                        <input
                          id="required_experience"
                          type="text"
                          name="required_experience"
                          placeholder="e.g. 2 ans, Junior, Senior, etc."
                          className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={jobPost.required_experience}
                          onChange={handleJobInputChange}
                          required
                        />
                      </div>

                      {isPostingJob && (
                        <div className="text-purple-400 text-sm mb-2">Publication de l'offre d'emploi...</div>
                      )}
                      {postJobError && (
                        <div className="text-red-400 text-sm mb-2">{postJobError}</div>
                      )}
                      {postJobSuccess && (
                        <div className="text-green-400 text-sm mb-2">
                          Job {isEditingJob ? 'updated' : 'posted'} avec succès !
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isPostingJob}
                        className={`w-full px-4 py-2 rounded text-white font-medium transition flex items-center justify-center ${isPostingJob
                          ? 'bg-purple-700 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-500'
                          }`}
                      >
                        {isPostingJob ? 'Posting...' : isEditingJob ? 'Mettre à jour le travail' : 'Publier une offre d`emploi'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {showApplicantsModal && (
            <ApplicantsModal
              applicants={selectedJobApplicants}
              companyVerified={!!companyInfo?.verified}
              verificationPending={verificationPending}
              onClose={() => setShowApplicantsModal(false)}
            />
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}

export default CompanyDashboard;