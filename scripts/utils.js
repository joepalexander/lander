let scrollTimeout;

document.addEventListener('scroll', () => {
    // Clear the previous timeout
    clearTimeout(scrollTimeout);

    // Set a new timeout
    scrollTimeout = setTimeout(() => {
        // Update the URI with the section tag
        updateURI();
        // Show or hide the scroll-to-top button
    }, 100); // Adjust the debounce delay as needed
});

document.addEventListener('wheel', (event) => {
    if (event.deltaY > 0) {
        window.scrollBy({
            top: window.innerHeight,
            left: 0,
            behavior: 'smooth'
        });
    } else {
        window.scrollBy({
            top: -window.innerHeight,
            left: 0,
            behavior: 'smooth'
        });
    }

    // Clear the previous timeout
    clearTimeout(scrollTimeout);

    // Set a new timeout
    scrollTimeout = setTimeout(() => {
        // Update the URI with the section tag
        updateURI();
    }, 100); // Adjust the debounce delay as needed
});

document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.setAttribute('aria-label', img.alt);
    });
});

function updateURI() {
    const sections = document.querySelectorAll('section');
    let currentSection = '';

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
            currentSection = section.id;
        }
    });

    if (currentSection) {
        history.pushState(null, '', `#${currentSection}`);
    }
    showScrollToTop();
}

function navigateToSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.scrollIntoView({ behavior: 'smooth' });
    history.pushState(null, '', `#${sectionId}`);
    showScrollToTop();
}

function showScrollToTop() {
   //if the href contains #hero, hide the scroll-to-top button
    if (window.location.href.includes("#hero")) {
        document.getElementById('scroll-to-top').style.display = 'none';
    } else {
        document.getElementById('scroll-to-top').style.display = 'flex';
    }
}

// Initial call to set the URI based on the current scroll position
updateURI();
showScrollToTop();