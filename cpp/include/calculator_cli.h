#ifndef CALCULATOR_CLI_H
#define CALCULATOR_CLI_H

#include "methods.h"
#include "shapes.h"
#include <string>
#include <vector>

using namespace std;

namespace cli {

// Safe console reading and parsing
string readLine();
bool parseNumber(const string& text, double& value);
double readDouble(const string& prompt, double defaultValue);
int readInt(const string& prompt, int defaultValue);

// Parsing measured data lines
bool parseMeasuredValues(const string& line, bool isArea, vector<double>& outValues);

// Display functions
void displayBanner();

void displaySteps(const vector<double>& ys, double h, int n, int methodChoice,
                  double approx, bool isArea, bool hasExact, double exact,
                  bool hasRef, double refVal);

void displaySingleResult(const string& methodName, const string& problemDesc,
                         double approx, bool isArea, bool hasExact, double exact,
                         bool hasRef, double refVal);

void displayComparisonTable(const vector<double>& ys, double h, int n, double scale,
                            bool isArea, const string& problemDesc,
                            bool hasExact, double exact, bool hasRef, double refVal);

// Main CLI workflow cycle
bool runCalculatorCycle();

} // namespace cli

#endif // CALCULATOR_CLI_H

