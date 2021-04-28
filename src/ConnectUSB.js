const DAPjs = require('dapjs');

class MicroBitConnection {
    constructor(device) {
        this.device = device;

        this.connected = false;
        this.serialMode = false;

        this.connectDAP();
    }

    connectDAP() {
        this.transport = new DAPjs.WebUSB(this.device);
        this.dap       = new DAPjs.DAPLink(this.transport);
    }

    async connect() {
        console.info("USB: Attempting connection...");

        this.dap.connect()
            .then(() => {
                console.info("USB: Connected!");              // success
                this.dap.setSerialBaudrate(115200);
                this.connected = true;
            },
                err => console.error(err)               // reject
            );
    }

    async flash(rom) {
        this.dap.flash(rom)
            .then(
                console.log("have a look at your microbit"), // success

                err => console.error(err)                    // reject
            );
    }

    async startSerial() {
        console.info("USB: Attempting serial connection...");
        if(!this.connected){
            console.warn("USB: Wasn't connected; attempting...");
            await this.connect();
        }

        this.dap.startSerialRead();
        this.serialMode = true;
        console.info("USB: Now in serial mode.");

        this.dap.on(DAPjs.DAPLink.EVENT_SERIAL_DATA, (data) => {
            console.log("Serial [Received]: " + data);
        });
    }

    async disconnectSerial() {
        console.info("USB: Disconnecting from serial...");

        this.dap.stopSerialRead().then(() => {
            this.serialMode = false;
            console.info("USB: Disconnected from serial.");
        });
    }

    async sendSerialMessage(msg) {
        if(!this.connected) {
            throw Error("Not connected to micro:bit.");
        }
        if(!this.serialMode) {
            throw Error("Please initialise into serial mode first.");
        }

        this.dap.serialWrite(msg).then( () => {
            console.info("Serial [Sent]: " + msg);
        })
        .catch( err => console.error(err));
    }
}

export async function connectUSBDAPjs() {
    const device = await navigator.usb.requestDevice({ filters: [{vendorId: 0x0d28, productId: 0x0204}] });

    if (device !== null) {
        try {
            return new MicroBitConnection(device);
        }
        catch (error) {
            throw Error(error);
        }
    }
    else {
        throw Error("No device selected.");
    }

    
}