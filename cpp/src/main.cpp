// main.cpp
// Interactive Terminal Calculator for Numerical Integration (Area & Volume).
// Modular implementation with:
//   - Composite Trapezoidal Rule (trapezoidal.cpp)
//   - Composite Simpson's 1/3 Rule (simpson13.cpp)
//   - Composite Simpson's 3/8 Rule (simpson38.cpp)
//   - Shape Profiles & Domain Verification (shapes.cpp)
//   - Command-Line Interface & Steps Formatter (calculator_cli.cpp)

#include "calculator_cli.h"
#include <iostream>

int main() {
    cli::displayBanner();

    bool keepRunning = true;
    while (keepRunning) {
        keepRunning = cli::runCalculatorCycle();
    }

    std::cout << "\nThank you for using the Numerical Calculator. Goodbye!\n";
    return 0;
}

