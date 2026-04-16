
import React from 'react';
import { UserProfile, AdminNote, ClientReview, ProFeedback } from '../types';
import { X, MapPin, Phone, ShieldCheck, ShieldAlert, Star, Calendar, MessageSquare, Briefcase, User, MessageCircle } from 'lucide-react';

interface AdminUserModalProps {
  user: UserProfile;
  onClose: () => void;
  clientReviews?: ClientReview[]; // NEW
  proFeedbacks?: ProFeedback[]; // NEW (if user is provider)
}

export const AdminUserModal: React.FC<AdminUserModalProps> = ({ user, onClose, clientReviews = [], proFeedbacks = [] }) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 p-6 flex justify-between items-start">
           <div className="flex items-center gap-4">
              <img 
                src={user.photoUrl} 
                alt={`${user.firstName} ${user.lastName}`} 
                className="w-16 h-16 rounded-full border-4 border-white bg-gray-200 object-cover"
              />
              <div>
                <h2 className="text-xl font-bold text-white">{user.firstName} {user.lastName}</h2>
                <div className="flex items-center gap-2 mt-1">
                   <span className="bg-brand-orange text-white text-xs px-2 py-0.5 rounded font-bold uppercase">{user.role}</span>
                   {user.verified && (
                      <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <ShieldCheck size={10} /> Vérifié
                      </span>
                   )}
                </div>
              </div>
           </div>
           <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition">
             <X size={24} />
           </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* LEFT COLUMN: INFO & ADMIN NOTES */}
           <div className="space-y-6">
               {/* Basic Info Grid */}
               <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-3">
                 <h3 className="text-sm font-bold text-gray-500 uppercase border-b pb-1">Coordonnées</h3>
                 <div className="flex items-center gap-2 text-gray-700">
                    <Phone size={16} className="text-gray-400" />
                    <span>{user.phone}</span>
                 </div>
                 <div className="flex items-center gap-2 text-gray-700">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{user.location.city}, {user.location.commune}, {user.location.quartier}</span>
                 </div>
                 <div className="flex items-center gap-2 text-gray-700">
                    <User size={16} className="text-gray-400" />
                    <span className="italic text-sm">ID: {user.id}</span>
                 </div>
              </div>

              {user.role === 'PROVIDER' && (
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-3">
                     <h3 className="text-sm font-bold text-gray-500 uppercase border-b pb-1">Métier</h3>
                     <div className="flex items-center gap-2 text-gray-700">
                        <Briefcase size={16} className="text-gray-400" />
                        <span className="font-bold">{user.jobTitle}</span>
                     </div>
                     <div className="text-sm text-gray-600 ml-6">
                        {user.subCategory} &bull; {user.specialization}
                     </div>
                     <div className="flex items-center gap-2 text-gray-700 ml-6">
                        <Star size={14} className="text-yellow-500 fill-current" />
                        <span>{user.rating} ({user.reviewCount} avis)</span>
                     </div>
                  </div>
              )}

              {/* Admin Notes / Feedback Section */}
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <MessageSquare size={18} /> Notes Internes (Admin)
                  </h3>
                  
                  {user.adminNotes && user.adminNotes.length > 0 ? (
                    <div className="space-y-4">
                        {user.adminNotes.map(note => (
                          <div key={note.id} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                              <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                                    note.type === 'WARNING' ? 'bg-red-100 text-red-700' : 
                                    note.type === 'COMPLAINT' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {note.type}
                                </span>
                                <span className="text-xs text-gray-400">{note.date}</span>
                              </div>
                              <p className="text-sm text-gray-800 font-medium mt-1">{note.content}</p>
                              <div className="mt-2 text-xs text-gray-500">Par: {note.author}</div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-blue-400 text-sm">Aucune note interne.</div>
                  )}
              </div>
           </div>

           {/* RIGHT COLUMN: REVIEWS & FEEDBACK */}
           <div className="space-y-6">
               {/* Client Reviews (If Provider) */}
               {user.role === 'PROVIDER' && (
                   <div className="bg-white rounded-xl p-5 border border-gray-200 h-full max-h-[400px] overflow-y-auto">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 sticky top-0 bg-white pb-2 border-b">
                            <Star size={18} className="text-yellow-500 fill-current"/> Avis Clients ({clientReviews.length})
                        </h3>
                        {clientReviews.length > 0 ? (
                            <div className="space-y-3">
                                {clientReviews.map(review => (
                                    <div key={review.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={10} className={i < review.rating ? "fill-current" : "text-gray-300"} />
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-800 italic">"{review.comment}"</p>
                                        <p className="text-xs text-gray-500 mt-1 text-right">- {review.clientName}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-400">Aucun avis client reçu.</div>
                        )}
                   </div>
               )}

               {/* Messages sent by Provider */}
               {user.role === 'PROVIDER' && (
                   <div className="bg-white rounded-xl p-5 border border-gray-200 max-h-[300px] overflow-y-auto">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 sticky top-0 bg-white pb-2 border-b">
                            <MessageCircle size={18}/> Ses messages à APNET
                        </h3>
                        {proFeedbacks.length > 0 ? (
                            <div className="space-y-3">
                                {proFeedbacks.map(fb => (
                                    <div key={fb.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-1.5 rounded">{fb.category}</span>
                                            <span className="text-xs text-gray-400">{new Date(fb.date).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-700">{fb.message}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-400">Aucun message envoyé.</div>
                        )}
                   </div>
               )}
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
           <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100">
             Fermer
           </button>
           <button className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 flex items-center gap-2">
             <ShieldAlert size={16} /> Bloquer le compte
           </button>
        </div>
      </div>
    </div>
  );
};
