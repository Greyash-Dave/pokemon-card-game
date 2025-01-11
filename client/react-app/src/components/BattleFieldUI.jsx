import React, { useEffect, useRef, useState } from "react";
import './battlefield.css';

function BattleFieldUI({carddatas, oppCardData, setOppCardData, pokemoncards, pressedButtonId, setPlayerField, cond, setCond, curOpCardIndex, setCurOpCardIndex, oponentCards, oppHPs, setOppHPs}){

  const [playerHPs, setPlayerHPs] = useState([]);
  const [turn, setTurn] = useState('p');
  const [cardStatus, setCardStatus] = useState([0, 0, 0, 0, 0]);

  function handleStart(){
    // console.log("Cards:"+pokemoncards.length)
    if(pokemoncards.length===6){
      setCond(1)
      inGame = true
      setCurOpCardIndex(0)
      setTurn('p')
      playerUpdateHPs()

    }
    else{
      console.log(`Select ${6-pokemoncards.length} more Cards To Start Battle`)
      alert(`Select ${6-pokemoncards.length} more Cards To Start Battle`)
    }

  }

  async function handleEnd(res) {
    setCond(0);
    setOppCardData([]);
    try {
      console.log(carddatas[0].name, carddatas[1].name, carddatas[2].name, carddatas[3].name, carddatas[4].name, cardStatus)
        const body = {
            player: "player",
            deck_list: [carddatas[0].name, carddatas[1].name, carddatas[2].name, carddatas[3].name, carddatas[4].name],
            card_contribution: cardStatus,
            status: res
        };
        const response = await fetch("http://localhost:5000/result", {
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
}

  const playerUpdateHPs = () => {
    setPlayerHPs(() => {
      const slicedData = carddatas.slice(1, 6);
      const newHPs = slicedData.map(data => data.stats[0].base_stat);
      return [...newHPs];
    });
  };

  var inGame = false;

  function attack(player){

      if (player =='p' && playerHPs[pressedButtonId-1] > 0){
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
          status[pressedButtonId-1] += 1;
          setCardStatus(status)

          if (curOpCardIndex==4){
            alert("You Won!")
            handleEnd("win")
          }
          else{
            setCurOpCardIndex(() => curOpCardIndex+1)
          }
        }
        setTurn('o')

      }

      if (player =='o' && playerHPs[pressedButtonId-1] > 0 ){
        // console.log(oppCardData[curOpCardIndex].cardData)

        var oppatk = oppCardData[curOpCardIndex].cardData.stats[1].base_stat
        var playerhp =  playerHPs[pressedButtonId-1]
        var playerdef = carddatas[pressedButtonId].stats[2].base_stat
        var damage = oppatk - playerdef
        if (damage>0){
          var newPlayerHp = playerhp - damage;
          if (newPlayerHp <= 0){
            newPlayerHp = 0
          }
        }
        else{
          var newPlayerHp = playerhp
        }

        var newPlayerHPs = [...playerHPs];
        newPlayerHPs[pressedButtonId-1] = newPlayerHp;

        // console.log(newPlayerHPs)
        setPlayerHPs(newPlayerHPs);

        // console.log(playatk)
        // console.log(opphp)
        // console.log(oppHPs)
        // console.log(playerHPs)

        if (newPlayerHPs.every(hp => hp === 0)) {
          alert('You lost!')
          handleEnd("lose")
        }else{
          setTurn('p')
        }

      }

      if (playerHPs[pressedButtonId-1] <= 0){
        alert("Change Onfield Card")
      }

  }

  function attackCard(){
    attack(turn)
  }

  function defendCard(){
    attack(turn)
  }

    // useEffect(() => {
    //   console.log(playerHPs)
    //   if (carddatas.length === 6 && !inGame){
    //     playerUpdateHPs()
    //   }
    //   if (cond===0){
    //     setPlayerHPs([])
    //   }
    // }, [cond])

  useEffect(() => {
    console.log(turn)
    console.log(oppHPs)
    console.log(playerHPs)
    console.log(cardStatus)

  }, [oppHPs, playerHPs])

  return(

      (cond===1) ?   
              <>
              <div className="bfui">
              <div className="ui">
              <div className="ui2">
              <div className="opp-field">
              <h1>Opponent Onfield Card</h1>
              <div>HP: {oppHPs[curOpCardIndex]}</div>
              <div>{oponentCards[curOpCardIndex]}</div>
              </div>
              <div className="player-field">
              <h1>Player Onfield Card</h1>
              <div>HP: {playerHPs[pressedButtonId-1]}</div>
              <div>{pokemoncards[pressedButtonId]}</div>
              </div>
              </div>
              <div className="game-input">{turn=='p'? <div><button className="selectbtn" onClick={attackCard}>Attack</button></div>:
              <div><button className="selectbtn" onClick={defendCard}>Next</button></div>}
              <div><button className="selectbtn" onClick={handleEnd}>End</button></div>
              </div>
              </div>
              </div>
              </> : 
      
              <>
              <div>{pokemoncards[pressedButtonId]}</div>
              <div><button className="selectbtn" onClick={handleStart}>Start</button></div>
              </>
  )
}

export default BattleFieldUI