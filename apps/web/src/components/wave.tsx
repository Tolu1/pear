import React from "react";
import Wavify from "react-wavify";

function Wave() {
  return (
    <Wavify
      fill="#D6D58B"
      paused={false}
      style={{ display: "flex", height: "50px" }}
      options={{
        height: 8,
        amplitude: 12,
        speed: 0.2,
        points: 5,
      }}
    />
  );
}

export default Wave;
