/**
 * Hero Carousel Logic
 * Handles autoplay, pause, touch swipe, a11y, and reduced motion for the home hero.
 */

document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.hero-carousel');
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.carousel-slide');
    const dots = carousel.querySelectorAll('.carousel-dot');
    const playPauseBtn = carousel.querySelector('.carousel-play-pause');
    
    if (!slides.length || !dots.length) return;

    let currentSlide = 0;
    let autoplayInterval = null;
    let isPlaying = true;
    const AUTOPLAY_DELAY = 4500;
    
    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initialization
    function init() {
        if (prefersReducedMotion) {
            isPlaying = false;
            updatePlayPauseIcon();
        }
        
        goToSlide(0);
        
        if (isPlaying) {
            startAutoplay();
        }
        
        setupEventListeners();
    }

    function setupEventListeners() {
        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index);
                if (isPlaying) resetAutoplay();
            });
        });

        // Play/Pause button
        playPauseBtn.addEventListener('click', togglePlayPause);

        // Hover & Focus (Pause on hover/focus if playing)
        carousel.addEventListener('mouseenter', pauseAutoplay);
        carousel.addEventListener('mouseleave', () => { if (isPlaying) startAutoplay(); });
        
        carousel.addEventListener('focusin', pauseAutoplay);
        carousel.addEventListener('focusout', () => { if (isPlaying) startAutoplay(); });

        // Touch Swipe Support
        let touchStartX = 0;
        let touchEndX = 0;

        carousel.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
            pauseAutoplay();
        }, { passive: true });

        carousel.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            if (isPlaying) startAutoplay();
        }, { passive: true });

        function handleSwipe() {
            const SWIPE_THRESHOLD = 50;
            if (touchEndX < touchStartX - SWIPE_THRESHOLD) {
                // Swipe Left -> Next
                nextSlide();
            }
            if (touchEndX > touchStartX + SWIPE_THRESHOLD) {
                // Swipe Right -> Prev
                prevSlide();
            }
        }
    }

    function goToSlide(index) {
        slides[currentSlide].classList.remove('active');
        slides[currentSlide].setAttribute('aria-hidden', 'true');
        dots[currentSlide].classList.remove('active');
        dots[currentSlide].setAttribute('aria-selected', 'false');

        currentSlide = index;

        slides[currentSlide].classList.add('active');
        slides[currentSlide].setAttribute('aria-hidden', 'false');
        dots[currentSlide].classList.add('active');
        dots[currentSlide].setAttribute('aria-selected', 'true');
    }

    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        goToSlide(next);
    }

    function prevSlide() {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        goToSlide(prev);
    }

    function startAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
        autoplayInterval = setInterval(nextSlide, AUTOPLAY_DELAY);
    }

    function pauseAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }

    function resetAutoplay() {
        pauseAutoplay();
        startAutoplay();
    }

    function togglePlayPause() {
        isPlaying = !isPlaying;
        if (isPlaying) {
            startAutoplay();
        } else {
            pauseAutoplay();
        }
        updatePlayPauseIcon();
    }

    function updatePlayPauseIcon() {
        if (isPlaying) {
            playPauseBtn.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
            `;
            playPauseBtn.setAttribute('aria-label', 'Pause carousel');
        } else {
            playPauseBtn.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
            `;
            playPauseBtn.setAttribute('aria-label', 'Play carousel');
        }
    }

    init();
});
