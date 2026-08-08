let currentDomain = null;

// Runs every second
setInterval(async () => {

    if (!currentDomain) return;

    const today = new Date().toISOString().split("T")[0];

    const result = await chrome.storage.local.get(today);

    const data = result[today] || {};

    data[currentDomain] = (data[currentDomain] || 0) + 1;

    await chrome.storage.local.set({
        [today]: data
    });

    console.log(data);

}, 1000);


// Detect active tab
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    updateCurrentTab(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.active && changeInfo.status === "complete") {
        updateCurrentTab(tabId);
    }
});

async function updateCurrentTab(tabId) {

    const tab = await chrome.tabs.get(tabId);

    if (!tab.url) return;

    try {

        currentDomain = new URL(tab.url).hostname;

        console.log("Tracking:", currentDomain);

    } catch {

        currentDomain = null;

    }

}

console.log("chrome buddy Started");


chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create("waterReminder", {
        periodInMinutes: 15
    });
});

chrome.alarms.onAlarm.addListener((alarm) => {

    if (alarm.name !== "waterReminder") return;

    chrome.notifications.create({
        type: "basic",
        iconUrl: "/icons/water.png",
        title: " Stay Hydrated",
        message: "Time to drink some water!",
        priority: 2
    });

});

chrome.runtime.onInstalled.addListener(() => {

    chrome.alarms.create("checkReminders", {
        periodInMinutes: 1
    });

});

//check any reminders on time
chrome.alarms.onAlarm.addListener(async (alarm) => {

    // Reminder checker
    if (alarm.name !== "checkReminders") return;

    const result = await chrome.storage.local.get("reminders");

    const reminders = result.reminders || [];

    const now = new Date();

    const today = now.toISOString().split("T")[0];

    const currentTime =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0");

    for (const reminder of reminders) {

        if (
            reminder.date === today &&
            reminder.time === currentTime &&
            !reminder.notified
        ) {

            chrome.notifications.create({
                type: "basic",
                iconUrl: "/icons/stopwatch.png",
                title: " yoo Man!! Reminder",
                message: reminder.title
            });

            reminder.notified = true;

        }

    }

    await chrome.storage.local.set({
        reminders
    });

});