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

// Define contactable periods (UTC+1)
const contactableTimes = [
    { day: "weekday", start: "07:30", end: "17:30" }, // Example contactable times for weekdays
    { day: "saturday", start: "10:00", end: "18:00" },
    { day: "sunday", start: "10:00", end: "20:00" }
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
    const currentEvent = document.getElementById('current-event');

    // Position current time marker based on time
    if (marker) {
        marker.style.left = `${percentageOfDay * 100}%`;
        
        // Add tooltip to the current marker
        if (!marker.querySelector('.activity-tooltip')) {
            const tooltip = document.createElement('div');
            tooltip.className = 'activity-tooltip';
            marker.appendChild(tooltip);
        }
    }

    // Get the current activity
    const currentActivity = getCurrentActivity();

    // Update tooltip for current marker
    if (marker && marker.querySelector('.activity-tooltip')) {
        marker.querySelector('.activity-tooltip').textContent = currentActivity;
    }

    // Update current event text with icon
    if (currentEvent) {
        currentEvent.innerHTML = `<i class="fas fa-circle-dot"></i> ${currentActivity}`;
    }

    // Update the green fill for elapsed events
    const timeMarkers = document.querySelectorAll('.modern-time-marker:not(#current-time-marker)');
    timeMarkers.forEach((timeMarker, index) => {
        if (index < activities.length) {
            const [hours, minutes] = activities[index].start.split(":").map(Number);
            const activityTime = hours * 60 + minutes;
            
            // Determine period of day for color coding
            let periodClass = '';
            if (hours >= 5 && hours < 12) {
                periodClass = 'morning-marker';
            } else if (hours >= 12 && hours < 17) {
                periodClass = 'afternoon-marker';
            } else if (hours >= 17 && hours < 22) {
                periodClass = 'evening-marker';
            } else {
                periodClass = 'night-marker';
            }
            
            // Apply appropriate period class
            timeMarker.classList.add(periodClass);
            
            if (totalMinutes >= activityTime) {
                timeMarker.classList.add('elapsed');
            } else {
                timeMarker.classList.remove('elapsed');
            }
        }
    });

    // Update the current time
    const currentTime = document.getElementById('current-time');
    if (currentTime) {
        currentTime.textContent = getCurrentTime();
    }

    // Update the current day display if it exists
    const dayDisplay = document.querySelector('.timeline-day');
    if (dayDisplay) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        dayDisplay.textContent = days[now.getUTCDay()];
    }
}

function createTimeMarkers() {
    const timelineContainer = document.querySelector('.modern-timeline-container');
    
    if (!timelineContainer) return;

    // Clear existing markers first
    const existingMarkers = timelineContainer.querySelectorAll('.modern-time-marker:not(#current-time-marker)');
    existingMarkers.forEach(marker => marker.remove());

    // Add the timeline header if it doesn't exist
    if (!document.querySelector('.timeline-header')) {
        const timelineParent = timelineContainer.parentElement;
        const header = document.createElement('div');
        header.className = 'timeline-header';
        header.innerHTML = `
            <h3 class="timeline-title">My Day</h3>
            <div class="timeline-day">${getDayOfWeek()}</div>
        `;
        timelineParent.insertBefore(header, timelineContainer);
    }

    // Add time period labels if they don't exist
    if (!document.querySelector('.time-period-labels')) {
        const labels = document.createElement('div');
        labels.className = 'time-period-labels';
        labels.innerHTML = `
            <span>12am</span>
            <span>6am</span>
            <span>12pm</span>
            <span>6pm</span>
            <span>11pm</span>
        `;
        timelineContainer.insertAdjacentElement('afterend', labels);
    }

    // Create activity markers
    activities.forEach(activity => {
        const [hours, minutes] = activity.start.split(":").map(Number);
        const percentageOfDay = (hours * 60 + minutes) / (24 * 60);

        const timeMarker = document.createElement('div');
        timeMarker.className = 'modern-time-marker';
        timeMarker.style.left = `${percentageOfDay * 100}%`;
        
        // Add tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'activity-tooltip';
        tooltip.textContent = `${formatTime(hours, minutes)} - ${activity.activity}`;
        timeMarker.appendChild(tooltip);
        
        // Set attribute for accessibility
        timeMarker.setAttribute('aria-label', `${formatTime(hours, minutes)} - ${activity.activity}`);
        
        timelineContainer.appendChild(timeMarker);
    });
}

function formatTime(hours, minutes) {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function getDayOfWeek() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    return days[now.getUTCDay()];
}

function createContactableMarkers() {
    const contactableContainer = document.getElementById('modern-contactable-container');
    
    if (!contactableContainer) return;
    
    // Add label for contactable hours
    if (!document.querySelector('.contactable-label')) {
        const label = document.createElement('div');
        label.className = 'contactable-label';
        label.innerHTML = '<i class="fas fa-phone"></i> Available for calls';
        contactableContainer.parentNode.insertBefore(label, contactableContainer);
    }
    
    // Clear existing markers
    contactableContainer.innerHTML = '';
    
    let contactablePeriod = [];

    // Determine contactable period based on the day
    if (dayOfWeek === 0) {
        contactablePeriod = contactableTimes.find(time => time.day === "sunday");
    } else if (dayOfWeek === 6) {
        contactablePeriod = contactableTimes.find(time => time.day === "saturday");
    } else {
        contactablePeriod = contactableTimes.find(time => time.day === "weekday");
    }

    if (contactablePeriod) {
        const startMinutes = contactablePeriod.start.split(":").map(Number);
        const endMinutes = contactablePeriod.end.split(":").map(Number);
        const startPercentage = (startMinutes[0] * 60 + startMinutes[1]) / (24 * 60);
        const endPercentage = (endMinutes[0] * 60 + endMinutes[1]) / (24 * 60);

        const contactableMarker = document.createElement('div');
        contactableMarker.className = 'modern-contactable-marker';
        contactableMarker.style.left = `${startPercentage * 100}%`;
        contactableMarker.style.width = `${(endPercentage - startPercentage) * 100}%`;
        
        // Add tooltip for accessibility
        contactableMarker.setAttribute('title', `Available from ${contactablePeriod.start} to ${contactablePeriod.end}`);
        contactableMarker.setAttribute('aria-label', `Available from ${contactablePeriod.start} to ${contactablePeriod.end}`);

        contactableContainer.appendChild(contactableMarker);
    }
}

function getCurrentTime() {
   // Get the current time in the UK (UTC+1)
    const now = new Date();
    let hours = now.getUTCHours() + 1; // Adding 1 hour for UTC+1
    const minutes = now.getUTCMinutes();

    if (hours >= 24) { // Handle overflow past midnight
        hours -= 24;
    }

    // Format time as HH:MM with AM/PM
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Initialize time markers and update the timeline every minute
document.addEventListener('DOMContentLoaded', () => {
    // Load Font Awesome if not already loaded
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }

    createTimeMarkers();
    createContactableMarkers();
    updateTimeline();
    
    // Update more frequently for smoother experience
    setInterval(updateTimeline, 30000);
});

// If the document is already loaded, run the initialization
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }
    
    createTimeMarkers();
    createContactableMarkers();
    updateTimeline();
    setInterval(updateTimeline, 30000);
}


