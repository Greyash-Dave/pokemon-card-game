import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PokemonCard from "../components/PokemonCard";
import { usePokemon } from "../App";
import { useAuth } from '../AuthContext'; // Adjust the import path as needed
import './GameMenu.css';


function GameMenu() {
    // const [pokemonCards, setPokemonCards] = useState([]);
    // const [pokemonDatas, setPokemonDatas] = useState([]);
    // const [deckNames, setDeckNames] = useState([]);
    // const [selectedDeckName, setSelectedDeckName] = useState("");
    // const [cardlist, setCardList] = useState([]);
    // const navigate = useNavigate();
    
    const { user } = useAuth(); 
    
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
    } = usePokemon(); 

    useEffect(() => {
        fetchDeckNames();
    }, []);

    // Use Vite's environment variable syntax
    if (process.env.NODE_ENV === 'production'|| import.meta.env.NODE_ENV === 'production') {
        var API_URL = import.meta.env.VITE_API_URL;
        }else{
        var API_URL = 'http://localhost:5000'
        }

    const fetchDeckNames = async () => {
        try {
            const response = await fetch(`${API_URL}/deckdisplay/${user.username}`);
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const decklists = await response.json();
            setDeckNames(decklists.map(deck => deck.deck_name));
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    };

    async function fetchData2(deckList) {
        if (deckList.length > 0) {
            const newCardList = [];
            const cards = [];
            const datas = [];

            for (let pokemonName of deckList) {
                try {
                    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
                    if (!response.ok) {
                        throw new Error("Could not fetch result");
                    }

                    const data = await response.json();

                    console.log(data);

                    datas.push(data);

                    let desc = "Type => | ";
                    data.types.forEach((type) => {
                        desc += type.type.name + " | ";
                    });
                    cards.push(<PokemonCard width={20} pokemonData={data} pokemonDesc={desc.trim()} />);

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
            setCardList(newCardList);
            setPokemonCards(cards);
            setPokemonDatas(datas);
            console.log(setCardList, setPokemonCards, setPokemonDatas);
        }
    }

    async function loadDeck(deckName) {
        try {
            const response = await fetch(`${API_URL}/decklist/${user.username}/${deckName}`);
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const deck = await response.json();
            console.log(deck.deck_list);
            fetchData2(deck.deck_list);
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    };

    const handleDeckNameChange = (event) => {
        setSelectedDeckName(event.target.value);
    };

    const handleLoadDeck = () => {
        if (selectedDeckName) {
            setCardList([]);
            setPokemonCards([]);
            setPokemonDatas([]);
            loadDeck(selectedDeckName);
        }
    };

    // function handleFinalize(){

    // // Only pass serializable data
    // const serializablePokemonDatas = pokemonDatas.map(pokemon => ({
    //     name: pokemon.name,
    //     types: pokemon.types.map(t => t.type.name).join(' | '),
    //     sprites: pokemon.sprites
    //     // Add any other necessary properties
    // }));
    // navigate('/deck-builder', { state: { setPokemonDatas} });
    // }

    return (
        <>
            <div className="gamemenu-bg">
                <div className="game-menu">
                    <div className="game-menu-container">
                    <h1>Deck List</h1>
                        <div>
                            <select onChange={handleDeckNameChange} value={selectedDeckName}>
                                <option value="" disabled>Select a deck</option>
                                {deckNames.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="game-menu-inputs">
                            <div>
                                <button className="btn" onClick={handleLoadDeck}>Load</button>
                            </div>
                            <div>
                                <button className="btn" onClick={() => navigate('/battle')}>Battle</button>
                            </div>
                            <div>
                                <button className="btn" onClick={() => navigate('/deck-builder')}>Build Deck</button>
                            </div>
                            </div>
                        </div>
                        {cardlist.length>0 && 
                        <div className="card-lists">
                        {cardlist}
                        </div>}
                </div>
            </div>
        </>
    )
}

export default GameMenu;
