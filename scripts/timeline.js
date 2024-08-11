let activities = [];
const weekdayActivities = [
    { start: "00:00", activity: "Sleeping" },
    { start: "05:30", activity: "Wake Up" },
    { start: "06:15", activity: "Commute to Work" },
    { start: "07:15", activity: "Work" },
    { start: "11:00", activity: "Coffee break" },
    { start: "11:15", activity: "Work" },
    { start: "14:00", activity: "Lunch break" },
    { start: "15:00", activity: "Work" },
    { start: "17:30", activity: "Commute home" },
    { start: "19:00", activity: "Dinner" },
    { start: "20:00", activity: "Gym/Relax" },
    { start: "21:00", activity: "Catching up on Emails" },
    { start: "22:00", activity: "Sleep preparation" },
    { start: "23:00", activity: "Heading to bed" },
    { start: "23:59", activity: "Sleeping" }
];

const saturdayActivities = [
    { start: "00:00", activity: "Sleeping" },
    { start: "07:00", activity: "Wake Up" },
    { start: "10:00", activity: "Exercise" },
    { start: "12:00", activity: "Lunch" },
    { start: "13:00", activity: "Relaxing" },
    { start: "15:00", activity: "Hobbies" },
    { start: "18:00", activity: "Dinner" },
    { start: "19:00", activity: "Socializing" },
    { start: "22:00", activity: "Sleep preparation" },
    { start: "23:00", activity: "Heading to bed" },
    { start: "23:59", activity: "Sleeping" }
];

const sundayActivities = [
    { start: "00:00", activity: "Sleeping" },
    { start: "08:00", activity: "Wake Up" },
    { start: "08:30", activity: "Exercise" },
    { start: "12:30", activity: "Lunch" },
    { start: "13:00", activity: "Relaxing" },
    { start: "14:00", activity: "Hobbies" },
    { start: "18:30", activity: "Dinner" },
    { start: "21:00", activity: "Check emails & prepare for the week ahead." },
    { start: "22:00", activity: "Sleep preparation" },
    { start: "23:00", activity: "Heading to bed" },
    { start: "23:59", activity: "Sleeping" }
];

const now = new Date();
const dayOfWeek = now.getUTCDay();
switch (dayOfWeek) {
    case 0: // Sunday
        activities = sundayActivities;
        break;
    case 6: // Saturday
        activities = saturdayActivities;
        break;
    default:
        activities = weekdayActivities;
        break;
}

function getCurrentActivity() {
    const now = new Date();
    let currentTime = (now.getUTCHours() + 1) * 60 + now.getUTCMinutes(); // Adding 1 hour for UTC+1

    if (currentTime >= 1440) { // Handle overflow past midnight
        currentTime -= 1440;
    }

    for (let i = activities.length - 1; i >= 0; i--) {
        const [hours, minutes] = activities[i].start.split(":").map(Number);
        const activityTime = hours * 60 + minutes;
        if (currentTime >= activityTime) {
            return activities[i].activity;
        }
    }
    return activities[0].activity; // Default to the first activity if no match is found
}

function updateTimeline() {
    const now = new Date();
    let hours = now.getUTCHours() + 1; // Adding 1 hour for UTC+1
    const minutes = now.getUTCMinutes();

    if (hours >= 24) { // Handle overflow past midnight
        hours -= 24;
    }

    const totalMinutes = hours * 60 + minutes;
    const percentageOfDay = totalMinutes / (24 * 60);

    const marker = document.getElementById('current-time-marker');
    const tooltip = document.getElementById('current-tooltip');
    const tooltipLine = document.getElementById('current-tooltip-line');
    const currentEvent = document.getElementById('current-event');

    // Position current time marker based on time
    marker.style.left = `calc(${percentageOfDay * 100}% - 10px)`;

    // Get the current activity
    const currentActivity = getCurrentActivity();

    // Update tooltip text based on current activity
    tooltip.textContent = currentActivity;

    // Update title attribute for tooltip
    marker.title = currentActivity;

    // Update current event text for mobile
    currentEvent.textContent = `${currentActivity}`;

    // Position the tooltip line
    tooltipLine.style.left = `calc(${percentageOfDay * 100}% - 1px)`;

    // Update the green fill for elapsed events
    const timeMarkers = document.querySelectorAll('.time-marker');
    timeMarkers.forEach((timeMarker, index) => {
        const [hours, minutes] = activities[index].start.split(":").map(Number);
        const activityTime = hours * 60 + minutes;
        if (totalMinutes >= activityTime) {
            timeMarker.classList.add('elapsed');
        } else {
            timeMarker.classList.remove('elapsed');
        }
    });

    // Update the current time every minute
    const currentTime = document.getElementById('current-time');
    currentTime.textContent = getCurrentTime();
}

function createTimeMarkers() {
    const timelineContainer = document.querySelector('.timeline-container');

    activities.forEach(activity => {
        const [hours, minutes] = activity.start.split(":").map(Number);
        const percentageOfDay = (hours * 60 + minutes) / (24 * 60);

        const timeMarker = document.createElement('div');
        timeMarker.className = 'time-marker';
        timeMarker.style.left = `calc(${percentageOfDay * 100}% - 10px)`;

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = activity.activity;

        const tooltipLine = document.createElement('div');
        tooltipLine.className = 'tooltip-line';

        timeMarker.appendChild(tooltip);
        timeMarker.appendChild(tooltipLine);
        timelineContainer.appendChild(timeMarker);
    });
}

function getCurrentTime() {
   // Get the current time in the UK (UTC+1)
    const now = new Date();
    let hours = now.getUTCHours() + 1; // Adding 1 hour for UTC+1
    const minutes = now.getUTCMinutes();

    if (hours >= 24) { // Handle overflow past midnight
        hours -= 24;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Initialize time markers and update the timeline every minute
createTimeMarkers();
updateTimeline();
setInterval(updateTimeline, 60000);