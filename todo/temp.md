Algorithm for attendance flow:

- if(window.isUser === 'employee):
    - if(window.type === 'check-in'):
        - identify the face, and the descriptor from the live video.
        - send a fetch request to the backend to get the stored descriptors of all employees: /dashboard/admin/capture-attendance/fetch-data?user=employee.
        - when that is received:
          - compare the current descriptors <> to all the stored and existing descriptors.
          - if match found:
            - console.log(user.code) with whom the match founds.
            - send another fetch request to /dashboard/admin/capture-attendance/mark-attendance?user=employee and make sure to send {sessionCode, window.type, window.isUser, usercode}
    - else:
       //follow the same procedure as above. Maybe merge this with above itself if the procedure remains the same and since we're already passing window.type to the backend anyways. In the backend, we'll seperate them and there will be different methods.
    - close the camera. Again when another user comes, they'll do start camera, and this same process will repeat again.
- else 'student':
    - identify the face, and generate a descriptor from live video.
    - send fetch request to backend to get the stored descriptors of all students from same dept (narrowing it down to reduce computation): /dashboard/admin/capture-attendance/fetch-data?user=student&dept=${window.dept}
    - when that is received:
      - compare the current descriptors <> to all the stored and existing descriptors.
        - if match found:
        - console.log(user.code) with whom the match founds.
        - send another fetch request to /dashboard/admin/capture-attendance/mark-attendance?user=student and make sure to send {sessionCode, window.type, window.isUser, usercode}
