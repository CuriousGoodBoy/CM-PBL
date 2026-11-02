#ifndef SHAPES_H
#define SHAPES_H

#include <algorithm>
#include <cmath>
#include <functional>
#include <string>
#include <vector>

using namespace std;

// Mathematical constants
inline constexpr double PI_VAL = 3.14159265358979323846;

// Safe mathematical helpers to guard against floating-point roundoff
inline double safeSqrt(double x) {
    return sqrt(max(0.0, x));
}

inline double safeAsin(double x) {
    return asin(clamp(x, -1.0, 1.0));
}

// Shape profile structure
struct Shape {
    string name;
    function<double(double)> f;  // Profile function
    function<double(double)> F;  // Antiderivative of f(x)
    function<double(double)> G;  // Antiderivative of [f(x)]^2
    double defaultA;
    double defaultB;
    string validRange;
    function<bool(double, double)> isValidDomain; // Encapsulated domain validation
};

// Returns reference to the list of 15 predefined test shapes and curves
const vector<Shape>& getPredefinedShapes();

#endif // SHAPES_H
