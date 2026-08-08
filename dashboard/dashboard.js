const totalTime = document.getElementById("totalTime");
const websiteCount = document.getElementById("websiteCount");
const mostUsed = document.getElementById("mostUsed");
const websiteList = document.getElementById("websiteList");

const yesterdayTime = document.getElementById("yesterdayTime");
const weekTime = document.getElementById("weekTime");

loadDashboard();

setInterval(loadDashboard,1000);

async function loadDashboard(){

    const today = new Date().toISOString().split("T")[0];

   // yesterday and week data
   const yesterday = new Date();
   yesterday.setDate(yesterday.getDate() - 1);
   const yesterdayKey = yesterday.toISOString().split("T")[0];
   const yesterdayResult = await chrome.storage.local.get(yesterdayKey);
   const yesterdayData = yesterdayResult[yesterdayKey] || {};

   let yesterdayTotal = 0;
   Object.values(yesterdayData).forEach(time =>{
    yesterdayTotal += Number(time);
   });;

   yesterdayTime.textContent = format(yesterdayTotal);


  // for week data

  let weekTotal = 0;
  for(let i = 0;i<7;i++){
    const date  =  new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split("T")[0];
    const result = await chrome.storage.local.get(key);
    const data = result[key] || {};
    Object.values(data).forEach(time =>{
        weekTotal += time;
    });
  }
 weekTime.textContent = format(weekTotal);

 // end of yesterday and week



    const result = await chrome.storage.local.get(today);

    const data = result[today] || {};

    websiteList.innerHTML="";

    const entries = Object.entries(data).sort((a,b)=>b[1]-a[1]);

    websiteCount.textContent = entries.length;

    let total = 0;

    entries.forEach(e=>total += e[1]);

    totalTime.textContent = format(total);

    if(entries.length){

        mostUsed.textContent = entries[0][0];

    }

    entries.forEach(([site,time])=>{

        const percent = total ? (time/total)*100 : 0;

        const div = document.createElement("div");

        div.className="website";

        div.innerHTML=`

            <div class="website-head">

                <span>${site}</span>

                <strong>${format(time)}</strong>

            </div>

            <div class="progress">

                <div class="fill" style="width:${percent}%"></div>

            </div>

        `;

        websiteList.appendChild(div);

    });

}

function format(sec){

    const h=Math.floor(sec/3600);

    const m=Math.floor((sec%3600)/60);

    const s=sec%60;

    if(h) return `${h}h ${m}m`;

    if(m) return `${m}m ${s}s`;

    return `${s}s`;

}





document.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById("reminderBtnOpen");
    const section = document.getElementById("reminder-section");

    btn.addEventListener("click", () => {

        if (section.style.display === "block") {
            section.style.display = "none";
            btn.textContent = "Add Reminder";
        } else {
            section.style.display = "block";
            btn.textContent = "Close";
        }

    });

});







//task reminder js
const taskTitle = document.getElementById("taskTitle");
const taskDate = document.getElementById("taskDate");
const taskTime = document.getElementById("taskTime");
const saveReminder = document.getElementById("saveReminder");
const reminderList = document.getElementById("reminderList");

saveReminder.addEventListener("click", addReminder);

loadReminders();

async function addReminder(){

    if(
        !taskTitle.value ||
        !taskDate.value ||
        !taskTime.value
    ) return;

    const result = await chrome.storage.local.get("reminders");

    const reminders = result.reminders || [];

    reminders.push({

        id: Date.now(),

        title: taskTitle.value,

        date: taskDate.value,

        time: taskTime.value,

        completed:false

    });

    await chrome.storage.local.set({

        reminders

    });

    taskTitle.value="";
    taskDate.value="";
    taskTime.value="";

    loadReminders();

}

async function loadReminders(){

    const result = await chrome.storage.local.get("reminders");

    const reminders = result.reminders || [];

    reminderList.innerHTML="";

    reminders.sort((a,b)=>{

        return new Date(a.date+" "+a.time)-new Date(b.date+" "+b.time);

    });

    reminders.forEach(reminder=>{

        const div=document.createElement("div");

        div.className="reminder";

        div.innerHTML=`

            <div>

                <h3>${reminder.title}</h3>

                <p>${reminder.date} • ${reminder.time}</p>

            </div>

            <button data-id="${reminder.id}">
                Delete
            </button>

        `;

        reminderList.appendChild(div);

    });

    document.querySelectorAll(".reminder button").forEach(btn=>{

        btn.onclick=()=>deleteReminder(btn.dataset.id);

    });

}

async function deleteReminder(id){

    const result=await chrome.storage.local.get("reminders");

    let reminders=result.reminders||[];

    reminders=reminders.filter(r=>r.id!=id);

    await chrome.storage.local.set({

        reminders

    });

    loadReminders();

}



// yesterday and week data 
