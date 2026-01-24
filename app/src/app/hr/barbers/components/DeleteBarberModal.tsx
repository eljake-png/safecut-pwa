import React from 'react';

interface DeleteBarberModalProps {
  isOpen: boolean;
  barberName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteBarberModal: React.FC<DeleteBarberModalProps> = ({ 
  isOpen, 
  barberName,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl shadow-red-900/10">
        <div className="flex items-center gap-3 text-red-500">
            <div className="bg-red-500/10 p-2 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-xl font-bold">Ви впевнені?</h2>
        </div>
        
        <p className="text-zinc-400">
          Ви збираєтесь звільнити барбера <span className="text-white font-bold">{barberName}</span>. 
          Він втратить доступ до системи, а його профіль буде деактивовано.
        </p>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-zinc-800 text-white px-5 py-3 rounded-xl hover:bg-zinc-700 transition-colors font-medium"
          >
            Скасувати
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-red-600/10 text-red-500 border border-red-600/20 px-5 py-3 rounded-xl hover:bg-red-600 hover:text-white transition-all font-medium active:scale-95"
          >
            Звільнити барбера
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBarberModal;
