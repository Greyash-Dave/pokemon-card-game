import React, { createContext, useContext, useMemo, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DeckBuilder from './sections/DeckBuilder';
import GameMenu from './sections/GameMenu';
import BattleField from './sections/BattleField';
import Navbar from './sections/Navbar';
import Login from './sections/Login';
import Register from './sections/Register';
import Dashboard from './sections/Dashboard';
import Home from './sections/Home';
import { AuthProvider } from './AuthContext';
import './App.css';

const PokemonContext = createContext();

export const usePokemon = () => useContext(PokemonContext);

function App() {
    const [pokemonCards, setPokemonCards] = useState([]);
    const [pokemonDatas, setPokemonDatas] = useState([]);
    const [deckNames, setDeckNames] = useState([]);
    const [selectedDeckName, setSelectedDeckName] = useState("");
    const [pokemonData, setPokemonData] = useState(null);
    const [pokemonCard, setPokemonCard] = useState('');
    const [pokemonName, setPokemonName] = useState('');
    const [deckName, setDeckName] = useState('');
    const [cardlist, setCardList] = useState([]);
    const [remCard, setRemCard] = useState(false);
    const [inGame, setInGame] = useState(false);
    const [inGameMenu, setInGameMenu] = useState(true);

    const contextValue = useMemo(() => ({
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
    }), [
        pokemonCards, pokemonDatas, deckNames, selectedDeckName, 
        pokemonData, pokemonCard, pokemonName, deckName, 
        cardlist, remCard, inGame, inGameMenu
    ]);

    return (
        <AuthProvider>
            <PokemonContext.Provider value={contextValue}>
                <Router>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/deck-builder" element={<DeckBuilder />} />
                        <Route path="/game-menu" element={<GameMenu />} />
                        <Route path="/battle" element={<BattleField />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                    </Routes>
                </Router>
            </PokemonContext.Provider>
        </AuthProvider>
    );
}

export default App;