export default interface Handler {
    handle(method:string, params:string[]) : Promise<void>;
    isBound:boolean;
}