/* OUR GLASS navigation, built for tap and keyboard access.
 * Registration and donation remain unavailable until their verified backends are active.
 */
(() => {
  "use strict";

  const pages = ["join", "prepare", "donate", "verification", "pending", "setup"];
  const nav = document.querySelector("nav.og-nav");
  if (!nav) return;

  const styles = document.createElement("style");
  styles.textContent = `
    .og-backdrop[hidden]{display:none!important}
    .og-backdrop{
      position:fixed;inset:0;z-index:200;
      background:rgba(31,25,20,.56);
      display:flex;align-items:center;justify-content:center;
      padding:clamp(14px,4vw,36px);
    }
    .og-panel{
      position:relative;width:min(100%,560px);
      max-height:calc(100dvh - 32px);overflow-y:auto;overscroll-behavior:contain;
      padding:clamp(29px,5vw,48px);
      background:#fcfbf9;color:#302a25;
      border:1px solid #e4d9cd;border-radius:12px;
      box-shadow:0 25px 90px rgba(25,18,11,.25);
    }
    .og-close{
      position:absolute;right:12px;top:10px;width:44px;height:44px;
      display:grid;place-items:center;background:transparent;border:0;
      color:#33353a;cursor:pointer;
      font:italic 400 31px/1 'Cormorant Garamond',Georgia,serif;
      text-shadow:0 1px 0 rgba(255,255,255,.8),0 2px 2px rgba(15,18,20,.3);
    }
    .og-close:hover{filter:drop-shadow(0 0 6px rgba(164,172,186,.8))}
    .og-close:focus-visible,.og-action:focus-visible{outline:2px solid #777c87;outline-offset:5px}
    .og-kicker{margin:0 36px 12px 0;font:700 11px/1.5 Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#92795f}
    .og-title{margin:0 22px 17px 0;font:400 clamp(36px,7vw,54px)/1.05 Georgia,serif;letter-spacing:-.035em}
    .og-copy{margin:0 0 20px;color:#5a5048;font:15px/1.7 Arial,Helvetica,sans-serif}
    .og-card{margin:18px 0;padding:19px 20px;border:1px solid #dfd5c9;background:#fffefa;border-radius:8px}
    .og-muted{margin:0;color:#655b51;font:14px/1.65 Arial,sans-serif}
    .og-muted strong{color:#332b24}
    .og-step{margin:0 0 15px;color:#8a704f;font:700 12px/1.9 Arial,sans-serif}
    .og-actions{display:flex;align-items:center;flex-wrap:wrap;gap:10px 28px;margin-top:25px}
    .og-action,.og-action--primary,.og-action:visited{
      position:relative;display:inline-flex;align-items:center;justify-content:center;
      min-height:48px;padding:6px 1px;
      border:0!important;border-radius:0!important;box-shadow:none!important;
      background-color:transparent!important;
      background-image:linear-gradient(155deg,#16181b 3%,#4e545b 29%,#adb2ba 47%,#23262a 62%,#565d66 79%,#131519 96%)!important;
      background-clip:text;-webkit-background-clip:text;
      -webkit-text-fill-color:transparent;color:#22262a;
      font:italic 600 clamp(22px,3vw,27px)/1.13 'Cormorant Garamond',Georgia,serif;
      letter-spacing:-.008em;text-align:center;text-decoration:none;text-transform:none;
      text-shadow:none!important;
      filter:drop-shadow(0 -1px 0 rgba(255,255,255,.65)) drop-shadow(0 1px 1px rgba(23,27,31,.21));
      cursor:pointer;transition:filter .2s ease;
    }
    .og-action::after{
      content:"";position:absolute;left:7%;right:7%;bottom:4px;height:1px;
      background:linear-gradient(90deg,transparent,#66717f 25%,#bbc1c8 51%,#4b535d 78%,transparent);
      opacity:0;transform:scaleX(.5);transition:opacity .2s ease,transform .2s ease;
    }
    .og-action:hover,.og-action--primary:hover{
      filter:drop-shadow(0 0 4px rgba(120,133,151,.55));
    }
    .og-action:hover::after,.og-action:focus-visible::after{opacity:.85;transform:scaleX(1)}
    .og-iframe{display:block;width:100%;height:min(65dvh,610px);border:1px solid #dfd5c9;border-radius:8px;background:white}
    @media(max-width:700px){
      .og-backdrop{padding:0;align-items:flex-end}
      .og-panel{
        width:100%;max-height:92dvh;border-radius:20px 20px 0 0;
        padding:30px 22px max(26px,env(safe-area-inset-bottom));
      }
      .og-actions{flex-direction:column;align-items:stretch}
      .og-action{width:100%}
      .og-title{font-size:clamp(34px,8vw,48px)}
    }
  `;
  document.head.appendChild(styles);

  const overlay = document.createElement("div");
  overlay.className = "og-backdrop";
  overlay.hidden = true;
  overlay.innerHTML = '<section class="og-panel" role="dialog" aria-modal="true" aria-labelledby="og-modal-title"><button class="og-close" aria-label="Close and return to OUR GLASS" type="button">×</button><div class="og-body"></div></section>';
  document.body.appendChild(overlay);

  const panel = overlay.querySelector(".og-panel");
  const contents = overlay.querySelector(".og-body");
  const closeButton = overlay.querySelector(".og-close");
  const home = '<a class="og-action" href="#/">Back to OUR GLASS</a>';
  let previousOverflow = "";
  let lastTrigger = null;

  function header(kicker, title, copy) {
    return '<p class="og-kicker">'+kicker+'</p><h2 class="og-title" id="og-modal-title">'+title+'</h2><p class="og-copy">'+copy+'</p>';
  }
  function actions(primary, secondary) {
    return '<div class="og-actions">'+(primary||"")+(secondary||home)+'</div>';
  }
  function paymentFormUrl() {
    const url = String(window.OURGLASS_PAYMENT_FORM_URL || "");
    return /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url) ? url : "";
  }
  const views = {
    join: () =>
      header("Your people", "Join someone’s circle",
        "If a loved one invites you into their circle, this is where you will be able to register to receive their future messages.") +
      '<div class="og-card"><p class="og-muted"><strong>Not yet accepting registrations.</strong> We will only collect recipient information after secure invitations and private data storage are ready.</p></div>' +
      actions(null, home),
    prepare: () =>
      header("Your afterword", "Prepare your afterword",
        "Create a place for your farewell wishes and the people you want informed when the time comes. Personal setup follows donation verification and confirmation.") +
      '<div class="og-card"><p class="og-step">01 Donation · 02 Payment proof · 03 Verification · 04 Confirmation · 05 Setup</p><p class="og-muted"><strong>Setup is not yet open.</strong> Please do not make a donation for account setup until the submission form is active.</p></div>' +
      actions('<a class="og-action og-action--primary" href="#/donate">How donation verification works</a>',home),
    donate: () => {
      const url = paymentFormUrl();
      if(url) return header("Before we begin","Donation & verification",
        "Donate any amount using the official GCash QR. Upload your payment screenshot; an actual GCash transaction must be verified before any account access is approved.") +
        '<iframe class="og-iframe" title="OUR GLASS payment proof submission" referrerpolicy="no-referrer" src="'+url+'"></iframe>' +
        actions(null,home);
      return header("Before we begin","Donation & verification",
        "The secure upload form is being connected. When it opens, you will be able to donate using the official GCash QR and submit proof of your payment.") +
        '<div class="og-card"><p class="og-muted"><strong>Donations for account setup are not open.</strong> Please do not send money yet. A screenshot alone does not verify payment or unlock setup.</p></div>' +
        actions('<a class="og-action og-action--primary" href="#/verification">How verification works</a>',home);
    },
    verification: () =>
      header("Our process","Verification",
        "Uploaded proof is checked against the actual GCash transaction history. Submission never means automatic approval.") +
      '<div class="og-card"><p class="og-muted">Only genuinely received and confirmed donations can be approved. We will never request your GCash PIN, password or one-time code.</p></div>' +
      actions('<a class="og-action og-action--primary" href="#/pending">What happens next?</a>',home),
    pending: () =>
      header("Review","Pending confirmation",
        "Once the real form is active and a payment proof is submitted, the request remains pending until someone verifies the corresponding GCash transaction.") +
      '<div class="og-card"><p class="og-muted">This page is informational. Opening it does not mean you have submitted a payment.</p></div>' +
      actions(null,home),
    setup: () =>
      header("Private access","Setup is locked",
        "Account setup requires an approved, verified donation and secure access. The account registration system is not open yet.") +
      actions(null,home)
  };

  function currentRoute() {
    const match = /^#\/([a-z-]+)$/.exec(window.location.hash);
    return match && pages.includes(match[1]) ? match[1] : null;
  }

  function close() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    nav.hidden = false;
    document.body.style.overflow = previousOverflow;
    if (lastTrigger && lastTrigger.isConnected) lastTrigger.focus();
  }
  function render() {
    const name = currentRoute();
    if (!name) { close(); return; }
    if (overlay.hidden) {
      previousOverflow = document.body.style.overflow;
      lastTrigger = document.activeElement;
    }
    contents.innerHTML = views[name]();
    panel.scrollTop = 0;
    overlay.hidden = false;
    nav.hidden = true;
    document.body.style.overflow = "hidden";
    closeButton.focus();
  }
  function goHome() {
    if (window.location.hash !== "#/") window.location.hash = "#/";
    else close();
  }

  closeButton.addEventListener("click", goHome);
  overlay.addEventListener("click", event => {
    if (event.target === overlay) goHome();
  });
  document.addEventListener("keydown", event => {
    if (overlay.hidden) return;
    if (event.key === "Escape") {event.preventDefault();goHome();return;}
    if (event.key !== "Tab") return;
    const focusables = [...overlay.querySelectorAll('a[href],button:not([disabled]),iframe')];
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length-1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();first.focus();
    }
  });
  window.addEventListener("hashchange", render);
  render();
})();
