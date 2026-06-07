Employee Attendance Marking flow: 
- [admin.ejs](views/dashboard/admin.ejs) clicks on 'start-session'.  
- The page gets redirected to [employee-session.js](public/js/page-specific/dashboard/admin/employee-session.js) page where we first check if the session is active or not and based on that decision we start the session. You can take a look at [attendance.js](controllers/dashboards/admin/attendance.js) 
- In [attendance.js](controllers/dashboards/admin/attendance.js) when the session is being started, also make sure that totalDays of all employees with the shift 'day' gets incremented by +1 in [employee-summary.js](models/statistics/employee-summary.js) 
- Once the session is successfully started, the admin gets redirected to '/dashboard/admin/capture-attendance?for=employee&session=${sessionData.sessionCode}', as mentioned in [employee-session.js](public/js/page-specific/dashboard/admin/employee-session.js).
- which takes us to [capture-attendance.ejs](views/dashboards/capture-attendance.ejs) page.

The next flow becomes:
- Once the [capture-attendance.ejs](views/dashboards/capture-attendance.ejs) page is open, the employee clicks on 'start-camera'.
- live camera starts. You can look at [recognize.js](public/js/face-api/recognition/recognize.js) 
- it fetches all the employees descriptors from the backend. 
- then fetches the descriptors of the person currently standing in front of the camera.
- compares the descriptors. If it matches, it proceeds for attendance marking: /face/mark-attendance route as shown in [recognize.js](public/js/face-api/recognition/recognize.js) 
- In the backend:
  - if it's a check-in, simply push the history: [
      {
        code: String,
        name: String,
        status: {
          type: String,
          enum: ['late', 'on-time'],
        },
        checkIn: Date,
        checkOut: Date,
        _id: false,
      }
    ], array into the [employee-attendance-history.js](models/logs/employee-attendance-history.js) model. Leave the checkOut part empty. That will be handled in the next part. To check if the user is late or on-time, do (currentTime >= checkInTime + grace) in [schedule.js](models/schedule/schedule.js). And then save the document.
  - if it's check-out. check if the user's documente exists in history[] array of [employee-attendance-history.js](models/logs/employee-attendance-history.js). 
     - If it exists: fill the checkOut time, and then increment the attendedDays += 1 in [employee-summary.js](models/statistics/employee-summary.js) 
     - else, return with an error, "attendance marking failed, because  user didn't check-in first".

Attendance marking for students:
- [teacher.js](routes/dashboard/teacher.js) starts the session by selecting the fields of the form. 
- It goes to [attendance.js](controllers/dashboards/teacher/attendance.js) to start the session. 
- After the session has been started, teacher gets redirected to [qr.ejs](views/attendance/qr.ejs) page, displaying the details of the session. 
- Now from student's pov:
  - student selects mark attedance in [school-student](controllers/dashboards/school-student/) or [college-student](controllers/dashboards/college-student/) That redirects to [scanner.ejs](views/attendance/scanner.ejs) page.
  -  The user scans the qr. 
  - If successfull: it redirects the users to /dashboard/admin/capture-attendance?for=student&type=${type}&session=${qrData.sessionCode} which is [capture-attendance.ejs](views/dashboards/capture-attendance.ejs) page.
  - Now the system will fetch the backend face data, of all students in [recognize.js](public/js/face-api/recognition/recognize.js) .
     -  Since students are of two types in the system school-students, and college-students? To select an appropriate model to fetch the face data, you can use ?type=[value] that was passed in the url before getting redirected to capture-attendance page, or you can do req.session.user.role, which ever suits you best.
  - If the data fetched successfully:
     - calculate the descriptors of the person in front of the video camera. 
     - if descriptors current matches with any of the descritpors fetched from backend...proceed to mark their attendance.
     - else give an error.
  - to mark their attendance, once face matches, redirect to /face/mark-attendance?user=${window.capturePageData.isUser} as shown in [recognize.js](public/js/face-api/recognition/recognize.js):
      - if college-student: 
           - find their [student-summary.js](models/statistics/student-summary.js) using their code, and subject
              - if found: increment the attendedDays by +1.
               - else return error.
     - if school-student:
           - find their [student-summary.js](models/statistics/student-summary.js) using their code, and subject. Subject can be null type for school-students, alright?
           - If found: increment the attendedDays by +1.
           - else return error.
  - log all the data in [student-attendance-history.js](models/logs/student-attendance-history.js) 

Now, help me write code for this attendance flow please. I've written half of the codes for you already. You just need to check if all the things are connected well so far, and design the final attendance marking pipeline.