import React from 'react'
import SquareBoard from './SquareBoard'

const GameBoard = ({board,handleClick}) => {

  return (
    <div className='grid grid-cols-3 gap-2 w-[300px]'>
        {board.map((val, i)=>(
          <SquareBoard key={i} value={val} i={i}
          onClick={() => handleClick(i)}/>
        ))}
    </div>
  )
}

export default GameBoard