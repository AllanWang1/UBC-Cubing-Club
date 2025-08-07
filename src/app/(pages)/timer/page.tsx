"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatTime } from "../../lib/utils";
import { Result } from "../../types/Result";
import { StartedAttempt } from "../../types/StartedAttempt";

import { TwistyPlayer } from "cubing/twisty";
import { TwistyPlayerConfig } from "cubing/twisty";

import { User } from "@supabase/auth-js";
import { supabase } from "../../lib/SupabaseClient";

import Image from "next/image";
import CubeDetails from "@/app/types/CubeDetails.json";
import SubmissionPopUp from "@/app/components/SubmissionPopUp";

import "./Timer.css";

const READY_TIME = 500;

interface CubeModel {
  cube_name: string;
  model_name: string;
  scramble_name: string;
  order: number;
}

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

async function submitStartedAttempt(entry: StartedAttempt) {
  try {
    const response = await fetch(`/api/started-attempts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    });
    const res_json = await response.json();
    if (response.ok) {
      // Attempt started
    } else {
      alert("Error starting attempt: " + res_json.error);
    }
  } catch (error) {
    alert("Error starting attempt: " + error);
  }
}

async function deleteStartedAttempt(entry: StartedAttempt) {
  const response = await fetch(
    `/api/started-attempts?attempt=${entry.attempt}&cube_name=${entry.cube_name}&id=${entry.id}&meeting_id=${entry.meeting_id}&round=${entry.round}`,
    {
      method: "DELETE",
    }
  );
  const res_json = await response.json();
  if (!response.ok) {
    alert("Error removing started attempt: " + res_json.error);
  }
}

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

  const [meetingPasscode, setMeetingPasscode] = useState<string>("");
  const [passcode, setPasscode] = useState<string>("");
  const [verified, setVerified] = useState<boolean>(false);

  const [scramble, setScramble] = useState<string>("");

  const [popUp, setPopUp] = useState<boolean>(false);

  const attempt_read = Number(searchParams.get("attempt"));
  const cube_name_read = searchParams.get("cube_name") as string;
  const meeting_id_read = Number(searchParams.get("meeting_id"));
  const round_read = Number(searchParams.get("round"));

  const [temporaryResult, setTemporaryResult] = useState<Result>({
    attempt: attempt_read,
    cube_name: cube_name_read,
    id: user?.user_metadata?.member_id,
    meeting_id: meeting_id_read,
    round: round_read,
    time_ms: 99999999,
    record: false,
    average_record: false,
    penalty: "DNF",
    raw_time_ms: 99999999,
  });
  const puzzleContainerRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasscode(e.target.value);
  };

  const handlePasscodeSubmission = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (passcode === meetingPasscode) {
      // Then there are two cases:
      // - There is a started attempt
      // - There is no started attempt (either the user just opened the timer, or the time has already been submitted)
      const response = await fetch(
        // Can rest assured that user already exists without id, otherwise the page would have returned already.
        `/api/started-attempts?attempt=${attempt_read}&cube_name=${cube_name_read}&id=${user?.user_metadata?.member_id}&meeting_id=${meeting_id_read}&round=${round_read}`
      );
      const res_json = await response.json();
      if (response.ok) {
        if (res_json.length > 0) {
          // User already has active session, disqualify.
          const DNF_result: Result = {
            attempt: attempt_read,
            cube_name: cube_name_read,
            id: user?.user_metadata?.member_id,
            meeting_id: meeting_id_read,
            round: round_read,
            time_ms: 99999999,
            record: false,
            average_record: false,
            penalty: "DNF",
            raw_time_ms: 99999999,
          };
          submitResult(DNF_result);
          deleteStartedAttempt({
            attempt: attempt_read,
            cube_name: cube_name_read,
            id: user?.user_metadata?.member_id,
            meeting_id: meeting_id_read,
            round: round_read,
          });
        } else {
          // No active session found, user can use the timer normally
          // Must make an insert into the StartedAttempts table
          const entry: StartedAttempt = {
            attempt: attempt_read,
            cube_name: cube_name_read,
            id: user?.user_metadata?.member_id,
            meeting_id: meeting_id_read,
            round: round_read,
          };
          submitStartedAttempt(entry);
        }
      } else {
        alert("Error checking started attempts: " + res_json.error);
        return;
      }

      // Password is verified, available timer to start is verified.
      setVerified(true);
    } else {
      // handle incorrect password
      alert("Password incorrect");
    }
  };

  const handleBack = () => {
    router.push(`/meetings/${meeting_id_read}`);
  }

  // Validating all
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

      // Fetch the scramble first, before we check for any submissions. We want to display the scramble regardless of whether
      // the user has already submitted/started an attempt.
      const fetchedScramble = await fetch(
        `/api/scrambles?attempt=${attempt_read}&cube_name=${cube_name_read}&meeting_id=${meeting_id_read}&round=${round_read}`
      );
      const scramble_json = await fetchedScramble.json();
      if (fetchedScramble.ok) {
        setScramble(scramble_json.scramble);
      } else {
        // There is really no else for this case. There may very well be no entry for the given scramble for the attempt.
      }

      // 4. Check if the user has already submitted a result for this event.
      const pending = await fetch(
        `/api/pending?attempt=${attempt_read}&round=${round_read}&cube_name=${cube_name_read}&id=${member_id}&meeting_id=${meeting_id_read}`
      );
      const pending_json = await pending.json();
      if (pending.ok) {
        if (pending_json.length > 0) {
          setSubmitted(true);
          setRunning(false);
          setVerified(true);
          // pending_json is array of objects, we take the first and only one, if the length > 0
          // we did not use the single() clause because the result could be empty.
          setTime(pending_json[0].time_ms);
          return;
        }
      }

      // 5. If there is already an entry in the pending table, then the current useEffect
      // would have returned already, thus, we can confidently fetch the passcode if it hasn't returned.
      const meeting = await fetch(`api/meetings/${meeting_id_read}`);
      const meeting_json = await meeting.json();
      if (meeting.ok) {
        const meeting_passcode = meeting_json.passcode;
        setMeetingPasscode(meeting_passcode);
      }
    };

    validateAll();
  }, [router, attempt_read, round_read, cube_name_read, meeting_id_read]);

  // Handle key events, calculating final time, hold time, etc.
  useEffect(() => {
    if (!verified) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        startHold(true);
      } else {
        // It is another key being pressed, it should only stop the timer if running.
        event.preventDefault();
        startHold(false);
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        stopHold();
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      startHold(true);
    };

    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();
      stopHold();
    };

    const startHold = (space: boolean) => {
      if (!holding && !running && space) {
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
            penalty: null,
            raw_time_ms: endTimeLocal - startTime,
          };

          setTemporaryResult(localResult);
          setPopUp(true);
          // This can stay here, I just need to submit the result through the pop-up
          // The attempt will be deleted regardless of what is specified as the penalty.
          deleteStartedAttempt({
            attempt: localResult.attempt,
            cube_name: localResult.cube_name,
            id: localResult.id,
            meeting_id: localResult.meeting_id,
            round: localResult.round,
          });
        }
      }
    };
    const stopHold = () => {
      if (holding) {
        setHolding(false);
        const holdEndTimeLocal = Date.now();
        setHoldEndTime(holdEndTimeLocal);
        const holdDuration = holdEndTimeLocal - holdStartTime;
        if (holdDuration > READY_TIME && !running && time === 0 && !submitted) {
          // Good enough time for the release to activate the timer
          setRunning(true);
          console.log("setting time");
          setStartTime(Date.now());
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);

      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
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
    verified,
  ]);

  // Update the timer in real time
  useEffect(() => {
    if (!verified) return;
    if (!running) return;
    if (submitted) return;

    const interval = setInterval(() => {
      setTime(Date.now() - startTime);
    }, 80);

    return () => clearInterval(interval);
  }, [running, startTime, submitted, verified]);

  // Check for the readiness of the timer
  useEffect(() => {
    if (!verified) return;
    if (!holding || time !== 0 || submitted) {
      setReady(false);
      return;
    }

    const timeout = setTimeout(() => {
      setReady(true);
    }, READY_TIME);

    return () => clearTimeout(timeout);
  }, [holding, time, submitted, verified]);

  // Scramble renderer
  useEffect(() => {
    if (!verified) return;
    if (scramble === "") return;
    if (!puzzleContainerRef.current) return;

    const container = puzzleContainerRef.current;

    const modelMap: CubeModel | undefined = CubeDetails.find(
      (m) => m.cube_name === cube_name_read
    );
    const player = new TwistyPlayer({
      puzzle: modelMap?.model_name as TwistyPlayerConfig["puzzle"],
      alg: scramble,
      //   hintFacelets: "none",
      controlPanel: "none",
      background: "none",
      backView: "top-right",
    });
    container.appendChild(player);

    return () => {
      if (container.contains(player)) {
        container.removeChild(player);
      }
    };
  }, [scramble, verified, submitted, cube_name_read]);

  // Display for the timer page
  return (
    <div className="timer">
      {verified ? (
        <div className="timer-menu">
          <span
            className="timer-scramble"
            style={{
              visibility: !running && scramble ? "visible" : "hidden",
            }}
          >
            {scramble}
          </span>
          <div className="available-timer">
            <SubmissionPopUp
              isOpen={popUp}
              onClose={() => setPopUp(false)}
              result={temporaryResult}
            ></SubmissionPopUp>
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
          {submitted && !popUp && (
            <div className="timer-back" onClick={handleBack}>
              <Image src={"/back.svg"} width={20} height={20} alt=""/>
              <h5>Back to meeting</h5>
            </div>
          )}
          {!running && scramble !== "" && (
            <div
              ref={puzzleContainerRef}
              className="timer-scramble-model"
            ></div>
          )}
        </div>
      ) : (
        <div className="prompt-passcode">
          <form onSubmit={handlePasscodeSubmission}>
            <p>Please enter meeting passcode:</p>
            <input type="text" onChange={handleChange} />
            <button type="submit">Enter</button>
          </form>
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
