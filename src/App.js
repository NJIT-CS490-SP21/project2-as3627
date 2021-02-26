import logo from './logo.svg';
import './App.css';
import './Board.css';
import {Board} from './Board.js'
import {useState,  useRef, useEffect} from 'react';
import io from 'socket.io-client';
import {calculateWinner} from './WinnerCheck';
const socket = io(); // Connects to socket connection

function App() {
  const [board, setBoard] = useState(["", "", "", "", "", "", "", "", ""]);
  const [turn, setTurn] = useState(0);
  const [users, setUsers] = useState([]);             // Array for holding usernames of people who logged in
  const [loggedIn, setLoggedIn] = useState(false);  // Used to set if the user is logged in or not
  const [counter, setCounter] = useState(0);        // Used to count the number of players
  const inputRef = useRef(null);
  
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
  
  
  
  function onClickButton(){
    
  if (inputRef.current.value != "" ) {
        const username = inputRef.current.value;
        // If your own client sends a message, we add it to the list of messages to 
        // render it on the UI.
        
        setUsers(prevUsers => [...prevUsers, username]);
        setLoggedIn(true);
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
        ? <div><Board board={board} click={(index) => addMove(index)}/> 
        <ul>
        {users}
        </ul>
        </div>
        : <div>      
            <h1>Enter your Username</h1>
            <input ref={inputRef} type="text"/>
            <button onClick={onClickButton}>Login</button>
          </div>
      }

    </div>
  );
}

export default App;
