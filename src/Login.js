import react from 'react';
import {useState,  useRef, useEffect} from 'react';

export function Login(props){
    
    const inputRef = useRef(null);
    
    return<div>
      <h1>Enter your Username</h1>
      <input ref={inputRef} type="text"/>
      <button onClick={props.onclick}>Login</button>
    </div>;
}