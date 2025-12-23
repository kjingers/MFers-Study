# Data Model (from planning docs)

This is the initial entity model (Azure Table Storage) with Study → Week → Questions, plus optional Attendance.

> Source: MFers App - Data Model (uploaded)

Key decisions:
- Use StudyId as a partition key for grouping weeks
- WeekId as partition key for questions/attendance
- Keep WeekDate as the Tuesday anchor
