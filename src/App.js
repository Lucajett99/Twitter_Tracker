import './css/App.css';
import logo_twitter from './img/twitter.jpg' // relative path to image
import $ from 'jquery';


function App() {
  $.ajax({
    url: "https://api.twitter.com/2/tweets",
    data: {authorization : "Bearer $AAAAAAAAAAAAAAAAAAAAAMrVIwEAAAAAIzz71ZCU5cAtvPDMmFpOK0gWhDE%3DK1yPC7sVQGGs6xgYh0xnaWGKaFbljoaYmEqj6iaxVQyVRaxsQs"},
    success: function(response){
      console.log(response);
    },
  });

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
