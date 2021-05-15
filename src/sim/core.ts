import { Token, Tokeniser, Method } from "./token";

// meme
export class Core {

    private queue : Token[] = [];

    // some constructor

    // Prepares to start execution of new user code.
    async prepare(code:string) {
        let lines = code.split('\n');
        lines = lines.filter((line) => line!=='\n'); // Remove unnecessary newlines.
        lines = lines.map(line => line.replace(/\n/g, '').trim()); // Remove tabs and leading/trailing spaces.
        let tokeniser = new Tokeniser(lines);

        let tokens = await tokeniser.tokenise();
    }

    enqueue(token:Token) {
        this.queue.push(token);
    }

    next() {
        return this.queue.shift();
    }
}

