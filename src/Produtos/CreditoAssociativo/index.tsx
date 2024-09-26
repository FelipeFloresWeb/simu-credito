import { Box, Heading, Button, FormControl, FormLabel, Grid, Input, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { format, addMonths } from "date-fns";

import { calcularDiferencaMeses, calcularParcelasPRICE } from "../../simluadorFunctions";
import { formatNumber } from "../../utils/formatNumber";

export const CreditoAssociativo = () => {
    const [valorContrato, setValorContrato] = useState("");
    const [valorEntrada, setValorEntrada] = useState("");
    const [rendaMensal, setRendaMensal] = useState("");
    const [dataInicioObra, setDataInicioObra] = useState("");
    const [resultado, setResultado] = useState<string | null>(null);
    const [detalhesSimulacao, setDetalhesSimulacao] = useState<string | null>(null);

    const dataHabitese = "2027-04-30";

    const calcularSimulacao = () => {
        const contrato = parseFloat(valorContrato);
        const entrada = parseFloat(valorEntrada);
        const renda = parseFloat(rendaMensal);

        if (isNaN(contrato) || isNaN(entrada) || isNaN(renda)) {
            setResultado("Dados inválidos");
            return;
        }

        const dataInicioObraDate = new Date(dataInicioObra);
        const dataHabiteseDate = new Date(dataHabitese);
        const mesesAteHabitese = calcularDiferencaMeses(dataInicioObraDate, dataHabiteseDate);

        // Verifica se a entrada é maior ou igual ao valor do contrato
        if (entrada >= contrato) {
            setResultado("Aprovado");
            setDetalhesSimulacao(`
            Valor do Contrato: ${formatNumber.format(contrato)}
            Valor de Entrada: ${formatNumber.format(entrada)}
            Renda Mensal: ${formatNumber.format(renda)}
            Data de início da obra: ${format(dataInicioObraDate, "dd/MM/yyyy")}
            Meses até Habite-se: ${mesesAteHabitese}
            Data da última parcela: Não se aplica (pagamento à vista)

            O valor da entrada é suficiente para cobrir o valor do contrato. Não há necessidade de financiamento.
          `);
            return;
        }

        const valorFinanciado = contrato - entrada;

        const resultado = calcularParcelasPRICE({
            valorContrato: valorFinanciado,
            numeroParcelas: 60,
            taxaJurosAnual: 0.12, // 12% ao ano
            parcelasComJurosZero: 24, // 24 meses durante a obra com juros zero
        });
        const parcelasObra = resultado.parcelas.slice(0, 24);
        const parcelasPosObra = resultado.parcelas.slice(24);

        const valorParcelaObra = parcelasObra[0];
        const valorParcelaPosObra = parcelasPosObra[0];

        // Cálculo do VGV (Valor Geral de Vendas)
        const vgv = contrato + resultado.totalJuros;

        // Verificação do comprometimento de renda
        const comprometimentoObra = (valorParcelaObra / renda) * 100;
        const comprometimentoPosObra = (valorParcelaPosObra / renda) * 100;
        const parcelaPosObraVGV = (valorParcelaPosObra / vgv) * 100;

        const comprometimentoRendaObra = comprometimentoObra <= 35;
        const comprometimentoRendaPosObra = comprometimentoPosObra <= 10;
        const verificacaoVGVPosObra = parcelaPosObraVGV <= 5;

        const parcelaAnual = renda * 12 * 0.7;
        const parcelaSemestral = renda * 6 * 0.7;

        const verificacaoAnual = parcelaAnual >= valorFinanciado;
        const verificacaoSemestral = parcelaSemestral >= valorFinanciado / 2;

        const aprovado =
            comprometimentoRendaObra && comprometimentoRendaPosObra && verificacaoVGVPosObra && (verificacaoAnual || verificacaoSemestral);

        const motivos = [];

        if (!comprometimentoRendaObra) {
            motivos.push(`Comprometimento de renda durante a obra excede 35% (atual: ${comprometimentoObra.toFixed(2)}%)`);
        }
        if (!comprometimentoRendaPosObra) {
            motivos.push(`Comprometimento de renda pós-obra excede 10% (atual: ${comprometimentoPosObra.toFixed(2)}%)`);
        }
        if (!verificacaoVGVPosObra) {
            motivos.push(`Parcela pós-obra excede 5% do VGV (atual: ${parcelaPosObraVGV.toFixed(2)}%)`);
        }
        if (!verificacaoAnual && !verificacaoSemestral) {
            motivos.push(
                `Parcelas anuais (R$ ${parcelaAnual.toFixed(2)}) e semestrais (R$ ${parcelaSemestral.toFixed(
                    2
                )}) são insuficientes para cobrir o valor financiado (R$ ${valorFinanciado.toFixed(2)})`
            );
        }

        setResultado(aprovado ? "Aprovado" : "Reprovado");
        setDetalhesSimulacao(`
            Valor do Contrato: ${formatNumber.format(contrato)}
            Valor de Entrada: ${formatNumber.format(entrada)}
            Valor Financiado: ${formatNumber.format(valorFinanciado)}
            Parcela durante obra: ${formatNumber.format(valorParcelaObra)}
            Parcela pós-obra: ${formatNumber.format(valorParcelaPosObra)}
            Parcela anual: ${formatNumber.format(parcelaAnual)}
            Parcela semestral: ${formatNumber.format(parcelaSemestral)}
            Meses até Habite-se: ${mesesAteHabitese}
            Comprometimento de renda (obra): ${comprometimentoObra.toFixed(2)}%
            Comprometimento de renda (pós-obra): ${comprometimentoPosObra.toFixed(2)}%
            VGV: ${formatNumber.format(vgv)}
            Parcela pós-obra em relação ao VGV: ${parcelaPosObraVGV.toFixed(2)}%
            Data de início da obra: ${format(dataInicioObraDate, "dd/MM/yyyy")}
            Número total de parcelas: ${resultado.parcelas.length}
            Data da última parcela: ${format(addMonths(dataInicioObraDate, resultado.parcelas.length - 1), "dd/MM/yyyy")}
            ${!aprovado ? `\nMotivos da reprovação:\n${motivos.join("\n")}` : ""}
        `);
    };

    return (
        <Box maxW="container.md" mx="auto" p={4}>
            <Heading as="h1" size="lg" mb={6}>
                Simulador de Capacidade de Pagamento - Crédito Associativo
            </Heading>

            <VStack spacing={4}>
                <Grid templateColumns="repeat(2, 1fr)" gap={6} width="100%">
                    <FormControl>
                        <FormLabel>Valor do Contrato:</FormLabel>
                        <Input type="number" value={valorContrato} onChange={(e) => setValorContrato(e.target.value)} />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Valor de Entrada:</FormLabel>
                        <Input type="number" value={valorEntrada} onChange={(e) => setValorEntrada(e.target.value)} />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Renda Mensal:</FormLabel>
                        <Input type="number" value={rendaMensal} onChange={(e) => setRendaMensal(e.target.value)} />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Data de Início da Obra:</FormLabel>
                        <Input type="date" value={dataInicioObra} onChange={(e) => setDataInicioObra(e.target.value)} />
                    </FormControl>
                </Grid>

                <Text>Total de parcelas: 60 (24 meses durante a obra + 36 meses pós-obra)</Text>

                <Button colorScheme="blue" onClick={calcularSimulacao} width="100%">
                    Calcular Simulação
                </Button>

                {resultado && (
                    <Box width="100%">
                        <Heading as="h2" size="md">
                            Resultado da Simulação:
                        </Heading>
                        <Text fontSize="xl" fontWeight="bold" color={resultado === "Aprovado" ? "green.500" : "red.500"}>
                            {resultado}
                        </Text>
                    </Box>
                )}

                {detalhesSimulacao && (
                    <Box width="100%">
                        <Heading as="h3" size="sm">
                            Detalhes da Simulação:
                        </Heading>
                        <Text whiteSpace="pre-line">{detalhesSimulacao}</Text>
                    </Box>
                )}
            </VStack>
        </Box>
    );
};
