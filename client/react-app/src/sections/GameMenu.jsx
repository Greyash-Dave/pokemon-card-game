import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PokemonCard from "../components/PokemonCard";
import { usePokemon } from "../App";
import { useAuth } from '../AuthContext';
import './GameMenu.css';

function GameMenu() {
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
        cardlist,
        setCardList,
    } = usePokemon();

    if (process.env.NODE_ENV === 'production' || import.meta.env.NODE_ENV === 'production') {
        var API_URL = import.meta.env.VITE_API_URL;
    } else {
        var API_URL = 'http://localhost:5000';
    }

    useEffect(() => {
        fetchDeckNames();
    }, []);

    const fetchDeckNames = async () => {
        try {
            const response = await fetch(`${API_URL}/deckdisplay/${user.username}`, {
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Failed to fetch deck names');
            }
            const decklists = await response.json();
            setDeckNames(decklists.map(deck => deck.deck_name));
        } catch (error) {
            console.error('Error fetching deck names:', error);
        }
    };

    async function fetchData2(deckList) {
        if (deckList.length > 0) {
            const newCardList = [];
            const cards = [];
            const datas = [];

            for (let pokemonName of deckList) {
                try {
                    const response = await fetch(`${API_URL}/pokemon/${pokemonName}`, {
                        credentials: 'include'
                    });
                    if (!response.ok) {
                        throw new Error("Could not fetch result");
                    }

                    const data = await response.json();
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
                                    alt={data.name}
                                />
                            </button>
                        </div>
                    );
                } catch (error) {
                    console.error('Error fetching Pokemon data:', error);
                }
            }
            setCardList(newCardList);
            setPokemonCards(cards);
            setPokemonDatas(datas);
        }
    }

    async function loadDeck(deckName) {
        try {
            const response = await fetch(`${API_URL}/decklist/${user.username}/${deckName}`, {
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Failed to load deck');
            }
            const deck = await response.json();
            await fetchData2(deck.deck_list);
        } catch (error) {
            console.error('Error loading deck:', error);
        }
    }

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

    return (
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
                        <button className="btn" onClick={handleLoadDeck}>Load</button>
                        <button className="btn" onClick={() => navigate('/battle')}>Battle</button>
                        <button className="btn" onClick={() => navigate('/deck-builder')}>Build Deck</button>
                    </div>
                </div>
                {cardlist.length > 0 && (
                    <div className="card-lists">
                        {cardlist}
                    </div>
                )}
            </div>
        </div>
    );
}

export default GameMenu;