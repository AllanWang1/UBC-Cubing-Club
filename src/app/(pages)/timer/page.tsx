"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatTime } from "../../lib/utils";
import { Result } from "../../types/Result";

import { User } from "@supabase/auth-js";
import { supabase } from "../../lib/SupabaseClient";

import "./Timer.css";

interface Event {
  meeting_id: number;
  cube_name: string;
  format: string;
  rounds: number;
  Cubes: {
    cube_name: string;
    icon_link: string;
  };
  FormatAttempts: {
    format: string;
    max_attempts: number;
  };
  Meetings: {
    meeting_name: string;
    status: string;
  };
}

const READY_TIME = 500;

const Timer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [running, setRunning] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0); //ms
  const [endTime, setEndTime] = useState<number>(0); //ms
  const [time, setTime] = useState<number>(0);
  const [ready, setReady] = useState<boolean>(false);

  const [holding, setHolding] = useState<boolean>(false);
  const [holdStartTime, setHoldStartTime] = useState<number>(0); //ms
  const [holdEndTime, setHoldEndTime] = useState<number>(0);

  const [event, setEvent] = useState<Event | null>(null);
  const [result, setResult] = useState<Result>({
    attempt: 0,
    round: 0,
    id: 0,
    cube_name: "",
    meeting_id: 0,
    time_ms: 0,
    record: false,
    average_record: false,
  });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // check if there are any missing parameters.
    const attempt = searchParams.get("attempt");
    const round = searchParams.get("round");
    const cube_name = searchParams.get("cube_name");
    const meeting_id = searchParams.get("meeting_id");
    if (!attempt || !round || !cube_name || !meeting_id) {
      router.push("/404");
      return;
    }

    const validateAll = async () => {
      // 1. Check if meeting_id and cube_name are valid.
      const response = await fetch(
        `/api/event-info?meeting_id=${meeting_id}&cube_name=${cube_name}`
      );
      const res_json = await response.json();
      if (response.ok) {
        setEvent(res_json);
      } else {
        router.push("/404");
        return;
      }

      // 2. Check if attempt and round are valid.
      console.log("res_json: ", res_json);
      if (
        Number(attempt) > Number(res_json.FormatAttempts.max_attempts) ||
        Number(round) > res_json.rounds ||
        Number(attempt) < 1 ||
        Number(round) < 1
      ) {
        alert("Invalid link: attempt or round out of scope.");
        router.push("/404");
        return;
      }

      // 3. Check if the user is valid: logged in and has a member_id.
      const {
        data: { user: fetchedUser },
      } = await supabase.auth.getUser();
      if (!fetchedUser) {
        alert("Please log in to use the timer.");
        router.push("/signin");
        return;
      }

      // user is logged in, check if they have an associated member_id.
      const member_id = fetchedUser.user_metadata?.member_id;
      if (!member_id) {
        alert(
          "There is no member ID associated with your account. Please contact an admin."
        );
        router.push("/meetings");
        return;
      }

      // If the user has still not been redirected, we know this is a valid user.
      setUser(fetchedUser);
     
      // 4. Check if the user has already submitted a result for this event.

    };

    validateAll();
  }, [router, searchParams]);

  // Calculating final time, hold time, etc.
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

  // Update the timer in real time
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setTime(Date.now() - startTime);
    }, 80);

    return () => clearInterval(interval);
  }, [running, startTime]);

  // Check for the readiness of the timer
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
          <h2>{formatTime(time)}</h2>
        </div>
      )}
      {((holding && !ready) || (holding && time !== 0)) && (
        <div className="holding-unready-timer">
          <h2>{formatTime(time)}</h2>
        </div>
      )}

      {running && (
        <div className="timing-timer">
          <h2>{formatTime(time)}</h2>
        </div>
      )}
      {!holding && !running && (
        <div className="stale-timer">
          <h2>{formatTime(time)}</h2>
        </div>
      )}
    </div>
  );
};

// Export the wrapped version
export default function TimerPage() {
  return (
    <Suspense fallback={<div>Loading timer...</div>}>
      <Timer />
    </Suspense>
  );
}
