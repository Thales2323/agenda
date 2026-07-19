# 📅 Agenda VIVVER

```{=html}
<p align="center">
```
Sistema web para gerenciamento de agendas técnicas, visitas,
treinamentos e demandas na área da saúde.
```{=html}
</p>
```
```{=html}
<p align="center">
```
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-blue)
![Version](https://img.shields.io/badge/version-2.0.0-green)
![License](https://img.shields.io/badge/license-MIT-orange)

```{=html}
</p>
```

------------------------------------------------------------------------

# 📌 Sobre

O **Agenda Flow** é uma aplicação web desenvolvida para organizar
agendas técnicas de equipes da saúde utilizando um calendário
interativo, dashboard operacional e armazenamento local.

## ✨ Funcionalidades

-   📅 Calendário FullCalendar (Mês, Semana e Dia)
-   ➕ Cadastro completo de compromissos
-   ✏️ Edição de eventos
-   📄 Duplicação de compromissos
-   ❌ Cancelamento com registro do responsável
-   🗑️ Exclusão protegida por senha administrativa
-   🔎 Pesquisa em tempo real
-   🏷️ Filtros por categoria
-   📊 Dashboard com indicadores
-   📄 Relatório mensal para impressão
-   💾 Persistência automática via LocalStorage
-   🖱️ Arrastar e redimensionar eventos

## 📋 Dados cadastrados

Cada compromisso possui:

-   Título
-   Agente (Vivver)
-   Solicitante
-   Cargo do solicitante
-   Unidade de Saúde
-   Data e horário
-   Tipo
-   Status
-   Observações

## 📊 Dashboard

-   Total de treinamentos
-   Total de visitas
-   Total de demandas
-   Total de cancelamentos
-   Próximos compromissos
-   Resumo operacional

## ⚡ Menu de contexto

Clique com o botão direito sobre um evento para:

-   Editar
-   Duplicar
-   Cancelar
-   Excluir

## 📄 Relatórios

-   Relatório operacional mensal
-   Impressão otimizada
-   Lista completa das atividades
-   Indicadores automáticos

## 🔐 Segurança

-   Exclusão protegida por senha
-   Registro do responsável pela edição
-   Registro do responsável pelo cancelamento

## 🛠️ Tecnologias

  Tecnologia            Uso
  --------------------- -------------------
  HTML5                 Estrutura
  CSS3                  Interface
  JavaScript ES6        Regras de negócio
  FullCalendar 6.1.18   Calendário
  LocalStorage          Persistência

## 📂 Estrutura

``` text
Agenda-flow/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
```

## 🚀 Como executar

``` bash
git clone https://github.com/Thales2323/Agenda-flow.git
cd Agenda-flow
```

Abra `index.html` em qualquer navegador moderno.

## 📱 Compatibilidade

-   Chrome
-   Edge
-   Firefox
-   Opera
-   Safari

## 🛣️ Roadmap

-   [ ] Login
-   [ ] Banco de dados
-   [ ] API REST
-   [ ] Exportação PDF
-   [ ] Exportação Excel
-   [ ] Notificações
-   [ ] Controle de usuários
-   [ ] Backup automático
-   [ ] Sincronização em nuvem

## 👨‍💻 Desenvolvedor

**Thales Marques Quintela (Thales2323)**

Técnico em Informática • Analista de Sistemas

GitHub: https://github.com/Thales2323

Projeto: https://github.com/Thales2323/Agenda-flow

------------------------------------------------------------------------

⭐ Se este projeto foi útil, deixe uma estrela no repositório.