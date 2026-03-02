import './ConfirmDialog.css';

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-message">{message}</div>
        <div className="confirm-actions">
          <button className="btn-confirm-cancel" onClick={onCancel}>
            Không
          </button>
          <button className="btn-confirm-ok" onClick={onConfirm}>
            Có
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
