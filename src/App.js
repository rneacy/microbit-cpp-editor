import React from 'react';
import { useState, useEffect } from 'react';

import './App.css';
import logo from './res/logo.portrait.white.notxt.svg';

import { ToastContainer, toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { GoLinkExternal } from 'react-icons/go'
import { ImCogs, ImCheckmark, ImCross } from 'react-icons/im'
import { BiImport, BiExport } from 'react-icons/bi'

import MonacoEditor from 'react-monaco-editor';

import { useFilePicker } from 'use-file-picker';

import { ButtonComponent } from '@syncfusion/ej2-react-buttons'

import convert from './Convert'

function App() {
    const [code, setCode] = useState('#include "MicroBit.h"\n\nMicroBit uBit;\n\nint main(){\n\tuBit.init();\n\n\twhile(1)\n\t\tuBit.display.scroll("Hello world!");\n}');
    const [editor, setEditor] = useState();
    const [monaco, setMonaco] = useState();

    //* Import handling
    const [filesContent, errors, openFileSelector, loading] = useFilePicker({
        multiple: false,
        readAs: 'Text', // default: "Text", availible formats: "Text" | "BinaryString" | "ArrayBuffer" | "DataURL"
        accept: ['.cpp'],
    });
    const newFileToastMsg = ({ closeToast, toastProps }) => (
        <div>
            <ImCheckmark/> Loaded new file {filesContent[0]["name"]}
        </div>
    );
    const badFileToastMsg = ({ closeToast, toastProps }) => (
        <div>
            <ImCross/> Invalid file; only .cpp files are permitted.
        </div>
    );
    useEffect(() => {
        if (filesContent.length != 0) {
            if (filesContent[0]["name"].slice(-4) == ".cpp"){
                setCode(filesContent[0]["content"]);
                toast.success(newFileToastMsg);
            }
            else {
                toast.error(badFileToastMsg);
            }
            
        }
    }, [filesContent]);

    //* Save handling
    const openFileSave = () => {
        var a = document.createElement("a");
        var file = new Blob([editor.getModel().getValue()], { type: "text/plain" });
        a.href = URL.createObjectURL(file);
        a.download = "main.cpp"; // for now
        a.click();
    }

    //* Editor setup
    const editorOptions = {
        fontSize: 18
    }
    const editorMount = (editor, monaco) => {
        setEditor(editor);
        setMonaco(monaco);

        console.log(monaco);
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
                        <ButtonComponent cssClass='e-sidebar' onClick={() => convert(code)}>
                            <ImCogs/> Compile
                        </ButtonComponent>
                        <ButtonComponent cssClass='e-sidebar' onClick={openFileSelector}>
                            <BiExport/> Import
                        </ButtonComponent>
                        <ButtonComponent cssClass='e-sidebar' onClick={openFileSave}>
                            <BiImport/> Save
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
