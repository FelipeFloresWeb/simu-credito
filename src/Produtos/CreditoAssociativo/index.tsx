import { Box, Heading, Button, FormControl, FormLabel, Grid, Input, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { calculatePriceInstallments, calculateMonthDifference } from '../../simluadorFunctions';
import { format, addMonths } from 'date-fns'; 

export const CreditoAssociativo = () => {
    const [valorContrato, setValorContrato] = useState('');
    const [valorEntrada, setValorEntrada] = useState('');
    const [rendaMensal, setRendaMensal] = useState('');
    const [dataInicioObra, setDataInicioObra] = useState('');
    const [resultado, setResultado] = useState<string | null>(null);
    const [detalhesSimulacao, setDetalhesSimulacao] = useState<string | null>(null);

    const dataHabitese = '2027-04-30';

    const calcularSimulacao = () => {
        const contrato = parseFloat(valorContrato);
        const entrada = parseFloat(valorEntrada);
        const renda = parseFloat(rendaMensal);
      
        if (isNaN(contrato) || isNaN(entrada) || isNaN(renda)) {
          setResultado('Dados inválidos');
          return;
        }
      
        const dataInicioObraDate = new Date(dataInicioObra);
        const dataHabiteseDate = new Date(dataHabitese);
        const mesesAteHabitese = calculateMonthDifference(dataInicioObraDate, dataHabiteseDate);
      
        // Verifica se a entrada é maior ou igual ao valor do contrato
        if (entrada >= contrato) {
          setResultado('Aprovado');
          setDetalhesSimulacao(`
            Valor do Contrato: R$ ${contrato.toFixed(2)}
            Valor de Entrada: R$ ${entrada.toFixed(2)}
            Renda Mensal: R$ ${renda.toFixed(2)}
            Data de início da obra: ${format(dataInicioObraDate, 'dd/MM/yyyy')}
            Meses até Habite-se: ${mesesAteHabitese}
            Data da última parcela: Não se aplica (pagamento à vista)

            O valor da entrada é suficiente para cobrir o valor do contrato. Não há necessidade de financiamento.
          `);
          return;
        }
    
        const valorFinanciado = contrato - entrada;
        
        // Cálculo para o período de obra (24 meses)
        const installmentsObra = calculatePriceInstallments(
            valorFinanciado,
            0,
            24,
            0, // 0% de juros durante a obra
            'PRICE'
        );
      
        // Cálculo para o período pós-obra (36 meses)
        const installmentsPosObra = calculatePriceInstallments(
            valorFinanciado,
            0,
            36,
            0.12, // 12% de juros anuais
            'PRICE'
        );

        // Cálculo do número total de parcelas necessárias
        const totalParcelas = Math.ceil(valorFinanciado / installmentsObra.monthlyPayment);
        const parcelasDuranteObra = Math.min(totalParcelas, 24);
        const parcelasPosObra = totalParcelas > 24 ? Math.min(totalParcelas - 24, 36) : 0;

        // Cálculo do valor da última parcela
        const valorUltimaParcela = valorFinanciado - (installmentsObra.monthlyPayment * (parcelasDuranteObra - 1) + 
                                   installmentsPosObra.monthlyPayment * (parcelasPosObra - 1));

        // Cálculo da data da última parcela
        const dataUltimaParcela = addMonths(dataInicioObraDate, totalParcelas - 1);
    
        // Cálculo do VGV (Valor Geral de Vendas)
        const vgv = contrato + (installmentsPosObra.totalInterest || 0);
    
        // Verificação do comprometimento de renda
        const comprometimentoObra = (installmentsObra.monthlyPayment / renda) * 100;
        const comprometimentoPosObra = (installmentsPosObra.monthlyPayment / renda) * 100;
        const parcelaPosObraVGV = (installmentsPosObra.monthlyPayment / vgv) * 100;
    
        const incomeCommitmentObra = comprometimentoObra <= 35;
        const incomeCommitmentPosObra = comprometimentoPosObra <= 10;
        const vgvCheckPosObra = parcelaPosObraVGV <= 5;
        
        const parcelaAnual = renda * 12 * 0.70;
        const parcelaSemestral = renda * 6 * 0.70;
        
        const annualCheck = parcelaAnual >= valorFinanciado;
        const semiannualCheck = parcelaSemestral >= valorFinanciado / 2;
        
        const approved = incomeCommitmentObra && incomeCommitmentPosObra && vgvCheckPosObra && (annualCheck || semiannualCheck);
        
        const motivos = []; 
        
        if (!incomeCommitmentObra) {
            motivos.push(`Comprometimento de renda durante a obra excede 35% (atual: ${comprometimentoObra.toFixed(2)}%)`);
        }
        if (!incomeCommitmentPosObra) {
            motivos.push(`Comprometimento de renda pós-obra excede 10% (atual: ${comprometimentoPosObra.toFixed(2)}%)`);
        }
        if (!vgvCheckPosObra) {
            motivos.push(`Parcela pós-obra excede 5% do VGV (atual: ${parcelaPosObraVGV.toFixed(2)}%)`);
        }
        if (!annualCheck && !semiannualCheck) {
            motivos.push(`Parcelas anuais (R$ ${parcelaAnual.toFixed(2)}) e semestrais (R$ ${parcelaSemestral.toFixed(2)}) são insuficientes para cobrir o valor financiado (R$ ${valorFinanciado.toFixed(2)})`);
        }
    
        setResultado(approved ? 'Aprovado' : 'Reprovado');
        setDetalhesSimulacao(`
            Valor do Contrato: R$ ${contrato.toFixed(2)}
            Valor de Entrada: R$ ${entrada.toFixed(2)}
            Valor Financiado: R$ ${valorFinanciado.toFixed(2)}
            Parcela durante obra: R$ ${installmentsObra.monthlyPayment.toFixed(2)}
            Parcela pós-obra: R$ ${installmentsPosObra.monthlyPayment.toFixed(2)}
            Parcela anual: R$ ${parcelaAnual.toFixed(2)}
            Parcela semestral: R$ ${parcelaSemestral.toFixed(2)}
            Meses até Habite-se: ${mesesAteHabitese}
            Comprometimento de renda (obra): ${comprometimentoObra.toFixed(2)}%
            Comprometimento de renda (pós-obra): ${comprometimentoPosObra.toFixed(2)}%
            VGV: R$ ${vgv.toFixed(2)}
            Parcela pós-obra em relação ao VGV: ${parcelaPosObraVGV.toFixed(2)}%
            Data de início da obra: ${format(dataInicioObraDate, 'dd/MM/yyyy')}
            Número total de parcelas: ${totalParcelas}
            Data da última parcela: ${format(dataUltimaParcela, 'dd/MM/yyyy')}
            Valor da última parcela: R$ ${valorUltimaParcela.toFixed(2)}
            ${!approved ? `\nMotivos da reprovação:\n${motivos.join('\n')}` : ''}
        `);
    };

    return (
        <Box maxW="container.md" mx="auto" p={4}>
            <Heading as="h1" size="lg" mb={6}>Simulador de Capacidade de Pagamento - Crédito Associativo</Heading>
            
            <VStack spacing={4}>
                <Grid templateColumns="repeat(2, 1fr)" gap={6} width="100%">
                    <FormControl>
                        <FormLabel>Valor do Contrato:</FormLabel>
                        <Input 
                            type="number" 
                            value={valorContrato} 
                            onChange={(e) => setValorContrato(e.target.value)}
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Valor de Entrada:</FormLabel>
                        <Input 
                            type="number" 
                            value={valorEntrada} 
                            onChange={(e) => setValorEntrada(e.target.value)}
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Renda Mensal:</FormLabel>
                        <Input 
                            type="number" 
                            value={rendaMensal} 
                            onChange={(e) => setRendaMensal(e.target.value)}
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Data de Início da Obra:</FormLabel>
                        <Input 
                            type="date" 
                            value={dataInicioObra} 
                            onChange={(e) => setDataInicioObra(e.target.value)}
                        />
                    </FormControl>
                </Grid>

                <Text>Total de parcelas: 60 (24 meses durante a obra + 36 meses pós-obra)</Text>

                <Button 
                    colorScheme="blue" 
                    onClick={calcularSimulacao}
                    width="100%"
                >
                    Calcular Simulação
                </Button>

                {resultado && (
                    <Box width="100%">
                        <Heading as="h2" size="md">Resultado da Simulação:</Heading>
                        <Text fontSize="xl" fontWeight="bold" color={resultado === 'Aprovado' ? 'green.500' : 'red.500'}>
                            {resultado}
                        </Text>
                    </Box>
                )}

                {detalhesSimulacao && (
                    <Box width="100%">
                        <Heading as="h3" size="sm">Detalhes da Simulação:</Heading>
                        <Text whiteSpace="pre-line">{detalhesSimulacao}</Text>
                    </Box>
                )}
            </VStack>
        </Box>
    );
};