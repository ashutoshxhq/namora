import React from 'react';
import './Popup.css';
import Button from '../../conponents/atoms/Button';

const Popup = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={"/icon-128.png"} className="App-logo" alt="logo" />
        <p>
          Welcome to Namora AI
        </p>
        <Button />
      </header>
    </div>
  );
};

export default Popup;
