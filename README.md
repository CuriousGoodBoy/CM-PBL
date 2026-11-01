# Numerical Area & Volume Calculator

A second-year BTech Computational Methods project using composite Trapezoidal,
Simpson's 1/3, and Simpson's 3/8 rules. It includes a dependency-free browser calculator
and an interactive C++17 terminal calculator, featuring 15 predefined functions, measured data
mode, method comparisons, and detailed step-by-step substitution breakdowns.

## Run in a browser

Keep `index.html`, `style.css`, and `script.js` together, then open `index.html`
directly in a modern browser. No installation, build step, server, framework, or network connection is
required. Choose an input mode (Function / Predefined Shape or Given Values), target calculation (Area or Volume),
and an integration method. Click Calculate after editing inputs; changing the method recalculates immediately.

- **Function mode** samples the chosen curve over `[a, b]` across `n` equal intervals. Domain restrictions are
  strictly verified before evaluation.
- **Given Values mode** processes equally spaced measurements: `n = number of values - 1`.
  Enter decimal numbers separated by commas or spaces, and positive spacing `h`.
- For **Area**, ordinates represent y-values. The result is a **signed integral**:
  values below the x-axis contribute negatively.
- For **Volume**, the solid rotates about the x-axis: `V = pi * integral(r² dx)`.
  Given Values therefore expects **nonnegative radii**, which are squared before integration.
  The graph visualizes the interpolated `r²` integrand.
- Measured data alone do not define an exact analytical integral. An optional reference must
  refer to the **final area or volume**; the calculator reports absolute difference
  `|Approx − Reference|` rather than claiming a known analytical error.

## Numerical methods

For `n` equal intervals, step size `h = (b - a) / n`, and ordinates `y0 ... yn`:

| Method | Composite formula | Interval constraint |
|---|---|---|
| **Trapezoidal Rule** | `(h/2)[y0 + yn + 2*sum(interior y)]` | `n >= 1` |
| **Simpson's 1/3 Rule** | `(h/3)[y0 + yn + 4*sum(odd interior y) + 2*sum(even interior y)]` | `n >= 2`, even `n` |
| **Simpson's 3/8 Rule** | `(3h/8)[y0 + yn + 3*sum(interior y not div 3) + 2*sum(interior y div 3)]` | `n >= 3`, `n` multiple of 3 |

The canvas visualizes approximating polynomial strips: straight chords for Trapezoidal, parabolas through 3 points for Simpson's 1/3,
and cubics through 4 points for Simpson's 3/8. Group sizes are 1, 2, and 3 intervals respectively.
In function mode, the dashed blue curve displays the original continuous function; emerald, amber, and purple distinguish the methods.
In volume mode, the rotating silhouette and interval discs depict the solid of revolution.

Absolute error is `|approximation − analytical value|`. Outputs are displayed to four decimal places (`0.0000`),
while calculations use full floating-point precision.

## Architecture & Codebase Organization

The project follows clean separation of concerns and single-responsibility principles across both implementations:

```
CM-PBL/
├── cpp/
│   ├── include/
│   │   ├── methods.h             # Core numerical integration prototypes & breakdown structures
│   │   ├── shapes.h              # 15 Shape profiles, safe math helpers, & domain validators
│   │   └── calculator_cli.h      # Console I/O, parsing, and steps display declarations
│   ├── src/
│   │   ├── methods_common.cpp    # Shared validation for ordinates and step sizes
│   │   ├── trapezoidal.cpp       # Composite Trapezoidal implementation
│   │   ├── simpson13.cpp         # Composite Simpson's 1/3 implementation
│   │   ├── simpson38.cpp         # Composite Simpson's 3/8 implementation
│   │   ├── shapes.cpp            # Predefined mathematical shapes & analytical integrals
│   │   ├── calculator_cli.cpp    # CLI session handling, error formatting, & comparison tables
│   │   └── main.cpp              # Interactive application entry point
│   └── tests/
│       └── test_methods.cpp      # Automated C++ unit tests (methods, constraints, & edge cases)
├── index.html                    # Responsive semantic UI layout
├── style.css                     # Modern dark/light theme styling & responsive grid
├── script.js                     # Refactored JavaScript architecture (MathEngine, Validation, GraphRenderer, UIController)
├── tests.js                      # Automated Node.js integration & mathematical verification tests
├── .gitignore                    # Excludes compiled binaries, temporary objects, and IDE state
└── README.md                     # Technical documentation and viva guide
```

### JavaScript Architectural Modules
1. **`MathEngine`**: Encapsulates `SHAPES` registry, `METHODS`, Lagrange polynomial interpolation, vertical bounds estimation, and single-source-of-truth breakdown calculation.
2. **`ValidationEngine`**: Strict numeric token parser (`readNumber`), comma/whitespace measurement parser (`parseMeasurements`), interval rule validator (`checkRule`), and domain validator (`checkDomain`).
3. **`GraphRenderer`**: Canvas 2D engine with responsive DPR scaling, theme palette management, unified polynomial strip renderer (DRY), solid-of-revolution disc rendering, and legend generation.
4. **`UIController`**: DOM element caching, predictable state management, comparison table builder, step-by-step substitution formatter, and theme toggling.

## Compile and run C++

A C++17 compiler (such as GCC/MinGW, Clang, or MSVC) is required.

### 1. Interactive Terminal Calculator
From the project root:

```powershell
g++ -std=c++17 -Wall -Wextra -I cpp/include cpp/src/*.cpp -o calculator.exe
.\calculator.exe
```

*(On Linux / macOS, compile with `-o calculator` and run `./calculator`)*

### 2. Automated C++ Unit Test Suite
To run the automated C++ tests verifying all three integration methods, interval constraints, invalid inputs, and analytical references:

```powershell
g++ -std=c++17 -Wall -Wextra -I cpp/include cpp/src/methods_common.cpp cpp/src/trapezoidal.cpp cpp/src/simpson13.cpp cpp/src/simpson38.cpp cpp/src/shapes.cpp cpp/tests/test_methods.cpp -o test_runner.exe
.\test_runner.exe
```

Both the web application and C++ executable enforce a maximum limit of 1000 intervals.

## Verification & Testing

### JavaScript Automated Tests
Run the comprehensive suite using Node.js built-ins:

```powershell
node --check script.js
node tests.js
```

### Known Verification Benchmarks on `[0, 1]` with `n = 6`:

| Integrand | Trapezoidal | Simpson 1/3 | Simpson 3/8 | Analytical Exact |
|---|---|---|---|---|
| `x` | `0.5000` | `0.5000` | `0.5000` | `1/2 = 0.5000` |
| `x²` | `0.3380` | `0.3333` | `0.3333` | `1/3 ≈ 0.3333` |
| `x³` | `0.2569` | `0.2500` | `0.2500` | `1/4 = 0.2500` |

- **Measured Cone Volume Benchmark**: Measured radii `[0, 1, 2]` with `h = 1.0` under Simpson's 1/3 rule yields integral `8/3`, giving solid volume `8 * pi / 3 ≈ 8.3776 cubic units`.
- **Validation Tests**: Ensure malformed numbers, non-positive spacings, invalid method constraints, domain bounds (circle, ellipse, hyperbola, log, square root), and out-of-range interval counts fail predictably.

## Files and Viva Examination Guide

| Component | Responsibility / Concepts to Study |
|---|---|
| `cpp/include/methods.h` | Declarations for `integrateTrapezoidal`, `integrateSimpson13`, and `integrateSimpson38`, plus `MethodBreakdown` |
| `cpp/src/trapezoidal.cpp` | Endpoint weights 1, interior weights 2; derived from linear interpolation |
| `cpp/src/simpson13.cpp` | Endpoint weights 1, interior weights alternating 4 and 2; requires even `n` |
| `cpp/src/simpson38.cpp` | Endpoint weights 1, interior weights repeating 3, 3, and 2; requires `n` divisible by 3 |
| `cpp/src/shapes.cpp` | 15 profile functions with analytical antiderivatives `F` (area) and `G` (volume) |
| `script.js` | Modular JavaScript architecture keeping numerical math separated from canvas rendering and DOM logic |
| `tests.js` | Node.js headless DOM/canvas mock verifying numerical correctness, error branches, and UI updates |

For the viva examination, be prepared to explain:
1. Why Simpson's 1/3 rule requires pairs of intervals (`n` even) and Simpson's 3/8 requires triplets of intervals (`n` divisible by 3).
2. Why volume of revolution integrates `f(x)²` multiplied by `pi` (disc integration method).
3. How the fundamental theorem of calculus `F(b) - F(a)` provides the exact analytical benchmark.
4. Why discrete measured data alone do not imply a known analytical integral and necessitate an explicit reference benchmark to evaluate difference.
