/* OUR GLASS navigation shell v1. Payment submission stays closed until secure backend activation. */
(() => {
  "use strict";
  const PATHS = ["join","prepare","donate","verification","pending","setup"];
  const stylesheet = document.createElement("style");
  stylesheet.textContent = `
    .og-nav[hidden]{display:none!important}
    .og-nav{position:fixed;bottom:max(18px,env(safe-area-inset-bottom));right:20px;z-index:90;display:flex;gap:9px;flex-wrap:wrap;justify-content:flex-end;max-width:min(90vw,440px)}
    .og-link,.og-button{font:600 11px/1.3 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;border:1px solid #b5a99b;border-radius:99px;padding:13px 16px;background:#fcfbf9f0;color:#35302b;text-decoration:none;backdrop-filter:blur(12px)}
    .og-button:focus-visible,.og-link:focus-visible{outline:3px solid #8a6b4d;outline-offset:3px}
    .og-link:hover,.og-button:hover{background:#ede6dc}
    .og-backdrop[hidden]{display:none!important}\n    .og-backdrop{position:fixed;inset:0;z-index:100;background:rgba(34,29,25,.57);display:grid;place-items:center;padding:20px;overflow-y:auto}
    .og-panel{position:relative;background:#fcfbf9;color:#282522;width:min(100%,570px);max-height:min(92dvh,880px);overflow-y:auto;border-radius:5px;padding:clamp(26px,6vw,52px);box-shadow:0 20px 90px #18110a4b}
    .og-close{position:absolute;right:16px;top:12px;background:transparent;border:none;color:#302820;font:32px/1 Arial;cursor:pointer}
    .og-kicker{font:600 11px Arial,sans-serif;letter-spacing:.24em;color:#937962;text-transform:uppercase;margin:0 0 14px}
    .og-title{font:400 clamp(37px,8vw,58px)/1 'Cormorant Garamond',Georgia,serif;letter-spacing:-.025em;margin:0 0 18px}
    .og-copy{font:16px/1.65 Arial,sans-serif;color:#5b544e;margin:0 0 22px}
    .og-card{padding:19px;border:1px solid #d7cbbf;margin:15px 0;background:#fff}
    .og-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}
    .og-button{display:inline-block;padding:14px 19px;letter-spacing:.06em;text-align:center}
    .og-primary{background:#342c26;color:white;border-color:#342c26}
    .og-primary:hover{background:#675544;color:white}
    .og-muted{font:13px/1.55 Arial,sans-serif;color:#786b60}
    .og-step{font:12px/1.6 Arial,sans-serif;color:#a08b77;letter-spacing:.08em}
    @media(max-width:650px){.og-nav{right:8px;left:8px;bottom:max(10px,env(safe-area-inset-bottom));justify-content:center}.og-link{font-size:10px;padding:12px}.og-panel{padding:32px 23px}}
  `;
  document.head.appendChild(stylesheet);
  const nav = document.querySelector("nav.og-nav") || document.createElement("nav");
  nav.className = "og-nav";
  nav.setAttribute("aria-label","OUR GLASS actions");
  nav.innerHTML = '<a class="og-link" href="#/join">Join a circle</a><a class="og-link" href="#/prepare">Prepare my afterword</a><a class="og-link" href="/about.html">About</a>';
  if (!nav.isConnected) document.body.appendChild(nav);
  const backdrop = document.createElement("div");
  backdrop.className = "og-backdrop";
  backdrop.hidden = true;
  backdrop.innerHTML = '<section class="og-panel" role="dialog" aria-modal="true" aria-labelledby="og-modal-title"><button class="og-close" aria-label="Close" type="button">×</button><div class="og-body"></div></section>';
  document.body.appendChild(backdrop);
  const body = backdrop.querySelector(".og-body");
  const title = (kicker,name,description)=>'<p class="og-kicker">'+kicker+'</p><h2 class="og-title" id="og-modal-title">'+name+'</h2><p class="og-copy">'+description+'</p>';
  const back = '<a class="og-button" href="#/">Back to OUR GLASS</a>';
  function paymentFormUrl() {
    const u = String(window.OURGLASS_PAYMENT_FORM_URL || "");
    return /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(u) ? u : "";
  }
  const pages = {
    join: () => title("Your people","Join someone’s circle","If a loved one invites you to their circle, this is where you will register to receive their future messages. Invitation-based registration will open after our secure delivery system is activated.") +
      '<div class="og-card"><p class="og-muted">Recipient details are private. We will not collect your information until the invitation system is connected.</p></div><div class="og-actions">'+back+'</div>',
    prepare: () => title("Your afterword","Prepare my afterword","Make your arrangements now, for when the time comes. Setup begins only after a donation is confirmed and verified.") +
      '<div class="og-card"><p class="og-step">01 Donate → 02 Upload payment proof → 03 Verification → 04 Confirmation → 05 Setup</p><p class="og-muted">We are finishing the secure screenshot submission and verification connection. Please do not make a donation for setup until the form is active.</p></div><div class="og-actions"><a class="og-button og-primary" href="#/donate">How donations will work</a>'+back+'</div>',
    donate: () => {
      const url = paymentFormUrl();
      if (url) return title("Before we begin","Donation & verification","Donate any amount with our GCash QR, then upload a screenshot of your payment. Your request will be verified manually before any setup access is issued.") +
        '<iframe title="OUR GLASS secure payment proof form" loading="lazy" referrerpolicy="no-referrer" style="width:100%;height:min(72dvh,650px);border:1px solid #d7cbbf;background:#fff" src="'+url+'"></iframe><div class="og-actions">'+back+'</div>';
      return title("Before we begin","Donation & verification","Our secure donation submission is being connected. When active, you will see our GCash QR code, submit a screenshot of your completed payment, and receive a pending confirmation reference.") +
        '<div class="og-card"><p class="og-muted"><strong>Payment submissions are not yet open.</strong> Do not transfer money for account setup until the upload form is available. Donation of any amount does not automatically approve an account.</p></div><div class="og-actions"><a class="og-button" href="#/verification">Verification process</a>'+back+'</div>';
    },
    verification: () => title("Our process","Verification","Your screenshot is reviewed against the actual GCash transaction history. An uploaded image by itself is not proof of a completed payment.") +
      '<div class="og-card"><p class="og-muted">Only confirmed transactions are marked approved. We will never ask for your GCash PIN or one-time password.</p></div><div class="og-actions"><a class="og-button" href="#/pending">After submission</a>'+back+'</div>',
    pending: () => title("Review","Pending confirmation","After you submit proof through the active form, your donation request will wait for manual verification. Do not upload proof through this preview; no submission has been received.") +
      '<div class="og-actions">'+back+'</div>',
    setup: () => title("Private access","Setup is locked","An approved donation is required before any account setup. Direct links cannot unlock registration. The verified, one-time access system is not active yet.")+
      '<div class="og-actions">'+back+'</div>'
  };
  function close(){backdrop.hidden=true;document.body.style.removeProperty("overflow");nav.hidden=false;}
  function route(){
    const name = (location.hash.match(/^#\/([a-z-]+)/)||[])[1]||"";
    if(!PATHS.includes(name)){close();return;}
    body.innerHTML=pages[name]();
    backdrop.hidden=false;nav.hidden=true;document.body.style.overflow="hidden";
    backdrop.querySelector(".og-close").focus();
  }
  backdrop.querySelector(".og-close").addEventListener("click",()=>{location.hash="/";});
  backdrop.addEventListener("click",e=>{if(e.target===backdrop)location.hash="/";});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!backdrop.hidden)location.hash="/";});
  window.addEventListener("hashchange",route);
  route();
})();
