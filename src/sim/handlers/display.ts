import Simulator from "../core";
import { FontData } from "../image";
import Handler from "./handler";

export default class DisplayHandler implements Handler {

    public isBound:boolean = false;

    readonly MATRIX_DIMENSION = 5;
    private ledMatrix = Array(this.MATRIX_DIMENSION).fill(0).map(() => Array(this.MATRIX_DIMENSION).fill(0));
    private matrixHook:Function = () => {};

    methods = ['scroll', 'scrollAsync', 'print', 'printChar'];

    private readonly simulatorCallback:Simulator;

    constructor(callback:Simulator) {
        this.simulatorCallback = callback;
    }

    async handle(method:string, params:string[]) {
        switch(method){
            case 'scroll':
                this.scroll(params);
                break;
            case 'scrollAsync':
                break;
            case 'print':
                this.print(params);
                break;
            case 'printChar':
                break;
            default:
                this.simulatorCallback.executeNext();
        }
    }

    scroll(params:string[]) {
        // param 0  -> requested text/number
        // param 1  -> delay between refreshes (optional)

        let img = FontData.textToImage(params[0].slice(1,-1), true);
        let delay = parseInt(params[1] ?? 100);
        if(isNaN(delay)) delay = 100;

        // Now scroll through these
        let timeoutID = setInterval(() => {
            // Clear the matrix
            this.ledMatrix.map((el) => el.fill(0));

            // Get the text image as it is presently.
            for(let y = 0; y < this.MATRIX_DIMENSION; y++) {
                for(let x = 0; x < this.MATRIX_DIMENSION; x++) {
                    this.ledMatrix[y][x] = img.data[y][x];
                }
            }

            // Update on screen
            this.matrixHook([...this.ledMatrix]);

            // Scroll 'til we can't no mo'
            if(!img.isEmpty()) {
                img.shiftLeft(1); // this is an assumption for now
            }
            else {
                clearInterval(timeoutID);
                this.simulatorCallback.executeNext();
            }

        }, delay);
    }

    print(params:string[]) {
        // param 0  -> requested text/number
        // param 1  -> delay between refreshes (optional)

        let img = FontData.textToImage(params[0].slice(1,-1));
        let delay = parseInt(params[1] ?? 400);
        if(isNaN(delay)) delay = 100;

        // Now scroll through these
        let timeoutID = setInterval(() => {
            // Clear the matrix
            this.ledMatrix.map((el) => el.fill(0));

            // Get the text image as it is presently.
            for(let y = 0; y < this.MATRIX_DIMENSION; y++) {
                for(let x = 0; x < this.MATRIX_DIMENSION; x++) {
                    this.ledMatrix[y][x] = img.data[y][x];
                }
            }

            // Update on screen
            this.matrixHook([...this.ledMatrix]);

            // Scroll 'til we can't no mo'
            if(!img.isEmpty()) {
                img.shiftLeft(5);
            }
            else {
                clearInterval(timeoutID);
                this.simulatorCallback.executeNext();
            }

        }, delay);
    }

    bindDisplay(displaySetter:Function) {
        // On LED -> 8x12
        // Off LED -> 4x8

        // Board -> 96x98
        // Space-between horiz -> 19 (23 if counting the LED)
        // Space-between verti -> 14

        this.matrixHook = displaySetter;
        this.isBound = true;
    }
}