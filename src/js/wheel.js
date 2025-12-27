
export class Wheel {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.segments = [];
        this.currentRotation = 0; // in radians
        this.isSpinning = false;
        this.animationId = null;

        // Physics / Animation state
        this.spinVelocity = 0;
        this.friction = 0.99; // Damping factor for manual stop or natural deceleration
        this.startTime = 0;
        this.spinDuration = 0;
    }

    setSegments(segments) {
        this.segments = segments;
        this.draw();
    }

    draw() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.currentRotation);

        this.segments.forEach(segment => {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, segment.startAngle, segment.endAngle);
            ctx.closePath();
            ctx.fillStyle = segment.color;
            ctx.fill();
            ctx.stroke();

            // Text Label
            ctx.save();
            // Calculate angle to place text
            const midAngle = segment.startAngle + (segment.endAngle - segment.startAngle) / 2;
            ctx.rotate(midAngle);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px Arial';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.fillText(segment.name, radius - 10, 5);
            ctx.restore();
        });

        ctx.restore();

        // Draw Center Circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.stroke();
    }

    /**
     * Start spinning the wheel.
     * @param {number} durationSeconds - Duration in seconds for the spin.
     * @param {boolean} autoStop - If true, stops automatically after duration.
     * @param {function} onComplete - Callback with the winner segment.
     */
    startSpin(durationSeconds, autoStop, onComplete) {
        if (this.isSpinning) return;
        this.isSpinning = true;
        this.spinDuration = durationSeconds * 1000;
        this.startTime = performance.now();
        this.autoStop = autoStop;
        this.onComplete = onComplete;

        // Initial kick
        // We want to rotate at least a few times.
        // If autoStop, we calculate exact velocity needed or use easing.
        // For simplicity, let's use a standard easing function for autoStop.

        if (autoStop) {
            // Random final angle offset (extra rotations)
            const minRotations = 5;
            const extraRotations = Math.random() * 5;
            const totalRotation = (minRotations + extraRotations) * 2 * Math.PI;

            this.targetRotation = this.currentRotation + totalRotation;
            this.animateAutoStop();
        } else {
            // Manual stop mode: Start spinning indefinitely until stop() is called
            this.spinVelocity = 0.5; // radians per frame (approx 30 rad/s = 5 rev/s)
            this.animateManual();
        }
    }

    animateAutoStop(currentTime) {
        if (!this.isSpinning) return;
        if (!currentTime) currentTime = performance.now();

        const elapsed = currentTime - this.startTime;

        if (elapsed >= this.spinDuration) {
            this.finishSpin();
            return;
        }

        // Ease out cubic
        const t = elapsed / this.spinDuration;
        const easeOut = 1 - Math.pow(1 - t, 3);

        // Interpolate
        // Start is this.currentRotation (captured at start?)
        // Actually, easiest is to store initialRotation
        if (!this.initialRotation) this.initialRotation = this.currentRotation;

        const totalDelta = this.targetRotation - this.initialRotation;
        this.currentRotation = this.initialRotation + (totalDelta * easeOut);

        this.draw();
        this.animationId = requestAnimationFrame((t) => this.animateAutoStop(t));
    }

    animateManual() {
        if (!this.isSpinning) return;

        // Constant speed for manual mode until stop is requested
        this.currentRotation += this.spinVelocity;
        this.currentRotation %= (2 * Math.PI); // Keep it normalized? No need actually.

        this.draw();
        this.animationId = requestAnimationFrame(() => this.animateManual());
    }

    stopManual() {
        if (!this.isSpinning || this.autoStop) return;

        // Switch to deceleration phase
        this.isDecelerating = true;
        this.decelerate();
    }

    decelerate() {
        if (!this.isSpinning) return;

        this.spinVelocity *= 0.98; // Decay
        this.currentRotation += this.spinVelocity;

        if (this.spinVelocity < 0.001) {
            this.finishSpin();
            return;
        }

        this.draw();
        this.animationId = requestAnimationFrame(() => this.decelerate());
    }

    finishSpin() {
        this.isSpinning = false;
        this.isDecelerating = false;
        this.initialRotation = null;
        cancelAnimationFrame(this.animationId);

        // Calculate winner
        // The pointer is at 12 o'clock (3*PI/2 or -PI/2 in canvas terms depending on orientation)
        // Canvas 0 is 3 o'clock. Rotation is clockwise.
        // Pointer is at Top (270 deg / 1.5 PI).

        // Normalize rotation to 0 - 2PI
        const normalizedRotation = this.currentRotation % (2 * Math.PI);

        // The wheel rotates clockwise.
        // If wheel rotates by alpha, the segment at 0 moves to alpha.
        // We want to know which segment is at the pointer (-PI/2 or 3PI/2).
        // Angle at pointer = (PointerAngle - WheelRotation) normalized.

        let pointerAngle = 1.5 * Math.PI; // 270 degrees (Top)
        // Actually, in standard canvas arc: 0 is Right, PI/2 is Bottom, PI is Left, 1.5PI is Top.

        // So we want to find segment that covers the angle relative to the wheel start.
        // relativeAngle = (pointerAngle - currentRotation)

        let relativeAngle = (pointerAngle - normalizedRotation) % (2 * Math.PI);
        if (relativeAngle < 0) relativeAngle += 2 * Math.PI;

        const winner = this.segments.find(seg =>
            relativeAngle >= seg.startAngle && relativeAngle < seg.endAngle
        );

        if (this.onComplete && winner) {
            this.onComplete(winner);
        }
    }
}
