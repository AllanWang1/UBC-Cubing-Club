# UBC-Cubing-Club
This is the website for the UBC Cubing Club. Online/in person meetings are fostered using this website, using an intuitive timer that submits member results automatically. Built using React.js and Next.js with TypeScript, it displays the UBC Cubing Club statistics such as member rankings grouped by events, to encourage friendly competition within the club. 

## Features
- View member results and statistics with filters
- Result submission from user's end
- Display club information to the public
- Automatic scramble generation and scramble display for meetings

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
├── app/
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
- Admin page for simpler member result validation
- Member ability radars
  - How to make this measurable? What algorithms can be used to calculate this?
- Member account settings page
  - Custom profile pictures, password and name settings, password reset request, etc.
- UX enhancements

## Logging 
- Server side logging viewable in the terminal after executing `npm run dev`
  - Check for status codes from API 
- Client side logging available through the browser developer tools
  
## Contributors
- Allan Wang - Developer/Design
- Yuqi Zhu - Developer/Design
