
import React, { useState, useEffect } from 'react';
import { RealEstateListing, PropertyType, Location, ViewState, PropertyReview, UserProfile, UserRole, UserStatus } from '../types';
import { MOCK_REAL_ESTATE_LISTINGS, ABIDJAN_COMMUNES, NEARBY_LOCATIONS, RENTAL_VISIT_FEE, ROOM_VISIT_FEE, TENANT_ENGAGEMENT_TEXT } from '../constants';
import { MapPin, Search, BedDouble, Bath, Wifi, Waves, Home, Star, PlusCircle, ArrowLeft, Check, AlertCircle, Camera, MessageCircle, Filter, EyeOff, Lock, Unlock, Calendar, Clock, User, Bed, CameraOff, X } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { RoomCard } from './RoomCard'; // IMPORT DU NOUVEAU COMPOSANT
import { PropertyCamera } from './PropertyCamera';

interface RealEstateModuleProps {
  setView: (v: ViewState) => void;
  currentUser?: UserProfile | null;
  onPaymentRequest?: (amount: number, listing: RealEstateListing, bookingDetails?: any) => void;
}

// --- SUB-COMPONENTS ---

const PropertyCard: React.FC<{ 
    listing: RealEstateListing; 
    onContact: (l: RealEstateListing) => void; 
    isAdminView?: boolean;
    isUnlocked?: boolean;
    isResidence?: boolean;
}> = ({ listing, onContact, isAdminView, isUnlocked, isResidence }) => {
  const isAvailable = !listing.availability.includes('Indisponible');

  return (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border overflow-hidden flex flex-col h-full group ${!isAvailable ? 'border-red-200 opacity-80' : 'border-gray-200'}`}>
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <img 
          src={listing.photos[0] || 'https://via.placeholder.com/400x300'} 
          alt={listing.title} 
          className={`w-full h-full object-cover transition-transform duration-500 ${isAvailable ? 'group-hover:scale-105' : 'grayscale'}`}
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-800 uppercase tracking-wide">
          {listing.type}
        </div>
        
        {/* Admin Badge for Unavailable items */}
        {!isAvailable && isAdminView && (
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
              <EyeOff size={14} /> INDISPONIBLE
           </div>
        )}

        {listing.rating > 0 && (
          <div className="absolute bottom-3 right-3 bg-white px-2 py-1 rounded-full flex items-center gap-1 text-xs font-bold shadow-sm">
             <Star size={12} className="text-yellow-500 fill-current" />
             {listing.rating} ({listing.reviews.length})
          </div>
        )}
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-900 leading-tight">{listing.title}</h3>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin size={14} className="mr-1 flex-shrink-0" />
          <span className="truncate">{listing.location.city}, {listing.location.commune ? `${listing.location.commune} - ` : ''}{listing.location.quartier}</span>
        </div>

        <div className="flex gap-4 mb-4 text-xs text-gray-600">
           <div className="flex items-center gap-1">
              <BedDouble size={14} /> {listing.features.rooms} Ch.
           </div>
           <div className="flex items-center gap-1">
              <Bath size={14} /> {listing.features.bathrooms} Sdb.
           </div>
           {listing.features.wifi && <div title="Wifi inclus"><Wifi size={14} /></div>}
           {listing.features.pool && <div title="Piscine"><Waves size={14} /></div>}
        </div>

        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow italic">
          "{listing.description}"
        </p>

        {isUnlocked && (
             <div className="mb-4 bg-green-50 p-2 rounded text-xs text-green-700 flex items-center gap-1">
                <Check size={12} /> Contact Propriétaire Débloqué
             </div>
        )}

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
           <div className="font-bold text-brand-orange text-lg">
             {listing.price.toLocaleString()} <span className="text-xs text-gray-400 font-normal">{listing.currency}</span>
           </div>
           
           <button 
             onClick={() => onContact(listing)}
             disabled={!isAvailable}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${isAvailable ? (isResidence ? 'bg-brand-orange text-white hover:bg-orange-600' : (isUnlocked ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-800')) : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
           >
             {!isAvailable ? 'Indisponible' : 
                isResidence ? (
                    <>Réserver</>
                ) : (
                    isUnlocked ? <>Voir Contact</> : <><Lock size={12} /> Débloquer ({RENTAL_VISIT_FEE} F)</>
                )
             }
           </button>
        </div>
      </div>
    </div>
  );
};

const PropertyForm: React.FC<{ onCancel: () => void; onSubmit: (listing: RealEstateListing) => void }> = ({ onCancel, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<PropertyType>(PropertyType.RENT);
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('Abidjan');
  const [commune, setCommune] = useState('');
  const [quartier, setQuartier] = useState('');
  const [rooms, setRooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [isFurnished, setIsFurnished] = useState(false);
  const [hasPool, setHasPool] = useState(false);
  const [hasWifi, setHasWifi] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if(!title || !price || !quartier) {
        alert("Veuillez remplir les champs obligatoires");
        return;
    }

    const newListing: RealEstateListing = {
      id: `prop_new_${Date.now()}`,
      ownerId: 'user_current', // In a real app, this comes from auth context
      type: type,
      title: title,
      description: description || "Aucune description",
      price: parseInt(price),
      currency: type === PropertyType.RESIDENCE || type === PropertyType.VILLA_WEEKEND ? 'FCFA / jour' : 'FCFA / mois',
      location: {
        city: city,
        commune: city === 'Abidjan' ? commune : undefined,
        quartier: quartier
      },
      features: {
        rooms: rooms,
        bathrooms: bathrooms,
        furnished: isFurnished,
        pool: hasPool,
        wifi: hasWifi,
        surface: 0
      },
      photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&w=800&q=80'], 
      availability: ['Disponible'],
      reviews: [],
      rating: 0,
      status: 'PENDING',
      isActive: false
    };
    
    onSubmit(newListing);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
           <PlusCircle className="text-brand-orange" /> Publier une annonce
        </h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
           <ArrowLeft size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Type & Title */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de bien</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value as PropertyType)}
                className="w-full p-3 border rounded-lg"
              >
                {Object.values(PropertyType).map(t => <option key={t as string} value={t}>{t}</option>)}
              </select>
           </div>
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'annonce</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Ex: Villa 4 pièces avec Piscine"
                className="w-full p-3 border rounded-lg"
                required
              />
           </div>
        </div>

        {/* Price & Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
              <input 
                type="number" 
                value={price} 
                onChange={e => setPrice(e.target.value)} 
                className="w-full p-3 border rounded-lg"
                placeholder="Ex: 150000"
                required
              />
           </div>
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <select 
                value={city} 
                onChange={e => setCity(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                 <option value="Abidjan">Abidjan</option>
                 <option value="Bouaké">Bouaké</option>
                 <option value="Assinie">Assinie</option>
              </select>
           </div>
           {city === 'Abidjan' ? (
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commune</label>
                  <select 
                    value={commune} 
                    onChange={e => setCommune(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                  >
                     <option value="">Choisir...</option>
                     {ABIDJAN_COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
           ) : (
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
                  <input 
                    type="text" 
                    value={quartier} 
                    onChange={e => setQuartier(e.target.value)} 
                    className="w-full p-3 border rounded-lg"
                    placeholder="Quartier..."
                  />
               </div>
           )}
        </div>
        
        {city === 'Abidjan' && (
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quartier Précis</label>
              <input 
                type="text" 
                value={quartier} 
                onChange={e => setQuartier(e.target.value)} 
                className="w-full p-3 border rounded-lg"
                placeholder="Ex: Angré 8ème Tranche"
                required
              />
           </div>
        )}

        {/* Features */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
           <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Home size={18}/> Caractéristiques</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Pièces</label>
                 <input type="number" min="1" value={rooms} onChange={e => setRooms(parseInt(e.target.value))} className="w-full p-2 border rounded" />
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Salles de bain</label>
                 <input type="number" min="1" value={bathrooms} onChange={e => setBathrooms(parseInt(e.target.value))} className="w-full p-2 border rounded" />
              </div>
           </div>
           <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded border border-gray-200 hover:border-brand-orange">
                 <input type="checkbox" checked={isFurnished} onChange={e => setIsFurnished(e.target.checked)} />
                 <span className="text-sm">Meublé</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded border border-gray-200 hover:border-brand-orange">
                 <input type="checkbox" checked={hasPool} onChange={e => setHasPool(e.target.checked)} />
                 <span className="text-sm">Piscine</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded border border-gray-200 hover:border-brand-orange">
                 <input type="checkbox" checked={hasWifi} onChange={e => setHasWifi(e.target.checked)} />
                 <span className="text-sm">Wifi</span>
              </label>
           </div>
        </div>

        {/* Description */}
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Description détaillée</label>
           <textarea 
             rows={4} 
             value={description} 
             onChange={e => setDescription(e.target.value)} 
             className="w-full p-3 border rounded-lg"
             placeholder="Décrivez les atouts de votre bien..."
           ></textarea>
        </div>

        {/* Photo Upload & Camera */}
        <div className="space-y-4">
           <label className="block text-sm font-bold text-gray-700">Photos de votre bien</label>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                  <img src={photo} className="w-full h-full object-cover" alt={`Bien ${index}`} />
                  <button 
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              <button 
                type="button"
                onClick={() => setShowCamera(true)}
                className="aspect-square rounded-xl border-2 border-dashed border-brand-orange flex flex-col items-center justify-center gap-2 bg-orange-50/50 hover:bg-orange-50 transition text-brand-orange"
              >
                <Camera size={24} />
                <span className="text-[10px] font-black uppercase tracking-tighter">Prendre Photo</span>
              </button>
           </div>
        </div>

        {showCamera && (
           <PropertyCamera 
              onCapture={(url) => setPhotos([...photos, url])}
              onClose={() => setShowCamera(false)}
           />
        )}

        <div className="flex gap-4 pt-4">
           <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition">
              Annuler
           </button>
           <button type="submit" className="flex-1 bg-brand-orange text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition">
              Publier l'annonce
           </button>
        </div>

      </form>
    </div>
  );
};

const TenantEngagementModal: React.FC<{ listing: RealEstateListing, onClose: () => void }> = ({ listing, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <MessageCircle className="text-brand-orange"/> Engagement Locataire
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {TENANT_ENGAGEMENT_TEXT}
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="font-bold text-blue-900 mb-2">Informations Propriétaire Débloquées</h4>
                        <p className="text-sm text-blue-800">Nom : Propriétaire {listing.ownerId}</p>
                        <p className="text-sm text-blue-800">Tel : 07 07 00 00 00</p>
                        <p className="text-sm text-blue-800">Localisation Exacte : {listing.location.city}, {listing.location.commune}, {listing.location.quartier} (Rue 12, Porte 4)</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button onClick={onClose} className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700">
                            J'accepte et je note les infos
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BookingModal: React.FC<{ listing: RealEstateListing, onClose: () => void, onConfirm: (details: any) => void }> = ({ listing, onClose, onConfirm }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = () => {
        if(!date || !time || !name) {
            alert("Veuillez remplir tous les champs.");
            return;
        }
        onConfirm({ date, time, name });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">Réservation : {listing.title}</h2>
                    <button onClick={onClose}><ArrowLeft size={20}/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Votre Nom Complet</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input type="text" className="w-full pl-10 p-2 border rounded" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Jean Kouassi" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Date d'arrivée</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input type="date" className="w-full pl-10 p-2 border rounded" value={date} onChange={e => setDate(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Heure</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input type="time" className="w-full pl-10 p-2 border rounded" value={time} onChange={e => setTime(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg text-sm text-orange-800">
                        <p className="font-bold mb-1">Total à payer : {listing.price.toLocaleString()} FCFA</p>
                        <p className="text-xs">Le paiement sécurise votre réservation instantanément. Des points de fidélité vous seront attribués.</p>
                    </div>

                    <button onClick={handleSubmit} className="w-full bg-brand-orange text-white font-bold py-3 rounded-lg hover:bg-orange-600">
                        Payer et Réserver
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN MODULE ---

export const RealEstateModule: React.FC<RealEstateModuleProps> = ({ setView, currentUser, onPaymentRequest }) => {
  const [mode, setMode] = useState<'LIST' | 'ADD'>('LIST');
  const [listings, setListings] = useState<RealEstateListing[]>(MOCK_REAL_ESTATE_LISTINGS);
  const [activeTab, setActiveTab] = useState<'HOUSES' | 'ROOMS'>('HOUSES');

  // Modals
  const [selectedListing, setSelectedListing] = useState<RealEstateListing | null>(null);
  const [showEngagement, setShowEngagement] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  // Search State
  const [searchCity, setSearchCity] = useState<string>('Abidjan');
  const [searchCommune, setSearchCommune] = useState<string>('');
  const [searchQuartier, setSearchQuartier] = useState<string>('');
  
  // Advanced Filters
  const [filterType, setFilterType] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Fallback Logic State
  const [showFallbackAlert, setShowFallbackAlert] = useState<boolean>(false);
  const [nearbySuggestions, setNearbySuggestions] = useState<string[]>([]);

  // Check User Role
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  // Filter Logic
  const houseListings = listings.filter(l => l.type !== PropertyType.ROOM);
  const roomListings = listings.filter(l => l.type === PropertyType.ROOM);
  const baseListings = activeTab === 'HOUSES' ? houseListings : roomListings;

  const filteredListings = baseListings.filter(l => {
       // Role-based Visibility (Admin sees all, Users see only available and approved)
       if (!isAdmin && l.availability.includes('Indisponible')) return false;
       if (!isAdmin && (l.status !== 'APPROVED' || l.isActive === false)) return false;

       // Type Filter
       if (filterType && l.type !== filterType) return false;
       
       // Price Filter
       if (maxPrice && l.price > parseInt(maxPrice)) return false;

       // Location Filter
       // City is mandatory
       if (l.location.city !== searchCity) return false;
       
       // Commune (if Abidjan)
       if (searchCity === 'Abidjan' && searchCommune && l.location.commune !== searchCommune) return false;

       // Quartier (Exact or Partial Match)
       if (searchQuartier) {
           const listingQuartier = l.location.quartier.toLowerCase();
           const searchQ = searchQuartier.toLowerCase();
           
           // If we are in fallback mode (showing suggestions), we check if the listing is in the suggestion list
           if (showFallbackAlert && nearbySuggestions.length > 0) {
              return nearbySuggestions.some(n => listingQuartier.includes(n.toLowerCase()));
           }
           
           // Standard search
           return listingQuartier.includes(searchQ);
       }

       return true;
  });

  // Smart Search Effect
  useEffect(() => {
     if (!searchQuartier) {
         setShowFallbackAlert(false);
         setNearbySuggestions([]);
         return;
     }

     // First pass: check if we have results for the specific quartier in the current active tab
     const exactMatches = baseListings.filter(l => {
         if (!isAdmin && l.availability.includes('Indisponible')) return false;
         if (l.location.city !== searchCity) return false;
         if (searchCity === 'Abidjan' && searchCommune && l.location.commune !== searchCommune) return false;
         return l.location.quartier.toLowerCase().includes(searchQuartier.toLowerCase());
     });

     if (exactMatches.length === 0) {
        // No results found -> Check for nearby recommendations
        const userQuartierKey = Object.keys(NEARBY_LOCATIONS).find(k => k.toLowerCase() === searchQuartier.toLowerCase());
        
        if (userQuartierKey) {
            const suggestions = NEARBY_LOCATIONS[userQuartierKey];
            setNearbySuggestions(suggestions);
            setShowFallbackAlert(true);
        } else {
            setShowFallbackAlert(false);
            setNearbySuggestions([]);
        }
     } else {
        setShowFallbackAlert(false);
        setNearbySuggestions([]);
     }

  }, [searchCity, searchCommune, searchQuartier, listings, activeTab, isAdmin]);

  const handleListingAction = (listing: RealEstateListing, overridePrice?: number) => {
    if (!currentUser) {
        setView(ViewState.REGISTER);
        return;
    }

    const isResidence = listing.type === PropertyType.RESIDENCE || listing.type === PropertyType.VILLA_WEEKEND;
    const isUnlocked = currentUser.unlockedRealEstateIds?.includes(listing.id);

    if (isResidence) {
        // RESIDENCE FLOW -> Booking Form
        setSelectedListing(listing);
        setShowBooking(true);
    } else {
        // RENTAL FLOW -> Unlock or Show
        if (isUnlocked) {
            // Already paid, show engagement modal which contains info
            setSelectedListing(listing);
            setShowEngagement(true);
        } else {
            // Need to pay
            if(onPaymentRequest) {
                // Pour les chambres, overridePrice vient de RoomCard (2000), sinon RENTAL_VISIT_FEE (3000)
                onPaymentRequest(overridePrice || RENTAL_VISIT_FEE, listing);
            } else {
                alert("Erreur de configuration paiement.");
            }
        }
    }
  };

  const handleAddListing = (newListing: RealEstateListing) => {
     setListings([newListing, ...listings]);
     setMode('LIST');
     alert("Votre annonce a été soumise avec succès ! Elle sera visible sur la plateforme dès qu'elle aura été validée par un administrateur.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
       {/* Hero / Header specific to Real Estate */}
       <div className="bg-gray-900 text-white py-12 px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center"></div>
          <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
             <div>
                <h1 className="text-3xl md:text-4xl font-extrabold mb-2 flex items-center gap-3">
                   <Home className="text-brand-orange" /> Maisons & Résidences
                </h1>
                <p className="text-gray-400">Louez, Vendez ou Réservez votre séjour en toute confiance.</p>
                {isAdmin && <span className="bg-red-600 text-white text-xs px-2 py-1 rounded ml-2">Vue Administrateur (Tout visible)</span>}
             </div>
             {mode === 'LIST' && (
                <button 
                  onClick={() => {
                    if (!currentUser) {
                        setView(ViewState.REGISTER);
                        return;
                    }
                    if (currentUser.status !== UserStatus.VERIFIE) {
                        alert("Votre profil est en attente de vérification. Vous pourrez publier dès que vos documents KYC seront validés par l'administrateur.");
                        return;
                    }
                    setMode('ADD');
                  }}
                  className="bg-brand-orange text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-orange-600 transition flex items-center gap-2"
                >
                  <PlusCircle size={20} />
                  Publier un bien
                </button>
             )}
          </div>
       </div>

       <div className="max-w-7xl mx-auto px-4 py-8">
          {mode === 'LIST' ? (
             <>
                {/* TABS DE NAVIGATION */}
                <div className="flex justify-center mb-8">
                   <div className="bg-white p-1 rounded-full shadow-sm border border-gray-200 inline-flex">
                      <button 
                          onClick={() => setActiveTab('HOUSES')}
                          className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'HOUSES' ? 'bg-gray-900 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                          <Home size={16} /> Maisons & Villas
                      </button>
                      <button 
                          onClick={() => setActiveTab('ROOMS')}
                          className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'ROOMS' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                          <Bed size={16} /> Chambres (Étudiants)
                      </button>
                   </div>
                </div>

                {/* Search & Filters Container */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 mb-8 space-y-4">
                   {/* ... (Search UI kept same as previous) ... */}
                   <div className="flex items-center gap-2 text-gray-800 font-bold mb-2">
                      <Search size={20} className="text-brand-orange"/> Recherche
                   </div>
                   
                   {/* Row 1: Location Granular Search */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                         <label className="block text-xs font-bold text-gray-500 mb-1">Ville</label>
                         <select 
                           className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition"
                           value={searchCity}
                           onChange={e => { setSearchCity(e.target.value); setSearchCommune(''); setSearchQuartier(''); }}
                         >
                            <option value="Abidjan">Abidjan</option>
                            <option value="Bouaké">Bouaké</option>
                            <option value="Assinie">Assinie</option>
                            <option value="Grand-Bassam">Grand-Bassam</option>
                         </select>
                      </div>

                      {searchCity === 'Abidjan' && (
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Commune</label>
                            <select 
                              className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition"
                              value={searchCommune}
                              onChange={e => { setSearchCommune(e.target.value); setSearchQuartier(''); }}
                            >
                                <option value="">Toutes les communes</option>
                                {ABIDJAN_COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                      )}

                      <div className={searchCity !== 'Abidjan' ? "md:col-span-2" : ""}>
                         <label className="block text-xs font-bold text-gray-500 mb-1">Quartier</label>
                         <input 
                           type="text" 
                           placeholder="Entrez le nom du quartier..." 
                           className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition"
                           value={searchQuartier}
                           onChange={e => setSearchQuartier(e.target.value)}
                         />
                      </div>
                   </div>

                   {/* Row 2: Advanced Filters */}
                   <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                       <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                          <Filter size={16} /> Filtres
                       </div>
                       <select className="p-2 border rounded-lg bg-gray-50 flex-1 w-full text-sm" value={filterType} onChange={e => setFilterType(e.target.value)}>
                          <option value="">Tous les types</option>
                          {Object.values(PropertyType).map(t => <option key={t as string} value={t}>{t}</option>)}
                       </select>
                       <input 
                         type="number" 
                         placeholder="Budget Max (FCFA)" 
                         className="p-2 border rounded-lg bg-gray-50 w-full md:w-40 text-sm"
                         value={maxPrice}
                         onChange={e => setMaxPrice(e.target.value)}
                       />
                       <button 
                         onClick={() => { setSearchCity('Abidjan'); setSearchCommune(''); setSearchQuartier(''); setFilterType(''); setMaxPrice(''); }} 
                         className="text-sm text-gray-500 underline hover:text-brand-orange"
                       >
                         Réinitialiser
                       </button>
                   </div>
                </div>

                {/* Fallback Alert Message */}
                {showFallbackAlert && (
                   <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-8 rounded-r-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                         <p className="font-bold text-orange-900">Aucune disponibilité exacte à "{searchQuartier}".</p>
                         <p className="text-sm text-orange-800">
                            Nous vous proposons des biens disponibles dans les quartiers voisins : 
                            <span className="font-semibold"> {nearbySuggestions.join(', ')}</span>.
                         </p>
                      </div>
                   </div>
                )}

                {/* Listings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {filteredListings.map(listing => (
                      <React.Fragment key={listing.id}>
                          {listing.type === PropertyType.ROOM ? (
                              <RoomCard 
                                  room={listing}
                                  onUnlock={handleListingAction}
                                  isUnlocked={currentUser?.unlockedRealEstateIds?.includes(listing.id) || false}
                              />
                          ) : (
                              <PropertyCard 
                                key={listing.id} 
                                listing={listing} 
                                isAdminView={isAdmin}
                                isUnlocked={currentUser?.unlockedRealEstateIds?.includes(listing.id)}
                                isResidence={listing.type === PropertyType.RESIDENCE || listing.type === PropertyType.VILLA_WEEKEND}
                                onContact={handleListingAction} 
                              />
                          )}
                      </React.Fragment>
                   ))}
                   {filteredListings.length === 0 && !showFallbackAlert && (
                      <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                         <Search className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                         <p className="text-gray-500 font-medium">Aucun bien ne correspond à vos critères.</p>
                         <p className="text-sm text-gray-400">Essayez d'élargir votre recherche.</p>
                      </div>
                   )}
                </div>
             </>
          ) : (
             <PropertyForm onCancel={() => setMode('LIST')} onSubmit={handleAddListing} />
          )}

          {/* Engagement Modal (For Rentals) */}
          {showEngagement && selectedListing && (
              <TenantEngagementModal 
                 listing={selectedListing} 
                 onClose={() => { setShowEngagement(false); setSelectedListing(null); }} 
              />
          )}

          {/* Booking Modal (For Residences) */}
          {showBooking && selectedListing && (
              <BookingModal 
                 listing={selectedListing}
                 onClose={() => { setShowBooking(false); setSelectedListing(null); }}
                 onConfirm={(details) => {
                     // Pass details to parent for payment
                     if(onPaymentRequest) {
                         onPaymentRequest(selectedListing.price, selectedListing, details);
                     }
                     setShowBooking(false);
                 }}
              />
          )}
       </div>
    </div>
  );
};
