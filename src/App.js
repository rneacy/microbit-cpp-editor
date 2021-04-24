import React from 'react';
import { useState, useEffect, useRef } from 'react';

import './App.css';
import logo from './res/logo.portrait.white.notxt.svg';

import { ToastContainer, toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { GoLinkExternal } from 'react-icons/go';
import { ImCogs, ImCheckmark, ImCross } from 'react-icons/im';
import { BiImport, BiExport, BiHelpCircle } from 'react-icons/bi';
import { CgOptions } from 'react-icons/cg';
import { GrInProgress } from 'react-icons/gr';

import axios from "axios";

import Popup from 'reactjs-popup';

import MonacoEditor from 'react-monaco-editor';

import { useFilePicker } from 'use-file-picker';

import { ButtonComponent } from '@syncfusion/ej2-react-buttons';

import convert from './Convert';

function App() {
    const [code, setCode] = useState('#include "MicroBit.h"\n\nMicroBit uBit;\n\nint main(){\n\tuBit.init();\n\n\twhile(1)\n\t\tuBit.display.scroll("Hello world!");\n}');
    const [editor, setEditor] = useState();
    const [monaco, setMonaco] = useState();
    const [fileName, setFileName] = useState("main");
    const [compiling, setCompiling] = useState(false);

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
        if (filesContent.length != 0) {
            const fileExt = filesContent[0]["name"].slice(-4);
            const nameInEditor = filesContent[0]["name"].slice(0, -4);
            if (fileExt == ".cpp"){
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
        a.download = "MICROBIT";
        a.click();
    }

    //* Compilation handling
    const startCompile = () => {
        setCompiling(true);
        const msg = "Compilation started...";
        toast(<InfoToast msg={msg} />);
        
        const converted = convert(code);

        const headers = {
            "Content-Type": "application/json",
            "X-Api-Key": "hDx5GMhFOq7gTuOqUIQXp1Gr8IBKfGrSMNTO2sS0"
        }
        
        axios
            .post("https://ejnno1d6p3.execute-api.eu-west-2.amazonaws.com/build/codalbuild", converted, { headers: headers} )
            .then(res => {
                toast.success(<SuccessToast msg="Compiled successfully." />);
                
                const compiledProgram = JSON.parse(res.data.body);

                openProgramSave(compiledProgram["program"]);
            })
            .catch(err => {
                const msg = "Compilation failed: " + err;
                toast.error(<ErrorToast msg={msg} />);
            });

        setCompiling(false);
    }

    //* Editor setup
    const editorOptions = {
        fontSize: 18,
        scrollBeyondLastLine: false
    }
    const editorMount = (editor, monaco) => {
        setEditor(editor);
        setMonaco(monaco);
    }

    //* Editor resize
    useEffect(() => {
        const resizeEditor = () => {
            console.log("whaey");
            editor.layout();
        }

        window.addEventListener("resize", () => resizeEditor);
        return () => window.removeEventListener("resize", resizeEditor);
    }, [editor]);

    return (
        <>
            <div className="App">
                <div className="Editor">
                    <MonacoEditor 
                        theme="vs-dark"
                        width="80vmax"
                        height="100vh"
                        language="cpp"
                        options={editorOptions}
                        value={code}
                        editorDidMount={editorMount}
                    />
                </div>
                <div className="Sidebar">
                    <div className="Header">
                        <a href="https://microbit.org" target="_blank" rel="noreferrer">
                            <img src={logo} className="Logo" alt="micro:bit logo" />
                        </a>
                        <p>C++ Editor</p>
                    </div>

                    <div className="Interaction">
                        <ButtonComponent cssClass='e-sidebar' onClick={startCompile}>
                            <ImCogs/> Compile
                        </ButtonComponent>
                        <div className="Interaction-Row">
                            <ButtonComponent cssClass='e-sidebar' onClick={openFileSelector}>
                                <BiImport/> Import
                            </ButtonComponent>
                            <ButtonComponent cssClass='e-sidebar' onClick={openFileSave}>
                                <BiExport/> Export
                            </ButtonComponent>
                        </div>
                        
                    </div>

                    <div className="FileName">
                        <label style={{color: 'black'}}>
                            File Name:
                            <input type="text" value={fileName} onChange={(event) => setFileName(event.target.value)} />
                        </label>
                    </div>

                    <div className="Options">
                        <ButtonComponent cssClass='e-sidebar-dark'>
                            <CgOptions/> Options
                        </ButtonComponent>

                        <ButtonComponent cssClass='e-sidebar-dark'>
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
            <div>

            </div>
        </>
    );
}

export default App;
