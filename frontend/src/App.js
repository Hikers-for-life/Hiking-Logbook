import logo from './logo.svg';
import './App.css';
import Login from './components/loginPage.jsx';

function App() {
  return (
    <div className="App">
      <header className="App-header flex flex-col justify-center items-center bg-gray-800">
        <img src={logo} className="App-logo" alt="logo" />
        <p className="text-white">
          Edit <code>src/App.js</code> and save to reload.
        </p>

        <Login> </Login>
        <a
          className="App-link text-blue-400"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>

        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
        />
      </header>
    </div>
  );
}

export default App;
