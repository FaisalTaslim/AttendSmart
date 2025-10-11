### What You Need

* A running local web server (e.g., Node.js, PHP, Python, React, etc.)
* [ngrok](https://ngrok.com/) installed
* Internet connection on both PC and smartphone
* Your smartphone and PC should be connected to the internet (they **don’t** need to be on the same network)

## ⚙️ Step 1: Install ngrok

### Windows

1. Go to [https://ngrok.com/download](https://ngrok.com/download)
2. Download and unzip it.
3. Move the `ngrok.exe` file to a folder (e.g., `C:\ngrok`)
4. Add that folder to your system **PATH** (optional but recommended).

### Step 2: Connect Your ngrok Account

1. If you haven’t already, sign up at [ngrok.com](https://ngrok.com/).
2. Then copy your **Auth Token** from the ngrok dashboard.
3. In your terminal: "ngrok config add-authtoken <your_auth_token_here>"

### Step 3: Run Your Local Server

For example:
* React app: `npm start` → runs on `http://localhost:3000`
* Node.js: `node app.js` → `http://localhost:8080`
* PHP: `php -S localhost:8000`
* Python: `python -m http.server 5000`

### Step 4: Expose Your Localhost with ngrok

In a new terminal window, run: "bash: ngrok http 3000"
(Replace `3000` with your actual local port)