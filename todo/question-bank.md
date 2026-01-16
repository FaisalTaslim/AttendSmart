# AttendSmart Project – Interview / Viva Questions

## BASIC QUESTIONS (You must be confident here)

1. What is the main goal/purpose of your project?
2. What technologies did you use?
3. What was your role in the project?
4. What difficulties did you face and how did you overcome them?
5. What is unique about your system compared to existing attendance systems?
6. How is the data stored and retrieved?
7. How is your system different from biometric/RFID systems?
8. Explain your folder and file structure (MVC, public, views, etc.)
9. How did you ensure responsiveness and cross-device support?

## TECHNICAL DEEP DIVE

### Frontend
10. How did you handle form validation on the frontend?
11. What happens if a user enters invalid data?
12. Why did you choose vanilla JS over a framework like React?
13. How did you manage inter-page routing and shared components?
14. How did you handle responsiveness for tablets and mobiles?

### Backend
15. How did you set up routing in Express.js?
16. What happens when someone tries to access a route that doesn’t exist?
17. How are routes protected (authentication)?
18. How is session data managed? Do you use cookies, JWTs, or sessions?
19. What would happen if two people submit the form at the exact same time?
20. How did you design your MongoDB collections? Walk through the schema.
21. Why did you separate `Subject` as its own model?
22. What security measures are in place for backend (input sanitization, etc.)?
23. How would you scale this backend for 10,000+ users?

## EDGE CASE / SCENARIO QUESTIONS
24. What happens if a student submits the form twice?
25. Can a user fake attendance by inspecting or manipulating the frontend code?
26. If the teacher forgets to end the session, will it keep running forever?
27. What if the same user logs in from two devices?
28. Can a student rejoin and resubmit the same code?
29. What if someone spoofs the JavaScript auto-submit using DevTools?
30. How do you prevent students from marking attendance on behalf of others?
31. What if the teacher writes the wrong code on the board?
32. What happens if there’s a power cut during an attendance session?

## TRICKY QUESTIONS (Designed to make you think)
33. What if you accidentally delete a student from the database — can you recover?
34. Let’s say the same student joins multiple institutions — how would you track that?
35. Can you implement geolocation or IP filtering for more security?
36. What would you do differently if you had to rebuild this in React or Django?
37. If MongoDB crashes, what’s your recovery plan?
38. Can you detect proxy/VPN users?
39. How would you build a monthly attendance report from this data?
40. How would you show average attendance trends across departments?

## VULNERABILITY / FLAW-EXPOSING QUESTIONS
41. Is your database vulnerable to NoSQL injection?
42. Are your endpoints protected from brute force or spam hits?
43. What if a student changes their attendance date using a modified request?
44. Is your system dependent on accurate system time? Can that be abused?
45. If a malicious user inspects the frontend and finds the endpoint, can they send a fake POST request?

## PROJECT MGMT & UX QUESTIONS
46. How would you onboard a new institute to use AttendSmart?
47. What will the teacher's workflow look like in real-time?
48. Is your UI intuitive for non-tech-savvy users?
49. Can a student review or download their past attendance?
50. Have you received any feedback from real users?

## FUTURE SCOPE QUESTIONS
51. How would you turn this into a mobile app?
52. Would you allow biometric integration in future versions?
53. How will you implement real-time charts for analytics?
54. Could this system integrate with Google Classroom or LMS platforms?
55. How will you monetize this product if it becomes public?

## BONUS QUESTION
> “If we pay you right now to replace our college's attendance system, how soon can you go live?”

Suggested Answer:
> "We'd need 1–2 weeks for pilot deployment, student data import, and basic training for faculty. Our current system is lightweight and built for easy onboarding."

## TIP TO SHINE IN PRESENTATION
When asked a flaw-exposing question, you can respond with:
> "That's a great observation. We’ve thought about it and either handled it this way…"
or
> "We hadn’t considered that yet, but if this were a production version, I’d patch it by doing…"
