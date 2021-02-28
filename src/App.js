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
  const [players, setPlayers] = useState([]);       // Array for holding usernames of people who 
  const [spectators, setSpectators] = useState([]); // Array for holding usernames of people who logged in
  const [loggedIn, setLoggedIn] = useState(false);  // Used to set if the user is logged in or not
  const inputRef = useRef(null);
  
  const [ready, setReady] = useState(false);
  
  const [username, setUsername] = useState("");
  
  function addMove(index){

    if (calculateWinner(board)){
      return;
    }
    
    if (username === players[turn]){
      
      if (board[index] === ""){
        if (turn === 0) {
          setBoard(prevBoard => Object.assign([...prevBoard], {[index]: "X"} ));
          setTurn(1);
          socket.emit('move', { index: index, play: "X", nextTurn: 1 });
        }
      
        else {
          setBoard(prevBoard => Object.assign([...prevBoard], {[index]: "O"} ));
          setTurn(0);
          socket.emit('move', { index: index, play: "O", nextTurn: 0 });
        }
      }
    }

   
  }
  
  
  function onLoginButton(){
    
    if (inputRef.current.value != "" ) {
      const name = inputRef.current.value;
      setUsername(name);
      // If your own client sends a message, we add it to the list of messages to 
      // render it on the UI.
      
      socket.emit('login', { name });
      setLoggedIn(true);
    }
    
  }
  
  useEffect(() => {
    socket.on('move', (data) => {
    console.log('Move event received!');

    setBoard(prevBoard => Object.assign([...prevBoard], {[data.index]: data.play }));
    setTurn(data.nextTurn);
    
    });
    
    socket.on('login', (data) => {
      console.log(data.players);
      
      setPlayers(data.players);
      setSpectators(data.spectators);
      console.log(players[0]);
      
      if (data.ready){
        
        //setPlayers(data.players);
      
        setReady(true);
      }

    });
    
  }, []);
  
  
  return (
    <div>
      {loggedIn
        ? <div>
            {ready 
            ? <div> 
                <Board board={board} click={(index) => addMove(index)}/> 
                <h5>
                Next is {players[turn]}
                </h5>
                </div>
            :<div> 
              <h5>Waiting for Player 2</h5>
            </div>
            }
          </div>
        : <div>      
            <h1>Enter your Username</h1>
            <input ref={inputRef} type="text"/>
            <button onClick={onLoginButton}>Login</button>
          </div>
      }

    </div>
  );
}

export default App;
