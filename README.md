# 📅 Agenda VIVVER

<p align="center">

**Sistema web para gerenciamento de agendas técnicas, visitas institucionais, treinamentos e demandas operacionais na área da saúde.**

Desenvolvido para apoiar equipes técnicas na organização, acompanhamento e controle das atividades realizadas junto às unidades de saúde do município.

![Status](https://img.shields.io/badge/status-em%20produ%C3%A7%C3%A3o-brightgreen)
![Version](https://img.shields.io/badge/version-2.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-orange)
![Backend](https://img.shields.io/badge/backend-Supabase-3ECF8E)

</p>

**🔗 Acesse em produção:** [agenda-nu-rosy.vercel.app](https://agenda-nu-rosy.vercel.app)

---

## 📌 Sobre

O **Agenda VIVVER** é uma aplicação web desenvolvida para centralizar o gerenciamento das agendas das equipes técnicas da VIVVER, proporcionando maior organização, rastreabilidade e eficiência.

O sistema utiliza uma interface intuitiva baseada em calendário interativo, com controle de acesso por login, diferentes níveis de permissão, indicadores operacionais em tempo real e geração de relatórios para análise e planejamento.

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
- 📊 **Dashboard com 6 indicadores operacionais** (Treinamentos, Visitas, Demandas, Não Compareceu, Cancelados e Relatório)
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
- Status (Aguardando Confirmação, Confirmado, Remarcado, Não Compareceu, Realizado)
- Observações
- Responsável pela criação, pela edição e pelo cancelamento
- Quantidade de participantes (quando aplicável)
- Motivo de falta (quando cancelado)

---

## 🏥 Cobertura das Unidades de Saúde

O sistema possui um cadastro pré-configurado das principais unidades de saúde do município de **Governador Valadares/MG**, agilizando o agendamento e padronizando o registro das atividades.

<details>
<summary><strong>Ver lista completa de unidades</strong></summary>

**Estratégias Saúde da Família (ESF)**
- ESF Altinópolis, ESF Atalaia, ESF Azteca, ESF Carapina, ESF Caravelas, ESF Centro, ESF Conquista, ESF Esperança, ESF Fraternidade, ESF Jardim Pérola, ESF JK, ESF Lourdes, ESF Maria Eugênia, ESF Mariana, ESF Menezes, ESF Milionários, ESF Nova Esperança, ESF Palmital, ESF Paraíso, ESF Perobal, ESF Planalto, ESF Recanto Verde, ESF Santa Rita, ESF Santo Antônio, ESF São Bento, ESF Taquara, ESF Toledos, ESF Viamão

**Centros Especializados**
- CAPS II, CAPS AD III, CAPS Infantojuvenil

**Hospitais**
- Hospital Municipal de Governador Valadares, Hospital Bom Samaritano

> **Obs.:** Novas unidades podem ser adicionadas conforme a necessidade.
</details>

---

## 📊 Dashboard

O painel operacional apresenta **6 indicadores** em tempo real:

- 🎓 **Treinamentos**: Total de treinamentos agendados
- 🚗 **Visitas**: Total de visitas técnicas realizadas
- 📋 **Demandas**: Total de demandas operacionais
- 🔴 **Não Compareceu**: Total de faltas ou não comparecimentos
- ❌ **Cancelados**: Total de compromissos cancelados
- 📊 **Relatório**: Acesso rápido para gerar relatórios mensais

---

## 🖱️ Menu de Contexto

Ao clicar com o botão direito sobre um compromisso é possível:

- ✏️ Editar
- 📄 Duplicar
- ✅ Concluir
- ❌ Cancelar
- 🗑️ Apagar *(exclusivo para Admin)*

---

## 📄 Relatórios

O sistema gera relatórios mensais contendo:

- Relação completa dos compromissos com filtro por mês
- **6 indicadores automáticos** (Treinamentos, Visitas, Demandas, Cancelados, Não Compareceu, Participantes)
- Resumo operacional detalhado
- Impressão otimizada para papel A4
- Dados atualizados em tempo real

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Finalidade |
|---|---|
| HTML5 | Estrutura da aplicação |
| CSS3 | Interface responsiva com Grid 6 colunas |
| JavaScript ES6 | Regras de negócio e interatividade |
| FullCalendar 6.1.18 | Calendário interativo avançado |
| [Supabase](https://supabase.com) | Banco de dados e persistência em nuvem |
| [Vercel](https://vercel.com) | Hospedagem e deploy contínuo |

---

## 🏗️ Arquitetura

```text
Usuário (navegador)
   │
   ▼
Interface (HTML/CSS/JavaScript)
   │
   ├── Calendário (FullCalendar 6.1.18)
   ├── Dashboard com 6 Indicadores
   ├── Relatórios Mensais
   ├── Painel de Administração
   └── Supabase (usuários e compromissos, em nuvem)
```

---

## 📂 Estrutura do Projeto

```text
agenda/
├── index.html          (Estrutura e modais)
├── style.css           (Design com Grid 6 colunas)
├── script.js           (Lógica e integração Supabase)
└── README.md           (Este arquivo)
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

- ✅ Google Chrome (recomendado)
- ✅ Microsoft Edge
- ✅ Mozilla Firefox
- ✅ Opera
- ✅ Safari

---

## 📱 Responsividade

- **Desktop (1300px+)**: 6 colunas no dashboard
- **Tablet (1025px - 1024px)**: 3 colunas no dashboard
- **Celular (até 640px)**: 2 colunas no dashboard

---

## 🛣️ Roadmap

- [x] Sistema de Login
- [x] Banco de Dados em nuvem (Supabase)
- [x] Controle de Usuários e permissões
- [x] Dashboard com 6 indicadores (v2.2)
- [x] Menu de contexto aprimorado (Editar, Duplicar, Concluir, Cancelar, Apagar)
- [x] Status "Não Compareceu" e "Realizado"
- [x] Registro de participantes
- [x] Motivo de falta
- [ ] Autenticação com hash de senha (Supabase Auth)
- [ ] Notificações por email
- [ ] Exportação para PDF
- [ ] Exportação para Excel
- [ ] Sincronização em tempo real (Supabase Realtime)
- [ ] Aplicação PWA
- [ ] Integração com Google Agenda

---

## 📈 Histórico de Versões

### v2.2.0 (Atual)
- ✨ Dashboard expandido para 6 colunas (novo card de Não Compareceu)
- 🎨 Estilos responsivos melhorados
- 🔧 Bugfix em deploy e validação

### v2.1
- Versão inicial em produção
- Sistema funcional com 5 indicadores
- Login, calendário e relatórios operacionais

---

## 👨‍💻 Desenvolvedor

**Thales Marques Quintela**

💼 Técnico em Informática • Analista de Sistemas

GitHub: [github.com/Thales2323](https://github.com/Thales2323)

Repositório: [github.com/Thales2323/agenda](https://github.com/Thales2323/agenda)

Email/Suporte: Para dúvidas ou contribuições, abra uma [issue no repositório](https://github.com/Thales2323/agenda/issues)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja mais detalhes nos termos de uso.

---

⭐ Se este projeto foi útil para você, considere deixar uma **⭐ Star** no repositório.
