// calculator_cli.cpp
// Interactive Terminal Calculator CLI implementation.

#include "calculator_cli.h"
#include <algorithm>
#include <cmath>
#include <cstdlib>
#include <iomanip>
#include <iostream>
#include <limits>
#include <regex>
#include <sstream>

namespace cli {

std::string readLine() {
    std::string line;
    if (!std::getline(std::cin, line)) {
        std::cout << "\nEnd of input. Goodbye!\n";
        std::exit(0);
    }
    const size_t first = line.find_first_not_of(" \t\r\n");
    if (first == std::string::npos) return "";
    return line.substr(first, line.find_last_not_of(" \t\r\n") - first + 1);
}

bool parseNumber(const std::string& text, double& value) {
    static const std::regex decimal(R"([+-]?(?:[0-9]+\.?[0-9]*|\.[0-9]+)(?:[eE][+-]?[0-9]+)?)");
    if (!std::regex_match(text, decimal)) return false;
    try {
        value = std::stod(text);
    } catch (...) {
        return false;
    }
    return std::isfinite(value);
}

double readDouble(const std::string& prompt, double defaultValue) {
    while (true) {
        std::cout << prompt;
        std::string line = readLine();
        if (line.empty()) return defaultValue;
        double value;
        if (parseNumber(line, value)) return value;
        std::cout << "  [!] Enter a complete, finite number.\n";
    }
}

int readInt(const std::string& prompt, int defaultValue) {
    while (true) {
        std::cout << prompt;
        std::string line = readLine();
        if (line.empty()) return defaultValue;
        double value;
        if (parseNumber(line, value) && value == std::floor(value) &&
            value >= std::numeric_limits<int>::min() && value <= std::numeric_limits<int>::max()) {
            return static_cast<int>(value);
        }
        std::cout << "  [!] Enter a whole number.\n";
    }
}

bool parseMeasuredValues(const std::string& line, bool isArea, std::vector<double>& outValues) {
    outValues.clear();
    std::string sanitized = line;
    for (char& c : sanitized) {
        if (c == ',') c = ' ';
    }
    std::stringstream ss(sanitized);
    std::string token;
    while (ss >> token) {
        double value;
        if (!parseNumber(token, value) || (!isArea && value < 0.0)) {
            outValues.clear();
            return false;
        }
        outValues.push_back(value);
    }
    return (!outValues.empty() && outValues.size() <= 1001);
}

void displayBanner() {
    std::cout << "========================================================\n";
    std::cout << "        NUMERICAL AREA & VOLUME CALCULATOR (C++)\n";
    std::cout << "  Trapezoidal Rule | Simpson's 1/3 Rule | Simpson's 3/8\n";
    std::cout << "========================================================\n";
}

void displaySteps(const std::vector<double>& ys, double h, int n, int methodChoice,
                  double approx, bool isArea, bool hasExact, double exact,
                  bool hasRef, double refVal) {
    std::cout << "\n--- Calculation Steps ---\n";
    if (!isArea) std::cout << "Volume uses ordinates y_i = r_i squared; V = pi * I.\n";

    if (methodChoice == 1) {
        MethodBreakdown b = getTrapezoidalBreakdown(ys, h);
        std::cout << "1. Formula (Trapezoidal Rule):\n"
                  << "   I = (h / 2) * [ (y_0 + y_n) + 2 * sum(y_1 ... y_n-1) ]\n"
                  << "2. Given Values:\n"
                  << "   n = " << n << ", h = " << std::fixed << std::setprecision(4) << h << "\n"
                  << "   y_0 + y_n = " << b.y0 << " + " << b.yn << " = " << b.endSum << "\n"
                  << "   Sum of middle ordinates = " << b.primarySum << "\n"
                  << "3. Main Substitution:\n"
                  << "   I = (" << h << " / 2) * [ (" << b.endSum << ") + 2 * (" << b.primarySum << ") ]\n"
                  << "   I = " << (h / 2.0) * (b.endSum + 2.0 * b.primarySum) << "\n";
    } else if (methodChoice == 2) {
        MethodBreakdown b = getSimpson13Breakdown(ys, h);
        std::cout << "1. Formula (Simpson's 1/3 Rule):\n"
                  << "   I = (h / 3) * [ (y_0 + y_n) + 4 * sum(y_odd) + 2 * sum(y_even) ]\n"
                  << "2. Given Values:\n"
                  << "   n = " << n << " (even), h = " << std::fixed << std::setprecision(4) << h << "\n"
                  << "   y_0 + y_n = " << b.endSum << "\n"
                  << "   Odd ordinates sum = " << b.primarySum << " (x 4 = " << 4.0 * b.primarySum << ")\n"
                  << "   Even ordinates sum = " << b.secondarySum << " (x 2 = " << 2.0 * b.secondarySum << ")\n"
                  << "3. Main Substitution:\n"
                  << "   I = (" << h << " / 3) * [ (" << b.endSum << ") + (" << 4.0 * b.primarySum
                  << ") + (" << 2.0 * b.secondarySum << ") ]\n"
                  << "   I = " << (h / 3.0) * (b.endSum + 4.0 * b.primarySum + 2.0 * b.secondarySum) << "\n";
    } else if (methodChoice == 3) {
        MethodBreakdown b = getSimpson38Breakdown(ys, h);
        std::cout << "1. Formula (Simpson's 3/8 Rule):\n"
                  << "   I = (3h / 8) * [ (y_0 + y_n) + 3 * sum(y_not_mult_3) + 2 * sum(y_mult_3) ]\n"
                  << "2. Given Values:\n"
                  << "   n = " << n << " (divisible by 3), h = " << std::fixed << std::setprecision(4) << h << "\n"
                  << "   y_0 + y_n = " << b.endSum << "\n"
                  << "   Non-multiple of 3 sum = " << b.primarySum << " (x 3 = " << 3.0 * b.primarySum << ")\n"
                  << "   Multiple of 3 sum = " << b.secondarySum << " (x 2 = " << 2.0 * b.secondarySum << ")\n"
                  << "3. Main Substitution:\n"
                  << "   I = (3 * " << h << " / 8) * [ (" << b.endSum << ") + (" << 3.0 * b.primarySum
                  << ") + (" << 2.0 * b.secondarySum << ") ]\n"
                  << "   I = " << (3.0 * h / 8.0) * (b.endSum + 3.0 * b.primarySum + 2.0 * b.secondarySum) << "\n";
    }

    if (!isArea) {
        std::cout << "   Volume = pi * I = " << approx << " cubic units\n";
    }
    std::cout << "4. Final Answer: " << approx << (isArea ? " square units\n" : " cubic units\n");
    if (hasExact) {
        std::cout << "   Exact Value  : " << exact << " | Absolute Error = " << std::fabs(approx - exact) << "\n";
    } else if (hasRef) {
        std::cout << "   Reference Val: " << refVal << " | Absolute Difference = " << std::fabs(approx - refVal) << "\n";
        std::cout << "   (Note: Evaluated against reference value, not assumed mathematical truth.)\n";
    } else {
        std::cout << "   Exact analytical result: Not available — measured data.\n";
    }
    std::cout << std::string(52, '-') << "\n";
}

void displaySingleResult(const std::string& methodName, const std::string& problemDesc,
                         double approx, bool isArea, bool hasExact, double exact,
                         bool hasRef, double refVal) {
    std::cout << "\n" << std::string(52, '=') << "\n";
    std::cout << "RESULT: " << methodName << "\n";
    std::cout << "Problem: " << (isArea ? "Area of " : "Volume of ") << problemDesc << "\n";
    std::cout << "Approximation: " << approx << (isArea ? " square units\n" : " cubic units\n");

    if (hasExact) {
        std::cout << "Exact Value  : " << exact << (isArea ? " square units\n" : " cubic units\n");
        std::cout << "Absolute Err : " << std::fabs(approx - exact) << "\n";
    } else if (hasRef) {
        std::cout << "Reference Val: " << refVal << " (user reference)\n";
        std::cout << "Absolute Diff: " << std::fabs(approx - refVal) << " (difference from reference)\n";
    } else {
        std::cout << "Exact Result : Not available — measured data\n";
    }
    std::cout << std::string(52, '=') << "\n";
}

void displayComparisonTable(const std::vector<double>& ys, double h, int n, double scale,
                            bool isArea, const std::string& problemDesc,
                            bool hasExact, double exact, bool hasRef, double refVal) {
    std::cout << "\n" << std::string(76, '-') << "\n";
    std::cout << "  Comparison of Numerical Methods for " << (isArea ? "Area: " : "Volume: ") << problemDesc << "\n";
    std::cout << std::string(76, '-') << "\n";
    std::cout << std::left << std::setw(18) << "Method" << std::setw(16) << "Condition"
              << std::right << std::setw(16) << "Approximation";
    if (hasExact) {
        std::cout << std::setw(18) << "Absolute Error\n";
    } else if (hasRef) {
        std::cout << std::setw(18) << "Diff (Reference)\n";
    } else {
        std::cout << std::setw(26) << "Exact / Reference\n";
    }
    std::cout << std::string(76, '-') << "\n";

    // 1. Trapezoidal
    double vTrap = integrateTrapezoidal(ys, h) * scale;
    std::cout << std::left << std::setw(18) << "Trapezoidal" << std::setw(16) << "Any n >= 1" << std::right;
    if (std::isfinite(vTrap)) std::cout << std::setw(16) << vTrap;
    else std::cout << std::setw(16) << "out of range";
    if (!std::isfinite(vTrap)) std::cout << std::setw(18) << "unavailable";
    else if (hasExact) std::cout << std::setw(18) << std::fabs(vTrap - exact);
    else if (hasRef) std::cout << std::setw(18) << std::fabs(vTrap - refVal);
    else std::cout << std::setw(26) << "Not available (measured)";
    std::cout << "\n";

    // 2. Simpson's 1/3
    double vS13 = integrateSimpson13(ys, h) * scale;
    std::cout << std::left << std::setw(18) << "Simpson's 1/3" << std::setw(16) << "n must be even" << std::right;
    if (!std::isfinite(vS13)) {
        std::cout << std::setw(16) << (n % 2 != 0 ? "not valid (odd n)" : "out of range");
        if (hasExact || hasRef) std::cout << std::setw(18) << "—";
        else std::cout << std::setw(26) << "—";
    } else {
        std::cout << std::setw(16) << vS13;
        if (hasExact) std::cout << std::setw(18) << std::fabs(vS13 - exact);
        else if (hasRef) std::cout << std::setw(18) << std::fabs(vS13 - refVal);
        else std::cout << std::setw(26) << "Not available (measured)";
    }
    std::cout << "\n";

    // 3. Simpson's 3/8
    double vS38 = integrateSimpson38(ys, h) * scale;
    std::cout << std::left << std::setw(18) << "Simpson's 3/8" << std::setw(16) << "n mult of 3" << std::right;
    if (!std::isfinite(vS38)) {
        std::cout << std::setw(16) << (n % 3 != 0 ? "not valid" : "out of range");
        if (hasExact || hasRef) std::cout << std::setw(18) << "—";
        else std::cout << std::setw(26) << "—";
    } else {
        std::cout << std::setw(16) << vS38;
        if (hasExact) std::cout << std::setw(18) << std::fabs(vS38 - exact);
        else if (hasRef) std::cout << std::setw(18) << std::fabs(vS38 - refVal);
        else std::cout << std::setw(26) << "Not available (measured)";
    }
    std::cout << "\n";

    std::cout << std::string(76, '-') << "\n";
    if (hasExact) {
        std::cout << "Exact analytical value: " << exact << (isArea ? " square units\n" : " cubic units\n");
    } else if (hasRef) {
        std::cout << "Reference benchmark: " << refVal << " (evaluated against user reference)\n";
    } else {
        std::cout << "Note: Exact analytical value is not available for discrete measured data.\n";
    }
}

bool runCalculatorCycle() {
    const auto& shapes = getPredefinedShapes();

    // Step 1: Target (Area or Volume)
    std::cout << "\n[1] Select Target Calculation:\n";
    std::cout << "    1) Area (Integral of f(x) dx)\n";
    std::cout << "    2) Volume of Solid of Revolution (pi * Integral of [f(x)]^2 dx)\n";
    int targetChoice = readInt("Choice [1]: ", 1);
    if (targetChoice != 1 && targetChoice != 2) {
        std::cout << "  [!] Select 1 for area or 2 for volume.\n";
        return true;
    }
    bool isArea = (targetChoice == 1);

    // Step 2: Input Mode
    std::cout << "\n[2] Select Input Mode:\n";
    std::cout << "    1) Function / Predefined Shape (Default)\n";
    std::cout << "    2) Given Values (Measured Data)\n";
    int modeChoice = readInt("Choice [1]: ", 1);
    if (modeChoice != 1 && modeChoice != 2) {
        std::cout << "  [!] Select input mode 1 or 2.\n";
        return true;
    }

    std::vector<double> ys;
    double h = 0.0;
    int n = 0;
    double exact = 0.0;
    bool hasExact = false;
    bool hasRef = false;
    double refVal = 0.0;
    std::string problemDesc = "";

    if (modeChoice == 2) {
        // Given Values Mode
        std::cout << "\nEnter measured y-values (area) or nonnegative radii (volume), separated by commas or spaces:\n";
        std::cout << "Example: 1.0, 1.25, 1.56, 1.95, 2.44, 3.05, 3.81\n> ";
        std::string line = readLine();
        if (!parseMeasuredValues(line, isArea, ys)) {
            std::cout << "  [!] Use complete finite numbers, at most 1001 points, and nonnegative radii.\n";
            return true;
        }

        if (ys.size() < 2) {
            std::cout << "  [!] Error: You must enter at least 2 measured values.\n";
            return true;
        }

        n = static_cast<int>(ys.size()) - 1;
        h = readDouble("Enter step size h (spacing between measurements) [1.0]: ", 1.0);
        if (h <= 0.0) {
            std::cout << "  [!] Error: Step size h must be strictly positive.\n";
            return true;
        }

        std::cout << "Enter optional Reference Value (press Enter to skip): ";
        std::string refStr = readLine();
        if (!refStr.empty()) {
            if (!parseNumber(refStr, refVal)) {
                std::cout << "  [!] Reference must be a complete finite number.\n";
                return true;
            }
            hasRef = true;
        }

        if (!isArea) {
            for (double& radius : ys) radius *= radius;
            if (std::any_of(ys.begin(), ys.end(), [](double y) { return !std::isfinite(y); })) {
                std::cout << "  [!] Squared radii exceed the numerical range.\n";
                return true;
            }
        }
        hasExact = false;
        problemDesc = "Measured Data (" + std::to_string(ys.size()) + " points, n = " +
                      std::to_string(n) + ", h = " + std::to_string(h) + ")";
    } else {
        // Function / Shape Mode
        std::cout << "\nAvailable Shapes & Curves:\n";
        for (size_t i = 0; i < shapes.size(); ++i) {
            std::cout << "    " << std::setw(2) << i + 1 << ") " << shapes[i].name << "\n";
        }
        int sChoice = readInt("Select shape [6 for Cone]: ", 6);
        if (sChoice < 1 || sChoice > static_cast<int>(shapes.size())) {
            std::cout << "  [!] Error: Invalid shape selection.\n";
            return true;
        }
        const Shape& S = shapes[sChoice - 1];
        std::cout << "  --> " << S.name << " (" << S.validRange << ")\n";

        double a = readDouble("Lower limit a [" + std::to_string(S.defaultA) + "]: ", S.defaultA);
        double b = readDouble("Upper limit b [" + std::to_string(S.defaultB) + "]: ", S.defaultB);
        if (!(a < b)) {
            std::cout << "  [!] Error: Lower limit a must be strictly less than upper limit b.\n";
            return true;
        }

        if (!S.isValidDomain(a, b)) {
            std::cout << "  [!] Limits are outside the function's valid domain.\n";
            return true;
        }

        n = readInt("Number of intervals n [6]: ", 6);
        if (n < 1 || n > 1000) {
            std::cout << "  [!] Error: n must be between 1 and 1000.\n";
            return true;
        }

        h = (b - a) / static_cast<double>(n);
        if (!std::isfinite(h) || h <= 0.0 || (a + h <= a) || (b - h >= b)) {
            std::cout << "  [!] Limits cannot represent distinct finite sample points.\n";
            return true;
        }

        std::function<double(double)> g = isArea ? S.f : ([&S](double x) { return S.f(x) * S.f(x); });
        exact = isArea ? (S.F(b) - S.F(a)) : (PI_VAL * (S.G(b) - S.G(a)));
        if (!std::isfinite(exact)) {
            std::cout << "  [!] Exact value exceeds the numerical range.\n";
            return true;
        }
        hasExact = true;

        bool domainError = false;
        ys.reserve(n + 1);
        for (int i = 0; i <= n; ++i) {
            double x = (i == n) ? b : a + i * h;
            double y = g(x);
            if (std::isnan(y) || std::isinf(y)) {
                std::cout << "  [!] Error: Function is undefined at x = " << x << ". Check valid domain.\n";
                domainError = true;
                break;
            }
            ys.push_back(y);
        }
        if (domainError) return true;

        problemDesc = S.name + " on [" + std::to_string(a) + ", " + std::to_string(b) +
                      "] with n = " + std::to_string(n);
    }

    // Step 3: Numerical Method Selection
    std::cout << "\n[3] Select Numerical Integration Method:\n";
    std::cout << "    1) Trapezoidal Rule (Any n >= 1)\n";
    std::cout << "    2) Simpson's 1/3 Rule (Requires n even)\n";
    std::cout << "    3) Simpson's 3/8 Rule (Requires n multiple of 3)\n";
    std::cout << "    4) Compare All Three Methods\n";
    int methodChoice = readInt("Choice [2]: ", 2);
    if (methodChoice < 1 || methodChoice > 4) {
        std::cout << "  [!] Select a method from 1 to 4.\n";
        return true;
    }

    double scale = isArea ? 1.0 : PI_VAL;
    std::cout << std::fixed << std::setprecision(4);

    if (methodChoice >= 1 && methodChoice <= 3) {
        double approx = std::numeric_limits<double>::quiet_NaN();
        std::string methodName = "";

        if (methodChoice == 1) {
            methodName = "Trapezoidal Rule";
            approx = integrateTrapezoidal(ys, h);
        } else if (methodChoice == 2) {
            methodName = "Simpson's 1/3 Rule";
            if (n % 2 != 0) {
                std::cout << "\n[!] Error: Simpson's 1/3 Rule requires n to be even. Given n = " << n << " is odd.\n";
                return true;
            }
            approx = integrateSimpson13(ys, h);
        } else {
            methodName = "Simpson's 3/8 Rule";
            if (n % 3 != 0) {
                std::cout << "\n[!] Error: Simpson's 3/8 Rule requires n to be divisible by 3. Given n = " << n << " is not divisible by 3.\n";
                return true;
            }
            approx = integrateSimpson38(ys, h);
        }

        approx *= scale;
        if (!std::isfinite(approx)) {
            std::cout << "  [!] Result exceeds the numerical range.\n";
            return true;
        }

        displaySingleResult(methodName, problemDesc, approx, isArea, hasExact, exact, hasRef, refVal);

        std::cout << "\nShow step-by-step calculations? (y/n) [y]: ";
        std::string showStepLine = readLine();
        if (showStepLine.empty() || showStepLine[0] == 'y' || showStepLine[0] == 'Y') {
            displaySteps(ys, h, n, methodChoice, approx, isArea, hasExact, exact, hasRef, refVal);
        }
    } else {
        displayComparisonTable(ys, h, n, scale, isArea, problemDesc, hasExact, exact, hasRef, refVal);
    }

    // Loop continuation check
    std::cout << "\nDo you want to perform another calculation? (y/n) [y]: ";
    std::string again = readLine();
    if (!again.empty() && (again[0] == 'n' || again[0] == 'N')) {
        return false;
    }
    return true;
}

} // namespace cli

