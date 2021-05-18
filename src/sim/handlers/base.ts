import Handler from "./handler";

export default class BaseHandler implements Handler {
    public isBound:boolean = true;
    async handle(method:string, params:string[]) {
        
    }
}