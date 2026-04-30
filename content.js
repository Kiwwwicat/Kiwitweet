// Kiwitweet - 답글이 0개인 멘션만 보여주는 토글
// 토글 ON: 멘션 탭에서 reply 카운트가 0인 멘션만 남기고 나머지 숨김.
// 알림 경로(/notifications/*)를 떠나면 토글은 자동으로 OFF 된다 (저장 없음).

(function () {
  "use strict";

  const TOGGLE_ID = "kiwi-toggle";
  const HIDE_CLASS = "kiwi-hidden";

  let filterOn = false;
  let timelineObserver = null;
  let urlObserver = null;
  let lastUrl = location.href;
  let mountInterval = null;

  // ---------- url helpers ----------

  function isNotifPath() {
    return location.pathname.startsWith("/notifications");
  }

  function isMentionsPath() {
    return (
      location.pathname === "/notifications/mentions" ||
      location.pathname === "/notifications/mentions/"
    );
  }

  // ---------- 멘션 셀 분석 ----------

  function getCells() {
    return document.querySelectorAll('[data-testid="cellInnerDiv"]');
  }

  function isMentionCell(cell) {
    return !!cell.querySelector('article[data-testid="tweet"], article');
  }

  // 트위터 reply 버튼에서 답글 개수 추출.
  // aria-label 예: "12 Replies. Reply", "답글 12개", "Reply" (0개)
  function getReplyCount(cell) {
    const btn = cell.querySelector('[data-testid="reply"]');
    if (!btn) return null;

    const aria = btn.getAttribute("aria-label") || "";
    const m1 = aria.match(/[\d,.]+/);
    if (m1) {
      const n = parseInt(m1[0].replace(/[,.]/g, ""), 10);
      if (!isNaN(n)) return n;
    }

    const txt = (btn.textContent || "").trim();
    if (txt === "" || txt === "Reply" || txt === "답글") return 0;
    const m2 = txt.match(/[\d,.]+/);
    if (m2) {
      const n = parseInt(m2[0].replace(/[,.]/g, ""), 10);
      if (!isNaN(n)) return n;
    }

    return 0;
  }

  // ---------- 토글 UI ----------

  function ensureToggle() {
    if (!isNotifPath()) {
      removeToggle();
      return;
    }
    if (document.getElementById(TOGGLE_ID)) {
      syncToggleVisual();
      return;
    }
    const btn = document.createElement("button");
    btn.id = TOGGLE_ID;
    btn.type = "button";
    btn.className = "kiwi-toggle";
    btn.setAttribute("aria-label", "답글 0개인 멘션만 보기");
    btn.innerHTML = `
      <span class="kiwi-toggle-track"><span class="kiwi-toggle-knob"></span></span>
      <span class="kiwi-toggle-text">미답변만</span>
    `;
    btn.addEventListener("click", onToggleClick);
    document.body.appendChild(btn);
    syncToggleVisual();
  }

  function removeToggle() {
    const btn = document.getElementById(TOGGLE_ID);
    if (btn) btn.remove();
  }

  function syncToggleVisual() {
    const btn = document.getElementById(TOGGLE_ID);
    if (!btn) return;
    btn.classList.toggle("kiwi-on", filterOn);
    btn.setAttribute("aria-pressed", filterOn ? "true" : "false");
  }

  // ---------- 토글 동작 ----------

  function onToggleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    filterOn = !filterOn;
    syncToggleVisual();
    if (filterOn) {
      navigateToMentions();
      setTimeout(applyFilter, 350);
      setTimeout(applyFilter, 1200);
      startTimelineObserver();
    } else {
      stopTimelineObserver();
      unhideAll();
    }
  }

  function navigateToMentions() {
    if (isMentionsPath()) return;
    const link = document.querySelector('a[href="/notifications/mentions"]');
    if (link) link.click();
  }

  // ---------- 필터링 ----------

  function applyFilter() {
    if (!filterOn || !isMentionsPath()) {
      unhideAll();
      return;
    }
    getCells().forEach((cell) => {
      if (!isMentionCell(cell)) {
        cell.classList.add(HIDE_CLASS);
        return;
      }
      const replyCount = getReplyCount(cell);
      if (replyCount === null || replyCount === 0) {
        cell.classList.remove(HIDE_CLASS);
      } else {
        cell.classList.add(HIDE_CLASS);
      }
    });
  }

  function unhideAll() {
    document
      .querySelectorAll("." + HIDE_CLASS)
      .forEach((el) => el.classList.remove(HIDE_CLASS));
  }

  // ---------- observers ----------

  function startTimelineObserver() {
    if (timelineObserver) return;
    timelineObserver = new MutationObserver(() => {
      if (!filterOn) return;
      if (timelineObserver._raf) return;
      timelineObserver._raf = requestAnimationFrame(() => {
        timelineObserver._raf = null;
        applyFilter();
      });
    });
    timelineObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function stopTimelineObserver() {
    if (!timelineObserver) return;
    if (timelineObserver._raf) cancelAnimationFrame(timelineObserver._raf);
    timelineObserver.disconnect();
    timelineObserver = null;
  }

  function watchUrl() {
    if (urlObserver) return;
    urlObserver = new MutationObserver(() => {
      if (location.href === lastUrl) return;
      lastUrl = location.href;
      onUrlChange();
    });
    urlObserver.observe(document.body, { childList: true, subtree: true });

    const origPush = history.pushState;
    const origReplace = history.replaceState;
    history.pushState = function () {
      const r = origPush.apply(this, arguments);
      window.dispatchEvent(new Event("kiwi:locationchange"));
      return r;
    };
    history.replaceState = function () {
      const r = origReplace.apply(this, arguments);
      window.dispatchEvent(new Event("kiwi:locationchange"));
      return r;
    };
    window.addEventListener("popstate", () =>
      window.dispatchEvent(new Event("kiwi:locationchange"))
    );
    window.addEventListener("kiwi:locationchange", () => {
      if (location.href === lastUrl) return;
      lastUrl = location.href;
      onUrlChange();
    });
  }

  function onUrlChange() {
    // 알림 경로를 떠나면 토글은 항상 OFF 로 리셋한다.
    if (!isNotifPath() && filterOn) {
      filterOn = false;
      stopTimelineObserver();
      unhideAll();
    }
    ensureToggle();
    if (filterOn && isMentionsPath()) {
      startTimelineObserver();
      setTimeout(applyFilter, 200);
      setTimeout(applyFilter, 900);
    } else if (!isMentionsPath()) {
      stopTimelineObserver();
      unhideAll();
    }
  }

  // ---------- mount 안전망 ----------

  function startMountWatcher() {
    if (mountInterval) return;
    mountInterval = setInterval(() => {
      ensureToggle();
      if (filterOn && isMentionsPath()) applyFilter();
    }, 1500);
  }

  function init() {
    // filterOn 은 항상 false 로 시작 (저장하지 않음)
    ensureToggle();
    watchUrl();
    startMountWatcher();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
