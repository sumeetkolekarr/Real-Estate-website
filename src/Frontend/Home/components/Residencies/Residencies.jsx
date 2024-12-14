import React from "react";
import data from "../../utils/slider.json";
import "./Residencies.css";

const Residencies = () => {
  return (
    <div id="residencies" className="r-wrapper">
      <div className="paddings innerWidth r-container">
        <div className="flexColStart r-head">
          <span className="orangeText">Best Choices</span>
          <span className="primaryText">Popular Courses</span>
        </div>

        <div className="r-cards-grid" style={{ overflow: "hidden" }}>
          {data.map((card, i) => (
            <div key={i} className="flexColStart r-card">
              <img src={card.image} className="imgCardRounded" alt="home" />
              <span className="primaryText">{card.name}</span>
              <span className="secondaryText" style={{ fontSize: "13px" }}>
                {card.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Residencies;
