import './css/App.css';
import logo_twitter from './img/twitter.jpg' // relative path to image 

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo_twitter} className="App-logo"/>
        <p>
          Twitter Tracker
        </p>
      </header>
    </div>
  );
}

export default App;
