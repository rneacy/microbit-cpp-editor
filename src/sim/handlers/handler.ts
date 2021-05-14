export default interface Handler {
    methods : string[];
    handle() : Promise<void>;
}