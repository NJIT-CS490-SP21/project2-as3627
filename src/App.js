import './App.css';
import './Board.css';
import {Board} from './Board.js';
import {useState,  useRef, useEffect} from 'react';
import io from 'socket.io-client';
import {calculateWinner} from './WinnerCheck';
import {ListUsers} from './ListUsers';
const socket = io(); // Connects to socket connection

function App() {
  const [board, setBoard] = useState(["", "", "", "", "", "", "", "", ""]);
  const [turn, setTurn] = useState(0);              // Int used to index player arrays
  const [players, setPlayers] = useState([]);       // Array for holding usernames of players 
  const [spectators, setSpectators] = useState([]); // Array for holding usernames of spectators
  const [loggedIn, setLoggedIn] = useState(false);  // Used to set if the user is logged in or not
  const [ready, setReady] = useState(false);        // Bool used to determine if 2 people connected to the game or not
  const [username, setUsername] = useState("");     // String used to set the username for the player. 
  const [vote, setVote] = useState(0);
  
  const inputRef = useRef(null);
  
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
      socket.emit('login', { name });
      setLoggedIn(true);
    }
    
  }
  

  function onRestartButton(){
    socket.emit('restart', { username });
    
  }
  
  
  let status;
  const winner = calculateWinner(board);
  if (winner){
    if (winner === 'draw'){
      status = "The Game is a Draw!"
    }
    
    else if (winner === 'X'){
      status = "The winner is " + players[0] + "!";
    }
    
    else {
      status = "The winner is " + players[1]+ "!";
    }
    
  }
  
  else{
    status = "Next is: " + players[turn];
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
        setReady(true);
      }

    });
    
    socket.on('restart', (data) => {
      console.log("Received 1 Vote");
      setVote(1);
      
    });

    socket.on('confirm', (data) => {
      console.log("Confirming Restart");
      
      setBoard(["", "", "", "", "", "", "", "", ""]);
      setTurn(0);
      setVote(0);
      
    });
    
    

    
  }, []);
  
  
  return (
    <div>
      {loggedIn
      
        ? <div>
        
            {ready 
            
            ? <div> 
                <Board board={board} click={(index) => addMove(index)}/> 
                <h4>{status}</h4>
                <button onClick={onRestartButton}>Restart? {vote} / 2</button>
                <h5>Current Players</h5>
                <ul>{players.map((item, index) => <ListUsers key={index} name={item} />)}</ul>
                <h5>Current Spectators</h5>
                <ul>{spectators.map((item, index) => <ListUsers key={index} name={item} />)}</ul>
              </div>
                
            :<div> 
              <h5>Waiting for Player 2 to Join</h5>
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
