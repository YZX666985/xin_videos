function createUniverseStarfield(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const stars = [];
    const flashes = [];
    const meteors = [];

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let lastMeteorAt = 0;
    let nextMeteorDelay = randomBetween(9000, 17000);

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.floor(width * pixelRatio);
        canvas.height = Math.floor(height * pixelRatio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function buildStars() {
        stars.length = 0;
        flashes.length = 0;

        const areaScale = Math.max(0.85, Math.min(1.1, (width * height) / 1200000));
        const count = Math.floor((65 + 60 * areaScale) * 1.2);

        for (let i = 0; i < count; i += 1) {
            const depth = Math.random();
            const dir = Math.random() > 0.5 ? 1 : -1;

            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                r: 0.08 + depth * 0.42,
                glow: 0.45 + depth * 1.25,
                alphaBase: 0.2 + Math.random() * 0.36,
                twinkleAmp: 0.01 + Math.random() * 0.04,
                twinkleSpeed: 0.0008 + Math.random() * 0.003,
                phase: Math.random() * Math.PI * 2,
                vx: (0.0027 + depth * 0.0145) * dir,
                vy: (Math.random() - 0.5) * 0.002,
                warm: Math.random() > 0.93
            });
        }

        const flashCount = Math.floor(4 + areaScale * 4);
        for (let i = 0; i < flashCount; i += 1) {
            flashes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                baseR: randomBetween(0.35, 0.9),
                period: randomBetween(3800, 7600),
                delay: randomBetween(0, 3200)
            });
        }
    }

    function spawnMeteor(ts) {
        const startX = width + 140;
        const startY = randomBetween(height * 0.05, height * 0.18);
        const endX = -140;
        const endY = randomBetween(height * 0.78, height * 0.92);
        const frames = randomBetween(110, 150);
        const vx = (endX - startX) / frames;
        const vy = (endY - startY) / frames;
        const speedLen = Math.hypot(vx, vy) || 1;

        meteors.push({
            x: startX,
            y: startY,
            vx: vx,
            vy: vy,
            life: randomBetween(1450, 2300),
            age: 0,
            len: randomBetween(150, 240),
            headR: randomBetween(0.55, 1.05),
            width: randomBetween(0.75, 1.35),
            dirX: vx / speedLen,
            dirY: vy / speedLen
        });

        lastMeteorAt = ts;
        nextMeteorDelay = randomBetween(9000, 17000);
    }

    function drawSkyBase() {
        const bg = ctx.createLinearGradient(0, 0, 0, height);
        bg.addColorStop(0, "#020307");
        bg.addColorStop(0.42, "#060b18");
        bg.addColorStop(1, "#05070c");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);

        const haze = ctx.createLinearGradient(0, 0, width, height);
        haze.addColorStop(0, "rgba(112, 144, 255, 0.03)");
        haze.addColorStop(0.4, "rgba(182, 196, 230, 0.02)");
        haze.addColorStop(1, "rgba(96, 125, 196, 0)");
        ctx.fillStyle = haze;
        ctx.fillRect(0, 0, width, height);
    }

    function drawSpaceVignette() {
        const vignette = ctx.createRadialGradient(
            width * 0.5,
            height * 0.45,
            height * 0.15,
            width * 0.5,
            height * 0.5,
            Math.max(width, height) * 0.8
        );
        vignette.addColorStop(0, "rgba(0,0,0,0)");
        vignette.addColorStop(1, "rgba(0,0,0,0.5)");
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);
    }

    function drawStars(ts) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        for (const s of stars) {
            s.phase += s.twinkleSpeed;
            const alpha = clamp(s.alphaBase + Math.sin(s.phase) * s.twinkleAmp, 0.06, 0.72);

            s.x += s.vx;
            s.y += s.vy;

            if (s.x < -8) s.x = width + 8;
            if (s.x > width + 8) s.x = -8;
            if (s.y < -8) s.y = height + 8;
            if (s.y > height + 8) s.y = -8;

            const core = s.warm ? `rgba(255, 242, 224, ${alpha})` : `rgba(233, 241, 255, ${alpha})`;
            const halo = s.warm ? `rgba(250, 210, 138, ${alpha * 0.11})` : `rgba(154, 191, 255, ${alpha * 0.12})`;

            const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.glow);
            glow.addColorStop(0, core);
            glow.addColorStop(1, halo);
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.glow, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = core;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }

        for (const f of flashes) {
            const t = ((ts + f.delay) % f.period) / f.period;
            const amp = Math.sin(t * Math.PI * 2);
            const alpha = Math.max(0, amp) * 0.42;
            if (alpha <= 0.01) continue;

            const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.baseR * 3.8);
            glow.addColorStop(0, `rgba(255,255,255, ${alpha})`);
            glow.addColorStop(1, "rgba(165,205,255,0)");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.baseR * 3.8, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    function drawMeteors(delta, ts) {
        if (ts - lastMeteorAt > nextMeteorDelay) {
            spawnMeteor(ts);
        }

        for (let i = meteors.length - 1; i >= 0; i -= 1) {
            const m = meteors[i];
            m.age += delta;

            const t = m.age / m.life;
            if (t >= 1) {
                meteors.splice(i, 1);
                continue;
            }

            m.x += m.vx;
            m.y += m.vy;

            const alpha = 1 - t;
            const tailX = m.x - m.dirX * m.len;
            const tailY = m.y - m.dirY * m.len;

            const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
            grad.addColorStop(0, `rgba(255,255,255, ${alpha})`);
            grad.addColorStop(0.26, `rgba(196, 224, 255, ${alpha * 0.62})`);
            grad.addColorStop(1, "rgba(120, 180, 255, 0)");

            ctx.strokeStyle = grad;
            ctx.lineWidth = m.width;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(tailX, tailY);
            ctx.stroke();

            const fade = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
            fade.addColorStop(0, `rgba(255,255,255, ${alpha * 0.45})`);
            fade.addColorStop(1, "rgba(120, 180, 255, 0)");
            ctx.strokeStyle = fade;
            ctx.lineWidth = m.width * 2.1;
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(tailX, tailY);
            ctx.stroke();

            ctx.fillStyle = `rgba(255,255,255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(m.x, m.y, m.headR, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    let prev = performance.now();
    function render(ts) {
        const delta = Math.min(50, ts - prev);
        prev = ts;

        drawSkyBase();
        drawSpaceVignette();
        drawStars(ts);
        drawMeteors(delta, ts);

        requestAnimationFrame(render);
    }

    resize();
    buildStars();
    requestAnimationFrame(render);

    window.addEventListener("resize", () => {
        resize();
        buildStars();
    });
}

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

function clamp(num, min, max) {
    return Math.min(max, Math.max(min, num));
}
