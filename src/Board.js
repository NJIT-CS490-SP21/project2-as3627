import React from 'react';
import PropTypes from 'prop-types';
import './Board.css';
import Box from './Box';

function Board(props) {
  const { board } = props;
  const { click } = props;
  return (
    <div className="board">
      <Box
        move={board[0]}
        click={() => {
          click(0);
        }}
      />
      <Box
        move={board[1]}
        click={() => {
          click(1);
        }}
      />
      <Box
        move={board[2]}
        click={() => {
          click(2);
        }}
      />
      <Box
        move={board[3]}
        click={() => {
          click(3);
        }}
      />
      <Box
        move={board[4]}
        click={() => {
          click(4);
        }}
      />
      <Box
        move={board[5]}
        click={() => {
          click(5);
        }}
      />
      <Box
        move={board[6]}
        click={() => {
          click(6);
        }}
      />
      <Box
        move={board[7]}
        click={() => {
          click(7);
        }}
      />
      <Box
        move={board[8]}
        click={() => {
          click(8);
        }}
      />
    </div>
  );
}

Board.propTypes = {
  board: PropTypes.func.isRequired,
  click: PropTypes.func.isRequired,
};

export { Board as default };
