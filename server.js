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
 {t:"El 1 de noviembre, Todos los Santos, las pastelerías españolas se llenan de un dulce muy concreto. ¿Cuál?",o:["Huesos de santo","Turrón","Roscón de Reyes","Torrijas"],a:0,f:"Los huesos de santo son tubitos de mazapán rellenos de yema confitada. Comparten mostrador con los buñuelos de viento, que según la leyenda liberan un alma del purgatorio con cada bocado."},
 {t:"Antes de las calabazas, ¿qué tallaban en Irlanda y Escocia para hacer faroles?",o:["Patatas","Nabos","Coles","Calabacines"],a:1,f:"La jack-o’-lantern viene de la leyenda de Jack el Tacaño, condenado a vagar por la tierra con una brasa dentro de un nabo. Los emigrantes irlandeses cambiaron al calabaza en América porque era más grande y mucho más fácil de tallar."},
 {t:"El 11 de noviembre los niños alemanes recorren las calles al anochecer con farolillos de papel. ¿Qué día celebran?",o:["Nikolaustag","Oktoberfest","Martinstag","Walpurgisnacht"],a:2,f:"El día de San Martín recuerda a un soldado romano que partió su capa en dos para compartirla con un mendigo. Tras la procesión, los niños comen un Weckmann, una figura de pan dulce con una pipa de barro en las manos."},
 {t:"En Bengala, la noche antes de Kali Puja, las familias encienden 14 lámparas por la casa para ahuyentar a los espíritus. ¿Cómo se llama esa noche?",o:["Dhanteras","Bhoot Chaturdashi","Holi","Pongal"],a:1,f:"Bhoot Chaturdashi, literalmente «la decimocuarta de los fantasmas», también tiene menú: un plato con 14 tipos de verduras de hoja (choddo shaak) que protege a la familia. Este año cae el 7 de noviembre."},
 {t:"En la escena de la ducha de Psicosis (1960), ¿qué usó Hitchcock como sangre?",o:["Kétchup","Pintura roja","Sirope de chocolate","Zumo de remolacha"],a:2,f:"La película era en blanco y negro y el sirope de chocolate Bosco se veía más oscuro y espeso en cámara que la sangre falsa. La escena dura 45 segundos, se rodó en siete días y necesitó unas 78 posiciones de cámara."},
 {t:"¿Qué tradición gallega, recuperada en los años 90, tiene calabazas talladas y una bebida en llamas llamada queimada?",o:["Samaín","Castanyada","Sanfermines","Magosto"],a:0,f:"El Samaín toma el nombre de la fiesta celta Samhain. Cedeira lo recuperó en 1990 como alternativa local al Halloween importado, y el conxuro se recita mientras arde la queimada."},
 {t:"¿Dónde se imprimió por primera vez la expresión «trick or treat»?",o:["Estados Unidos","Irlanda","Escocia","Canadá"],a:3,f:"La primera mención conocida apareció en 1927 en un periódico de Blackie, Alberta, Canadá. En Estados Unidos solo se popularizó tras la Segunda Guerra Mundial, cuando terminó el racionamiento de azúcar."},
 {t:"El 31 de octubre es festivo en nueve estados alemanes. ¿Por qué?",o:["Día de la Reforma","Halloween","Día de la Unidad Alemana","Carnaval"],a:0,f:"El 31 de octubre de 1517 Martín Lutero clavó, según la tradición, sus 95 tesis en la puerta de una iglesia de Wittenberg. Hamburgo, Bremen, Baja Sajonia y Schleswig-Holstein solo añadieron el festivo en 2018, y los estados católicos como Baviera libran el 1 de noviembre."},
 {t:"¿Cuándo cae Diwali este año?",o:["8 de noviembre","31 de octubre","15 de noviembre","25 de octubre"],a:0,f:"Diwali sigue el calendario lunar y cae entre mediados de octubre y mediados de noviembre. En Chennai, Deepavali empieza antes del amanecer con un baño de aceite, ropa nueva y petardos, horas antes que en el norte de la India."},
 {t:"En El resplandor, Jack Nicholson improvisó la frase «Here’s Johnny!». ¿A quién citaba?",o:["Johnny Cash","Johnny Carson","Johnny Depp","Johnny Rotten"],a:1,f:"Era la presentación nocturna de Johnny Carson en The Tonight Show. Stanley Kubrick, que vivía en Inglaterra, no tenía ni idea de a qué se refería y estuvo a punto de cortarla."},
 {t:"¿Qué obra de teatro española se representa por tradición cada año alrededor del 1 de noviembre?",o:["La Celestina","Fuenteovejuna","Don Juan Tenorio","Bodas de sangre"],a:2,f:"El drama de José Zorrilla (1844) termina con Don Juan en un cementerio rodeado de fantasmas, lo que la convirtió en la obra perfecta para Todos los Santos. Los teatros españoles mantienen la tradición desde hace más de 150 años."},
 {t:"¿Quién escribió «La leyenda de Sleepy Hollow», la historia del Jinete sin Cabeza?",o:["Edgar Allan Poe","Washington Irving","H. P. Lovecraft","Nathaniel Hawthorne"],a:1,f:"Irving la publicó en 1820. El pueblo real de North Tarrytown, en Nueva York, se rebautizó oficialmente como Sleepy Hollow en 1996 y hoy celebra un mes entero de Halloween."},
 {t:"En la India, ¿qué festival se celebra lanzando polvos de colores?",o:["Holi","Diwali","Navratri","Onam"],a:0,f:"Holi celebra la victoria del bien sobre el mal: la noche anterior se encienden hogueras (Holika Dahan) que recuerdan cómo la demonia Holika ardió intentando quemar a su sobrino Prahlad. Primero fuego y demonios, después los colores."},
 {t:"En ciencia de datos, ¿qué término de nombre inquietante describe dos variables que parecen relacionadas sin tener ninguna conexión real?",o:["Overfitting","Data drift","Correlación espuria","Regresión a la media"],a:2,f:"Ejemplo clásico: las ventas de helado y los ataques de tiburón suben a la vez en verano. La web de Tyler Vigen recopila cientos, como las películas de Nicolas Cage por año frente a los ahogamientos en piscinas."},
 {t:"¿Qué película de terror española está rodada como metraje encontrado dentro de un edificio de Barcelona en cuarentena?",o:["El orfanato","Verónica","[REC]","Los otros"],a:2,f:"[REC] (2007) se rodó en un edificio real de Rambla de Catalunya 34, y los actores nunca leyeron el guion completo. Hollywood la rehízo un año después como Quarantine."},
 {t:"¿Cómo llama Gartner a los datos que una empresa recoge y almacena pero nunca utiliza?",o:["Cold data","Dark data","Ghost data","Grey data"],a:1,f:"Las encuestas estiman que cerca de la mitad de los datos almacenados por las empresas son dark data: logs, correos viejos, archivos duplicados. Cuestan dinero, suponen riesgo bajo el RGPD y nadie sabe que están ahí."},
 {t:"En selección de personal, ¿qué significa «ghosting»?",o:["Teletrabajar en Halloween","Desaparecer a mitad de proceso sin decir nada","Una referencia laboral silenciosa","Contratar a un candidato anónimo"],a:1,f:"Funciona en ambas direcciones: candidatos que desaparecen tras la entrevista y empresas que desaparecen tras prometer feedback. Las encuestas muestran una y otra vez que la mayoría de quienes buscan empleo admiten haber hecho ghosting a una empresa al menos una vez."},
 {t:"¿Qué videoclip de 1983 convirtió a los zombis en estrellas del pop?",o:["Beat It","Billie Jean","Thriller","Bad"],a:2,f:"Thriller, de Michael Jackson, dura 14 minutos y lo dirigió John Landis, el de Un hombre lobo americano en Londres. La voz tenebrosa del final es Vincent Price, leyenda del cine de terror, y la coreografía se baila cada Halloween en medio mundo."},
 {t:"El artículo 17 del RGPD reconoce un derecho que parece pensado para fantasmas. ¿Cuál?",o:["Derecho de supresión","Derecho a aparecerse","Derecho a la portabilidad","Derecho de oposición"],a:0,f:"También conocido como «derecho al olvido». Nació en España: en 2014 el Tribunal de Justicia de la UE dio la razón a Mario Costeja, que quería que Google dejara de mostrar un anuncio antiguo de un periódico sobre una deuda."},
 {t:"Según el Estatuto de los Trabajadores, ¿cuántos días de permiso retribuido te corresponden por mudanza?",o:["Ninguno","1 día","2 días","3 días"],a:1,f:"Artículo 37.3.c: un día por traslado del domicilio habitual. Es uno de los permisos más desconocidos, y sí, lo tienes que pedir antes y justificar después. Ahora ya sabéis que RRHH lee el Estatuto hasta en Halloween."},
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
