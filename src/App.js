import './App.css';
import logo from './res/logo.portrait.white.notxt.svg';

import MonacoEditor from 'react-monaco-editor';

const editorOptions = {
  fontSize: 18
}

function App() {
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
          />
        </div>
        <div className="Sidebar">
          <img src={logo} className="Logo" />
          <p>C++ Editor</p>
        </div>
      </div>
    </>
  );
}

export default App;
