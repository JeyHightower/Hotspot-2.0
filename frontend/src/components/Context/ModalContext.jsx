// ModalContext.js
import { createContext, useRef, useState } from 'react';

export const ModalContext = createContext();
const ModalProvider = ({ children }) => {
  const modalRef = useRef();
  const [modalContent, setModalContent] = useState(null);
  const [onModalClose, setOnModalClose] = useState(null);

  const closeModal = () => {
    setModalContent(null);
    if (typeof onModalClose === 'function') {
      setOnModalClose(null);
      onModalClose();
    }
  };

  const contextValue = {
    modalRef,
    modalContent,
    setModalContent,
    setOnModalClose,
    closeModal,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      <div ref={modalRef} />
    </ModalContext.Provider>
  );
};

export default ModalProvider;
