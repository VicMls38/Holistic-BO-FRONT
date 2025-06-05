import React from 'react';
import Navbar from '../components/Navbar';
import '../css/home.css';

const Home: React.FC = () => {
  

  return (
    <div className="container">
      <Navbar />
      <main className="main">
        <h1 className="title">Bienvenue !</h1>
        
      </main>
    </div>
  );
};

export default Home;
