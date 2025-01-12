import React, { useEffect, useRef, useState, useCallback } from "react";
import './Battlefield.css';
import PokemonCard from "../components/PokemonCard";
import Modal from "../components/Modal"
import HPBar from '../components/HPBar';
import { useAuth } from '../AuthContext';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from 'react-router-dom';
import { usePokemon } from "../App";

function BattleField(){

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

    // Use Vite's environment variable syntax
    if (process.env.NODE_ENV === 'production'|| import.meta.env.NODE_ENV === 'production') {
      var API_URL = import.meta.env.VITE_API_URL;
    }else{
      var API_URL = 'http://localhost:5000'
    }

  const carddatas = [ ...pokemonDatas];
//   const cards = [ ...pokemonCards];

  const [pressedButtonId, setPressedButtonId] = useState();
  const [playerField, setPlayerField] = useState(null);
  const [oponentField, setOponentField] = useState(0);
  const [oponentCards, setOponentCards] = useState([]);
  const [oppCardData, setOppCardData] = useState([]);
  const [curOpCardIndex, setCurOpCardIndex] = useState(0);
  const [oppHPs, setOppHPs] = useState([]);
  const [playerHPs, setPlayerHPs] = useState([]);
  const [turn, setTurn] = useState('p');
  const [cardStatus, setCardStatus] = useState([0, 0, 0, 0, 0]);
  const [oppCardStatus, setOppCardStatus] = useState([0, 0, 0, 0, 0]);
  const [inBattle, setInBattle] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState();
  const [modalDesc, setModalDesc] = useState();
  const [cardDisplay, setCardDisplay] = useState();
  const [cardDisplayCont, setCardDisplayCont] = useState();
  const [round, setRound] = useState([0, 0]);

  const [cond, setCond] = useState(0);

  const close = () => setModalOpen(false)
  const open =  () => setModalOpen(true)
  
  var pos = ['175px', '255px', '340px', '420px', '505px']
  var player_pos = ['590px', '58px']
  var p = [0, 1, 2, 3, 4]
  const cardElements = [];

  var pokemoncards = [...pokemonCards];

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const [isAnimating, setIsAnimating] = useState(false);
    const [animationTarget, setAnimationTarget] = useState(null);
    const [showAttackEffect, setShowAttackEffect] = useState(false);

    const playerFieldRef = useRef(null);
    const opponentFieldRef = useRef(null);

    const shakeAnimation = {
        x: [0, -5, 5, -5, 5, 0],
        transition: { duration: 0.4 }
    };

    const AttackEffect = ({ target }) => {
      return (
          <motion.div
              style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: target === 'opponent' ? 'flex-end' : 'flex-start',
                  top: target === 'opponent' ? '0' : '100%',
                  overflow: 'hidden',
              }}
          >
              {/* Energy burst */}
              <motion.div
                  initial={{ scaleX: 0, scaleY: 0, opacity: 0 }}
                  animate={{ scaleX: [0, 1.2, 0], scaleY: [0, 1.2, 0.1], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.4 }}
                  style={{
                      width: '100px',
                      height: '100%',
                      background: 'linear-gradient(90deg, rgba(255,69,0,1) 0%, rgba(255,0,0,1) 100%)',
                      boxShadow: '0 0 15px rgba(255,69,0,0.8), 0 0 30px rgba(255,69,0,0.8)',
                      transformOrigin: 'center',
                      borderRadius: '5px',
                      filter: 'blur(1px)',
                  }}
              />
              
              {/* Flash lines */}
              {/* <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: [0, 1.5, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  style={{
                      position: 'absolute',
                      width: '150px',
                      height: '2px',
                      background: 'linear-gradient(to right, rgba(255,255,255,0.8), rgba(255,0,0,0.5))',
                      top: target === 'opponent' ? '30%' : '70%',
                      transformOrigin: 'center',
                      boxShadow: '0 0 10px rgba(255,255,255,0.5)',
                  }}
              /> */}
  
              {/* Particle explosion */}
              {/* <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.6 }}
                  style={{
                      width: '80px',
                      height: '80px',
                      background: 'radial-gradient(circle, rgba(255, 0, 0, 1) 0%, rgba(255, 255, 0, 1) 50%, rgba(255, 165, 0, 1) 100%)',
                      clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                      boxShadow: '0 0 25px rgba(255, 69, 0, 0.6)',
                  }}
              /> */}
          </motion.div>
      );
  };
  

    const playerField_element = useCallback((remove) => {
        if (!remove) {
            return (
                <motion.div
                    ref={playerFieldRef}
                    className="cards"
                    style={{
                        top: `448px`,
                        left: `340px`,
                        width: '70px',
                        height: '100px',  
                        border: '1px white solid',
                        position: 'absolute'
                    }}
                    animate={
                        isAnimating && animationTarget === 'player' 
                            ? { y: -148 } // Move to just below the opponent card
                            : { y: 0 }
                    }
                    transition={{ duration: 0.3 }}
                >
                    <motion.button 
                        className="cardbtn"
                        animate={isAnimating && animationTarget === 'player' ? shakeAnimation : {}}
                    >
                        <img
                            className="pokemoncard"
                            src={carddatas[pressedButtonId]?.sprites?.other?.showdown?.front_default}
                            alt="Pokemon Image"
                        />
                    </motion.button>
                </motion.div>
            );
        }
        return null;
    }, [carddatas, pressedButtonId, isAnimating, animationTarget, showAttackEffect]);

    useEffect(() => {
        if (oponentCards != 0) {
            let oponentField_element = <></>

            if (oppCardData.length > 0 && inBattle) {
                oponentField_element = (
                    <motion.div
                        ref={opponentFieldRef}
                        className="cards"
                        style={{
                            top: `200px`,
                            left: `340px`,
                            width: '70px',
                            height: '100px',
                            border: '1px white solid',
                            position: 'absolute'
                        }}
                        animate={
                            isAnimating && animationTarget === 'opponent' 
                                ? { y: 148 } // Move to just above the player card
                                : { y: 0 }
                        }
                        transition={{ duration: 0.3 }}
                    >
                        <motion.button 
                            className="cardbtn"
                            animate={isAnimating && animationTarget === 'opponent' ? shakeAnimation : {}}
                        >
                            <img
                                className="pokemoncard"
                                src={oppCardData[0] ? oppCardData[curOpCardIndex].cardData.sprites.other.showdown.front_default : "./src/images/logo-pokeball.png"}
                                alt="Pokemon Image"
                            />
                        </motion.button>
                        {showAttackEffect && animationTarget === 'opponent' && <AttackEffect target="player" />}
                        {pressedButtonId && showAttackEffect && animationTarget === 'player' && <AttackEffect target="opponent" />}

                    </motion.div>
                )
            }

            handleUpdateHPs();
            setOponentField(oponentField_element)
        }
    }, [oppCardData, curOpCardIndex, inBattle, isAnimating, animationTarget, showAttackEffect]);

    function attackCard() {
        setIsAnimating(true);
        setAnimationTarget('player');
        setTimeout(() => {
            setShowAttackEffect(true);
            setTimeout(() => {
                setShowAttackEffect(false);
                setIsAnimating(false);
                setAnimationTarget(null);
                attack('p');
            }, 500);
        }, 300); // This delay should match the duration of the card movement animation
    }

    function defendCard() {
        setIsAnimating(true);
        setAnimationTarget('opponent');
        setTimeout(() => {
            setShowAttackEffect(true);
            setTimeout(() => {
                setShowAttackEffect(false);
                setIsAnimating(false);
                setAnimationTarget(null);
                attack('o');
            }, 500);
        }, 300); // This delay should match the duration of the card movement animation
    }

  function handleButtonClick(key){
    setPressedButtonId(key);
  };

  function placeCards(carddatas, type) {

      for (let i = 0; i < 5; i++) {

        var position = {
          top: `${player_pos[type-1]}`,
          left: `${pos[i]}`,
          width: '70px',
          height: '100px',
          border: '1px white solid',
          position: 'absolute'
          };

        if (i < carddatas.length && type == 1) {

          cardElements.push(
              <div className="cards"
                  style={position}>
              <button className="cardbtn" onClick={() => handleButtonClick(i)}>
              <img
                  key={i}
                  className="pokemoncard"
                  src={carddatas[i]?.sprites?.other?.['official-artwork']?.front_default}
                  alt="Pokemon Image"
              />
              </button>
              </div>
          );
        } else {

          cardElements.push(
              <div className="cards"
              style={position}>
              <button className="cardbtn">
              <img
                  key={i}
                  className="pokemoncard"
                  src="./src/images/logo-pokeball.png"
                  alt="Pokemon Image"
              />
              </button>
              </div>
          );
        }
      }
    
      return cardElements;
    }

    async function fetchData(num) {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${num}`);
        if (!response.ok) {
          throw new Error("Could not fetch result");
        }
  
        const data = await response.json();
  
        let desc = "Type => | ";
        data.types.forEach((type) => {
          desc += type.type.name + " | ";
        });
  
        return {
          cardData: data,
          cardDesc: desc.trim(),
        };
      } catch (error) {
        console.log(error);
        return null;
      }
    }

    
  function  handleUpdateHPs(){

    console.log(oppHPs)

  }

  async function fetchAllData(){
      const promises = [];
      var limit = 500 
      for (let i = 1; i <= 5; i++) {
        promises.push(fetchData(Math.floor(Math.random() * limit)));
      }

      const results = await Promise.all(promises);
      const validResults = results.filter(result => result !== null);

      var validResults_c = validResults
      var validResults_cc = validResults_c

      setOppCardData(validResults_c);

      setOppHPs(validResults_cc.map(data => (
        data.cardData.stats[0].base_stat
      ))
      );


      setOponentCards(validResults.map(result => (
        <PokemonCard width={20} pokemonData={result.cardData} pokemonDesc={result.cardDesc} />
      )));

    };

    useEffect(() => {
    if (oponentCards!=0)
      {
        console.log("there")

        let oponentField_element = <></>

        if (oppCardData.length > 0 && inBattle){
          oponentField_element = 
          <div className="cards"
          style={{
          top: `200px`,
          left: `340px`,
          width: '70px',
          height: '100px',
          border: '1px white solid',
          position: 'absolute'
          }}>
          <button className="cardbtn">
          <img
            className="pokemoncard"
            src={oppCardData[0]? oppCardData[curOpCardIndex].cardData.sprites.other.showdown.front_default : "./src/images/logo-pokeball.png"}
            alt="Pokemon Image"
          />
          </button>
          </div>
        }

        handleUpdateHPs();
        setOponentField(oponentField_element)
        console.log(oppCardData.length)
      }
     }, [oppCardData, curOpCardIndex, inBattle]);
     useEffect(() => {
      if (pressedButtonId != null && inBattle) {
        setPlayerField(playerField_element(false));
      } else {
        setPlayerField(playerField_element(true));
      }
    }, [pressedButtonId, inBattle, playerField_element]);

     function handleStart(){
      // console.log("Cards:"+pokemoncards.length)
        setCond(1)
        setInBattle(true)
        setCurOpCardIndex(0)
        setTurn('p')
        playerUpdateHPs()
        setRound([0, 0])
    }
  
    async function handleEnd(res, status, oppstatus) {
      setCond(0);
      setOppCardData([]);
      fetchAllData();
      setInBattle(false);
      setPressedButtonId(null);
  
      try {
          const body = {
              player: user.username,
              deck_list: [
                  carddatas[0].name,
                  carddatas[1].name,
                  carddatas[2].name,
                  carddatas[3].name,
                  carddatas[4].name
              ],
              card_contribution: status,
              status: res
          };
          
          const response = await fetch(`${API_URL}/result`, {
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

      try {
        const body = {
            player: "opponent",
            deck_list: [
                oppCardData[0].cardData.name,
                oppCardData[1].cardData.name,
                oppCardData[2].cardData.name,
                oppCardData[3].cardData.name,
                oppCardData[4].cardData.name
            ],
            card_contribution: oppstatus,
            status: res == "win"? "lose":"win"
        };
        
        const response = await fetch(`${API_URL}/result`, {
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
  
      setCardStatus([0, 0, 0, 0, 0]);
      setOppCardStatus([0, 0, 0, 0, 0]);
  }

  function handleRound(player){
    var currRound = round
    if (player == 'p'){
      currRound[0] += 1
    }
    if (player == 'o'){
      currRound[1] += 1
    }
    setRound(currRound)
    // setOppCardData([]);
    // fetchAllData();
    setPressedButtonId(null)
    setCurOpCardIndex(0)
    setTurn('p')
    playerUpdateHPs()
    oppUpdateHPs()
  }

  const playerUpdateHPs = () => {
    setPlayerHPs(() => {
      // const slicedData = carddatas.slice(1, 6);
      const newHPs = carddatas.map(data => data.stats[0].base_stat);
      return [...newHPs];
    });
  };
  
  const oppUpdateHPs = () => {
    setOppHPs(() => {
      const newHPs = oppCardData.map(data => data.cardData.stats[0].base_stat);
      return [...newHPs];
    });
  };
  
    function attack(player){
  
        if (player =='p' && playerHPs[pressedButtonId] > 0){
          // console.log(oppCardData[curOpCardIndex].cardData)
  
          var playatk = carddatas[pressedButtonId].stats[1].base_stat
          var opphp =  oppHPs[curOpCardIndex]
          var oppdef = oppCardData[curOpCardIndex].cardData.stats[2].base_stat
          var damage = playatk - oppdef
          if (damage>0){
            var newOppHp = opphp - damage;
            if (newOppHp <= 0){
              newOppHp = 0
            }
          }
          else{
            var newOppHp = opphp
          }
  
          var newOppHPs = [...oppHPs];
          newOppHPs[curOpCardIndex] = newOppHp;
  
          // console.log(newOppHPs)
          setOppHPs([...newOppHPs]);
  
          if (newOppHp <= 0){
            let status = [...cardStatus];
            status[pressedButtonId] += 1;
            setCardStatus(status)

            if (curOpCardIndex==4){
              if (round[0]==2){
                setModalText("You Won!")
                handleEnd("win", status, oppCardStatus)

                const getMVP = (carddatas, status) => {
                  const maxStatus = Math.max(...status);
                  const mvpIndices = status.map((value, index) => value === maxStatus ? index : -1).filter(index => index !== -1);
                  const mvpNames = mvpIndices.map(index => capitalizeFirstLetter(carddatas[index].name));
                  return mvpNames.join(', ');
                };
            
                const mvpNames = getMVP(carddatas, status);
                
                let desc = 
                  <div className="modal_result">
                    <h1 className="modal-text">You Won!</h1>
                    <h2 className="modal-text2">Result</h2>
                    <div className="modal-desc">
                        {carddatas.map((card, index) => (
                            <div key={index}>
                                <h3>{capitalizeFirstLetter(card.name)}:</h3>
                                <p>Defeated {status[index]} Pokemon{status[index] > 1 ? 's' : ''}</p>
                            </div>
                        ))}
                        <div>
                            <h3>MVP: <p>{mvpNames}</p></h3>
                        </div>
                    </div>
                  </div>
      
                  setModalDesc(desc)
                  console.log(desc)
                  setModalOpen(true)
              }
              else{
                handleRound('p')
              }
            }
            else{
              setCurOpCardIndex(() => curOpCardIndex+1)
            }
          }
          setTurn('o')
  
        }
  
        if (player =='o' && playerHPs[pressedButtonId] > 0 ){
          // console.log(oppCardData[curOpCardIndex].cardData)
  
          var oppatk = oppCardData[curOpCardIndex].cardData.stats[1].base_stat
          var playerhp =  playerHPs[pressedButtonId]
          var playerdef = carddatas[pressedButtonId].stats[2].base_stat
          var damage = oppatk - playerdef
          if (damage>0){
            var newPlayerHp = playerhp - damage;
            if (newPlayerHp <= 0){
              newPlayerHp = 0
              let oppstatus = [...oppCardStatus];
              oppstatus[curOpCardIndex] += 1;
              setOppCardStatus(oppstatus)
              console.log(oppstatus)
            }
          }
          else{
            var newPlayerHp = playerhp
          }
  
          var newPlayerHPs = [...playerHPs];
          newPlayerHPs[pressedButtonId] = newPlayerHp;
  
          // console.log(newPlayerHPs)
          setPlayerHPs(newPlayerHPs);
  
          // console.log(playatk)
          // console.log(opphp)
          // console.log(oppHPs)
          // console.log(playerHPs)
  
          if (newPlayerHPs.every(hp => hp === 0)) {
              if (round[1]==2){
                setModalText('You lost!')
                handleEnd("lose", cardStatus, oppCardStatus)
                
                let desc = 
                  <div className="modal_result">
                    <h1 className="modal-text">You Lost!</h1>
                    <h2 className="modal-text2">Result</h2>
                    <div className="modal-desc">
                        {carddatas.map((card, index) => (
                            <div key={index}>
                                <h3>{capitalizeFirstLetter(card.name)}:</h3>
                                <p>Defeated {cardStatus[index]} Pokemon{cardStatus[index] > 1 ? 's' : ''}</p>
                            </div>
                        ))}
                    </div>
                  </div>
                  setModalDesc(desc)
                  console.log(desc)
                  setModalOpen(true)
              }
              else{
                handleRound('o')
              }
          }else{
            setTurn('p')
          }
  
        }
  
        if (playerHPs[pressedButtonId] <= 0){
          alert("Change Onfield Card")
        }
  
    }
  
    // function attackCard(){
    //   attack(turn)
    // }
  
    // function defendCard(){
    //   attack(turn)
    // }

    function handleBack(){
      if(!inBattle){
        setInGame(false)
        setInGameMenu(true)
        navigate('/');
      }
    }

    useEffect(() => {
      fetchAllData()
    }, [])

    // useEffect(() => {
    //   var cont =
    //   <div className="ui2">
    //   <div className="opp-field">
    //   <h1>Opponent Onfield Card</h1>
    //   <div>HP: {oppHPs[curOpCardIndex]}</div>
    //   <div>{oponentCards[curOpCardIndex]}</div>
    //   </div>
    //   <div className="player-field">
    //   <h1>Player Onfield Card</h1>
    //   <div>HP: {playerHPs[pressedButtonId]}</div>
    //   <div>{pokemoncards[pressedButtonId]}</div>
    //   </div>
    //   </div>

    //   setCardDisplayCont(cont)
    
    // }, [curOpCardIndex, pressedButtonId, cardDisplay])
    
    

    useEffect(() => {
      console.log(turn)
      console.log(oppHPs)
      console.log(playerHPs)
      console.log(cardStatus)
      console.log(carddatas)
  
    }, [oppHPs, playerHPs])     

  return(
    <>
      {/* {pokemoncards[0]} */}
      {/* <div className="page-title">
      <h1 className="t">Pokemon Battle Field</h1>
      <div><img className="back-button-img" src='./src/images/back-button.svg' onClick={handleBack} ></img></div>
      </div> */}
      <div className="battlefield-section">
        <div className="battlefield-container">
          <div className="opp-field">
            {inBattle && oppCardData[curOpCardIndex] && 
            <div className="of-items">
              <div><HPBar maxHP={oppCardData[curOpCardIndex].cardData?.stats[0]?.base_stat} currentHP={oppHPs[curOpCardIndex]} /></div>
              <div>{oponentCards[curOpCardIndex]}</div>
            </div>}
          </div>
          <div className="battlefield">
                <img className="bg-image" src="./src/images/pokemon_battlefield.png" alt="bg" />
                {placeCards(carddatas, 1)}
                {placeCards(carddatas, 2)}
                {playerField}
                {oponentField}
                <div className="back-button"><img className="back-button-img" src='./src/images/back-button.svg' onClick={handleBack} ></img><div>Exit</div></div>
                {(cond === 1) ?   
                    <>
                        <div className="bfui">
                            <div className="ui">
                                {turn === 'p' ? 
                                    <div><button className="selectbtn" onClick={attackCard}>Attack</button></div> :
                                    <div><button className="selectbtn" onClick={defendCard}>Defend</button></div>
                                }
                                <div><button className="selectbtn" onClick={handleEnd}>End</button></div>
                            </div>
                        </div>
                    </> :
                    <>
                        <div className="bfui">
                            <div className="ui"><button className="selectbtn" onClick={handleStart}>Start</button></div>
                        </div>
                    </>
                }
            </div>
          {inBattle &&       
            <div className="round-details">
            <div className="round-title">
              <h1>Round {round[0] + round[1] + 1}</h1>
            </div>
            <div className="round-players">
              <h1>You {round[0]} : Opp {round[1]}</h1>
            </div>
          </div>
          }
          <div className="player-field">
        {inBattle && pressedButtonId>=0 &&          
        <div className="pf-items">
            <div>{inBattle? <HPBar maxHP={carddatas[pressedButtonId]?.stats[0]?.base_stat} currentHP={playerHPs[pressedButtonId]} />:''}</div>
            <div>{inBattle && pokemoncards[pressedButtonId]}</div>
          </div>}
          </div>
        </div>
      </div>
      <AnimatePresence
        initial={false}
        mode="wait"
      >
        {modalOpen && <Modal handleClose={close} cont={modalDesc}/>}
      </AnimatePresence>
    </>
  )
}

export default BattleField;