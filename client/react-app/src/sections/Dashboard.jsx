import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import './Dashboard.css';

function Dashboard() {
  const [results, setResults] = useState([]);
  const [decks, setDecks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLoggedIn, user } = useAuth();

  // Use Vite's environment variable syntax
  if (process.env.NODE_ENV === 'production'|| import.meta.env.NODE_ENV === 'production') {
    var API_URL = import.meta.env.VITE_API_URL;
  }else{
    var API_URL = 'http://localhost:5000'
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoggedIn || !user) {
        setError('Please log in to view your dashboard.');
        setIsLoading(false);
        return;
      }

      try {
        // First verify authentication
        const authResponse = await fetch(`${API_URL}/check-auth`, {
          credentials: 'include'
        });
        const authData = await authResponse.json();
        
        if (!authData.isLoggedIn) {
          setError('Your session has expired. Please log in again.');
          setIsLoading(false);
          return;
        }

        // Fetch battle results with error handling for specific status codes
        const resultsResponse = await fetch(`${API_URL}/results/${user.username}`, {
          credentials: 'include'
        });
        
        if (resultsResponse.status === 401) {
          setError('Authentication required. Please log in again.');
          setIsLoading(false);
          return;
        }
        
        if (resultsResponse.status === 403) {
          setError('You are not authorized to view these results.');
          setIsLoading(false);
          return;
        }
        
        if (!resultsResponse.ok) {
          throw new Error(`Failed to fetch results: ${resultsResponse.statusText}`);
        }
        
        const resultsData = await resultsResponse.json();
        setResults(resultsData);

        // Fetch decks with similar error handling
        const decksResponse = await fetch(`${API_URL}/deckdisplay/${user.username}`, {
          credentials: 'include'
        });
        
        if (decksResponse.status === 401) {
          setError('Authentication required. Please log in again.');
          setIsLoading(false);
          return;
        }
        
        if (decksResponse.status === 403) {
          setError('You are not authorized to view these decks.');
          setIsLoading(false);
          return;
        }
        
        if (!decksResponse.ok) {
          throw new Error(`Failed to fetch decks: ${decksResponse.statusText}`);
        }
        
        const decksData = await decksResponse.json();
        setDecks(decksData);

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch data. Please try again.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn, user]);

  function getTopCards(deckList, cardStatus, topN = 1) {
    const statusWithIndex = cardStatus.map((status, index) => [index, status]);
    statusWithIndex.sort((a, b) => b[1] - a[1] || a[0] - b[0]);
    const topIndices = statusWithIndex.slice(0, topN).map(pair => pair[0]);
    return topIndices.map(index => deckList[index]);
  }

  if (isLoading) return (
    <div className="dashboard-body">
      <div className="dashboard">
        <h1>Loading...</h1>
      </div>
    </div>
  );

  if (error) return (
    <div className="dashboard-body">
      <div className="dashboard">
        <h1>Error</h1>
        <p className="dashboard__message">{error}</p>
      </div>
    </div>
  );

  if (!isLoggedIn) return (
    <div className="dashboard-body">
      <div className="dashboard">
        <h1>Welcome Guest</h1>
        <h1 className="dashboard__title">Please Login to View Dashboard</h1>
        <section className="dashboard__section battle-results">
          <h2 className="dashboard__section-title">Your Battle Results</h2>
          <p className="dashboard__message">No battle results yet.</p>
        </section>
        <section className="dashboard__section decks">
          <h2 className="dashboard__section-title">Your Decks</h2>
          <p className="dashboard__message">No decks created yet.</p>
        </section>
      </div>
    </div>
  );

  return (
    <div className="dashboard-body">
      <div className="dashboard">
        <h1>Welcome {user.username}</h1>
        <h1 className="dashboard__title">Welcome to Your Dashboard</h1>
        <section className="dashboard__section battle-results">
          <h2 className="dashboard__section-title">Your Battle Results</h2>
          {results.length > 0 ? (
            <ul className="dashboard__list">
              {results.map((result, index) => {
                const topCards = getTopCards(result.deck_list, result.card_contribution);
                return (
                  <li key={index} className="dashboard__list-item battle-results__item">
                    <div>
                      <strong>Deck:</strong> {result.deck_list.join(', ')}
                    </div>
                    <div>
                      <strong>Status:</strong> {result.status}
                    </div>
                    <div>
                      <strong>Top cards:</strong> {topCards.join(', ')}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="dashboard__message">No battle results yet.</p>
          )}
        </section>

        <section className="dashboard__section decks">
          <h2 className="dashboard__section-title">Your Decks</h2>
          {decks.length > 0 ? (
            <ul className="dashboard__list">
              {decks.map((deck, index) => (
                <li key={index} className="dashboard__list-item decks__item">
                  <strong>{deck.deck_name}:</strong> {deck.deck_list.join(', ')}
                </li>
              ))}
            </ul>
          ) : (
            <p className="dashboard__message">No decks created yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;