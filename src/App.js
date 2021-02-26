import logo from './logo.svg';
import './App.css';
import './Board.css';
import {Board} from './Board.js'
import {useState,  useRef, useEffect} from 'react';
import io from 'socket.io-client';
import {Login} from './Login.js';
import {calculateWinner} from './WinnerCheck';
const socket = io(); // Connects to socket connection

function App() {
  const [board, setBoard] = useState(["", "", "", "", "", "", "", "", ""]);
  const [turn, setTurn] = useState(0);
  const [list, setList] = useState([]);       // Array for holding usernames of people who logged in
  const [loggedIn, setLoggedIn] = useState(false);  // Used to set if the user is logged in or not
  const [counter, setCounter] = useState(0);  // Used to count the number of players
  
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
  
  
  return (
    <div>
      {loggedIn
        ? <Board board={board} click={(index) => addMove(index)}/>
        : <Login />
      }
      {/*
      <Board board={board} click={(index) => addMove(index)}/>
      <Login />
      */}
    </div>
  );
}

export default App;
