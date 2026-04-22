
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, DigitalContract, ContractType } from '../types';
import { X, ShieldCheck, PenTool, CheckCircle, FileText, Calendar, Wallet, ListChecks, Info, AlertTriangle, Download } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

interface DigitalContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  counterPart: UserProfile;
  contractType: ContractType;
  initialAmount?: number;
  onSave: (contract: DigitalContract) => void;
  existingContract?: DigitalContract; // If we are signing an existing one
}

export const DigitalContractModal: React.FC<DigitalContractModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  counterPart,
  contractType,
  initialAmount,
  onSave,
  existingContract
}) => {
  const [step, setStep] = useState<'details' | 'sign' | 'preview'>(existingContract ? 'sign' : 'details');
  const [amount, setAmount] = useState<string>(existingContract ? existingContract.amount.toString() : (initialAmount?.toString() || ''));
  const [duration, setDuration] = useState<string>(existingContract ? existingContract.duration : '1 mois');
  const [tasks, setTasks] = useState<string[]>(existingContract ? existingContract.tasks : ['Nettoyage complet', 'Lavage vitres', 'Entretien sol']);
  const [newTask, setNewTask] = useState('');
  
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isSigned, setIsSigned] = useState(false);

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, newTask.trim()]);
      setNewTask('');
    }
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleClearSignature = () => {
    signatureRef.current?.clear();
    setIsSigned(false);
  };

  const handleComplete = () => {
    const signatureBase64 = signatureRef.current?.getTrimmedCanvas().toDataURL('image/png');
    
    const isClient = currentUser.id !== counterPart.id; // Normally fixed by passing correct props
    
    const contract: DigitalContract = existingContract ? {
        ...existingContract,
        provider_signature: signatureBase64,
        status: 'SIGNED',
        signature_date: new Date().toISOString()
    } : {
        id: `CTR_${Date.now()}`,
        client_id: currentUser.id,
        client_name: `${currentUser.firstName} ${currentUser.lastName}`,
        prestataire_id: counterPart.id,
        prestataire_name: `${counterPart.firstName} ${counterPart.lastName}`,
        service_title: counterPart.jobTitle || 'Prestation de service',
        amount: parseInt(amount) || 0,
        duration: duration,
        tasks: tasks,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        client_signature: signatureBase64,
        status: 'PENDING_PROVIDER',
        terms_version: '1.0',
        createdAt: new Date().toISOString()
    };

    onSave(contract);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-brand-blue p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck size={24} />
            <div>
              <h2 className="font-bold text-lg uppercase tracking-tight">Engagement de Service Digital</h2>
              <p className="text-[10px] text-blue-200">Tiers de Confiance APNET • Preuve Légale</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <AnimatePresence mode="wait">
            {step === 'details' && (
              <motion.div 
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
                   <Info className="text-brand-blue shrink-0" size={20} />
                   <p className="text-xs text-blue-800 leading-relaxed">
                     Ce contrat définit vos attentes. APNET bloquera le montant sur votre portefeuille et ne le reversera qu'à la fin de la période, après validation.
                   </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-gray-700 uppercase">Durée du Contrat</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-blue outline-none"
                        placeholder="Ex: 1 mois, 15 jours..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-gray-700 uppercase">Montant Total (FCFA)</label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-black focus:ring-2 focus:ring-brand-blue outline-none"
                        placeholder="Ex: 50000"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-black text-gray-700 uppercase flex items-center gap-2">
                    <ListChecks size={16} /> Tâches à accomplir
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTask()}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="Ajouter une tâche..."
                    />
                    <button 
                      onClick={addTask}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold"
                    >
                      Ajouter
                    </button>
                  </div>
                  <div className="space-y-2">
                    {tasks.map((task, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 group">
                        <span className="text-sm text-gray-600">{task}</span>
                        <button onClick={() => removeTask(index)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setStep('sign')}
                  disabled={!amount || !duration || tasks.length === 0}
                  className="w-full bg-brand-blue text-white font-black py-4 rounded-xl shadow-lg hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                >
                  Continuer vers signature
                </button>
              </motion.div>
            )}

            {step === 'sign' && (
              <motion.div 
                key="sign"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="font-bold text-gray-900">Apposez votre Signature Digitale</h3>
                  <p className="text-xs text-gray-500 mt-1">Dessinez votre signature dans le cadre ci-dessous</p>
                </div>

                <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden relative group">
                  <SignatureCanvas 
                    ref={signatureRef}
                    penColor="black"
                    canvasProps={{
                      className: "w-full h-64 cursor-crosshair",
                      style: { width: '100%', height: '250px' }
                    }}
                    onBegin={() => setIsSigned(true)}
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button 
                      onClick={handleClearSignature}
                      className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-gray-200"
                    >
                      Effacer
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-xl flex gap-3">
                   <AlertTriangle className="text-yellow-600 shrink-0" size={18} />
                   <div className="text-[10px] text-yellow-800 leading-tight">
                     <strong>Avertissement Légal :</strong> En signant numériquement, vous certifiez l'exactitude des informations. Cette signature a valeur d'engagement contractuel sur la plateforme APNET.
                   </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setStep('details')}
                    className="flex-1 py-4 border border-gray-300 text-gray-600 font-bold rounded-xl text-sm"
                  >
                    Retour
                  </button>
                  <button 
                    onClick={handleComplete}
                    disabled={!isSigned}
                    className="flex-[2] bg-brand-green text-white font-black py-4 rounded-xl shadow-lg hover:bg-green-700 transition disabled:opacity-50 uppercase tracking-widest text-sm"
                  >
                    Valider le Contrat
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'preview' && (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-gray-200 p-8 rounded-xl shadow-inner font-serif"
              >
                {/* Paper Contract effect */}
                <div className="text-center border-b-2 border-brand-blue pb-4 mb-6">
                  <h1 className="text-xl font-bold uppercase text-gray-900">Engagement de Service</h1>
                  <p className="text-sm font-sans font-bold text-brand-blue">RÉSEAU APNET - TIERS DE CONFIANCE</p>
                </div>

                <div className="space-y-4 text-sm leading-relaxed text-gray-800">
                  <section>
                    <p><strong>ENTRE :</strong> {existingContract?.client_name || `${currentUser.firstName} ${currentUser.lastName}`} (LE CLIENT)</p>
                    <p><strong>ET :</strong> {existingContract?.prestataire_name || `${counterPart.firstName} ${counterPart.lastName}`} (LE PRESTATAIRE)</p>
                  </section>

                  <section className="bg-gray-50 p-4 rounded-lg font-sans">
                    <h4 className="font-bold text-xs uppercase mb-2 border-b border-gray-200 pb-1">OBJET DU CONTRAT</h4>
                    <p><strong>Service :</strong> {existingContract?.service_title || counterPart.jobTitle}</p>
                    <p><strong>Durée :</strong> {duration}</p>
                    <p><strong>Montant Total :</strong> {parseInt(amount).toLocaleString()} FCFA</p>
                  </section>

                  <section className="font-sans">
                    <h4 className="font-bold text-xs uppercase mb-2">MISSIONS À RÉALISER</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      {tasks.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </section>

                  <div className="pt-10 flex justify-between items-end gap-10">
                    <div className="text-center flex-1 border-t border-gray-100 pt-2">
                       <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Signature Client</p>
                       {(existingContract?.client_signature || (step === 'preview' && isSigned)) && (
                         <img src={existingContract?.client_signature} className="max-h-20 mx-auto opacity-80" />
                       )}
                    </div>
                    <div className="text-center flex-1 border-t border-gray-100 pt-2">
                       <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Signature Prestataire</p>
                       {existingContract?.provider_signature && (
                         <img src={existingContract?.provider_signature} className="max-h-20 mx-auto opacity-80" />
                       )}
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-4 border-t border-gray-100 flex justify-center">
                    <button 
                      onClick={onClose}
                      className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2 rounded-full text-xs font-bold"
                    >
                      <Download size={14} /> Télécharger PDF
                    </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
