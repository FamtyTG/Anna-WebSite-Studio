document.addEventListener('DOMContentLoaded', () => {

    // 1. SMOOTH SCROLL (LENIS)
    const lenis = new Lenis({
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
    });

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0, 0);
    lenis.on('scroll', ScrollTrigger.update);

    // 2. PRELOADER LOGIC
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        lenis.stop(); // Freeze scroll while loading
        setTimeout(() => {
            gsap.to(preloader, {
                opacity: 0,
                duration: 1.5,
                ease: "power2.inOut",
                onComplete: () => {
                    preloader.style.display = 'none';
                    lenis.start(); // Unlock scroll
                    ScrollTrigger.refresh();
                }
            });
        }, 3200); // Waits for the snake to draw
    }

    // 3. CURSOR
    const cursorRing = document.querySelector('.cursor-ring');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && window.innerWidth > 1024 && cursorRing) {
        document.addEventListener('mousemove', (e) => {
            gsap.to(cursorRing, { x: e.clientX, y: e.clientY, duration: 0.2, ease: 'power3.out' });
        });

        const hoverElements = document.querySelectorAll('.hoverable, a, button, .service-row, .img-wrap');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursorRing.classList.add('hover-active'));
            el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover-active'));
        });
    }

    // 4. FLOATING IMAGE REVEAL & MAGNETIC BUTTONS
    if (!prefersReducedMotion && window.innerWidth > 1024) {
        // Floating Image Logic
        const floatImg = document.createElement('div');
        floatImg.classList.add('float-img-reveal');
        const floatImgSrc = document.createElement('img');
        floatImg.appendChild(floatImgSrc);
        document.body.appendChild(floatImg);

        gsap.set(floatImg, { xPercent: -50, yPercent: -50, scale: 0.8 });
        let xTo = gsap.quickTo(floatImg, "x", { duration: 0.4, ease: "power3" }),
            yTo = gsap.quickTo(floatImg, "y", { duration: 0.4, ease: "power3" });

        const serviceRows = document.querySelectorAll('.service-row');
        serviceRows.forEach(row => {
            row.addEventListener('mouseenter', () => {
                const imgSrc = row.getAttribute('data-image');
                if (imgSrc) {
                    floatImgSrc.src = imgSrc;
                    gsap.to(floatImg, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });
                }
            });
            row.addEventListener('mousemove', (e) => {
                xTo(e.clientX);
                yTo(e.clientY);
            });
            row.addEventListener('mouseleave', () => {
                gsap.to(floatImg, { opacity: 0, scale: 0.8, duration: 0.4, ease: "power2.out" });
            });
        });

        // Magnetic Buttons Logic
        const magnets = document.querySelectorAll('.btn-solid');
        magnets.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                // Magnetic pull weight set to 0.4
                gsap.to(btn, { x: x * 0.4, y: y * 0.4, duration: 0.4, ease: "power2.out" });
            });
            btn.addEventListener('mouseleave', () => {
                // Elastic snap back
                gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
            });
        });
    }

    // 5. ANCHORS
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                lenis.scrollTo(targetElement, { offset: -100, duration: 1.5 });
            }
        });
    });

    // 6. FADE IN + SLIDE UP REVEALS
    const revealElements = gsap.utils.toArray('.gsap-reveal');
    revealElements.forEach(el => {
        gsap.from(el, {
            y: 50, opacity: 0, duration: 1.5, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" }
        });
    });

    // 7. PARALLAX EFFECT FOR IMAGES & TYPOGRAPHY
    if (!prefersReducedMotion) {
        // Content Media
        const parallaxImages = gsap.utils.toArray('.gsap-parallax img, .gsap-parallax video');
        parallaxImages.forEach(media => {
            gsap.to(media, {
                yPercent: 15, ease: "none",
                scrollTrigger: { trigger: media.parentElement, start: "top bottom", end: "bottom top", scrub: 1.5 }
            });
        });

        // Typography (Numbers and Captions)
        const typoParallax = gsap.utils.toArray('[data-speed]');
        typoParallax.forEach(el => {
            const speed = parseFloat(el.getAttribute('data-speed'));
            gsap.to(el, {
                y: speed, ease: "none",
                scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 1.5 }
            });
        });
    }

    // 8. FADE TO BLACK (THE DIVE TRANSITION WITH VIGNETTE)
    gsap.to(document.documentElement, {
        "--bg-color": "#1A1A1A",
        "--text-main": "#FFFFFF",
        "--text-muted": "#888888",
        "--line-color": "rgba(255, 255, 255, 0.05)",
        "--text-inverted": "#1A1A1A",
        "--vignette-opacity": "1", // Fades in the Vignette mapped in CSS
        scrollTrigger: {
            trigger: "#services",
            start: "top 85%", // Starts early to feel like diving into water
            end: "top 25%",   // Finishes when fully entered
            scrub: 1.5        // Slow, elegant transition
        }
    });

});
