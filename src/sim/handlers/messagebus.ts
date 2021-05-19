import { logAsModule } from "../../Util";
import Simulator from "../core";
import Handler from "./handler";

export default class MessageBusHandler implements Handler {
    public isBound:boolean = true;

    private readonly simulatorCallback:Simulator;

    private readonly implementedDevices = ['DEVICE_ID_BUTTON_A', 'DEVICE_ID_BUTTON_B'];
    private readonly implementedEvents = ['DEVICE_BUTTON_EVT_CLICK', 'DEVICE_BUTTON_EVT_DOWN'];

    public listeners:{[device:string]: MessageBusListener[]} = {};

    constructor(callback:Simulator) {
        this.simulatorCallback = callback;

        this.implementedDevices.map(device => this.listeners[device] = []);
    }

    async handle(method:string, params:string[]) {
        switch(method){
            case 'listen':
                this.registerListener(params);
                break;
        }

        this.simulatorCallback.executeNext();
    }

    registerListener(params:string[]) {
        // Param 0 -> Device ID (in our case we're only dealing with buttons A or B)
        // Param 1 -> Event ID
        // Param 3 -> Callback

        let deviceID = params[0];
        let eventID = params[1];
        let callback = params[2];

        if(this.implementedDevices.includes(deviceID)) {
            if(this.implementedEvents.includes(eventID)) {
                this.listeners[deviceID].push(new MessageBusListener(eventID, callback));
            }
        }

        logAsModule("MSGBus", `Registered listener for ${deviceID}: ${eventID}.`);
    }

    handleEvent(device:string, event:string) {
        logAsModule("MSGBus", `Handling event ${event}`)

        if(this.implementedDevices.includes(device)) {
            this.listeners[device].forEach(listener => {
                if(listener.eventID === event) {
                    this.simulatorCallback.enqueueExistingMethod(listener.callback);
                }
            });
        }
    }

}

class MessageBusListener {
    constructor(public eventID:string, public callback:string) {}
}