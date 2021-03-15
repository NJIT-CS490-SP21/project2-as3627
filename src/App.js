import './App.css';
import './Board.css';
import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import Board from './Board';
import calculateWinner from './WinnerCheck';
import ListUsers from './ListUsers';

const socket = io(); // Connects to socket connection

function App() {
  // Used to initialize the board
  const [board, setBoard] = useState(['', '', '', '', '', '', '', '', '']);
  // Int used to index player arrays
  const [turn, setTurn] = useState(0);
  // Array for holding usernames of players
  const [players, setPlayers] = useState([]);
  // Array for holding usernames of spectators
  const [spectators, setSpectators] = useState([]);
  // Used to set if the user is logged in or not
  const [loggedIn, setLoggedIn] = useState(false);
  // Bool used to determine if 2 people connected to the game or not
  const [ready, setReady] = useState(false);
  // String used to set the username for the player.
  const [username, setUsername] = useState('');
  // Used to determine the number of restart votes recieved.
  const [vote, setVote] = useState(0);
  // Used to store the names of the rankings in order
  const [rankNames, setRankNames] = useState([]);
  // Used to store the points of the rankings in order
  const [rankPoints, setRankPoints] = useState([]);
  // Used to toggle the leaderboard view.
  const [leaderboard, setLeaderboard] = useState(false);

  const inputRef = useRef(null);

  // For Login and Username chacking, using state variables didn't work inside of useEffect.
  // Mervyn reccomended that I utilize `useRef` for this, and it works.
  const loginRef = useRef(null);
  loginRef.current = loggedIn;

  const userRef = useRef(null);
  userRef.current = username;

  // Handles adding a move to the board
  function addMove(index) {
    if (calculateWinner(board)) {
      return;
    }

    if (username === players[turn]) {
      if (board[index] === '') {
        if (turn === 0) {
          setBoard((prevBoard) => Object.assign([...prevBoard], { [index]: 'X' }));
          setTurn(1);
          socket.emit('move', { index, play: 'X', nextTurn: 1 });
        } else {
          setBoard((prevBoard) => Object.assign([...prevBoard], { [index]: 'O' }));
          setTurn(0);
          socket.emit('move', { index, play: 'O', nextTurn: 0 });
        }
      }
    }
  }

  // Handles the login action
  function onLoginButton() {
    if (inputRef.current.value !== '') {
      const name = inputRef.current.value;
      setUsername(name);
      socket.emit('login', { name });
    }
  }

  // Handles hitting the restart game button.
  function onRestartButton() {
    socket.emit('restart', { username });
  }

  function onShowRanks() {
    setLeaderboard(!leaderboard);
  }

  // Emits the winner
  function checkChamp(name) {
    if (username === name) {
      socket.emit('winner', { name });
    }
  }

  // Emits the loser
  function checkLoser(name) {
    if (username === name) {
      socket.emit('loser', { name });
    }
  }

  // Shows the current Status.
  // Displays whose move is next, who the winner is, and if there is a draw.
  let status;
  const winner = calculateWinner(board);
  if (winner) {
    if (winner === 'draw') {
      status = 'The Game is a Draw!';
    } else if (winner === 'X') {
      status = `The winner is ${players[0]}!`;
      checkChamp(players[0]);
      checkLoser(players[1]);
    } else {
      status = `The winner is ${players[1]}!`;
      checkChamp(players[1]);
      checkLoser(players[0]);
    }
  } else {
    status = `Next is: ${players[turn]}`;
  }

  // Handle everything the server emits.
  useEffect(() => {
    // When a move has been made.
    socket.on('move', (data) => {
      setBoard((prevBoard) => Object.assign([...prevBoard], { [data.index]: data.play }));
      setTurn(data.nextTurn);
    });

    // When a user has logged in. Set player and Spectator arrays. Fetch the current rankings.
    socket.on('login', (data) => {
      setPlayers(data.players);
      setSpectators(data.spectators);

      setRankNames(data.rank_names);
      setRankPoints(data.rank_points);

      if (data.ready) {
        setReady(true);
      }
    });

    // When the scores update, we send the data to the states.
    socket.on('update', (data) => {
      setRankNames(data.rank_names);
      setRankPoints(data.rank_points);
    });

    // When a person tries to login with a duplicate username.
    socket.on('deny', (data) => {
      if (!loginRef.current) {
        if (userRef.current === data.name) {
          // console.log('Username in use, please enter a new one');
        }
      }
    });

    // When a person logs in with a unique username.
    socket.on('confirm', (data) => {
      if (!loginRef.current) {
        if (userRef.current === data.name) {
          setLoggedIn(true);
        }
      }
    });

    // When 1 player votes to restart.
    socket.on('restart', () => {
      // console.log("Received 1 Vote");
      setVote(1);
    });

    // When two players vote to restart. Actually restarting the game
    socket.on('confirm_restart', () => {
      setBoard(['', '', '', '', '', '', '', '', '']);
      setTurn(0);
      setVote(0);
    });
  }, []);

  // Using JSX to render the page
  return (
    <div>
      {loggedIn ? (
        <div>
          {ready ? (
            <div>
              <h2 className="info">{status}</h2>
              <Board board={board} click={(index) => addMove(index)} />
              {' '}
              <br />
              <div className="info">
                <button onClick={onRestartButton} type="submit">
                  Restart?
                  {vote}
                  {' '}
                  / 2
                </button>
              </div>
              <h5 className="info">Current Players</h5>
              <div className="info">
                <ul>
                  {players.map((item, index) => (
                    <ListUsers key={index} name={item} />
                  ))}
                </ul>
              </div>
              <h5 className="info">Current Spectators</h5>
              <div className="info">
                <ul>
                  {spectators.map((item, index) => (
                    <ListUsers key={index} name={item} />
                  ))}
                </ul>
              </div>
              <div className="info">
                <button onClick={onShowRanks} type="submit">
                  Hide/Show Rankings
                </button>
              </div>
              <br />
              {leaderboard ? (
                <div>
                  <table className="center">
                    <tr>
                      <th>Username</th>
                      <th>Points</th>
                    </tr>
                    {rankNames.map((item, index) => (
                      <tr>
                        <td>
                          {item === username ? (
                            <u>
                              <b>{item}</b>
                            </u>
                          ) : (
                            item
                          )}
                        </td>
                        <td>{rankPoints[index]}</td>
                      </tr>
                    ))}
                  </table>
                  <br />
                </div>
              ) : (
                <div />
              )}
            </div>
          ) : (
            <div className="holder">
              <h2 className="info">Waiting for Player 2 to Join</h2>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="holder">
            <h1 className="info">Enter your Username</h1>
            <div className="info">
              <input ref={inputRef} type="text" />
              <button onClick={onLoginButton} type="submit">
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
