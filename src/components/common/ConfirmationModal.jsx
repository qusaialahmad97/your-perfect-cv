// src/components/common/ConfirmationModal.jsx

import React from 'react';

const ConfirmationModal = ({
    isOpen,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel"
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm w-full">
                <p className="text-lg font-semibold text-gray-800 mb-6">{message}</p>
                <div className="flex justify-center space-x-4">
                     <button
                        onClick={onCancel}
                        className="py-2 px-5 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                        aria-label={cancelText}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="py-2 px-5 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                        aria-label={confirmText}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;