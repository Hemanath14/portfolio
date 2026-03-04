/**
 * Apple.com & Antigravity Style Interactive JS
 * Contains: Lerp cursor, Magnetic Buttons, and Intersection Revealer
 */

document.addEventListener("DOMContentLoaded", () => {
    /* --- 0. PRELOADER LOGIC --- */
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('loader-progress');
    let progress = 0;

    // Fake loading progress
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 8; // Slower progress for better visual
        if (progress > 100) progress = 100;

        let roundedProgress = Math.floor(progress);
        if (progressBar) progressBar.style.width = `${progress}%`;

        // Update the percentage text
        const percentageText = document.getElementById('loader-percentage');
        if (percentageText) {
            percentageText.textContent = `${roundedProgress}%`;
        }

        // Active state toggling based on percentage
        const stage1 = document.getElementById('stage-1');
        const stage2 = document.getElementById('stage-2');
        const stage3 = document.getElementById('stage-3');

        if (progress < 30) {
            if (stage1) stage1.classList.add('active');
        } else if (progress >= 30 && progress < 70) {
            if (stage1) { stage1.classList.remove('active'); stage1.classList.add('completed'); }
            if (stage2) stage2.classList.add('active');
        } else if (progress >= 70 && progress <= 100) {
            if (stage2) { stage2.classList.remove('active'); stage2.classList.add('completed'); }
            if (stage3) stage3.classList.add('active');
        }

        if (progress === 100) {
            clearInterval(loadingInterval);
            if (stage3) { stage3.classList.remove('active'); stage3.classList.add('completed'); }
            setTimeout(() => {
                if (preloader) preloader.classList.add('hidden');
                // Re-trigger global cursor tracking so it doesn't freeze under the preloader
                document.body.style.cursor = 'none';
            }, 800); // Slight pause at 100% before slide up
        }
    }, 150);

    /* --- 1. ADVANCED ANTIGRAVITY CURSOR LOGIC --- */
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');

    // Core state
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Dot follows precisely, outline lags behind via lerp
    let dotPos = { x: mouse.x, y: mouse.y };
    let outlinePos = { x: mouse.x, y: mouse.y };

    // Lerp parameters
    let isHoveringMagnetic = false;
    let magneticTarget = null;
    let outlineSpeed = 0.15; // Lower is more lag (Antigravity 'heavy' feel)

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Linear interpolation function
    const lerp = (start, end, amt) => {
        return (1 - amt) * start + amt * end;
    };

    const renderCursor = () => {
        if (!isHoveringMagnetic) {
            // Standard smooth follow
            dotPos.x = mouse.x;
            dotPos.y = mouse.y;

            outlinePos.x = lerp(outlinePos.x, mouse.x, outlineSpeed);
            outlinePos.y = lerp(outlinePos.y, mouse.y, outlineSpeed);
        } else if (magneticTarget) {
            // Magnetic Snapping Logic
            // When hovering a magnetic element, the cursor snaps to its center
            const rect = magneticTarget.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Limit how far the cursor can "stretch" away from the center of the element
            const distanceX = mouse.x - centerX;
            const distanceY = mouse.y - centerY;

            // Cursor pulls slightly towards mouse, but stays glued to element range
            dotPos.x = centerX + distanceX * 0.1;
            dotPos.y = centerY + distanceY * 0.1;

            outlinePos.x = lerp(outlinePos.x, dotPos.x, outlineSpeed * 2);
            outlinePos.y = lerp(outlinePos.y, dotPos.y, outlineSpeed * 2);
        }

        // Apply transforms using translate3d for hardware acceleration
        if (cursorDot && cursorOutline) {
            cursorDot.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0)`;
            cursorOutline.style.transform = `translate3d(${outlinePos.x}px, ${outlinePos.y}px, 0)`;
        }

        requestAnimationFrame(renderCursor);
    };
    renderCursor();


    /* --- 2. INTERACTIVE STATES (TEXT & MAGNETIC HOVER) --- */
    const largeTextElements = document.querySelectorAll('[data-cursor-text]');
    const magneticElements = document.querySelectorAll('.magnetic');

    // Text Hover: Makes the custom cursor bloom out to invert massive text segments
    largeTextElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorDot.classList.add('text-hover');
            cursorOutline.classList.add('text-hover');
        });
        el.addEventListener('mouseleave', () => {
            cursorDot.classList.remove('text-hover');
            cursorOutline.classList.remove('text-hover');
        });
    });

    // Magnetic Links/Buttons: Snaps cursor and gently pulls the element itself
    magneticElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            isHoveringMagnetic = true;
            magneticTarget = el;
            cursorDot.classList.add('link-hover');
            cursorOutline.classList.add('link-hover');
        });

        el.addEventListener('mousemove', (e) => {
            // Calculate pull effect for the HTML element itself
            const rect = el.getBoundingClientRect();
            const h = rect.width / 2;
            const v = rect.height / 2;

            // Mouse position relative to element center (-1 to 1)
            const x = (e.clientX - rect.left - h) / h;
            const y = (e.clientY - rect.top - v) / v;

            // Move the element slightly
            el.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
        });

        el.addEventListener('mouseleave', () => {
            isHoveringMagnetic = false;
            magneticTarget = null;
            cursorDot.classList.remove('link-hover');
            cursorOutline.classList.remove('link-hover');
            // Reset element position
            el.style.transform = `translate(0px, 0px)`;
        });
    });


    /* --- 3. APPLE.COM STYLE FADE-UP REVEAL --- */
    const fadeElements = document.querySelectorAll('.fade-up');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        root: null,
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: "0px 0px -50px 0px"
    });

    fadeElements.forEach(el => revealObserver.observe(el));

    /* --- 4. BACKGROUND PARTICLES LOGIC --- */
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.opacity = Math.random() * 0.5 + 0.1;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > width) this.x = 0;
                if (this.x < 0) this.x = width;
                if (this.y > height) this.y = 0;
                if (this.y < 0) this.y = height;
            }

            draw() {
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const initParticles = () => {
            particles = [];
            let particleCount = Math.floor(width * height / 15000);
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        initParticles();

        const animateParticles = () => {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateParticles);
        };

        animateParticles();
    }
});
