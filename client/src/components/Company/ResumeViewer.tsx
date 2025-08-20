import React, { useState } from 'react';
import { FileText, X } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

interface ResumeViewerProps {
  resumeUrl: string;
  adminCV?: string;
  companyVerified: boolean;
  verificationPending: boolean;
  buttonClassName?: string;
}

const ResumeViewer: React.FC<ResumeViewerProps> = ({
  resumeUrl,
  adminCV,
  companyVerified,
  verificationPending,
  buttonClassName = "w-full px-3 py-2 bg-[#334155] text-white rounded-lg border border-[#44C0EB] hover:bg-[#44C0EB] hover:text-white transition"
}) => {
  const [showVerificationRequest, setShowVerificationRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [showCVNotice, setShowCVNotice] = useState(false);

  const handleViewResume = () => {
    if (companyVerified) {
      if (adminCV) {
        setShowCVNotice(true);
      } else {
        window.open(resumeUrl, '_blank');
      }
    } else {
      setShowVerificationRequest(true);
    }
  };

  return (
    <>
      <button
        onClick={handleViewResume}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg border border-purple-700 hover:bg-purple-700 hover:text-white transition flex items-center justify-center gap-2"
      >
        <FileText className="h-4 w-4" />
        Voir le CV
      </button>
      {/* CV Notice Modal */}
      {showCVNotice && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border-2 border-[#8B5CF6]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#8B5CF6]">
                Note importante
              </h3>
              <button 
                onClick={() => setShowCVNotice(false)}
                className="text-[#8B5CF6] hover:text-white p-1 rounded-full hover:bg-[#6D28D9] transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-[#E0E7EF] mb-6">
              Le CV de ce candidat a été anonymisé par <span className="font-semibold text-[#8B5CF6]">Growcoach</span>.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCVNotice(false)}
                className="px-4 py-2 bg-[#6D28D9] text-white rounded-lg hover:bg-[#7C3AED] transition"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowCVNotice(false);
                  window.open(adminCV, '_blank');
                }}
                className="px-4 py-2 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] transition"
              >
                Voir le CV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Request Modal */}
      {showVerificationRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-purple-400 mb-4 text-center">
              Vérification du compte requise
            </h2>
            {(verificationPending || requestSent) ? (
              <div className="text-center">
                <p className="text-green-400 mb-6">
                  Demande de vérification envoyée avec succès !
                </p>
                <button
                  onClick={() => setShowVerificationRequest(false)}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium transition-colors"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <p className="text-gray-300 mb-6 text-center">
                  Votre compte entreprise doit être vérifié avant que vous puissiez consulter les CV.
                  Souhaitez-vous demander une vérification auprès de l'administrateur ?
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowVerificationRequest(false)}
                    className="px-6 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg text-gray-800 font-medium transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`${API_BASE_URL}/request-verification`, {
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
                        // handle error
                      }
                    }}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium transition-colors"
                  >
                    Confirmer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ResumeViewer;