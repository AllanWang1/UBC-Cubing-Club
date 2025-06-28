"use client";

import { useEffect, useRef } from "react";
import { TwistyPlayer } from "cubing/twisty";

const AccessRequest = () => {
  const puzzleContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!puzzleContainerRef.current) return;
    const player = new TwistyPlayer({
      puzzle: "5x5x5",
      alg: " R U R D B R2 ",
    //   hintFacelets: "none",
      controlPanel: "none",
      background: "none",
    });
    puzzleContainerRef.current.appendChild(player);

    return () => {
      if (puzzleContainerRef.current?.contains(player)) {
        puzzleContainerRef.current.removeChild(player);
      }
    };
  }, []);
  return (
    <div>
      <div ref={puzzleContainerRef}></div>
    </div>
  );
};

export default AccessRequest;
