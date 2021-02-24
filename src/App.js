import logo from './logo.svg';
import './App.css';
import './Board.css';
import {Board} from './Board.js'
import {useState,  useRef, useEffect} from 'react';
import io from 'socket.io-client';

const socket = io(); // Connects to socket connection

function App() {
  const [board, setBoard] = useState(["", "", "", "", "", "", "", "", ""]);
  const [turn, setTurn] = useState(0);
  
  function addMove(index){
    
    if (board[index] === ""){
      if (turn === 0) {
        setBoard(prevBoard => Object.assign([...prevBoard], {[index]: "X"} ));
        setTurn(1);
        socket.emit('move', { index: index, play: "X" });
      }
    
      else {
        setBoard(prevBoard => Object.assign([...prevBoard], {[index]: "O"} ));
        setTurn(0);
        socket.emit('move', { index: index, play: "O" });
      }
    }

  }
  
  useEffect(() => {
    socket.on('move', (data) => {
    console.log('Move event received!');

    setBoard(prevBoard => Object.assign([...prevBoard], {[data.index]: data.play }));
    });
  }, []);
  
  
  return (
    <div>
      <Board board={board} click={(index) => addMove(index)}/>
    </div>
  );
}

export default App;
