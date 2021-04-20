import './App.css';
import logo from './res/logo.portrait.white.notxt.svg';

import MonacoEditor from 'react-monaco-editor';
import React from 'react';
import { useState, useEffect } from 'react';

import { useFilePicker } from 'use-file-picker';

import { ButtonComponent } from '@syncfusion/ej2-react-buttons'

import convert from './Convert'

function App() {
  const [code, setCode] = useState('#include "MicroBit.h"\n\nMicroBit uBit;\n\nint main(){\n\tuBit.init();\n\n\twhile(1)\n\t\tuBit.display.scroll("Hello world!");\n}');

  const [filesContent, errors, openFileSelector, loading] = useFilePicker({
    multiple: false,
    readAs: 'Text', // default: "Text", availible formats: "Text" | "BinaryString" | "ArrayBuffer" | "DataURL"
    accept: ['.cpp'],
  });

  const editorOptions = {
    fontSize: 18
  }

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
          />
        </div>
        <div className="Sidebar">
          <div className="Header">
            <img src={logo} className="Logo" alt="micro:bit logo" />
            <p>C++ Editor</p>
          </div>

          <div className="Interaction">
            <ButtonComponent cssClass='e-info' onClick={() => convert(code)}>
              Compile
            </ButtonComponent>
            <ButtonComponent cssClass='e-info' onClick={openFileSelector}>
              Import
            </ButtonComponent>
            <ButtonComponent cssClass='e-info'>
              Save
            </ButtonComponent>
          </div>
          
        </div>
      </div>
    </>
  );
}

export default App;
