# UBC-Cubing-Club

This repository powers the UBC Cubing Club website: a member portal, meeting manager, and results system for club sessions. It supports public club information, member access requests, live timed solves during meetings, post-solve review and submission, and event-based rankings and statistics.

## What The Site Does

- Public club information page with meeting time, location, contact links, and club details
- Member directory and member profile pages with per-event rankings, historical results, and WCA ID links
- Meeting pages for viewing open or closed meetings, event schedules, and round-by-round results
- Live timer flow for verified members, including scramble display, started-attempt tracking, and result submission for review
- Admin tools for creating and editing meetings, adding events, and reviewing membership requests

## Most Important Features

1. Live result capture and submission is the core workflow. Members use the timer during meetings, see the scramble, and submit solves for review with penalties such as `OK`, `+2`, or `DNF`.
2. Meeting management is the next major feature. Admins can create meetings, add events and rounds, open or close sessions, and review results after a meeting ends.
3. Rankings and member statistics make the site useful after the meeting. The leaderboard groups results by event and solve type, while individual member pages show event-by-event performance and solve history.
4. Access control and membership onboarding keep the club data organized. New users can request membership, while signed-in members and admins see the workflows relevant to their role.

## Tech Stack

- **Front end**: React.js, Next.js, TypeScript, CSS
- **3D Rendering**: Cubing.js, Scrambow
- **Back end & Database**: Supabase
- **Authentication**: Supabase authentication
- **Hosting**: Vercel

## Required Tools

- Node.js $\geq$ 18.x
- npm
- Supabase account
  - Supabase access (please submit request)

## Setup & Installation

1. Clone and install
<pre>
git clone https://github.com/AllanWang1/UBC-Cubing-Club.git
cd src
npm install </pre>

2. Request the Supabase credentials like the ANON KEY from an admin, as this may not be the same key as shown in the repository. It is safe to develop with these public keys as long as the Row Level Security rules were set properly on Supabase.

3. Run locally for development:

   `npm run dev`

4. Deployment:
   - Vercel has been set up already
   - Push to this repository, on any branch
   - The deployment of the main branch can be found at: `https://speedcubingubc.vercel.app/`

## Project Structure

```
├── src/app/
|   ├── (pages)                    # Displayed pages, including the home page, along with their styling css files
│   ├── api/                       # API routes e.g. /api/scrambles/route.ts
│   ├── assets/
│   ├── components/
│   ├── lib/                       # Utility functions, supabase client
│   ├── styles/                    # Styles for components
│   ├── types/                     # Shared types, e.g. Cube.ts describes a row in the Cubes table in the database
│   ├── clientlayout.tsx/
│   ├── global.css
│   └── layout.tsx
├── public/                        # Mostly for static assets like .svg's.
└── (configurations, packages...)
```

## Workflow

This project follows a client-server-database workflow:

- Frontend (client)
  - Next.js App Router is used; in the `app` folder, the relative URLs for different pages are described by the work directory folder names
  - Client will interact with UI elements in `page.tsx`
  - The front end will make HTTP requests to Next.js API routes (`/api/{route}`) using `fetch`
- API Routes
  - Next.js API routes to handle incoming requests
  - The routes will call self-defined `GET()`, `POST()`, etc. functions to communicate with the database
- Database
  - Supabase client API is available for simple queries
  - Supabase will return the data as an array of JSON objects, unless explicitly stated such as by using `.single()`
  - An error will be produced and can be caught if one does occur; more information can be found [here](https://supabase.com/docs/guides/api)
- Response
  - The response can be sent back to the frontend for further processing and rendering

## Future Improvements/Features In Progress

- Result validation page for admins
  - Review meeting results to approve/delete/update any data as required
  - Allow filtering by member and event
- User customizability
  - Uploading profile pictures
    - Feature to report profile picture should be available as well
  - Password reset & forgot password feature
- Meeting results display page: should be ranked in order from fastest member to slowest member
  - Would also be nice to mark fastest/slowest time of an average with brackets
  - Live results page (for viewing temporary data while meetings are still in progress, low priority)
- Admin ability to admit membership requests
- Optimizing timer page for touch screen devices to allow timer usage from mobile devices
  - Currently the timer only starts by space bar
  - After this change, members may come to meetings with just their cubes and their phone

## Logging

- Server side logging viewable in the terminal after executing `npm run dev`
  - Check for status codes from API
- Client side logging available through the browser developer tools

## Contributors

- Allan Wang - Developer/Design
- Yuqi Zhu - Developer/Design
