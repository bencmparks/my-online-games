/* Shared 2-device play helper (WebRTC via PeerJS public broker).
   Usage: Online.panel(containerEl, "game-id", {
     onStart(role) // role: "host" or "guest"; fires once both devices are connected
     onMessage(msg) // data from the other device (plain JSON-able objects)
     onEnd(reason) // other device left / connection lost / leave pressed
   }) -> { send(msg), active(), role(), leave() }
   Host = player 1, guest = player 2. */
(function () {
  const PEER_SRC = "https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js";
  let loading = null;
  function loadPeer() {
    if (window.Peer) return Promise.resolve();
    if (!loading) loading = new Promise((ok, bad) => {
      const s = document.createElement("script");
      s.src = PEER_SRC; s.onload = ok; s.onerror = () => { loading = null; bad(new Error("Could not load the online library. Check your connection.")); };
      document.head.append(s);
    });
    return loading;
  }
  const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const newCode = () => Array.from({ length: 4 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");

  function panel(el, game, cb) {
    let peer = null, conn = null, role = null, started = false;
    el.innerHTML = '<div class="online-box" style="margin:.6rem auto;padding:.6rem;border:1px dashed #64748b;border-radius:.6rem;max-width:34rem;text-align:center">' +
      '<strong>Play on 2 devices</strong> ' +
      '<button type="button" data-o="host">Host game</button> ' +
      '<input data-o="code" type="text" maxlength="4" size="6" placeholder="CODE" aria-label="Room code" style="text-transform:uppercase;text-align:center"> ' +
      '<button type="button" data-o="join">Join</button> ' +
      '<button type="button" data-o="leave" hidden>Leave</button>' +
      '<div data-o="status" aria-live="polite" style="margin-top:.4rem;font-size:.9rem;color:#fde047">One device hosts and shares the 4-letter code; the other joins with it.</div></div>';
    const q = n => el.querySelector(`[data-o="${n}"]`);
    const setStatus = t => { q("status").textContent = t; };
    function ui(connected) { q("host").hidden = q("join").hidden = q("code").hidden = connected; q("leave").hidden = !connected; }

    function attach(c) {
      conn = c;
      c.on("open", () => { started = true; ui(true); setStatus(role === "host" ? "Connected! You are Player 1." : "Connected! You are Player 2."); cb.onStart && cb.onStart(role); });
      c.on("data", d => cb.onMessage && cb.onMessage(d));
      c.on("close", () => end("The other player left."));
      c.on("error", () => end("Connection lost."));
    }
    function end(reason) {
      const was = started;
      try { conn && conn.close(); } catch (e) { }
      try { peer && peer.destroy(); } catch (e) { }
      conn = peer = null; role = null; started = false; ui(false);
      setStatus(reason || "Left the online game.");
      if (was && cb.onEnd) cb.onEnd(reason);
    }
    function open(host, code) {
      if (peer) return;
      setStatus("Connecting...");
      loadPeer().then(() => {
        role = host ? "host" : "guest";
        peer = host ? new Peer(`mog-${game}-${code}`) : new Peer();
        peer.on("error", err => { const t = err.type === "unavailable-id" ? "That code is in use, try hosting again." : err.type === "peer-unavailable" ? "No game found with that code." : "Connection problem: " + (err.type || "unknown"); end(t); });
        peer.on("open", () => {
          if (host) { setStatus(`Room ${code} is open. Tell your friend the code!`); ui(true); q("leave").hidden = false; peer.on("connection", c => { if (conn) { c.close(); return; } attach(c); }); }
          else attach(peer.connect(`mog-${game}-${code}`, { reliable: true }));
        });
      }).catch(e => end(e.message));
    }
    q("host").onclick = () => open(true, newCode());
    q("join").onclick = () => { const c = q("code").value.trim().toUpperCase(); if (c.length !== 4) { setStatus("Enter the 4-letter code."); return; } open(false, c); };
    q("leave").onclick = () => end("Left the online game.");
    addEventListener("beforeunload", () => { try { peer && peer.destroy(); } catch (e) { } });
    return {
      send(m) { if (conn && conn.open) conn.send(m); },
      active: () => started,
      role: () => role,
      leave: () => end("Left the online game.")
    };
  }
  window.Online = { panel };
})();
