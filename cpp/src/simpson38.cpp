// simpson38.cpp
// Implementation of composite Simpson's 3/8 Rule.
// Formula: I = (3h / 8) * [ (y_0 + y_n) + 3 * sum(y_i where i not mult 3) + 2 * sum(y_i where i mult 3) ]
// Condition: n must be a multiple of 3 (n % 3 == 0), n >= 3.

#include "methods.h"
#include <cmath>
#include <limits>

MethodBreakdown getSimpson38Breakdown(const std::vector<double>& ys, double h) {
    MethodBreakdown b;
    b.methodName = "Simpson's 3/8 Rule";
    b.h = h;
    b.n = static_cast<int>(ys.size()) - 1;
    if (!validateIntegrationInput(ys, h, 3) || (b.n % 3 != 0)) {
        b.integral = std::numeric_limits<double>::quiet_NaN();
        b.isValid = false;
        return b;
    }

    b.y0 = ys[0];
    b.yn = ys[b.n];
    b.endSum = b.y0 + b.yn;
    b.primarySum = 0.0;   // non-multiples of 3
    b.secondarySum = 0.0; // multiples of 3
    for (int i = 1; i < b.n; ++i) {
        if (i % 3 != 0) {
            b.primarySum += ys[i];
        } else {
            b.secondarySum += ys[i];
        }
    }
    b.integral = (3.0 * h / 8.0) * (b.endSum + 3.0 * b.primarySum + 2.0 * b.secondarySum);
    b.isValid = true;
    return b;
}

double integrateSimpson38(const std::vector<double>& ys, double h) {
    MethodBreakdown b = getSimpson38Breakdown(ys, h);
    return b.isValid ? b.integral : std::numeric_limits<double>::quiet_NaN();
}

