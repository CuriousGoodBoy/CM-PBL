#ifndef SHAPES_H
#define SHAPES_H

#include <algorithm>
#include <cmath>
#include <functional>
#include <string>
#include <vector>

// Mathematical constants
inline constexpr double PI_VAL = 3.14159265358979323846;

// Safe mathematical helpers to guard against floating-point roundoff
inline double safeSqrt(double x) {
    return std::sqrt(std::max(0.0, x));
}

inline double safeAsin(double x) {
    return std::asin(std::clamp(x, -1.0, 1.0));
}

// Shape profile structure
struct Shape {
    std::string name;
    std::function<double(double)> f;  // Profile function
    std::function<double(double)> F;  // Antiderivative of f(x)
    std::function<double(double)> G;  // Antiderivative of [f(x)]^2
    double defaultA;
    double defaultB;
    std::string validRange;
    std::function<bool(double, double)> isValidDomain; // Encapsulated domain validation
};

// Returns reference to the list of 15 predefined test shapes and curves
const std::vector<Shape>& getPredefinedShapes();

#endif // SHAPES_H
