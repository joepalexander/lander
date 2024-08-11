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
});