/* ==========================================================================
   ELTHEOS LLC APP LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initParticles();
  initScrollSpyAndReveals();
  initCounters();
  initPremiumInteractions();
});

/* ==========================================================================
   1. NAVIGATION LOGIC (Mobile Toggle & Scrolled Header)
   ========================================================================== */
function initNavigation() {
  const header = document.querySelector('.header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navContainer = document.getElementById('main-nav');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky header class on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  mobileToggle.addEventListener('click', () => {
    const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    mobileToggle.setAttribute('aria-expanded', !isExpanded);
    mobileToggle.classList.toggle('active');
    navContainer.classList.toggle('active');
  });

  // Close mobile menu when a link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navContainer.classList.contains('active')) {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.classList.remove('active');
        navContainer.classList.remove('active');
      }
    });
  });
}

/* ==========================================================================
   2. INTERACTIVE PARTICLES CANVAS (Hero Background)
   ========================================================================== */
function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let particlesArray = [];
  let animationFrameId;

  // Set canvas size
  function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  setCanvasSize();
  
  // Resize handler with throttle
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      setCanvasSize();
      createParticles();
    }, 200);
  });

  // Particle Class
  class Particle {
    constructor(x, y, directionX, directionY, size, color) {
      this.x = x;
      this.y = y;
      this.directionX = directionX;
      this.directionY = directionY;
      this.size = size;
      this.color = color;
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    
    update() {
      // Bounce off boundaries or wrap around
      if (this.x > canvas.width || this.x < 0) {
        this.directionX = -this.directionX;
      }
      if (this.y > canvas.height || this.y < 0) {
        this.directionY = -this.directionY;
      }
      
      this.x += this.directionX;
      this.y += this.directionY;
      this.draw();
    }
  }

  // Create particles
  function createParticles() {
    particlesArray = [];
    // Calculate density based on screen dimensions
    const numberOfParticles = Math.min(Math.floor((canvas.width * canvas.height) / 14000), 80);
    
    for (let i = 0; i < numberOfParticles; i++) {
      const size = Math.random() * 2 + 1;
      const x = Math.random() * (canvas.width - size * 2) + size;
      const y = Math.random() * (canvas.height - size * 2) + size;
      
      // Speed multiplier
      const directionX = (Math.random() - 0.5) * 0.35;
      const directionY = (Math.random() - 0.5) * 0.35;
      
      // Gradient accent colors
      const color = i % 2 === 0 ? 'rgba(99, 102, 241, 0.45)' : 'rgba(20, 184, 166, 0.45)';
      
      particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
  }

  // Draw lines connecting particles
  function connect() {
    let opacityValue = 1;
    const maxDistance = 140;
    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a; b < particlesArray.length; b++) {
        const distSq = ((particlesArray[a].x - particlesArray[b].x) ** 2) + 
                       ((particlesArray[a].y - particlesArray[b].y) ** 2);
        
        if (distSq < maxDistance * maxDistance) {
          opacityValue = 1 - (Math.sqrt(distSq) / maxDistance);
          ctx.strokeStyle = `rgba(99, 102, 241, ${opacityValue * 0.15})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
          ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
          ctx.stroke();
        }
      }
    }
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
    }
    connect();
    animationFrameId = requestAnimationFrame(animate);
  }

  createParticles();
  animate();
}

/* ==========================================================================
   3. SCROLL SPY & SCROLL REVEALS FALLBACKS
   ========================================================================== */
function initScrollSpyAndReveals() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // 3a. Scroll Spy
  const spyOptions = {
    root: null,
    rootMargin: '-30% 0px -60% 0px', // Trigger when section is in center view
    threshold: 0
  };

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, spyOptions);

  sections.forEach(section => spyObserver.observe(section));

  // 3b. Scroll Reveal Fallback for older browsers / Firefox
  if (!CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
    // Inject fallback transition styles dynamically
    const style = document.createElement('style');
    style.textContent = `
      .scroll-reveal {
        opacity: 0 !important;
        transform: translateY(30px) !important;
        transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), 
                    transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }
      .scroll-reveal.visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
    `;
    document.head.appendChild(style);

    const revealOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px' // Trigger slightly before entering screen
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Trigger once
        }
      });
    }, revealOptions);

    document.querySelectorAll('.scroll-reveal').forEach(el => {
      revealObserver.observe(el);
    });
  }
}

/* ==========================================================================
   4. METRICS COUNTER ANIMATION
   ========================================================================== */
function initCounters() {
  const metricItems = document.querySelectorAll('.metric-number');
  
  const countOptions = {
    root: null,
    threshold: 0.5, // Trigger when 50% visible
  };

  const countObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const targetValue = parseInt(element.getAttribute('data-target'), 10);
        animateCounter(element, targetValue);
        observer.unobserve(element); // Count only once
      }
    });
  }, countOptions);

  metricItems.forEach(item => countObserver.observe(item));

  function animateCounter(element, target) {
    let current = 0;
    const duration = 1800; // milliseconds
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const counterInterval = setInterval(() => {
      frame++;
      // Easing function (easeOutQuad)
      const progress = frame / totalFrames;
      const easeProgress = progress * (2 - progress);
      current = Math.round(easeProgress * target);

      // Formatting text output
      if (target === 500000) {
        element.textContent = formatCount(current) + '+';
      } else if (target === 99) {
        element.textContent = current + '%';
      } else {
        element.textContent = current + 'x';
      }

      if (frame >= totalFrames) {
        // Force exact end value
        if (target === 500000) {
          element.textContent = '500,000+';
        } else if (target === 99) {
          element.textContent = '99.9%';
        } else {
          element.textContent = '15x';
        }
        clearInterval(counterInterval);
      }
    }, frameRate);
  }

  function formatCount(num) {
    return num.toLocaleString();
  }
}

/* ==========================================================================
   5. PREMIUM INTERACTIONS (CURSOR GLOW & SCROLL PROGRESS)
   ========================================================================== */
function initPremiumInteractions() {
  // 5a. Dynamic Scroll Progress Bar
  const progress = document.createElement('div');
  progress.classList.add('scroll-progress');
  document.body.appendChild(progress);
  
  window.addEventListener('scroll', () => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (totalScroll > 0) {
      const scrollPercent = (window.scrollY / totalScroll) * 100;
      progress.style.width = `${scrollPercent}%`;
    }
  });

  // 5b. Cursor Radial Glow for Glass Cards
  const glassCards = document.querySelectorAll('.glass-card');
  glassCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}
