# Employee Face Recognition Methodology

This document describes the end-to-end methodology for employee face recognition and attendance marking, based on the current client and server implementation.

## Goals
- Recognize employees from a live camera stream.
- Mark attendance exactly once per recognized employee per active session.
- Avoid false positives and duplicate marks in a single camera session.

## Components
- Client: `public/js/face-api/recognition/employee/live-face-detection.js`
- Server: `controllers/face.../recognition/employee/*.js`
- Routes: `/dashboard/employee/face-data`, `/dashboard/employee/increment-attendance`

## Methodology

### 1. Initialization and Model Readiness
- On `DOMContentLoaded`, the script grabs the live video element and a stage container for drawing overlays.
- A `markedEmployees` set is created to prevent duplicate attendance marking within the current session.
- The script fetches employee face descriptors from the server via `GET /dashboard/employee/face-data`.
- Descriptors are converted to `Float32Array` and wrapped into `faceapi.LabeledFaceDescriptors`.
- When the video starts playing, the script waits for `window.faceModelsReady` (if present) to ensure models are loaded.

### 2. Descriptor Loading and Validation
- The client retries fetching descriptors on video play if none were loaded during initialization.
- If no descriptors are found after retry, the client logs a warning and exits the recognition loop to avoid unnecessary processing.

### 3. Live Recognition Loop
- A canvas overlay is created and matched to the video resolution.
- A `FaceMatcher` is created with a distance threshold of `0.6`.
- Every 500ms:
  - Detect all faces in the video stream.
  - Compute face landmarks and descriptors.
  - Resize results to display size, clear canvas, and draw detection boxes.
  - For each detection, compute the best match label.

### 4. Attendance Marking Logic
- If the best match is not `"unknown"` and the employee code has not been seen in this session:
  - Add the employee code to `markedEmployees`.
  - Send `POST /dashboard/employee/increment-attendance` with the employee code.
  - If the server responds with failure, remove the employee from `markedEmployees` to allow retry.

### 5. Server-Side Attendance Validation
- `GET /dashboard/employee/face-data`:
  - Checks session authorization.
  - Filters employees by `faceUploaded`, not deleted, not suspended, and within the same org.
  - Returns codes and descriptors for matching.
- `POST /dashboard/employee/increment-attendance`:
  - Validates the employee code.
  - Ensures the employee exists and is active.
  - Verifies there is an active session for the employee’s org + shift.
  - Updates the employee’s monthly summary if this session has not already been marked.
  - Returns success, or “already marked” if the session was previously recorded.

### 6. Session Cleanup
- When the video is paused or ended, the detection interval is cleared to stop processing.

## Key Data Flow Summary
- Client loads descriptors → live matching → post attendance.
- Server validates session and updates summaries with session uniqueness.

## Edge Cases and Safeguards
- Missing video element aborts recognition.
- No descriptors available stops recognition to avoid false matches.
- Duplicate attendance is prevented per session (client set + server check).
- Active session requirement prevents marking outside valid attendance windows.
