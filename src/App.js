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
    
    if (calculateWinner(board)){
      return;
    }
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
  
  
  function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
      else if(!squares.includes("")){
        return 'draw';
      }
    }
    return null;
  }
  
  
  return (
    <div>
      <Board board={board} click={(index) => addMove(index)}/>
    </div>
  );
}

export default App;
