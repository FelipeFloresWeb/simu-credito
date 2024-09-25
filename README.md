# React + TypeScript + Vite

# Simulador de Crédito Associativo

## Descrição

Este projeto é um simulador de crédito associativo. Ele permite aos usuários calcular a viabilidade de um financiamento imobiliário baseado em diversos parâmetros, incluindo valor do contrato, entrada, renda mensal e data de início da obra.

## Funcionalidades

- Cálculo de parcelas durante e após o período de obra
- Verificação de comprometimento de renda
- Análise de viabilidade baseada em critérios pré-definidos
- Cálculo do Valor Geral de Vendas (VGV)
- Determinação da data e valor da última parcela

## Tecnologias Utilizadas

- React
- TypeScript
- Chakra UI
- date-fns

## Instalação

1. Clone o repositório:
   ```
   git clone https://github.com/seu-usuario/simulador-credito-associativo.git
   ```
2. Navegue até o diretório do projeto:
   ```
   cd simulador-credito-associativo
   ```
3. Instale as dependências:
   ```
   yarn install
   ```

## Como Usar

1. Inicie o servidor de desenvolvimento:
   ```
   yarn dev
   ```
2. Abra o navegador e acesse `http://localhost:5173/`
3. Preencha os campos do formulário com as informações necessárias
4. Clique em "Calcular Simulação" para ver os resultados

## Estrutura do Projeto

- `src/Produtos/CreditoAssociativo/index.tsx`: Componente principal do simulador
- `src/simluadorFunctions.ts`: Funções auxiliares para cálculos
