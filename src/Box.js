import React from 'react';
import PropTypes from 'prop-types';
import './Board.css';

function Box(props) {
  const { move } = props;
  const { click } = props;

  return (
    <div className="box" onClick={click} aria-hidden="true">
      {move}
    </div>
  );
}

Box.propTypes = {
  move: PropTypes.string.isRequired,
  click: PropTypes.func.isRequired,
};

export { Box as default };
