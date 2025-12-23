document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Mobile Menu Logic ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');


    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuOverlay.classList.toggle('active');
            // Toggle icon (simple swap logic or Lucide replacement)
        });


        // Close menu when link clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuOverlay.classList.remove('active');
            });
        });
    }


    // --- 2. Loader & Init ---
    const loader = document.querySelector('.loader');
    setTimeout(() => {
        document.body.classList.add('loaded');
        initAnimations();
    }, 1500);



    // --- 3. Smooth Scroll (Lenis) ---
    // Only on Desktop for performance, native scroll on mobile is better
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    
    if (isDesktop) {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            smooth: true,
        });


        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }



    // --- 4. Theme Switcher ---
    const themeToggle = document.querySelector('.theme-toggle');
    const htmlElement = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    htmlElement.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'light') htmlElement.classList.remove('dark');


    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', newTheme);
        htmlElement.classList.toggle('dark');
        localStorage.setItem('theme', newTheme);

        // Keep custom cursor visible after theme switch
        if (window.__syncCursorTheme) window.__syncCursorTheme();
    });



    // --- 5. Custom Cursor (Desktop Only) ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    
    if (isDesktop) {
        window.addEventListener('mousemove', (e) => {
            gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.1 });
            gsap.to(cursorRing, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "power2.out" });
        });

        // Theme-aware cursor visibility + contrast
        window.__syncCursorTheme = () => {
            const theme = htmlElement.getAttribute('data-theme');
            const isLight = theme === 'light';

            if (!cursorDot || !cursorRing) return;

            cursorDot.style.mixBlendMode = isLight ? 'normal' : 'difference';
            cursorRing.style.mixBlendMode = isLight ? 'normal' : 'difference';

            cursorDot.style.backgroundColor = isLight ? '#000' : 'var(--accent)';
            cursorRing.style.borderColor = isLight ? '#000' : 'var(--accent)';

            // Ensure it never stays “filled” with the wrong hover color after switching themes
            cursorRing.style.backgroundColor = 'transparent';
        };

        // Apply on load
        window.__syncCursorTheme();


        const hoverElements = document.querySelectorAll('a, button, .magnetic');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                const theme = htmlElement.getAttribute('data-theme');
                const isLight = theme === 'light';

                gsap.to(cursorRing, { scale: 1.5, duration: 0.3 });
                cursorRing.style.borderColor = 'transparent';
                cursorRing.style.backgroundColor = isLight
                    ? 'rgba(0,0,0,0.15)'
                    : 'rgba(255,255,255,0.2)';
            });
            el.addEventListener('mouseleave', () => {
                const theme = htmlElement.getAttribute('data-theme');
                const isLight = theme === 'light';

                gsap.to(cursorRing, { scale: 1, duration: 0.3 });
                cursorRing.style.borderColor = isLight ? '#000' : 'var(--accent)';
                cursorRing.style.backgroundColor = 'transparent';
            });
        });
    }



    // --- 6. Interactive Code Card (Typewriter) ---
    const codeElement = document.getElementById('typewriter-code');
    const card = document.querySelector('.code-card');
    
    if (codeElement) {
        const codeLines = [
            { text: "async function", class: "keyword" },
            { text: " fetchData", class: "function" },
            { text: "(url: string) {\n" },
            { text: "  try {\n" },
            { text: "    const", class: "keyword" },
            { text: " res = ", class: "variable" },
            { text: "await", class: "keyword" },
            { text: " fetch(url);\n" },
            { text: "    return", class: "keyword" },
            { text: " res.json();\n" },
            { text: "  } catch (error) {\n" },
            { text: "    console.", class: "variable" },
            { text: "error", class: "function" },
            { text: "('Error:', error);\n" },
            { text: "  }\n" },
            { text: "}" }
        ];


        let isTyping = false;


        function typeCode() {
            if (isTyping) return;
            isTyping = true;
            codeElement.innerHTML = ''; 
            
            let lineIndex = 0;
            let charIndex = 0;
            const cursor = document.createElement('span');
            cursor.className = 'cursor-blink';
            codeElement.appendChild(cursor);


            function typeNextChar() {
                if (lineIndex >= codeLines.length) { isTyping = false; return; }
                const currentSegment = codeLines[lineIndex];
                const text = currentSegment.text;
                
                let currentSpan = codeElement.querySelector(`span[data-index="${lineIndex}"]`);
                if (!currentSpan) {
                    currentSpan = document.createElement('span');
                    currentSpan.setAttribute('data-index', lineIndex);
                    if (currentSegment.class) currentSpan.className = currentSegment.class;
                    codeElement.insertBefore(currentSpan, cursor);
                }


                currentSpan.textContent += text[charIndex];
                charIndex++;


                if (charIndex >= text.length) {
                    lineIndex++;
                    charIndex = 0;
                    setTimeout(typeNextChar, 30);
                } else {
                    setTimeout(typeNextChar, 15 + Math.random() * 20);
                }
            }
            typeNextChar();
        }


        // Trigger on view or interaction
        ScrollTrigger.create({
            trigger: ".code-card",
            start: "top 80%",
            onEnter: () => setTimeout(typeCode, 500)
        });


        if (card) {
            card.addEventListener('mouseenter', () => { if (!isTyping) typeCode(); });
        }
    }



    // --- 7. 3D Tilt (Hover Only - Desktop) ---
    if (card && isDesktop) {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const cardCenterX = rect.left + rect.width / 2;
            const cardCenterY = rect.top + rect.height / 2;
            const angleX = (e.clientY - cardCenterY) / 40;
            const angleY = (e.clientX - cardCenterX) / -40;
            const limitedX = Math.max(-10, Math.min(10, angleX));
            const limitedY = Math.max(-10, Math.min(10, angleY));
            card.style.transform = `rotateX(${limitedX}deg) rotateY(${limitedY}deg) translateZ(0)`;
        });


        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s ease-out';
            card.style.transform = `rotateX(0deg) rotateY(0deg) translateZ(0)`;
            setTimeout(() => { card.style.transition = ''; }, 500);
        });
    }



    // --- 8. Scroll Animations ---
    gsap.registerPlugin(ScrollTrigger);


    function initAnimations() {
        // Hero Reveal
        const tl = gsap.timeline();
        tl.from('.reveal-char', { y: 100, opacity: 0, duration: 1, stagger: 0.05, ease: "power4.out" })
          .from('.reveal-text', { y: 20, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power2.out" }, "-=0.5");


        // Bento Grid
        gsap.from('.bento-card', {
            scrollTrigger: { trigger: '.bento-grid', start: "top 85%" },
            y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: "power3.out"
        });


        // Projects
        document.querySelectorAll('.project-row').forEach(project => {
            gsap.from(project, {
                scrollTrigger: { trigger: project, start: "top 90%" },
                y: 50, opacity: 0, duration: 1, ease: "power3.out"
            });
        });
    }
});
