import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header flex flex-col justify-center items-center bg-gray-800">
        <img src={logo} className="App-logo" alt="logo" />
        <p className="text-white">
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link text-blue-400"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
