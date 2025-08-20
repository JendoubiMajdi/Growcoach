import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, LogOut, Briefcase, List, FileText, BookOpen, Edit, Users, X, Bell, Check, Shield, File, ChevronRight, Eye, Ban, CheckCircle } from 'lucide-react';
import Footer from '../Footer';

type User = {
  _id: string;
  name: string;
  email: string;
  type: "candidate" | "company";
  status: "active" | "blocked" | "pending";
  verified?: boolean;
  created_at: string;
  CV?: string;
  logo?: string;
  photo?: string;
  adminCV?: string; 
  formation_name?: string; 
  has_growcoach_formation?: boolean;

};

type Notification = {
  _id: string;  
  text: string;
  time: string;
  unread: boolean;
  type: string;
  company_id?: string;
  candidate_id?: string;
  company_name?: string;
  candidate_name?: string;
};

const API_BASE_URL = 'http://localhost:5000';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [viewingCV, setViewingCV] = useState<{url: string; name: string} | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [formationFilter, setFormationFilter] = useState<'all' | 'with' | 'without'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const usersPerPage = 8;

  const normalizeUserData = (users: any[]): User[] => {
    return users.map(user => ({
      _id: user._id || '',
      name: user.name || 'Inconnu',
      email: user.email || 'Pas d\'email',
      type: ['candidate', 'company'].includes(user.type) ? user.type : 'candidate',
      status: ['active', 'blocked', 'pending'].includes(user.status) ? user.status : 'pending' // Default to pending
      ,
      verified: user.type === 'company' ? !!user.verified : undefined,
      created_at: user.created_at || new Date().toISOString(),
      CV: user.CV,
      logo: user.logo,
      photo: user.photo,
      adminCV: user.adminCV,
      has_growcoach_formation: user.has_growcoach_formation ?? false,
      formation_name: user.formation_name || '',
    }));
  };

  const handleCandidateApproval = async (candidateId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/candidates/${candidateId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Échec de l\'approbation du candidat');

      // Update users list
      setUsers(users.map((user: User): User => 
        user._id === candidateId ? { ...user, status: 'active' } : user
      ));

      // Update selected user in modal
      if (selectedUser?._id === candidateId) {
        setSelectedUser({ ...selectedUser, status: 'active' });
      }

      return true;
    } catch (err) {
      console.error("Erreur lors de l'approbation du candidat :", err);
      setError(err instanceof Error ? err.message : 'Échec de l\'approbation du candidat');
      return false;
    }
  };


  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/admin/login');
          return;
        }
        throw new Error(`Erreur HTTP ! statut : ${response.status}`);
      }

      const data = await response.json();
      setUsers(normalizeUserData(data));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec du chargement des utilisateurs');
      console.error("Erreur lors du chargement des utilisateurs :", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setIsRefreshing(true);
      
      const response = await fetch(`${API_BASE_URL}/admin/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setLastRefresh(new Date());
      }
    } catch (err) {
      console.error("Erreur lors du chargement des notifications :", err);
    } finally {
      if (showRefreshing) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchNotifications(true);

    // Set up auto-refresh for notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 30000); // 30 seconds

    setAutoRefreshInterval(interval);

    // Cleanup on unmount
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchNotifications]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Déconnexion échouée');
      }

      localStorage.removeItem('authToken');
      navigate('/');
    } catch (err) {
      console.error('Erreur de déconnexion :', err);
      setLogoutError(err instanceof Error ? err.message : 'Déconnexion échouée');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterType !== 'all' && user.type !== filterType) {
      return false;
    }
    if (statusFilter !== 'all' && user.status !== statusFilter) {
      return false;
    }
    if (filterType === 'candidate') {
      if (formationFilter === 'with' && !user.has_growcoach_formation) {
        return false;
      }
      if (formationFilter === 'without' && user.has_growcoach_formation) {
        return false;
      }
    }
    return true;
  });

  const totalUsers = users.length;
  const totalCandidates = users.filter(user => user.type === 'candidate').length;
  const totalCompanies = users.filter(user => user.type === 'company').length;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  const handleCandidateStatus = async (candidateId: string, action: 'block' | 'unblock') => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/candidates/${candidateId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ action }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Échec de la mise à jour du statut du candidat');

      const updatedUser = await response.json();

      // Update users list
      setUsers(users.map(user =>
        user._id === candidateId ? { ...user, status: updatedUser.status } : user
      ));

      // Update selected user in modal
      if (selectedUser?._id === candidateId) {
        setSelectedUser({ ...selectedUser, status: updatedUser.status });
      }

      return true;
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut du candidat :", err);
      setError(err instanceof Error ? err.message : 'Échec de la mise à jour du statut');
      return false;
    }
  };

  const handleCompanyStatus = async (companyId: string, action: 'verify' | 'unverify' | 'block' | 'unblock') => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/companies/${companyId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ action }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Échec de la mise à jour du statut de l\'entreprise');

      const updatedUser = await response.json();

      // Update users list
      setUsers(users.map(user =>
        user._id === companyId ? {
          ...user,
          status: updatedUser.status,
          verified: updatedUser.verified
        } : user
      ));

      // Update selected user in modal
      if (selectedUser?._id === companyId) {
        setSelectedUser({
          ...selectedUser,
          status: updatedUser.status,
          verified: updatedUser.verified
        });
      }

      return true;
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut de l'entreprise :", err);
      setError(err instanceof Error ? err.message : 'Échec de la mise à jour du statut');
      return false;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setIsDeleting(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Remove user from the users list
        setUsers(users.filter(u => u._id !== userId));
        
        // Close all modals
        setIsUserDetailsOpen(false);
        setShowDeleteConfirm(false);
        setUserToDelete(null);
        
        // Show success message
        alert(data.message || 'Utilisateur supprimé avec succès');
      } else {
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert("Erreur lors de la suppression de l'utilisateur");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteConfirm = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleNotificationApproval = async (notificationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/notifications/${notificationId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        // Remove notification from state immediately
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        
        // Refresh users data
        await fetchUsers();
        
        // Force refresh notifications to get updated count
        setTimeout(() => fetchNotifications(false), 1000);
        
        // Show success message
        alert(result.message || 'Notification approuvée avec succès');
      } else {
        const errorData = await response.json();
        console.error('Failed to approve notification:', errorData);
        alert(errorData.error || 'Erreur lors de l\'approbation');
      }
    } catch (error) {
      console.error('Error approving notification:', error);
      alert('Erreur lors de l\'approbation de la notification');
    }
  };

  const handleNotificationRejection = async (notificationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/notifications/${notificationId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        // Remove notification from state immediately
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        
        // Refresh users data
        await fetchUsers();
        
        // Force refresh notifications to get updated count
        setTimeout(() => fetchNotifications(false), 1000);
        
        // Show success message
        alert(result.message || 'Notification rejetée avec succès');
      } else {
        const errorData = await response.json();
        console.error('Failed to reject notification:', errorData);
        alert(errorData.error || 'Erreur lors du rejet');
      }
    } catch (error) {
      console.error('Error rejecting notification:', error);
      alert('Erreur lors du rejet de la notification');
    }
  };

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      // Close notifications dropdown
      if (showNotifications && !(event.target as Element).closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
      
      // Close profile menu dropdown
      if (showProfileMenu && !(event.target as Element).closest('.profile-menu')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showProfileMenu]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
<Link to="/admin" className="flex items-center space-x-2">
                <img
                  src="http://localhost:5000/uploads/1.png"
                  alt="Growcoach Logo"
                  className="h-10 w-10 object-contain"
                  style={{ borderRadius: '4px' }}
                />
  <span className="text-xl font-bold">Growcoach Admin</span>
</Link>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-gray-700 rounded-full relative"
                >
                  <Bell className="h-5 w-5 text-gray-300" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </button>
                
                {/* Notification dropdown - Add className for click outside handler */}
                {showNotifications && (
                  <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-2 z-50">
                    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
                      <h3 className="text-sm font-semibold">Notifications en attente</h3>
                      <div className="flex items-center gap-2">
                        {isRefreshing && (
                          <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-purple-500"></div>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(lastRefresh).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    
                    {notifications.length > 0 ? (
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map(notification => (
                          <div
                            key={notification._id}
                            className="px-4 py-3 hover:bg-gray-700 border-b border-gray-700 last:border-b-0 bg-gray-700/30"
                          >
                            <div 
                              className="cursor-pointer"
                              onClick={async () => {
                                // Handle notification click (open user details)
                                if (notification.type === 'new_candidate' || notification.type === 'candidate_registration') {
                                  const candidateUser = users.find(
                                    user => user._id === notification.candidate_id && user.type === 'candidate'
                                  );
                                  if (candidateUser) {
                                    setSelectedUser(candidateUser);
                                    setIsUserDetailsOpen(true);
                                  }
                                }
                                else if (notification.type === 'company_registration') {
                                  const companyUser = users.find(
                                    user => user._id === notification.company_id && user.type === 'company'
                                  );
                                  if (companyUser) {
                                    setSelectedUser(companyUser);
                                    setIsUserDetailsOpen(true);
                                  }
                                }
                              }}
                            >
                              <div className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div className="flex-1">
                                  <p className="text-sm text-white">{notification.text}</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notification.time).toLocaleString()
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Show approve/reject buttons for registration notifications */}
                            {(notification.type === 'new_candidate' || 
                              notification.type === 'candidate_registration' || 
                              notification.type === 'company_registration') && (
                              <div className="mt-3 flex gap-2 justify-end">
                                <button
                                  className="text-xs bg-green-600 hover:bg-green-500 px-3 py-1.5 rounded transition-colors font-medium"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await handleNotificationApproval(notification._id);
                                  }}
                                >
                                  ✓ Approuver
                                </button>
                                
                                <button
                                  className="text-xs bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded transition-colors font-medium"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await handleNotificationRejection(notification._id);
                                  }}
                                >
                                  ✗ Rejeter
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <div className="text-green-400 mb-2">
                          <CheckCircle className="h-8 w-8 mx-auto" />
                        </div>
                        <p className="text-sm text-gray-400">Aucune notification en attente</p>
                        <p className="text-xs text-gray-500 mt-1">Toutes les notifications ont été traitées</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden md:inline">Admin</span>
                </button>

                {showProfileMenu && (
                  <div className="profile-menu absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 z-50">
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
          </div>

          {/* Tabs */}
          <div className="mt-4 border-b border-gray-700">
            <div className="flex">
              <button
                className="px-4 py-2 font-medium flex items-center gap-2 text-purple-500 border-b-2 border-purple-500"
              >
                <Users className="h-4 w-4" />
                Gestion des utilisateurs
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative w-full max-w-3xl mx-auto">
            <div className="flex items-center">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher des utilisateurs par nom, email ou type..."
                className="w-full pl-12 pr-6 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-800/80 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Utilisateurs totaux</p>
                <h3 className="text-2xl font-bold mt-1 text-white">{totalUsers}</h3>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-800/80 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Candidats</p>
                <h3 className="text-2xl font-bold mt-1 text-white">{totalCandidates}</h3>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <User className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-800/80 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Entreprises</p>
                <h3 className="text-2xl font-bold mt-1 text-white">{totalCompanies}</h3>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Briefcase className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-800/80 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">En attente</p>
                <h3 className="text-2xl font-bold mt-1 text-white">{users.filter(user => user.status === 'pending').length}</h3>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Ban className="h-5 w-5 text-orange-400" />
              </div>
            </div>
          </div>
          {/* Add this as a new statistics card after the "En attente" card: */}
          <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-800/80 transition-colors">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-400">Bloqués</p>
      <h3 className="text-2xl font-bold mt-1 text-white">{users.filter(user => user.status === 'blocked').length}</h3>
    </div>
    <div className="p-3 bg-red-500/20 rounded-lg">
      <Ban className="h-5 w-5 text-red-400" />
    </div>
  </div>
</div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold text-white">Gestion des utilisateurs</h2>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <select
                className="px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Tous les types</option>
                <option value="candidate">Candidats</option>
                <option value="company">Entreprises</option>
              </select>
                {/* Affiche le filtre formation seulement pour les candidats */}
                  {filterType === 'candidate' && (
                    <select
                      className="px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      value={formationFilter}
                      onChange={e => setFormationFilter(e.target.value as 'all' | 'with' | 'without')}
                    >
                      <option value="all">Tous</option>
                      <option value="with">Avec formation</option>
                      <option value="without">Sans formation</option>
                    </select>
                  )}


              <select
                className="px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="pending">En attente</option>
                <option value="blocked">Bloqué</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-750">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Inscription</th>
                      {/* Affiche la colonne Formations seulement si filtre "candidat" + "with" */}
                    {filterType === 'candidate' && formationFilter === 'with' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Formations</th>
                    )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">CV</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-red-400">
                      {error}
                      <button 
                        onClick={() => window.location.reload()}
                        className="ml-2 text-purple-400 hover:text-purple-300"
                      >
                        Réessayer
                      </button>
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                      Aucun utilisateur trouvé correspondant à vos critères
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-750 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-white">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.type === 'candidate' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {user.type === 'candidate' ? 'Candidat' : 'Entreprise'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.status === 'active'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : user.status === 'pending'
                            ? 'bg-orange-400/20 text-orange-300 border border-orange-400/30'
                            : user.status === 'blocked'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-orange-600/20 text-orange-500 border border-orange-600/30' // For 'inactive' or other non-active states
                        }`}>
                          {user.status === 'active'
                            ? 'Actif'
                            : user.status === 'pending'
                            ? 'En attente'
                            : user.status === 'blocked'
                            ? 'Bloqué'
                            : 'Non-actif'}
                          {/* Show verification status for active companies */}
                          {user.type === 'company' && user.status === 'active' && (
                            user.verified ? ' (Vérifiée)' : ' (Non vérifiée)'
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                        {formatDate(user.created_at)}
                      </td>
                            {/* Affiche la cellule Formations seulement si filtre "candidat" + "with" */}
                          {filterType === 'candidate' && formationFilter === 'with' && (
                            <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                              {user.formation_name || '-'}
                            </td>
                          )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.type === 'candidate' && user.CV ? (
                          <button
                            onClick={() => setViewingCV({ url: user.CV!, name: user.name })}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsUserDetailsOpen(true);
                          }}
                          className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        >
                          <ChevronRight className="h-4 w-4" /> Détails
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
  <div className="flex justify-center items-center gap-2 mt-6">
    <button
      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
      disabled={currentPage === 1}
      className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-purple-600 disabled:opacity-50"
    >
      Précédent
    </button>
    <span className="mx-2 text-gray-300">
      Page {currentPage} sur {totalPages}
    </span>
    <button
      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
      disabled={currentPage === totalPages}
      className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-purple-600 disabled:opacity-50"
    >
      Suivant
    </button>
  </div>
)}
        </div>
      </main>

      {/* CV Viewer Modal */}
      {viewingCV && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="relative bg-gray-800 rounded-lg border-2 border-purple-400 p-6 max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-purple-300">
                CV de {viewingCV.name}
              </h3>
              <button 
                onClick={() => setViewingCV(null)}
                className="text-purple-300 hover:text-white p-1 rounded-full hover:bg-purple-900 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              {viewingCV.url.endsWith('.pdf') ? (
                <embed
                  src={viewingCV.url}
                  type="application/pdf"
                  className="w-full h-full min-h-[70vh]"
                />
              ) : (
                <img
                  src={viewingCV.url}
                  alt={`CV de ${viewingCV.name}`}
                  className="max-w-full mx-auto"
                />
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setViewingCV(null)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {isUserDetailsOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="relative bg-gray-800 rounded-lg border-2 border-purple-400 p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-purple-300">
                Détails de l'utilisateur
              </h3>
              <button 
                onClick={() => setIsUserDetailsOpen(false)}
                className="text-purple-300 hover:text-white p-1 rounded-full hover:bg-purple-900 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-start gap-4 mb-6">
              {(selectedUser.photo || selectedUser.logo) ? (
                <img
                  src={
                    selectedUser.photo
                      ? selectedUser.photo.startsWith('http')
                        ? selectedUser.photo
                        : `http://localhost:5000/uploads/${selectedUser.photo}`
                      : selectedUser.logo
                        ? selectedUser.logo.startsWith('http')
                          ? selectedUser.logo
                          : `http://localhost:5000/uploads/${selectedUser.logo}`
                        : ''
                  }
                  alt={selectedUser.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-purple-400"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-white text-2xl font-bold border-2 border-purple-400">
                  {/* Optionally, you can leave this empty or put a generic user icon */}
                  <User className="h-8 w-8" />
                </div>
              )}
              <div>
                <h4 className="text-lg font-semibold">{selectedUser.name}</h4>
                <p className="text-gray-400">{selectedUser.email}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedUser.type === 'candidate' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {selectedUser.type === 'candidate' ? 'Candidat' : 'Entreprise'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedUser.status === 'active'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : selectedUser.status === 'pending'
                      ? 'bg-orange-400/20 text-orange-300 border border-orange-400/30'
                      : selectedUser.status === 'blocked'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-orange-600/20 text-orange-500 border border-orange-600/30'
                  }`}>
                    {selectedUser.status === 'active'
                      ? 'Actif'
                      : selectedUser.status === 'pending'
                      ? 'En attente'
                      : selectedUser.status === 'blocked'
                      ? 'Bloqué'
                      : 'Non-actif'}
                    {/* Show verification status for active companies */}
                    {selectedUser.type === 'company' && selectedUser.status === 'active' && (
                      selectedUser.verified ? ' (Vérifiée)' : ' (Non vérifiée)'
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-400">Type de compte</p>
                <p className="text-white capitalize">{selectedUser.type === 'candidate' ? 'Candidat' : 'Entreprise'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Statut du compte</p>
                <p className={`font-medium ${
    selectedUser.status === 'active'
      ? 'text-green-400'
      : selectedUser.status === 'pending'
      ? 'text-orange-300'
      : selectedUser.status === 'blocked'
      ? 'text-red-400'
      : 'text-orange-500'
  }`}>
    {selectedUser.status === 'active'
      ? 'Actif'
      : selectedUser.status === 'pending'
      ? 'En attente'
      : selectedUser.status === 'blocked'
      ? 'Bloqué'
      : 'Non-actif'}
    {/* Show verification status for active companies */}
    {selectedUser.type === 'company' && selectedUser.status === 'active' && (
      selectedUser.verified ? ' (Vérifiée)' : ' (Non vérifiée)'
    )}
  </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Date d'inscription</p>
                <p className="text-white">{formatDate(selectedUser.created_at)}</p>
              </div>
              {selectedUser.type === 'candidate' && selectedUser.CV && (
                <div>
                  <p className="text-sm text-gray-400">CV disponible</p>
                </div>
              )}
              {/* Ajout du lien vers le CV admin si présent */}
{selectedUser.type === 'candidate' && selectedUser.adminCV && (
  <div>
    <p className="text-sm text-gray-400">CV Anonyme</p>
    <a
      href={selectedUser.adminCV}
      target="_blank"
      rel="noopener noreferrer"
      className="text-purple-400 hover:underline ml-2 text-xs"
    >
      Ouvrir dans un nouvel onglet
    </a>
  </div>
)}          </div>

            {/* Ajout du formulaire d'upload de CV admin */}
            {selectedUser.type === 'candidate' && (
              <div className="mb-6">
    <div className="bg-gray-700 rounded-lg p-4 flex flex-col gap-3 shadow-inner">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-5 w-5 text-purple-400" />
        <span className="font-medium text-gray-200">CV Anonyme</span>
      </div>
      {selectedUser.adminCV ? (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-400">
          </span>
        </div>
      ) : (
        <span className="text-xs text-gray-400 mb-2">Aucun CV anonyme ajouté</span>
      )}

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const fileInput = form.elements.namedItem('adminCV') as HTMLInputElement;
          if (!fileInput.files || fileInput.files.length === 0) return;
          const file = fileInput.files[0];
          const formData = new FormData();
          formData.append('adminCV', file);

          try {
            const res = await fetch(
              `http://localhost:5000/admin/candidates/${selectedUser._id}/admin-cv`,
              {
                method: 'POST',
                body: formData,
              }
            );
            const data = await res.json();
            if (data.success && data.adminCV) {
              setSelectedUser({
                ...selectedUser,
                adminCV: data.adminCV,
              });
            }
          } catch (err) {
          }
        }}
        className="flex flex-col gap-2"
      >
        <label className="text-sm text-gray-400 font-medium">
          Ajouter ou remplacer le CV anonyme (PDF)
        </label>
        <input
          type="file"
          name="adminCV"
          accept="application/pdf"
          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition w-fit mt-2"
        >
          {selectedUser.adminCV ? "Remplacer le CV anonyme" : "Ajouter le CV anonyme"}
        </button>
      </form>
    </div>
  </div>
            )}

            <div className="flex flex-wrap gap-3 justify-end">
              {/* Candidate Actions */}
              {selectedUser.type === 'candidate' && (
                <>
                  {selectedUser.status === 'blocked' && (
                    <button
                      onClick={async () => {
                        const success = await handleCandidateStatus(selectedUser._id, 'unblock');
                        if (success) setIsUserDetailsOpen(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Débloquer
                    </button>
                  )}
                  {selectedUser.status === 'pending' && (
                    <button
                      onClick={async () => {
                        const success = await handleCandidateApproval(selectedUser._id);
                        if (success) setIsUserDetailsOpen(false); // Close modal after action
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Activer
                    </button>
                  )}
                  {selectedUser.status === 'active' && (
                    <button
                      onClick={async () => {
                        const success = await handleCandidateStatus(selectedUser._id, 'block');
                        if (success) setIsUserDetailsOpen(false); // Close modal after action
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition flex items-center gap-2"
                    >
                      <Ban className="h-4 w-4" />
                      Bloquer
                    </button>
                  )}
                  <button
                    onClick={() => openDeleteConfirm(selectedUser)}
                    className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Supprimer
                  </button>
                </>
              )}

              {/* Company Actions */}
              {selectedUser.type === 'company' && (
                <>
                  {selectedUser.status === 'blocked' && (
                    <button
                      onClick={async () => {
                        const success = await handleCompanyStatus(selectedUser._id, 'unblock');
                        if (success) setIsUserDetailsOpen(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Débloquer
                    </button>
                  )}
                  {selectedUser.status === 'pending' && (
                    <button
                      onClick={async () => {
                        const success = await handleCompanyStatus(selectedUser._id, 'verify');
                        if (success) setIsUserDetailsOpen(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Activer et Vérifier
                    </button>
                  )}
                  {selectedUser.status === 'active' && (
                    <button
                      onClick={async () => {
                        const success = await handleCompanyStatus(selectedUser._id, 'block');
                        if (success) setIsUserDetailsOpen(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition flex items-center gap-2"
                    >
                      <Ban className="h-4 w-4" />
                      Bloquer
                    </button>
                  )}
                  {selectedUser.status === 'active' && selectedUser.verified && (
                    <button
                      onClick={async () => {
                        const success = await handleCompanyStatus(selectedUser._id, 'unverify');
                        if (success) setIsUserDetailsOpen(false);
                      }}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition flex items-center gap-2"
                    >
                      <Ban className="h-4 w-4" />
                      Retirer la vérification
                    </button>
                  )}
                  {selectedUser.status === 'active' && !selectedUser.verified && (
                    <button
                      onClick={async () => {
                        const success = await handleCompanyStatus(selectedUser._id, 'verify');
                        if (success) setIsUserDetailsOpen(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Vérifier
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Delete Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4">
          <div className="relative bg-gray-800 rounded-lg border-2 border-red-500 p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                <X className="h-5 w-5" />
                Confirmer la suppression
              </h3>
              <button 
                onClick={closeDeleteConfirm}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <X className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{userToDelete.name}</h4>
                    <p className="text-sm text-gray-400">{userToDelete.email}</p>
                  </div>
                </div>
                
                <div className="text-sm text-gray-300">
                  <p className="mb-2">
                    <span className="font-medium">Type:</span> {userToDelete.type === 'candidate' ? 'Candidat' : 'Entreprise'}
                  </p>
                  <p className="mb-2">
                    <span className="font-medium">Statut:</span> {userToDelete.status}
                  </p>
                  <p>
                    <span className="font-medium">Inscrit le:</span> {formatDate(userToDelete.created_at)}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-1.962-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Attention !
                </h4>
                <p className="text-sm text-yellow-200">
                  Cette action est <strong>irréversible</strong>. Toutes les données associées à cet utilisateur seront définitivement supprimées.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
              >
                Annuler
              </button>
              
              <button
                onClick={() => handleDeleteUser(userToDelete._id)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Suppression...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" />
                    Supprimer définitivement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default AdminDashboard;