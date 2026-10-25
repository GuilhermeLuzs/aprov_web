# APROV — Web

A APROV é uma plataforma de avaliação de produtos e serviços com gamificação.
O cliente avalia pelo aplicativo e ganha recompensas; a empresa parceira
acompanha as avaliações e configura suas moedas por aqui.

Este repositório contém apenas o **web**, que é exclusivo para empresas
parceiras e para a administração da plataforma. O aplicativo do cliente está em
`aprov_mobile` e o backend será desenvolvido em Laravel; por enquanto os dados
vêm de mocks.

## Tecnologias

- React com Vite
- TypeScript
- Tailwind CSS
- React Router
- Lucide (ícones)

## Estrutura de pastas

```
src/
  components/   componentes reutilizáveis
  screens/      uma pasta por área, uma tela por arquivo
  navigation/   rotas
  theme/        cores, tipografia e espaçamento
  assets/       logo e imagens do Maurício
```

## Como rodar

```bash
npm install
npm run dev
```

Depois, abra o endereço que aparecer no terminal, normalmente
`http://localhost:5173`.

## Padrões do repositório

**Branches:** `APV<número>-descricao-curta`, criadas a partir da `main`.

**Commits:** padrão Conventional Commits, em português.

| Tipo       | Uso                                          |
|------------|----------------------------------------------|
| `feat`     | nova funcionalidade                          |
| `fix`      | correção de bug                              |
| `refactor` | mudança de código sem alterar comportamento  |
| `style`    | ajuste visual ou de formatação               |
| `docs`     | documentação                                 |
| `chore`    | configuração, dependências, tarefas gerais   |

**Estilo:** só os tokens de `src/theme/theme.css`. Valores entre colchetes,
como `p-[13px]`, não são usados.
