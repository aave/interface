type ParticleConfig = {
  left: number;
  sx: number;
  sy: number;
  delay: number;
};

const generateParticles = (count: number): ParticleConfig[] =>
  Array.from({ length: count }, (_, i) => ({
    left: ((i * 17) % 95) + 5,
    sx: (i % 2 === 0 ? -1 : 1) * (14 + ((i * 7) % 9)),
    sy: (i % 3 === 0 ? -1 : 1) * (9 + ((i * 5) % 4)),
    delay: i * 0.1,
  }));

const PARTICLES: readonly ParticleConfig[] = generateParticles(28);

const PARTICLE_VARIANTS: readonly { size: number; duration: number }[] = [
  { size: 81, duration: 2.8 },
  { size: 66, duration: 3.2 },
  { size: 96, duration: 2.8 },
  { size: 72, duration: 2.4 },
  { size: 90, duration: 3.4 },
];

const BAR_HALF_HEIGHT = 2;
const PARTICLE_Y_OFFSET = 11;
const PARTICLE_Y = BAR_HALF_HEIGHT - PARTICLE_Y_OFFSET;
const MAX_BUFFER_SIZE = 4096;

const easeOut = (t: number) => 1 - (1 - t) ** 3;

const drawSprite = (sprite: HTMLCanvasElement, size: number, color: string) => {
  const sourceRadius = 10;
  const shadowBlur = size / 3;
  const padding = Math.ceil(shadowBlur * 3);
  const dim = sourceRadius * 2 + padding * 2;

  sprite.width = dim;
  sprite.height = dim;
  const sctx = sprite.getContext('2d');
  if (!sctx) return;

  const cx = dim / 2;
  const cy = dim / 2;
  const offset = dim * 5;

  sctx.shadowOffsetX = offset;
  sctx.shadowOffsetY = offset;
  sctx.shadowBlur = shadowBlur;
  sctx.shadowColor = `color-mix(in srgb, ${color} 70%, transparent)`;
  sctx.fillStyle = color;
  sctx.beginPath();
  sctx.arc(cx - offset, cy - offset, sourceRadius, 0, Math.PI * 2);
  sctx.fill();
};

export class ParticleController {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly sprites: HTMLCanvasElement[];
  private readonly resizeObserver: ResizeObserver;
  private readonly startTime: number;
  private readonly dpr: number;
  private size = { width: 0, height: 0 };
  private color = '';
  private rafId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('ParticleController: 2d context unavailable');

    this.canvas = canvas;
    this.ctx = ctx;
    this.sprites = PARTICLE_VARIANTS.map(() => document.createElement('canvas'));
    this.dpr = Math.min(window.devicePixelRatio || 1, 3);
    this.startTime = performance.now();

    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      this.size = { width: entry.contentRect.width, height: entry.contentRect.height };
    });
    this.resizeObserver.observe(canvas);
  }

  setColor(color: string) {
    if (color === this.color) return;
    this.color = color;
    for (let i = 0; i < PARTICLE_VARIANTS.length; i++) {
      drawSprite(this.sprites[i], PARTICLE_VARIANTS[i].size, color);
    }
  }

  draw(now: number) {
    const { width, height } = this.size;
    if (width === 0 || height === 0) return;

    const targetW = Math.min(Math.round(width * this.dpr), MAX_BUFFER_SIZE);
    const targetH = Math.min(Math.round(height * this.dpr), MAX_BUFFER_SIZE);
    if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
      this.canvas.width = targetW;
      this.canvas.height = targetH;
    }

    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const elapsed = (now - this.startTime) / 1000;

    for (let i = 0; i < PARTICLES.length; i++) {
      const p = PARTICLES[i];
      const variantIndex = i % PARTICLE_VARIANTS.length;
      const t = (elapsed - p.delay) / PARTICLE_VARIANTS[variantIndex].duration;
      if (t < 0) continue;
      const phase = t - Math.floor(t);

      let scale: number;
      let opacity: number;
      let dx = 0;
      let dy = 0;
      if (phase < 0.2) {
        const f = easeOut(phase / 0.2);
        scale = 0.3 + 0.7 * f;
        opacity = f;
      } else {
        const f = easeOut((phase - 0.2) / 0.8);
        scale = 1 - 0.65 * f;
        opacity = 1 - f;
        dx = p.sx * f;
        dy = p.sy * f;
      }

      const x = (p.left / 100) * width + dx;
      const y = PARTICLE_Y + dy;
      const sprite = this.sprites[variantIndex];
      const dim = sprite.width * scale;

      ctx.globalAlpha = opacity;
      ctx.drawImage(sprite, x - dim / 2, y - dim / 2, dim, dim);
    }
    ctx.globalAlpha = 1;
  }

  start() {
    if (this.rafId !== null) return;
    const tick = (now: number) => {
      this.draw(now);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stop() {
    if (this.rafId === null) return;
    cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  cleanUp() {
    this.stop();
    this.resizeObserver.disconnect();
    for (const sprite of this.sprites) {
      sprite.width = 0;
      sprite.height = 0;
    }
    this.canvas.width = 0;
    this.canvas.height = 0;
  }
}
