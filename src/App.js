import logo from './logo.svg';
import './App.css';
import './Board.css';
import {Board} from './Board.js'
import {useState} from 'react';

function App() {
  const [board, setBoard] = useState(["", "", "", "", "", "", "", "", ""]);
  const [turn, setTurn] = useState(0);
  
  function addMove(index){
    
    if (board[index] === ""){
      if (turn === 0) {
        setBoard(prevList => Object.assign([...prevList], {[index]: "X"} ));
        setTurn(1);
      }
    
      else {
        setBoard(prevList => Object.assign([...prevList], {[index]: "O"} ));
        setTurn(0);
      }
    }

  }
  
  return (
    <div>
      <Board board={board} click={(index) => addMove(index)}/>
    </div>
  );
}

export default App;
