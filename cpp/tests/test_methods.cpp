// test_methods.cpp
// Automated Unit Tests for C++ Numerical Methods & Shapes

#include "methods.h"
#include "shapes.h"
#include <cassert>
#include <cmath>
#include <iostream>
#include <limits>
#include <vector>

namespace {

void assertClose(double actual, double expected, double eps = 1e-10, const std::string& msg = "") {
    if (std::isnan(actual) || std::isnan(expected) || std::fabs(actual - expected) > eps) {
        std::cerr << "Assertion failed: " << actual << " != " << expected << " (eps: " << eps << ") " << msg << "\n";
        std::exit(1);
    }
}

void assertTrue(bool condition, const std::string& msg = "") {
    if (!condition) {
        std::cerr << "Assertion failed: " << msg << "\n";
        std::exit(1);
    }
}

} // namespace

int main() {
    std::cout << "Running C++ Numerical Methods Unit Tests...\n";

    // 1. Linear function f(x) = x on [0, 1], n = 6, h = 1/6
    const double h = 1.0 / 6.0;
    std::vector<double> linear;
    std::vector<double> quadratic;
    std::vector<double> cubic;
    for (int i = 0; i <= 6; ++i) {
        double x = i * h;
        linear.push_back(x);
        quadratic.push_back(x * x);
        cubic.push_back(x * x * x);
    }

    // All methods integrate linear polynomials exactly (integral = 0.5)
    assertClose(integrateTrapezoidal(linear, h), 0.5, 1e-10, "Trapezoidal linear");
    assertClose(integrateSimpson13(linear, h), 0.5, 1e-10, "Simpson 1/3 linear");
    assertClose(integrateSimpson38(linear, h), 0.5, 1e-10, "Simpson 3/8 linear");

    // Quadratic polynomial: Trapezoidal gives 73/216; Simpson 1/3 and 3/8 give exact 1/3
    assertClose(integrateTrapezoidal(quadratic, h), 73.0 / 216.0, 1e-10, "Trapezoidal quadratic");
    assertClose(integrateSimpson13(quadratic, h), 1.0 / 3.0, 1e-10, "Simpson 1/3 quadratic");
    assertClose(integrateSimpson38(quadratic, h), 1.0 / 3.0, 1e-10, "Simpson 3/8 quadratic");

    // Cubic polynomial: Trapezoidal gives 37/144; Simpson 1/3 and 3/8 give exact 1/4
    assertClose(integrateTrapezoidal(cubic, h), 37.0 / 144.0, 1e-10, "Trapezoidal cubic");
    assertClose(integrateSimpson13(cubic, h), 0.25, 1e-10, "Simpson 1/3 cubic");
    assertClose(integrateSimpson38(cubic, h), 0.25, 1e-10, "Simpson 3/8 cubic");

    // 2. Interval constraint checks (parity and divisibility)
    // n = 3 (4 points): Trapezoidal valid, S13 invalid (odd), S38 valid
    std::vector<double> n3(4, 1.0);
    assertTrue(!std::isnan(integrateTrapezoidal(n3, 0.1)), "Trapezoidal allows n = 3");
    assertTrue(std::isnan(integrateSimpson13(n3, 0.1)), "Simpson 1/3 rejects odd n = 3");
    assertTrue(!std::isnan(integrateSimpson38(n3, 0.1)), "Simpson 3/8 allows n = 3");

    // n = 4 (5 points): S13 valid, S38 invalid (not div by 3)
    std::vector<double> n4(5, 1.0);
    assertTrue(!std::isnan(integrateSimpson13(n4, 0.1)), "Simpson 1/3 allows even n = 4");
    assertTrue(std::isnan(integrateSimpson38(n4, 0.1)), "Simpson 3/8 rejects n = 4");

    // 3. Validation and edge cases: non-finite data, invalid h
    assertTrue(std::isnan(integrateTrapezoidal(linear, -0.1)), "Trapezoidal rejects negative h");
    assertTrue(std::isnan(integrateTrapezoidal(linear, 0.0)), "Trapezoidal rejects zero h");
    assertTrue(std::isnan(integrateTrapezoidal(linear, std::numeric_limits<double>::quiet_NaN())), "Trapezoidal rejects NaN h");

    std::vector<double> withNan = linear;
    withNan[2] = std::numeric_limits<double>::quiet_NaN();
    assertTrue(std::isnan(integrateTrapezoidal(withNan, h)), "Trapezoidal rejects NaN ordinate");
    assertTrue(std::isnan(integrateSimpson13(withNan, h)), "Simpson 1/3 rejects NaN ordinate");
    assertTrue(std::isnan(integrateSimpson38(withNan, h)), "Simpson 3/8 rejects NaN ordinate");

    // Empty or single element
    std::vector<double> single = {1.0};
    assertTrue(std::isnan(integrateTrapezoidal(single, h)), "Trapezoidal requires at least 2 points");
    assertTrue(std::isnan(integrateSimpson13(single, h)), "Simpson 1/3 requires at least 3 points");
    assertTrue(std::isnan(integrateSimpson38(single, h)), "Simpson 3/8 requires at least 4 points");

    // 4. Breakdown struct verification
    MethodBreakdown bTrap = getTrapezoidalBreakdown(quadratic, h);
    assertTrue(bTrap.isValid, "Breakdown valid");
    assertClose(bTrap.integral, 73.0 / 216.0, 1e-10, "Breakdown integral matches");
    assertClose(bTrap.y0, 0.0, 1e-10);
    assertClose(bTrap.yn, 1.0, 1e-10);

    MethodBreakdown bS13 = getSimpson13Breakdown(quadratic, h);
    assertTrue(bS13.isValid, "S13 Breakdown valid");
    assertClose(bS13.integral, 1.0 / 3.0, 1e-10);

    MethodBreakdown bS38 = getSimpson38Breakdown(quadratic, h);
    assertTrue(bS38.isValid, "S38 Breakdown valid");
    assertClose(bS38.integral, 1.0 / 3.0, 1e-10);

    // 5. Measured cone volume benchmark: radii 0, 1, 2 with h = 1.0
    // r^2 = 0, 1, 4. Simpson 1/3: (1/3) * (0 + 4 + 4*1) = 8/3. Volume = 8*pi/3
    std::vector<double> coneRadiiSq = {0.0, 1.0, 4.0};
    double coneVolIntegral = integrateSimpson13(coneRadiiSq, 1.0);
    assertClose(coneVolIntegral, 8.0 / 3.0, 1e-10, "Cone volume integral 8/3");
    assertClose(coneVolIntegral * PI_VAL, 8.0 * PI_VAL / 3.0, 1e-10, "Cone volume with pi");

    // 6. Shapes & Analytical antiderivative correctness
    const auto& shapes = getPredefinedShapes();
    assertTrue(shapes.size() == 15, "15 shapes registered");

    // Circle (half) integral on [-1, 1] is pi / 2
    const Shape& circle = shapes[0];
    assertClose(circle.F(1.0) - circle.F(-1.0), PI_VAL / 2.0, 1e-10, "Circle half area");

    // Ellipse (half) integral on [-2, 2] is pi
    const Shape& ellipse = shapes[3];
    assertClose(ellipse.F(2.0) - ellipse.F(-2.0), PI_VAL, 1e-10, "Ellipse half area");

    // Cone volume antiderivative on [0, 2]: pi * (G(2) - G(0)) = 8*pi/3
    const Shape& cone = shapes[5];
    assertClose(PI_VAL * (cone.G(2.0) - cone.G(0.0)), 8.0 * PI_VAL / 3.0, 1e-10, "Cone analytical volume");

    // Domain validation tests
    assertTrue(circle.isValidDomain(-1.0, 1.0), "Circle domain valid");
    assertTrue(!circle.isValidDomain(-1.5, 1.0), "Circle domain invalid lower");
    assertTrue(!circle.isValidDomain(-1.0, 1.5), "Circle domain invalid upper");

    const Shape& hyperbola = shapes[9];
    assertTrue(hyperbola.isValidDomain(0.5, 2.0), "Hyperbola domain valid");
    assertTrue(!hyperbola.isValidDomain(0.0, 2.0), "Hyperbola domain invalid at 0");
    assertTrue(!hyperbola.isValidDomain(-1.0, 2.0), "Hyperbola domain invalid negative");

    const Shape& logShape = shapes[13];
    assertTrue(logShape.isValidDomain(0.1, 2.0), "Log domain valid");
    assertTrue(!logShape.isValidDomain(0.0, 2.0), "Log domain invalid zero");

    const Shape& sqrtShape = shapes[14];
    assertTrue(sqrtShape.isValidDomain(0.0, 4.0), "Sqrt domain valid");
    assertTrue(!sqrtShape.isValidDomain(-0.1, 4.0), "Sqrt domain invalid negative");

    std::cout << "All C++ numerical, validation, and domain tests passed successfully!\n";
    return 0;
}

