let scrollTimeout;

document.addEventListener('scroll', () => {
    // Clear the previous timeout
    clearTimeout(scrollTimeout);

    // Set a new timeout
    scrollTimeout = setTimeout(() => {
        // Update the URI with the section tag
        updateURI();
        // Show or hide the scroll-to-top button
        showScrollToTop();
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
    // Set appropriate ARIA attributes for better accessibility
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (img.alt) {
            img.setAttribute('aria-label', img.alt);
        }
    });
    
    // Check if menu should be visible on scroll
    handleMenuVisibility();
    
    // Handle keyboard navigation
    setupKeyboardNavigation();
    
    // Initial checks
    updateURI();
    showScrollToTop();
    
    // Show menu button when scrolling
    window.addEventListener('scroll', handleMenuVisibility);
    
    // Focus trap for modal elements if needed
    setupFocusTrap();
    
    // Elements to observe
    const fadeElements = document.querySelectorAll('.fade-in, .modern-card, .skills-grid, .skill-card');
    
    // Observer options
    const options = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.15 // 15% of the element must be visible
    };
    
    // Callback function when elements intersect viewport
    const handleIntersect = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add visible class to trigger animation
                entry.target.classList.add('visible');
                
                // If it's a skills grid, add animate class
                if (entry.target.classList.contains('skills-grid')) {
                    entry.target.classList.add('animate');
                }
                
                // Unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    };
    
    // Create observer
    const observer = new IntersectionObserver(handleIntersect, options);
    
    // Observe each element
    fadeElements.forEach(element => {
        observer.observe(element);
    });
    
    // Observe section backgrounds for parallax effect
    const parallaxBgs = document.querySelectorAll('.parallax-bg');
    
    // Setup scroll listener for parallax effect
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        
        parallaxBgs.forEach(bg => {
            const section = bg.parentElement;
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            // Calculate relative scroll position
            const relativeScroll = (scrollPosition - sectionTop) * 0.4;
            
            // Apply transform only when section is in view
            if (scrollPosition + window.innerHeight > sectionTop && 
                scrollPosition < sectionTop + sectionHeight) {
                bg.style.transform = `translateY(${relativeScroll}px) translateZ(-1px) scale(1.5)`;
            }
        });
    });
    
    // Add current date to resume section
    const resumeSection = document.querySelector('.resume-subheader');
    if (resumeSection) {
        const currentDate = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString('en-GB', options);
        resumeSection.innerHTML = `I'd be interested in hearing about exciting new opportunities <span class="resume-date">(Last updated: ${formattedDate})</span>`;
    }
    
    // Add tooltip hover functionality
    const tooltips = document.querySelectorAll('.tooltip-companies');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', () => {
            const tooltipText = tooltip.querySelector('.tooltiptext');
            if (tooltipText) {
                tooltipText.style.visibility = 'visible';
                tooltipText.style.opacity = '1';
            }
        });
        
        tooltip.addEventListener('mouseleave', () => {
            const tooltipText = tooltip.querySelector('.tooltiptext');
            if (tooltipText) {
                tooltipText.style.visibility = 'hidden';
                tooltipText.style.opacity = '0';
            }
        });
    });
    
    // Progress indicator functionality (single source of truth)
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');
    const sections = document.querySelectorAll('section');

    // Create section markers only once
    createSectionMarkers(sections, progressContainer);

    // Update progress bar and active section marker on scroll
    window.addEventListener('scroll', function() {
        updateProgressBar(progressBar);
        updateActiveMarker(sections);
    });
    updateProgressBar(progressBar);

    // Hide progress indicator on mobile
    function toggleProgressIndicatorVisibility() {
        if (window.innerWidth <= 768) {
            progressContainer.style.opacity = '0';
        } else {
            progressContainer.style.opacity = '1';
        }
    }
    toggleProgressIndicatorVisibility();
    window.addEventListener('resize', toggleProgressIndicatorVisibility);

    // Portfolio functionality (single source of truth)
    initPortfolio();

    // Initialize page transitions, lazy loading, theme, accessibility, responsive images
    initPageTransitions();
    initLazyLoading();
    initThemeManager();
    enhanceAccessibility();
    setupResponsiveImages();
});

// Create interactive section markers on the progress bar
function createSectionMarkers(sections, container) {
    const sectionNames = {
        'hero': 'Home',
        'aboutme': 'About',
        'skills': 'Portfolio',
        'technicals': 'Skills',
        'resume': 'Resume',
        'contact': 'Contact'
    };
    
    sections.forEach((section, index) => {
        // Calculate position as percentage of entire document height
        const sectionId = section.id;
        const position = (section.offsetTop / (document.body.scrollHeight - window.innerHeight)) * 100;
        
        // Create the marker
        const marker = document.createElement('div');
        marker.className = 'section-marker';
        marker.style.top = `${position}%`;
        marker.dataset.target = sectionId;
        
        // Add tooltip with section name
        const tooltip = document.createElement('div');
        tooltip.className = 'marker-tooltip';
        tooltip.textContent = sectionNames[sectionId] || sectionId;
        marker.appendChild(tooltip);
        
        // Add click event to navigate to section
        marker.addEventListener('click', () => {
            document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
        });
        
        // Add to DOM
        container.appendChild(marker);
    });
}

// Update the progress bar height based on page scroll
function updateProgressBar(progressBar) {
    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = window.scrollY;
    const progressPercentage = (scrollProgress / scrollTotal) * 100;
    progressBar.style.height = `${progressPercentage}%`;
}

// Update which marker is active based on current scroll position
function updateActiveMarker(sections) {
    // Find current section
    let currentSectionId = '';
    
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            currentSectionId = section.id;
        }
    });
    
    // Update active marker
    document.querySelectorAll('.section-marker').forEach(marker => {
        if (marker.dataset.target === currentSectionId) {
            marker.classList.add('active');
        } else {
            marker.classList.remove('active');
        }
    });
}

function updateURI() {
    const sections = document.querySelectorAll('section');
    let currentSection = '';

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top >= -50 && rect.top < window.innerHeight / 2) {
            currentSection = section.id;
        }
    });

    if (currentSection) {
        history.pushState(null, '', `#${currentSection}`);
        
        // Update active state in navigation menu
        updateActiveNavLink(currentSection);
    }
}

function updateActiveNavLink(sectionId) {
    // Remove active class from all links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        link.setAttribute('aria-current', 'false');
    });
    
    // Add active class to current section link
    const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
        activeLink.setAttribute('aria-current', 'page');
    }
}

function navigateToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    section.scrollIntoView({ behavior: 'smooth' });
    history.pushState(null, '', `#${sectionId}`);
    updateActiveNavLink(sectionId);
    showScrollToTop();
    
    // Close menu when navigating (mobile)
    const menu = document.querySelector('.nav-menu');
    if (menu.classList.contains('visible')) {
        menu.classList.remove('visible');
    }
}

function showScrollToTop() {
    const scrollButton = document.getElementById('scroll-to-top');
    if (!scrollButton) return;
    
    //if the href contains #hero, hide the scroll-to-top button
    if (window.location.href.includes("#hero") || window.scrollY < 200) {
        scrollButton.style.opacity = '0';
        scrollButton.style.pointerEvents = 'none';
    } else {
        scrollButton.style.opacity = '1';
        scrollButton.style.pointerEvents = 'auto';
    }
}

function handleMenuVisibility() {
    const menuToggle = document.querySelector('.menu-toggle');
    if (!menuToggle) return;
    
    // Show menu toggle after scrolling down
    if (window.scrollY > 100) {
        menuToggle.style.opacity = '1';
    } else if (!document.querySelector('.nav-menu').classList.contains('visible')) {
        menuToggle.style.opacity = '0.7';
    }
}

function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Arrow key navigation
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            navigateDown();
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            navigateUp();
        } else if (e.key === 'Home') {
            e.preventDefault();
            navigateToSection('hero');
        } else if (e.key === 'End') {
            e.preventDefault();
            navigateToSection('contact');
        } else if (e.key === 'Escape') {
            // Close menu if open
            const menu = document.querySelector('.nav-menu');
            if (menu && menu.classList.contains('visible')) {
                menu.classList.remove('visible');
                document.querySelector('.menu-toggle').focus();
            }
        }
    });
}

function setupFocusTrap() {
    // Trap focus in menu when it's open
    document.querySelector('.menu-toggle')?.addEventListener('click', () => {
        setTimeout(() => {
            const menu = document.querySelector('.nav-menu');
            if (menu.classList.contains('visible')) {
                const focusableElements = menu.querySelectorAll('a, button');
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                }
            }
        }, 100);
    });
}

// For touch devices
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

let xDown = null;
let yDown = null;

function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
}

function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    const xUp = evt.touches[0].clientX;
    const yUp = evt.touches[0].clientY;
    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;

    // Detect vertical swipes (more prominent than horizontal)
    if (Math.abs(yDiff) > Math.abs(xDiff)) {
        if (yDiff > 20) {
            // Swipe up - go down
            navigateDown();
        } else if (yDiff < -20) {
            // Swipe down - go up
            navigateUp();
        }
    }

    // Reset values
    xDown = null;
    yDown = null;
}

// Initial call to set the URI based on the current scroll position
updateURI();
showScrollToTop();

function initPortfolio() {
    // Filter projects by category
    const filterButtons = document.querySelectorAll('.filter-button');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get filter value
            const filterValue = button.getAttribute('data-filter');
            
            // Filter portfolio items
            portfolioItems.forEach(item => {
                const categories = item.getAttribute('data-category');
                
                if (filterValue === 'all' || categories.includes(filterValue)) {
                    item.style.display = 'block';
                    
                    // Add animation class after a slight delay
                    setTimeout(() => {
                        item.classList.add('show');
                    }, 100);
                } else {
                    item.classList.remove('show');
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Portfolio Modal functionality
    const portfolioModal = document.getElementById('portfolio-modal');
    const modalClose = document.getElementById('modal-close');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const demoLink = document.getElementById('demo-link');
    const codeLink = document.getElementById('code-link');
    
    // Project data - this would typically come from a JSON file or API
    const projectData = [
        {
            id: 1,
            title: "Analytics Dashboard",
            description: "<p>An interactive analytics dashboard built with React and D3.js. This project features real-time data visualization, customizable charts, and a responsive design.</p><p>The dashboard connects to Firebase for real-time updates and includes features like data filtering, export capabilities, and user authentication.</p><p>Key technologies used: React, Redux, D3.js, Firebase Realtime Database, and Material UI.</p>",
            demoUrl: "https://example.com/demo1",
            codeUrl: "https://github.com/yourusername/analytics-dashboard"
        },
        {
            id: 2,
            title: "Mobile App UI Design",
            description: "<p>A comprehensive UI/UX design for a wellness tracking mobile application. The design focuses on clean interfaces with accessibility in mind.</p><p>The app includes features for tracking physical activity, nutrition, mental wellness, and sleep patterns with intuitive visualizations.</p><p>Created using Figma and Adobe XD with a focus on modern design principles and user-centered design methodologies.</p>",
            demoUrl: "https://example.com/demo2",
            codeUrl: "https://github.com/yourusername/wellness-app-design"
        },
        {
            id: 3,
            title: "E-commerce Platform",
            description: "<p>A full-stack e-commerce solution built with Next.js, featuring a responsive design, product search/filtering, user authentication, and Stripe payment processing.</p><p>The platform includes an admin dashboard for inventory management, order processing, and analytics.</p><p>Backend uses MongoDB for data storage, with RESTful APIs for frontend communication.</p>",
            demoUrl: "https://example.com/demo3",
            codeUrl: "https://github.com/yourusername/ecommerce-platform"
        },
        {
            id: 4,
            title: "Fitness Tracker App",
            description: "<p>A cross-platform mobile application built with React Native for tracking workouts, nutrition, and fitness progress.</p><p>Features include custom workout creation, progress tracking with charts, social sharing, and integration with fitness devices through bluetooth.</p><p>Backend uses GraphQL for efficient data fetching and AWS services for storage and serverless functions.</p>",
            demoUrl: "https://example.com/demo4",
            codeUrl: "https://github.com/yourusername/fitness-tracker"
        },
        {
            id: 5,
            title: "Portfolio Template",
            description: "<p>A modern, responsive portfolio website template designed for developers and creative professionals.</p><p>Features include smooth scrolling, dark/light mode toggle, project showcases, and contact forms.</p><p>Built with HTML, CSS, and vanilla JavaScript for maximum performance and compatibility.</p>",
            demoUrl: "https://example.com/demo5",
            codeUrl: "https://github.com/yourusername/portfolio-template"
        },
        {
            id: 6,
            title: "AI Image Generator",
            description: "<p>A web application that generates images using machine learning models based on text prompts.</p><p>Built with Python and Flask for the backend, with TensorFlow for the machine learning components.</p><p>Features include customizable generation parameters, image history, and the ability to download or share generated images.</p>",
            demoUrl: "https://example.com/demo6",
            codeUrl: "https://github.com/yourusername/ai-image-generator"
        }
    ];
    
    // Open modal when clicking on a portfolio item
    portfolioItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            const project = projectData[index];
            
            // Set modal content
            modalImage.src = item.querySelector('.portfolio-img').src;
            modalImage.alt = item.querySelector('.portfolio-img').alt;
            modalTitle.textContent = project.title;
            modalDescription.innerHTML = project.description;
            demoLink.href = project.demoUrl;
            codeLink.href = project.codeUrl;
            
            // Open modal
            portfolioModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        });
    });
    
    // Close modal when clicking on close button or outside modal
    modalClose.addEventListener('click', closeModal);
    
    portfolioModal.addEventListener('click', (event) => {
        if (event.target === portfolioModal) {
            closeModal();
        }
    });
    
    // Close modal when pressing Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && portfolioModal.classList.contains('active')) {
            closeModal();
        }
    });
    
    function closeModal() {
        portfolioModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Vertical scroll progress indicator
function initScrollProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');
    const sections = document.querySelectorAll('section');
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // Create section markers
    sections.forEach((section, index) => {
        const marker = document.createElement('div');
        marker.className = 'section-marker';
        marker.setAttribute('data-section', section.id);
        
        // Calculate marker position
        const sectionTop = section.offsetTop;
        const position = (sectionTop / totalHeight) * 100;
        marker.style.top = `${position}%`;
        
        // Add tooltip with section name
        const tooltip = document.createElement('span');
        tooltip.className = 'marker-tooltip';
        tooltip.textContent = section.id.charAt(0).toUpperCase() + section.id.slice(1);
        marker.appendChild(tooltip);
        
        // Add click event to navigate to section
        marker.addEventListener('click', () => {
            section.scrollIntoView({ behavior: 'smooth' });
        });
        
        progressContainer.appendChild(marker);
    });
    
    // Update progress bar on scroll
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const progress = (scrolled / totalHeight) * 100;
        progressBar.style.height = `${progress}%`;
        
        // Update active section marker
        const markers = document.querySelectorAll('.section-marker');
        markers.forEach(marker => {
            marker.classList.remove('active');
        });
        
        // Find current section
        let currentSection = '';
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                currentSection = section.id;
            }
        });
        
        if (currentSection) {
            const activeMarker = document.querySelector(`.section-marker[data-section="${currentSection}"]`);
            if (activeMarker) {
                activeMarker.classList.add('active');
            }
        }
    });
}

// Vertical Progress Indicator
function initProgressIndicator() {
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const sections = document.querySelectorAll('section');
    
    // Create markers for each section
    sections.forEach((section, index) => {
        const marker = document.createElement('div');
        marker.className = 'section-marker';
        marker.style.top = `${(index / (sections.length - 1)) * 100}%`;
        marker.setAttribute('data-section', section.id);
        
        const tooltip = document.createElement('div');
        tooltip.className = 'marker-tooltip';
        tooltip.textContent = section.id.charAt(0).toUpperCase() + section.id.slice(1);
        
        marker.appendChild(tooltip);
        
        marker.addEventListener('click', () => {
            document.getElementById(section.id).scrollIntoView({
                behavior: 'smooth'
            });
        });
        
        progressContainer.appendChild(marker);
    });
    
    // Update progress bar and active section on scroll
    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const fullHeight = document.body.clientHeight - windowHeight;
        const scrolled = window.scrollY;
        const progress = (scrolled / fullHeight) * 100;
        
        progressBar.style.height = `${progress}%`;
        
        // Update active section marker
        const markers = document.querySelectorAll('.section-marker');
        let activeSection = '';
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
                activeSection = section.id;
            }
        });
        
        markers.forEach(marker => {
            if (marker.getAttribute('data-section') === activeSection) {
                marker.classList.add('active');
            } else {
                marker.classList.remove('active');
            }
        });
    });
}

// Page Transition Functions
function initPageTransitions() {
    // Add transition to all internal links
    document.querySelectorAll('a').forEach(link => {
        // Only add to internal links (not external or hash links)
        if (link.getAttribute('href') && 
            link.hostname === window.location.hostname && 
            !link.getAttribute('href').startsWith('#') && 
            !link.getAttribute('href').startsWith('javascript:') &&
            !link.getAttribute('target')) {
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = link.getAttribute('href');
                
                // Start transition animation
                document.body.classList.add('page-transitioning');
                
                // After transition completes, navigate to the new page
                setTimeout(() => {
                    window.location.href = target;
                }, 600); // Match this with the CSS transition duration
            });
        }
    });
    
    // Handle backward/forward navigation
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            // If page is loaded from cache (back/forward navigation)
            document.body.classList.add('page-transition-out');
            setTimeout(() => {
                document.body.classList.remove('page-transitioning');
                document.body.classList.remove('page-transition-out');
            }, 600);
        }
    });
}

// Vertical Progress Indicator
function setupProgressIndicator() {
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');
    const sections = document.querySelectorAll('section');
    
    // Create markers for each section
    sections.forEach((section, index) => {
        const marker = document.createElement('div');
        marker.className = 'progress-marker';
        marker.setAttribute('data-section', section.id);
        marker.style.top = `${(index / (sections.length - 1)) * 100}%`;
        
        marker.addEventListener('click', () => {
            section.scrollIntoView({ behavior: 'smooth' });
        });
        
        const tooltip = document.createElement('span');
        tooltip.className = 'marker-tooltip';
        tooltip.textContent = section.id.charAt(0).toUpperCase() + section.id.slice(1);
        
        marker.appendChild(tooltip);
        progressContainer.appendChild(marker);
    });
    
    // Update progress bar on scroll
    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const fullHeight = document.body.offsetHeight - windowHeight;
        const scrolled = window.scrollY;
        
        const progress = (scrolled / fullHeight) * 100;
        progressBar.style.height = `${progress}%`;
        
        // Update active marker
        const currentPos = window.scrollY + (windowHeight / 2);
        let activeSection = null;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (currentPos >= sectionTop && currentPos <= sectionBottom) {
                activeSection = section.id;
            }
        });
        
        if (activeSection) {
            document.querySelectorAll('.progress-marker').forEach(marker => {
                marker.classList.remove('active');
                if (marker.getAttribute('data-section') === activeSection) {
                    marker.classList.add('active');
                }
            });
        }
    });
}

// Portfolio Functionality
function initPortfolio() {
    const filterButtons = document.querySelectorAll('.filter-button');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const modal = document.getElementById('portfolio-modal');
    const modalClose = document.getElementById('modal-close');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const demoLink = document.getElementById('demo-link');
    const codeLink = document.getElementById('code-link');
    
    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get filter value
            const filter = button.getAttribute('data-filter');
            
            // Filter portfolio items
            portfolioItems.forEach(item => {
                const categories = item.getAttribute('data-category').split(' ');
                
                if (filter === 'all' || categories.includes(filter)) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Modal functionality
    portfolioItems.forEach(item => {
        item.addEventListener('click', () => {
            // Get project info from portfolio item
            const image = item.querySelector('.portfolio-img').src;
            const title = item.querySelector('.portfolio-title').textContent;
            const description = item.querySelector('.portfolio-description').textContent;
            
            // Populate modal
            modalImage.src = image;
            modalImage.alt = title;
            modalTitle.textContent = title;
            
            // Add a more detailed description for the modal
            const detailedDesc = `
                <p>${description}</p>
                <p>This project showcases my abilities in creating responsive, user-friendly interfaces with modern web technologies. I focused on performance optimization, accessibility, and clean code architecture.</p>
                <h4>Technologies Used:</h4>
                <div class="modal-tags">
                    ${Array.from(item.querySelectorAll('.portfolio-tag')).map(tag => 
                        `<span class="modal-tag">${tag.textContent}</span>`
                    ).join('')}
                </div>
            `;
            
            modalDescription.innerHTML = detailedDesc;
            
            // Set placeholder links (these would come from your data in a real app)
            demoLink.href = "#demo-link";
            codeLink.href = "#code-link";
            
            // Show modal
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.style.opacity = '1';
            }, 10);
            
            // Prevent body scrolling when modal is open
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Close modal
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        });
    }
    
    // Close modal on outside click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.opacity = '0';
                setTimeout(() => {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }, 300);
            }
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initPageTransitions();
    setupProgressIndicator();
    initPortfolio();
    
    // Show scroll-to-top button when scrolling down
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > window.innerHeight / 2) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });
    }
});

// Image lazy loading function
function initLazyLoading() {
    // Use native lazy loading if supported
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            img.src = img.dataset.src;
            img.setAttribute('loading', 'lazy');
        });
    } else {
        // Fallback to Intersection Observer API
        const lazyImages = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    image.src = image.dataset.src;
                    image.classList.add('loaded');
                    observer.unobserve(image);
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.1
        });

        lazyImages.forEach(image => {
            imageObserver.observe(image);
        });
    }
}

// Theme preference manager
function initThemeManager() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    // Check for saved user preference
    const savedTheme = localStorage.getItem('theme');
    // Check for system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme based on saved preference or system preference
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark-theme');
        themeToggle.setAttribute('aria-checked', 'true');
    } else {
        document.documentElement.classList.remove('dark-theme');
        themeToggle.setAttribute('aria-checked', 'false');
    }
    
    // Toggle theme when button is clicked
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark-theme');
        themeToggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
        
        // Save preference to localStorage
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Update theme color meta tag
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', isDark ? '#121212' : '#ffffff');
        }
    });
    
    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        // Only auto-switch if user hasn't set a preference
        if (!localStorage.getItem('theme')) {
            const shouldBeDark = e.matches;
            document.documentElement.classList.toggle('dark-theme', shouldBeDark);
            themeToggle.setAttribute('aria-checked', shouldBeDark ? 'true' : 'false');
        }
    });
}

// Accessibility improvements
function enhanceAccessibility() {
    // Improve focus indicators for keyboard navigation
    const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    
    focusableElements.forEach(element => {
        // Add event listeners to show focus rings only when using keyboard
        element.addEventListener('mousedown', () => {
            element.setAttribute('data-focus-visible-added', 'false');
        });
        
        element.addEventListener('focus', (e) => {
            if (e.target.getAttribute('data-focus-visible-added') !== 'false') {
                e.target.classList.add('focus-visible');
            }
        });
        
        element.addEventListener('blur', () => {
            element.classList.remove('focus-visible');
            element.removeAttribute('data-focus-visible-added');
        });
    });
    
    // Add proper ARIA labels to interactive elements that may be missing them
    const unlabeledButtons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    unlabeledButtons.forEach(button => {
        if (button.textContent.trim() === '' && !button.getAttribute('aria-label')) {
            // Try to infer a label from context
            if (button.classList.contains('close') || button.classList.contains('close-button')) {
                button.setAttribute('aria-label', 'Close');
            } else if (button.id === 'theme-toggle' && !button.getAttribute('aria-label')) {
                button.setAttribute('aria-label', 'Toggle dark mode');
                button.setAttribute('role', 'switch');
            }
        }
    });
    
    // Make sure all images have alt text
    const images = document.querySelectorAll('img:not([alt])');
    images.forEach(img => {
        // If image has no alt attribute, add an empty one for decorative images
        // or try to infer a meaningful one from context
        const fileName = img.src.split('/').pop().split('.')[0];
        img.setAttribute('alt', fileName || '');
    });
}

// Responsive image handling
function setupResponsiveImages() {
    // Find all images that could benefit from responsive handling
    const images = document.querySelectorAll('.portfolio-item img, section > img');
    
    images.forEach(img => {
        if (img.hasAttribute('data-responsive')) return; // Skip if already processed
        
        const src = img.getAttribute('src');
        if (!src) return;
        
        // Extract file path and extension
        const lastDot = src.lastIndexOf('.');
        const filePath = src.substring(0, lastDot);
        const ext = src.substring(lastDot);
        
        // Create a picture element
        const picture = document.createElement('picture');
        img.parentNode.insertBefore(picture, img);
        
        // Create source elements for different screen sizes if files exist
        // You would need to create these image variants (e.g. image-sm.jpg, image-md.jpg)
        const sourceLg = document.createElement('source');
        sourceLg.setAttribute('media', '(min-width: 1200px)');
        sourceLg.setAttribute('srcset', `${filePath}-lg${ext}`);
        
        const sourceMd = document.createElement('source');
        sourceMd.setAttribute('media', '(min-width: 768px)');
        sourceMd.setAttribute('srcset', `${filePath}-md${ext}`);
        
        const sourceSm = document.createElement('source');
        sourceSm.setAttribute('media', '(max-width: 767px)');
        sourceSm.setAttribute('srcset', `${filePath}-sm${ext}`);
        
        // Add sources to picture
        picture.appendChild(sourceLg);
        picture.appendChild(sourceMd);
        picture.appendChild(sourceSm);
        
        // Move the img into the picture element
        img.setAttribute('data-responsive', 'true');
        picture.appendChild(img);
    });
}

// Initialize AOS (Animation On Scroll) library
function initAOS() {
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    offset: 100,
    disable: 'mobile' // Disable on mobile devices for better performance
  });
}

// Add to window load event
window.addEventListener('load', function() {
  // ...existing code...
  initAOS();
});

// Add this function call to your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    // ...existing code...
    
    // Initialize theme manager
    initThemeManager();
    
    // ...existing code...
});