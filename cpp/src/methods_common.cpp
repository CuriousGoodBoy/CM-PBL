// methods_common.cpp
// Shared validation utilities for numerical integration methods.

#include "methods.h"
#include <cmath>

bool validateIntegrationInput(const std::vector<double>& ys, double h, int minIntervals) {
    int n = static_cast<int>(ys.size()) - 1;
    if (n < minIntervals) {
        return false;
    }
    if (!std::isfinite(h) || h <= 0.0) {
        return false;
    }
    for (double y : ys) {
        if (!std::isfinite(y)) {
            return false;
        }
    }
    return true;
}

