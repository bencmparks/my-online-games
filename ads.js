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
  ];
  const here = location.pathname.split("/").filter(Boolean).slice(-1)[0] || "";
  const pool = GAMES.filter((g) => g[0] !== here && location.pathname.indexOf("/" + g[0] + "/") < 0);
  let timer = null;

  function init(opt) {
    opt = opt || {};
    const box = document.createElement("a");
    box.id = "gameAd";
    box.target = "_blank";
    box.rel = "noopener";
    box.style.cssText =
      "display:flex;align-items:center;justify-content:center;gap:.7rem;margin:.6rem auto;max-width:34rem;padding:.55rem .9rem;" +
      "border:.15rem dashed #f59e0b;border-radius:.7rem;background:rgba(245,158,11,.12);color:#fde68a;text-decoration:none;font:700 .95rem Arial,sans-serif;cursor:pointer";
    (opt.mount || document.querySelector("main") || document.body).appendChild(box);
    let cur = -1, claimed = false;

    function next() {
      let i;
      do { i = Math.floor(Math.random() * pool.length); } while (pool.length > 1 && i === cur);
      cur = i;
      claimed = false;
      const g = pool[i];
      box.href = "../" + g[0] + "/";
      box.innerHTML =
        '<span style="font-size:1.8rem">' + g[2] + "</span>" +
        '<span style="text-align:left"><small style="opacity:.7;letter-spacing:.05em">AD</small><br>Play ' + g[1] + " – " + g[3] + "</span>" +
        '<span style="background:#f59e0b;color:#1c1917;border-radius:.5rem;padding:.25rem .55rem">Click: ' + (opt.reward || "reward") + "</span>";
      box.style.opacity = 1;
    }

    box.addEventListener("click", () => {
      if (claimed) return;
      claimed = true;
      if (opt.onReward) opt.onReward();
      box.lastChild.textContent = "Reward claimed!";
      box.lastChild.style.background = "#22c55e";
      clearTimeout(timer);
      timer = setTimeout(next, 8000);
    });

    next();
    setInterval(() => { if (!claimed) next(); }, 25000);
  }

  window.GameAds = { init };
})();
