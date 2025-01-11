import React from 'react';
import PropTypes from 'prop-types';
import './HPBar.css';

const HPBar = ({ maxHP, currentHP }) => {
  const barColor = currentHP > 0 ? 'lightgreen' : 'red';
  const hpPercentage = (currentHP / maxHP) * 100;
//   const displayText = currentHP <= 0 ? 'Defeated' : currentHP;

  return (
    <div className="hp-bar">
      <div
        className="hp-bar__inner"
        style={{ width: `${currentHP<=0?100:hpPercentage}%`, backgroundColor: barColor }}
      >
        {/* <span className="hp-bar__text">{displayText}</span> */}
      </div>
      <span className="hp-bar__text hp-bar__text--outer">
        {currentHP <= 0 ? 'Defeated' : `${currentHP}`}
      </span>
    </div>
  );
};

HPBar.propTypes = {
  maxHP: PropTypes.number.isRequired,
  currentHP: PropTypes.number.isRequired,
};

export default HPBar;
