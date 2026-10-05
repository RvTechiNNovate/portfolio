(() => {
  const canvas = document.getElementById("signal-canvas");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  if (!context) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0;
  let height = 0;
  let points = [];
  let frame = 0;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.floor(width * ratio));
    canvas.height = Math.max(1, Math.floor(height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = width < 500 ? 42 : 64;
    points = Array.from({ length: count }, (_, index) => {
      const angle = (Math.PI * 2 * index) / count;
      const radius = Math.min(width, height) * (.2 + Math.random() * .22);
      return { angle, radius, drift: Math.random() * Math.PI * 2, size: .7 + Math.random() * 1.5 };
    });
  };

  const draw = (time = 0) => {
    context.clearRect(0, 0, width, height);
    const cx = width / 2;
    const cy = height / 2;
    const tick = reduceMotion ? 0 : time * .00018;
    const rendered = points.map((point) => ({
      x: cx + Math.cos(point.angle + tick) * point.radius * (1 + Math.sin(point.drift + tick * 3) * .07),
      y: cy + Math.sin(point.angle + tick) * point.radius * .72,
      size: point.size,
    }));
    context.strokeStyle = "rgba(119, 255, 176, .24)";
    context.lineWidth = .7;
    rendered.forEach((point, index) => {
      for (let target = index + 1; target < rendered.length; target += 1) {
        const other = rendered[target];
        const distance = Math.hypot(point.x - other.x, point.y - other.y);
        if (distance < 72) {
          context.globalAlpha = 1 - distance / 72;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      }
    });
    context.globalAlpha = 1;
    context.fillStyle = "rgba(141, 255, 188, .78)";
    rendered.forEach((point) => {
      context.beginPath();
      context.arc(point.x, point.y, point.size, 0, Math.PI * 2);
      context.fill();
    });
    if (!reduceMotion) frame = requestAnimationFrame(draw);
  };
  resize();
  draw();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  document.addEventListener("visibilitychange", () => {
    cancelAnimationFrame(frame);
    if (!document.hidden && !reduceMotion) frame = requestAnimationFrame(draw);
  });
})();
