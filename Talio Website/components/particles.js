/**
 * MIRA Particle System - Simplified Galaxy Background
 * For feature pages and other subpages
 */

(function() {
    const canvas = document.getElementById('mira-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    
    // Configuration
    const config = {
        particleCount: 800,
        baseRadius: Math.min(window.innerWidth, window.innerHeight) * 0.3
    };
    
    let particles = [];
    let galaxyRotation = 0;
    let animationId;
    
    // Initialize canvas size
    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    
    // Initialize particles
    function initParticles() {
        particles = [];
        
        for (let i = 0; i < config.particleCount; i++) {
            // Galaxy distribution - edge heavy
            const densityRandom = Math.random();
            const galaxyRadius = 50 + Math.pow(densityRandom, 0.35) * 400;
            const galaxyAngle = Math.random() * Math.PI * 2;
            const galaxyZ = (Math.random() - 0.5) * 30;
            
            particles.push({
                galaxyRadius,
                galaxyAngle,
                galaxyZ,
                size: 0.8 + Math.random() * 2,
                alpha: 0.3 + Math.random() * 0.5,
                hue: 250 + Math.random() * 30,
                x: 0,
                y: 0,
                z: 0
            });
        }
    }
    
    // Animation loop
    function animate() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const cx = width / 2;
        const cy = height / 2;
        
        ctx.clearRect(0, 0, width, height);
        
        // Slow rotation based on time
        const time = Date.now() * 0.0001;
        galaxyRotation = time;
        
        ctx.globalCompositeOperation = 'lighter';
        
        const minRadius = 80;
        const maxRadius = Math.max(width, height) * 0.8;
        const Z_PERSPECTIVE = 600;
        const tiltAngle = -0.2;
        
        particles.forEach(p => {
            const angle = p.galaxyAngle + galaxyRotation;
            const radiusRatio = (p.galaxyRadius - 50) / 400;
            const particleRadius = minRadius + radiusRatio * (maxRadius - minRadius);
            
            // Spiral effect
            const spiralFactor = 0.9 + radiusRatio * 0.2;
            const spiralAngle = angle * spiralFactor;
            
            // Random spread
            const randomSpread = 10 + radiusRatio * 40;
            const offsetX = Math.sin(p.galaxyAngle * 7) * randomSpread * 0.4;
            const offsetY = Math.cos(p.galaxyAngle * 11) * randomSpread * 0.4;
            
            // Calculate position
            const galaxyX = Math.cos(spiralAngle) * particleRadius + offsetX;
            const galaxyY = Math.sin(spiralAngle) * particleRadius + offsetY;
            
            // Apply tilt
            const tiltedY = galaxyY * Math.cos(tiltAngle);
            const tiltedZ = galaxyY * Math.sin(tiltAngle) + p.galaxyZ * 0.5;
            
            p.x = galaxyX;
            p.y = tiltedY;
            p.z = tiltedZ;
            
            // Project to screen
            const scale = Z_PERSPECTIVE / (Z_PERSPECTIVE + p.z);
            const drawX = cx + p.x * scale;
            const drawY = cy + p.y * scale;
            
            if (scale > 0.15) {
                const alpha = scale * p.alpha * 0.8;
                const particleSize = p.size * scale;
                
                ctx.beginPath();
                ctx.arc(drawX, drawY, particleSize, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${alpha})`;
                ctx.fill();
            }
        });
        
        animationId = requestAnimationFrame(animate);
    }
    
    // Initialize
    resize();
    initParticles();
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        resize();
    });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationId);
    });
})();
