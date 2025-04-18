document.addEventListener('DOMContentLoaded', () => {
  // Store the current page URL
  let currentPage = window.location.href;

  // Add click listeners to all internal links
  document.querySelectorAll('a').forEach(link => {
    // Only add transition to internal links (same domain)
    if (link.hostname === window.location.hostname) {
      link.addEventListener('click', e => {
        // Don't handle if ctrl/cmd clicked (open in new tab behavior)
        if (e.ctrlKey || e.metaKey) return;
        
        e.preventDefault();
        const targetUrl = link.href;
        
        // Don't animate if it's the same page
        if (targetUrl === currentPage) return;
        
        // Add fade-out class to body
        document.body.classList.add('page-transition-out');
        
        // After animation completes, navigate to the new page
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 300); // Match this timing with your CSS transition
      });
    }
  });
  
  // When page loads, add fade-in class
  document.body.classList.add('page-transition-in');
});