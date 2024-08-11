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


function navigatoToSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.scrollIntoView({ behavior: 'smooth' });
    history.pushState(null, '', `#${sectionId}`);
    //check if the scroll-to-top button should be displayed

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