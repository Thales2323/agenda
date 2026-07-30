# 📅 Agenda VIVVER

<p align="center">

**Sistema web para gerenciamento de agendas técnicas, visitas institucionais, treinamentos e demandas operacionais na área da saúde.**

Desenvolvido para apoiar equipes técnicas na organização, acompanhamento e controle das atividades realizadas junto às unidades de saúde do município.

![Status](https://img.shields.io/badge/status-em%20produ%C3%A7%C3%A3o-brightgreen)
![Version](https://img.shields.io/badge/version-3.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-orange)
![Backend](https://img.shields.io/badge/backend-Supabase-3ECF8E)

</p>

**🔗 Acesse em produção:** [agenda-nu-rosy.vercel.app](https://agenda-nu-rosy.vercel.app)

---

## 📌 Sobre

O **Agenda VIVVER** é uma aplicação web desenvolvida para centralizar o gerenciamento das agendas das equipes técnicas da VIVVER, proporcionando maior organização, rastreabilidade e eficiência no planejamento de visitas, treinamentos e atendimentos às unidades de saúde.

O sistema utiliza uma interface intuitiva baseada em calendário interativo, com controle de acesso por login, diferentes níveis de permissão, indicadores operacionais em tempo real e geração de relatórios mensais.

---

## ✨ Principais Funcionalidades

- 🔐 Login com controle de acesso por usuário
- 👥 Três níveis de permissão: **Admin**, **Usuário** e **Visualização**
- ⚙️ Painel de Administração (criar, editar e remover usuários)
- 📅 Calendário interativo (FullCalendar), com visão de mês, semana e dia
- ➕ Cadastro completo de compromissos
- ✏️ Edição de eventos, com registro de quem editou
- 📄 Duplicação de compromissos
- ❌ Cancelamento com registro do responsável
- 🗑️ Exclusão restrita a administradores, protegida por senha adicional
- 🔎 Pesquisa em tempo real
- 🏷️ Filtros por categoria e status
- 📊 Dashboard com indicadores operacionais
- 📄 Relatórios mensais para impressão
- 🖱️ Arrastar e redimensionar compromissos no calendário
- ☁️ Dados centralizados e sincronizados em nuvem (Supabase) — todo mundo vê a mesma agenda em tempo real

---

## 🔐 Níveis de Acesso

| Papel | O que pode fazer |
|---|---|
| **Admin** | Acesso total: cria, edita, cancela e **apaga** compromissos; gerencia usuários no Painel de Administração |
| **Usuário** | Cria, edita, duplica e cancela compromissos; não pode apagar registros nem acessar o painel de administração |
| **Visualização** | Apenas visualiza o calendário, os indicadores e gera/imprime relatórios — não pode criar ou alterar nada |

---

## 📋 Informações Registradas

Cada compromisso possui:

- Título
- Agente responsável (Vivver) — preenchido automaticamente com o usuário logado
- Solicitante e cargo do solicitante
- Unidade de Saúde
- Data e horário
- Tipo de atividade (Treinamento, Visita, Demanda, Cancelado)
- Status (Aguardando Confirmação, Confirmado, Remarcado, Não Compareceu)
- Observações
- Responsável pela criação, pela edição e pelo cancelamento

---

## 🏥 Cobertura das Unidades de Saúde

O sistema possui um cadastro pré-configurado das principais unidades de saúde do município de **Governador Valadares/MG**, agilizando o agendamento e padronizando o registro das atividades.

<details>
<summary><strong>Ver lista completa de unidades</strong></summary>

**Estratégias Saúde da Família (ESF)**
- ESF Altinópolis, ESF Atalaia, ESF Azteca, ESF Carapina, ESF Caravelas, ESF Centro, ESF Conquista, ESF Esperança, ESF Fraternidade, ESF Jardim Pérola, ESF JK, ESF Lourdes, ESF Maria Eugênia, ESF Mãe de Deus, ESF Nossa Senhora das Graças, ESF Palmeiras, ESF Penha, ESF Planalto, ESF Santa Rita, ESF São Cristóvão, ESF São Pedro, ESF Sir, ESF Turmalina, ESF Vila Bretas, ESF Vila Isa, ESF Vila Mariana

**Centros Especializados**
- CAPS II, CAPS AD III, CAPS Infantojuvenil

**Hospitais**
- Hospital Municipal de Governador Valadares, Hospital Bom Samaritano

> **Obs.:** Novas unidades podem ser adicionadas conforme a necessidade.
</details>

---

## 📊 Dashboard

O painel operacional apresenta indicadores em tempo real:

- 🎓 Total de treinamentos
- 🚗 Total de visitas técnicas
- 📋 Total de demandas
- ❌ Total de cancelamentos
- 📅 Próximos compromissos da semana
- 💡 Resumo operacional

---

## 🖱️ Menu de Contexto

Ao clicar com o botão direito sobre um compromisso é possível:

- ✏️ Editar
- 📄 Duplicar
- ❌ Cancelar
- 🗑️ Apagar *(exclusivo para Admin)*

---

## 📄 Relatórios

O sistema gera relatórios mensais contendo:

- Relação completa dos compromissos
- Indicadores automáticos
- Resumo operacional
- Impressão otimizada

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Finalidade |
|---|---|
| HTML5 | Estrutura da aplicação |
| CSS3 | Interface responsiva |
| JavaScript ES6 | Regras de negócio |
| FullCalendar 6.1.18 | Calendário interativo |
| [Supabase](https://supabase.com) | Banco de dados e persistência em nuvem |
| [Vercel](https://vercel.com) | Hospedagem e deploy contínuo |

---

## 🏗️ Arquitetura

```text
Usuário (navegador)
   │
   ▼
Interface (HTML/CSS)
   │
   ▼
JavaScript (script.js)
   │
   ├── FullCalendar (calendário)
   ├── Dashboard e Relatórios
   ├── Painel de Administração
   └── Supabase (usuários e compromissos, em nuvem)
```

---

## 📂 Estrutura do Projeto

```text
agenda/
├── index.html
├── style.css
├── script.js
└── README.md
```

---

## 🚀 Como Executar Localmente

```bash
git clone https://github.com/Thales2323/agenda.git
cd agenda
```

Abra o arquivo **index.html** em qualquer navegador moderno. As credenciais de acesso ao Supabase já estão configuradas no `script.js`.

---

## 🌐 Compatibilidade

- ✅ Google Chrome
- ✅ Microsoft Edge
- ✅ Mozilla Firefox
- ✅ Opera
- ✅ Safari

---

## 🛣️ Roadmap

- [x] Sistema de Login
- [x] Banco de Dados em nuvem (Supabase)
- [x] Controle de Usuários e permissões
- [ ] Autenticação com hash de senha (Supabase Auth)
- [ ] Notificações
- [ ] Exportação para PDF
- [ ] Exportação para Excel
- [ ] Sincronização em tempo real (realtime) entre usuários
- [ ] Aplicação PWA
- [ ] Integração com Google Agenda

---

## 👨‍💻 Desenvolvedor

**Thales Marques Quintela**

💼 Técnico em Informática • Analista de Sistemas

GitHub: [github.com/Thales2323](https://github.com/Thales2323)

Repositório: [github.com/Thales2323/agenda](https://github.com/Thales2323/agenda)

---

⭐ Se este projeto foi útil para você, considere deixar uma **⭐ Star** no repositório.
