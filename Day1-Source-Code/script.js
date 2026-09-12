/* ============================================================
   DAY 1 — script.js
   Plain JavaScript. No library, no framework, no build step.

   The whole idea of this file is one sentence:
       DATA IN, DOM OUT.
   We write the colours down once as data, then let a loop
   build every tile on the page from that data.
   ============================================================ */


/* ------------------------------------------------------------
   1. THE DATA — 7 rainbow colours
   An array of objects. Each object has a name and a hex code.
   Add a colour here and a new tile appears. Nothing else to edit.
   ------------------------------------------------------------ */
const RAINBOW = [
  { name: "Violet", hex: "#8B00FF" },
  { name: "Indigo", hex: "#4B0082" },
  { name: "Blue",   hex: "#0000FF" },
  { name: "Green",  hex: "#00A651" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Orange", hex: "#FF7F00" },
  { name: "Red",    hex: "#FF0000" }
];


/* ------------------------------------------------------------
   2. THE DATA — 4 fruits
   Same shape as above, plus a "shape" key. That word becomes a
   CSS class: shape "apple" gives the class .fruit--apple, which
   is where style.css draws the apple with border-radius.
   ------------------------------------------------------------ */
const FRUITS = [
  { name: "Apple",  hex: "#FF0000", shape: "apple"  },
  { name: "Banana", hex: "#FFE135", shape: "banana" },
  { name: "Orange", hex: "#FFA500", shape: "orange" },
  { name: "Grape",  hex: "#6F2DA8", shape: "grape"  }
];

/*  7 rainbow colours  +  4 fruits  =  11 tiles  */


/* ------------------------------------------------------------
   3. A TINY HELPER
   We make a lot of elements below. This saves writing the same
   three lines over and over.
   ------------------------------------------------------------ */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}


/* ------------------------------------------------------------
   4. THE HEX RAMP — #000, #111, #222 ... all the way to #fff
   Hex counts in base 16, so its digits run 0-9 and then a-f.
   Loop over those sixteen digits and repeat each one three
   times: "7" becomes "#777". Sixteen chips, one small loop.
   ------------------------------------------------------------ */
const HEX_DIGITS = "0123456789abcdef";

function buildRamp() {
  const ramp = document.getElementById("ramp");

  for (const digit of HEX_DIGITS) {
    const hex = "#" + digit + digit + digit;

    const chip  = el("div", "ramp__chip");
    const block = el("div", "ramp__block");
    block.style.background = hex;

    chip.append(block, el("span", "ramp__label", hex));
    ramp.append(chip);
  }
}


/* ------------------------------------------------------------
   5. BUILDING ONE TILE
   Given { name, hex } — or { name, hex, shape } for a fruit —
   this returns a finished tile, ready to drop into the page.

   We build it as a <button> rather than a <div> so it can be
   clicked with a mouse AND reached with the Tab key.
   ------------------------------------------------------------ */
let tileNumber = 0;   // counts 1, 2, 3 ... across both grids

function makeTile(item) {
  tileNumber = tileNumber + 1;

  const tile = el("button", "tile");
  tile.type = "button";

  /* Hand the colour to CSS as a variable. style.css then paints
     the swatch, or the fruit, with var(--c). One value, one place. */
  tile.style.setProperty("--c", item.hex);

  /* Park the hex on the element so the click handler can read it. */
  tile.dataset.hex = item.hex;
  tile.setAttribute("aria-label", item.name + ", " + item.hex + ". Copy this hex code.");

  /* --- the coloured top half --- */
  const swatch = el("div", "tile__swatch");

  if (item.shape) {
    /* A fruit: a dark stage with the CSS-drawn fruit standing on it. */
    swatch.classList.add("tile__swatch--stage");
    swatch.append(el("div", "fruit fruit--" + item.shape));
  } else {
    /* A rainbow colour: the swatch simply IS the colour. */
    swatch.classList.add("tile__swatch--flat");
  }

  /* --- the label underneath --- */
  const body = el("div", "tile__body");
  body.append(
    el("span", "tile__num",  String(tileNumber).padStart(2, "0")),
    el("span", "tile__name", item.name),
    el("span", "tile__hex",  item.hex)
  );

  tile.append(swatch, body);
  return tile;
}


/* ------------------------------------------------------------
   6. BUILDING A WHOLE GRID
   Take a list, make a tile from each item, put them on the page.
   ------------------------------------------------------------ */
function renderTiles(list, targetId) {
  const target = document.getElementById(targetId);
  list.forEach(function (item) {
    target.append(makeTile(item));
  });
}


/* ------------------------------------------------------------
   7. COUNTING WHAT IS ACTUALLY THERE
   We could just type "11" into the HTML. Instead we ask the page
   how many tiles it really has. If you add a fruit, the number
   moves on its own — and it can never be wrong.
   ------------------------------------------------------------ */
function updateCount() {
  const total = document.querySelectorAll(".tile").length;
  document.getElementById("tile-count").textContent = total;
}


/* ------------------------------------------------------------
   8. THE LITTLE MESSAGE AT THE BOTTOM
   ------------------------------------------------------------ */
let toastTimer;

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("is-visible");

  /* Cancel any message still counting down, then start a fresh
     timer. Without this, fast clicking makes them fight. */
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("is-visible");
  }, 1600);
}


/* ------------------------------------------------------------
   9. COPY A HEX CODE TO THE CLIPBOARD
   The modern way needs a secure page (https:// or localhost).
   Opened straight off your disk as file:// it may be blocked,
   so there is an older fallback underneath it.
   ------------------------------------------------------------ */
function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(
      function () { showToast("Copied " + text); },
      function () { showToast(text); }
    );
    return;
  }

  /* Fallback: put the text in a hidden box, select it, copy it. */
  const helper = el("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.opacity = "0";

  document.body.append(helper);
  helper.select();

  try {
    document.execCommand("copy");
    showToast("Copied " + text);
  } catch (error) {
    showToast(text);
  }

  helper.remove();
}


/* ------------------------------------------------------------
   10. ONE LISTENER FOR ALL ELEVEN TILES
   Rather than attaching a listener to every tile, we listen once
   on the whole document and ask what was clicked. This is called
   event delegation, and it keeps working for tiles added later.
   ------------------------------------------------------------ */
document.addEventListener("click", function (event) {
  const tile = event.target.closest(".tile");
  if (!tile) return;                 // clicked somewhere else — ignore it
  copyText(tile.dataset.hex);
});


/* ------------------------------------------------------------
   11. GO
   Nothing above has run yet — those were all definitions.
   These four lines are what actually builds the page.
   ------------------------------------------------------------ */
buildRamp();
renderTiles(RAINBOW, "rainbow-grid");
renderTiles(FRUITS,  "fruit-grid");
updateCount();
