// trapezoidal.cpp
// Implementation of composite Trapezoidal Rule.
// Formula: I = (h / 2) * [ (y_0 + y_n) + 2 * sum(y_i for i = 1 to n-1) ]

#include "methods.h"
#include <cmath>
#include <limits>

using namespace std;

MethodBreakdown getTrapezoidalBreakdown(const vector<double>& ys, double h) {
    MethodBreakdown b;
    b.methodName = "Trapezoidal Rule";
    b.h = h;
    b.n = static_cast<int>(ys.size()) - 1;
    if (!validateIntegrationInput(ys, h, 1)) {
        b.integral = numeric_limits<double>::quiet_NaN();
        b.isValid = false;
        return b;
    }

    b.y0 = ys[0];
    b.yn = ys[b.n];
    b.endSum = b.y0 + b.yn;
    b.primarySum = 0.0;
    for (int i = 1; i < b.n; ++i) {
        b.primarySum += ys[i];
    }
    b.secondarySum = 0.0;
    b.integral = (h / 2.0) * (b.endSum + 2.0 * b.primarySum);
    b.isValid = true;
    return b;
}

double integrateTrapezoidal(const vector<double>& ys, double h) {
    MethodBreakdown b = getTrapezoidalBreakdown(ys, h);
    return b.isValid ? b.integral : numeric_limits<double>::quiet_NaN();
}

