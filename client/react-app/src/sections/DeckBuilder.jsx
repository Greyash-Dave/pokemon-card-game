import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import PokemonCard from "../components/PokemonCard";
import { usePokemon } from "../App"; 
import { useAuth } from '../AuthContext'; // Adjust the import path as needed

import './DeckBuilder.css';


function DeckBuilder() {
    // const [pokemonData, setPokemonData] = useState(null);
    // const [pokemonCard, setPokemonCard] = useState('');
    // const [pokemonName, setPokemonName] = useState('');
    // const [deckName, setDeckName] = useState('');
    // const [cardlist, setCardList] = useState([]);
    // const [remCard, setRemCard] = useState(false);
    // const navigate = useNavigate();
    
    const { user } = useAuth(); 
    const [ isDisplay, setIsDisplay ] = useState(false);

    const navigate = useNavigate();

    const {
      pokemonCards,
      setPokemonCards,
      pokemonDatas,
      setPokemonDatas,
      deckNames,
      setDeckNames,
      selectedDeckName,
      setSelectedDeckName,
      pokemonData,
      setPokemonData,
      pokemonCard,
      setPokemonCard,
      pokemonName,
      setPokemonName,
      deckName,
      setDeckName,
      cardlist,
      setCardList,
      remCard,
      setRemCard,
      inGame,
      setInGame,
      inGameMenu,
      setInGameMenu
  } = usePokemon();  // Destructure the context values

    // Use Vite's environment variable syntax
    if (process.env.NODE_ENV === 'production'|| import.meta.env.NODE_ENV === 'production') {
      var API_URL = import.meta.env.VITE_API_URL;
    }else{
      var API_URL = 'http://localhost:5000'
    }

    var API_URL = 'http://localhost:5000'

    var name = '';
    var index = 0;

    function handleChange(event) {
        name = event.target.value
        setPokemonName(name.replace(/\s+/g, '').toLowerCase())
      }
  
      function handleChange2(event) {
        name = event.target.value
        setDeckName(name.replace(/\s+/g, '').toLowerCase())
      } 
  
      function addCard() {
          setPokemonCards([ ... pokemonCards, pokemonCard])
          setPokemonDatas([ ... pokemonDatas, pokemonData])
          setIsDisplay(true)
          pokemonCards.forEach(element => {
              console.log(element)
          });
        }
  
        function removeCards() {
          if(!inGame){
            setPokemonCards([])
            setPokemonDatas([])
          }
        }
  
        function removeCard() {
          if(!inGame && remCard !== false){
            console.log(remCard)
            let cardlist = [...pokemonDatas]
            let cards = [...pokemonCards]
            cardlist.splice(remCard, 1);
            cards.splice(remCard, 1);
            setPokemonDatas(cardlist);
            setPokemonCards(cards);
            setRemCard(false)
          }
        }
      
      function handleSelect() {
          fetchData(pokemonName); 
          setIsDisplay(false)
      }
  
      function handleRemove(key){
        setRemCard(key);
      };
  
      async function saveCards(){
        try {
          const body = {
              user_name: user.username,
              deck_name: deckName,
              deck_list: [
                  pokemonDatas[0].name,
                  pokemonDatas[1].name,
                  pokemonDatas[2].name,
                  pokemonDatas[3].name,
                  pokemonDatas[4].name
              ]
          };
          
          const response = await fetch(`${API_URL}/decklist`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body)
          });
  
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const result = await response.json();
          console.log("Response:", result);
      } catch (err) {
          console.error("Fetch error:", err);
      }
      }
  
    //   async function loadDeck() {
    //     try {
    //         const response = await fetch('http://localhost:5000/deckdisplay');
    //         if (!response.ok) {
    //             throw new Error('Network response was not ok ' + response.statusText);
    //         }
    //         const decklists = await response.json();
    //         setCardList(decklists);
    //     } catch (error) {
    //         console.error('There has been a problem with your fetch operation:', error);
    //     }
    // }'

    useEffect(() => {
      var cl = [...pokemonDatas]

      for (let i = 0; i < cl.length; i++) {
        cl[i] = 
          <div className="card-list">
              <button className="cardbtn" onClick={() => handleRemove(i)}>
                  <img
                      className="pokemoncard"
                      src={cl[i]?.sprites?.other?.['official-artwork']?.front_default}
                      alt="Pokemon Image"
                  />
              </button>
          </div>
      }
      
      setCardList(cl);
    

    }, [pokemonDatas])
      
  
      // async function fetchData(pokemonName) {
      //     if(pokemonName!==""){
      //     try {
      //       const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
      //       if (!response.ok) {
      //         throw new Error("Could not fetch result");
      //       }
      
      //       const data = await response.json();
      //       setPokemonData(data);
      
      //       let desc = "Type => | ";
      //       data.types.forEach((type) => {
      //         desc += type.type.name + " | ";
      //       });
      //       setPokemonCard(<PokemonCard width={20} pokemonData={data} pokemonDesc={desc.trim()} />)
      //     } catch (error) {
      //       console.log(error); 
      //     }
      //     }
      //   }
    
      async function fetchData(pokemonName) {
        if (pokemonName !== "") {
            try {
                // First, try to fetch from our local server (which will check the database)
                const serverResponse = await fetch(`${API_URL}/pokemon/${pokemonName}`);
                if (!serverResponse.ok) {
                    throw new Error("Could not fetch result from server");
                }
    
                const data = await serverResponse.json();
                setPokemonData(data);
    
                let desc = "Type => | ";
                data.types.forEach((type) => {
                    desc += type.type.name + " | ";
                });
                setPokemonCard(<PokemonCard width={20} pokemonData={data} pokemonDesc={desc.trim()} />)
            } catch (error) {
                console.log("Error fetching data:", error);
                // If there's an error, we don't need to do anything here as the server
                // should have already tried both the database and PokeAPI
            }
        }
    }

    function handleBack(){
        navigate('/');
    }

    return (
      <div className="bg">
      <div className='pokemon--section'>
          <div className="pokemon--cardfield">
              <div className="pokemon--cards">
              <h1 className="t">Pokemon Deck Builder</h1>
                  <div className='pokemon--input'>
                          <div className="pokemon-input-form">
                          <div><h2>Search: <input type='text' name='pokemonName' onChange={handleChange}></input></h2></div>
                          <div><h2>Deck Name: <input type='text' name='pokemonName' onChange={handleChange2}></input></h2></div>
                          <div className="btns">
                            <div><button className="btn" onClick={handleSelect}>Select</button></div>
                            <div><button className="btn" onClick={addCard}>Add</button></div>
                            <div><button className="btn" onClick={removeCard}>Remove</button></div>
                            <div><button className="btn" onClick={removeCards}>Reset</button></div>
                            <div><button className="btn" onClick={saveCards}>Save</button></div>
                            <div><button className="btn" onClick={handleBack}>Back</button></div>
                          </div>
                          </div>
                  </div>
              </div>
              {pokemonData &&
                <>
              <div className="card-list-container">
                {!isDisplay && <div>
                  <h1>Selected Card</h1>
                      <div>
                      {pokemonCard}
                      </div>
                </div>}
              {cardlist.length >0 && isDisplay &&
              <>
              <div>
              <h1>Deck List</h1>
                <div className="card-lists">
                    {cardlist}
                </div>
              </div>
              </>}
              </div>
              </>
              }
          </div>
      </div>
  </div>
    )
}

export default DeckBuilder;