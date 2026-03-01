import { useEffect, useRef } from 'react';
import './ParticleText.css';

function ParticleTextOutline({ onClick }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = [];
    const gap = 2;

    // Set canvas size for navbar
    canvas.width = 300;
    canvas.height = 60;

    const fontSize = 32;
    const spacing = 8;

    // Draw "Code" outline in white
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.strokeText('Code', canvas.width / 2 - spacing, canvas.height / 2);

    // Get pixel data for "Code"
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Create particles from "Code" outline pixels
    for (let y = 0; y < canvas.height; y += gap) {
      for (let x = 0; x < canvas.width; x += gap) {
        const index = (y * canvas.width + x) * 4;
        if (imageData.data[index + 3] > 128) {
          particles.push({
            x,
            y,
            baseX: x,
            baseY: y,
            vx: 0,
            vy: 0,
            color: '#fff'
          });
        }
      }
    }

    // Clear and draw "Net" outline in purple gradient
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create gradient for "Net"
    const gradient = ctx.createLinearGradient(canvas.width / 2, 0, canvas.width / 2 + 100, 0);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.strokeText('Net', canvas.width / 2 + spacing, canvas.height / 2);

    // Get pixel data for "Net"
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Create particles from "Net" outline pixels with purple color
    for (let y = 0; y < canvas.height; y += gap) {
      for (let x = 0; x < canvas.width; x += gap) {
        const index = (y * canvas.width + x) * 4;
        if (imageData.data[index + 3] > 128) {
          // Calculate gradient color based on x position
          const ratio = Math.min(1, Math.max(0, (x - canvas.width / 2) / 100));
          const r = Math.floor(102 + (118 - 102) * ratio);
          const g = Math.floor(126 + (75 - 126) * ratio);
          const b = Math.floor(234 + (162 - 234) * ratio);
          
          particles.push({
            x,
            y,
            baseX: x,
            baseY: y,
            vx: 0,
            vy: 0,
            color: `rgb(${r}, ${g}, ${b})`
          });
        }
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.vx *= 0.9;
        p.vy *= 0.9;
        p.x += p.vx;
        p.y += p.vy;

        const dx = p.baseX - p.x;
        const dy = p.baseY - p.y;
        p.x += dx * 0.05;
        p.y += dy * 0.05;

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 1.5, 1.5);
      });

      requestAnimationFrame(animate);
    }

    animate();

    // Mouse move interaction
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      particles.forEach(p => {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 50) {
          const force = (50 - dist) / 50;
          p.vx += dx * 0.06 * force;
          p.vy += dy * 0.06 * force;
        }
      });
    };

    // Click interaction
    const handleClick = () => {
      particles.forEach(p => {
        p.vx += (Math.random() - 0.5) * 15;
        p.vy += (Math.random() - 0.5) * 15;
      });
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas particle-canvas-nav" onClick={onClick} />;
}

export default ParticleTextOutline;
