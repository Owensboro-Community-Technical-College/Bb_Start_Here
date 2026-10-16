/* Page-specific revision dates, displayed in OCTC's local time.
   Keep the HTML fallback date current when editing a page.
   GitHub lookup refreshes it automatically; no visit-time or deployment date is used. */
(async function () {
  "use strict";
  const time = document.querySelector("[data-last-updated] time");
  if (!time) return;
  const path = location.pathname.split("/").pop() || "index.html";
  const key = "octc-updated:" + path;
  const format = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago", year: "numeric", month: "long", day: "numeric"
  });
  function show(value) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return;
    time.dateTime = date.toISOString();
    time.textContent = format.format(date);
  }
  try {
    const cached = JSON.parse(sessionStorage.getItem(key) || "null");
    if (cached && cached.date) {
      show(cached.date);
      if (Date.now() - cached.checked < 15 * 60 * 1000) return;
    }
  } catch (_) { /* Storage can be restricted in Blackboard embeds. */ }
  try {
    const response = await fetch(
      "https://api.github.com/repos/octc-instructional-design/Bb_Start_Here/commits?sha=main&per_page=1&path=" + encodeURIComponent(path),
      { headers: { Accept: "application/vnd.github+json" } }
    );
    if (!response.ok) return;
    const commits = await response.json();
    const date = commits[0] && commits[0].commit && commits[0].commit.committer.date;
    if (!date || !Number.isFinite(new Date(date).getTime())) return;
    show(date);
    try { sessionStorage.setItem(key, JSON.stringify({ date: date, checked: Date.now() })); }
    catch (_) { /* The displayed date still works without storage. */ }
  } catch (_) { /* Keep the saved HTML date when offline or rate-limited. */ }
}());
