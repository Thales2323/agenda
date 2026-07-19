# 📅 Agenda VIVVER

<p align="center">

**Sistema web para gerenciamento de agendas técnicas, visitas institucionais, treinamentos e demandas operacionais na área da saúde.**

Desenvolvido para apoiar equipes técnicas na organização, acompanhamento e controle das atividades realizadas junto às unidades de saúde do município.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-blue)
![Version](https://img.shields.io/badge/version-2.0.0-green)
![License](https://img.shields.io/badge/license-MIT-orange)

</p>

---

# 📌 Sobre

O **Agenda VIVVER** é uma aplicação web desenvolvida para centralizar o gerenciamento das agendas das equipes técnicas da VIVVER, proporcionando maior organização, rastreabilidade e eficiência no planejamento de visitas, treinamentos e atendimentos às unidades de saúde.

O sistema utiliza uma interface intuitiva baseada em calendário interativo, permitindo o acompanhamento das atividades em diferentes visualizações (mês, semana e dia), além de oferecer indicadores operacionais e geração de relatórios.

---

# ✨ Principais Funcionalidades

- 📅 Calendário interativo (FullCalendar)
- ➕ Cadastro completo de compromissos
- ✏️ Edição de eventos
- 📄 Duplicação de compromissos
- ❌ Cancelamento com registro do responsável
- 🗑️ Exclusão protegida por senha administrativa
- 🔎 Pesquisa em tempo real
- 🏷️ Filtros por categoria e status
- 📊 Dashboard com indicadores operacionais
- 📄 Relatórios mensais para impressão
- 💾 Persistência automática utilizando LocalStorage
- 🖱️ Arrastar e redimensionar compromissos
- 📌 Controle de histórico das atividades

---

# 📋 Informações Registradas

Cada compromisso possui:

- Título
- Agente responsável (Vivver)
- Solicitante
- Cargo do solicitante
- Unidade de Saúde
- Data
- Horário
- Tipo de atividade
- Status
- Observações
- Responsável pela edição
- Responsável pelo cancelamento

---

# 🏥 Cobertura das Unidades de Saúde

O sistema possui um cadastro pré-configurado das principais unidades de saúde do município de **Governador Valadares/MG**, agilizando o agendamento e padronizando o registro das atividades.

## Estratégias Saúde da Família (ESF)

- ESF Altinópolis
- ESF Atalaia
- ESF Azteca
- ESF Carapina
- ESF Caravelas
- ESF Centro
- ESF Conquista
- ESF Esperança
- ESF Fraternidade
- ESF Jardim Pérola
- ESF JK
- ESF Lourdes
- ESF Maria Eugênia
- ESF Mãe de Deus
- ESF Nossa Senhora das Graças
- ESF Palmeiras
- ESF Penha
- ESF Planalto
- ESF Santa Rita
- ESF São Cristóvão
- ESF São Pedro
- ESF Sir
- ESF Turmalina
- ESF Vila Bretas
- ESF Vila Isa
- ESF Vila Mariana

## Centros Especializados

- CAPS II
- CAPS AD III
- CAPS Infantojuvenil

## Hospitais

- Hospital Municipal de Governador Valadares
- Hospital Bom Samaritano

> **Obs.:** Novas unidades poderão ser adicionadas conforme a necessidade da implantação do sistema.

---

# 📊 Dashboard

O painel operacional apresenta indicadores em tempo real:

- 📚 Total de treinamentos
- 🚗 Total de visitas técnicas
- 📋 Total de demandas
- ❌ Total de cancelamentos
- 📅 Próximos compromissos
- 📈 Resumo operacional
- 📊 Estatísticas por categoria

---

# 🖱️ Menu de Contexto

Ao clicar com o botão direito sobre um compromisso é possível:

- ✏️ Editar
- 📄 Duplicar
- ❌ Cancelar
- 🗑️ Excluir

---

# 📄 Relatórios

O sistema gera relatórios mensais contendo:

- Relação completa dos compromissos
- Indicadores automáticos
- Resumo operacional
- Impressão otimizada

---

# 🔐 Segurança

- Exclusão protegida por senha administrativa
- Registro do responsável por alterações
- Registro do responsável pelo cancelamento
- Persistência automática dos dados utilizando LocalStorage

---

# 🛠️ Tecnologias Utilizadas

| Tecnologia | Finalidade |
|------------|------------|
| HTML5 | Estrutura da aplicação |
| CSS3 | Interface responsiva |
| JavaScript ES6 | Regras de negócio |
| FullCalendar 6.1.18 | Calendário interativo |
| LocalStorage | Persistência local dos dados |

---

# 🏗️ Arquitetura

```text
Usuário
   │
   ▼
Interface (HTML/CSS)
   │
   ▼
JavaScript
   │
   ├── FullCalendar
   ├── Dashboard
   ├── Relatórios
   ├── LocalStorage
   └── Gerenciamento de Eventos
```

---

# 📂 Estrutura do Projeto

```text
Agenda-flow/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
```

---

# 🚀 Como Executar

```bash
git clone https://github.com/Thales2323/Agenda-flow.git

cd Agenda-flow
```

Abra o arquivo **index.html** em qualquer navegador moderno.

---

# 🌐 Compatibilidade

- ✅ Google Chrome
- ✅ Microsoft Edge
- ✅ Mozilla Firefox
- ✅ Opera
- ✅ Safari

---

# 🛣️ Roadmap

- [ ] Sistema de Login
- [ ] Banco de Dados
- [ ] API REST
- [ ] Exportação para PDF
- [ ] Exportação para Excel
- [ ] Controle de Usuários
- [ ] Notificações
- [ ] Backup Automático
- [ ] Sincronização em Nuvem
- [ ] Aplicação PWA
- [ ] Integração com Google Agenda

---

# 👨‍💻 Desenvolvedor

**Thales Marques Quintela**

💼 Técnico em Informática • Analista de Sistemas

GitHub: https://github.com/Thales2323

Repositório: https://github.com/Thales2323/Agenda-flow

---

⭐ Se este projeto foi útil para você, considere deixar uma **⭐ Star** no repositório.
