# UBC-Cubing-Club

# Database schema:
- Members (*ID*, email, name)
- Meetings (*MeetingID*, date, passcode, description)
- Tournaments (***MeetingID***, Name)
- Results (*RID*, time, CubeName, ***ID***, **MeetingID**)
- Posts (*PID*, Likes, Description, Image)
- Events (*EventName*)

- Attends (***ID***, ***MeetingID***)
- Competes (***ID***, ***MeetingID***, rank)
- Publishes (***PID***, ***ID***, TimeStamp)
- Likes (***PID***, ***ID***, TimeStamp)
