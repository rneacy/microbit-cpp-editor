export class Token {
    // Meta
    //callingClass:string;
    //callingFunc:string;

    // Called function
    modulePath : string[] = [];
    method : string = "";
    params : string[] = [];

    constructor(private line:string, private isUbit:boolean = true) {
        this.parse();
    }

    private parse() {
        let currentLexeme : string[] = [];

        if(this.line.includes(Delimiters.ASSIGNMENT)) {

        }
        else { // module call (probably)
            let isParams = false;
            this.line.split('').forEach((c, i) => {
                if (c === Delimiters.SEMICOLON) {
                    return;
                }
                if(!isParams) {
                    if (c === Delimiters.DOT) { // new word
                        let toPush = currentLexeme.join('');

                        if (toPush !== "uBit") {
                            this.modulePath.push(toPush);
                        }
                        currentLexeme = [];
                        return;
                    }
                    else if (c === Delimiters.OPEN_PARENTHESIS) {
                        this.method = currentLexeme.join('');
                        currentLexeme = [];
                        isParams = true;
                        return;
                    }
                }
                else {
                    if (c === Delimiters.COMMA) {
                        this.params.push(currentLexeme.join(''));
                        currentLexeme = [];
                        return;
                    }
                    else if (c === Delimiters.CLOSE_PARENTHESIS) {
                        this.params.push(currentLexeme.join(''));
                        currentLexeme = [];
                        isParams = false;
                        return;
                    }
                }
    
                currentLexeme.push(c);
            });
        }
    }

    toString() : string {
        return `Module: ${this.modulePath}\nFunc: ${this.method}\nParams: ${this.params}`
    }
}

/**
 * Transforms user code into tokens.
 */
 export class Tokeniser {

    includes : string[] = [];

    lines : string[];

    // We're only implementing 'uBit.display' and 'uBit.audio(.soundExpressions)' for now.
    readonly _mainModule = 'uBit';
    readonly _moduleDelim = '.';

    constructor(lines:string[]) {
        this.lines = lines;
    }

    /**
     * Takes the current supplied code and returns it fully tokenised.
     */
    async tokenise() : Promise<Token[]>{
        let tokens : Token[] = [];

        let currentMethod : Method;

        this.lines.forEach((el, i) => {
            if (el.includes('#include')) { // This is a bit naughty since it's not technically tokenisation but who cares. (what a madman)
                this.includes.push(el.split('#include ')[1]);
                return;
            }

            if (el.includes('int main')) { // for now
                currentMethod = new Method('int', 'main', []);
                return;
            }

            if (el.includes(this._mainModule.concat(this._moduleDelim))){ // For now we're only dealing with uBit modules.
                tokens.push( new Token(el) );
            }
        });

        return tokens;
    }

}

export class Method {
    constructor(public returnType:string, public name:string, public params:string[]){}
}

class Delimiters {
    static readonly DOT = ".";
    static readonly COMMA = ",";
    static readonly SEMICOLON = ";";
    static readonly OPEN_PARENTHESIS = "(";
    static readonly CLOSE_PARENTHESIS = ")";
    static readonly ASSIGNMENT = "=";
}