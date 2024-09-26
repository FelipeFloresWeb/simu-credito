export function calcularParcelasPRICE({
    valorContrato,
    numeroParcelas,
    taxaJurosAnual,
    parcelasComJurosZero = 0,
}: {
    valorContrato: number;
    numeroParcelas: number;
    taxaJurosAnual: number;
    parcelasComJurosZero?: number;
}): {
    parcelas: number[];
    totalJuros: number;
    valorTotal: number;
} {
    const taxaJurosMensal = taxaJurosAnual / 12;
    let saldoDevedor = valorContrato;
    const parcelas = [];
    let totalJuros = 0;

    // Parcelas com juros zero (período de obra)
    for (let i = 0; i < parcelasComJurosZero; i++) {
        const valorParcela = valorContrato / numeroParcelas;
        parcelas.push(valorParcela);
        saldoDevedor -= valorParcela;
    }

    // Parcelas com juros (período pós-obra)
    if (saldoDevedor > 0) {
        const parcelasRestantes = numeroParcelas - parcelasComJurosZero;
        const valorParcela =
            (saldoDevedor * taxaJurosMensal * Math.pow(1 + taxaJurosMensal, parcelasRestantes)) /
            (Math.pow(1 + taxaJurosMensal, parcelasRestantes) - 1);

        for (let i = 0; i < parcelasRestantes; i++) {
            const juros = saldoDevedor * taxaJurosMensal;
            const amortizacao = valorParcela - juros;
            saldoDevedor -= amortizacao;
            totalJuros += juros;
            parcelas.push(valorParcela);
        }
    }

    const valorTotal = parcelas.reduce((sum, parcela) => sum + parcela, 0);

    return {
        parcelas,
        totalJuros,
        valorTotal,
    };
}

export function calcularDiferencaMeses(dataInicio: Date, dataFim: Date): number {
    const diferencaMeses = dataFim.getMonth() - dataInicio.getMonth() + 12 * (dataFim.getFullYear() - dataInicio.getFullYear());

    return diferencaMeses;
}
