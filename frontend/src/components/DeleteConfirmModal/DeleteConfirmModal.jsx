import { useModal } from '../Context/ModalContext';
import './DeleteConfirmModal.css';

const DeleteConfirmModal = ({ onDelete, type }) => {
    const { closeModal } = useModal();

    const handleDelete = async () => {
        await onDelete();
        closeModal();
    };

    return (
        <div className="delete-confirm-modal">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to remove this {type}?</p>
            
            <div className="button-container">
                <button 
                    className="delete-button"
                    onClick={handleDelete}
                >
                    Yes (Delete {type})
                </button>
                <button 
                    className="cancel-button"
                    onClick={closeModal}
                >
                    No (Keep {type})
                </button>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;