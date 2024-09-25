export function calculatePriceInstallments(
    contractValue: number,
    downPayment: number,
    numberOfInstallments: number,
    annualInterestRate: number,
    amortizationSystem: 'PRICE' | 'SAC'
  ): {
    monthlyPayment: number;
    totalInterest: number;
    totalAmount: number;
    cet: number;
  } {
    const principal = contractValue - downPayment;
    const monthlyInterestRate = annualInterestRate / 12;
  
    if (amortizationSystem === 'PRICE') {
      let monthlyPayment: number;
  
      if (annualInterestRate === 0) {
        // Se a taxa de juros for zero, simplesmente dividimos o principal pelo número de parcelas
        monthlyPayment = principal / numberOfInstallments;
      } else {
        // Fórmula padrão do sistema PRICE
        monthlyPayment =
          (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfInstallments)) /
          (Math.pow(1 + monthlyInterestRate, numberOfInstallments) - 1);
      }
  
      const totalAmount = monthlyPayment * numberOfInstallments;
      const totalInterest = totalAmount - principal;
  
      // Calculate CET (Custo Efetivo Total)
      const cet = annualInterestRate === 0 ? 0 : (Math.pow(1 + monthlyInterestRate, 12) - 1) * 100;
  
      return {
        monthlyPayment,
        totalInterest,
        totalAmount,
        cet,
      };
    } else if (amortizationSystem === 'SAC') {
      // Implementação do sistema SAC, se necessário
      // ...
    }
  
    throw new Error('Sistema de amortização inválido');
  }

export function calculateMonthDifference(startDate: Date, endDate: Date): number {
  const monthDiff = endDate.getMonth() - startDate.getMonth() + 
    (12 * (endDate.getFullYear() - startDate.getFullYear()));
  
  return monthDiff;
}

