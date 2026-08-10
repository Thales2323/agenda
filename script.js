document.addEventListener('DOMContentLoaded', async function() {

// ==========================
// CONEXÃO COM O SUPABASE
// ==========================
const SUPABASE_URL = 'https://pjzjlckhwjgdibhhlffj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5kP1SdaVUZTph0xdSgK-Ug_egN_B0T4';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================
// LOGIN
// ==========================
// OBS: quem está logado no NAVEGADOR continua guardado no localStorage
// (é só a sessão local desta aba/computador). Usuários e compromissos
// agora vivem no Supabase, compartilhados entre todo mundo.
let usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

// Mesmo com sessão salva no navegador, sempre revalida no Supabase
// (garante que o usuário ainda existe e pega o "role" mais atual —
// se a senha/usuário foi apagado ou alterado no banco, derruba a sessão local).
if (usuarioLogado) {
    const { data: usuarioAtual, error: erroRevalidacao } = await supabaseClient
        .from('usuarios')
        .select('usuario, role')
        .eq('usuario', usuarioLogado.usuario)
        .maybeSingle();

    if (erroRevalidacao || !usuarioAtual) {
        localStorage.removeItem("usuarioLogado");
        usuarioLogado = null;
    } else {
        usuarioLogado = usuarioAtual;
        localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
    }
}

const somenteVisualizacao = !!(usuarioLogado && usuarioLogado.role === "visualizador");
const isAdmin = !!(usuarioLogado && usuarioLogado.role === "admin");

// =========================================================================
// SISTEMA DE NOTIFICAÇÕES (TOASTS) — usado no lugar dos alert() de erro
// =========================================================================
const iconesToast = { erro: '⚠️', sucesso: '✅', aviso: '🚫' };

function mostrarToast(mensagem, tipo = 'erro') {
    const container = document.getElementById('toastContainer');
    if (!container) { alert(mensagem); return; } // rede de segurança, caso o container não exista

    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `
        <span class="toast-icone">${iconesToast[tipo] || 'ℹ️'}</span>
        <span>${mensagem}</span>
        <button class="toast-fechar" aria-label="Fechar">&times;</button>
    `;

    function remover() {
        toast.classList.add('toast-saindo');
        setTimeout(() => toast.remove(), 200);
    }

    toast.querySelector('.toast-fechar').addEventListener('click', remover);
    container.appendChild(toast);
    setTimeout(remover, 6000);
}

// Toast com um botão de ação extra (ex: "Desfazer"), some sozinho em 6s
// se ninguém clicar — depois disso, a ação não pode mais ser desfeita.
function mostrarToastAcao(mensagem, textoAcao, aoClicarAcao) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast toast-aviso';
    toast.innerHTML = `
        <span class="toast-icone">🗑️</span>
        <span>${mensagem}</span>
        <button class="toast-acao">${textoAcao}</button>
        <button class="toast-fechar" aria-label="Fechar">&times;</button>
    `;

    function remover() {
        toast.classList.add('toast-saindo');
        setTimeout(() => toast.remove(), 200);
    }

    const timeoutSumir = setTimeout(remover, 6000);

    toast.querySelector('.toast-acao').addEventListener('click', function() {
        clearTimeout(timeoutSumir);
        remover();
        aoClicarAcao();
    });
    toast.querySelector('.toast-fechar').addEventListener('click', function() {
        clearTimeout(timeoutSumir);
        remover();
    });

    container.appendChild(toast);
}

// Garante que apertar Enter salva o formulário (dispara o "submit"),
// exceto dentro de <textarea>, onde o Enter deve continuar pulando linha.
function habilitarEnterParaSalvar(form) {
    if (!form) return;
    form.addEventListener('keydown', function(e) {
        if (e.key !== 'Enter') return;
        if (e.target.tagName === 'TEXTAREA') return; // deixa quebrar linha normalmente
        if (e.target.tagName === 'BUTTON') return; // já ativa o próprio botão

        e.preventDefault();
        if (typeof form.requestSubmit === 'function') {
            form.requestSubmit();
        } else {
            form.dispatchEvent(new Event('submit', { cancelable: true }));
        }
    });
}

    const telaLogin = document.getElementById("loginTela");
    const sistema = document.getElementById("sistema");

    if(usuarioLogado){

        telaLogin.style.display="none";
        sistema.style.display="block";

    }else{

        telaLogin.style.display="flex";
        sistema.style.display="none";

    }

    // Esconde a tela de carregamento inicial assim que já sabemos pra onde ir
    const telaCarregandoEl = document.getElementById('telaCarregando');
    if (telaCarregandoEl) {
        telaCarregandoEl.classList.add('escondida');
        setTimeout(() => telaCarregandoEl.remove(), 300);
    }

    // =========================================================================
    // MODO ESCURO (lembrado no navegador, não é dado do sistema)
    // =========================================================================
    const btnTema = document.getElementById('btnTema');
    function aplicarTema(tema) {
        document.documentElement.setAttribute('data-tema', tema);
        if (btnTema) btnTema.innerText = tema === 'escuro' ? '☀️' : '🌙';
    }
    aplicarTema(localStorage.getItem('temaAgenda') || 'claro');
    if (btnTema) {
        btnTema.addEventListener('click', function() {
            const temaAtual = document.documentElement.getAttribute('data-tema') === 'escuro' ? 'claro' : 'escuro';
            localStorage.setItem('temaAgenda', temaAtual);
            aplicarTema(temaAtual);
        });
    }

    // Gera uma cor consistente a partir do nome, pra usar em avatares de iniciais
    function corAPartirDoNome(nome) {
        const paleta = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];
        let soma = 0;
        for (let i = 0; i < (nome || '').length; i++) soma += nome.charCodeAt(i);
        return paleta[soma % paleta.length];
    }

    function avatarIniciais(nome) {
        if (!nome) return '';
        const iniciais = nome.trim().slice(0, 2).toUpperCase();
        return `<span class="avatar-iniciais" style="background:${corAPartirDoNome(nome)};">${iniciais}</span>`;
    }

    // =========================================================================
    // 0. CONVERSÕES ENTRE O FORMATO DO BANCO (SUPABASE) E O FORMATO DO APP
    // =========================================================================

    // A cor do compromisso combina Tipo + Status:
    // - Cancelado sempre vence (vermelho), não importa o status
    // - "Não Compareceu" e "Realizado" (Concluir) sobrepõem a cor do Tipo,
    //   funcionando como um alerta/confirmação visual rápido
    // - Fora esses casos, a cor normal é a do Tipo
    function classePorCompromisso(tipo, status) {
        if (tipo === 'Cancelado' || tipo === 'Cancelamento') return 'evento-cancelado';
        if (status === 'Não Compareceu') return 'evento-nao-compareceu';
        if (status === 'Realizado') return 'evento-concluido';
        if (tipo === 'Treinamento') return 'evento-treinamento';
        if (tipo === 'Visita') return 'evento-visita';
        if (tipo === 'Demanda') return 'evento-demanda';
        return 'evento-padrao';
    }

    function linhaParaCompromisso(row) {
        return {
            id: row.id,
            title: row.title,
            start: row.start,
            end: row.end || undefined,
            tipo: row.tipo,
            className: classePorCompromisso(row.tipo, row.status),
            descricao: row.descricao || '',
            agente: row.agente || '',
            solicitante: row.solicitante || '',
            cargoSolicitante: row.cargo_solicitante || '',
            unidade: row.unidade || '',
            status: row.status || '',
            criadoPor: row.criado_por || '',
            editadoPor: row.editado_por || '',
            canceladoPor: row.cancelado_por || '',
            motivoFalta: row.motivo_falta || '',
            qtdParticipantes: row.qtd_participantes ?? null
        };
    }

    function compromissoParaLinha(c) {
        return {
            id: c.id,
            title: c.title,
            start: c.start,
            end: c.end || null,
            tipo: c.tipo,
            classname: classePorCompromisso(c.tipo, c.status),
            descricao: c.descricao || '',
            agente: c.agente || '',
            solicitante: c.solicitante || '',
            cargo_solicitante: c.cargoSolicitante || '',
            unidade: c.unidade || '',
            status: c.status || '',
            criado_por: c.criadoPor || '',
            editado_por: c.editadoPor || '',
            cancelado_por: c.canceladoPor || '',
            motivo_falta: c.motivoFalta || '',
            qtd_participantes: (c.qtdParticipantes === null || c.qtdParticipantes === undefined || c.qtdParticipantes === '') ? null : c.qtdParticipantes
        };
    }

    // =========================================================================
    // 1. ESTADO GLOBAL (AGORA CARREGADO DO SUPABASE)
    // =========================================================================
    let compromissos = [];

    let modoEdicao = false;
    let idEventoSelecionado = null;
    let dataSelecionadaClique = null;
    let eventoSelecionadoParaMenu = null;
    let nomeEditorAtual = '';

    // =========================================================================
    // 2. MAPEAMENTO DE ELEMENTOS DO DOM
    // =========================================================================
    const calendarEl = document.getElementById('calendar');
    const inputBusca = document.querySelector('.busca input');
    const botoesFiltro = document.querySelectorAll('.filtro');
    const menuContexto = document.querySelector('.menu-evento');
    const btnApagarEvento = document.getElementById('btnApagar');
    const divisorApagar = document.getElementById('divisorApagar');
    if (!isAdmin) {
        if (btnApagarEvento) btnApagarEvento.style.display = 'none';
        if (divisorApagar) divisorApagar.style.display = 'none';
    }
    
    // Modais
    const modalDetalhes = document.getElementById('modalDetalhes');
    const modalCadastro = document.getElementById('modalCadastro') || document.getElementById('cadastroEvento');
    
    // Botões de fechar modais
    const btnFecharDetalhes = document.querySelector('.fechar-detalhes');
    const btnFecharCadastro = document.querySelector('.fechar-cadastro') || document.querySelector('.fechar');
    
    // Formulário de Cadastro/Edição
    const formCadastro = document.getElementById('formCadastroEvento') || document.querySelector('#modalCadastro form');
    habilitarEnterParaSalvar(formCadastro);
    const inputTitulo = document.getElementById('txtTitulo') || document.getElementById('titulo');
    const inputAgente = document.getElementById('txtAgente');
    const inputSolicitante = document.getElementById('txtSolicitante');
    const inputCargoSolicitante = document.getElementById('txtCargoSolicitante');
    const selectUnidade = document.getElementById('selUnidade');

    // =========================================================================
    // 2.1 LISTA DE MUNICÍPIOS E UNIDADES DE SAÚDE
    // =========================================================================
    const municipios = {
        "Governador Valadares": [
            "ESF Altinópolis",
            "ESF Atalaia",
            "ESF Azteca",
            "ESF Carapina",
            "ESF Caravelas",
            "ESF Centro",
            "ESF Conquista",
            "ESF Esperança",
            "ESF Fraternidade",
            "ESF Jardim Pérola",
            "ESF JK",
            "ESF Lourdes",
            "ESF Maria Eugênia",
            "ESF Mãe de Deus",
            "ESF Nossa Senhora das Graças",
            "ESF Palmeiras",
            "ESF Penha",
            "ESF Planalto",
            "ESF Santa Rita",
            "ESF São Cristóvão",
            "ESF São Pedro",
            "ESF Sir",
            "ESF Turmalina",
            "ESF Vila Bretas",
            "ESF Vila Isa",
            "ESF Vila Mariana",
            "ESF Ilha dos araujos",
            "CAPS II",
            "CAPS AD III",
            "CAPS Infantojuvenil",
            "Hospital Municipal de Governador Valadares",
            "Hospital Bom Samaritano",
            "Universidade Vale do Rio Doce 1",
            "Universidade Vale do Rio Doce 2",
        ]
    };

    function popularUnidades() {
        if (!selectUnidade) return;

        selectUnidade.innerHTML = '<option value="">Selecione a unidade...</option>';

        Object.keys(municipios).forEach(nomeMunicipio => {
            const grupo = document.createElement('optgroup');
            grupo.label = nomeMunicipio;

            municipios[nomeMunicipio].forEach(unidade => {
                const opcao = document.createElement('option');
                opcao.value = unidade;
                opcao.textContent = unidade;
                grupo.appendChild(opcao);
            });

            selectUnidade.appendChild(grupo);
        });
    }

    popularUnidades();
    const inputData = document.getElementById('txtData') || document.getElementById('data');
    const inputHoraInicio = document.getElementById('txtHoraInicio') || document.getElementById('horaInicio');
    const selectTipo = document.getElementById('selTipo') || document.getElementById('tipo');
    const selectStatus = document.getElementById('selStatus');
    const txtDescricao = document.getElementById('txtDescricao') || document.getElementById('descricao');
    const grupoMotivoFalta = document.getElementById('grupoMotivoFalta');
    const txtMotivoFalta = document.getElementById('txtMotivoFalta');
    const grupoParticipantes = document.getElementById('grupoParticipantes');
    const txtQtdParticipantes = document.getElementById('txtQtdParticipantes');

    // Mostra o campo de participantes só quando o Tipo for Treinamento
    function atualizarVisibilidadeParticipantes() {
        if (!grupoParticipantes || !selectTipo) return;
        grupoParticipantes.style.display = (selectTipo.value === 'Treinamento') ? 'flex' : 'none';
    }
    if (selectTipo) {
        selectTipo.addEventListener('change', atualizarVisibilidadeParticipantes);
    }

    // Mostra o campo de motivo só quando o status for "Faltou"
    function atualizarVisibilidadeMotivoFalta() {
        if (!grupoMotivoFalta || !selectStatus) return;
        const faltou = selectStatus.value === 'Não Compareceu';
        grupoMotivoFalta.style.display = faltou ? 'flex' : 'none';
        if (txtMotivoFalta) txtMotivoFalta.required = faltou;
    }
    if (selectStatus) {
        selectStatus.addEventListener('change', atualizarVisibilidadeMotivoFalta);
    }

    // =========================================================================
    // 3. CONFIGURAÇÃO PRINCIPAL DO FULLCALENDAR
    // =========================================================================
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        height: 'auto',
        locale: 'pt-br',
        weekends: false, // Oculta sábados e domingos
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        buttonText: {
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia'
        },
        events: [],
        editable: !somenteVisualizacao,
        selectable: !somenteVisualizacao,

        // Evita empilhar dezenas de compromissos no quadradinho do dia:
        // mostra só alguns e um link "+N mais" que abre a lista completa daquele dia
        dayMaxEvents: 3,
        moreLinkText: function(num) { return `+${num} mais`; },
        eventOrder: 'start',
        eventOrderStrict: true,

        // Clique em um dia vazio -> Abre modal de Cadastro
        select: function(info) {
            dataSelecionadaClique = info.startStr;
            abrirModalCadastro(false, null);
        },

        // Clique normal em um evento -> Abre modal de Detalhes
        eventClick: function(info) {
            abrirModalDetalhes(info.event);
        },

        // Arrastar e soltar evento -> Atualiza a data no Supabase
        eventDrop: function(info) {
            atualizarDataEvento(info.event);
        },

        // Redimensionar tempo do evento -> Atualiza no Supabase
        eventResize: function(info) {
            atualizarDataEvento(info.event);
        },

        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false
        },

        // Grava o ID real do compromisso no elemento visual, para o menu de
        // contexto (botão direito) conseguir identificar o evento certo mesmo
        // quando dois compromissos têm o mesmo título (ex: após "Duplicar")
        eventDidMount: function(info) {
            info.el.setAttribute('data-event-id', info.event.id);
        },

        // Recalcula os cards e o resumo sempre que o usuário navega
        // (mês anterior/próximo, "Hoje", ou troca de visão Mês/Semana/Dia)
        datesSet: function() {
            atualizarDashboard();
        }
    });

    calendar.render();

    // =========================================================================
    // 3.1 CARREGA OS COMPROMISSOS DO SUPABASE
    // =========================================================================
    async function carregarCompromissos() {
        const { data, error } = await supabaseClient
            .from('compromissos')
            .select('*')
            .order('start', { ascending: true });

        if (error) {
            mostrarToast('Erro ao carregar compromissos: ' + error.message, 'erro');
            return;
        }

        compromissos = (data || []).map(linhaParaCompromisso);
        calendar.removeAllEvents();
        calendar.addEventSource(compromissos);
        atualizarDashboard();
    }

    // =========================================================================
    // 4. SISTEMA DE DASHBOARD, INTEGRAÇÃO DE CARDS E LISTAS
    // =========================================================================

    // Devolve só os compromissos do mês que está sendo exibido no calendário
    // (usado tanto pelos cards do dashboard quanto pelo Relatório Mensal)
    function compromissosDoMesExibido() {
        const dataFoco = calendar.getDate();
        const anoFoco = dataFoco.getFullYear();
        const mesFoco = dataFoco.getMonth();

        return compromissos.filter(c => {
            const d = new Date(c.start);
            return d.getFullYear() === anoFoco && d.getMonth() === mesFoco;
        });
    }

    function nomeDoMesExibido() {
        return calendar.getDate().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }

    function atualizarDashboard() {
        let qtdTreinamentos = 0, qtdVisitas = 0, qtdDemandas = 0, qtdCancelados = 0;
        const listaProximosEl = document.getElementById('listaProximos');
        const conteudoResumoEl = document.getElementById('conteudoResumo');

        // Cards: só contam o que está dentro do mês exibido no calendário
        compromissosDoMesExibido().forEach(comp => {
            if (comp.tipo === 'Treinamento') qtdTreinamentos++;
            else if (comp.tipo === 'Visita') qtdVisitas++;
            else if (comp.tipo === 'Demanda') qtdDemandas++;
            else if (comp.tipo === 'Cancelado' || comp.tipo === 'Cancelamento') qtdCancelados++;
        });

        // "Próximos Compromissos da Semana": de verdade só o que vem nos próximos 7 dias,
        // independente de qual mês está sendo exibido no calendário
        if (listaProximosEl) {
            listaProximosEl.innerHTML = '';

            const agora = new Date();
            const emSeteDias = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000);

            const proximos = compromissos
                .filter(c => c.tipo !== 'Cancelado' && c.tipo !== 'Cancelamento')
                .filter(c => {
                    const d = new Date(c.start);
                    return d >= agora && d <= emSeteDias;
                })
                .sort((a, b) => new Date(a.start) - new Date(b.start));

            if (proximos.length === 0) {
                listaProximosEl.innerHTML = '<p style="color:#94a3b8; font-size:13px;">Nenhum compromisso nos próximos 7 dias.</p>';
            }

            proximos.forEach(comp => {
                const item = document.createElement('div');
                item.className = 'itemEvento';

                if (comp.tipo === 'Treinamento') item.style.borderLeftColor = '#2563eb';
                else if (comp.tipo === 'Visita') item.style.borderLeftColor = '#f59e0b';
                else if (comp.tipo === 'Demanda') item.style.borderLeftColor = '#8b5cf6';

                const dataObj = new Date(comp.start);
                const dataFormatada = dataObj.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'});
                const horaFormatada = dataObj.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});

                item.innerHTML = `
                    <h4>${comp.title}</h4>
                    <p>📅 ${dataFormatada} às ${horaFormatada} | <strong>${comp.tipo}</strong></p>
                `;

                item.addEventListener('click', () => {
                    const ev = calendar.getEventById(comp.id);
                    if (ev) abrirModalDetalhes(ev);
                });

                listaProximosEl.appendChild(item);
            });
        }

        // Injeta os valores recalculados nos Cards de Resumo
        if (document.getElementById('cardTreinamentos')) document.getElementById('cardTreinamentos').innerText = qtdTreinamentos;
        if (document.getElementById('cardVisitas')) document.getElementById('cardVisitas').innerText = qtdVisitas;
        if (document.getElementById('cardDemandas')) document.getElementById('cardDemandas').innerText = qtdDemandas;
        if (document.getElementById('cardCancelados')) document.getElementById('cardCancelados').innerText = qtdCancelados;

        // Injeta as estatísticas no Resumo Descritivo Lateral
        if (conteudoResumoEl) {
            const totalAtivos = qtdTreinamentos + qtdVisitas + qtdDemandas;
            conteudoResumoEl.innerHTML = `
                <p>Em <strong>${nomeDoMesExibido()}</strong>, você gerencia <strong>${totalAtivos}</strong> ações agendadas.</p>
                <p>Compromissos abortados/cancelados no mês: <strong>${qtdCancelados}</strong> itens.</p>
                <p style="font-size: 11px; color:#64748b; margin-top:5px;">Clique com o botão direito nos blocos do calendário para ver ações rápidas.</p>
            `;
        }
    }

    // =========================================================================
    // 5. OPERAÇÕES DE CRUD (SALVAR, CRIAR, ATUALIZAR, SOLTAR) — VIA SUPABASE
    // =========================================================================
    
    function abrirModalCadastro(editar = false, event = null) {
        modoEdicao = editar;
        const tituloModal = document.getElementById('tituloModalCadastro');
        if (tituloModal) tituloModal.innerText = editar ? 'Editar Compromisso' : 'Novo Compromisso';
        
        if (editar && event) {
            idEventoSelecionado = event.id;

            // Remove sufixos legados de "- Editado por X" / "- Cancelado por X"
            // para não deixar o título com marcações antigas ao reativar um compromisso
            const tituloLimpo = (event.title || '').split(' - Editado por')[0].split(' - Cancelado por')[0];
            if (inputTitulo) inputTitulo.value = tituloLimpo;
            
            // Separa Data e Hora no formato ISO (YYYY-MM-DD)
            const dataIso = event.startStr.split('T')[0];
            if (inputData) inputData.value = dataIso;
            
            const horaIn = event.startStr.split('T')[1] ? event.startStr.split('T')[1].substring(0,5) : '';
            if (inputHoraInicio) inputHoraInicio.value = horaIn;
            
            if (inputAgente) inputAgente.value = event.extendedProps.agente || '';
            if (inputSolicitante) inputSolicitante.value = event.extendedProps.solicitante || '';
            if (inputCargoSolicitante) inputCargoSolicitante.value = event.extendedProps.cargoSolicitante || '';
            if (selectUnidade) selectUnidade.value = event.extendedProps.unidade || '';
            if (selectTipo) selectTipo.value = event.extendedProps.tipo || 'Treinamento';
            if (selectStatus) selectStatus.value = event.extendedProps.status || 'Aguardando Confirmação';
            if (txtDescricao) txtDescricao.value = event.extendedProps.descricao || '';
            if (txtMotivoFalta) txtMotivoFalta.value = event.extendedProps.motivoFalta || '';
            if (txtQtdParticipantes) txtQtdParticipantes.value = event.extendedProps.qtdParticipantes ?? '';
        } else {
            idEventoSelecionado = null;
            if (formCadastro) formCadastro.reset();
            if (inputData && dataSelecionadaClique) inputData.value = dataSelecionadaClique;
            if (inputHoraInicio) inputHoraInicio.value = '';
            if (selectStatus) selectStatus.value = 'Aguardando Confirmação';
            if (inputAgente) inputAgente.value = usuarioLogado ? usuarioLogado.usuario : '';
            if (txtMotivoFalta) txtMotivoFalta.value = '';
            if (txtQtdParticipantes) txtQtdParticipantes.value = '';
        }

        atualizarVisibilidadeMotivoFalta();
        atualizarVisibilidadeParticipantes();
        if (modalCadastro) modalCadastro.style.display = 'flex';
    }

    if (formCadastro) {
        formCadastro.addEventListener('submit', async function(e) {
            e.preventDefault();

            const dataFormatada = inputData.value;
            const dataHoraInicio = `${dataFormatada}T${inputHoraInicio.value}:00`;

            const classeCor = classePorCompromisso(selectTipo.value, selectStatus ? selectStatus.value : '');

            const agente = inputAgente ? inputAgente.value : '';
            const solicitante = inputSolicitante ? inputSolicitante.value : '';
            const cargoSolicitante = inputCargoSolicitante ? inputCargoSolicitante.value : '';
            const unidade = selectUnidade ? selectUnidade.value : '';
            const status = selectStatus ? selectStatus.value : 'Aguardando Confirmação';
            const motivoFalta = (status === 'Não Compareceu' && txtMotivoFalta) ? txtMotivoFalta.value : '';
            const qtdParticipantes = (selectTipo.value === 'Treinamento' && txtQtdParticipantes && txtQtdParticipantes.value !== '')
                ? parseInt(txtQtdParticipantes.value, 10)
                : null;

            const btnSalvar = formCadastro.querySelector('.btn-salvar');
            if (btnSalvar) btnSalvar.disabled = true;

            if (modoEdicao && idEventoSelecionado) {
                // Modo Edição: Atualiza o registro no Supabase
                const dadosAtualizados = {
                    title: inputTitulo.value,
                    start: dataHoraInicio,
                    tipo: selectTipo.value,
                    classname: classeCor,
                    agente: agente,
                    solicitante: solicitante,
                    cargo_solicitante: cargoSolicitante,
                    unidade: unidade,
                    status: status,
                    descricao: txtDescricao.value,
                    motivo_falta: motivoFalta,
                    qtd_participantes: qtdParticipantes
                };
                if (nomeEditorAtual) dadosAtualizados.editado_por = nomeEditorAtual;
                // Se o compromisso foi reativado (tipo diferente de Cancelado), limpa quem cancelou
                if (selectTipo.value !== 'Cancelado') dadosAtualizados.cancelado_por = '';

                const { error } = await supabaseClient
                    .from('compromissos')
                    .update(dadosAtualizados)
                    .eq('id', idEventoSelecionado);

                nomeEditorAtual = '';

                if (error) {
                    mostrarToast('Erro ao salvar alterações: ' + error.message, 'erro');
                    if (btnSalvar) btnSalvar.disabled = false;
                    return;
                }
            } else {
                // Modo Criação: Insere um novo registro no Supabase
                const novoEvento = {
                    id: String(Date.now()),
                    title: inputTitulo.value,
                    start: dataHoraInicio,
                    criado_por: usuarioLogado.usuario,
                    tipo: selectTipo.value,
                    classname: classeCor,
                    agente: agente,
                    solicitante: solicitante,
                    cargo_solicitante: cargoSolicitante,
                    unidade: unidade,
                    status: status,
                    descricao: txtDescricao.value,
                    motivo_falta: motivoFalta,
                    qtd_participantes: qtdParticipantes
                };

                const { error } = await supabaseClient.from('compromissos').insert(novoEvento);

                if (error) {
                    mostrarToast('Erro ao criar compromisso: ' + error.message, 'erro');
                    if (btnSalvar) btnSalvar.disabled = false;
                    return;
                }
            }

            await carregarCompromissos();
            if (btnSalvar) btnSalvar.disabled = false;
            if (modalCadastro) modalCadastro.style.display = 'none';
        });
    }

    async function atualizarDataEvento(event) {
        // Atualiza local (visual já foi movido pelo FullCalendar) e depois persiste no Supabase
        compromissos = compromissos.map(c => {
            if (c.id === event.id) {
                return { ...c, start: event.startStr, end: event.endStr || event.startStr };
            }
            return c;
        });
        atualizarDashboard();

        const { error } = await supabaseClient
            .from('compromissos')
            .update({ start: event.startStr, end: event.endStr || event.startStr })
            .eq('id', event.id);

        if (error) {
            mostrarToast('Erro ao salvar o novo horário: ' + error.message, 'erro');
            await carregarCompromissos(); // desfaz visualmente, recarregando do banco
        }
    }

    // =========================================================================
    // 6. DETALHES, MODAL DE FECHAMENTO (O BOTÃO 'X')
    // =========================================================================
    // Mapeia cada tipo de compromisso para um ícone
    const iconesTipo = {
        'Treinamento': '🎓',
        'Visita': '🚗',
        'Demanda': '📋',
        'Cancelado': '❌'
    };

    // Mapeia cada status para uma classe de cor do selo (badge)
    const classesStatus = {
        'Aguardando Confirmação': 'badge-aguardando',
        'Confirmado': 'badge-confirmado',
        'Realizado': 'badge-realizado',
        'Remarcado': 'badge-remarcado',
        'Não Compareceu': 'badge-nao-compareceu'
    };

    function abrirModalDetalhes(event) {
        const conteudo = document.getElementById('conteudoDetalhes');
        if (modalDetalhes && conteudo) {
            const desc = event.extendedProps.descricao || 'Sem descrição cadastrada.';
            const tipo = event.extendedProps.tipo || 'Padrão';
            const agente = event.extendedProps.agente || 'Não informado';
            const solicitante = event.extendedProps.solicitante || 'Não informado';
            const cargoSolicitante = event.extendedProps.cargoSolicitante || '';
            const unidade = event.extendedProps.unidade || 'Não informado';
            const status = event.extendedProps.status || 'Não informado';
            const criadoPor = event.extendedProps.criadoPor || "";

            const icone = iconesTipo[tipo] || '📌';
            const statusExibido = tipo === 'Cancelado' ? 'Cancelado' : status;
            const classeBadge = tipo === 'Cancelado' ? 'badge-cancelado' : (classesStatus[status] || 'badge-aguardando');
            const canceladoPor = event.extendedProps.canceladoPor || '';
            const motivoFalta = event.extendedProps.motivoFalta || '';
            const qtdParticipantes = event.extendedProps.qtdParticipantes;

            const dataObj = event.start;
            const dataFormatada = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            conteudo.innerHTML = `
                <div class="detalhe-cabecalho">
                    <div class="detalhe-icone-tipo">${icone}</div>
                    <div>
                        <h3 class="detalhe-titulo">${event.title}</h3>
                        <span class="detalhe-badge ${classeBadge}">${statusExibido}</span>
                    </div>
                </div>

                <div class="detalhe-grid">
                    <div class="detalhe-item">
                        <span class="detalhe-label">📅 Data</span>
                        <span class="detalhe-valor">${dataFormatada}</span>
                    </div>
                    <div class="detalhe-item">
                        <span class="detalhe-label">🕒 Hora</span>
                        <span class="detalhe-valor">${horaFormatada}</span>
                    </div>
                    <div class="detalhe-item">
                        <span class="detalhe-label">🏷️ Categoria</span>
                        <span class="detalhe-valor">${tipo}</span>
                    </div>
                    <div class="detalhe-item">
                        <span class="detalhe-label">🏥 Unidade</span>
                        <span class="detalhe-valor">${unidade}</span>
                    </div>
                    ${tipo === 'Treinamento' && qtdParticipantes !== null && qtdParticipantes !== undefined ? `
                    <div class="detalhe-item">
                        <span class="detalhe-label">👥 Participantes</span>
                        <span class="detalhe-valor">${qtdParticipantes}</span>
                    </div>` : ''}
                </div>

                <div class="detalhe-secao">
                    <div class="detalhe-secao-titulo">👤 Responsáveis</div>
                    <div class="detalhe-item-linha">
                        <span class="detalhe-label">Agente (Vivver)</span>
                        <span class="detalhe-valor linha-com-avatar">${avatarIniciais(agente)}${agente}</span>
                    </div>
                    <div class="detalhe-item-linha">
                        <span class="detalhe-label">Solicitado por</span>
                        <span class="detalhe-valor">${solicitante}${cargoSolicitante ? ' <span class="detalhe-cargo">(' + cargoSolicitante + ')</span>' : ''}</span>
                    </div>
                    ${criadoPor ? `
                    <div class="detalhe-item-linha">
                        <span class="detalhe-label">Criado por</span>
                        <span class="detalhe-valor linha-com-avatar">${avatarIniciais(criadoPor)}${criadoPor}</span>
                    </div>` : ''}
                    ${tipo === 'Cancelado' && canceladoPor ? `
                    <div class="detalhe-item-linha">
                        <span class="detalhe-label">❌ Cancelado por</span>
                        <span class="detalhe-valor linha-com-avatar">${avatarIniciais(canceladoPor)}${canceladoPor}</span>
                    </div>` : ''}
                </div>

                ${status === 'Não Compareceu' && motivoFalta ? `
                <div class="detalhe-secao">
                    <div class="detalhe-secao-titulo">🔴 Motivo da Falta</div>
                    <p class="detalhe-obs detalhe-obs-falta">${motivoFalta}</p>
                </div>` : ''}

                <div class="detalhe-secao">
                    <div class="detalhe-secao-titulo">📝 Notas de Campo</div>
                    <p class="detalhe-obs">${desc}</p>
                </div>
            `;
            modalDetalhes.style.display = 'flex';
        }
    }

    if (btnFecharDetalhes) btnFecharDetalhes.addEventListener('click', () => modalDetalhes.style.display = 'none');
    if (btnFecharCadastro) btnFecharCadastro.addEventListener('click', () => modalCadastro.style.display = 'none');

    window.addEventListener('click', function(e) {
        if (e.target === modalDetalhes) modalDetalhes.style.display = 'none';
        if (e.target === modalCadastro) modalCadastro.style.display = 'none';
    });

    // =========================================================================
    // 7. MECANISMO DE CONTEXTMENU (BOTAO DIREITO: EDITAR, DUPLICAR, CANCELAR, APAGAR)
    // =========================================================================
    calendarEl.addEventListener('contextmenu', function(e) {
        if (somenteVisualizacao) { e.preventDefault(); return; }

        const blocoEventoVisual = e.target.closest('[data-event-id]');
        if (blocoEventoVisual && menuContexto) {
            e.preventDefault();

            // Usa o ID real do evento (gravado pelo eventDidMount) em vez de casar
            // pelo texto do título — evita pegar o compromisso errado quando dois
            // eventos têm o mesmo título (ex: logo após usar "Duplicar")
            eventoSelecionadoParaMenu = calendar.getEventById(blocoEventoVisual.dataset.eventId);

            menuContexto.style.left = e.clientX + 'px';
            menuContexto.style.top = e.clientY + 'px';
            menuContexto.style.display = 'flex';
        }
    });

    document.addEventListener('click', () => {
        if (menuContexto) menuContexto.style.display = 'none';
    });

    // ✏️ Ação: EDITAR (usa automaticamente quem está logado e abre o formulário completo, pré-preenchido)
    document.getElementById('btnEditarCompromisso').addEventListener('click', function() {
        if (eventoSelecionadoParaMenu) {
            nomeEditorAtual = usuarioLogado ? usuarioLogado.usuario : '';
            abrirModalCadastro(true, eventoSelecionadoParaMenu);
        }
    });

    // 📄 Ação: DUPLICAR (Continua livre - cria cópia exata instantaneamente)
    document.getElementById('btnDuplicarCompromisso').addEventListener('click', async function() {
        if (eventoSelecionadoParaMenu) {
            const origem = compromissos.find(c => c.id === eventoSelecionadoParaMenu.id);
            if (origem) {
                const copiaClonada = {
                    ...origem,
                    id: String(Date.now()) // Gera um novo ID único baseado no timestamp
                };

                const { error } = await supabaseClient
                    .from('compromissos')
                    .insert(compromissoParaLinha(copiaClonada));

                if (error) {
                    mostrarToast('Erro ao duplicar: ' + error.message, 'erro');
                    return;
                }
                await carregarCompromissos();
            }
        }
    });

    // ✅ Ação: CONCLUIR (marca rapidamente o status como Realizado, sem abrir o formulário inteiro)
    document.getElementById('btnConcluirCompromisso').addEventListener('click', async function() {
        if (!eventoSelecionadoParaMenu) return;

        const origem = compromissos.find(c => c.id === eventoSelecionadoParaMenu.id);
        if (!origem) return;

        if (origem.tipo === 'Cancelado') {
            mostrarToast('Não é possível concluir um compromisso já cancelado.', 'aviso');
            return;
        }

        if (!confirm(`Marcar "${origem.title}" como Realizado?`)) return;

        const { error } = await supabaseClient
            .from('compromissos')
            .update({ status: 'Realizado' })
            .eq('id', eventoSelecionadoParaMenu.id);

        if (error) {
            mostrarToast('Erro ao concluir: ' + error.message, 'erro');
            return;
        }
        await carregarCompromissos();
    });

    // ❌ Ação: CANCELAR (confirma a ação, muda status/tipo e registra automaticamente quem cancelou)
    document.getElementById('btnCancelarCompromisso').addEventListener('click', async function() {
        if (eventoSelecionadoParaMenu) {
            const origem = compromissos.find(c => c.id === eventoSelecionadoParaMenu.id);
            if (!origem) return;

            if (!confirm(`Cancelar o compromisso "${origem.title}"?`)) return;

            // Remove sufixos antigos que porventura estejam presos ao título
            const tituloLimpo = origem.title.split(" - Editado por")[0].split(" - Cancelado por")[0];

            const { error } = await supabaseClient
                .from('compromissos')
                .update({
                    tipo: 'Cancelado',
                    classname: 'evento-cancelado',
                    title: tituloLimpo,
                    cancelado_por: usuarioLogado ? usuarioLogado.usuario : ''
                })
                .eq('id', eventoSelecionadoParaMenu.id);

            if (error) {
                mostrarToast('Erro ao cancelar: ' + error.message, 'erro');
                return;
            }
            await carregarCompromissos();
        }
    });

    // 🗑️ Ação: APAGAR (só admin vê o botão; pede uma confirmação simples antes de remover)
    document.getElementById('btnApagar').addEventListener('click', async function() {
        if (!isAdmin) return;
        if (!eventoSelecionadoParaMenu) return;

        const origem = compromissos.find(c => c.id === eventoSelecionadoParaMenu.id);
        const nomeEvento = origem ? origem.title : 'este compromisso';

        if (!confirm(`🗑️ Apagar "${nomeEvento}"? Você terá alguns segundos para desfazer logo em seguida.`)) return;

        const { error } = await supabaseClient
            .from('compromissos')
            .delete()
            .eq('id', eventoSelecionadoParaMenu.id);

        if (error) {
            mostrarToast('Erro ao apagar: ' + error.message, 'erro');
            return;
        }
        await carregarCompromissos();

        if (origem) {
            mostrarToastAcao(`"${nomeEvento}" foi apagado.`, 'Desfazer', async function() {
                const { error: erroDesfazer } = await supabaseClient
                    .from('compromissos')
                    .insert([compromissoParaLinha(origem)]);

                if (erroDesfazer) {
                    mostrarToast('Não foi possível desfazer: ' + erroDesfazer.message, 'erro');
                    return;
                }
                await carregarCompromissos();
                mostrarToast('Compromisso restaurado.', 'sucesso');
            });
        }
    });

    // =========================================================================
    // 8. FILTROS E BUSCA POR DIGITAÇÃO (agora combinados, um não anula o outro)
    // =========================================================================
    let filtroTipoAtual = 'Todos';
    let termoBuscaAtual = '';

    function aplicarFiltrosCombinados() {
        let resultado = compromissos;

        if (filtroTipoAtual === 'Cancelamento') {
            resultado = resultado.filter(c => c.tipo === 'Cancelado' || c.tipo === 'Cancelamento');
        } else if (filtroTipoAtual !== 'Todos') {
            resultado = resultado.filter(c => c.tipo === filtroTipoAtual);
        }

        if (termoBuscaAtual) {
            resultado = resultado.filter(c => c.title.toLowerCase().includes(termoBuscaAtual));
        }

        calendar.removeAllEvents();
        calendar.addEventSource(resultado);
    }

    if (inputBusca) {
        inputBusca.addEventListener('input', function(e) {
            termoBuscaAtual = e.target.value.toLowerCase();
            aplicarFiltrosCombinados();
        });
    }

    botoesFiltro.forEach(botao => {
        botao.addEventListener('click', function() {
            botoesFiltro.forEach(b => b.classList.remove('ativo'));
            this.classList.add('ativo');
            filtroTipoAtual = this.innerText.trim();
            aplicarFiltrosCombinados();
        });
    });

    // Card de Relatório aciona a visualização de Impressão limpa
    // Elementos do Modal de Relatório
    const modalRelatorio = document.getElementById('modalRelatorio');
    const btnFecharRelatorio = document.getElementById('btnFecharRelatorio');
    const btnApenasFecharRelatorio = document.getElementById('btnApenasFecharRelatorio');
    const btnImprimirDoRelatorio = document.getElementById('btnImprimirDoRelatorio');

    // 📊 Ação: Gerar e exibir janela de relatório na tela
    const btnRelatorio = document.getElementById('btnRelatorio');
    if (btnRelatorio) {
        btnRelatorio.addEventListener('click', function() {
            const listaAtividadesRelatorio = document.getElementById('listaAtividadesRelatorio');
            const dataRelatorio = document.getElementById('dataRelatorio');
            const compromissosDoMes = compromissosDoMesExibido();

            if (dataRelatorio) {
                dataRelatorio.innerText = `Referente a ${nomeDoMesExibido()} — gerado em ${new Date().toLocaleString('pt-BR')}`;
            }

            // Pega os contadores atuais direto dos cards da tela (já filtrados pelo mês exibido)
            document.getElementById('repTreinamentos').innerText = document.getElementById('cardTreinamentos').innerText;
            document.getElementById('repVisitas').innerText = document.getElementById('cardVisitas').innerText;
            document.getElementById('repDemandas').innerText = document.getElementById('cardDemandas').innerText;
            document.getElementById('repCancelados').innerText = document.getElementById('cardCancelados').innerText;

            const totalParticipantes = compromissosDoMes.reduce((soma, c) => soma + (Number(c.qtdParticipantes) || 0), 0);
            const repParticipantesEl = document.getElementById('repParticipantes');
            if (repParticipantesEl) repParticipantesEl.innerText = totalParticipantes;

            // Monta a lista textual limpa para impressão (só do mês exibido)
            if (listaAtividadesRelatorio) {
                listaAtividadesRelatorio.innerHTML = '';
                
                if (compromissosDoMes.length === 0) {
                    listaAtividadesRelatorio.innerHTML = '<p style="color:#64748b; font-size:13px; text-align:center;">Nenhum compromisso neste mês.</p>';
                } else {
                    compromissosDoMes
                        .slice()
                        .sort((a, b) => new Date(a.start) - new Date(b.start))
                        .forEach(comp => {
                        const dataComp = new Date(comp.start).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'});
                        const infoParticipantes = (comp.tipo === 'Treinamento' && comp.qtdParticipantes !== null && comp.qtdParticipantes !== undefined)
                            ? ` | 👥 ${comp.qtdParticipantes} participante(s)`
                            : '';
                        const itemHtml = `
                            <div style="padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px;">
                                <strong style="color:#1e293b;">${comp.title}</strong><br>
                                <span style="color:#64748b;">📅 ${dataComp} | Tipo: ${comp.tipo}${infoParticipantes}</span>
                            </div>
                        `;
                        listaAtividadesRelatorio.innerHTML += itemHtml;
                    });
                }
            }

            // Mostra a janela do relatório
            if (modalRelatorio) modalRelatorio.style.display = 'flex';
        });
    }

    // 🖨️ Ação do Botão Interno: Imprime APENAS o conteúdo do relatório de forma limpa
    if (btnImprimirDoRelatorio) {
        btnImprimirDoRelatorio.addEventListener('click', function() {
            const conteudoImpressao = document.getElementById('impressaoArea').innerHTML;
            
            // Abre uma janela temporária oculta apenas para enviar para a impressora
            const janelaImpressao = window.open('', '_blank', 'width=800,height=600');
            janelaImpressao.document.write(`
                <html>
                <head>
                    <title>Impressão de Relatório</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; color: #334155; }
                        h2 { color: #1e3a8a; }
                        div { margin-bottom: 15px; }
                    </style>
                </head>
                <body>
                    ${conteudoImpressao}
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
                </html>
            `);
            janelaImpressao.document.close();
        });
    }

    // Funções para fechar o relatório
    if (btnFecharRelatorio) btnFecharRelatorio.addEventListener('click', () => modalRelatorio.style.display = 'none');
    if (btnApenasFecharRelatorio) btnApenasFecharRelatorio.addEventListener('click', () => modalRelatorio.style.display = 'none');
    
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", function() {
            localStorage.removeItem("usuarioLogado");
            location.reload();
        });
    }

    // =========================================================================
    // 9. PAINEL DE ADMINISTRAÇÃO (SOMENTE ADMIN) — USUÁRIOS AGORA NO SUPABASE
    // =========================================================================
    const btnAdmin = document.getElementById("btnAdmin");
    const modalAdmin = document.getElementById("modalAdmin");
    const fecharAdmin = document.querySelector(".fechar-admin");
    const formUsuarioAdmin = document.getElementById("formUsuarioAdmin");
    habilitarEnterParaSalvar(formUsuarioAdmin);
    const txtNovoUsuario = document.getElementById("txtNovoUsuario");
    const txtNovaSenha = document.getElementById("txtNovaSenha");
    const selNovoRole = document.getElementById("selNovoRole");
    const usuarioOriginalEdicao = document.getElementById("usuarioOriginalEdicao");
    const btnSalvarUsuarioAdmin = document.getElementById("btnSalvarUsuarioAdmin");
    const btnCancelarEdicaoUsuario = document.getElementById("btnCancelarEdicaoUsuario");
    const listaUsuariosAdmin = document.getElementById("listaUsuariosAdmin");

    const rotulosRole = { admin: "Admin", usuario: "Usuário", visualizador: "Visualização" };

    if (isAdmin && btnAdmin) btnAdmin.style.display = "inline-block";

    async function pegarUsuarios() {
        const { data, error } = await supabaseClient.from('usuarios').select('usuario, role').order('usuario');
        if (error) {
            mostrarToast('Erro ao carregar usuários: ' + error.message, 'erro');
            return [];
        }
        return data || [];
    }

    function resetarFormularioUsuario() {
        if (formUsuarioAdmin) formUsuarioAdmin.reset();
        if (usuarioOriginalEdicao) usuarioOriginalEdicao.value = "";
        if (txtNovoUsuario) txtNovoUsuario.disabled = false;
        if (txtNovaSenha) txtNovaSenha.required = true;
        const dicaSenha = document.getElementById("dicaSenhaAdmin");
        if (dicaSenha) dicaSenha.innerText = "";
        if (btnSalvarUsuarioAdmin) btnSalvarUsuarioAdmin.innerHTML = "➕ Adicionar Usuário";
        if (btnCancelarEdicaoUsuario) btnCancelarEdicaoUsuario.style.display = "none";
    }

    async function renderizarListaUsuarios() {
        if (!listaUsuariosAdmin) return;
        const lista = await pegarUsuarios();
        listaUsuariosAdmin.innerHTML = "";

        lista.forEach(u => {
            const div = document.createElement("div");
            div.className = "item-usuario-admin";
            div.innerHTML = `
                <span class="nome-usuario-admin">${u.usuario}<span class="badge-role badge-role-${u.role}">${rotulosRole[u.role] || u.role}</span></span>
                <span class="acoes-usuario-admin">
                    <button class="btn-editar-usuario">✏️ Editar</button>
                    <button class="btn-apagar-usuario">🗑️ Apagar</button>
                </span>
            `;

            div.querySelector(".btn-editar-usuario").addEventListener("click", function() {
                txtNovoUsuario.value = u.usuario;
                txtNovoUsuario.disabled = true; // não deixa trocar o nome de login numa edição, evita duplicidade
                txtNovaSenha.value = "";
                txtNovaSenha.required = false; // na edição, só troca a senha se preencher algo
                const dicaSenha = document.getElementById("dicaSenhaAdmin");
                if (dicaSenha) dicaSenha.innerText = "Deixe em branco para manter a senha atual.";
                selNovoRole.value = u.role;
                usuarioOriginalEdicao.value = u.usuario;
                btnSalvarUsuarioAdmin.innerHTML = "💾 Salvar Alterações";
                btnCancelarEdicaoUsuario.style.display = "inline-block";
                formUsuarioAdmin.scrollIntoView({ behavior: "smooth", block: "start" });
            });

            div.querySelector(".btn-apagar-usuario").addEventListener("click", async function() {
                if (usuarioLogado && usuarioLogado.usuario === u.usuario) {
                    mostrarToast('Você não pode apagar o usuário com o qual está logado.', 'aviso');
                    return;
                }
                const totalAdmins = lista.filter(x => x.role === "admin").length;
                if (u.role === "admin" && totalAdmins <= 1) {
                    mostrarToast('Não é possível apagar o último Admin do sistema.', 'aviso');
                    return;
                }
                if (confirm(`Tem certeza que deseja apagar o usuário "${u.usuario}"?`)) {
                    const { error } = await supabaseClient.from('usuarios').delete().eq('usuario', u.usuario);
                    if (error) {
                        mostrarToast('Erro ao apagar usuário: ' + error.message, 'erro');
                        return;
                    }
                    renderizarListaUsuarios();
                }
            });

            listaUsuariosAdmin.appendChild(div);
        });
    }

    if (btnAdmin) {
        btnAdmin.addEventListener("click", function() {
            resetarFormularioUsuario();
            renderizarListaUsuarios();
            if (modalAdmin) modalAdmin.style.display = "flex";
        });
    }

    if (fecharAdmin) {
        fecharAdmin.addEventListener("click", () => modalAdmin.style.display = "none");
    }

    if (btnCancelarEdicaoUsuario) {
        btnCancelarEdicaoUsuario.addEventListener("click", resetarFormularioUsuario);
    }

    if (formUsuarioAdmin) {
        formUsuarioAdmin.addEventListener("submit", async function(e) {
            e.preventDefault();

            const nomeDigitado = txtNovoUsuario.value.trim();
            const senhaDigitada = txtNovaSenha.value.trim();
            const roleEscolhida = selNovoRole.value;
            const emEdicao = usuarioOriginalEdicao.value;

            if (emEdicao) {
                // Editando um usuário já existente — a função no banco cuida do hash
                // (e mantém a senha atual se o campo for deixado em branco)
                const { error } = await supabaseClient.rpc('editar_usuario', {
                    p_usuario: emEdicao,
                    p_senha: senhaDigitada, // pode vir vazio, a função trata isso
                    p_role: roleEscolhida
                });

                if (error) {
                    mostrarToast('Erro ao salvar alterações do usuário: ' + error.message, 'erro');
                    return;
                }

                // Se o usuário editado é o que está logado agora, atualiza a role da sessão
                if (usuarioLogado && usuarioLogado.usuario === emEdicao) {
                    usuarioLogado.role = roleEscolhida;
                    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
                }
            } else {
                // Criando um usuário novo — confere duplicidade (sem diferenciar maiúsc/minúsc)
                const { data: existente } = await supabaseClient
                    .from('usuarios')
                    .select('usuario')
                    .ilike('usuario', nomeDigitado)
                    .maybeSingle();

                if (existente) {
                    mostrarToast('Já existe um usuário com esse nome de login.', 'aviso');
                    return;
                }

                // A função no banco já grava a senha com hash
                const { error } = await supabaseClient.rpc('criar_usuario', {
                    p_usuario: nomeDigitado,
                    p_senha: senhaDigitada,
                    p_role: roleEscolhida
                });

                if (error) {
                    mostrarToast('Erro ao criar usuário: ' + error.message, 'erro');
                    return;
                }
            }

            resetarFormularioUsuario();
            renderizarListaUsuarios();
        });
    }

    async function tentarLogin() {
        const usuario = document.getElementById("usuario").value;
        const senha = document.getElementById("senha").value;
        const erroLoginEl = document.getElementById("erroLogin");

        erroLoginEl.innerHTML = "Entrando...";

        const { data, error } = await supabaseClient.rpc('login_usuario', {
            p_usuario: usuario,
            p_senha: senha
        });

        if (error) {
            erroLoginEl.innerHTML = "⚠️ Erro ao conectar com o Supabase: " + error.message;
            return;
        }

        const usuarioEncontrado = (data && data.length > 0) ? data[0] : null;

        if (usuarioEncontrado) {
            localStorage.setItem("usuarioLogado", JSON.stringify(usuarioEncontrado));
            location.reload();
        } else {
            erroLoginEl.innerHTML = "Usuário ou senha inválidos.";
        }
    }

    document.getElementById("btnLogin").onclick = tentarLogin;

    // Enter no campo "usuário" pula o foco pro campo "senha" (não tenta logar ainda,
    // pois a senha estaria vazia). Enter no campo "senha" loga direto.
    const campoUsuario = document.getElementById("usuario");
    const campoSenha = document.getElementById("senha");

    if (campoUsuario && campoSenha) {
        campoUsuario.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                e.preventDefault();
                campoSenha.focus();
            }
        });

        campoSenha.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                e.preventDefault();
                tentarLogin();
            }
        });
    }

    // =========================================================================
    // ATALHOS DE TECLADO: "N" abre novo compromisso, "Esc" fecha o que estiver aberto
    // =========================================================================
    document.addEventListener('keydown', function(e) {
        const dentroDeCampo = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);

        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(m => { if (m.style.display !== 'none') m.style.display = 'none'; });
            if (menuContexto) menuContexto.style.display = 'none';
            return;
        }

        if ((e.key === 'n' || e.key === 'N') && !dentroDeCampo && usuarioLogado && !somenteVisualizacao) {
            const algumModalAberto = Array.from(document.querySelectorAll('.modal')).some(m => m.style.display === 'flex');
            if (!algumModalAberto) {
                e.preventDefault();
                dataSelecionadaClique = new Date().toISOString().split('T')[0];
                abrirModalCadastro(false);
            }
        }
    });

    // Executa a primeira carga (só se já estiver logado, evita chamada desnecessária ao Supabase)
    if (usuarioLogado) {
        await carregarCompromissos();

        // =========================================================================
        // 10. ATUALIZAÇÃO AUTOMÁTICA (SUPABASE REALTIME)
        // Sempre que ALGUÉM criar, editar, cancelar ou apagar um compromisso,
        // todo mundo que estiver com a agenda aberta recebe a atualização na hora,
        // sem precisar apertar F5.
        // =========================================================================
        let debounceRealtime = null;
        supabaseClient
            .channel('compromissos-mudancas')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'compromissos' }, () => {
                // Agrupa várias mudanças que cheguem juntas numa só atualização da tela
                clearTimeout(debounceRealtime);
                debounceRealtime = setTimeout(carregarCompromissos, 300);
            })
            .subscribe();
    }
});
