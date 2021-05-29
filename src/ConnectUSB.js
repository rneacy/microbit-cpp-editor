const DAPjs = require('dapjs');

export class MicroBitConnection {
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

        await this.dap.connect()
            .then(() => {
                console.info("USB: Connected!");
                this.dap.setSerialBaudrate(this.SLOW_SERIAL_BAUD);
                this.connected = true;
            })
            .catch((err) => {
                console.error(err);
                throw new Error(err);
            });
    }

    async disconnectDap() {
        console.info("USB: Disconnecting DAP...");

        return this.dap.disconnect();
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
        this.dap.startSerialRead(1, false);
        this.serialMode = true;
        console.info("USB: Now in serial mode.");
    }

    async disconnectSerial() {
        console.info("USB: Disconnecting from serial...");

        this.dap.stopSerialRead();
        this.serialMode = false;
        console.info("USB: Disconnected from serial.");
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

    static SERIAL_EVENT = DAPjs.DAPLink.EVENT_SERIAL_DATA;
    static FAST_SERIAL_BAUD = 115200;
    static SLOW_SERIAL_BAUD = 9600;
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