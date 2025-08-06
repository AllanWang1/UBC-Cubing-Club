// Using the scramble generation API needs to be server-side.

import { randomScrambleForEvent } from "cubing/scramble";
import { NextRequest, NextResponse } from "next/server";
import cubeDetails from "@/app/types/CubeDetails.json";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { meeting_id, cube_name, max_attempts, round } = body;

  if (!meeting_id || !cube_name || !max_attempts || !round) {
    return NextResponse.json(
      { error: "Error with request parameters." },
      { status: 400 }
    );
  }

  const scrambleName = cubeDetails.find(
    (cube) => cube.cube_name === cube_name
  )?.scramble_name;

  if (!scrambleName) {
    return NextResponse.json({ error: "Invalid cube name." }, { status: 400 });
  } else {
    const scrambles: string[] = [];
    for (let i = 0; i < parseInt(max_attempts); i++) {
      scrambles.push((await randomScrambleForEvent(scrambleName)).toString());
    }
    // Then call the POST API to insert the scrambles into the database.
    // The errors produced by that API can be duplicate entries for the most part.
    let oneErrorOccurred = false;
    for (let i = 1; i <= scrambles.length; i++) {
      const entry = {
        meeting_id: meeting_id,
        attempt: i,
        cube_name: cube_name,
        round: round,
        scramble: scrambles[i],
      };
      try {
        const response = await fetch(`/api/scrambles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(entry),
        });
        if (response.ok) {
            return NextResponse.json(response, { status: 201 });
        }
      } catch (err) {
        oneErrorOccurred = true;
        continue;
      }
    }
    if (oneErrorOccurred) {
        return NextResponse.json({ error: "An error occurred while inserting scramble"}, { status: 500 });
    } else {
        return NextResponse.json({ status: 201 });
    }
  }
}
