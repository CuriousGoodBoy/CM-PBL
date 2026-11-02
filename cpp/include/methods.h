#ifndef METHODS_H
#define METHODS_H

#include <vector>
#include <string>

using namespace std;

// Composite Numerical Integration Methods
// Ordinates must be finite, with equal positive spacing h.
// Returns quiet_NaN for invalid data or interval constraints.

double integrateTrapezoidal(const vector<double>& ys, double h);
double integrateSimpson13(const vector<double>& ys, double h);
double integrateSimpson38(const vector<double>& ys, double h);

// Internal validation helper for spacing and ordinates
bool validateIntegrationInput(const vector<double>& ys, double h, int minIntervals);

// Structured breakdown for step-by-step reporting and verification
struct MethodBreakdown {
    string methodName;
    double h = 0.0;
    int n = 0;
    double y0 = 0.0;
    double yn = 0.0;
    double endSum = 0.0;
    double primarySum = 0.0;    // Trap: interior; S13: odd; S38: non-mult-3
    double secondarySum = 0.0;  // S13: even; S38: mult-3
    double integral = 0.0;
    bool isValid = false;
};

MethodBreakdown getTrapezoidalBreakdown(const vector<double>& ys, double h);
MethodBreakdown getSimpson13Breakdown(const vector<double>& ys, double h);
MethodBreakdown getSimpson38Breakdown(const vector<double>& ys, double h);

#endif // METHODS_H

