import react from 'react';
import './Board.css'

export function Box(props){
    
    return<div className="box">
    {props.move} 
    </div>;
   
}