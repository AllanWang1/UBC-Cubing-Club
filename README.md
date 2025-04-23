# UBC-Cubing-Club

# Database schema:
- Members (*ID*, email, name)
- Meetings (*MeetingID*, date, passcode)
- Tournaments (***MeetingID***, Name)
- Results (*RID*, time, CubeName, ***ID***, **MeetingID**, TimeStamp)
- Posts (*PID*, Likes, Description, Image)

- Attends (***ID***, ***MeetingID***)
- Competes (***ID***, ***MeetingID***)
- Posts (***PID***, ***ID***, TimeStamp)
- Likes (***PID***, ***ID***, TimeStamp)
