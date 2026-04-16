
import React, { useState, useEffect } from 'react';
import { InternshipRequest, InternshipType, InternshipStatus, UserProfile, ViewState, InternshipOffer } from '../types';
import { ABIDJAN_COMMUNES, NEARBY_LOCATIONS, INTERNSHIP_SERVICE_FEE } from '../constants';
import { GraduationCap, MapPin, Upload, Send, CheckCircle, AlertCircle, Briefcase, Clock, DollarSign, FileText, Calendar, Mail, Building2 } from 'lucide-react';

interface InternshipModuleProps {
  currentUser?: UserProfile | null;
  onSubmitRequest: (request: Omit<InternshipRequest, 'id' | 'dateSubmitted' | 'status'>) => void;
  userRequests: InternshipRequest[];
  onPayFee: (requestId: string) => void;
  setView: (view: any) => void;
  offers: InternshipOffer[];
}

export const InternshipModule: React.FC<InternshipModuleProps> = ({ currentUser, onSubmitRequest, userRequests, onPayFee, setView, offers }) => {
  const [activeTab, setActiveTab] = useState<'FORM' | 'MY_REQUESTS' | 'OFFERS'>('FORM');
  
  // Form State
  const [fullName, setFullName] = useState(currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '');
  const [email, setEmail] = useState('');
  const [field, setField] = useState('');
  const [type, setType] = useState<InternshipType>(InternshipType.VALIDATION);
  const [city, setCity] = useState('Abidjan');
  const [commune, setCommune] = useState('');
  const [quartier, setQuartier] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [cvFile, setCvFile] = useState<File | null>(null);
  
  // Validation State
  const [emailError, setEmailError] = useState('');
  const [showLocationSuggestion, setShowLocationSuggestion] = useState(false);
  const [suggestedLocations, setSuggestedLocations] = useState<string[]>([]);

  // Smart Location Logic
  useEffect(() => {
      if (quartier) {
          // Check for nearby locations based on entered quartier (case insensitive)
          const userQuartierKey = Object.keys(NEARBY_LOCATIONS).find(k => k.toLowerCase() === quartier.toLowerCase());
          
          // Simulate logic: If the quartier exists in our map, we suggest its neighbors as alternatives
          if (userQuartierKey) {
              setSuggestedLocations(NEARBY_LOCATIONS[userQuartierKey]);
              setShowLocationSuggestion(true);
          } else {
              setShowLocationSuggestion(false);
          }
      } else {
          setShowLocationSuggestion(false);
      }
  }, [quartier]);

  const validateEmail = (email: string) => {
      // Strict Gmail Regex
      const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (!gmailRegex.test(email)) {
          setEmailError("L'adresse email doit être une adresse @gmail.com valide.");
          return false;
      }
      setEmailError('');
      return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Check all mandatory fields
    if (!fullName || !field || !phone || !quartier || !email) {
      alert("Veuillez remplir tous les champs obligatoires (Nom, Filière, Téléphone, Quartier, Email).");
      return;
    }

    // 2. Validate City/Commune logic
    if (city === 'Abidjan' && !commune) {
        alert("Veuillez sélectionner une commune pour Abidjan.");
        return;
    }

    // 3. Validate Gmail
    if (!validateEmail(email)) {
        alert("Merci d'utiliser une adresse Gmail valide pour faciliter les partages de documents.");
        return;
    }

    // 4. Validate CV
    if (!cvFile) {
        alert("Le CV est obligatoire. Veuillez télécharger votre fichier (PDF/Word).");
        return;
    }

    // Create a blob URL for the CV to simulate upload and allow viewing in current session
    // This resolves the "Link Empty" issue for new uploads
    const cvUrl = URL.createObjectURL(cvFile);

    const newRequest = {
      studentId: currentUser?.id,
      fullName,
      email,
      field,
      type,
      location: {
        city,
        commune: city === 'Abidjan' ? commune : undefined,
        quartier,
      },
      phone,
      cvUrl
    };

    onSubmitRequest(newRequest);
    setActiveTab('MY_REQUESTS');
    
    // Reset form
    setField('');
    setQuartier('');
    setCvFile(null);
    setEmail('');
    if(!currentUser) setFullName('');
    
    alert("Votre candidature a été enregistrée avec succès. APNET contacte les partenaires et vous revient.");
  };

  const renderStatusBadge = (status: InternshipStatus) => {
    switch (status) {
      case InternshipStatus.PENDING:
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><Clock size={12}/> En attente</span>;
      case InternshipStatus.MATCHED:
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={12}/> Stage Trouvé</span>;
      case InternshipStatus.VALIDATED:
        return <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={12}/> Validé & Payé</span>;
      case InternshipStatus.REJECTED:
        return <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><AlertCircle size={12}/> Refusé</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-12 px-4 relative overflow-hidden">
         <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center"></div>
         <div className="max-w-4xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-4 border border-white/20">
               <GraduationCap size={32} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Espace Stage & Jeunes Talents</h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-6">
               APNET connecte les étudiants ivoiriens aux entreprises qui recrutent. Déposez votre CV, nous trouvons votre stage.
            </p>
            <div className="flex justify-center">
               <button 
                  onClick={() => setView(ViewState.RECRUITER_SPACE)}
                  className="bg-white text-blue-900 px-6 py-3 rounded-2xl font-black text-sm shadow-xl hover:bg-blue-50 transition-all flex items-center gap-2"
               >
                  <Building2 size={18} /> Vous êtes une entreprise ? Recrutez ici
               </button>
            </div>
         </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-20">
         <div className="bg-white rounded-xl shadow-lg p-2 flex">
            <button 
              onClick={() => setActiveTab('FORM')}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition flex items-center justify-center gap-2 ${activeTab === 'FORM' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
               <FileText size={16} /> Déposer une candidature
            </button>
            <button 
              onClick={() => setActiveTab('MY_REQUESTS')}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition flex items-center justify-center gap-2 ${activeTab === 'MY_REQUESTS' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
               <Briefcase size={16} /> Suivre mes demandes ({userRequests.length})
            </button>
            <button 
              onClick={() => setActiveTab('OFFERS')}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition flex items-center justify-center gap-2 ${activeTab === 'OFFERS' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
               <Building2 size={16} /> Consulter les offres ({offers.filter(o => o.status === 'APPROVED').length})
            </button>
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
         {activeTab === 'OFFERS' && (
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Offres de stage disponibles</h3>
                    <p className="text-sm text-gray-500">Postulez directement aux offres qui vous intéressent. Seules les offres validées par APNET sont affichées.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {offers.filter(o => o.status === 'APPROVED').map(offer => (
                        <div key={offer.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded uppercase">{offer.type}</span>
                                <span className="text-[10px] text-gray-400">{new Date(offer.postedAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-1">{offer.title}</h4>
                            <p className="text-brand-orange font-bold text-sm mb-4">{offer.companyName}</p>
                            
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <MapPin size={14} /> {offer.location}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Clock size={14} /> {offer.duration}
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => {
                                    setField(offer.title);
                                    setActiveTab('FORM');
                                }}
                                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
                            >
                                Postuler à cette offre
                            </button>
                        </div>
                    ))}
                </div>
            </div>
         )}

         {activeTab === 'FORM' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
               <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Send className="text-blue-600" /> Formulaire de Candidature
               </h2>
               
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom Complet</label>
                        <input 
                          type="text" 
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          className="w-full p-3 border rounded-lg"
                          placeholder="Ex: Kouassi Jean"
                          required
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone / WhatsApp</label>
                        <input 
                          type="tel" 
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="w-full p-3 border rounded-lg"
                          placeholder="+225..."
                          required
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email (Gmail obligatoire)</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-gray-400" size={16} />
                            <input 
                            type="email" 
                            value={email}
                            onChange={e => { setEmail(e.target.value); validateEmail(e.target.value); }}
                            className={`w-full pl-10 p-3 border rounded-lg ${emailError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
                            placeholder="exemple@gmail.com"
                            required
                            />
                        </div>
                        {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type de Stage</label>
                        <select 
                          value={type}
                          onChange={e => setType(e.target.value as InternshipType)}
                          className="w-full p-3 border rounded-lg"
                        >
                           {Object.values(InternshipType).map(t => <option key={t as string} value={t}>{t}</option>)}
                        </select>
                     </div>
                  </div>

                  <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filière / Domaine d'étude</label>
                        <input 
                          type="text" 
                          value={field}
                          onChange={e => setField(e.target.value)}
                          className="w-full p-3 border rounded-lg"
                          placeholder="Ex: Marketing, RH, Informatique..."
                          required
                        />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                     <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><MapPin size={16} /> Localisation Souhaitée</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-gray-500 mb-1">Ville</label>
                           <select value={city} onChange={e => setCity(e.target.value)} className="w-full p-2 border rounded">
                              <option value="Abidjan">Abidjan</option>
                              <option value="Bouaké">Bouaké</option>
                              <option value="Yamoussoukro">Yamoussoukro</option>
                           </select>
                        </div>
                        {city === 'Abidjan' && (
                           <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Commune</label>
                              <select value={commune} onChange={e => setCommune(e.target.value)} className="w-full p-2 border rounded">
                                 <option value="">Choisir...</option>
                                 {ABIDJAN_COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                           </div>
                        )}
                        <div className={city !== 'Abidjan' ? "md:col-span-2" : ""}>
                           <label className="block text-xs font-bold text-gray-500 mb-1">Quartier</label>
                           <input 
                             type="text" 
                             value={quartier}
                             onChange={e => setQuartier(e.target.value)}
                             className="w-full p-2 border rounded"
                             placeholder="Quartier souhaité"
                             required
                           />
                        </div>
                     </div>
                     
                     {showLocationSuggestion && (
                         <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-2 animate-in fade-in slide-in-from-top-1">
                             <div className="flex items-start gap-2">
                                 <CheckCircle size={14} className="text-blue-600 mt-0.5" />
                                 <div>
                                     <p className="text-xs text-blue-800 font-medium">Info APNET :</p>
                                     <p className="text-xs text-blue-700">
                                         Nous avons aussi de nombreux partenaires dans les quartiers voisins : 
                                         <span className="font-bold"> {suggestedLocations.join(', ')}</span>. 
                                         Votre demande sera diffusée dans toute la zone pour maximiser vos chances.
                                     </p>
                                 </div>
                             </div>
                         </div>
                     )}
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 cursor-pointer transition relative group">
                     <input 
                       type="file" 
                       className="absolute inset-0 opacity-0 cursor-pointer" 
                       accept=".pdf,.doc,.docx"
                       onChange={e => setCvFile(e.target.files?.[0] || null)}
                     />
                     <Upload className="mx-auto text-gray-400 mb-2 group-hover:text-blue-500 transition-colors" size={32} />
                     <p className="font-medium text-gray-700 group-hover:text-blue-600">{cvFile ? cvFile.name : "Cliquez pour télécharger votre CV (PDF)"}</p>
                     <p className="text-xs text-gray-400">Obligatoire (Max 5 Mo)</p>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                     <p className="text-sm text-blue-900 font-medium">
                        <span className="font-bold">Note Importante :</span> L'inscription est gratuite. Les frais de service de <span className="font-bold">{INTERNSHIP_SERVICE_FEE} FCFA</span> ne sont à payer QUE si APNET vous trouve un stage confirmé.
                     </p>
                  </div>

                  <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg">
                     Soumettre ma candidature
                  </button>
               </form>
            </div>
         ) : (
            <div className="space-y-6">
               {userRequests.length === 0 ? (
                  <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-200">
                     <Briefcase className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                     <h3 className="text-lg font-bold text-gray-900">Aucune demande en cours</h3>
                     <p className="text-gray-500 mb-6">Commencez par déposer une candidature pour trouver votre stage.</p>
                     <button onClick={() => setActiveTab('FORM')} className="text-blue-600 font-bold hover:underline">
                        Déposer une candidature
                     </button>
                  </div>
               ) : (
                  userRequests.map(request => (
                     <div key={request.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                           <div>
                              <h3 className="text-lg font-bold text-gray-900">{request.type}</h3>
                              <p className="text-gray-600 text-sm">{request.field}</p>
                           </div>
                           {renderStatusBadge(request.status)}
                        </div>
                        <div className="p-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                              <p className="flex items-center gap-2"><MapPin size={14} /> {request.location.city}, {request.location.commune} - {request.location.quartier}</p>
                              <p className="flex items-center gap-2"><Calendar size={14} /> Soumis le {new Date(request.dateSubmitted).toLocaleDateString()}</p>
                           </div>

                           {request.status === InternshipStatus.MATCHED && (
                              <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
                                 <h4 className="font-bold text-green-800 flex items-center gap-2 mb-2">
                                    <CheckCircle size={18} /> Bonne nouvelle ! Un stage a été trouvé.
                                 </h4>
                                 <p className="text-sm text-green-700 mb-3">
                                    Une entreprise correspondant à votre profil ({request.matchedCompany || 'Partenaire APNET'}) est prête à recevoir votre CV.
                                    Veuillez régler les frais de service pour valider la mise en relation et recevoir la convocation.
                                 </p>
                                 <button 
                                   onClick={() => onPayFee(request.id)}
                                   className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
                                 >
                                    <DollarSign size={16} /> Payer {INTERNSHIP_SERVICE_FEE} F et Valider
                                 </button>
                              </div>
                           )}

                           {request.status === InternshipStatus.VALIDATED && (
                              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                 <p className="text-sm text-blue-800 font-medium">
                                    Félicitations ! Votre dossier a été transmis à l'entreprise. Vous recevrez les détails du rendez-vous par SMS et Email sous 24h.
                                 </p>
                              </div>
                           )}
                        </div>
                     </div>
                  ))
               )}
            </div>
         )}
      </div>
    </div>
  );
};
