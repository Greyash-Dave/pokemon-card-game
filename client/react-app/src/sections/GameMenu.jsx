import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PokemonCard from "../components/PokemonCard";
import { usePokemon } from "../App";
import { useAuth } from '../AuthContext';
import useApiErrorHandler from './useApiErrorHandler';
import './GameMenu.css';

function GameMenu() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { fetchWithAuth } = useApiErrorHandler();
    
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

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchDeckNames();
    }, []);

    const fetchDeckNames = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}/deckdisplay/${user.username}`);
            const decklists = await response.json();
            setDeckNames(decklists.map(deck => deck.deck_name));
        } catch (error) {
            console.error('Failed to fetch deck names:', error);
        }
    };

    const fetchPokemonData = async (pokemonName) => {
        try {
            const response = await fetchWithAuth(`${API_URL}/pokemon/${pokemonName}`);
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch Pokemon ${pokemonName}:`, error);
            return null;
        }
    };

    async function fetchData2(deckList) {
        if (deckList.length > 0) {
            const newCardList = [];
            const cards = [];
            const datas = [];

            for (let pokemonName of deckList) {
                const data = await fetchPokemonData(pokemonName);
                if (data) {
                    datas.push(data);

                    const desc = "Type => | " + data.types.map(type => type.type.name).join(" | ");
                    cards.push(
                        <PokemonCard 
                            key={data.id}
                            width={20} 
                            pokemonData={data} 
                            pokemonDesc={desc} 
                        />
                    );

                    newCardList.push(
                        <div key={data.id} className="card-list">
                            <button className="cardbtn">
                                <img
                                    className="pokemoncard"
                                    src={data.sprites?.other?.['official-artwork']?.front_default}
                                    alt={`${data.name} official artwork`}
                                />
                            </button>
                        </div>
                    );
                }
            }
            
            setCardList(newCardList);
            setPokemonCards(cards);
            setPokemonDatas(datas);
        }
    }

    async function loadDeck(deckName) {
        try {
            const response = await fetchWithAuth(`${API_URL}/decklist/${user.username}/${deckName}`);
            const deck = await response.json();
            await fetchData2(deck.deck_list);
        } catch (error) {
            console.error('Failed to load deck:', error);
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
                        <select 
                            onChange={handleDeckNameChange} 
                            value={selectedDeckName}
                            className="deck-select"
                        >
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