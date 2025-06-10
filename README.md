# UBC-Cubing-Club
This is the official website for the UBC Cubing Club. Built using React.js and Next.js with TypeScript, it displays the UBC Cubing Club statistics to the public, and allows members to submit live results with a built-in timer.

## Features
- View member results and statistics with filters
- Result submission from user's end
- Display club information to the public

## Tech Stack
- **Front end**: React.js, Next.js, TypeScript, CSS
- **Back end & Database**: Supabase
- **Authentication**: Supabase authentication
- **Hosting**: Vercel

## Getting Started
1. Clone and install
  <pre>
  git clone https://github.com/AllanWang1/UBC-Cubing-Club.git
  cd src
  npm install
  </pre>

2. Request the Supabase credentials like the ANON KEY from an admin. Then create an .env file in src, specify:
<pre> 
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
</pre>

3. Run locally:
   
   `npm run dev`

4. Deployment:
   - Vercel has been set up already
   - Push to this repository, on any branch
   - The deployment of the main branch can be found at: `https://speedcubingubc.vercel.app/`

## Tables (TODO)
### 🗄️ `members` Table

| Column      | Type       | Description                      |
|-------------|------------|----------------------------------|
| id          | INTEGER    | Unique user ID                   |
| name        | TEXT       | Display name                     |
| email       | TEXT       | User email address (unique)      |
| joined_at   | TIMESTAMP  | When the user joined             |
| is_admin    | BOOLEAN    | Admin privileges (true/false)    |

## Features In Progress
- Admin page for simpler member result validation
- UX enhancements

## Logging 
- Server side logging viewable in the terminal after executing `npm run dev`
  - Check for status codes from API 
- Client side logging available through the browser developer tools
  
## Contributors
- Allan Wang - Developer/Design
- Yuqi Zhu - Developer/Design
