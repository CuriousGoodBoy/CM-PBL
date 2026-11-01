#ifndef CALCULATOR_CLI_H
#define CALCULATOR_CLI_H

#include "methods.h"
#include "shapes.h"
#include <string>
#include <vector>

namespace cli {

// Safe console reading and parsing
std::string readLine();
bool parseNumber(const std::string& text, double& value);
double readDouble(const std::string& prompt, double defaultValue);
int readInt(const std::string& prompt, int defaultValue);

// Parsing measured data lines
bool parseMeasuredValues(const std::string& line, bool isArea, std::vector<double>& outValues);

// Display functions
void displayBanner();

void displaySteps(const std::vector<double>& ys, double h, int n, int methodChoice,
                  double approx, bool isArea, bool hasExact, double exact,
                  bool hasRef, double refVal);

void displaySingleResult(const std::string& methodName, const std::string& problemDesc,
                         double approx, bool isArea, bool hasExact, double exact,
                         bool hasRef, double refVal);

void displayComparisonTable(const std::vector<double>& ys, double h, int n, double scale,
                            bool isArea, const std::string& problemDesc,
                            bool hasExact, double exact, bool hasRef, double refVal);

// Main CLI workflow cycle
bool runCalculatorCycle();

} // namespace cli

#endif // CALCULATOR_CLI_H

