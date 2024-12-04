
// Modal.jsx
import ReactDOM from 'react-dom';
import { useModal } from '../Context/ModalContext'; // Adjust the path as necessary
import './Modal.css';

 const Modal = () => {
    const { modalRef, modalContent, closeModal } = useModal();

    if (!modalRef || !modalRef.current || !modalContent) return null;

    return ReactDOM.createPortal(
        <div id="modal">
            <div id="modal-background" onClick={closeModal} />
            <div id="modal-content">{modalContent}</div>
        </div>,
        modalRef.current
    );
};

export default Modal;




// import { useRef, createContext, useState, useContext } from 'react';
// import ReactDOM from 'react-dom';
// import './Modal.css';

// const ModalContext = createContext();
// export const ModalProvider = ({ children }) => {
//     const modalRef = useRef();
//     const [modalContent, setModalContent] = useState(null);
//     const [onModalClose, setOnModalClose] = useState(null);

// const closeModal = () => {
//     setModalContent(null);
//     if(typeof onModalClose === 'function') {
//         setOnModalClose(null);
//         onModalClose();
//     }
// };

//     const contextValue = {
//         modalRef,
//         modalContent,
//         setModalContent,
//         setOnModalClose,
//         closeModal
//     };

//     return (
//         <>
//         <ModalContext.Provider value={contextValue}>
//             {children}
//         </ModalContext.Provider>
//         <div ref={modalRef} />
//         </>
//     );
// }

// export const Modal = () => {
//     const { modalRef, modalContent, closeModal } = useContext(ModalContext);

//     if (!modalRef || !modalRef.current || !modalContent) return null;

//     return ReactDOM.createPortal(
//         <div id="modal">
//         <div id="modal-background" onClick={closeModal} />
//         <div id="modal-content">{modalContent}</div>
//         </div>,
//         modalRef.current
//     );
// }

// export const useModal = () => useContext(ModalContext);