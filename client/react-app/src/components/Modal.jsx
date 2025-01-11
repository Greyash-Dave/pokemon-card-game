import {motion} from "framer-motion";
import Backdrop from "./Backdrop";

const dropIn = {
    hidden:{
        y : "-100vh",
        opacity: 1,
    },
    visible:{
        y: "0",
        opacity: 1,
        transition: {
            duration: 0.1,
            type: "spring",
            damping: 20,
            stiffness: 500,
        },
    },
    exit:{
        y: "100vh",
        opacity: 0,
    },
};

function Modal({handleClose, cont}){
    return(
        // <Backdrop onClick={handleClose} >
        <Backdrop >
            <motion.div
                onClick={(e) => e.stopPropagation()}
                className="modal"
                variants={dropIn}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <button className="modal-btn" onClick={handleClose}>X</button>
                {cont}
            </motion.div>
        </Backdrop>
    )
}

export default Modal