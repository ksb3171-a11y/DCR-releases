/* ============================================================================
   DCR site — shared layout chrome (single source): nav + footer + modals.
   Classic script. Injects markup into placeholders so every page shares one
   source for navigation, footer and the auth/board/admin modals.

   Each page provides:
     <body data-page="home|verification|pricing|...">
     <div id="site-nav"></div>      (top of body)
     <div id="site-footer"></div>   (after <main>)
     <div id="site-modals"></div>   (before scripts)

   MUST load AFTER i18n.js and BEFORE auth.js / board.js (those query the
   injected DOM at parse time). Injection here is synchronous.
   ============================================================================ */
(function () {
  'use strict';

  var page = (document.body && document.body.dataset.page) || 'home';
  var isHome = page === 'home';

  // Anchor that lives on the home page: use in-page hash when already home,
  // otherwise jump to index.html#hash.
  function home(hash) { return isHome ? ('#' + hash) : ('index.html#' + hash); }

  var NAV = '' +
    '<header class="nav" id="nav"><div class="container">' +
      '<a href="' + (isHome ? '#top' : 'index.html') + '" class="nav-logo">DCR ' +
        '<span data-i18n="nav.sub">Displacement Control &amp; Reduction</span></a>' +
      '<ul class="nav-links" id="navLinks">' +
        '<li><a href="product.html" data-nav="product" data-i18n="nav.product">Product</a></li>' +
        '<li><a href="verification.html" data-nav="verification" data-i18n="nav.verification">Verification</a></li>' +
        '<li><a href="ai.html" data-nav="ai" data-i18n="nav.ai">AI</a></li>' +
        '<li><a href="pricing.html" data-nav="pricing" data-i18n="nav.pricing">Pricing</a></li>' +
        '<li><a href="resources.html" data-nav="resources" data-i18n="nav.resources">Resources</a></li>' +
        '<li><a href="community.html" data-nav="community" data-i18n="nav.community">Community</a></li>' +
        '<li><a href="' + home('download') + '" data-nav="download" data-i18n="nav.download">Download</a></li>' +
      '</ul>' +
      '<div class="nav-right">' +
        '<div class="nav-auth" id="navAuthOut">' +
          '<button class="btn-login"  onclick="openModal(\'login\')"  data-i18n="auth.login">Log in</button>' +
          '<button class="btn-signup" onclick="openModal(\'signup\')" data-i18n="auth.signup">Sign up</button>' +
        '</div>' +
        '<div class="user-menu" id="navAuthIn" style="display:none">' +
          '<button class="user-btn" id="userBtn">' +
            '<div class="user-avatar" id="userAvatar">?</div>' +
            '<span id="userDisplayName">-</span>' +
            '<span style="font-size:9px;margin-left:2px">▾</span>' +
          '</button>' +
          '<div class="user-dropdown" id="userDropdown">' +
            '<div class="udrop-info">' +
              '<div class="u-name"  id="dropName">-</div>' +
              '<div class="u-email" id="dropEmail">-</div>' +
              '<div class="u-exp"   id="dropExp">-</div>' +
            '</div>' +
            '<a class="udrop-item" href="account.html">👤 <span data-i18n="nav.account">Account</span></a>' +
            '<button class="udrop-item logout" onclick="handleLogout()">🚪 <span data-i18n="auth.logout">Log out</span></button>' +
          '</div>' +
        '</div>' +
        '<div class="lang-selector" id="langSelector">' +
          '<button class="lang-btn" id="langBtn">' +
            '<span id="langFlag">🇺🇸</span><span id="langLabel">English</span><span class="arrow">▾</span>' +
          '</button>' +
          '<div class="lang-dropdown" id="langDropdown">' +
            '<div class="lang-option active" data-lang="en"><span class="flag">🇺🇸</span> English</div>' +
            '<div class="lang-option"        data-lang="ko"><span class="flag">🇰🇷</span> 한국어</div>' +
            '<div class="lang-option"        data-lang="ja"><span class="flag">🇯🇵</span> 日本語</div>' +
            '<div class="lang-option"        data-lang="zh"><span class="flag">🇨🇳</span> 中文 (简体)</div>' +
          '</div>' +
        '</div>' +
        '<button class="nav-toggle" id="navToggle" aria-label="Menu">☰</button>' +
      '</div>' +
    '</div></header>';

  var FOOTER = '' +
    '<footer class="footer"><div class="container">' +
      '<div class="footer-brand"><div class="nav-logo">DCR</div>' +
        '<p data-i18n="foot.tagline">Independent commercial structural analysis &amp; design — built to exceed, not imitate.</p>' +
      '</div>' +
      '<div class="footer-col"><h4 data-i18n="foot.product">Product</h4>' +
        '<a href="product.html" data-i18n="nav.product">Product</a>' +
        '<a href="verification.html" data-i18n="nav.verification">Verification</a>' +
        '<a href="ai.html" data-i18n="nav.ai">AI</a>' +
        '<a href="pricing.html" data-i18n="nav.pricing">Pricing</a>' +
      '</div>' +
      '<div class="footer-col"><h4 data-i18n="foot.resources">Resources</h4>' +
        '<a href="resources.html" data-i18n="nav.resources">Resources</a>' +
        '<a href="community.html" data-i18n="nav.community">Community</a>' +
        '<a href="' + home('download') + '" data-i18n="nav.download">Download</a>' +
      '</div>' +
      '<div class="footer-col"><h4 data-i18n="foot.company">Company</h4>' +
        '<a href="mailto:ksb3171@gmail.com">Contact</a>' +
      '</div>' +
    '</div>' +
    '<div class="container footer-bottom">' +
      '<span data-i18n="foot.copyright">© 2026 DCR. All rights reserved.</span>' +
      '<span class="mono" style="color:var(--text-mute)">Built with OpenSees · React · Electron</span>' +
    '</div></footer>';

  var MODALS = '' +
    // login
    '<div class="modal-overlay" id="loginModal"><div class="auth-modal">' +
      '<button class="auth-close" onclick="closeModal(\'loginModal\')">×</button>' +
      '<div class="auth-modal-title" data-i18n="auth.login_title">Log In</div>' +
      '<div class="auth-modal-sub" data-i18n="auth.login_sub">Welcome back to DCR</div>' +
      '<div class="auth-msg error" id="loginError"></div>' +
      '<form id="loginForm" onsubmit="handleLogin(event)">' +
        '<div class="auth-field"><label data-i18n="auth.email">Email</label>' +
          '<input id="li_email" type="email" autocomplete="email" required data-i18n-ph="auth.email_ph"></div>' +
        '<div class="auth-field"><label data-i18n="auth.password">Password</label>' +
          '<input id="li_password" type="password" autocomplete="current-password" required data-i18n-ph="auth.password_ph"></div>' +
        '<button class="auth-submit" id="loginBtn" type="submit" data-i18n="auth.login_btn">Log In</button>' +
      '</form>' +
      '<div class="auth-switch"><span data-i18n="auth.no_account">Don\'t have an account?</span> ' +
        '<a onclick="switchModal(\'login\',\'signup\')" data-i18n="auth.signup_link">Sign up</a></div>' +
    '</div></div>' +
    // signup
    '<div class="modal-overlay" id="signupModal"><div class="auth-modal">' +
      '<button class="auth-close" onclick="closeModal(\'signupModal\')">×</button>' +
      '<div class="auth-modal-title" data-i18n="auth.signup_title">Create Account</div>' +
      '<div class="auth-modal-sub" data-i18n="auth.signup_sub">Beta — 30 days free</div>' +
      '<div class="auth-msg error" id="signupError"></div>' +
      '<div class="auth-msg success" id="signupSuccess"></div>' +
      '<form id="signupForm" onsubmit="handleSignup(event)">' +
        '<div class="auth-row">' +
          '<div class="auth-field"><label data-i18n="auth.name">Name</label>' +
            '<input id="su_name" type="text" required data-i18n-ph="auth.name_ph"></div>' +
          '<div class="auth-field"><label data-i18n="auth.affiliation">Affiliation</label>' +
            '<input id="su_affiliation" type="text" required data-i18n-ph="auth.affiliation_ph"></div>' +
        '</div>' +
        '<div class="auth-field"><label data-i18n="auth.email">Email</label>' +
          '<input id="su_email" type="email" autocomplete="email" required data-i18n-ph="auth.email_ph"></div>' +
        '<div class="auth-field"><label data-i18n="auth.phone">Phone Number</label>' +
          '<input id="su_phone" type="tel" required data-i18n-ph="auth.phone_ph"></div>' +
        '<div class="auth-row">' +
          '<div class="auth-field"><label data-i18n="auth.password">Password</label>' +
            '<input id="su_password" type="password" autocomplete="new-password" required data-i18n-ph="auth.password_ph"></div>' +
          '<div class="auth-field"><label data-i18n="auth.pw_confirm">Confirm Password</label>' +
            '<input id="su_pw_confirm" type="password" autocomplete="new-password" required data-i18n-ph="auth.pw_confirm_ph"></div>' +
        '</div>' +
        '<button class="auth-submit" id="signupBtn" type="submit" data-i18n="auth.signup_btn">Create Account</button>' +
      '</form>' +
      '<div class="auth-switch"><span data-i18n="auth.has_account">Already have an account?</span> ' +
        '<a onclick="switchModal(\'signup\',\'login\')" data-i18n="auth.login_link">Log in</a></div>' +
    '</div></div>' +
    // admin badge
    '<div id="adminBadge"><span class="admin-tag">🛠 Admin Mode</span>' +
      '<button class="admin-members-btn" onclick="openMembersModal()">👥 Members</button></div>' +
    // members
    '<div id="membersModal"><div class="modal-box">' +
      '<div class="modal-header"><h3>👥 Member List</h3>' +
        '<button class="modal-close" onclick="closeMembersModal()">×</button></div>' +
      '<div class="modal-body"><table><thead><tr>' +
        '<th>#</th><th>Name</th><th>Email</th><th>Expires</th><th>Status</th><th>Blocked</th><th>Joined</th>' +
      '</tr></thead><tbody id="membersTableBody">' +
        '<tr><td colspan="7" style="text-align:center;color:#555;padding:32px">Loading...</td></tr>' +
      '</tbody></table></div>' +
      '<div class="modal-footer" id="membersFooter">–</div>' +
    '</div></div>' +
    // quick buttons
    '<div id="quickBtns">' +
      '<button onclick="location.href=\'community.html\'" title="Community" style="font-size:18px">💡</button>' +
      '<button onclick="window.scrollTo({top:0,behavior:\'smooth\'})" title="Top">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg></button>' +
      '<button onclick="window.scrollTo({top:document.body.scrollHeight,behavior:\'smooth\'})" title="Bottom">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg></button>' +
    '</div>' +
    // feature board
    '<div id="boardModal"><div class="board-box">' +
      '<div class="board-head"><h3>💡 <span data-i18n="board.title">Feature Requests</span></h3>' +
        '<button class="board-close" onclick="closeBoard()">×</button></div>' +
      '<div id="boardList" style="display:flex;flex-direction:column;flex:1;min-height:0">' +
        '<div class="board-toolbar"><div class="board-chips" id="boardChips">' +
          '<button class="board-chip active" data-cat="all">All</button>' +
          '<button class="board-chip" data-cat="analysis">Analysis</button>' +
          '<button class="board-chip" data-cat="design">Design</button>' +
          '<button class="board-chip" data-cat="ui">UI</button>' +
          '<button class="board-chip" data-cat="bug">Bug</button>' +
          '<button class="board-chip" data-cat="etc">Etc</button>' +
        '</div><div class="board-sort">' +
          '<select id="boardSort" class="board-chip" style="cursor:pointer">' +
            '<option value="top">▲ Top voted</option><option value="recent">🕒 Recent</option></select>' +
          '<button class="board-newbtn" onclick="boardShowNew()" data-i18n="board.new">+ New Request</button>' +
        '</div></div>' +
        '<div class="board-body" id="boardBody"><div class="board-empty">Loading…</div></div>' +
      '</div>' +
      '<div id="boardDetail" class="board-body" style="display:none"></div>' +
      '<div id="boardNew" class="board-body" style="display:none"></div>' +
    '</div></div>';

  function inject(id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }
  inject('site-nav', NAV);
  inject('site-footer', FOOTER);
  inject('site-modals', MODALS);

  // Active nav link for the current page
  var active = document.querySelector('.nav-links a[data-nav="' + page + '"]');
  if (active) active.classList.add('active');
})();
