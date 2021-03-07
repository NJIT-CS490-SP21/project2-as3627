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
  const [rankNames, setRankNames] = useState([]);
  const [rankPoints, setRankPoints] = useState([]);
  const [leaderboard, setLeaderboard] = useState(false);
  //const [viewRank, setViewRank] = useState(false);

  const inputRef = useRef(null);
  
  // For Login and Username chacking, using state variables didn't work inside of useEffect.
  // Mervyn reccomended that I utilize `useRef` for this, and it works.
  const loginRef = useRef(null);
  loginRef.current = loggedIn;
  
  const userRef = useRef(null);
  userRef.current = username;
  
  
  // Handles adding a move to the board
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
  
  
  // Handles the login action
  function onLoginButton(){
    
    if (inputRef.current.value !== "" ) {
      const name = inputRef.current.value;
      setUsername(name);
      socket.emit('login', { name });
    }
    
  }
  
  
  // Handles hitting the restart game button.
  function onRestartButton(){
    socket.emit('restart', { username });
  }
  
  function onShowRanks(){
    setLeaderboard(!leaderboard);
  }
  
  // Shows the current Status. Displays whose move is next, who the winner is, and if there is a draw.
  let status;
  const winner = calculateWinner(board);
  if (winner){
    
    if (winner === 'draw'){
      status = "The Game is a Draw!";
    }
    
    else if (winner === 'X'){
      status = "The winner is " + players[0] + "!";
      check_champ(players[0]);
      check_loser(players[1]);
    }
    
    else{
      status = "The winner is " + players[1]+ "!";
      check_champ(players[1]);
      check_loser(players[0]);
    }
    
  }
  
  else{
    status = "Next is: " + players[turn];
  }


  function check_champ(name){
    
    if (username === name){
      //console.log("WE WIN");
      socket.emit('winner', { name });
    }
  }
  
  function check_loser(name){
    
    if (username === name){
      //console.log("WE LOSE");
      socket.emit('loser', { name });
    }
  }
  
  
  // Handle everything the server emits. 
  useEffect(() => {
    
    // When a move has been made.
    socket.on('move', (data) => {
      //console.log('Move event received!');

      setBoard(prevBoard => Object.assign([...prevBoard], {[data.index]: data.play }));
      setTurn(data.nextTurn);
    
    });
    
    // When a user has logged in.
    socket.on('login', (data) => {
      //console.log(data.players);
      
      setPlayers(data.players);
      setSpectators(data.spectators);
      console.log(data.rank_names);
      console.log(data.rank_points);
      setRankNames(data.rank_names);
      setRankPoints(data.rank_points);
      
      //console.log(players[0]);
      
      if (data.ready){
        setReady(true);
      }

    });
    
    
    socket.on('update', (data) => {
      console.log(data.rank_names);
      console.log(data.rank_points);
      setRankNames(data.rank_names);
      setRankPoints(data.rank_points);
    });
    
    // When a person tries to login with a duplicate username.
    socket.on('deny', (data) => {
      if (!loginRef.current){
        if (userRef.current === data.name){
          alert("Username in use, please enter a new one");
        }
      }
    });
    
    // When a person logs in with a unique username.
    socket.on('confirm', (data) => {
      if (!loginRef.current){
        if (userRef.current === data.name){
          setLoggedIn(true);
        }
      }
    });
    
    // When 1 player votes to restart.
    socket.on('restart', (data) => {
      //console.log("Received 1 Vote");
      setVote(1);
      
    });

    // When two players vote to restart. Actually restarting the game
    socket.on('confirm_restart', (data) => {
      //console.log("Confirming Restart");
      
      setBoard(["", "", "", "", "", "", "", "", ""]);
      setTurn(0);
      setVote(0);
      
    });
    
    
  }, []);
  
  
  // Using JSX to render the page
  return (
    <div>
      {loggedIn
      
        ? <div>
        
            {ready 
            
              ? <div> 
                  <h2 className = "info">{status}</h2>
                  <Board board={board} click={(index) => addMove(index)}/> <br />
                  <div className="info"><button onClick={onRestartButton}>Restart? {vote} / 2</button></div>
                  <h5 className = "info">Current Players</h5>
                  <div className = "info"><ul>{players.map((item, index) => <ListUsers key={index} name={item} />)}</ul></div>
                  <h5 className = "info">Current Spectators</h5>
                  <div className = "info"><ul>{spectators.map((item, index) => <ListUsers key={index} name={item} />)}</ul></div>
                  
                  <div className="info"><button onClick={onShowRanks}>Hide/Show Rankings</button></div><br />
                  {leaderboard ? <div>
                  <table className = "center">
                  <tr>
                    <th>Username</th>
                    <th>Points</th>
                  </tr>

                    {rankNames.map((item, index) => <tr>
                      <td>{item===username ? <u><b>{item}</b></u> : item}</td><td>{rankPoints[index]}</td>
                    </tr>
                    )}
                  </table>
                  <br /> </div>
                  : <div></div>
                  }
                </div>
                  
              :<div className = "holder"> 
                <h2 className = "info">Waiting for Player 2 to Join</h2>
              </div>
            }
            
          </div>
          
        : <div>
            <div className="holder">
            <h1 className = "info">Enter your Username</h1>
            <div className = "info"><input ref={inputRef} type="text"/>
            <button onClick={onLoginButton}>Login</button></div>
            </div>
          </div>
      }

    </div>
  );
}

export default App;
