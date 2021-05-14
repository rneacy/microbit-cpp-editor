import Handler from "./handler";

export default class DisplayHandler implements Handler {

    methods = ['scroll', 'scrollAsync', 'print', 'printChar'];

    async handle() {

    }

    //! scroll delay is actually between scroll updates, not characters
}