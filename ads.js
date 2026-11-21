// Cross-promo "ads" for other games on this site. Clicking one opens that game and gives a reward once per ad.
// Usage: GameAds.init({ reward: "+150 coins", onReward: () => {...}, mount: element (optional) })
(function () {
  const GAMES = [
    ["snake", "Snake", "🐍", "Eat, grow, don't crash!"],
    ["connect-4", "Connect 4", "🔴", "Line up four to win."],
    ["breakout", "Brick Breaker", "🧱", "Smash every brick."],
    ["minesweeper", "Minesweeper", "💣", "Think before you click."],
    ["memory-match", "Memory Match", "🃏", "Find all the pairs."],
    ["flappy-parrot", "Flappy Parrot", "🦜", "Flap through the pipes."],
    ["tank-duel", "Tank Duel", "🛡️", "Outgun your rival."],
    ["kart-rush", "Kart Rush", "🏎️", "Ramps, gliders, speed."],
    ["hoops", "Hoops", "🏀", "Sink the shot."],
    ["plinko", "Plinko", "🎯", "Drop it and pray."],
    ["space-rocks", "Space Rocks", "🚀", "Blast the asteroids."],
    ["fruit-slice", "Fruit Slice", "🍉", "Slice, don't miss."],
    ["mole-smash", "Mole Smash", "🔨", "Whack them all."],
    ["air-hockey", "Air Hockey", "🏒", "Fast table showdown."],
    ["pig-escape", "Pig Escape", "🐷", "Outsmart the farm."],
    ["ledge-throw", "Cliff Chucker", "🪂", "Fling Bob far."],
    ["element-merging", "Element Merging", "⚗️", "Merge water, fire, earth and air."],
    ["element-playground", "Element Playground", "🔥", "Sand, lava, water and more."],
    ["tower-defense", "Tower Defense", "🏰", "Hold the line."],
    ["bowling", "Bowling", "🎳", "Strike!"],
  ];
  const here = location.pathname.split("/").filter(Boolean).slice(-1)[0] || "";
  const pool = GAMES.filter((g) => g[0] !== here && location.pathname.indexOf("/" + g[0] + "/") < 0);
  let timer = null, inited = false;
  const coinKey = "adCoins";
  const getCoins = () => { try { return +localStorage.getItem(coinKey) || 0; } catch (e) { return 0; } };
  const addCoins = (n) => { try { localStorage.setItem(coinKey, getCoins() + n); } catch (e) {} };

  function init(opt) {
    if (inited) return;
    inited = true;
    opt = opt || {};
    // Games without their own reward give site-wide Ad Coins
    const dflt = !opt.onReward;
    
    const box = document.createElement("div");
    box.id = "gameAd";
    box.style.cssText =
      "display:flex;align-items:center;justify-content:center;gap:.7rem;margin:.6rem auto;max-width:34rem;padding:.55rem .9rem;" +
      "border:.15rem dashed #f59e0b;border-radius:.7rem;background:rgba(245,158,11,.12);color:#fde68a;font:700 .95rem Arial,sans-serif";
    (opt.mount || document.querySelector("main") || document.body).appendChild(box);
    let cur = -1, busy = false;
    const label = () => (dflt ? "+10 Ad Coins (" + getCoins() + ")" : opt.reward || "reward");

    function next() {
      let i;
      do { i = Math.floor(Math.random() * pool.length); } while (pool.length > 1 && i === cur);
      cur = i;
      const g = pool[i];
      box.innerHTML =
        '<span style="font-size:1.8rem">' + g[2] + "</span>" +
        '<span style="text-align:left"><small style="opacity:.7;letter-spacing:.05em">AD</small><br>' + g[1] + " – " + g[3] + "</span>" +
        '<button style="background:#f59e0b;color:#1c1917;border:0;border-radius:.5rem;padding:.4rem .7rem;font:inherit;cursor:pointer">🎬 Get hint: watch (' + label() + ")</button>";
      box.lastChild.onclick = () => watch(g);
    }

    // Shows a "video" of someone playing the advertised game: the real game runs in a frame and is played by simulated input
    function watch(g) {
      if (busy) return;
      busy = true;
      const ov = document.createElement("div");
      ov.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.88);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5rem;font:700 1rem Arial,sans-serif;color:#fff";
      ov.innerHTML =
        '<div><span style="color:#ef4444">● REC</span> Gameplay video: someone playing ' + g[2] + " " + g[1] + "</div>" +
        '<div style="position:relative;width:min(92vw,640px);height:min(60vh,420px);border:.2rem solid #f59e0b;border-radius:.6rem;overflow:hidden;background:#000">' +
        '<iframe src="../' + g[0] + '/" style="width:100%;height:100%;border:0;pointer-events:none" tabindex="-1"></iframe></div>' +
        '<div style="width:min(92vw,640px);height:.5rem;background:#444;border-radius:1rem;overflow:hidden"><i style="display:block;height:100%;width:0;background:#f59e0b;transition:width 1s linear"></i></div>' +
        '<div class="adm">Watch to the end to get: ' + label() + '</div>' +
        '<button disabled style="background:#555;color:#ccc;border:0;border-radius:.5rem;padding:.5rem 1rem;font:inherit">Wait...</button>';
      document.body.appendChild(ov);
      const fr = ov.querySelector("iframe"), bar = ov.querySelector("i"), msg = ov.querySelector(".adm"), btn = ov.querySelector("button");
      const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "a", "d", "w", "s"];
      let held = null, played;
      const play = () => {
        try {
          const w = fr.contentWindow, d = w.document;
          if (held) { d.dispatchEvent(new w.KeyboardEvent("keyup", { key: held, bubbles: true })); w.dispatchEvent(new w.KeyboardEvent("keyup", { key: held })); }
          held = keys[Math.floor(Math.random() * keys.length)];
          const ev = { key: held, code: held === " " ? "Space" : held, bubbles: true };
          d.dispatchEvent(new w.KeyboardEvent("keydown", ev)); w.dispatchEvent(new w.KeyboardEvent("keydown", ev));
          const c = d.querySelector("canvas") || d.body, r = c.getBoundingClientRect();
          const m = { clientX: r.left + Math.random() * r.width, clientY: r.top + Math.random() * r.height, bubbles: true };
          c.dispatchEvent(new w.MouseEvent("mousemove", m));
          if (Math.random() < 0.5) { c.dispatchEvent(new w.MouseEvent("mousedown", m)); c.dispatchEvent(new w.MouseEvent("mouseup", m)); c.dispatchEvent(new w.MouseEvent("click", m)); }
        } catch (e) {}
      };
      fr.addEventListener("load", () => { play(); played = setInterval(play, 350); });
      let sec = 0;
      const tick = setInterval(() => {
        sec++;
        bar.style.width = (sec / 8) * 100 + "%";
        if (sec >= 8) {
          clearInterval(tick);
          clearInterval(played);
          if (opt.onReward) opt.onReward();
          if (dflt) addCoins(10);
          msg.textContent = "Reward: " + (dflt ? "+10 Ad Coins! Total " + getCoins() : opt.reward);
          btn.disabled = false;
          btn.textContent = "Close";
          btn.style.cssText = "background:#22c55e;color:#fff;border:0;border-radius:.5rem;padding:.5rem 1rem;font:inherit;cursor:pointer";
          btn.onclick = () => { ov.remove(); busy = false; next(); };
        }
      }, 1000);
      setTimeout(() => (bar.style.width = "12%"), 30);
    }
    next();
  }

  window.GameAds = { init };
  // Games that do not call init themselves get a default ad once the page has loaded
  addEventListener("DOMContentLoaded", () => setTimeout(() => init(), 0));
})();
