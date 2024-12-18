import { useContext } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';
import { ModalContext } from './ModalContext';

const Modal = () => {
  const { modalRef, modalContent, closeModal } = useContext(ModalContext);

  if (!modalRef || !modalRef.current || !modalContent) return null;

  return ReactDOM.createPortal(
    <div id="modal">
      <div id="modal-background" onClick={closeModal} />
      <div id="modal-content">
        {modalContent}
      </div>
    </div>,
    modalRef.current,
  );
};

export default Modal;
