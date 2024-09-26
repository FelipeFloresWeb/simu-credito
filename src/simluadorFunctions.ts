export function calcularParcelasPRICE(
   {valorContrato, entradaInicial, numeroParcelas, taxaJurosAnual, sistemaAmortizacao}: {
    valorContrato: number;
    entradaInicial: number;
    numeroParcelas: number;
    taxaJurosAnual: number;
    sistemaAmortizacao: string;
   }
  ): {
    valorParcela: number;
    totalJuros: number;
    valorTotal: number;
    cet: number;
  } {
    const principal = valorContrato - entradaInicial;
    const taxaJurosMensal = taxaJurosAnual / 12;
  
    if (sistemaAmortizacao === 'PRICE') {
      let valorParcela: number;
  
      if (taxaJurosAnual === 0) {
        // Se a taxa de juros for zero, simplesmente dividimos o principal pelo número de parcelas
        valorParcela = principal / numeroParcelas;
      } else {
        // Fórmula padrão do sistema PRICE
        valorParcela =
          (principal * taxaJurosMensal * Math.pow(1 + taxaJurosMensal, numeroParcelas)) /
          (Math.pow(1 + taxaJurosMensal, numeroParcelas) - 1);
      }
  
      const valorTotal = valorParcela * numeroParcelas;
      const totalJuros = valorTotal - principal;
  
      // Calcula CET (Custo Efetivo Total)
      const cet = taxaJurosAnual === 0 ? 0 : (Math.pow(1 + taxaJurosMensal, 12) - 1) * 100;
  
      return {
        valorParcela,
        totalJuros,
        valorTotal,
        cet,
      };
    } else if (sistemaAmortizacao === 'SAC') {
      // Implementação do sistema SAC, se necessário
      // ...
    }
  
    throw new Error('Sistema de amortização inválido');
  }

export function calcularDiferencaMeses(dataInicio: Date, dataFim: Date): number {
  const diferencaMeses = dataFim.getMonth() - dataInicio.getMonth() + 
    (12 * (dataFim.getFullYear() - dataInicio.getFullYear()));
  
  return diferencaMeses;
}

