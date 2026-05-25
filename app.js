document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // Theme Toggle Functionality
    // ==========================================================================
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const body = document.body;

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    body.className = savedTheme;

    themeToggleBtn.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.replace('dark-theme', 'light-theme');
            localStorage.setItem('theme', 'light-theme');
        } else {
            body.classList.replace('light-theme', 'dark-theme');
            localStorage.setItem('theme', 'dark-theme');
        }
    });

    // ==========================================================================
    // Accordion Control (Your Choices Section)
    // ==========================================================================
    const accordionTriggers = document.querySelectorAll('.accordion-trigger');

    accordionTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const item = trigger.closest('.accordion-item');
            const content = item.querySelector('.accordion-content');
            const isActive = item.classList.contains('active');

            // Close all other items
            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.accordion-content').style.maxHeight = null;
                    otherItem.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
                content.style.maxHeight = null;
                trigger.setAttribute('aria-expanded', 'false');
            } else {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // ==========================================================================
    // Scroll Spy & Smooth Navigation
    // ==========================================================================
    const tocLinks = document.querySelectorAll('.toc-link');
    const sections = document.querySelectorAll('.content-section');

    function updateActiveTocLink() {
        let currentSectionId = '';
        
        // Find which section is currently in view
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Shift trigger threshold down a bit
            if (window.scrollY >= sectionTop - 150) {
                currentSectionId = section.getAttribute('id');
            }
        });

        // If at the bottom of page, highlight the last section
        if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 50) {
            currentSectionId = sections[sections.length - 1].getAttribute('id');
        }

        // Apply active class
        tocLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }

    // Bind event listeners
    window.addEventListener('scroll', updateActiveTocLink);
    updateActiveTocLink(); // Initial run

    // ==========================================================================
    // Search Functionality
    // ==========================================================================
    const searchInput = document.getElementById('policy-search');
    const sectionsToSearch = document.querySelectorAll('.content-section');

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();

        sectionsToSearch.forEach(section => {
            const sectionText = section.textContent.toLowerCase();
            const heading = section.querySelector('h2');
            const card = section.querySelector('.section-card, .grid-2, .security-banner, .changes-card');

            if (searchTerm === '') {
                // Reset styling if search is empty
                section.style.display = 'block';
                section.style.opacity = '1';
                removeHighlights(section);
            } else if (sectionText.includes(searchTerm)) {
                // Match found
                section.style.display = 'block';
                section.style.opacity = '1';
                highlightText(section, searchTerm);
            } else {
                // No match
                section.style.display = 'none';
                section.style.opacity = '0';
            }
        });
    });

    // Helper: Highlight matching text using a dynamic wrapping span
    function highlightText(element, term) {
        removeHighlights(element);
        
        // Avoid highlighting inside tags, icons, links, or accordion structures to prevent breakage
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    // Skip script, style tags, and check if parent is already a highlight
                    const parentTagName = node.parentNode.tagName.toLowerCase();
                    if (parentTagName === 'script' || parentTagName === 'style' || parentTagName === 'mark' || parentTagName === 'svg' || parentTagName === 'path') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const nodesToReplace = [];
        let currentNode = walker.nextNode();
        while (currentNode) {
            if (currentNode.nodeValue.toLowerCase().includes(term)) {
                nodesToReplace.push(currentNode);
            }
            currentNode = walker.nextNode();
        }

        nodesToReplace.forEach(node => {
            const parent = node.parentNode;
            if (!parent) return;

            const text = node.nodeValue;
            const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
            
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;
            
            text.replace(regex, (match, p1, index) => {
                // Add preceding text
                if (index > lastIndex) {
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex, index)));
                }
                
                // Add highlighted node
                const mark = document.createElement('mark');
                mark.className = 'search-highlight';
                mark.style.backgroundColor = 'rgba(6, 182, 212, 0.3)';
                mark.style.color = 'var(--text-primary)';
                mark.style.borderRadius = '2px';
                mark.style.padding = '0 2px';
                mark.appendChild(document.createTextNode(match));
                fragment.appendChild(mark);
                
                lastIndex = index + match.length;
            });
            
            // Add trailing text
            if (lastIndex < text.length) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
            }
            
            parent.replaceChild(fragment, node);
        });
    }

    // Helper: Remove search highlights
    function removeHighlights(element) {
        const highlights = element.querySelectorAll('mark.search-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            if (parent) {
                parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
                parent.normalize(); // Join adjacent text nodes
            }
        });
    }

    // Helper: Escape regex special chars
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
});
