import react from 'react';
import './Board.css'
import {Box} from './Box.js';


export function Board(props){


    return<div className="board">
        <Box move={props.board[0]} />
        <Box move={props.board[1]} />
        <Box move={props.board[2]} />
        <Box move={props.board[3]} />
        <Box move={props.board[4]} />
        <Box move={props.board[5]} />
        <Box move={props.board[6]} />
        <Box move={props.board[7]} />
        <Box move={props.board[8]} />
    </div>;
   
}