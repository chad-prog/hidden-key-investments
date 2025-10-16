
/**
 * Investment calculator component for real estate investment analysis
 * Provides ROI calculations and investment scenario modeling
 */
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { Calculator, TrendingUp, DollarSign, Home, Percent } from 'lucide-react';

interface CalculatorInputs {
  propertyPrice: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  monthlyRent: number;
  propertyTax: number;
  insurance: number;
  maintenance: number;
  vacancyRate: number;
  managementFee: number;
}

interface CalculatorResults {
  monthlyMortgage: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  capRate: number;
  cashOnCashReturn: number;
  totalInvestment: number;
  grossRentMultiplier: number;
}

export default function InvestmentCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    propertyPrice: 500000,
    downPayment: 20,
    interestRate: 4.5,
    loanTerm: 30,
    monthlyRent: 3000,
    propertyTax: 300,
    insurance: 100,
    maintenance: 200,
    vacancyRate: 5,
    managementFee: 8,
  });

  const [results, setResults] = useState<CalculatorResults | null>(null);

  const calculateResults = () => {
    const {
      propertyPrice,
      downPayment,
      interestRate,
      loanTerm,
      monthlyRent,
      propertyTax,
      insurance,
      maintenance,
      vacancyRate,
      managementFee,
    } = inputs;

    // Calculations
    const downPaymentAmount = (propertyPrice * downPayment) / 100;
    const loanAmount = propertyPrice - downPaymentAmount;
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    // Monthly Mortgage Payment
    const monthlyMortgage = loanAmount * 
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

    // Monthly Expenses
    const vacancyLoss = (monthlyRent * vacancyRate) / 100;
    const managementCost = (monthlyRent * managementFee) / 100;
    const monthlyExpenses = propertyTax + insurance + maintenance + vacancyLoss + managementCost;

    // Cash Flow
    const monthlyCashFlow = monthlyRent - monthlyMortgage - monthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;

    // ROI Metrics
    const capRate = ((monthlyRent * 12 - (propertyTax * 12 + insurance * 12 + maintenance * 12)) / propertyPrice) * 100;
    const cashOnCashReturn = (annualCashFlow / downPaymentAmount) * 100;
    const totalInvestment = downPaymentAmount;
    const grossRentMultiplier = propertyPrice / (monthlyRent * 12);

    setResults({
      monthlyMortgage,
      monthlyExpenses,
      monthlyCashFlow,
      annualCashFlow,
      capRate,
      cashOnCashReturn,
      totalInvestment,
      grossRentMultiplier,
    });
  };

  const handleInputChange = (field: keyof CalculatorInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleSliderChange = (field: keyof CalculatorInputs, value: number[]) => {
    setInputs(prev => ({ ...prev, [field]: value[0] }));
  };

  React.useEffect(() => {
    calculateResults();
  }, [inputs]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Investment Parameters
            </CardTitle>
            <CardDescription>
              Adjust the sliders to model your investment scenario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Property Price */}
            <div className="space-y-3">
              <Label htmlFor="propertyPrice" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Property Price: ${inputs.propertyPrice.toLocaleString()}
              </Label>
              <Slider
                id="propertyPrice"
                min={100000}
                max={2000000}
                step={25000}
                value={[inputs.propertyPrice]}
                onValueChange={(value) => handleSliderChange('propertyPrice', value)}
                className="w-full"
              />
            </div>

            {/* Down Payment */}
            <div className="space-y-3">
              <Label htmlFor="downPayment" className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Down Payment: {inputs.downPayment}%
              </Label>
              <Slider
                id="downPayment"
                min={5}
                max={50}
                step={1}
                value={[inputs.downPayment]}
                onValueChange={(value) => handleSliderChange('downPayment', value)}
                className="w-full"
              />
            </div>

            {/* Interest Rate */}
            <div className="space-y-3">
              <Label htmlFor="interestRate">
                Interest Rate: {inputs.interestRate}%
              </Label>
              <Slider
                id="interestRate"
                min={2}
                max={8}
                step={0.1}
                value={[inputs.interestRate]}
                onValueChange={(value) => handleSliderChange('interestRate', value)}
                className="w-full"
              />
            </div>

            {/* Monthly Rent */}
            <div className="space-y-3">
              <Label htmlFor="monthlyRent" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Monthly Rent: ${inputs.monthlyRent}
              </Label>
              <Slider
                id="monthlyRent"
                min={500}
                max={10000}
                step={100}
                value={[inputs.monthlyRent]}
                onValueChange={(value) => handleSliderChange('monthlyRent', value)}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Investment Analysis
            </CardTitle>
            <CardDescription>
              Real-time calculation of key investment metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">Monthly Cash Flow</Label>
                    <div className={`text-lg font-semibold ${results.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${results.monthlyCashFlow.toFixed(2)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">Annual Cash Flow</Label>
                    <div className={`text-lg font-semibold ${results.annualCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${results.annualCashFlow.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">Cap Rate</Label>
                    <div className="text-lg font-semibold text-blue-600">
                      {results.capRate.toFixed(2)}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">Cash on Cash ROI</Label>
                    <div className="text-lg font-semibold text-blue-600">
                      {results.cashOnCashReturn.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Monthly Mortgage:</span>
                    <span>${results.monthlyMortgage.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Monthly Expenses:</span>
                    <span>${results.monthlyExpenses.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Investment:</span>
                    <span>${results.totalInvestment.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Adjust parameters to see calculations
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button 
          variant="outline" 
          className="bg-transparent"
          onClick={() => setInputs({
            propertyPrice: 500000,
            downPayment: 20,
            interestRate: 4.5,
            loanTerm: 30,
            monthlyRent: 3000,
            propertyTax: 300,
            insurance: 100,
            maintenance: 200,
            vacancyRate: 5,
            managementFee: 8,
          })}
        >
          Reset to Default
        </Button>
        <Button onClick={calculateResults}>
          Recalculate
        </Button>
      </div>
    </div>
  );
}
