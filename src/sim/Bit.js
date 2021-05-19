import React from 'react';

import board from '../res/mbit.png';

import led_on from '../res/led_on.png';
import led_off from '../res/led_off.png';

import btn_transp from '../res/btn_transp.png';

import './BitStyle.css';

const BOARD_DIMENSION = 5;

export default function Bit(props) {
    return (props.visible) ?
        (<div className="MicroBitContainer">
            <ButtonHolder sim={props.sim}/>
            <LEDMatrix leds={props.leds}/>
            <img alt = "" className="MicroBit" src={board}></img>
        </div>)
        :
        (<div></div>)
    ;
}

//*------------------------------------
//* LEDs
//*------------------------------------
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

//*------------------------------------
//* Buttons
//*------------------------------------
function ButtonHolder(props) {
    return (
        <table className="ButtonTable">
            <tbody>
                <tr>
                    <th>
                        <Button sim={props.sim} device="DEVICE_ID_BUTTON_A"/>
                    </th>
                    <th>
                        <Button sim={props.sim} device="DEVICE_ID_BUTTON_B"/>
                    </th>
                </tr>
            </tbody>
        </table>
    )
}

function Button(props) {
    return (
        <input 
            type="image"
            src={btn_transp}
            alt=""
            className="Button" 
            onMouseDown={()=>props.sim.handlers.messageBus.handleEvent(props.device, "DEVICE_BUTTON_EVT_DOWN")} 
            onClick={() => props.sim.handlers.messageBus.handleEvent(props.device, "DEVICE_BUTTON_EVT_CLICK")}
        />
    );
}