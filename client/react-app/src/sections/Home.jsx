import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container-bg">
<div className="home-container">
      <h1>Welcome to PokeBattle!</h1>
      <p className='home-description'>
        Dive into the world of Pokemon card battles with this interactive game platform.
      </p>
      <div className="game-features">
        <h2>What You Can Do Here:</h2>
        <ul>
          <li>Build custom decks using our Deck Builder</li>
          <li>Battle against a CPU opponent</li>
          <li>Explore a vast collection of Pokemon cards</li>
        </ul>
      </div>
      <div className="game-info">
        <h2>About Pokemon Card Game</h2>
        <p>
          The Pokemon Trading Card Game is a collectible card game based on the
          popular Pokemon franchise. Players assume the role of Pokemon trainers,
          using their Pokemon cards to battle each other and win by defeating
          their opponent's Pokemon or by collecting prize cards.
        </p>
      </div>
      <div className="cta-buttons">
        <Link to="/deck-builder" className="btn btn-primary">
          Build Your Deck
        </Link>
        <Link to="/battle" className="btn btn-secondary">
          Start a Battle
        </Link>
      </div>
      <div className="api-info">
        <p>
          This game uses the PokeAPI to fetch accurate and up-to-date Pokemon card data,
          ensuring an authentic gaming experience.
        </p>
      </div>
    </div>
    </div>
  );
};

export default Home;