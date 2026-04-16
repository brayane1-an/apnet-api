import React, { useEffect, useState } from 'react';
import { RealEstateListing } from '../types';
import { Home, CheckCircle, XCircle, Trash2, MapPin, Bed } from 'lucide-react';

interface RealEstateAdminPanelProps {
  controller: any;
}

export default function RealEstateAdminPanel({ controller }: RealEstateAdminPanelProps) {
  const [properties, setProperties] = useState<RealEstateListing[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await controller.getAllProperties();
      setProperties(data);
    } catch (error) {
      console.error("Erreur chargement immobilier", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (action: 'approve' | 'reject' | 'delete', id: string) => {
    if (!confirm("Confirmer cette action ?")) return;
    
    let success = false;
    if (action === 'approve') success = await controller.approveProperty(id);
    if (action === 'reject') success = await controller.rejectProperty(id);
    if (action === 'delete') success = await controller.deleteProperty(id);

    if (success) loadData();
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement du parc immobilier...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 bg-orange-50 border-b border-orange-100 flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2 text-orange-900">
          <Home size={18}/> Gestion Immobilière ({properties.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Titre</th>
              <th className="px-6 py-3 font-medium">Prix</th>
              <th className="px-6 py-3 font-medium">Localisation</th>
              <th className="px-6 py-3 font-medium">Statut</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {properties.map((prop) => (
              <tr key={prop.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                   <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${prop.type === 'Chambre à louer' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                      {prop.type === 'Chambre à louer' ? <><Bed size={10} className="inline mr-1"/> Chambre</> : prop.type}
                   </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{prop.title}</td>
                <td className="px-6 py-4 text-brand-orange font-bold">
                  {prop.price.toLocaleString()} F
                </td>
                <td className="px-6 py-4 text-gray-600 flex items-center gap-1">
                  <MapPin size={12}/> {prop.location.commune}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    prop.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    prop.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {prop.status || 'PENDING'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                  <button 
                    onClick={() => handleAction('approve', prop.id)}
                    title="Valider"
                    className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100"
                  >
                    <CheckCircle size={16} />
                  </button>
                  <button 
                    onClick={() => handleAction('reject', prop.id)}
                    title="Refuser"
                    className="p-1.5 bg-orange-50 text-orange-600 rounded hover:bg-orange-100"
                  >
                    <XCircle size={16} />
                  </button>
                  <button 
                    onClick={() => handleAction('delete', prop.id)}
                    title="Supprimer"
                    className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
