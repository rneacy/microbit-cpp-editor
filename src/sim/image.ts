export default class Image {
    width: number;
    data: number[]; // Values 0 - 255

    constructor(width: number, data: number[]) {
        this.width = width;
        this.data = data;
    }
}