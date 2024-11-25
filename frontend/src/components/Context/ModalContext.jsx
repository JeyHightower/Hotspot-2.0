// ModalContext.js
import { useRef, createContext, useState, useContext } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
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
        closeModal
    };

    return (
        <ModalContext.Provider value={contextValue}>
            {children}
            <div ref={modalRef} />
        </ModalContext.Provider>
    );
};

export const useModal = () => useContext(ModalContext);