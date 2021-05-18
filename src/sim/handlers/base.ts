import Simulator from "../core";
import Handler from "./handler";

export default class BaseHandler implements Handler {
    public isBound:boolean = true;

    private readonly simulatorCallback:Simulator;

    constructor(callback:Simulator) {
        this.simulatorCallback = callback;
    }

    async handle(method:string, params:string[]) {
        this.simulatorCallback.executeNext();
    }
}