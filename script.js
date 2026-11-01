/**
 * Numerical Area & Volume Calculator
 * Computational Methods Project
 *
 * Architecture & Module Organization:
 * 1. MathEngine       - Mathematical functions, analytical antiderivatives, composite numerical integration,
 *                       breakdown analysis, and Lagrange interpolation.
 * 2. ValidationEngine - Input string sanitization, finite numeric validation, domain rule checking,
 *                       and method interval compatibility checks.
 * 3. GraphRenderer    - Canvas 2D engine, responsive DPR scaling, theme palette, unified numerical
 *                       approximation strip rendering (Trapezoid, Simpson 1/3, Simpson 3/8), solid of revolution,
 *                       axes, grid, and legend.
 * 4. UIController     - DOM caching, state transitions, theme toggle, comparison table generator (DRY),
 *                       step-by-step calculator breakdown, and user interaction event wiring.
 */

// ============================================================================
// 1. MATHEMATICAL ENGINE (Core Numerical Algorithms & Shapes Registry)
// ============================================================================

const MathEngine = (() => {
  // Safe math functions guarding against floating-point roundoff at boundary edges
  const safeSqrt = x => Math.sqrt(Math.max(0, x));
  const safeAsin = x => Math.asin(Math.max(-1, Math.min(1, x)));

  // 15 Predefined shapes with profile function f, analytical antiderivative F,
  // volume antiderivative G (antiderivative of f^2), and encapsulated domain constraints
  const SHAPES = {
    circle: {
      name: "Circle (half)",
      f: x => safeSqrt(1 - x * x),
      F: x => (x * safeSqrt(1 - x * x) + safeAsin(x)) / 2,
      G: x => x - x ** 3 / 3,
      a: -1, b: 1,
      range: "Valid: −1 ≤ x ≤ 1",
      isValidDomain: (a, b) => a >= -1 && b <= 1,
      domainError: "Circle limits must be within [-1, 1]."
    },
    quarter: {
      name: "Circle (quarter)",
      f: x => safeSqrt(1 - x * x),
      F: x => (x * safeSqrt(1 - x * x) + safeAsin(x)) / 2,
      G: x => x - x ** 3 / 3,
      a: 0, b: 1,
      range: "Valid: −1 ≤ x ≤ 1",
      isValidDomain: (a, b) => a >= -1 && b <= 1,
      domainError: "Circle limits must be within [-1, 1]."
    },
    semi: {
      name: "Semicircle (radius 2)",
      f: x => safeSqrt(4 - x * x),
      F: x => (x * safeSqrt(4 - x * x)) / 2 + 2 * safeAsin(x / 2),
      G: x => 4 * x - x ** 3 / 3,
      a: -2, b: 2,
      range: "Valid: −2 ≤ x ≤ 2",
      isValidDomain: (a, b) => a >= -2 && b <= 2,
      domainError: "Semicircle / ellipse limits must be within [-2, 2]."
    },
    ellipse: {
      name: "Ellipse (half)",
      f: x => safeSqrt(1 - (x * x) / 4),
      F: x => (x / 2) * safeSqrt(1 - (x * x) / 4) + safeAsin(x / 2),
      G: x => x - x ** 3 / 12,
      a: -2, b: 2,
      range: "Valid: −2 ≤ x ≤ 2",
      isValidDomain: (a, b) => a >= -2 && b <= 2,
      domainError: "Semicircle / ellipse limits must be within [-2, 2]."
    },
    line: {
      name: "Line (y = x + 1)",
      f: x => x + 1,
      F: x => (x * x) / 2 + x,
      G: x => x ** 3 / 3 + x * x + x,
      a: 0, b: 2,
      range: "Valid: any real x",
      isValidDomain: () => true
    },
    cone: {
      name: "Cone (y = x)",
      f: x => x,
      F: x => (x * x) / 2,
      G: x => x ** 3 / 3,
      a: 0, b: 2,
      range: "Valid: any real x",
      isValidDomain: () => true
    },
    parabola: {
      name: "Parabola (y = x²)",
      f: x => x * x,
      F: x => x ** 3 / 3,
      G: x => x ** 5 / 5,
      a: 0, b: 2,
      range: "Valid: any real x",
      isValidDomain: () => true
    },
    cubic: {
      name: "Cubic (y = x³)",
      f: x => x ** 3,
      F: x => x ** 4 / 4,
      G: x => x ** 7 / 7,
      a: 0, b: 1,
      range: "Valid: any real x",
      isValidDomain: () => true
    },
    quartic: {
      name: "Quartic (y = x⁴)",
      f: x => x ** 4,
      F: x => x ** 5 / 5,
      G: x => x ** 9 / 9,
      a: 0, b: 1,
      range: "Valid: any real x",
      isValidDomain: () => true
    },
    hyperbola: {
      name: "Hyperbola (y = 1/x)",
      f: x => (x !== 0 ? 1 / x : NaN),
      F: x => Math.log(Math.abs(x)),
      G: x => -1 / x,
      a: 1, b: 4,
      range: "Valid: x > 0 only (cannot include 0)",
      isValidDomain: a => a > 0,
      domainError: "This function requires strictly positive limits."
    },
    sine: {
      name: "Sine (0 to π)",
      f: Math.sin,
      F: x => -Math.cos(x),
      G: x => x / 2 - Math.sin(2 * x) / 4,
      a: 0, b: Math.PI,
      range: "Valid: any real x",
      isValidDomain: () => true
    },
    cosine: {
      name: "Cosine (0 to π/2)",
      f: Math.cos,
      F: x => Math.sin(x),
      G: x => x / 2 + Math.sin(2 * x) / 4,
      a: 0, b: Math.PI / 2,
      range: "Valid: any real x",
      isValidDomain: () => true
    },
    exp: {
      name: "Exponential (y = e^x)",
      f: Math.exp,
      F: x => Math.exp(x),
      G: x => Math.exp(2 * x) / 2,
      a: 0, b: 1,
      range: "Valid: any real x",
      isValidDomain: () => true
    },
    log: {
      name: "Logarithm (y = ln x)",
      f: x => (x > 0 ? Math.log(x) : NaN),
      F: x => x * Math.log(x) - x,
      G: x => x * Math.log(x) ** 2 - 2 * x * Math.log(x) + 2 * x,
      a: 1, b: Math.E,
      range: "Valid: x > 0 only",
      isValidDomain: a => a > 0,
      domainError: "This function requires strictly positive limits."
    },
    sqrt: {
      name: "Square root (y = sqrt(x))",
      f: x => (x >= 0 ? Math.sqrt(x) : NaN),
      F: x => (2 / 3) * x ** 1.5,
      G: x => (x * x) / 2,
      a: 0, b: 4,
      range: "Valid: x ≥ 0 only",
      isValidDomain: a => a >= 0,
      domainError: "Square root requires nonnegative limits."
    }
  };

  const METHODS = {
    trap: { name: "Trapezoidal", k: 1 },
    s13:  { name: "Simpson 1/3", k: 2 },
    s38:  { name: "Simpson 3/8", k: 3 }
  };

  /**
   * Evaluates the degree-(N-1) Lagrange interpolating polynomial through (xs, ys) at x.
   */
  function lagrange(xs, ys, x) {
    let sum = 0;
    const n = xs.length;
    for (let i = 0; i < n; i++) {
      let term = ys[i];
      for (let j = 0; j < n; j++) {
        if (j !== i) {
          term *= (x - xs[j]) / (xs[i] - xs[j]);
        }
      }
      sum += term;
    }
    return sum;
  }

  /**
   * Computes the bounding vertical range for piecewise polynomial interpolation,
   * taking potential polynomial overshoot into account.
   */
  function interpolationBounds(xs, ys, method) {
    let low = Math.min(0, ...ys);
    let high = Math.max(0, ...ys);
    const groupSize = METHODS[method].k;

    for (let start = 0; start < ys.length - 1; start += groupSize) {
      const groupX = xs.slice(start, start + groupSize + 1);
      const groupY = ys.slice(start, start + groupSize + 1);
      const span = groupX[groupSize] - groupX[0];
      for (let step = 0; step <= 60; step++) {
        const x = groupX[0] + span * (step / 60);
        const y = lagrange(groupX, groupY, x);
        if (Number.isFinite(y)) {
          low = Math.min(low, y);
          high = Math.max(high, y);
        }
      }
    }
    return { low, high };
  }

  /**
   * Single source of truth for composite integration and detailed step breakdown.
   * Eliminates duplicate summation loops across calculation and step formatting.
   */
  function calculateBreakdown(ys, h, method) {
    const n = ys.length - 1;
    ValidationEngine.checkRule(method, n);

    if (!Number.isFinite(h) || h <= 0 || ys.some(y => !Number.isFinite(y))) {
      throw new Error("Values must be finite and spacing must be positive.");
    }

    const y0 = ys[0];
    const yn = ys[n];
    const endSum = y0 + yn;

    let primarySum = 0;
    let secondarySum = 0;
    let integral = 0;
    let formulaStr = "";
    let subCalcStr = "";

    if (method === "trap") {
      formulaStr = "I ≈ (h / 2) × [ (y₀ + yₙ) + 2(y₁ + y₂ + ... + yₙ₋₁) ]";
      for (let i = 1; i < n; i++) primarySum += ys[i];
      integral = (h / 2) * (endSum + 2 * primarySum);
      subCalcStr = `(${fmt(h)} / 2) × [ (${fmt(endSum)}) + 2 × (${fmt(primarySum)}) ] = ${fmt(integral)}`;
    } else if (method === "s13") {
      formulaStr = "I ≈ (h / 3) × [ (y₀ + yₙ) + 4 ∑ y_odd + 2 ∑ y_even ]";
      for (let i = 1; i < n; i++) {
        if (i % 2 === 1) primarySum += ys[i];
        else secondarySum += ys[i];
      }
      integral = (h / 3) * (endSum + 4 * primarySum + 2 * secondarySum);
      subCalcStr = `(${fmt(h)} / 3) × [ (${fmt(endSum)}) + 4 × (${fmt(primarySum)}) + 2 × (${fmt(secondarySum)}) ] = ${fmt(integral)}`;
    } else {
      formulaStr = "I ≈ (3h / 8) × [ (y₀ + yₙ) + 3 ∑ y_(not div 3) + 2 ∑ y_(div 3) ]";
      for (let i = 1; i < n; i++) {
        if (i % 3 !== 0) primarySum += ys[i];
        else secondarySum += ys[i];
      }
      integral = (3 * h / 8) * (endSum + 3 * primarySum + 2 * secondarySum);
      subCalcStr = `(3 × ${fmt(h)} / 8) × [ (${fmt(endSum)}) + 3 × (${fmt(primarySum)}) + 2 × (${fmt(secondarySum)}) ] = ${fmt(integral)}`;
    }

    if (!Number.isFinite(integral)) {
      throw new Error("Result exceeds the numerical range.");
    }

    return {
      n,
      h,
      method,
      endSum,
      primarySum,
      secondarySum,
      integral,
      formulaStr,
      subCalcStr
    };
  }

  /**
   * Public integration function with exact signature expected by test suite.
   */
  function integrateValues(ys, h, method) {
    return calculateBreakdown(ys, h, method).integral;
  }

  return {
    safeSqrt,
    safeAsin,
    SHAPES,
    METHODS,
    lagrange,
    interpolationBounds,
    calculateBreakdown,
    integrateValues
  };
})();

// ============================================================================
// 2. VALIDATION ENGINE (Input Parsing, Domain & Parity Rules)
// ============================================================================

const ValidationEngine = (() => {
  /**
   * Rejects incomplete or invalid number formats; accepts decimals and scientific notation.
   */
  function readNumber(text) {
    const value = String(text).trim();
    if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(value)) return NaN;
    const number = Number(value);
    return Number.isFinite(number) ? number : NaN;
  }

  /**
   * Parses user-entered measured values separated by commas or whitespace.
   */
  function parseMeasurements(text) {
    if (!text.trim()) {
      throw new Error("Enter at least two measured values.");
    }
    const values = text.trim().split(/[\s,]+/).map(readNumber);
    if (values.some(v => !Number.isFinite(v))) {
      throw new Error("Every measured value must be a complete, finite number.");
    }
    if (values.length < 2 || values.length > 1001) {
      throw new Error("Enter 2 to 1001 measured values (1 to 1000 intervals).");
    }
    return values;
  }

  /**
   * Validates interval count and parity/divisibility conditions for integration methods.
   */
  function checkRule(method, n) {
    if (!Object.prototype.hasOwnProperty.call(MathEngine.METHODS, method)) {
      throw new Error("Select a valid integration method.");
    }
    if (!Number.isInteger(n) || n < 1 || n > 1000) {
      throw new Error("Use an integer number of intervals from 1 to 1000.");
    }
    if (method === "s13" && n % 2 !== 0) {
      throw new Error(`Simpson's 1/3 rule requires an even number of intervals (n = ${n} is odd).`);
    }
    if (method === "s38" && n % 3 !== 0) {
      throw new Error(`Simpson's 3/8 rule requires intervals to be a multiple of 3 (n = ${n} is not divisible by 3).`);
    }
  }

  /**
   * Checks function domain restrictions.
   */
  function checkDomain(shapeKey, a, b) {
    const shape = MathEngine.SHAPES[shapeKey];
    if (shape && shape.isValidDomain && !shape.isValidDomain(a, b)) {
      throw new Error(shape.domainError || "Limits are outside the function's valid domain.");
    }
  }

  return {
    readNumber,
    parseMeasurements,
    checkRule,
    checkDomain
  };
})();

// Format numbers consistently to 4 decimal places
function fmt(v) {
  if (!Number.isFinite(v)) return "—";
  if (Math.abs(v) < 1e-9) return "0.0000";
  return v.toFixed(4);
}

// ============================================================================
// 3. GRAPH RENDERER (Unified Canvas 2D Charting Engine)
// ============================================================================

const GraphRenderer = (() => {
  function getPalette() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    return {
      isDark,
      bg: isDark ? "#151d2f" : "#f1f5f9",
      txt: isDark ? "#f8fafc" : "#0f172a",
      mut: isDark ? "#94a3b8" : "#64748b",
      brd: isDark ? "#334155" : "#cbd5e1",
      axis: isDark ? "#64748b" : "#475569",
      grid: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
      funcCurve: isDark ? "#60a5fa" : "#1d4ed8",
      trapStroke: isDark ? "#34d399" : "#059669",
      trapFill1: isDark ? "rgba(52, 211, 153, 0.22)" : "rgba(16, 185, 129, 0.20)",
      trapFill2: isDark ? "rgba(52, 211, 153, 0.32)" : "rgba(16, 185, 129, 0.30)",
      s13Stroke: isDark ? "#fbbf24" : "#d97706",
      s13Fill: isDark ? "rgba(251, 191, 36, 0.25)" : "rgba(217, 119, 6, 0.22)",
      s38Stroke: isDark ? "#a78bfa" : "#7c3aed",
      s38Fill: isDark ? "rgba(167, 139, 250, 0.25)" : "rgba(124, 58, 237, 0.22)",
      pointFill: isDark ? "#38bdf8" : "#0284c7",
      pointBorder: isDark ? "#0f172a" : "#ffffff",
      partitionLine: isDark ? "rgba(255, 255, 255, 0.40)" : "rgba(15, 23, 42, 0.35)",
      partitionDashed: isDark ? "rgba(255, 255, 255, 0.22)" : "rgba(15, 23, 42, 0.22)"
    };
  }

  function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 640;
    const h = 360;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx.resetTransform) ctx.resetTransform();
    ctx.scale(dpr, dpr);
    return { ctx, W: w, H: h };
  }

  function drawInvalidMessage(canvas, msg) {
    const { ctx, W, H } = setupCanvas(canvas);
    const c = getPalette();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    const bw = Math.min(W - 40, 520);
    const bh = 130;
    const bx = (W - bw) / 2;
    const by = (H - bh) / 2;

    ctx.fillStyle = c.isDark ? "#1e293b" : "#ffffff";
    ctx.strokeStyle = c.isDark ? "#475569" : "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 10);
    else ctx.rect(bx, by, bw, bh);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 15px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Calculator", W / 2, by + 40);

    ctx.fillStyle = c.mut;
    ctx.font = "13px system-ui, sans-serif";
    const words = String(msg || "").split(" ");
    let line = "";
    let lineY = by + 65;
    for (const word of words) {
      if (ctx.measureText(line + word).width > bw - 20 && line) {
        ctx.fillText(line.trim(), W / 2, lineY);
        line = "";
        lineY += 16;
      }
      line += word + " ";
    }
    ctx.fillText(line.trim(), W / 2, lineY);

    ctx.fillStyle = c.txt;
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText("Adjust inputs, then click Calculate.", W / 2, by + 115);
    ctx.textAlign = "start";
  }

  function drawLegend(ctx, W, c, isGivenValues, approxLabel, approxColor) {
    const items = [];
    if (!isGivenValues) {
      items.push({ type: "line", label: "Original Function f(x)", color: c.funcCurve });
    }
    items.push({ type: "box", label: approxLabel, color: approxColor });
    items.push({ type: "point", label: "Sample Points (xᵢ, yᵢ)", color: c.pointFill });

    const pad = 10;
    const itemH = 18;
    const legW = Math.min(W - 20, 310);
    const legH = items.length * itemH + pad * 2;
    const legX = Math.max(10, W - legW - 14);
    const legY = 14;

    ctx.save();
    ctx.fillStyle = c.isDark ? "rgba(30, 41, 59, 0.90)" : "rgba(255, 255, 255, 0.92)";
    ctx.strokeStyle = c.brd;
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(legX, legY, legW, legH, 6);
    else ctx.rect(legX, legY, legW, legH);
    ctx.fill();
    ctx.stroke();

    ctx.font = "11px system-ui, sans-serif";
    ctx.textBaseline = "middle";

    items.forEach((item, idx) => {
      const iy = legY + pad + idx * itemH + itemH / 2;
      const ix = legX + 12;

      if (item.type === "line") {
        ctx.strokeStyle = item.color;
        ctx.setLineDash([6, 4]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ix, iy);
        ctx.lineTo(ix + 20, iy);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (item.type === "box") {
        ctx.fillStyle = item.color;
        ctx.fillRect(ix, iy - 5, 20, 10);
        ctx.strokeStyle = item.color;
        ctx.strokeRect(ix, iy - 5, 20, 10);
      } else if (item.type === "point") {
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(ix + 10, iy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = c.pointBorder;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      ctx.fillStyle = c.txt;
      ctx.fillText(item.label, ix + 28, iy);
    });
    ctx.restore();
  }

  /**
   * Unified rendering for approximating strips (Trapezoidal chords, Simpson 1/3 parabolas, Simpson 3/8 cubics).
   * DRY: Shared across both function graph and discrete measured data graph.
   */
  function renderApproximationStrips(ctx, xs, ys, method, X, Y, y0, c) {
    const n = ys.length - 1;

    if (method === "trap") {
      for (let i = 0; i < n; i++) {
        const x1 = xs[i], x2 = xs[i + 1];
        const y1 = ys[i], y2 = ys[i + 1];

        ctx.beginPath();
        ctx.moveTo(X(x1), y0);
        ctx.lineTo(X(x1), Y(y1));
        ctx.lineTo(X(x2), Y(y2));
        ctx.lineTo(X(x2), y0);
        ctx.closePath();
        ctx.fillStyle = (i % 2 === 0) ? c.trapFill1 : c.trapFill2;
        ctx.fill();

        ctx.strokeStyle = c.trapStroke;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(X(x1), Y(y1));
        ctx.lineTo(X(x2), Y(y2));
        ctx.stroke();

        ctx.strokeStyle = c.partitionLine;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(X(x1), y0);
        ctx.lineTo(X(x1), Y(y1));
        ctx.stroke();
      }
      ctx.strokeStyle = c.partitionLine;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(X(xs[n]), y0);
      ctx.lineTo(X(xs[n]), Y(ys[n]));
      ctx.stroke();

    } else if (method === "s13") {
      for (let s = 0; s < n; s += 2) {
        const subX = [xs[s], xs[s + 1], xs[s + 2]];
        const subY = [ys[s], ys[s + 1], ys[s + 2]];
        const steps = 30;

        ctx.beginPath();
        ctx.moveTo(X(subX[0]), y0);
        for (let t = 0; t <= steps; t++) {
          const x = subX[0] + (subX[2] - subX[0]) * (t / steps);
          ctx.lineTo(X(x), Y(MathEngine.lagrange(subX, subY, x)));
        }
        ctx.lineTo(X(subX[2]), y0);
        ctx.closePath();
        ctx.fillStyle = c.s13Fill;
        ctx.fill();

        ctx.strokeStyle = c.s13Stroke;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let t = 0; t <= steps; t++) {
          const x = subX[0] + (subX[2] - subX[0]) * (t / steps);
          const px = X(x), py = Y(MathEngine.lagrange(subX, subY, x));
          t === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.strokeStyle = c.partitionLine;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(X(subX[0]), y0);
        ctx.lineTo(X(subX[0]), Y(subY[0]));
        ctx.moveTo(X(subX[2]), y0);
        ctx.lineTo(X(subX[2]), Y(subY[2]));
        ctx.stroke();

        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = c.partitionDashed;
        ctx.beginPath();
        ctx.moveTo(X(subX[1]), y0);
        ctx.lineTo(X(subX[1]), Y(subY[1]));
        ctx.stroke();
        ctx.setLineDash([]);
      }

    } else if (method === "s38") {
      for (let s = 0; s < n; s += 3) {
        const subX = [xs[s], xs[s + 1], xs[s + 2], xs[s + 3]];
        const subY = [ys[s], ys[s + 1], ys[s + 2], ys[s + 3]];
        const steps = 40;

        ctx.beginPath();
        ctx.moveTo(X(subX[0]), y0);
        for (let t = 0; t <= steps; t++) {
          const x = subX[0] + (subX[3] - subX[0]) * (t / steps);
          ctx.lineTo(X(x), Y(MathEngine.lagrange(subX, subY, x)));
        }
        ctx.lineTo(X(subX[3]), y0);
        ctx.closePath();
        ctx.fillStyle = c.s38Fill;
        ctx.fill();

        ctx.strokeStyle = c.s38Stroke;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let t = 0; t <= steps; t++) {
          const x = subX[0] + (subX[3] - subX[0]) * (t / steps);
          const px = X(x), py = Y(MathEngine.lagrange(subX, subY, x));
          t === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.strokeStyle = c.partitionLine;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(X(subX[0]), y0);
        ctx.lineTo(X(subX[0]), Y(subY[0]));
        ctx.moveTo(X(subX[3]), y0);
        ctx.lineTo(X(subX[3]), Y(subY[3]));
        ctx.stroke();

        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = c.partitionDashed;
        ctx.beginPath();
        ctx.moveTo(X(subX[1]), y0);
        ctx.lineTo(X(subX[1]), Y(subY[1]));
        ctx.moveTo(X(subX[2]), y0);
        ctx.lineTo(X(subX[2]), Y(subY[2]));
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  function renderGridAndAxes(ctx, W, H, L, R, T, B, lo, hi, X, Y, y0, c, yLabel) {
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const gy = Y(lo + (hi - lo) * (i / 5));
      ctx.beginPath();
      ctx.moveTo(L, gy);
      ctx.lineTo(W - R, gy);
      ctx.stroke();
    }

    ctx.strokeStyle = c.axis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(L, y0);
    ctx.lineTo(W - R, y0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(L, T);
    ctx.lineTo(L, H - B);
    ctx.stroke();

    ctx.fillStyle = c.mut;
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText("x", W - R - 6, y0 - 8);
    ctx.fillText(yLabel, L + 8, T + 12);
    ctx.fillText("0", L - 16, y0 + 4);
  }

  function renderSamplePoints(ctx, xs, ys, X, Y, c) {
    const n = ys.length - 1;
    for (let i = 0; i <= n; i++) {
      ctx.beginPath();
      ctx.arc(X(xs[i]), Y(ys[i]), 4, 0, Math.PI * 2);
      ctx.fillStyle = c.pointFill;
      ctx.fill();
      ctx.strokeStyle = c.pointBorder;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  function drawArea(canvas, F, a, b, n, method) {
    const { ctx, W, H } = setupCanvas(canvas);
    const c = getPalette();
    const L = 60, R = 28, T = 28, B = 45;
    const X = x => L + ((x - a) / (b - a)) * (W - L - R);

    const h = (b - a) / n;
    let lo = 0, hi = 0;
    for (let i = 0; i <= 300; i++) {
      const y = F(a + (b - a) * (i / 300));
      if (Number.isFinite(y)) { lo = Math.min(lo, y); hi = Math.max(hi, y); }
    }
    for (let i = 0; i <= n; i++) {
      const y = F(a + i * h);
      if (Number.isFinite(y)) { lo = Math.min(lo, y); hi = Math.max(hi, y); }
    }

    const boundX = Array.from({ length: n + 1 }, (_, i) => a + i * h);
    const bounds = MathEngine.interpolationBounds(boundX, boundX.map(F), method);
    lo = Math.min(lo, bounds.low);
    hi = Math.max(hi, bounds.high);
    if (hi - lo < 1e-9) hi = lo + 1;
    const pad = (hi - lo) * 0.14;
    lo -= pad;
    hi += pad;
    const Y = y => H - B - ((y - lo) / (hi - lo)) * (H - T - B);

    ctx.clearRect(0, 0, W, H);
    const y0 = Y(0);

    renderGridAndAxes(ctx, W, H, L, R, T, B, lo, hi, X, Y, y0, c, "y = f(x)");

    const xs = [];
    const ys = [];
    for (let i = 0; i <= n; i++) {
      const x = a + i * h;
      xs.push(x);
      ys.push(F(x));
    }

    // Original continuous curve
    ctx.strokeStyle = c.funcCurve;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    for (let i = 0; i <= 300; i++) {
      const x = a + (b - a) * (i / 300);
      const px = X(x), py = Y(F(x));
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    renderApproximationStrips(ctx, xs, ys, method, X, Y, y0, c);
    renderSamplePoints(ctx, xs, ys, X, Y, c);

    ctx.fillStyle = c.txt;
    ctx.font = "bold 12px system-ui, sans-serif";
    ctx.fillText("a = " + fmt(a), X(a) - 14, H - B + 22);
    ctx.fillText("b = " + fmt(b), X(b) - 22, H - B + 22);

    if (n <= 8) {
      ctx.font = "11px system-ui, sans-serif";
      ctx.fillStyle = c.mut;
      for (let i = 1; i < n; i++) {
        ctx.fillText("x" + i, X(xs[i]) - 6, H - B + 18);
      }
    }

    const approxLabel = (method === "trap" ? "Trapezoidal Chords" : (method === "s13" ? "Simpson 1/3 Parabolas" : "Simpson 3/8 Cubics"));
    const approxColor = (method === "trap" ? c.trapStroke : (method === "s13" ? c.s13Stroke : c.s38Stroke));
    drawLegend(ctx, W, c, false, `${approxLabel} (group: ${MathEngine.METHODS[method].k})`, approxColor);
  }

  function drawVolume(canvas, F, a, b, n, method) {
    const { ctx, W, H } = setupCanvas(canvas);
    const c = getPalette();
    const L = 30, R = 30;
    const X = x => L + (x - a) / (b - a) * (W - L - R);
    const cy = H / 2;

    let rmax = 0;
    for (let i = 0; i <= 300; i++) {
      const y = Math.abs(F(a + (b - a) * i / 300));
      if (Number.isFinite(y)) rmax = Math.max(rmax, y);
    }
    if (rmax < 1e-9) rmax = 1;
    const sc = (H / 2 - 36) / rmax;

    ctx.clearRect(0, 0, W, H);

    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = c.axis;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(L, cy);
    ctx.lineTo(W - R, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const x = a + (b - a) * (i / 200);
      const r = Math.abs(F(x)) * sc;
      i === 0 ? ctx.moveTo(X(x), cy - r) : ctx.lineTo(X(x), cy - r);
    }
    for (let i = 200; i >= 0; i--) {
      const x = a + (b - a) * (i / 200);
      ctx.lineTo(X(x), cy + Math.abs(F(x)) * sc);
    }
    ctx.closePath();
    ctx.fillStyle = c.isDark ? "rgba(96, 165, 250, 0.16)" : "rgba(37, 99, 235, 0.14)";
    ctx.fill();
    ctx.strokeStyle = c.funcCurve;
    ctx.lineWidth = 2;
    ctx.stroke();

    const h = (b - a) / n;
    const k = MathEngine.METHODS[method].k;
    const methodColor = method === "trap" ? c.trapStroke : method === "s13" ? c.s13Stroke : c.s38Stroke;
    const dx = (W - L - R) / n;
    const rx = Math.max(2, dx * 0.32);

    for (let i = 0; i <= n; i++) {
      const x = a + h * i;
      const r = Math.abs(F(x)) * sc;
      if (r > 1) {
        const isGroupBoundary = (i % k === 0);
        ctx.beginPath();
        ctx.ellipse(X(x), cy, rx, r, 0, 0, Math.PI * 2);

        if (isGroupBoundary) {
          ctx.fillStyle = method === "trap" ? c.trapFill1 : method === "s13" ? c.s13Fill : c.s38Fill;
          ctx.fill();
          ctx.strokeStyle = methodColor;
          ctx.lineWidth = 1.4;
        } else {
          ctx.fillStyle = c.isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";
          ctx.fill();
          ctx.strokeStyle = c.axis;
          ctx.lineWidth = 0.8;
        }
        ctx.stroke();
      }
    }

    ctx.fillStyle = c.mut;
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText("a = " + fmt(a), X(a) - 10, H - 10);
    ctx.fillText("b = " + fmt(b), X(b) - 20, H - 10);
    ctx.fillText(MathEngine.METHODS[method].name + " (groups of " + k + " intervals)", L + 6, 38);
    ctx.fillText("Solid of Revolution: V = π ∫ [f(x)]² dx (Rotated about x-axis)", L + 6, 20);
  }

  function drawValuesGraph(canvas, xs, ys, method, isVolume = false) {
    const { ctx, W, H } = setupCanvas(canvas);
    const c = getPalette();
    const L = 60, R = 28, T = 28, B = 45;
    const n = ys.length - 1;
    const a = xs[0], b = xs[n];
    const X = x => L + ((x - a) / (b - a)) * (W - L - R);

    let lo = 0, hi = 0;
    for (const y of ys) { lo = Math.min(lo, y); hi = Math.max(hi, y); }
    const bounds = MathEngine.interpolationBounds(xs, ys, method);
    lo = Math.min(lo, bounds.low);
    hi = Math.max(hi, bounds.high);
    if (hi - lo < 1e-9) hi = lo + 1;
    const pad = (hi - lo) * 0.14;
    lo -= pad;
    hi += pad;
    const Y = y => H - B - ((y - lo) / (hi - lo)) * (H - T - B);

    ctx.clearRect(0, 0, W, H);
    const y0 = Y(0);

    const yLabel = isVolume ? "r² (squared radii)" : "y (measured)";
    renderGridAndAxes(ctx, W, H, L, R, T, B, lo, hi, X, Y, y0, c, yLabel);

    renderApproximationStrips(ctx, xs, ys, method, X, Y, y0, c);
    renderSamplePoints(ctx, xs, ys, X, Y, c);

    ctx.fillStyle = c.txt;
    ctx.font = "bold 12px system-ui, sans-serif";
    ctx.fillText("x₀ = " + fmt(a), X(a) - 10, H - B + 22);
    ctx.fillText("xₙ = " + fmt(b), X(b) - 20, H - B + 22);

    const approxLabel = (method === "trap" ? "Trapezoidal Chords" : (method === "s13" ? "Simpson 1/3 Parabolas" : "Simpson 3/8 Cubics"));
    const approxColor = (method === "trap" ? c.trapStroke : (method === "s13" ? c.s13Stroke : c.s38Stroke));
    drawLegend(ctx, W, c, true, approxLabel, approxColor);
  }

  return {
    drawInvalidMessage,
    drawArea,
    drawVolume,
    drawValuesGraph
  };
})();

// ============================================================================
// 4. UI CONTROLLER (DOM Caching, State Transitions, Table & Steps Formatting)
// ============================================================================

// Top-level state variables exposed for test suite compatibility
let inputMode = "func";    // "func" | "values"
let calcTarget = "area";    // "area" | "volume"
let lastGraph = null;

// DOM Cache Helper
const $ = id => document.getElementById(id);

const dom = {
  get shape() { return $("shape"); },
  get a() { return $("a"); },
  get b() { return $("b"); },
  get n() { return $("n"); },
  get range() { return $("range"); },
  get method() { return $("method"); },
  get yValues() { return $("yValues"); },
  get hVal() { return $("hVal"); },
  get refVal() { return $("refVal"); },
  get valStats() { return $("valStats"); },
  get inModeFunc() { return $("inModeFunc"); },
  get inModeValues() { return $("inModeValues"); },
  get modeArea() { return $("modeArea"); },
  get modeVol() { return $("modeVol"); },
  get fieldsFunc() { return $("fieldsFunc"); },
  get fieldsValues() { return $("fieldsValues"); },
  get calc() { return $("calc"); },
  get err() { return $("err"); },
  get result() { return $("result"); },
  get meta() { return $("meta"); },
  get rows() { return $("rows"); },
  get stepsBody() { return $("stepsBody"); },
  get note() { return $("note"); },
  get thExact() { return $("thExact"); },
  get thDiff() { return $("thDiff"); },
  get optTrap() { return $("optTrap"); },
  get optS13() { return $("optS13"); },
  get optS38() { return $("optS38"); },
  get cv() { return $("cv"); },
  get themeBtn() { return $("themeBtn"); },
  get themeIcon() { return $("themeIcon"); },
  get themeText() { return $("themeText"); }
};

// Theme Management
function applyTheme(isDark) {
  if (isDark) {
    document.documentElement.setAttribute("data-theme", "dark");
    if (dom.themeIcon) dom.themeIcon.textContent = "☀️";
    if (dom.themeText) dom.themeText.textContent = "Light";
  } else {
    document.documentElement.removeAttribute("data-theme");
    if (dom.themeIcon) dom.themeIcon.textContent = "🌙";
    if (dom.themeText) dom.themeText.textContent = "Dark";
  }
}

const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
let currentTheme = prefersDark ? "dark" : "light";
try {
  currentTheme = localStorage.getItem("cm_calc_theme") || currentTheme;
} catch (e) {}
applyTheme(currentTheme === "dark");

if (dom.themeBtn) {
  dom.themeBtn.addEventListener("click", () => {
    currentTheme = (currentTheme === "dark" ? "light" : "dark");
    try { localStorage.setItem("cm_calc_theme", currentTheme); } catch (e) {}
    applyTheme(currentTheme === "dark");
    redrawGraph();
  });
}

function redrawGraph() {
  if (lastGraph) {
    lastGraph();
  } else if (dom.cv) {
    GraphRenderer.drawInvalidMessage(dom.cv, dom.meta ? dom.meta.textContent : "");
  }
}

function clearResults(message) {
  lastGraph = null;
  if (dom.result) dom.result.textContent = "—";
  if (dom.meta) dom.meta.textContent = message;
  if (dom.rows) dom.rows.innerHTML = "";
  if (dom.stepsBody) dom.stepsBody.innerHTML = "";
  if (dom.note) dom.note.textContent = "";
  if (dom.thExact) dom.thExact.textContent = "Exact / Reference Value";
  if (dom.thDiff) dom.thDiff.textContent = "Error / Difference";
  if (dom.cv) GraphRenderer.drawInvalidMessage(dom.cv, message);
}

function getEffectiveN() {
  if (inputMode === "func") {
    const n = ValidationEngine.readNumber(dom.n ? dom.n.value : "");
    return Number.isInteger(n) && n >= 1 && n <= 1000 ? n : 0;
  } else {
    try {
      return ValidationEngine.parseMeasurements(dom.yValues ? dom.yValues.value : "").length - 1;
    } catch (e) {
      return 0;
    }
  }
}

function updateMethodCompatibility() {
  const n = getEffectiveN();
  const optTrap = dom.optTrap;
  const optS13 = dom.optS13;
  const optS38 = dom.optS38;
  if (!optTrap || !optS13 || !optS38) return;

  optTrap.textContent = "Trapezoidal rule (Any n ≥ 1)";
  if (n > 0) {
    optS13.textContent = (n % 2 === 0)
      ? `Simpson's 1/3 rule (n = ${n} is even ✓)`
      : `Simpson's 1/3 rule (n = ${n} is odd — INVALID ✗)`;
    optS38.textContent = (n % 3 === 0)
      ? `Simpson's 3/8 rule (n = ${n} is divisible by 3 ✓)`
      : `Simpson's 3/8 rule (n = ${n} not div by 3 — INVALID ✗)`;
  } else {
    optS13.textContent = "Simpson's 1/3 rule (requires n even)";
    optS38.textContent = "Simpson's 3/8 rule (requires n multiple of 3)";
  }
}

function onInputChange() {
  if (dom.err) dom.err.textContent = "";
  clearResults("Inputs changed. Click Calculate to update results.");
  updateMethodCompatibility();
}

function applyDefaults() {
  const shapeKey = dom.shape ? dom.shape.value : "cone";
  const S = MathEngine.SHAPES[shapeKey];
  if (!S) return;
  if (dom.a) dom.a.value = S.a;
  if (dom.b) dom.b.value = S.b;
  if (dom.range) dom.range.textContent = S.range;
  updateMethodCompatibility();
}

/**
 * Reusable table row builder for comparison between all three integration methods.
 * Eliminates ~70 lines of duplicated imperative DOM construction.
 */
function renderComparisonTable(tbody, ys, h, n, scale, selectedMethod, referenceVal, isExact) {
  tbody.innerHTML = "";
  for (const key of Object.keys(MathEngine.METHODS)) {
    const tr = document.createElement("tr");
    if (key === selectedMethod) tr.className = "sel";

    const tdName = document.createElement("td");
    tdName.innerHTML = MathEngine.METHODS[key].name + (key === selectedMethod ? " <span class='sel-tag'>Selected</span>" : "");

    const tdVal = document.createElement("td");
    tdVal.className = "num";

    const tdRef = document.createElement("td");
    tdRef.className = "num";

    const tdDiff = document.createElement("td");
    tdDiff.className = "num";

    try {
      ValidationEngine.checkRule(key, n);
      const v = MathEngine.integrateValues(ys, h, key) * scale;
      tdVal.textContent = fmt(v);

      if (isExact) {
        tdRef.textContent = fmt(referenceVal);
        tdDiff.textContent = fmt(Math.abs(v - referenceVal));
      } else if (referenceVal !== null && Number.isFinite(referenceVal)) {
        tdRef.textContent = fmt(referenceVal) + " (Reference)";
        tdDiff.textContent = fmt(Math.abs(v - referenceVal));
      } else {
        tdRef.innerHTML = "<span class='unavailable'>Not available — measured data</span>";
        tdDiff.innerHTML = "<span class='unavailable'>Not available — measured data</span>";
      }
    } catch (e) {
      tdVal.innerHTML = `<span class="incompatible-tag">Incompatible (n = ${n})</span>`;
      tdRef.textContent = "—";
      tdDiff.textContent = "—";
    }

    tr.append(tdName, tdVal, tdRef, tdDiff);
    tbody.appendChild(tr);
  }
}

/**
 * Renders structured step-by-step mathematical substitution breakdown into the steps body.
 */
function updateSteps(ys, h, n, method, approx, unit, isArea, exact, refVal) {
  if (!dom.stepsBody) return;
  const breakdown = MathEngine.calculateBreakdown(ys, h, method);
  const isVolume = !isArea;

  let errorHtml = "";
  if (exact !== null && Number.isFinite(exact)) {
    errorHtml = `<div>Exact analytical value = <strong>${fmt(exact)}</strong> (Absolute Error |Δ| = <strong>${fmt(Math.abs(approx - exact))}</strong>)</div>`;
  } else if (refVal !== null && Number.isFinite(refVal)) {
    errorHtml = `<div>User reference value = <strong>${fmt(refVal)}</strong> (Difference from reference |Δ| = <strong>${fmt(Math.abs(approx - refVal))}</strong>)</div>`;
  } else {
    errorHtml = `<div>Exact reference: <em>Not available for discrete measured data</em></div>`;
  }

  dom.stepsBody.innerHTML = `
    <div class="step-box">
      <div class="step-title">1. Formula Used:</div>
      <div class="step-formula">${breakdown.formulaStr}</div>
    </div>
    <div class="step-box">
      <div class="step-title">2. Given Parameters:</div>
      ${isVolume ? "<div>The ordinates used below are squared radii: yᵢ = rᵢ².</div>" : ""}
      <div>Interval count <strong>n = ${n}</strong>, Step spacing <strong>h = ${fmt(h)}</strong></div>
      <div>End points sum (y₀ + yₙ) = ${fmt(ys[0])} + ${fmt(ys[n])} = <strong>${fmt(breakdown.endSum)}</strong></div>
    </div>
    <div class="step-box">
      <div class="step-title">3. Main Substitution:</div>
      <div class="step-formula">${breakdown.subCalcStr}</div>
      ${isVolume ? `<div>Volume = π × Integral = π × ${fmt(approx / Math.PI)} = <strong>${fmt(approx)}</strong></div>` : ""}
    </div>
    <div class="step-box">
      <div class="step-title">4. Final Answer &amp; Accuracy:</div>
      <div>Approximation = <strong>${fmt(approx)} ${unit}</strong></div>
      ${errorHtml}
    </div>
  `;
}

/**
 * Main calculation runner - coordinates validation, numerical engine, and presentation.
 */
function run() {
  if (dom.err) dom.err.textContent = "";
  if (dom.result) dom.result.classList.remove("outdated");

  const method = dom.method ? dom.method.value : "trap";

  try {
    let ys = [];
    let xs = [];
    let h = 0;
    let n = 0;
    let exact = null;
    let isArea = true;
    let scale = 1;
    let refVal = null;

    if (inputMode === "func") {
      const shapeKey = dom.shape ? dom.shape.value : "cone";
      const S = MathEngine.SHAPES[shapeKey];
      const a = ValidationEngine.readNumber(dom.a ? dom.a.value : "");
      const b = ValidationEngine.readNumber(dom.b ? dom.b.value : "");
      n = ValidationEngine.readNumber(dom.n ? dom.n.value : "");

      if (!Number.isFinite(a) || !Number.isFinite(b) || a >= b) {
        throw new Error("Enter limits with lower limit a < upper limit b.");
      }
      if (!Number.isInteger(n) || n < 1 || n > 1000) {
        throw new Error("Number of intervals n must be an integer from 1 to 1000.");
      }

      ValidationEngine.checkRule(method, n);
      ValidationEngine.checkDomain(shapeKey, a, b);

      isArea = (calcTarget === "area");
      const g = isArea ? S.f : (x => S.f(x) * S.f(x));
      scale = isArea ? 1 : Math.PI;
      exact = isArea ? (S.F(b) - S.F(a)) : Math.PI * (S.G(b) - S.G(a));

      if (!Number.isFinite(exact)) {
        throw new Error("Exact value exceeds the numerical range.");
      }

      h = (b - a) / n;
      for (let i = 0; i <= n; i++) {
        const x = i === n ? b : a + i * h;
        if (!Number.isFinite(x) || (i > 0 && x <= xs[i - 1])) {
          throw new Error("Limits cannot represent distinct finite sample points.");
        }
        const y = g(x);
        if (!Number.isFinite(y)) {
          throw new Error("The function is undefined at x = " + x.toFixed(3) + ". See valid range.");
        }
        xs.push(x);
        ys.push(y);
      }

      const approx = MathEngine.integrateValues(ys, h, method) * scale;
      if (!Number.isFinite(approx)) throw new Error("Result exceeds the numerical range.");
      const unit = isArea ? "square units" : "cubic units";

      if (dom.result) dom.result.textContent = `${fmt(approx)} ${unit}`;
      const shapeName = (dom.shape && dom.shape.selectedOptions && dom.shape.selectedOptions[0])
        ? dom.shape.selectedOptions[0].text
        : S.name;

      if (dom.meta) {
        dom.meta.textContent = `${isArea ? "Area" : "Volume"} of ${shapeName} on [${a}, ${b}] with ` +
          `${MathEngine.METHODS[method].name} (n = ${n}, h = ${fmt(h)}). Exact analytical value: ${fmt(exact)}.`;
      }

      if (dom.thExact) dom.thExact.textContent = "Exact Analytical Value";
      if (dom.thDiff) dom.thDiff.textContent = "Absolute Error |Δ|";

      if (dom.rows) {
        renderComparisonTable(dom.rows, ys, h, n, scale, method, exact, true);
      }

      if (dom.note) {
        dom.note.textContent = isArea
          ? "The shaded area shows the approximating polynomial strips: straight chords for the Trapezoidal rule, parabolas for Simpson's 1/3, and cubics for Simpson's 3/8."
          : "The solid is formed by rotating the curve about the x-axis. The discs mark the slices used in the numerical integration: V = π ∫ f(x)² dx.";
      }

      lastGraph = () => {
        if (!dom.cv) return;
        if (isArea) {
          GraphRenderer.drawArea(dom.cv, S.f, a, b, n, method);
        } else {
          GraphRenderer.drawVolume(dom.cv, S.f, a, b, n, method);
        }
      };
      lastGraph();

      updateSteps(ys, h, n, method, approx, unit, isArea, exact, null);

    } else {
      // Given Values Mode
      const rawText = dom.yValues ? dom.yValues.value.trim() : "";
      if (!rawText) throw new Error("Please enter measured y-values.");
      ys = ValidationEngine.parseMeasurements(rawText);
      n = ys.length - 1;

      h = ValidationEngine.readNumber(dom.hVal ? dom.hVal.value : "");
      if (!Number.isFinite(h) || h <= 0) {
        throw new Error("Step spacing h must be a positive number.");
      }

      const rawRef = dom.refVal ? dom.refVal.value.trim() : "";
      if (rawRef !== "") {
        const pRef = ValidationEngine.readNumber(rawRef);
        if (!Number.isFinite(pRef)) throw new Error("Reference must be a finite number.");
        refVal = pRef;
      }

      if (dom.valStats) {
        dom.valStats.textContent = `Points: ${ys.length} values (n = ${n} intervals, h = ${fmt(h)})`;
      }

      ValidationEngine.checkRule(method, n);

      for (let i = 0; i <= n; i++) {
        const x = i * h;
        if (!Number.isFinite(x) || (i > 0 && x <= xs[i - 1])) {
          throw new Error("Spacing cannot represent distinct finite sample points.");
        }
        xs.push(x);
      }

      isArea = (calcTarget === "area");
      if (!isArea && ys.some(y => y < 0)) {
        throw new Error("Measured radii must be nonnegative.");
      }
      if (!isArea) {
        ys = ys.map(y => y * y);
      }
      scale = isArea ? 1 : Math.PI;

      const approx = MathEngine.integrateValues(ys, h, method) * scale;
      if (!Number.isFinite(approx)) throw new Error("Result exceeds the numerical range.");
      const unit = isArea ? "square units" : "cubic units";

      if (dom.result) dom.result.textContent = `${fmt(approx)} ${unit}`;
      let metaText = (isArea ? "Area integral of " : "Volume from measured radii at ") +
        `${ys.length} measured points with ${MathEngine.METHODS[method].name} (n = ${n}, h = ${fmt(h)}).`;
      if (refVal !== null) {
        metaText += ` Reference benchmark: ${fmt(refVal)} (Difference = ${fmt(Math.abs(approx - refVal))}).`;
      } else {
        metaText += " Exact analytical result is not available for discrete measured data.";
      }
      if (dom.meta) dom.meta.textContent = metaText;

      if (dom.thExact) dom.thExact.textContent = refVal !== null ? "Reference Value (User)" : "Exact Analytical Result";
      if (dom.thDiff) dom.thDiff.textContent = refVal !== null ? "Difference from Reference |Δ|" : "Error (unavailable)";

      if (dom.rows) {
        renderComparisonTable(dom.rows, ys, h, n, scale, method, refVal, false);
      }

      if (dom.note) {
        dom.note.textContent = refVal !== null
          ? "Note: The difference is evaluated against the optional reference value you provided, not assumed mathematical truth. Graph displays piecewise interpolation through measured nodes."
          : "Note: The exact analytical result is unknown for discrete measured data. Graph displays the measured points connected by interpolating pieces for the chosen numerical rule.";
        if (!isArea) {
          dom.note.textContent += " Volume uses measured radii: V = π ∫ r² dx. Graph shows the r² integrand.";
        }
      }

      lastGraph = () => {
        if (!dom.cv) return;
        GraphRenderer.drawValuesGraph(dom.cv, xs, ys, method, !isArea);
      };
      lastGraph();

      updateSteps(ys, h, n, method, approx, unit, isArea, null, refVal);
    }
  } catch (e) {
    if (dom.err) dom.err.textContent = e.message;
    clearResults(e.message);
  }
}

// Event Listeners Wiring
if (dom.inModeFunc) {
  dom.inModeFunc.addEventListener("click", () => {
    inputMode = "func";
    dom.inModeFunc.classList.add("on");
    if (dom.inModeValues) dom.inModeValues.classList.remove("on");
    if (dom.fieldsFunc) dom.fieldsFunc.style.display = "block";
    if (dom.fieldsValues) dom.fieldsValues.style.display = "none";
    updateMethodCompatibility();
    run();
  });
}

if (dom.inModeValues) {
  dom.inModeValues.addEventListener("click", () => {
    inputMode = "values";
    dom.inModeValues.classList.add("on");
    if (dom.inModeFunc) dom.inModeFunc.classList.remove("on");
    if (dom.fieldsFunc) dom.fieldsFunc.style.display = "none";
    if (dom.fieldsValues) dom.fieldsValues.style.display = "block";
    updateMethodCompatibility();
    run();
  });
}

if (dom.modeArea) {
  dom.modeArea.addEventListener("click", () => {
    calcTarget = "area";
    dom.modeArea.classList.add("on");
    if (dom.modeVol) dom.modeVol.classList.remove("on");
    run();
  });
}

if (dom.modeVol) {
  dom.modeVol.addEventListener("click", () => {
    calcTarget = "volume";
    dom.modeVol.classList.add("on");
    if (dom.modeArea) dom.modeArea.classList.remove("on");
    run();
  });
}

if (dom.shape) {
  dom.shape.addEventListener("change", () => {
    applyDefaults();
    onInputChange();
    run();
  });
}

if (dom.a) dom.a.addEventListener("input", onInputChange);
if (dom.b) dom.b.addEventListener("input", onInputChange);
if (dom.n) dom.n.addEventListener("input", onInputChange);
if (dom.method) {
  dom.method.addEventListener("change", () => {
    updateMethodCompatibility();
    run();
  });
}

function updateMeasuredStats() {
  try {
    const points = ValidationEngine.parseMeasurements(dom.yValues ? dom.yValues.value : "");
    if (dom.valStats) {
      dom.valStats.textContent = `Points: ${points.length} (n = ${points.length - 1}, h = ${fmt(ValidationEngine.readNumber(dom.hVal ? dom.hVal.value : ""))})`;
    }
  } catch (e) {
    if (dom.valStats) dom.valStats.textContent = e.message;
  }
  onInputChange();
}

if (dom.yValues) dom.yValues.addEventListener("input", updateMeasuredStats);
if (dom.hVal) dom.hVal.addEventListener("input", updateMeasuredStats);
if (dom.refVal) dom.refVal.addEventListener("input", onInputChange);
if (dom.calc) dom.calc.addEventListener("click", run);
window.addEventListener("resize", redrawGraph);

// Initialize Default State
applyDefaults();
run();

// ============================================================================
// TOP-LEVEL SYMBOL EXPORTS (For test runner and browser context)
// ============================================================================
const SHAPES = MathEngine.SHAPES;
const METHODS = MathEngine.METHODS;
const integrateValues = MathEngine.integrateValues;
const interpolationBounds = MathEngine.interpolationBounds;
const lagrange = MathEngine.lagrange;
const readNumber = ValidationEngine.readNumber;
const parseMeasurements = ValidationEngine.parseMeasurements;
const checkRule = ValidationEngine.checkRule;
const checkDomain = ValidationEngine.checkDomain;
