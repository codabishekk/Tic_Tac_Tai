import React from 'react'
import { motion } from 'framer-motion'

const SquareBoard = ({value,onClick}) => {

  return (
    <motion.button className='w-[90px] h-[90px] bg-[#1E293B] font-bold text-4xl flex items-center justify-center'
    whileTap={{scale:0.4}}
    onClick={onClick}>
        {value}
    </motion.button>
  )
}

export default SquareBoard