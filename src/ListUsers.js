import React from 'react';
import PropTypes from 'prop-types';

function ListUsers(props) {
  const { name } = props;

  return <li>{name}</li>;
}

ListUsers.propTypes = {
  name: PropTypes.string.isRequired,
};

export { ListUsers as default };
