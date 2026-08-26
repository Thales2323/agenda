// Ajustes: checagens de elementos, escapeHTML, mapping classname/className, uuid fallback, proteções diversas.
document.addEventListener('DOMContentLoaded', async function() {

    // ==========================
    // UTILITÁRIOS
    // ==========================
    function escapeHTML(str) {
        return String(str || '').replace(/[&<>"']/g, function(m) {
            return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[m];
        });
    }

    function gerarId() {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        return String(Date.now());
    }

    // ==========================
    // CONEXÃO COM O SUPABASE
    // ==========================
    const SUPABASE_URL = 'https://pjzjlckhwjgdibhhlffj.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_5kP1SdaVUZTph0xdSgK-Ug_egN_B0T4';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // ==========================
    // LOGIN
    // ==========================
    let usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (usuarioLogado) {
        try {
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
        } catch (err) {
            console.error('Erro revalidacao:', err);
            localStorage.removeItem("usuarioLogado");
            usuarioLogado = null;
        }
    }

    const somenteVisualizacao = !!(usuarioLogado && usuarioLogado.role === "visualizador");
    const isAdmin = !!(usuarioLogado && usuarioLogado.role === "admin");

    // =========================================================================
    // SISTEMA DE NOTIFICAÇÕES (TOASTS)
    // =========================================================================
    const iconesToast = { erro: '⚠️', sucesso: '✅', aviso: '🚫' };

    function mostrarToast(mensagem, tipo = 'erro') {
        const container = document.getElementById('toastContainer');
        if (!container) { alert(mensagem); return; }

        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.innerHTML = `
            <span class="toast-icone">${iconesToast[tipo] || 'ℹ️'}</span>
            <span>${escapeHTML(mensagem)}</span>
            <button class="toast-fechar" aria-label="Fechar">&times;</button>
        `;

        function remover() {
            toast.classList.add('toast-saindo');
            setTimeout(() => toast.remove(), 200);
        }

        const btnFechar = toast.querySelector('.toast-fechar');
        if (btnFechar) btnFechar.addEventListener('click', remover);
        container.appendChild(toast);
        setTimeout(remover, 6000);
    }

    function mostrarToastAcao(mensagem, textoAcao, aoClicarAcao) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast toast-aviso';
        toast.innerHTML = `
            <span class="toast-icone">🗑️</span>
            <span>${escapeHTML(mensagem)}</span>
            <button class="toast-acao">${escapeHTML(textoAcao)}</button>
            <button class="toast-fechar" aria-label="Fechar">&times;</button>
        `;

        function remover() {
            toast.classList.add('toast-saindo');
            setTimeout(() => toast.remove(), 200);
        }

        const timeoutSumir = setTimeout(remover, 6000);

        const btnAcao = toast.querySelector('.toast-acao');
        if (btnAcao) {
            btnAcao.addEventListener('click', function() {
                clearTimeout(timeoutSumir);
                remover();
                aoClicarAcao();
            });
        }

        const btnFechar = toast.querySelector('.toast-fechar');
        if (btnFechar) {
            btnFechar.addEventListener('click', function() {
                clearTimeout(timeoutSumir);
                remover();
            });
        }

        container.appendChild(toast);
    }

    // Garante que apertar Enter salva o formulário
    function habilitarEnterParaSalvar(form) {
        if (!form) return;
        form.addEventListener('keydown', function(e) {
            if (e.key !== 'Enter') return;
            if (e.target.tagName === 'TEXTAREA') return;
            if (e.target.tagName === 'BUTTON') return;
            e.preventDefault();
            if (typeof form.requestSubmit === 'function') {
                form.requestSubmit();
            } else {
                form.dispatchEvent(new Event('submit', { cancelable: true }));
            }
        });
    }

    // =========================================================================
    // DOM e Estado inicial
    // =========================================================================
    const telaLogin = document.getElementById("loginTela");
    const sistema = document.getElementById("sistema");

    if (telaLogin && sistema) {
        if (usuarioLogado) {
            telaLogin.style.display = "none";
            sistema.style.display = "block";
        } else {
            telaLogin.style.display = "flex";
            sistema.style.display = "none";
        }
    }

    const telaCarregandoEl = document.getElementById('telaCarregando');
    if (telaCarregandoEl) {
        telaCarregandoEl.classList.add('escondida');
        setTimeout(() => telaCarregandoEl.remove(), 300);
    }

    // =========================================================================
    // MODO ESCURO
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

    function corAPartirDoNome(nome) {
        const paleta = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];
        let soma = 0;
        for (let i = 0; i < (nome || '').length; i++) soma += nome.charCodeAt(i);
        return paleta[soma % paleta.length];
    }

    function avatarIniciaisHTML(nome) {
        if (!nome) return '';
        const iniciais = escapeHTML((nome.trim().slice(0, 2) || '').toUpperCase());
        const cor = corAPartirDoNome(nome);
        return `<span class="avatar-iniciais" style="background:${cor};">${iniciais}</span>`;
    }

    // =========================================================================
    // CONVERSÕES ENTRE DB E APP
    // =========================================================================
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
            // Mapeia o campo do DB 'classname' para a propriedade do FullCalendar 'className'
            className: row.classname || classePorCompromisso(row.tipo, row.status),
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
            // grava no DB usando o nome do campo 'classname'
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
    // ESTADO GLOBAL
    // =========================================================================
    let compromissos = [];

    let modoEdicao = false;
    let idEventoSelecionado = null;
    let dataSelecionadaClique = null;
    let eventoSelecionadoParaMenu = null;
    let nomeEditorAtual = '';

    // =========================================================================
    // MAPEAMENTO DE ELEMENTOS DO DOM
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

    const modalDetalhes = document.getElementById('modalDetalhes');
    const modalCadastro = document.getElementById('modalCadastro') || document.getElementById('cadastroEvento');

    const btnFecharDetalhes = document.querySelector('.fechar-detalhes');
    const btnFecharCadastro = document.querySelector('.fechar-cadastro') || document.querySelector('.fechar');

    const formCadastro = document.getElementById('formCadastroEvento') || document.querySelector('#modalCadastro form');
    habilitarEnterParaSalvar(formCadastro);
    const inputTitulo = document.getElementById('txtTitulo') || document.getElementById('titulo');
    const inputAgente = document.getElementById('txtAgente');
    const inputSolicitante = document.getElementById('txtSolicitante');
    const inputCargoSolicitante = document.getElementById('txtCargoSolicitante');
    const selectUnidade = document.getElementById('selUnidade');

    // MUNICÍPIOS / UNIDADES
    const municipios = {
        "Governador Valadares": [
            "EAP CENTRO I",
            "ESF CONJUNTO SIR II",
            "ESF CONJUNTO SIR I",
            "ESF SANTOS DUMONT I",
            "ESF SAO PEDRO I",
            "ESF SAO PEDRO II",
            "ESF SAO TARCISIO",
            "ESF SANTOS DUMONT II",
            "CONSULTORIO NA RUA",
            "ESF CENTRO",
            "ESF SAO PEDRO III",
            "ESF IPE",
            "ESF VILA PARQUE IBITURUNA",
            "ESF ATALAIA",
            "ESF SAO RAIMUNDO I",
            "ESF AZTECA",
            "ESF VILA DOS MONTES",
            "ESF JARDIM PRIMAVERA",
            "EAP VILA ISA",
            "ESF SAO RAIMUNDO II",
            "ESF VILA DO SOL",
            "EAP VILA BRETAS",
            "EAP LOURDES",
            "ESF JARDIM PEROLA I",
            "EAP VILA MARIANA",
            "ESF SANTA TEREZINHA",
            "ESF JARDIM PEROLA II",
            "ESF JARDIM PEROLA III",
            "ESF JARDIM PEROLA IV",
            "ESF SAO PAULO I",
            "ESF SAO PAULO II",
            "EAP SANTA RITA",
            "ESF SANTA RITA I",
            "ESF SANTA RITA II",
            "ESF BELA VISTA",
            "ESF NOVO HORIZONTE",
            "ESF NOVA JK I",
            "ESF NOVA JK II",
            "ESF VITORIA",
            "ESF SANTA RITA III",
            "ESF SANTA RITA IV",
            "EMULTI AMP 6",
            "ESF SANTA PAULA",
            "ESF CAIC II",
            "ESF CAIC I",
            "ESF JARDIM DO TREVO",
            "ESF FRATERNIDADE",
            "ESF BAGUARI",
            "ESF SAO JOSE DO ITAPINOA",
            "ESF TURMALINA I",
            "ESF TURMALINA II",
            "ESF MAE DE DEUS I",
            "ESF MAE DE DEUS II",
            "ESF TURMALINA III",
            "ESF CARAPINA I",
            "ESF SANTA HELENA I",
            "ESF SANTA EFIGENIA",
            "ESF CARAPINA II",
            "ESF SANTA HELENA II",
            "ESF ALTINOPOLIS I",
            "EAP NOSSA SENHORA DAS GRAÇAS I",
            "ESF ALTINOPOLIS III",
            "ESF ALTINOPOLIS II",
            "ESF ALTINOPOLIS IV",
            "ESF ESPERANCA",
            "ESF NOSSA SENHORA DAS GRAÇAS",
            "EAP NOSSA SENHORA DAS GRAÇAS II",
            "ESF XONIN",
            "ESF PACA",
            "ESF GOIABAL",
            "ESF PONTAL",
            "UNIVALE I",
            "UNIVALE II"
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

    function atualizarVisibilidadeParticipantes() {
        if (!grupoParticipantes || !selectTipo) return;
        grupoParticipantes.style.display = (selectTipo.value === 'Treinamento') ? 'flex' : 'none';
    }
    if (selectTipo) {
        selectTipo.addEventListener('change', atualizarVisibilidadeParticipantes);
        atualizarVisibilidadeParticipantes();
    }

    function atualizarVisibilidadeMotivoFalta() {
        if (!grupoMotivoFalta || !selectStatus) return;
        const faltou = selectStatus.value === 'Não Compareceu';
        grupoMotivoFalta.style.display = faltou ? 'flex' : 'none';
        if (txtMotivoFalta) txtMotivoFalta.required = faltou;
    }
    if (selectStatus) {
        selectStatus.addEventListener('change', atualizarVisibilidadeMotivoFalta);
        atualizarVisibilidadeMotivoFalta();
    }

    // =========================================================================
    // FULLCALENDAR (cria somente se existir elemento)
    // =========================================================================
    let calendar = null;
    if (calendarEl) {
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            height: 'auto',
            locale: 'pt-br',
            weekends: false,
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            buttonText: { today: 'Hoje', month: 'Mês', week: 'Semana', day: 'Dia' },
            events: [],
            editable: !somenteVisualizacao,
            selectable: !somenteVisualizacao,
            dayMaxEvents: 3,
            moreLinkText: function(num) { return `+${num} mais`; },
            eventOrder: 'start',
            eventOrderStrict: true,
            select: function(info) {
                dataSelecionadaClique = info.startStr;
                abrirModalCadastro(false, null);
            },
            eventClick: function(info) {
                abrirModalDetalhes(info.event);
            },
            eventDrop: function(info) {
                atualizarDataEvento(info.event);
            },
            eventResize: function(info) {
                atualizarDataEvento(info.event);
            },
            eventTimeFormat: { hour: '2-digit', minute: '2-digit', meridiem: false },
            eventDidMount: function(info) {
                info.el.setAttribute('data-event-id', info.event.id);
            },
            datesSet: function() {
                atualizarDashboard();
            }
        });
        calendar.render();
    }

    // =========================================================================
    // CARREGA COMPROMISSOS
    // =========================================================================
    async function carregarCompromissos() {
        const { data, error } = await supabaseClient
            .from('compromissos')
            .select('*')
            .order('start', { ascending: true });

        if (error) {
            mostrarToast('Erro ao carregar compromissos: ' + (error.message || error), 'erro');
            return;
        }

        compromissos = (data || []).map(linhaParaCompromisso);
        if (calendar) {
            calendar.removeAllEvents();
            calendar.addEventSource(compromissos);
        }
        atualizarDashboard();
    }

    // =========================================================================
    // DASHBOARD
    // =========================================================================
    function compromissosDoMesExibido() {
        if (!calendar) return [];
        const dataFoco = calendar.getDate();
        const anoFoco = dataFoco.getFullYear();
        const mesFoco = dataFoco.getMonth();

        return compromissos.filter(c => {
            const d = new Date(c.start);
            return d.getFullYear() === anoFoco && d.getMonth() === mesFoco;
        });
    }

    function nomeDoMesExibido() {
        if (!calendar) return '';
        return calendar.getDate().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }

    function atualizarDashboard() {
        let qtdTreinamentos = 0, qtdVisitas = 0, qtdDemandas = 0, qtdCancelados = 0, qtdNaoCompareceu = 0;
        const listaProximosEl = document.getElementById('listaProximos');
        const conteudoResumoEl = document.getElementById('conteudoResumo');

        compromissosDoMesExibido().forEach(comp => {
            if (comp.tipo === 'Treinamento') qtdTreinamentos++;
            else if (comp.tipo === 'Visita') qtdVisitas++;
            else if (comp.tipo === 'Demanda') qtdDemandas++;
            else if (comp.tipo === 'Cancelado' || comp.tipo === 'Cancelamento') qtdCancelados++;

            if (comp.status === 'Não Compareceu') qtdNaoCompareceu++;
        });

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
                    <h4>${escapeHTML(comp.title)}</h4>
                    <p>📅 ${escapeHTML(dataFormatada)} às ${escapeHTML(horaFormatada)} | <strong>${escapeHTML(comp.tipo)}</strong></p>
                `;

                item.addEventListener('click', () => {
                    if (!calendar) return;
                    const ev = calendar.getEventById(comp.id);
                    if (ev) abrirModalDetalhes(ev);
                });

                listaProximosEl.appendChild(item);
            });
        }

        if (document.getElementById('cardTreinamentos')) document.getElementById('cardTreinamentos').innerText = qtdTreinamentos;
        if (document.getElementById('cardVisitas')) document.getElementById('cardVisitas').innerText = qtdVisitas;
        if (document.getElementById('cardDemandas')) document.getElementById('cardDemandas').innerText = qtdDemandas;
        if (document.getElementById('cardNaoCompareceu')) document.getElementById('cardNaoCompareceu').innerText = qtdNaoCompareceu;
        if (document.getElementById('cardCancelados')) document.getElementById('cardCancelados').innerText = qtdCancelados;

        if (conteudoResumoEl) {
            const totalAtivos = qtdTreinamentos + qtdVisitas + qtdDemandas;
            conteudoResumoEl.innerHTML = `
                <p>Em <strong>${escapeHTML(nomeDoMesExibido())}</strong>, você gerencia <strong>${totalAtivos}</strong> ações agendadas.</p>
                <p>Compromissos abortados/cancelados no mês: <strong>${qtdCancelados}</strong> itens.</p>
                <p style="font-size: 11px; color:#64748b; margin-top:5px;">Clique com o botão direito nos blocos do calendário para ver ações rápidas.</p>
            `;
        }
    }

    // =========================================================================
    // CRUD: Abrir modal e salvar
    // =========================================================================
    function abrirModalCadastro(editar = false, event = null) {
        modoEdicao = editar;
        const tituloModal = document.getElementById('tituloModalCadastro');
        if (tituloModal) tituloModal.innerText = editar ? 'Editar Compromisso' : 'Novo Compromisso';

        if (editar && event) {
            idEventoSelecionado = event.id;

            const tituloLimpo = (event.title || '').split(' - Editado por')[0].split(' - Cancelado por')[0];
            if (inputTitulo) inputTitulo.value = tituloLimpo;

            const dataIso = (event.startStr || '').split('T')[0];
            if (inputData) inputData.value = dataIso;

            const horaIn = event.startStr && event.startStr.split('T')[1] ? event.startStr.split('T')[1].substring(0,5) : '';
            if (inputHoraInicio) inputHoraInicio.value = horaIn;

            if (inputAgente) inputAgente.value = event.extendedProps?.agente || '';
            if (inputSolicitante) inputSolicitante.value = event.extendedProps?.solicitante || '';
            if (inputCargoSolicitante) inputCargoSolicitante.value = event.extendedProps?.cargoSolicitante || '';
            if (selectUnidade) selectUnidade.value = event.extendedProps?.unidade || '';
            if (selectTipo) selectTipo.value = event.extendedProps?.tipo || 'Treinamento';
            if (selectStatus) selectStatus.value = event.extendedProps?.status || 'Aguardando Confirmação';
            if (txtDescricao) txtDescricao.value = event.extendedProps?.descricao || '';
            if (txtMotivoFalta) txtMotivoFalta.value = event.extendedProps?.motivoFalta || '';
            if (txtQtdParticipantes) txtQtdParticipantes.value = event.extendedProps?.qtdParticipantes ?? '';
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

            const dataFormatada = inputData?.value || '';
            const horaVal = inputHoraInicio?.value || '';
            const dataHoraInicio = dataFormatada ? `${dataFormatada}T${horaVal}:00` : '';

            const tipoVal = selectTipo ? selectTipo.value : '';
            const statusVal = selectStatus ? selectStatus.value : '';

            const classeCor = classePorCompromisso(tipoVal, statusVal);

            const agente = inputAgente ? inputAgente.value : '';
            const solicitante = inputSolicitante ? inputSolicitante.value : '';
            const cargoSolicitante = inputCargoSolicitante ? inputCargoSolicitante.value : '';
            const unidade = selectUnidade ? selectUnidade.value : '';
            const status = selectStatus ? selectStatus.value : 'Aguardando Confirmação';
            const motivoFalta = (status === 'Não Compareceu' && txtMotivoFalta) ? txtMotivoFalta.value : '';
            const qtdParticipantes = (selectTipo && selectTipo.value === 'Treinamento' && txtQtdParticipantes && txtQtdParticipantes.value !== '')
                ? parseInt(txtQtdParticipantes.value, 10)
                : null;

            const btnSalvar = formCadastro.querySelector('.btn-salvar');
            if (btnSalvar) btnSalvar.disabled = true;

            if (modoEdicao && idEventoSelecionado) {
                const dadosAtualizados = {
                    title: inputTitulo ? inputTitulo.value : '',
                    start: dataHoraInicio,
                    tipo: tipoVal,
                    classname: classeCor,
                    agente: agente,
                    solicitante: solicitante,
                    cargo_solicitante: cargoSolicitante,
                    unidade: unidade,
                    status: status,
                    descricao: txtDescricao ? txtDescricao.value : '',
                    motivo_falta: motivoFalta,
                    qtd_participantes: qtdParticipantes
                };
                if (nomeEditorAtual) dadosAtualizados.editado_por = nomeEditorAtual;
                if (selectTipo && selectTipo.value !== 'Cancelado') dadosAtualizados.cancelado_por = '';

                const { error } = await supabaseClient
                    .from('compromissos')
                    .update(dadosAtualizados)
                    .eq('id', idEventoSelecionado);

                nomeEditorAtual = '';

                if (error) {
                    mostrarToast('Erro ao salvar alterações: ' + (error.message || error), 'erro');
                    if (btnSalvar) btnSalvar.disabled = false;
                    return;
                }
            } else {
                const novoEvento = {
                    id: gerarId(),
                    title: inputTitulo ? inputTitulo.value : '',
                    start: dataHoraInicio,
                    criado_por: usuarioLogado ? usuarioLogado.usuario : '',
                    tipo: tipoVal,
                    classname: classeCor,
                    agente: agente,
                    solicitante: solicitante,
                    cargo_solicitante: cargoSolicitante,
                    unidade: unidade,
                    status: status,
                    descricao: txtDescricao ? txtDescricao.value : '',
                    motivo_falta: motivoFalta,
                    qtd_participantes: qtdParticipantes
                };

                const { error } = await supabaseClient.from('compromissos').insert(novoEvento);

                if (error) {
                    mostrarToast('Erro ao criar compromisso: ' + (error.message || error), 'erro');
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
            mostrarToast('Erro ao salvar o novo horário: ' + (error.message || error), 'erro');
            await carregarCompromissos();
        }
    }

    // =========================================================================
    // DETALHES
    // =========================================================================
    const iconesTipo = { 'Treinamento': '🎓', 'Visita': '🚗', 'Demanda': '📋', 'Cancelado': '❌' };
    const classesStatus = {
        'Aguardando Confirmação': 'badge-aguardando',
        'Confirmado': 'badge-confirmado',
        'Realizado': 'badge-realizado',
        'Remarcado': 'badge-remarcado',
        'Não Compareceu': 'badge-nao-compareceu'
    };

    function abrirModalDetalhes(event) {
        const conteudo = document.getElementById('conteudoDetalhes');
        if (!modalDetalhes || !conteudo || !event) return;

        const desc = event.extendedProps?.descricao || 'Sem descrição cadastrada.';
        const tipo = event.extendedProps?.tipo || 'Padrão';
        const agente = event.extendedProps?.agente || 'Não informado';
        const solicitante = event.extendedProps?.solicitante || 'Não informado';
        const cargoSolicitante = event.extendedProps?.cargoSolicitante || '';
        const unidade = event.extendedProps?.unidade || 'Não informado';
        const status = event.extendedProps?.status || 'Não informado';
        const criadoPor = event.extendedProps?.criadoPor || "";

        const icone = iconesTipo[tipo] || '📌';
        const statusExibido = tipo === 'Cancelado' ? 'Cancelado' : status;
        const classeBadge = tipo === 'Cancelado' ? 'badge-cancelado' : (classesStatus[status] || 'badge-aguardando');
        const canceladoPor = event.extendedProps?.canceladoPor || '';
        const motivoFalta = event.extendedProps?.motivoFalta || '';
        const qtdParticipantes = event.extendedProps?.qtdParticipantes;

        const dataObj = event.start instanceof Date ? event.start : new Date(event.start);
        const dataFormatada = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        // Monta HTML com valores escapados
        conteudo.innerHTML = `
            <div class="detalhe-cabecalho">
                <div class="detalhe-icone-tipo">${escapeHTML(icone)}</div>
                <div>
                    <h3 class="detalhe-titulo">${escapeHTML(event.title)}</h3>
                    <span class="detalhe-badge ${escapeHTML(classeBadge)}">${escapeHTML(statusExibido)}</span>
                </div>
            </div>

            <div class="detalhe-grid">
                <div class="detalhe-item">
                    <span class="detalhe-label">📅 Data</span>
                    <span class="detalhe-valor">${escapeHTML(dataFormatada)}</span>
                </div>
                <div class="detalhe-item">
                    <span class="detalhe-label">🕒 Hora</span>
                    <span class="detalhe-valor">${escapeHTML(horaFormatada)}</span>
                </div>
                <div class="detalhe-item">
                    <span class="detalhe-label">🏷️ Categoria</span>
                    <span class="detalhe-valor">${escapeHTML(tipo)}</span>
                </div>
                <div class="detalhe-item">
                    <span class="detalhe-label">🏥 Unidade</span>
                    <span class="detalhe-valor">${escapeHTML(unidade)}</span>
                </div>
                ${tipo === 'Treinamento' && qtdParticipantes !== null && qtdParticipantes !== undefined ? `
                <div class="detalhe-item">
                    <span class="detalhe-label">👥 Participantes</span>
                    <span class="detalhe-valor">${escapeHTML(String(qtdParticipantes))}</span>
                </div>` : ''}
            </div>

            <div class="detalhe-secao">
                <div class="detalhe-secao-titulo">👤 Responsáveis</div>
                <div class="detalhe-item-linha">
                    <span class="detalhe-label">Agente (Vivver)</span>
                    <span class="detalhe-valor linha-com-avatar">${avatarIniciaisHTML(agente)} ${escapeHTML(agente)}</span>
                </div>
                <div class="detalhe-item-linha">
                    <span class="detalhe-label">Solicitado por</span>
                    <span class="detalhe-valor">${escapeHTML(solicitante)}${cargoSolicitante ? ' <span class="detalhe-cargo">(' + escapeHTML(cargoSolicitante) + ')</span>' : ''}</span>
                </div>
                ${criadoPor ? `
                <div class="detalhe-item-linha">
                    <span class="detalhe-label">Criado por</span>
                    <span class="detalhe-valor linha-com-avatar">${avatarIniciaisHTML(criadoPor)} ${escapeHTML(criadoPor)}</span>
                </div>` : ''}
                ${tipo === 'Cancelado' && canceladoPor ? `
                <div class="detalhe-item-linha">
                    <span class="detalhe-label">❌ Cancelado por</span>
                    <span class="detalhe-valor linha-com-avatar">${avatarIniciaisHTML(canceladoPor)} ${escapeHTML(canceladoPor)}</span>
                </div>` : ''}
            </div>

            ${status === 'Não Compareceu' && motivoFalta ? `
            <div class="detalhe-secao">
                <div class="detalhe-secao-titulo">🔴 Motivo da Falta</div>
                <p class="detalhe-obs detalhe-obs-falta">${escapeHTML(motivoFalta)}</p>
            </div>` : ''}

            <div class="detalhe-secao">
                <div class="detalhe-secao-titulo">📝 Notas de Campo</div>
                <p class="detalhe-obs">${escapeHTML(desc)}</p>
            </div>
        `;
        modalDetalhes.style.display = 'flex';
    }

    if (btnFecharDetalhes) btnFecharDetalhes.addEventListener('click', () => { if (modalDetalhes) modalDetalhes.style.display = 'none'; });
    if (btnFecharCadastro) btnFecharCadastro.addEventListener('click', () => { if (modalCadastro) modalCadastro.style.display = 'none'; });

    window.addEventListener('click', function(e) {
        if (e.target === modalDetalhes && modalDetalhes) modalDetalhes.style.display = 'none';
        if (e.target === modalCadastro && modalCadastro) modalCadastro.style.display = 'none';
    });

    // =========================================================================
    // CONTEXT MENU
    // =========================================================================
    if (calendarEl && menuContexto) {
        calendarEl.addEventListener('contextmenu', function(e) {
            if (somenteVisualizacao) { e.preventDefault(); return; }

            const blocoEventoVisual = e.target.closest('[data-event-id]');
            if (blocoEventoVisual) {
                e.preventDefault();
                if (calendar) eventoSelecionadoParaMenu = calendar.getEventById(blocoEventoVisual.dataset.eventId);
                menuContexto.style.left = e.clientX + 'px';
                menuContexto.style.top = e.clientY + 'px';
                menuContexto.style.display = 'flex';
            }
        });

        document.addEventListener('click', () => { if (menuContexto) menuContexto.style.display = 'none'; });
    }

    // Botões do menu — só se existirem
    const btnEditarCompromisso = document.getElementById('btnEditarCompromisso');
    if (btnEditarCompromisso) {
        btnEditarCompromisso.addEventListener('click', function() {
            if (eventoSelecionadoParaMenu) {
                nomeEditorAtual = usuarioLogado ? usuarioLogado.usuario : '';
                abrirModalCadastro(true, eventoSelecionadoParaMenu);
            }
        });
    }

    const btnDuplicarCompromisso = document.getElementById('btnDuplicarCompromisso');
    if (btnDuplicarCompromisso) {
        btnDuplicarCompromisso.addEventListener('click', async function() {
            if (eventoSelecionadoParaMenu) {
                const origem = compromissos.find(c => c.id === eventoSelecionadoParaMenu.id);
                if (origem) {
                    const copiaClonada = {
                        ...origem,
                        id: gerarId()
                    };

                    const { error } = await supabaseClient
                        .from('compromissos')
                        .insert(compromissoParaLinha(copiaClonada));

                    if (error) {
                        mostrarToast('Erro ao duplicar: ' + (error.message || error), 'erro');
                        return;
                    }
                    await carregarCompromissos();
                }
            }
        });
    }

    const btnConcluirCompromisso = document.getElementById('btnConcluirCompromisso');
    if (btnConcluirCompromisso) {
        btnConcluirCompromisso.addEventListener('click', async function() {
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
                .update({ status: 'Realizado', classname: 'evento-concluido' })
                .eq('id', eventoSelecionadoParaMenu.id);

            if (error) {
                mostrarToast('Erro ao concluir: ' + (error.message || error), 'erro');
                return;
            }
            await carregarCompromissos();
        });
    }

    const btnCancelarCompromisso = document.getElementById('btnCancelarCompromisso');
    if (btnCancelarCompromisso) {
        btnCancelarCompromisso.addEventListener('click', async function() {
            if (eventoSelecionadoParaMenu) {
                const origem = compromissos.find(c => c.id === eventoSelecionadoParaMenu.id);
                if (!origem) return;
                if (!confirm(`Cancelar o compromisso "${origem.title}"?`)) return;

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
                    mostrarToast('Erro ao cancelar: ' + (error.message || error), 'erro');
                    return;
                }
                await carregarCompromissos();
            }
        });
    }

    const btnApagar = document.getElementById('btnApagar');
    if (btnApagar) {
        btnApagar.addEventListener('click', async function() {
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
                mostrarToast('Erro ao apagar: ' + (error.message || error), 'erro');
                return;
            }
            await carregarCompromissos();

            if (origem) {
                mostrarToastAcao(`"${nomeEvento}" foi apagado.`, 'Desfazer', async function() {
                    const { error: erroDesfazer } = await supabaseClient
                        .from('compromissos')
                        .insert([compromissoParaLinha(origem)]);

                    if (erroDesfazer) {
                        mostrarToast('Não foi possível desfazer: ' + (erroDesfazer.message || erroDesfazer), 'erro');
                        return;
                    }
                    await carregarCompromissos();
                    mostrarToast('Compromisso restaurado.', 'sucesso');
                });
            }
        });
    }

    // =========================================================================
    // FILTROS E BUSCA
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
            resultado = resultado.filter(c => (c.title || '').toLowerCase().includes(termoBuscaAtual));
        }

        if (calendar) {
            calendar.removeAllEvents();
            calendar.addEventSource(resultado);
        }
    }

    if (inputBusca) {
        let debounceTimer = null;
        inputBusca.addEventListener('input', function(e) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                termoBuscaAtual = (e.target.value || '').toLowerCase();
                aplicarFiltrosCombinados();
            }, 150);
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

    // =========================================================================
    // RELATÓRIO / IMPRESSÃO
    // =========================================================================
    const modalRelatorio = document.getElementById('modalRelatorio');
    const btnFecharRelatorio = document.getElementById('btnFecharRelatorio');
    const btnApenasFecharRelatorio = document.getElementById('btnApenasFecharRelatorio');
    const btnImprimirDoRelatorio = document.getElementById('btnImprimirDoRelatorio');
    const btnRelatorio = document.getElementById('btnRelatorio');

    if (btnRelatorio) {
        btnRelatorio.addEventListener('click', function() {
            const listaAtividadesRelatorio = document.getElementById('listaAtividadesRelatorio');
            const dataRelatorio = document.getElementById('dataRelatorio');
            const compromissosDoMes = compromissosDoMesExibido();

            if (dataRelatorio) {
                dataRelatorio.innerText = `Referente a ${nomeDoMesExibido()} — gerado em ${new Date().toLocaleString('pt-BR')}`;
            }

            const cardTre = document.getElementById('cardTreinamentos');
            const cardVis = document.getElementById('cardVisitas');
            const cardDem = document.getElementById('cardDemandas');
            const cardCan = document.getElementById('cardCancelados');

            if (document.getElementById('repTreinamentos') && cardTre) document.getElementById('repTreinamentos').innerText = cardTre.innerText;
            if (document.getElementById('repVisitas') && cardVis) document.getElementById('repVisitas').innerText = cardVis.innerText;
            if (document.getElementById('repDemandas') && cardDem) document.getElementById('repDemandas').innerText = cardDem.innerText;
            if (document.getElementById('repCancelados') && cardCan) document.getElementById('repCancelados').innerText = cardCan.innerText;

            const totalParticipantes = compromissosDoMes.reduce((soma, c) => soma + (Number(c.qtdParticipantes) || 0), 0);
            const repParticipantesEl = document.getElementById('repParticipantes');
            if (repParticipantesEl) repParticipantesEl.innerText = totalParticipantes;

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
                                ? ` | 👥 ${escapeHTML(String(comp.qtdParticipantes))} participante(s)`
                                : '';
                            const itemHtml = `
                                <div style="padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px;">
                                    <strong style="color:#1e293b;">${escapeHTML(comp.title)}</strong><br>
                                    <span style="color:#64748b;">📅 ${escapeHTML(dataComp)} | Tipo: ${escapeHTML(comp.tipo)}${infoParticipantes}</span>
                                </div>
                            `;
                            listaAtividadesRelatorio.innerHTML += itemHtml;
                        });
                }
            }

            if (modalRelatorio) modalRelatorio.style.display = 'flex';
        });
    }

    if (btnImprimirDoRelatorio) {
        btnImprimirDoRelatorio.addEventListener('click', function() {
            const impressaoArea = document.getElementById('impressaoArea');
            const conteudoImpressao = impressaoArea ? impressaoArea.innerHTML : '';
            const janelaImpressao = window.open('', '_blank', 'width=800,height=600');
            if (!janelaImpressao || !janelaImpressao.document) {
                mostrarToast('Não foi possível abrir janela de impressão (popup bloqueado).', 'aviso');
                return;
            }
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

    if (btnFecharRelatorio) btnFecharRelatorio.addEventListener('click', () => { if (modalRelatorio) modalRelatorio.style.display = 'none'; });
    if (btnApenasFecharRelatorio) btnApenasFecharRelatorio.addEventListener('click', () => { if (modalRelatorio) modalRelatorio.style.display = 'none'; });

    // Logout
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", function() {
            localStorage.removeItem("usuarioLogado");
            location.reload();
        });
    }

    // =========================================================================
    // ADMIN
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
            mostrarToast('Erro ao carregar usuários: ' + (error.message || error), 'erro');
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
                <span class="nome-usuario-admin">${escapeHTML(u.usuario)}<span class="badge-role badge-role-${escapeHTML(u.role)}">${escapeHTML(rotulosRole[u.role] || u.role)}</span></span>
                <span class="acoes-usuario-admin">
                    <button class="btn-editar-usuario">✏️ Editar</button>
                    <button class="btn-apagar-usuario">🗑️ Apagar</button>
                </span>
            `;

            const btnEditar = div.querySelector(".btn-editar-usuario");
            if (btnEditar) {
                btnEditar.addEventListener("click", function() {
                    if (txtNovoUsuario) txtNovoUsuario.value = u.usuario;
                    if (txtNovoUsuario) txtNovoUsuario.disabled = true;
                    if (txtNovaSenha) txtNovaSenha.value = "";
                    if (txtNovaSenha) txtNovaSenha.required = false;
                    const dicaSenha = document.getElementById("dicaSenhaAdmin");
                    if (dicaSenha) dicaSenha.innerText = "Deixe em branco para manter a senha atual.";
                    if (selNovoRole) selNovoRole.value = u.role;
                    if (usuarioOriginalEdicao) usuarioOriginalEdicao.value = u.usuario;
                    if (btnSalvarUsuarioAdmin) btnSalvarUsuarioAdmin.innerHTML = "💾 Salvar Alterações";
                    if (btnCancelarEdicaoUsuario) btnCancelarEdicaoUsuario.style.display = "inline-block";
                    if (formUsuarioAdmin) formUsuarioAdmin.scrollIntoView({ behavior: "smooth", block: "start" });
                });
            }

            const btnApagarUsuario = div.querySelector(".btn-apagar-usuario");
            if (btnApagarUsuario) {
                btnApagarUsuario.addEventListener("click", async function() {
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
                            mostrarToast('Erro ao apagar usuário: ' + (error.message || error), 'erro');
                            return;
                        }
                        renderizarListaUsuarios();
                    }
                });
            }

            listaUsuariosAdmin.appendChild(div);
        });
    }

    if (btnAdmin) {
        btnAdmin.addEventListener("click", function() {
            resetarFormularioUsuario();
            renderizarListaUsuarios();
            if (modalAdmin) modalAdmin.style.display = 'flex';
        });
    }

    if (fecharAdmin) {
        fecharAdmin.addEventListener("click", () => { if (modalAdmin) modalAdmin.style.display = 'none'; });
    }

    if (btnCancelarEdicaoUsuario) {
        btnCancelarEdicaoUsuario.addEventListener("click", resetarFormularioUsuario);
    }

    if (formUsuarioAdmin) {
        formUsuarioAdmin.addEventListener("submit", async function(e) {
            e.preventDefault();

            const nomeDigitado = txtNovoUsuario ? txtNovoUsuario.value.trim() : '';
            const senhaDigitada = txtNovaSenha ? txtNovaSenha.value.trim() : '';
            const roleEscolhida = selNovoRole ? selNovoRole.value : '';
            const emEdicao = usuarioOriginalEdicao ? usuarioOriginalEdicao.value : '';

            if (emEdicao) {
                const { error } = await supabaseClient.rpc('editar_usuario', {
                    p_usuario: emEdicao,
                    p_senha: senhaDigitada,
                    p_role: roleEscolhida
                });

                if (error) {
                    mostrarToast('Erro ao salvar alterações do usuário: ' + (error.message || error), 'erro');
                    return;
                }

                if (usuarioLogado && usuarioLogado.usuario === emEdicao) {
                    usuarioLogado.role = roleEscolhida;
                    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
                }
            } else {
                const { data: existente } = await supabaseClient
                    .from('usuarios')
                    .select('usuario')
                    .ilike('usuario', nomeDigitado)
                    .maybeSingle();

                if (existente) {
                    mostrarToast('Já existe um usuário com esse nome de login.', 'aviso');
                    return;
                }

                const { error } = await supabaseClient.rpc('criar_usuario', {
                    p_usuario: nomeDigitado,
                    p_senha: senhaDigitada,
                    p_role: roleEscolhida
                });

                if (error) {
                    mostrarToast('Erro ao criar usuário: ' + (error.message || error), 'erro');
                    return;
                }
            }

            resetarFormularioUsuario();
            renderizarListaUsuarios();
        });
    }

    // =========================================================================
    // LOGIN (tentarLogin)
    // =========================================================================
    async function tentarLogin() {
        const usuarioEl = document.getElementById("usuario");
        const senhaEl = document.getElementById("senha");
        const erroLoginEl = document.getElementById("erroLogin");

        const usuario = usuarioEl ? usuarioEl.value : '';
        const senha = senhaEl ? senhaEl.value : '';

        if (erroLoginEl) erroLoginEl.innerHTML = "Entrando...";

        const { data, error } = await supabaseClient.rpc('login_usuario', {
            p_usuario: usuario,
            p_senha: senha
        });

        if (error) {
            if (erroLoginEl) erroLoginEl.innerHTML = "⚠️ Erro ao conectar com o Supabase: " + escapeHTML(error.message || String(error));
            return;
        }

        const usuarioEncontrado = (Array.isArray(data) && data.length > 0) ? data[0] : (data || null);

        if (usuarioEncontrado) {
            localStorage.setItem("usuarioLogado", JSON.stringify(usuarioEncontrado));
            location.reload();
        } else {
            if (erroLoginEl) erroLoginEl.innerHTML = "Usuário ou senha inválidos.";
        }
    }

    const btnLoginEl = document.getElementById("btnLogin");
    if (btnLoginEl) btnLoginEl.onclick = tentarLogin;

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
    // ATALHOS DE TECLADO
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

    // =========================================================================
    // PRIMEIRA CARGA E REALTIME
    // =========================================================================
    if (usuarioLogado) {
        await carregarCompromissos();

        let debounceRealtime = null;
        supabaseClient
            .channel('compromissos-mudancas')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'compromissos' }, () => {
                clearTimeout(debounceRealtime);
                debounceRealtime = setTimeout(carregarCompromissos, 300);
            })
            .subscribe();
    }

});
