# 📅 Agenda Flow

<p align="center">
  Sistema completo de gerenciamento de agenda para visitas técnicas, treinamentos e demandas na área da saúde.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-em%20desenvolvimento-blue" />
  <img src="https://img.shields.io/badge/version-1.0.0-green" />
  <img src="https://img.shields.io/badge/license-MIT-orange" />
</p>

---

# 📌 Sobre o Projeto

O **Agenda Flow** é uma aplicação web desenvolvida para facilitar o controle e organização de agendas técnicas em unidades de saúde.

O sistema permite realizar o gerenciamento de:

- 📅 Visitas técnicas
- 🎓 Treinamentos
- 📋 Demandas operacionais
- ❌ Cancelamentos
- 📊 Indicadores através de dashboard

A aplicação funciona diretamente no navegador utilizando armazenamento local, sem necessidade de servidor.

---

# ✨ Funcionalidades

## 📊 Dashboard

- Estatísticas em tempo real
- Compromissos do dia
- Eventos da semana
- Total de treinamentos
- Total de visitas
- Próximos compromissos
- Resumo semanal


## 📅 Calendário Interativo

- Calendário utilizando **FullCalendar 6.1.18**
- Visualização mensal
- Criação de eventos
- Edição de compromissos
- Exclusão de eventos
- Organização por datas


## 🚗 Gerenciamento de Visitas

Cadastro de visitas técnicas contendo:

- Sistema atendido
- Tipo de visita:
  - Atualização
  - Treinamento
  - Suporte
  - Implantação

- Responsável técnico
- Local da visita


## 🎓 Gerenciamento de Treinamentos

Registro de treinamentos:

### Sistemas

- SISREG
- e-SUS
- HYGIA
- AGHU

### Temas

- Funcionalidades
- Relatórios
- Integrações

### Público-alvo

- ACS
- Enfermeiros
- Médicos
- Recepção

### Informações adicionais

- Quantidade de participantes
- Unidade
- Data e horário


## 📋 Gerenciamento de Demandas

Controle de solicitações:

- Sistema relacionado
- Prioridade:

🟢 Baixa  
🟡 Média  
🟠 Alta  
🔴 Crítica  

- Descrição da demanda


## ❌ Cancelamento de Compromissos

Registro de:

- Motivo do cancelamento:

  - Unidade cancelou
  - Mudança de agenda
  - Veículo indisponível
  - Chuva

- Observações adicionais

---

# 🛠️ Tecnologias Utilizadas

| Tecnologia | Utilização |
|---|---|
| HTML5 | Estrutura da aplicação |
| CSS3 | Layout, Grid, Flexbox e animações |
| JavaScript Vanilla | Desenvolvimento da lógica |
| FullCalendar 6.1.18 | Calendário interativo |
| LocalStorage | Armazenamento dos dados |

---

# 🏥 Municípios e Unidades Pré-configuradas

## Governador Valadares

- ESF Jardim Pérola I
- ESF Jardim Pérola IV
- CAPS II
- UPA


## Divinópolis

- ESF Centro
- ESF Vila Operária
- UPA Central


## Belo Horizonte

- ESF Saúde
- CAPS III
- Policlínica

---

# 🚀 Como Utilizar

## 1. Baixar o projeto

```bash
git clone https://github.com/Thales2323/Agenda-flow.git
```

## 2. Abrir a aplicação

Acesse a pasta do projeto:

```bash
cd Agenda-flow
```

Abra o arquivo:

```
index.html
```

em qualquer navegador moderno.

---

# 📂 Estrutura do Projeto

```
Agenda-flow/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   └── script.js
│
├── assets/
│   └── imagens/
│
└── README.md
```

---

# 💾 Armazenamento de Dados

O sistema utiliza **LocalStorage** para salvar as informações.

Benefícios:

✅ Salvamento automático  
✅ Funcionamento offline  
✅ Não necessita banco de dados  
✅ Não necessita servidor  


Observação:

⚠️ Os dados podem ser perdidos caso o armazenamento do navegador seja apagado.

---

# 📱 Compatibilidade

Compatível com:

✅ Google Chrome  
✅ Microsoft Edge  
✅ Firefox  
✅ Safari  
✅ Opera  


---

# 🎨 Design

Características:

- Interface moderna
- Layout responsivo
- Cards com gradientes
- Animações suaves
- Experiência otimizada para:

  - Desktop
  - Tablet
  - Mobile


Paleta de cores:

🔵 Azul: `#0057b8`  
🟢 Verde: `#1fc24d`

---

# 🔒 Segurança

- Aplicação executada localmente
- Sem conexão com servidores externos
- Dados armazenados somente no navegador

---

# 🐛 Solução de Problemas

## Calendário não aparece

Verifique:

- Conexão com internet para carregar o FullCalendar
- Cache do navegador
- Atualização da página


## Dados não salvam

Verifique:

- LocalStorage habilitado
- Espaço disponível no navegador
- Teste outro navegador


## Eventos não aparecem

Confirme:

- Município selecionado
- Unidade selecionada
- Dados preenchidos corretamente

---

# 📦 Próximas Melhorias

- [ ] Sistema de login
- [ ] Controle de usuários
- [ ] Banco de dados online
- [ ] Sincronização em nuvem
- [ ] Exportação Excel
- [ ] Relatórios PDF
- [ ] Notificações automáticas
- [ ] Controle de equipes técnicas


---

# 📝 Licença

Projeto desenvolvido para gerenciamento de agenda técnica em instituições de saúde.

---

# 👨‍💻 Desenvolvedor

Desenvolvido por **Thales Marques Quintela (Thales2323)**

💻 Técnico em Informática | Analista de Sistemas

Responsável pelo desenvolvimento do **Agenda Flow**, incluindo arquitetura, interface, funcionalidades e implementação do sistema.

GitHub:
https://github.com/Thales2323

Projeto:
https://github.com/Thales2323/Agenda-flow


---

# 🤝 Contribuições

Sugestões, melhorias e correções são bem-vindas.

Abra uma Issue ou envie um Pull Request.


⭐ Se este projeto foi útil, deixe uma estrela no repositório!


---

**Versão:** 1.0.0  
**Última atualização:** 2026-07-09
