import { Token, Tokeniser, Method } from "./token";

import Handler from './handlers/handler';
import BaseHandler from "./handlers/base";
import DisplayHandler from "./handlers/display";
import AudioHandler from "./handlers/audio";

import { logAsModule } from '../Util';

// meme
export default class Simulator {

    private readonly MOD_NAME = "Sim";

    public ready:boolean;
    public running:boolean;

    private queue : Token[];

    public handlers: Record<string, Handler>;

    constructor() {
        this.handlers = {
            "base":    new BaseHandler(),
            "display": new DisplayHandler(),
            "audio":   new AudioHandler()
        };
    
        this.ready = false;
        this.running = false;
        this.queue = [];
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
            .then(tokens => tokens.forEach(token => this.enqueue(token)))
            .then(() => this.ready=true)
            .then(() => logAsModule(this.MOD_NAME, "Simulator ready."));
    }

    async run() {
        if (!this.ready) throw new Error('Simulator has not finished preparing.');

        this.queue.forEach((token, index) => logAsModule(this.MOD_NAME, `PC: ${index} | Inst: ${token.modulePath}.${token.method} => ${token.params}`));
    
        // right now everything is blocking.
        for(let pc = 0; pc < this.queue.length; pc++) {
            let mod = this.queue[pc].modulePath[0] ?? "base";
            let method = this.queue[pc].method;
            let params = this.queue[pc].params;
            await this.handlers[mod].handle(method, params);
        }
    }

    async stop() {
        if (!this.running) return;
    }

    /**
     * Adds a new token/line of code to the queue.
     * @param token The token representing the operation.
     */
    enqueue(token:Token) {
        this.queue.push(token);
    }

    next() {
        return this.queue.shift();
    }
}

