import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useEffectFirstChange } from './Util';

import './App.css';
import logo from './res/logo.portrait.white.notxt.svg';

import { ToastContainer, toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Icon imports
import { GoLinkExternal } from 'react-icons/go';
import { ImCogs, ImCheckmark, ImCross } from 'react-icons/im';
import { BiImport, BiExport, BiHelpCircle, BiError } from 'react-icons/bi';
import { CgOptions } from 'react-icons/cg';
import { GrInProgress, GrStatusDisabledSmall } from 'react-icons/gr';
import { RiUsbFill, RiFlashlightFill, RiFileEditLine } from 'react-icons/ri';
import { FaPager, FaPlay } from 'react-icons/fa';

import axios from "axios";
import MonacoEditor from 'react-monaco-editor';
import { useFilePicker } from 'use-file-picker';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';

import { Howl, Howler } from 'howler';

import precompile from './res/precompile.json';
import convert from './Convert';
import { connectUSBDAPjs, MicroBitConnection } from './ConnectUSB';

// Simulator imports
import Simulator from './sim/core';
import { Image, FontData } from './sim/image';
import Bit from './sim/Bit';

const AWS_COMPILE = true; //! Enable to have actual builds.

// Toggle options
const ENABLED = 1;
const DISABLED = 0;

const MONACO_WIDTH      = ["0", "80vw"];
const MONACO_HEIGHT     = ["0", "100vh"];
const CONSOLE_HEIGHT    = ["0", "95vh"];
const CONSOLE_WIDTH     = MONACO_WIDTH;
const SERIAL_LABEL      = ["Serial", "Editor"];

function App() {
    const [code, setCode] = useState('#include "MicroBit.h"\n\nMicroBit uBit;\n\nint main(){\n\tuBit.init();\n\n\twhile(1)\n\t\tuBit.display.scroll("Hello world!");\n}');
    const [consoleOut, setConsoleOut] = useState('');
    const [consoleInput, setConsoleInput] = useState('');
    const [editor, setEditor] = useState();
    const [monaco, setMonaco] = useState();
    const [editorWidth, setEditorWidth] = useState(MONACO_WIDTH[ENABLED]);
    const [consoleWidth, setConsoleWidth] = useState(CONSOLE_WIDTH[DISABLED]);
    const [editorHeight, setEditorHeight] = useState(MONACO_HEIGHT[ENABLED]);
    const [consoleHeight, setConsoleHeight] = useState(CONSOLE_HEIGHT[DISABLED]);

    const [fileName, setFileName] = useState("main");
    const [compiling, setCompiling] = useState(false);

    const [mbConnection, setMbConnection] = useState();
    const [serialButtonLabel, setSerialButtonLabel] = useState(SERIAL_LABEL[DISABLED]);

    const [ledMatrix, setLedMatrix] = useState(Array(5).fill(0).map(() => Array(5).fill(0)));

    const sim = new Simulator();

    //* Toasts
    const SuccessToast = (props, { closeToast, toastProps }) => (
        <div>
            <ImCheckmark/> {props.msg}
        </div>
    );
    const ErrorToast = (props, { closeToast, toastProps }) => (
        <div>
            <ImCross/> {props.msg}
        </div>
    );
    const InfoToast = (props, { closeToast, toastProps }) => (
        <div>
            <GrInProgress/> {props.msg}
        </div>
    );

    //* Import handling
    const [filesContent, errors, openFileSelector, loading] = useFilePicker({
        multiple: false,
        readAs: 'Text', // default: "Text", availible formats: "Text" | "BinaryString" | "ArrayBuffer" | "DataURL"
        accept: ['.cpp'],
    });
    
    useEffect(() => {
        if (filesContent.length !== 0) {
            const fileExt = filesContent[0]["name"].slice(-4);
            const nameInEditor = filesContent[0]["name"].slice(0, -4);
            if (fileExt === ".cpp"){
                setFileName(nameInEditor);
                setCode(filesContent[0]["content"]);

                const msg = "Loaded " + nameInEditor;
                toast.success(<SuccessToast msg={msg} />);
            }
            else {
                const msg = "Invalid file; only .cpp files are permitted.";
                toast.error(<ErrorToast msg={msg}/>);
            }
            
        }
    }, [filesContent]);

    //* Save handling
    const openFileSave = () => {
        var a = document.createElement("a");
        var file = new Blob([editor.getModel().getValue()], { type: "text/plain" });
        a.href = URL.createObjectURL(file);
        a.download = fileName + ".cpp";
        a.click();
    }

    const openProgramSave = (res) => { // response from AWS
        var a = document.createElement("a");
        var file = new Blob([res], { type: "application/octet-stream" });
        a.href = URL.createObjectURL(file);
        a.download = fileName + ".hex";
        a.click();
    }

    //* Compilation handling
    const attemptCompile = async () => {
        setCompiling(true);
        const msg = "Compilation started...";
        toast.info(<InfoToast msg={msg} />);
        
        const converted = await convert(editor.getModel().getValue());

        let compiledProgram;

        if (AWS_COMPILE) {
            const headers = {
                "Content-Type": "application/json",
                "X-Api-Key": "hDx5GMhFOq7gTuOqUIQXp1Gr8IBKfGrSMNTO2sS0"
            }
            
            await axios
                .post("https://ejnno1d6p3.execute-api.eu-west-2.amazonaws.com/build/codalbuild", converted, { headers: headers } )
                .then(res => {
                    toast.success(<SuccessToast msg="Compiled successfully." />);
                    
                    compiledProgram = JSON.parse(res.data.body);

                    setCompiling(false);
                })
                .catch(err => {
                    const msg = "Compilation failed: " + err;

                    setCompiling(false);
                    throw Error(msg);
                });
        }
        else {
            console.info('Skipping AWS compilation; returning a precompile.');
            setCompiling(false);
            return precompile
        }

        return compiledProgram;
    }
    const compileAndSave = () => {
        attemptCompile()
            .then(program => {
                openProgramSave(program["program"])
            })
            .catch(err => {
                toast.error(<ErrorToast msg={err.message} />, {autoClose: false});
            })
    }

    //* Editor setup
    const editorOptions = {
        fontSize: 18,
        scrollBeyondLastLine: false
    };
    const consoleOptions = {
        fontSize: 20,
        scrollBeyondLastLine: false,
        readOnly: true,
        lineNumbers: false,
        fontFamily: 'Cutive Mono'
    };
    const editorMount = (editor, monaco) => {
        setEditor(editor);
        setMonaco(monaco);
    };

    //* Editor resize
    useEffect(() => {
        const resizeEditor = () => {
            console.log("whaey");
            editor.layout();
        }

        window.addEventListener("resize", () => resizeEditor);
        return () => window.removeEventListener("resize", resizeEditor);
    }, [editor]);

    //* micro:bit USB connection
    const connectToMicroBit = () => {
        connectUSBDAPjs()
            .then(_mbCon => setMbConnection(_mbCon))
    }
    useEffectFirstChange(() => {
        if (mbConnection !== undefined) {
            console.log(mbConnection);

            mbConnection.connect()
                .catch(err => toast.error(<ErrorToast msg={err.message}/>, {autoClose: false}));
        }
    }, [mbConnection]);

    const attemptFlash = () => {
        if (mbConnection !== undefined) {
            attemptCompile()
                .then(program => {
                    mbConnection.flash(program["program"])
                })
        }
    }

    const toggleEditors = () => {
        if (editorWidth === MONACO_WIDTH[ENABLED]) { // Switch to console
            setConsoleWidth(CONSOLE_WIDTH[ENABLED]);
            setConsoleHeight(CONSOLE_HEIGHT[ENABLED]);

            setEditorWidth(MONACO_WIDTH[DISABLED]);
            setEditorHeight(MONACO_HEIGHT[DISABLED]);

            setSerialButtonLabel(SERIAL_LABEL[ENABLED]);
        }
        else { // Switch to editor
            setConsoleWidth(CONSOLE_WIDTH[DISABLED]);
            setConsoleHeight(CONSOLE_HEIGHT[DISABLED]);

            setEditorWidth(MONACO_WIDTH[ENABLED]);
            setEditorHeight(MONACO_HEIGHT[ENABLED]);

            setSerialButtonLabel(SERIAL_LABEL[DISABLED]);
        }
    }

    const attemptSerial = () => {
        if (mbConnection !== undefined) {
            if(!mbConnection.serialMode){
                mbConnection.startSerial();
                toggleEditors();

                mbConnection.dap.on(MicroBitConnection.SERIAL_EVENT, (data) => {
                    setConsoleOut(consoleOut + consoleOut === '' ? '':"\n" + data);
                });
            }
            else {    
                mbConnection.disconnectSerial();
                toggleEditors();
            }
        }
    }

    const serialSend = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (mbConnection !== undefined) {
            mbConnection.sendSerialMessage(consoleInput);
            setConsoleInput('');
        }
    }

    const tokenTest = () => {
        let test = "poo";
        let img = FontData.textToImage(test);
    }
    
    const audioTest = () => {
    }

    const startSimulator = () => {
        // Ensure that the display is bound
        if(!sim.handlers.display.isBound) {
            sim.handlers.display.bindDisplay(setLedMatrix);
        }

        sim.prepare(editor.getModel().getValue())
        .then(() => {
            sim.run();
        });
    }

    const updateMatrixTest = () => {
        let newLedMatrix = ledMatrix;
        newLedMatrix[2][3] = 0;
        setLedMatrix([...newLedMatrix]);
    }

    return (
        <>
            <div className="App">
                <Bit leds={ledMatrix}/>
                <div className="Editor">
                    <MonacoEditor 
                        theme="vs-dark"
                        width={editorWidth}
                        height={editorHeight}
                        language="cpp"
                        options={editorOptions}
                        value={code}
                        editorDidMount={editorMount}
                        onChange={(newValue, event) => setCode(newValue) }
                    />
                    <MonacoEditor
                        theme="vs-dark"
                        width={consoleWidth}
                        height={consoleHeight}
                        options={consoleOptions}
                        value={consoleOut}
                    />
                    <form onSubmit={serialSend}>
                        <input type="text" 
                            style={{
                                width: "79.8vmax",
                                height: "4.5vh",
                                margin: "none",
                                border: "none",
                                padding: "none",
                                display: "table-cell",
                                textAlign: "left",
                                fontFamily: "Cutive Mono",
                                color: "white",
                                backgroundColor: "black",
                                outline: "none"
                            }}
                            placeholder='Type what you want to send, and press Enter/Return.'
                            value={consoleInput}
                            onChange={(event) => setConsoleInput(event.target.value)}
                        />
                        <button type="submit" style={{display: 'none'}}></button>
                    </form>
                </div>
                <div className="Sidebar">
                    <div className="Header">
                        <a href="https://microbit.org" target="_blank" rel="noreferrer">
                            <img src={logo} className="Logo" alt="micro:bit logo" />
                        </a>
                        <p>C++ Editor</p>
                        <img alt = "" className="MicroBit" src="../res/mbit.png"></img>
                    </div>

                    <div className="Interaction">
                        <ButtonComponent 
                            cssClass='e-sidebar'
                            onClick={() => compileAndSave()} 
                            disabled={compiling}
                            title='Send your program to be compiled into a .hex.'
                        >
                            <ImCogs/> {compiling ? "Compiling..." : "Compile"}
                        </ButtonComponent>

                        <div className="Interaction-Row">
                            <ButtonComponent cssClass='e-sidebar' onClick={openFileSelector} title='Import a .cpp file.'>
                                <BiImport/> Import
                            </ButtonComponent>
                            <ButtonComponent cssClass='e-sidebar' onClick={openFileSave} title='Export this .cpp file.'>
                                <BiExport/> Export
                            </ButtonComponent>
                        </div>

                        <div className="Interaction-Row">
                            <ButtonComponent cssClass='e-sidebar' onClick={startSimulator} title='Run your code here before you flash it!'>
                                <FaPlay/> Run Code
                            </ButtonComponent>
                        </div>

                        <div className="Interaction-Break"></div>

                        <label className="sidebar-label">USB Options</label>
                        <ButtonComponent 
                            cssClass='e-sidebar-purple e-sidebar'
                            onClick={connectToMicroBit}
                            disabled={mbConnection!==undefined}
                            title='Connect to your micro:bit over USB.'
                        >
                            <RiUsbFill/> {mbConnection === undefined ? "Connect micro:bit" : "Connected"}
                        </ButtonComponent>
                        
                        <div className="Interaction-Row">
                            <ButtonComponent
                                cssClass='e-sidebar-purple e-sidebar'
                                disabled={mbConnection===undefined}
                                onClick={attemptFlash}
                                title='Compile and flash the program directly to your micro:bit.'
                            >
                                <RiFlashlightFill/> Flash
                            </ButtonComponent>

                            <ButtonComponent
                                cssClass='e-sidebar-purple e-sidebar'
                                disabled={mbConnection===undefined}
                                onClick={attemptSerial}
                                title='Open a serial console to your micro:bit.'
                            >
                                <FaPager/> {serialButtonLabel}
                            </ButtonComponent>
                        </div>
                    </div>

                    <div className="FileName">
                        <label className="sidebar-label">
                            File Name
                            <input type="text" value={fileName} onChange={(event) => setFileName(event.target.value)} />
                        </label>
                    </div>

                    <div className="Options">
                        <ButtonComponent cssClass='e-sidebar-dark' title='See editor options/settings.' onClick={tokenTest}>
                            <CgOptions/> Options
                        </ButtonComponent>

                        <ButtonComponent cssClass='e-sidebar-dark' title='Get additional help.' onClick={updateMatrixTest}>
                            <BiHelpCircle/> Help
                        </ButtonComponent>
                    </div>

                    <div className="Footer">
                        <a href="https://rneacy.dev" className="Me" target="_blank" rel="noreferrer">rneacy<GoLinkExternal /></a>
                    </div>
                    
                </div>
            </div>
            <div>
                <ToastContainer
                    position="bottom-center"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    transition={Zoom}
                />
            </div>
        </>
    );
}

export default App;
