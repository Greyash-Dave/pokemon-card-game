import React, { useEffect, useRef, useState } from "react";
import PokemonCard from "../components/PokemonCard";
import BattleField from "./BattleField";

function Body(){

    const [pokemonData, setPokemonData] = useState(null);
    const [pokemonDesc, setPokemonDesc] = useState('');
    const [pokemonCard, setPokemonCard] = useState('');
    const [pokemonCards, setPokemonCards] = useState([]);
    const [pokemonDatas, setPokemonDatas] = useState([]);
    const [pokemonName, setPokemonName] = useState('');
    const [deckName, setDeckName] = useState('');
    const [cardlist, setCardList] = useState([]);
    const [remCard, setRemCard] = useState(false);
    const [inGame, setInGame] = useState(false);
    const [inGameMenu, setInGameMenu] = useState(true);
    
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
    }

    function handleRemove(key){
      setRemCard(key);
    };

    async function saveCards(){
      try {
        const body = {
            deck_name: deckName,
            deck_list: [
                pokemonDatas[0].name,
                pokemonDatas[1].name,
                pokemonDatas[2].name,
                pokemonDatas[3].name,
                pokemonDatas[4].name
            ]
        };
        
        const response = await fetch("http://localhost:5000/decklist", {
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
  // }

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
    

    async function fetchData(pokemonName) {
        if(pokemonName!==""){
        try {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
          if (!response.ok) {
            throw new Error("Could not fetch result");
          }
    
          const data = await response.json();
          setPokemonData(data);
    
          let desc = "Type => | ";
          data.types.forEach((type) => {
            desc += type.type.name + " | ";
          });
          setPokemonDesc(desc.trim());
          setPokemonCard(<PokemonCard width={20} pokemonData={data} pokemonDesc={desc.trim()} />)
        } catch (error) {
          console.log(error); 
        }
        }
      }

      function handleFinalize(){
        if(pokemonDatas.length===5){
          setInGame(true)
          // setCardList([])
          // setDeckList([])
          // setPokemonCards([])
          // setPokemonDatas([])
        }
        else{
          console.log(`Select ${5-pokemonDatas.length} more Cards To Start Battle`)
          alert(`Select ${5-pokemonDatas.length} more Cards To Start Battle`)
        }
      }

      const [deckNames, setDeckNames] = useState([]);
      const [selectedDeckName, setSelectedDeckName] = useState("");
      // const [deckList, setDeckList] = useState([]);
  
      // Fetch the list of deck names when the component mounts
      useEffect(() => {
          fetchDeckNames();
      }, []);

      async function fetchData2(deckList) {
        if (deckList.length > 0) {
          const newCardList = [];
          const cards = []
          const datas = []

          for (let pokemonName of deckList) {
            try {
              const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
              if (!response.ok) {
                throw new Error("Could not fetch result");
              }
    
              const data = await response.json();

              console.log(data)

              datas.push(data)
              
              let desc = "Type => | ";
              data.types.forEach((type) => {
                desc += type.type.name + " | ";
              });
              cards.push(<PokemonCard width={20} pokemonData={data} pokemonDesc={desc.trim()} />)

              newCardList.push(
                <div className="card-list">
                  <button className="cardbtn">
                    <img
                      className="pokemoncard"
                      src={data.sprites?.other?.['official-artwork']?.front_default}
                      alt="Pokemon Image"
                    />
                  </button>
                </div>
              )
            } catch (error) {
              console.log(error);
            }
          }
          setCardList(newCardList)
          setPokemonCards(cards)
          setPokemonDatas(datas)
          console.log(setCardList, setPokemonCards, setPokemonDatas)
        }
      }
      
  
      const fetchDeckNames = async () => {
          try {
              const response = await fetch('http://localhost:5000/deckdisplay');
              if (!response.ok) {
                  throw new Error('Network response was not ok ' + response.statusText);
              }
              const decklists = await response.json();
              setDeckNames(decklists.map(deck => deck.deck_name));
          } catch (error) {
              console.error('There has been a problem with your fetch operation:', error);
          }
      };
  
      async function loadDeck(deckName){
          try {
              const response = await fetch(`http://localhost:5000/decklist/${deckName}`);
              if (!response.ok) {
                  throw new Error('Network response was not ok ' + response.statusText);
              }
              const deck = await response.json();
              // setDeckList(deck.deck_list);
              console.log(deck.deck_list)
              fetchData2(deck.deck_list);
              console.log(selectedDeckName, deckList)
          } catch (error) {
              console.error('There has been a problem with your fetch operation:', error);
          }
      };

  
      const handleDeckNameChange = (event) => {
          setSelectedDeckName(event.target.value);
      };
  
      const handleLoadDeck = () => {
          // setCardList([])
          // setDeckList([])
          // setPokemonCards([])
          // setPokemonDatas([])
          if (selectedDeckName) {
              setCardList([])
              // setDeckList([])
              setPokemonCards([])
              setPokemonDatas([])
              loadDeck(selectedDeckName);
          }
      };
    

    return(
        (!inGame)?
        <>
        <div className="bg">
        <div className='pokemon--section'>
        <div className="page-title">
        <h1 className="t">Pokemon Deck Builder</h1>
        </div>
            <div className="pokemon--cardfield">
                <div className="pokemon--cards">
                    <h1 className="t2">Pokemon Card</h1>
                    <div>
                    {pokemonCard}
                    </div>
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
                              <div><button className="btn" onClick={handleFinalize}>Finalize</button></div>
                            </div>
                            </div>
                    </div>
                </div>
                <div>
                <h1>Deck List</h1>
                <div className="card-list">
                    {cardlist}
                </div>
                </div>
            </div>
        </div>
    </div>
    </>:
    inGameMenu?
    <>
 <div className="bg">
            <div className="game-menu">
                <div>
                    <div>
                    <select onChange={handleDeckNameChange} value={selectedDeckName}>
                        <option value="" disabled>Select a deck</option>
                        {deckNames.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                    </div>
                    <div>
                        <button className="btn" onClick={handleLoadDeck}>Load</button>
                    </div>
                    <div>
                        <button className="btn" onClick={() => setInGameMenu(false)}>Finalize</button>
                    </div>
                </div>
                <div className="card-list">
                    <h1>Deck List</h1>
                    {cardlist}
                </div>
            </div>
        </div>
    </>:
    <div className="bg">
    <BattleField />
    </div>
    )
}

export default Body