import { Token, Tokeniser, Method } from "./token";

import Handler from './handlers/handler';
import BaseHandler from "./handlers/base";
import DisplayHandler from "./handlers/display";
import AudioHandler from "./handlers/audio";

import { logAsModule } from '../Util';
import MessageBusHandler from "./handlers/messagebus";

// meme
export default class Simulator {

    private readonly MOD_NAME = "Sim";

    public ready:boolean;
    public running:boolean;

    private queue : Token[];

    private methods : { [method:string]: Token[] };

    public handlers: Record<string, Handler>;

    constructor() {
        this.handlers = {
            "base": new BaseHandler(this),
            "display": new DisplayHandler(this),
            "audio": new AudioHandler(),
            "messageBus": new MessageBusHandler(this)
        };
    
        this.ready = false;
        this.running = false;
        this.queue = [];
        this.methods = {};
    }
    /**
     * Prepares to start execution of new user code.
     * @param code The user's current code.
     */
    async prepare(code:string) {
        if(!code) throw new Error('No code supplied.');

        logAsModule(this.MOD_NAME, "Preparing simulator.");

        let lines = code.split('\n');
        lines = lines.filter((line) => line!=='\n'); // Remove unnecessary newlines.
        lines = lines.map(line => line.replace(/\n/g, '').trim()); // Remove tabs and leading/trailing spaces.
        let tokeniser = new Tokeniser(lines);

        await tokeniser.tokenise()
            .then(tokens => {
                // tokens.forEach(token => this.enqueue(token))
                this.methods = tokens;

                this.methods.main.forEach(token => this.enqueue(token));
            })
            .then(() => this.ready=true)
            .then(() => logAsModule(this.MOD_NAME, "Simulator ready."));
    }

    run() {
        if (!this.ready) throw new Error('Simulator has not finished preparing.');

        this.queue.forEach((token, index) => logAsModule(this.MOD_NAME, `PC: ${index} | Inst: ${token.modulePath}.${token.method} => ${token.params}`));

        this.running = true;
        
        this.executeNext();
    }

    executeNext() {
        let inst = this.getNext();

        if(inst) {
            let mod = inst.modulePath[0] ?? "base";
            let method = inst.method;
            let params = inst.params;

            mod = (this.handlers[mod]) ? mod : "base";

            this.handlers[mod].handle(method, params);
        }
        else{
            this.stop();
        }
    }

    stop() {
        if (!this.running) return;
        this.running = false;
    }

    /**
     * Adds a new token/line of code to the queue.
     * @param token The token representing the operation.
     */
    enqueue(token:Token) {
        this.queue.push(token);
    }

    enqueueExistingMethod(method:string) {
        logAsModule("Sim", `Enqueuing ${method}`)
        this.methods[method].forEach(token => this.enqueue(token));
    }

    getNext() {
        return this.queue.shift();
    }
}

