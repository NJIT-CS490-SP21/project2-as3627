import logo from './logo.svg';
import './App.css';
import './Board.css';
import {Board} from './Board.js'
import {useState} from 'react';

function App() {
  const [board, setBoard] = useState(["", "", "", "", "", "", "", "", ""]);
  
  return (
    <div>
      <Board board={board} />
    </div>
  );
}

export default App;
