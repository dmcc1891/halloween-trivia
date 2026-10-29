# Office Halloween Trivia

Kahoot-style quiz. The host projects one screen; players join from their phones by scanning a QR code. No accounts for players.

## Run online (Render.com, free)

1. Upload this folder to a GitHub repository.
2. On render.com: New → Web Service → connect the repository.
   - Runtime: Node. Build command: leave empty. Start command: `node server.js`
   - Environment variable: `HOST_KEY` = any secret word you choose.
3. Deploy. Render gives you a URL like `https://your-app.onrender.com`.
   - Host screen: `https://your-app.onrender.com/host?key=YOUR_SECRET_WORD`
   - Players: `https://your-app.onrender.com/` (the QR on the host screen points there)

The free plan sleeps after inactivity: open the host link a few minutes before the party so it wakes up.

## Run locally (optional)

`node server.js` with Node 18+, then open the links printed in the terminal.

## Flow

Start the quiz → countdown (20 s) → Reveal answer → Show standings / Next question → Final podium.
Scoring: 500 points for a correct answer plus up to 500 bonus for speed, timed on the server.

## Edit the questions

Edit the `QUESTIONS` array at the top of `server.js`: text `t`, four options `o`, index of the correct option `a` (0–3), fun fact `f`.
