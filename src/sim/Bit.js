import React from 'react';

import board from '../res/mbit.png'
import led_on from '../res/led_on.png'
import led_off from '../res/led_off.png'

import './BitStyle.css';

const BOARD_DIMENSION = 5;

export default function Bit(props) {
    return(
        <div className="MicroBitContainer">
            <LEDMatrix leds={props.leds}/>
            <img alt = "" className="MicroBit" src={board}></img>
        </div>
    );
}

function LEDMatrix(props) {
    const LEDs = [];

    for(let y = 0; y < BOARD_DIMENSION; y++) {
        LEDs.push([]);
        for (let x = 0; x < BOARD_DIMENSION; x++) {
            LEDs[y].push(<LED on={props.leds[y][x]}/>);
        }
    }

    const tableRows = LEDs.map((row, i) => (
        <tr key={"ledmatrixrow" + i}>
            {row.map((led, ledi) => (<td key={"ledmatrixrow" + i + "led" + ledi}>{led}</td>))}
        </tr>
    ));

    return <table className="LEDTable"><tbody>{tableRows}</tbody></table>
}

function LED(props) {
    return props.on ?
    (<div>
        <img src={led_on} key={led_on} className="LED" alt=""></img>
    </div>) :
    (<div>
        <img src={led_off} key={led_off} className="LED" alt=""></img>
    </div>);
}