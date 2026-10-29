// Office Halloween Trivia — zero-dependency Node.js server.
// Run: node server.js [port]
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

const PORT = Number(process.env.PORT) || Number(process.argv[2]) || 3000;
const DURATION = 20; // seconds per question
const ROUND = 5;     // questions per round
const HOST_KEY = process.env.HOST_KEY || crypto.randomBytes(4).toString("hex");

const QUESTIONS = [
 {t:"On All Saints’ Day (1 November) Spanish pastry shops fill up with a very specific sweet. Which one?",o:["Huesos de santo","Turrón","Roscón de Reyes","Torrijas"],a:0,f:"“Saint’s bones” are little marzipan tubes filled with sweetened egg yolk. They share the counter with buñuelos de viento, which legend says free a soul from purgatory with every bite."},
 {t:"Before pumpkins, what did people in Ireland and Scotland carve into lanterns?",o:["Potatoes","Turnips","Cabbages","Gourds"],a:1,f:"The jack-o’-lantern comes from the tale of Stingy Jack, doomed to roam the earth with a burning coal inside a turnip. Irish emigrants switched to pumpkins in America because they were bigger and far easier to carve."},
 {t:"On 11 November German children walk through the streets at dusk carrying paper lanterns. Which day are they celebrating?",o:["Nikolaustag","Oktoberfest","Martinstag","Walpurgisnacht"],a:2,f:"St. Martin’s Day remembers a Roman soldier who cut his cloak in half to share it with a beggar. After the procession, children eat a Weckmann, a sweet bread figure with a clay pipe in its hands."},
 {t:"In Bengal, on the night before Kali Puja, families light 14 lamps around the house to keep spirits away. What is the night called?",o:["Dhanteras","Bhoot Chaturdashi","Holi","Pongal"],a:1,f:"Bhoot Chaturdashi, literally “ghost fourteenth”, also comes with a menu: a dish of 14 kinds of leafy greens (choddo shaak) eaten to protect the family. This year it falls on 7 November."},
 {t:"In the shower scene of Psycho (1960), what did Hitchcock use as blood?",o:["Ketchup","Red paint","Chocolate syrup","Beet juice"],a:2,f:"The film was black and white, and Bosco chocolate syrup showed up darker and thicker on camera than fake blood. The 45-second scene took seven days to shoot and needed around 78 camera setups."},
 {t:"Which Galician tradition, revived in the 1990s, features carved pumpkins and a flaming drink called queimada?",o:["Samaín","Castanyada","Sanfermines","Magosto"],a:0,f:"Samaín takes its name from the Celtic festival Samhain. The town of Cedeira brought it back in 1990 as a local alternative to imported Halloween, and the conxuro (spell) is recited while the queimada burns."},
 {t:"Where was the phrase “trick or treat” first recorded in print?",o:["United States","Ireland","Scotland","Canada"],a:3,f:"The first known mention appeared in 1927 in a newspaper from Blackie, Alberta, Canada. In the US the phrase only became mainstream after the Second World War, once sugar rationing ended."},
 {t:"31 October is a public holiday in nine German states. Why?",o:["Reformation Day","Halloween","German Unity Day","Carnival"],a:0,f:"On 31 October 1517 Martin Luther is said to have nailed his 95 theses to a church door in Wittenberg. Hamburg, Bremen, Lower Saxony and Schleswig-Holstein only added the holiday in 2018, and Catholic states like Bavaria take 1 November off instead."},
 {t:"When does Diwali fall this year?",o:["8 November","31 October","15 November","25 October"],a:0,f:"Diwali moves with the lunar calendar and lands between mid-October and mid-November. In Chennai, Deepavali starts before dawn with an oil bath, new clothes and firecrackers, hours earlier than in the north of India."},
 {t:"In The Shining, Jack Nicholson improvised the line “Here’s Johnny!”. Who was he quoting?",o:["Johnny Cash","Johnny Carson","Johnny Depp","Johnny Rotten"],a:1,f:"It was the nightly intro of Johnny Carson on The Tonight Show. Stanley Kubrick, who lived in England, had no idea what it referred to and almost cut it from the film."},
 {t:"Which Spanish play is traditionally staged every year around 1 November?",o:["La Celestina","Fuenteovejuna","Don Juan Tenorio","Bodas de sangre"],a:2,f:"José Zorrilla’s 1844 drama ends with Don Juan in a cemetery surrounded by ghosts, which made it the perfect play for All Saints’ Day. Spanish theatres have kept the tradition for over 150 years."},
 {t:"Who wrote “The Legend of Sleepy Hollow”, the story of the Headless Horseman?",o:["Edgar Allan Poe","Washington Irving","H. P. Lovecraft","Nathaniel Hawthorne"],a:1,f:"Irving published it in 1820. The real village of North Tarrytown, New York, officially renamed itself Sleepy Hollow in 1996 and now runs a month-long Halloween season."},
 {t:"In the Indian folk-horror film Tumbbad (2018), a greedy family hunts for the gold of a cursed god. What is the god’s name?",o:["Hastar","Ravana","Kubera","Yama"],a:0,f:"Hastar is the first-born of the goddess of prosperity, cursed and never to be worshipped. The film was shot over six years, only during monsoon season, and its 2024 re-release made more money than the original run."},
 {t:"In data science, which spooky-sounding term describes two variables that look related but have no real connection?",o:["Overfitting","Data drift","Spurious correlation","Regression to the mean"],a:2,f:"Classic example: ice cream sales and shark attacks both rise in summer. Tyler Vigen’s website collects hundreds of these, such as Nicolas Cage films per year versus people drowning in swimming pools."},
 {t:"Which Spanish horror film is shot as found footage inside a Barcelona apartment building under quarantine?",o:["El orfanato","Verónica","[REC]","Los otros"],a:2,f:"[REC] (2007) was filmed in a real building at Rambla de Catalunya 34, and the actors never read a full script. Hollywood remade it a year later as Quarantine."},
 {t:"What does Gartner call the data a company collects and stores but never actually uses?",o:["Cold data","Dark data","Ghost data","Grey data"],a:1,f:"Surveys have estimated that around half of all stored enterprise data is dark: logs, old emails, duplicate files. It costs money, carries GDPR risk and nobody knows it is there."},
 {t:"In recruiting, what does “ghosting” mean?",o:["Remote-working on Halloween","Vanishing mid-process without a word","A silent reference check","Hiring an anonymous candidate"],a:1,f:"It cuts both ways: candidates disappear after an interview, and companies disappear after promising feedback. Surveys regularly find that a majority of job seekers admit to ghosting an employer at least once."},
 {t:"In Get Out (2017), where does hypnosis send its victims?",o:["The Upside Down","The Sunken Place","The Black Lodge","The Further"],a:1,f:"Jordan Peele made the film for about 4.5 million dollars and it earned over 250 million. He became the first Black screenwriter to win the Oscar for Best Original Screenplay."},
 {t:"GDPR Article 17 gives you a right that sounds designed for ghosts. Which one?",o:["Right to erasure","Right to haunt","Right to portability","Right to object"],a:0,f:"Also known as the “right to be forgotten”. It started in Spain: in 2014 the EU Court of Justice ruled in favour of Mario Costeja, a Spaniard who wanted Google to stop showing an old newspaper notice about a debt."},
 {t:"Which term went viral in 2022 for doing exactly what your job requires and nothing more?",o:["Ghost working","Zombie shift","Silent resignation","Quiet quitting"],a:3,f:"It started as a TikTok video by engineer Zaid Khan. Gallup later estimated that at least half of the US workforce fitted the description, which says more about managers than about employees."},
];

// ---------- Game state (in memory) ----------
let game = { phase: "lobby", q: 0, openedAt: 0 };
const players = new Map(); // id -> {id, token, name, score, answers: {q: {c, ms, pts}}}
const clients = new Set();  // SSE connections {res, playerId, isHost}

function lanIp() {
  for (const list of Object.values(os.networkInterfaces()))
    for (const i of list) if (i.family === "IPv4" && !i.internal) return i.address;
  return "localhost";
}
const LOCAL_JOIN_URL = `http://${lanIp()}:${PORT}/`;
function joinUrlFor(req) {
  const host = req.headers.host || "";
  if (!host || host.startsWith("localhost") || host.startsWith("127.")) return LOCAL_JOIN_URL;
  const proto = req.headers["x-forwarded-proto"] || "http";
  return `${proto}://${host}/`;
}

function ranked() {
  return [...players.values()].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .map((p, i) => ({ rank: i + 1, id: p.id, name: p.name, score: p.score }));
}
function distribution(q) {
  const d = [0, 0, 0, 0];
  for (const p of players.values()) { const a = p.answers[q]; if (a) d[a.c]++; }
  return d;
}
function snapshot(client) {
  const joinUrl = client.joinUrl || LOCAL_JOIN_URL;
  const q = QUESTIONS[game.q];
  const reveal = game.phase === "reveal";
  const s = {
    phase: game.phase, q: game.q, total: QUESTIONS.length, round: Math.floor(game.q / ROUND) + 1,
    dur: DURATION, openedAt: game.openedAt, now: Date.now(), players: players.size,
    question: (game.phase === "question" || reveal) ? { t: q.t, o: q.o } : null,
    reveal: reveal ? { a: q.a, f: q.f, dist: distribution(game.q) } : null,
    board: (game.phase === "leaderboard" || game.phase === "podium" || reveal) ? ranked().slice(0, 10) : null,
  };
  if (client.playerId && players.has(client.playerId)) {
    const p = players.get(client.playerId);
    const a = p.answers[game.q];
    s.you = { name: p.name, score: p.score, answered: a ? a.c : null, pts: a ? a.pts : null,
      rank: ranked().find(r => r.id === p.id).rank, of: players.size };
  }
  if (client.isHost) {
    s.host = { joinUrl, names: ranked().map(r => r.name),
      answered: [...players.values()].filter(p => p.answers[game.q]).length,
      dist: distribution(game.q), board: ranked().slice(0, 10) };
  }
  return s;
}
function broadcast() {
  for (const c of clients) {
    try { c.res.write(`data: ${JSON.stringify(snapshot(c))}\n\n`); } catch { clients.delete(c); }
  }
}

// ---------- HTTP ----------
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml" };
function serveStatic(file, res) {
  let fp = path.join(__dirname, "public", file);
  if (!fs.existsSync(fp)) fp = path.join(__dirname, file); // files uploaded without the public folder
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(fp)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(data);
  });
}
function json(res, code, body) { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(body)); }
function readBody(req) {
  return new Promise(resolve => { let b = ""; req.on("data", d => { b += d; if (b.length > 1e4) req.destroy(); }); req.on("end", () => { try { resolve(JSON.parse(b || "{}")); } catch { resolve({}); } }); });
}
function isHost(url) { return url.searchParams.get("key") === HOST_KEY; }
function playerFrom(body) { const p = players.get(body.id); return p && p.token === body.token ? p : null; }

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const p = url.pathname;

  if (p === "/") return serveStatic("play.html", res);
  if (p === "/host") return isHost(url) ? serveStatic("host.html", res) : (res.writeHead(403), res.end("Wrong host key"));
  if (p === "/style.css") return serveStatic("style.css", res);

  if (p === "/events") {
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" });
    const client = { res, playerId: url.searchParams.get("id"), isHost: isHost(url), joinUrl: joinUrlFor(req) };
    const pl = players.get(client.playerId);
    if (!pl || pl.token !== url.searchParams.get("token")) client.playerId = null;
    clients.add(client);
    res.write(`data: ${JSON.stringify(snapshot(client))}\n\n`);
    const ping = setInterval(() => { try { res.write(": ping\n\n"); } catch {} }, 20000);
    req.on("close", () => { clearInterval(ping); clients.delete(client); });
    return;
  }

  if (req.method === "POST" && p === "/join") {
    const body = await readBody(req);
    const name = String(body.name || "").trim().slice(0, 24);
    if (!name) return json(res, 400, { error: "Name required" });
    if (game.phase === "podium") return json(res, 409, { error: "The game is over" });
    const id = crypto.randomBytes(6).toString("hex"), token = crypto.randomBytes(12).toString("hex");
    players.set(id, { id, token, name, score: 0, answers: {} });
    broadcast();
    return json(res, 200, { id, token, name });
  }

  if (req.method === "POST" && p === "/answer") {
    const body = await readBody(req);
    const pl = playerFrom(body);
    if (!pl) return json(res, 401, { error: "Unknown player" });
    if (game.phase !== "question" || body.q !== game.q) return json(res, 409, { error: "Question is closed" });
    if (pl.answers[game.q]) return json(res, 409, { error: "Already answered" });
    const c = Number(body.c); if (!(c >= 0 && c <= 3)) return json(res, 400, { error: "Bad choice" });
    const elapsed = Math.min(DURATION, (Date.now() - game.openedAt) / 1000);
    if (elapsed >= DURATION) return json(res, 409, { error: "Time is up" });
    const correct = c === QUESTIONS[game.q].a;
    const pts = correct ? 500 + Math.round(500 * (1 - elapsed / DURATION)) : 0;
    pl.answers[game.q] = { c, ms: Math.round(elapsed * 1000), pts };
    pl.score += pts;
    broadcast();
    return json(res, 200, { ok: true });
  }

  if (req.method === "POST" && p.startsWith("/host/")) {
    if (!isHost(url)) return json(res, 403, { error: "Wrong host key" });
    const action = p.slice(6);
    if (action === "start") game = { phase: "question", q: 0, openedAt: Date.now() };
    else if (action === "reveal" && game.phase === "question") game.phase = "reveal";
    else if (action === "board" && game.phase === "reveal") game.phase = "leaderboard";
    else if (action === "next" && (game.phase === "reveal" || game.phase === "leaderboard")) {
      if (game.q + 1 >= QUESTIONS.length) game.phase = "podium";
      else game = { phase: "question", q: game.q + 1, openedAt: Date.now() };
    }
    else if (action === "reset") { game = { phase: "lobby", q: 0, openedAt: 0 }; players.clear(); }
    else return json(res, 400, { error: "Unknown action" });
    broadcast();
    return json(res, 200, { ok: true });
  }

  res.writeHead(404); res.end("Not found");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("\n  🎃  Office Halloween Trivia is running\n");
  console.log(`  Host link (open on the projector laptop):`);
  console.log(`    http://localhost:${PORT}/host?key=${HOST_KEY}\n`);
  console.log(`  Join link (what the QR code shows):`);
  console.log(`    ${LOCAL_JOIN_URL}\n`);
  console.log(`  Keep this window open while you play. Ctrl+C to stop.\n`);
});
