import react from 'react';
import './Board.css'
import {Box} from './Box.js';

export function Board(props){
    
    return<div className="board">
        <Box move={props.board[0]} click={() => {props.click(0)}} />
        <Box move={props.board[1]} click={() => {props.click(1)}} />
        <Box move={props.board[2]} click={() => {props.click(2)}}  />
        <Box move={props.board[3]} click={() => {props.click(3)}} />
        <Box move={props.board[4]} click={() => {props.click(4)}} />
        <Box move={props.board[5]} click={() => {props.click(5)}} />
        <Box move={props.board[6]} click={() => {props.click(6)}} />
        <Box move={props.board[7]} click={() => {props.click(7)}} />
        <Box move={props.board[8]} click={() => {props.click(8)}} />
    </div>;
   
}