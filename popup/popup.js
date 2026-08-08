const totalTimeElement = document.getElementById("totalTime");
const websiteList = document.getElementById("websiteList");


loadData();
 
setInterval(loadData, 1000);

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
        loadData();
    }
});

async function loadData() {

    const today = new Date().toISOString().split("T")[0];

    const result = await chrome.storage.local.get(today);

    const data = result[today] || {};

    websiteList.innerHTML = "";

    let totalSeconds = 0;

    const websites = Object.entries(data)
        .sort((a, b) => b[1] - a[1]);

    if (websites.length === 0) {

        websiteList.innerHTML = `
            <div class="website">
                <span>No websites tracked yet.</span>
            </div>
        `;

        totalTimeElement.textContent = "0s";
        return;
    }

    websites.forEach(([domain, seconds]) => {

        totalSeconds += seconds;

        const row = document.createElement("div");
        row.className = "website";

        row.innerHTML = `
            <span>${domain}</span>
            <strong>${formatTime(seconds)}</strong>
        `;

        websiteList.appendChild(row);

    });

    totalTimeElement.textContent = formatTime(totalSeconds);

}

function formatTime(seconds) {

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
        return `${h}h ${m}m ${s}s`;
    }

    if (m > 0) {
        return `${m}m ${s}s`;
    }

    return `${s}s`;
}

document.getElementById("dashboardBtn").addEventListener("click", ()=>{
    chrome.tabs.create({
        url: chrome.runtime.getURL("dashboard/dashboard.html")
    });
});