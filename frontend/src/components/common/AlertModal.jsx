// 🔔 src/components/common/AlertModal.jsx - VERSION AMÉLIORÉE
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import Button from "./Button";
import "../../styles/AlertModal.css";

const icons = {
  error: (
    <svg className="alert-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="alert-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  warning: (
    <svg className="alert-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
    </svg>
  ),
  info: (
    <svg className="alert-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
    </svg>
  ),
  question: (
    <svg className="alert-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

/**
 * 🔔 AlertModal Component - Modal d'alerte réutilisable
 * 
 * @example
 * // Simple alert
 * <AlertModal
 *   show={true}
 *   type="success"
 *   title="Succès"
 *   message="Opération réussie!"
 *   onClose={handleClose}
 * />
 * 
 * @example
 * // Confirmation dialog
 * <AlertModal
 *   show={true}
 *   type="warning"
 *   title="Confirmation"
 *   message="Êtes-vous sûr de vouloir supprimer?"
 *   showCancel
 *   onConfirm={handleDelete}
 *   onClose={handleClose}
 * />
 */
export default function AlertModal({
  show,
  type = "info",
  title,
  message,
  onClose,
  onConfirm,
  showCancel = false,
  confirmLabel = "OK",
  cancelLabel = "Annuler",
  closeOnBackdrop = true,
}) {
  if (!show) return null;

  const typeClasses = {
    error: "alert-error",
    success: "alert-success",
    warning: "alert-warning",
    info: "alert-info",
    question: "alert-question",
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="alert-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className={`alert-modal ${typeClasses[type]}`}
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className={`alert-icon alert-icon-${type}`}>
              {icons[type]}
            </div>

            {/* Title */}
            <h2 className="alert-title">{title}</h2>

            {/* Message */}
            <p className="alert-message">{message}</p>

            {/* Actions */}
            <div className={`alert-actions ${showCancel ? 'alert-actions-double' : ''}`}>
              {showCancel && (
                <Button
                  label={cancelLabel}
                  variant="secondary"
                  onClick={onClose}
                  fullWidth={false}
                />
              )}
              <Button
                label={confirmLabel}
                variant={type === 'danger' || type === 'error' ? 'danger' : 'primary'}
                onClick={handleConfirm}
                fullWidth={!showCancel}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

AlertModal.propTypes = {
  show: PropTypes.bool.isRequired,
  type: PropTypes.oneOf(['error', 'success', 'warning', 'info', 'question']),
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  showCancel: PropTypes.bool,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  closeOnBackdrop: PropTypes.bool,
};