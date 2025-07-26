import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import Button from './Button';

/**
 * Modal Component
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer,
  className,
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };
  
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };
  
  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={clsx('modal-content', sizeClasses[size], className)}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && <h2 className="modal-title">{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="modal-close"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        )}
        
        {/* Body */}
        <div className="modal-body">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Confirmation Modal
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
}) => {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            fullWidth
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            loading={loading}
            fullWidth
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className="text-gray-600">{message}</p>
    </Modal>
  );
};

export default Modal;
