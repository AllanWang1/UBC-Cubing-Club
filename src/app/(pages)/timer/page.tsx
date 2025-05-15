"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import "./Timer.css";

const READY_TIME = 750; 

const Timer = () => {
  const router = useRouter();
  const [running, setRunning] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0); //ms
  const [endTime, setEndTime] = useState<number>(0); //ms
  const [time, setTime] = useState<number>(0);
  const [ready, setReady] = useState<boolean>(false);

  const [holding, setHolding] = useState<boolean>(false);
  const [holdStartTime, setHoldStartTime] = useState<number>(0); //ms
  const [holdEndTime, setHoldEndTime] = useState<number>(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        if (!holding && !running) {
          // The timer has not been started, only start the timer on release
          setHoldEndTime(0);
          setHolding(true);
          setHoldStartTime(Date.now());
        } else {
          // The press is to stop the timer
          if (running) {
            setRunning(false);
            const endTimeLocal = Date.now();
            setEndTime(endTimeLocal);
            setTime(endTimeLocal - startTime);
          }
        }
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        if (holding) {
          setHolding(false);
          const holdEndTimeLocal = Date.now();
          setHoldEndTime(holdEndTimeLocal);
          const holdDuration = holdEndTimeLocal - holdStartTime;
          if (holdDuration > READY_TIME && !running && time === 0) {
            // Good enough time for the release to activate the timer
            setRunning(true);
            console.log("setting time");
            setStartTime(Date.now());
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [holding, time, holdStartTime, holdEndTime, endTime, running, startTime]);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setTime(Date.now() - startTime);
    }, 80);

    return () => clearInterval(interval);
  }, [running, startTime]);

  useEffect(() => {
  if (!holding || time !== 0) {
    setReady(false);
    return;
  }

  const timeout = setTimeout(() => {
    setReady(true);
  }, READY_TIME);

  return () => clearTimeout(timeout);
}, [holding, time]);


  return (
    <div className="timer">
      {ready && (
        <div className="holding-ready-timer">
          <h2>{time}</h2>
        </div>
      )}
      {((holding && !ready) ||
        (holding && time !== 0)) && (
        <div className="holding-unready-timer">
          <h2>{time}</h2>
        </div>
      )}

      {running && (
        <div className="timing-timer">
          <h2>{time}</h2>
        </div>
      )}
      {!holding && !running && (
        <div className="stale-timer">
          <h2>{time}</h2>
        </div>
      )}
    </div>
  );
};

export default Timer;
