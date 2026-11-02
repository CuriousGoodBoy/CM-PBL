// simpson13.cpp
// Implementation of composite Simpson's 1/3 Rule.
// Formula: I = (h / 3) * [ (y_0 + y_n) + 4 * sum(y_odd) + 2 * sum(y_even) ]
// Condition: n must be an even integer (n % 2 == 0), n >= 2.

#include "methods.h"
#include <cmath>
#include <limits>

using namespace std;

MethodBreakdown getSimpson13Breakdown(const vector<double>& ys, double h) {
    MethodBreakdown b;
    b.methodName = "Simpson's 1/3 Rule";
    b.h = h;
    b.n = static_cast<int>(ys.size()) - 1;
    if (!validateIntegrationInput(ys, h, 2) || (b.n % 2 != 0)) {
        b.integral = numeric_limits<double>::quiet_NaN();
        b.isValid = false;
        return b;
    }

    b.y0 = ys[0];
    b.yn = ys[b.n];
    b.endSum = b.y0 + b.yn;
    b.primarySum = 0.0;   // sum of odd ordinates
    b.secondarySum = 0.0; // sum of even ordinates
    for (int i = 1; i < b.n; ++i) {
        if (i % 2 == 1) {
            b.primarySum += ys[i];
        } else {
            b.secondarySum += ys[i];
        }
    }
    b.integral = (h / 3.0) * (b.endSum + 4.0 * b.primarySum + 2.0 * b.secondarySum);
    b.isValid = true;
    return b;
}

double integrateSimpson13(const vector<double>& ys, double h) {
    MethodBreakdown b = getSimpson13Breakdown(ys, h);
    return b.isValid ? b.integral : numeric_limits<double>::quiet_NaN();
}

