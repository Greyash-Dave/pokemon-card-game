import React from "react";
import './Pokemoncard.css';

const PokemonCard = ({ width = 10, pokemonData, pokemonDesc }) => {
  const style = {
    '--max-width': `${width}rem`,   
  };

  console.log(width)

  function capitalizeWords(str) {
    const words = str.split(' ');
  
    const capitalizedWords = words.map(word => {
      if (word.length > 0) {
        return word[0].toUpperCase() + word.slice(1);
      } else {
        return '';
      }
    });
  
    const result = capitalizedWords.join(' ');
  
    return result;
  }

  if (!pokemonData || pokemonData=='') {
    return (<div>No Card ... </div>);
  }

  return (
    <div className="card" style={style}>
      <div className="pokemonCard">
        <div id="img" className="pokemonImage">
          <img
            src={pokemonData?.sprites?.other?.['official-artwork']?.front_default}
            alt="Pokemon Image"
          />
        </div>
        <div className="pokemonDetails">
          <div id="h1" className="pokemonName">
            <h1>{capitalizeWords(pokemonData.name)}</h1>
          </div>
          <div id="h3" className="pokemonDesc">
            <h2>{capitalizeWords(pokemonDesc)}</h2>
            <h3>Max HP:{pokemonData.stats[0].base_stat}&emsp;DEF:{pokemonData.stats[2].base_stat}</h3>
            <h3>ATK:{pokemonData.stats[1].base_stat}&emsp;SPD:{pokemonData.stats[5].base_stat}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;
