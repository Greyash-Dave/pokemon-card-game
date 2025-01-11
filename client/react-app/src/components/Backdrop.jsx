import {motion} from "framer-motion";

function Backdrop({children, onClick}){
    
    return(
        <>
        <motion.div
            className="backdrop"
            initial={{opacity:0}}
            animate={{opacity:1}}
            exit={{opacity:0}}
            onClick={onClick}
        >
        {children}
        </motion.div>
        </>
    )
}

export default Backdrop