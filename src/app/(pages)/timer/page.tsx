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

const delayedSubmission = (
  attempt: number,
  cube_name: string,
  id: number,
  meeting_id: number,
  round: number
) => {
  const localResult = {
    attempt: attempt,
    cube_name: cube_name,
    id: id,
    meeting_id: meeting_id,
    round: round,
    time_ms: -1,
    record: false,
    average_record: false,
  };
  navigator.sendBeacon("/api/pending/post", JSON.stringify(localResult));
};

const Timer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [submitted, setSubmitted] = useState<boolean>(false);

  const [running, setRunning] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0); //ms
  const [endTime, setEndTime] = useState<number>(0); //ms
  const [time, setTime] = useState<number>(0);
  const [ready, setReady] = useState<boolean>(false);

  const [holding, setHolding] = useState<boolean>(false);
  const [holdStartTime, setHoldStartTime] = useState<number>(0); //ms
  const [holdEndTime, setHoldEndTime] = useState<number>(0);

  const [user, setUser] = useState<User | null>(null);

  const attempt_read = Number(searchParams.get("attempt"));
  const cube_name_read = searchParams.get("cube_name") as string;
  const meeting_id_read = Number(searchParams.get("meeting_id"));
  const round_read = Number(searchParams.get("round"));

  async function submitResult(result: Result) {
    try {
      const response = await fetch(`/api/pending/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result),
      });
      const res_json = await response.json();
      if (response.ok) {
        alert("Result successfully submitted for review!");
      } else {
        alert("Error submitting result: " + res_json.error);
      }
    } catch (err) {
      alert("Error submitting result: " + err);
    }
  }

  useEffect(() => {
    if (!attempt_read || !round_read || !cube_name_read || !meeting_id_read) {
      router.push("/404");
      return;
    }

    const validateAll = async () => {
      // 1. Check if meeting_id and cube_name are valid.
      const response = await fetch(
        `/api/event-info?meeting_id=${meeting_id_read}&cube_name=${cube_name_read}`
      );
      const res_json = await response.json();
      if (!response.ok) {
        router.push("/404");
        return;
      }

      // 2. Check if attempt and round are valid.
      console.log("res_json: ", res_json);
      if (
        Number(attempt_read) > Number(res_json.FormatAttempts.max_attempts) ||
        Number(round_read) > res_json.rounds ||
        Number(attempt_read) < 1 ||
        Number(round_read) < 1 ||
        Number.isInteger(Number(attempt_read)) === false ||
        Number.isInteger(Number(round_read)) === false
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
      const pending = await fetch(
        `/api/pending?attempt=${attempt_read}&round=${round_read}&cube_name=${cube_name_read}&id=${member_id}&meeting_id=${meeting_id_read}`
      );
      const pending_json = await pending.json();
      if (pending.ok) {
        if (pending_json.length > 0) {
          setSubmitted(true);
          // pending_json is array of objects, we take the first and only one, if the length > 0
          // we did not use the single() clause because the result could be empty. 
          setTime(pending_json[0].time_ms);
        }
      }
    };

    validateAll();
  }, [router, attempt_read, round_read, cube_name_read, meeting_id_read]);

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
            setSubmitted(true);

            const localResult = {
              attempt: attempt_read,
              cube_name: cube_name_read,
              id: Number(user?.user_metadata?.member_id),
              meeting_id: meeting_id_read,
              round: round_read,
              time_ms: endTimeLocal - startTime,
              record: false,
              average_record: false,
            };

            submitResult(localResult);
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
          if (
            holdDuration > READY_TIME &&
            !running &&
            time === 0 &&
            !submitted
          ) {
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
  }, [
    holding,
    time,
    holdStartTime,
    holdEndTime,
    endTime,
    running,
    startTime,
    submitted,
    user,
    attempt_read,
    cube_name_read,
    meeting_id_read,
    round_read,
  ]);

  // Update the timer in real time
  useEffect(() => {
    if (!running) return;
    if (submitted) return;

    const interval = setInterval(() => {
      setTime(Date.now() - startTime);
    }, 80);

    return () => clearInterval(interval);
  }, [running, startTime, submitted]);

  // Check for the readiness of the timer
  useEffect(() => {
    if (!holding || time !== 0 || submitted) {
      setReady(false);
      return;
    }

    const timeout = setTimeout(() => {
      setReady(true);
    }, READY_TIME);

    return () => clearTimeout(timeout);
  }, [holding, time, submitted]);

  // Detecting if the user is leaving the page, submit a DNF immediately if they leave the page.
  useEffect(() => {
    if (submitted) return;
    const local_id = Number(user?.user_metadata?.member_id);
    const handleDelayedSubmission = () => {

      delayedSubmission(attempt_read, cube_name_read, local_id, meeting_id_read, round_read);

    }
    const handleUnload = () => {
      handleDelayedSubmission();
    }
    
    const handleVisibilityChange = () => {
      // Will only submit a DNF if the page is minimized, closed, or entering a different URL.
      // It is ok if the page is moved around, adjusted size, etc. As long as the page is still visible on screen.
      if (document.visibilityState === "hidden") {
        handleDelayedSubmission();
      }
    }

    window.addEventListener("unload", handleUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("unload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    submitted,
    attempt_read,
    cube_name_read,
    meeting_id_read,
    round_read,
    user,
  ]);

  // Display for the timer page
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
