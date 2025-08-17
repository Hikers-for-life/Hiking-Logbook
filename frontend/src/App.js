import logo from './logo.svg';
import './App.css';
import LoginPage from './components/loginPage.jsx';

function App() {
  return (
    <div className="App">
      <header className="App-header flex flex-col justify-center items-center bg-gray-800">
        <img src={logo} className="App-logo" alt="logo" />
        <p className="text-white">
          Edit <code>src/App.js</code> and save to reload.
        </p>

        <div>
          <LoginPage></LoginPage>
        </div>
       
      <div>
        <LoginPage/>
      </div>
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
