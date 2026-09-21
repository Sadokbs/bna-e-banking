import React from 'react';
import { X } from 'lucide-react';
import { CurrencyExchangeWidget } from './CurrencyExchangeWidget';

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CurrencyModal: React.FC<CurrencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-900/90 text-slate-400 hover:text-white rounded-full border border-slate-700 hover:bg-slate-800 transition-all cursor-pointer shadow-lg"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
        <CurrencyExchangeWidget className="border-emerald-500/60 shadow-2xl" />
      </div>
    </div>
  );
};

export default CurrencyModal;
