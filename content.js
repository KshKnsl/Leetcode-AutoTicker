(function () {
  function getSolvedQuestions() {
    return new Promise((resolve) => {
      let solved = JSON.parse(localStorage.getItem("lc_solved") || "[]");
      if (solved.length) return resolve(solved);
      chrome.runtime.sendMessage(
        { type: "getSolvedQuestions" },
        function (response) {
          if (response && Array.isArray(response.solved)) {
            localStorage.setItem("lc_solved", JSON.stringify(response.solved));
            resolve(response.solved);
          } else {
            resolve([]);
          }
        }
      );
    });
  }
  const tufSheetPatterns = [
    /takeuforward\.org\/interviews\//,
    /takeuforward\.org\/strivers-a2z-dsa-course\//,
    /takeuforward\.org\/interview-sheets\//,
    /takeuforward\.org\/sheets\//,
  ];

  async function tickTufSheet(forceRefresh = false) {
    let tufDataRaw = localStorage.getItem("tuf_sheet_data");
    let tufData = JSON.parse(tufDataRaw);
    if (!tufData || forceRefresh) {
      try {
        const response = await fetch("https://backend.takeuforward.org/api/sheets/single/strivers_sde_sheet");
        tufData = await response.json();
        let questions = [];
        if (tufData && Array.isArray(tufData.sheetData)) {
          questions = tufData.sheetData.flatMap(step => Array.isArray(step.topics) ? step.topics : []);
        }
        localStorage.setItem("tuf_sheet_data", JSON.stringify(questions));
        console.log('[TUF] Set tuf_sheet_data in localStorage:', questions);
        tufData = questions;
      } catch (e) {
        console.log("Failed to fetch TUF sheet data", e);
        return;
      }
    }
    console.log("[TUF] Backend data:", tufData);
    showTufBackendData(tufData);
  }

  function showTufBackendData(tufData) {
    let questions = [];
    // New format: array of question objects
    if (Array.isArray(tufData)) {
      questions = tufData;
    }
      questions.forEach((q) => {
        let safeId = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(q.id) : q.id.replace(/([\.\#\:\[\]\,\=\$\^])/g, '\$1');
        const checkboxes = document.querySelectorAll(`td > input[type="checkbox"]#${safeId}`);
        if (checkboxes.length === 0) {
          console.log(`[TUF] No <td> found for question id ${q.id}`);
        }
        checkboxes.forEach(cb => {
          const td = cb.parentElement;
          if (td) {
            console.log(`[TUF] Found <td> for question id ${q.id}:`, td, q);
            const parent = td.parentElement;
            if (parent && !parent.querySelector('.tuf-data-raw')) {
              const info = document.createElement('pre');
              info.className = 'tuf-data-raw text-xs mt-1 bg-gray-100 dark:bg-[#252629] border border-gray-300 dark:border-gray-700 p-1 text-gray-800 dark:text-gray-200 break-words';
              let gfgSvg = `<span class='inline-block align-middle w-5 h-5 mr-2'><svg xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' width='20' height='20' viewBox='0 0 48 48'><path fill='#43a047' d='M29.035,24C29.014,23.671,29,23.339,29,23c0-6.08,2.86-10,7-10c3.411,0,6.33,2.662,7,7l2,0l0.001-9\tL43,11c0,0-0.533,1.506-1,1.16c-1.899-1.066-3.723-1.132-6.024-1.132C30.176,11.028,25,16.26,25,22.92\tc0,0.364,0.021,0.723,0.049,1.08h-2.099C22.979,23.643,23,23.284,23,22.92c0-6.66-5.176-11.892-10.976-11.892\tc-2.301,0-4.125,0.065-6.024,1.132C5.533,12.506,5,11,5,11l-2.001,0L3,20l2,0c0.67-4.338,3.589-7,7-7c4.14,0,7,3.92,7,10\tc0,0.339-0.014,0.671-0.035,1H0v2h1.009c1.083,0,1.977,0.861,1.999,1.943C3.046,29.789,3.224,32.006,4,33c1.269,1.625,3,3,8,3\tc5.022,0,9.92-4.527,11-10h2c1.08,5.473,5.978,10,11,10c5,0,6.731-1.375,8-3c0.776-0.994,0.954-3.211,0.992-5.057\tC45.014,26.861,45.909,26,46.991,26H48v-2H29.035z M11.477,33.73C9.872,33.73,7.322,33.724,7,32c-0.109-0.583-0.091-2.527-0.057-4.046\tC6.968,26.867,7.855,26,8.943,26H19C18.206,30.781,15.015,33.73,11.477,33.73z M41,32c-0.322,1.724-2.872,1.73-4.477,1.73\tc-3.537,0-6.729-2.949-7.523-7.73h10.057c1.088,0,1.975,0.867,2,1.954C41.091,29.473,41.109,31.417,41,32z'></path></svg></span>`;
              let csSvg = `<span class='inline-block align-middle w-5 h-5 mr-2'><svg width='20' height='20' viewBox='0 0 24 24' role='img' xmlns='http://www.w3.org/2000/svg'><path class='cs-svg-path' d='M23.198 0c-.499.264-1.209.675-1.79.984a542.82 542.82 0 0 0 0 6.242c.995-.526 1.761-.834 1.79-2.066V0zM8.743.181C7.298.144 5.613.65 4.47 1.414c-1.17.8-1.987 1.869-2.572 3.179A16.787 16.787 0 0 0 .9 8.87c-.15 1.483-.128 3.079.025 4.677.27 1.855.601 3.724 1.616 5.456 1.57 2.62 4.313 4.109 7.262 4.19 3.41.246 7.233.53 11.411.807.022-2.005.01-5.418 0-6.25-3.206-.21-7.398-.524-11.047-.782-.443-.043-.896-.056-1.324-.172-1.086-.295-1.806-.802-2.374-1.757-.643-1.107-.875-2.832-.797-4.294.11-1.27.287-2.41 1.244-3.44.669-.56 1.307-.758 2.161-.84 5.17.345 7.609.53 12.137.858.032-1.133.01-3.46 0-6.229C16.561.752 12.776.474 8.743.181zm-.281 9.7c.174.675.338 1.305.729 1.903.537.832 1.375 1.127 2.388.877.76-.196 1.581-.645 2.35-1.282zm12.974 1.04-5.447.689c.799.739 1.552 1.368 2.548 1.703.988.319 1.78.01 2.308-.777.209-.329.56-1.148.591-1.614zm.842 6.461c-.388.01-.665.198-.87.355.002 1.798 0 4.127 0 6.223.586-.297 1.135-.644 1.793-.998-.005-1.454.002-3.137-.005-4.707a.904.904 0 0 0-.917-.873z' fill='currentColor'/></svg></span>`;
              let html = '';
              html += `<div class='flex flex-col space-y-2'>`;
              if (q.gfg_link) {
                html += `<div class='flex items-center gap-x-2'>${gfgSvg}<button class='tuf-gfg-btn px-2 py-1 rounded bg-green-600 dark:bg-green-700 text-white text-xs hover:bg-green-700 dark:hover:bg-green-800 transition' data-link='${q.gfg_link}'>Take me to GFG</button></div>`;
              }
              if (q.cs_link) {
                html += `<div class='flex items-center gap-x-2'>${csSvg}<button class='tuf-cs-btn px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition' data-link='${q.cs_link}'>Take me to Coding Ninja</button></div>`;
              }
              html += `</div>`;
              info.innerHTML = html;
              parent.appendChild(info);
              Array.from(info.querySelectorAll('.tuf-gfg-btn, .tuf-cs-btn')).forEach(btn => {
                btn.addEventListener('click', function() {
                  const link = btn.getAttribute('data-link');
                  if (link) {
                    window.location.href = link;
                  }
                });
              });
              console.log(`[TUF] Displayed backend data for question id ${q.id}`);
            }
          }
        });
      });
  }

  async function tickGenericSheet() {
    const solved = await getSolvedQuestions();
    const links = Array.from(document.querySelectorAll("a")).filter((a) =>
      a.href.includes("leetcode.com/problems/")
    );
    links.forEach((link) => {
      // Match both with and without trailing slash
      const slugMatch = link.href.match(/problems\/([^\/]+)(?:\/)?$/);
      if (slugMatch && solved.includes(slugMatch[1])) {
        if (!link.querySelector(".lc-tick")) {
          const tick = document.createElement("span");
          tick.textContent = "✔️";
          tick.className = "lc-tick";
          tick.style.marginLeft = "5px";
          link.appendChild(tick);
        }
      }
    });
  }

  async function tickSolved(forceRefresh = false) {
    if (tufSheetPatterns.some((re) => re.test(window.location.href))) {
      tickGenericSheet();
      tickTufSheet(forceRefresh);
    } else {
      tickGenericSheet();
    }
  }

  window.addEventListener("load", () => tickSolved());
  const observer = new MutationObserver(() => {
    if (tufSheetPatterns.some((re) => re.test(window.location.href)))
      tickTufSheet(false);
    else tickGenericSheet();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.type === "refreshTufSheet") {
      tickSolved(true);
      sendResponse({ status: "refreshed" });
    }
  });
})();
