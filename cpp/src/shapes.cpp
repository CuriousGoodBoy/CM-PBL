// shapes.cpp
// Shape definitions, antiderivatives, and domain validation.

#include "shapes.h"
#include <cmath>
#include <limits>

using namespace std;

const vector<Shape>& getPredefinedShapes() {
    static const double pi = PI_VAL;
    static const vector<Shape> shapes = {
        {"Circle (half)",
         [](double x) { return safeSqrt(1.0 - x * x); },
         [](double x) { return (x * safeSqrt(1.0 - x * x) + safeAsin(x)) / 2.0; },
         [](double x) { return x - pow(x, 3) / 3.0; },
         -1.0, 1.0, "Valid: -1 <= x <= 1",
         [](double a, double b) { return a >= -1.0 && b <= 1.0; }},

        {"Circle (quarter)",
         [](double x) { return safeSqrt(1.0 - x * x); },
         [](double x) { return (x * safeSqrt(1.0 - x * x) + safeAsin(x)) / 2.0; },
         [](double x) { return x - pow(x, 3) / 3.0; },
         0.0, 1.0, "Valid: -1 <= x <= 1",
         [](double a, double b) { return a >= -1.0 && b <= 1.0; }},

        {"Semicircle (radius 2)",
         [](double x) { return safeSqrt(4.0 - x * x); },
         [](double x) { return (x * safeSqrt(4.0 - x * x)) / 2.0 + 2.0 * safeAsin(x / 2.0); },
         [](double x) { return 4.0 * x - pow(x, 3) / 3.0; },
         -2.0, 2.0, "Valid: -2 <= x <= 2",
         [](double a, double b) { return a >= -2.0 && b <= 2.0; }},

        {"Ellipse (half)",
         [](double x) { return safeSqrt(1.0 - (x * x) / 4.0); },
         [](double x) { return (x / 2.0) * safeSqrt(1.0 - (x * x) / 4.0) + safeAsin(x / 2.0); },
         [](double x) { return x - pow(x, 3) / 12.0; },
         -2.0, 2.0, "Valid: -2 <= x <= 2",
         [](double a, double b) { return a >= -2.0 && b <= 2.0; }},

        {"Line (y = x + 1)",
         [](double x) { return x + 1.0; },
         [](double x) { return (x * x) / 2.0 + x; },
         [](double x) { return pow(x, 3) / 3.0 + x * x + x; },
         0.0, 2.0, "Valid: any real x",
         [](double, double) { return true; }},

        {"Cone (y = x)",
         [](double x) { return x; },
         [](double x) { return (x * x) / 2.0; },
         [](double x) { return pow(x, 3) / 3.0; },
         0.0, 2.0, "Valid: any real x",
         [](double, double) { return true; }},

        {"Parabola (y = x^2)",
         [](double x) { return x * x; },
         [](double x) { return pow(x, 3) / 3.0; },
         [](double x) { return pow(x, 5) / 5.0; },
         0.0, 2.0, "Valid: any real x",
         [](double, double) { return true; }},

        {"Cubic (y = x^3)",
         [](double x) { return pow(x, 3); },
         [](double x) { return pow(x, 4) / 4.0; },
         [](double x) { return pow(x, 7) / 7.0; },
         0.0, 1.0, "Valid: any real x",
         [](double, double) { return true; }},

        {"Quartic (y = x^4)",
         [](double x) { return pow(x, 4); },
         [](double x) { return pow(x, 5) / 5.0; },
         [](double x) { return pow(x, 9) / 9.0; },
         0.0, 1.0, "Valid: any real x",
         [](double, double) { return true; }},

        {"Hyperbola (y = 1/x)",
         [](double x) { return (x != 0.0 ? 1.0 / x : numeric_limits<double>::quiet_NaN()); },
         [](double x) { return log(fabs(x)); },
         [](double x) { return -1.0 / x; },
         1.0, 4.0, "Valid: x > 0 strictly",
         [](double a, double) { return a > 0.0; }},

        {"Sine (0 to pi)",
         [](double x) { return sin(x); },
         [](double x) { return -cos(x); },
         [](double x) { return x / 2.0 - sin(2.0 * x) / 4.0; },
         0.0, pi, "Valid: any real x",
         [](double, double) { return true; }},

        {"Cosine (0 to pi/2)",
         [](double x) { return cos(x); },
         [](double x) { return sin(x); },
         [](double x) { return x / 2.0 + sin(2.0 * x) / 4.0; },
         0.0, pi / 2.0, "Valid: any real x",
         [](double, double) { return true; }},

        {"Exponential (y = e^x)",
         [](double x) { return exp(x); },
         [](double x) { return exp(x); },
         [](double x) { return exp(2.0 * x) / 2.0; },
         0.0, 1.0, "Valid: any real x",
         [](double, double) { return true; }},

        {"Logarithm (y = ln x)",
         [](double x) { return (x > 0.0 ? log(x) : numeric_limits<double>::quiet_NaN()); },
         [](double x) { return x * log(x) - x; },
         [](double x) { return x * pow(log(x), 2) - 2.0 * x * log(x) + 2.0 * x; },
         1.0, exp(1.0), "Valid: x > 0 strictly",
         [](double a, double) { return a > 0.0; }},

        {"Square root (y = sqrt(x))",
         [](double x) { return (x >= 0.0 ? sqrt(x) : numeric_limits<double>::quiet_NaN()); },
         [](double x) { return (2.0 / 3.0) * pow(x, 1.5); },
         [](double x) { return (x * x) / 2.0; },
         0.0, 4.0, "Valid: x >= 0 strictly",
         [](double a, double) { return a >= 0.0; }},
    };
    return shapes;
}
