# UBC-Cubing-Club
This is the official website for the UBC Cubing Club. Built using React.js and Next.js with TypeScript, it displays the UBC Cubing Club statistics to the public, and allows members to submit live results with a built-in timer.

## Features
- View member results and statistics with filters
- Result submission from user's end
- Display club information to the public

## Tech Stack
- **Front end**: React.js, Next.js, TypeScript, CSS
- **3D Rendering**: Cubing.js
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

2. Request the Supabase credentials like the ANON KEY from an admin, as this may not be the same key as shown in the repository. It is safe to develop with these public keys as long as the Row Level Security rules were set properly on Supabase.

3. Run locally:
   
   `npm run dev`

4. Deployment:
   - Vercel has been set up already
   - Push to this repository, on any branch
   - The deployment of the main branch can be found at: `https://speedcubingubc.vercel.app/`

## Tables (TODO)
| Table Name      | Column Name        | Data Type         |
| --------------- | ------------------ | ----------------- |
| Attends         | cube_name          | text              |
| Attends         | meeting_id         | bigint            |
| Attends         | id                 | bigint            |
| Attends         | rank               | integer           |
| Cubes           | order              | smallint          |
| Cubes           | cube_name          | text              |
| Cubes           | icon_link          | text              |
| Cubes           | recommended_format | USER-DEFINED      |
| Faculties       | faculty_full_name  | text              |
| Faculties       | faculty_name       | USER-DEFINED      |
| Faculties       | faculty_icon_link  | text              |
| FormatAttempts  | max_attempts       | smallint          |
| FormatAttempts  | format             | USER-DEFINED      |
| Holds           | cube_name          | text              |
| Holds           | format             | USER-DEFINED      |
| Holds           | meeting_id         | bigint            |
| Holds           | rounds             | smallint          |
| Meetings        | description        | text              |
| Meetings        | date               | date              |
| Meetings        | meeting_name       | text              |
| Meetings        | meeting_id         | bigint            |
| Meetings        | tournament         | boolean           |
| Meetings        | status             | USER-DEFINED      |
| Meetings        | passcode           | character varying |
| Members         | email              | text              |
| Members         | id                 | bigint            |
| Members         | membership         | boolean           |
| Members         | faculty            | USER-DEFINED      |
| Members         | user_id            | uuid              |
| Members         | position           | text              |
| Members         | name               | text              |
| Members         | student_id         | text              |
| PendingResults  | meeting_id         | bigint            |
| PendingResults  | round              | integer           |
| PendingResults  | record             | boolean           |
| PendingResults  | cube_name          | text              |
| PendingResults  | average_record     | boolean           |
| PendingResults  | attempt            | bigint            |
| PendingResults  | time_ms            | numeric           |
| PendingResults  | id                 | bigint            |
| Results         | average_record     | boolean           |
| Results         | id                 | bigint            |
| Results         | time_ms            | numeric           |
| Results         | attempt            | bigint            |
| Results         | cube_name          | text              |
| Results         | meeting_id         | bigint            |
| Results         | round              | integer           |
| Results         | record             | boolean           |
| StartedAttempts | meeting_id         | bigint            |
| StartedAttempts | round              | integer           |
| StartedAttempts | attempt            | bigint            |
| StartedAttempts | id                 | bigint            |
| StartedAttempts | cube_name          | text              |

## Future Improvements/Features In Progress
- Admin page for simpler member result validation
- Member ability radars
- Member account settings page
  - Custom profile pictures, password and name settings, password reset request, etc.
- Membership request page
- UX enhancements

## Logging 
- Server side logging viewable in the terminal after executing `npm run dev`
  - Check for status codes from API 
- Client side logging available through the browser developer tools
  
## Contributors
- Allan Wang - Developer/Design
- Yuqi Zhu - Developer/Design
