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

const somenteVisualizacao = !!(usuarioLogado && usuarioLogado.role === "visualizador");
const isAdmin = !!(usuarioLogado && usuarioLogado.role === "admin");

    const telaLogin = document.getElementById("loginTela");
    const sistema = document.getElementById("sistema");

    if(usuarioLogado){

        telaLogin.style.display="none";
        sistema.style.display="block";

    }else{

        telaLogin.style.display="flex";
        sistema.style.display="none";

    }

    // =========================================================================
    // 0. CONVERSÕES ENTRE O FORMATO DO BANCO (SUPABASE) E O FORMATO DO APP
    // =========================================================================
    function linhaParaCompromisso(row) {
        return {
            id: row.id,
            title: row.title,
            start: row.start,
            end: row.end || undefined,
            tipo: row.tipo,
            className: row.classname || 'evento-padrao',
            descricao: row.descricao || '',
            agente: row.agente || '',
            solicitante: row.solicitante || '',
            cargoSolicitante: row.cargo_solicitante || '',
            unidade: row.unidade || '',
            status: row.status || '',
            criadoPor: row.criado_por || '',
            editadoPor: row.editado_por || '',
            canceladoPor: row.cancelado_por || ''
        };
    }

    function compromissoParaLinha(c) {
        return {
            id: c.id,
            title: c.title,
            start: c.start,
            end: c.end || null,
            tipo: c.tipo,
            classname: c.className || 'evento-padrao',
            descricao: c.descricao || '',
            agente: c.agente || '',
            solicitante: c.solicitante || '',
            cargo_solicitante: c.cargoSolicitante || '',
            unidade: c.unidade || '',
            status: c.status || '',
            criado_por: c.criadoPor || '',
            editado_por: c.editadoPor || '',
            cancelado_por: c.canceladoPor || ''
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
            "CAPS II",
            "CAPS AD III",
            "CAPS Infantojuvenil",
            "Hospital Municipal de Governador Valadares",
            "Hospital Bom Samaritano",
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

    // =========================================================================
    // 3. CONFIGURAÇÃO PRINCIPAL DO FULLCALENDAR
    // =========================================================================
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
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
            alert('⚠️ Erro ao carregar compromissos do Supabase: ' + error.message);
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
    function atualizarDashboard() {
        let qtdTreinamentos = 0, qtdVisitas = 0, qtdDemandas = 0, qtdCancelados = 0;
        const listaProximosEl = document.getElementById('listaProximos');
        const conteudoResumoEl = document.getElementById('conteudoResumo');
        
        if (listaProximosEl) listaProximosEl.innerHTML = '';

        compromissos.forEach(comp => {
            // Contagem dos Cards baseados no tipo
            if (comp.tipo === 'Treinamento') qtdTreinamentos++;
            else if (comp.tipo === 'Visita') qtdVisitas++;
            else if (comp.tipo === 'Demanda') qtdDemandas++;
            else if (comp.tipo === 'Cancelado' || comp.tipo === 'Cancelamento') qtdCancelados++;

            // Alimentação da lista de Próximos Compromissos do Rodapé
            if (listaProximosEl && comp.tipo !== 'Cancelado' && comp.tipo !== 'Cancelamento') {
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
            }
        });

        // Injeta os valores recalculados nos Cards de Resumo
        if (document.getElementById('cardTreinamentos')) document.getElementById('cardTreinamentos').innerText = qtdTreinamentos;
        if (document.getElementById('cardVisitas')) document.getElementById('cardVisitas').innerText = qtdVisitas;
        if (document.getElementById('cardDemandas')) document.getElementById('cardDemandas').innerText = qtdDemandas;
        if (document.getElementById('cardCancelados')) document.getElementById('cardCancelados').innerText = qtdCancelados;

        // Injeta as estatísticas no Resumo Descritivo Lateral
        if (conteudoResumoEl) {
            const totalAtivos = qtdTreinamentos + qtdVisitas + qtdDemandas;
            conteudoResumoEl.innerHTML = `
                <p>Você gerencia atualmente <strong>${totalAtivos}</strong> ações agendadas de segunda a sexta.</p>
                <p>Compromissos abortados/cancelados: <strong>${qtdCancelados}</strong> itens.</p>
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
        } else {
            idEventoSelecionado = null;
            if (formCadastro) formCadastro.reset();
            if (inputData && dataSelecionadaClique) inputData.value = dataSelecionadaClique;
            if (inputHoraInicio) inputHoraInicio.value = '';
            if (selectStatus) selectStatus.value = 'Aguardando Confirmação';
            if (inputAgente) inputAgente.value = usuarioLogado ? usuarioLogado.usuario : '';
        }

        if (modalCadastro) modalCadastro.style.display = 'flex';
    }

    if (formCadastro) {
        formCadastro.addEventListener('submit', async function(e) {
            e.preventDefault();

            const dataFormatada = inputData.value;
            const dataHoraInicio = `${dataFormatada}T${inputHoraInicio.value}:00`;

            let classeCor = 'evento-padrao';
            if (selectTipo.value === 'Treinamento') classeCor = 'evento-treinamento';
            else if (selectTipo.value === 'Visita') classeCor = 'evento-visita';
            else if (selectTipo.value === 'Demanda') classeCor = 'evento-demanda';
            else if (selectTipo.value === 'Cancelado' || selectTipo.value === 'Cancelamento') classeCor = 'evento-cancelado';

            const agente = inputAgente ? inputAgente.value : '';
            const solicitante = inputSolicitante ? inputSolicitante.value : '';
            const cargoSolicitante = inputCargoSolicitante ? inputCargoSolicitante.value : '';
            const unidade = selectUnidade ? selectUnidade.value : '';
            const status = selectStatus ? selectStatus.value : 'Aguardando Confirmação';

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
                    descricao: txtDescricao.value
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
                    alert('⚠️ Erro ao salvar alterações: ' + error.message);
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
                    descricao: txtDescricao.value
                };

                const { error } = await supabaseClient.from('compromissos').insert(novoEvento);

                if (error) {
                    alert('⚠️ Erro ao criar compromisso: ' + error.message);
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
            alert('⚠️ Erro ao salvar o novo horário: ' + error.message);
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
                </div>

                <div class="detalhe-secao">
                    <div class="detalhe-secao-titulo">👤 Responsáveis</div>
                    <div class="detalhe-item-linha">
                        <span class="detalhe-label">Agente (Vivver)</span>
                        <span class="detalhe-valor">${agente}</span>
                    </div>
                    <div class="detalhe-item-linha">
                        <span class="detalhe-label">Solicitado por</span>
                        <span class="detalhe-valor">${solicitante}${cargoSolicitante ? ' <span class="detalhe-cargo">(' + cargoSolicitante + ')</span>' : ''}</span>
                    </div>
                    ${tipo === 'Cancelado' && canceladoPor ? `
                    <div class="detalhe-item-linha">
                        <span class="detalhe-label">❌ Cancelado por</span>
                        <span class="detalhe-valor">${canceladoPor}</span>
                    </div>` : ''}
                </div>

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

        const blocoEventoVisual = e.target.closest('.fc-daygrid-event');
        if (blocoEventoVisual && menuContexto) {
            e.preventDefault(); 
            
            // Localiza o título interno do evento para cruzar com o array
            const textoTitulo = blocoEventoVisual.querySelector('.fc-event-title').innerText;
            const achado = compromissos.find(c => c.title === textoTitulo || c.title.includes(textoTitulo));
            
            if (achado) {
                eventoSelecionadoParaMenu = calendar.getEventById(achado.id);
            }

            menuContexto.style.left = e.clientX + 'px';
            menuContexto.style.top = e.clientY + 'px';
            menuContexto.style.display = 'flex';
        }
    });

    document.addEventListener('click', () => {
        if (menuContexto) menuContexto.style.display = 'none';
    });

    // ✏️ Ação: EDITAR (Pergunta quem está editando e abre o formulário completo, pré-preenchido)
    document.getElementById('btnEditarCompromisso').addEventListener('click', function() {
        if (eventoSelecionadoParaMenu) {
            const nomeEditor = prompt("Quem está editando este compromisso?");

            if (nomeEditor && nomeEditor.trim() !== "") {
                nomeEditorAtual = nomeEditor.trim();
                abrirModalCadastro(true, eventoSelecionadoParaMenu);
            } else if (nomeEditor !== null) {
                alert("Operação cancelada: o nome de quem está editando é obrigatório.");
            }
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
                    alert('⚠️ Erro ao duplicar: ' + error.message);
                    return;
                }
                await carregarCompromissos();
            }
        }
    });

    // ❌ Ação: CANCELAR (Pede nome, muda status/tipo e registra quem cancelou)
    document.getElementById('btnCancelarCompromisso').addEventListener('click', async function() {
        if (eventoSelecionadoParaMenu) {
            const nomeCancelador = prompt("Quem está cancelando este compromisso?");
            
            if (nomeCancelador && nomeCancelador.trim() !== "") {
                const origem = compromissos.find(c => c.id === eventoSelecionadoParaMenu.id);
                if (!origem) return;

                // Remove sufixos antigos que porventura estejam presos ao título
                const tituloLimpo = origem.title.split(" - Editado por")[0].split(" - Cancelado por")[0];

                const { error } = await supabaseClient
                    .from('compromissos')
                    .update({
                        tipo: 'Cancelado',
                        classname: 'evento-cancelado',
                        title: tituloLimpo,
                        cancelado_por: nomeCancelador.trim()
                    })
                    .eq('id', eventoSelecionadoParaMenu.id);

                if (error) {
                    alert('⚠️ Erro ao cancelar: ' + error.message);
                    return;
                }
                await carregarCompromissos();
            } else if (nomeCancelador !== null) {
                alert("Operação cancelada: O nome do responsável é obrigatório.");
            }
        }
    });

    // Elementos novos do modal de senha seguro
    const modalSenhaAdmin = document.getElementById('modalSenhaAdmin');
    const inputSenhaAdmin = document.getElementById('txtSenhaAdmin');
    const btnCancelarExclusao = document.getElementById('btnCancelarExclusao');
    const btnConfirmarExclusao = document.getElementById('btnConfirmarExclusao');

    // 🗑️ Ação: APAGAR (Abre o modal seguro mascarado) — só admin vê o botão
    document.getElementById('btnApagar').addEventListener('click', function() {
        if (!isAdmin) return;
        if (eventoSelecionadoParaMenu) {
            if (inputSenhaAdmin) inputSenhaAdmin.value = ''; // Limpa digitações anteriores
            if (modalSenhaAdmin) modalSenhaAdmin.style.display = 'flex';
            if (inputSenhaAdmin) inputSenhaAdmin.focus();
        }
    });

    // Evento de Confirmação da Senha Oculta
    if (btnConfirmarExclusao) {
        btnConfirmarExclusao.addEventListener('click', async function() {
            // A senha continua sendo validada, mas agora não fica legível na tela ao digitar
            if (inputSenhaAdmin && inputSenhaAdmin.value === "262505") {
                const { error } = await supabaseClient
                    .from('compromissos')
                    .delete()
                    .eq('id', eventoSelecionadoParaMenu.id);

                if (error) {
                    alert('⚠️ Erro ao apagar: ' + error.message);
                    return;
                }
                await carregarCompromissos();
                if (modalSenhaAdmin) modalSenhaAdmin.style.display = 'none';
            } else {
                alert("🚫 Senha incorreta! O registro não foi removido.");
                if (inputSenhaAdmin) {
                    inputSenhaAdmin.value = '';
                    inputSenhaAdmin.focus();
                }
            }
        });
    }

    // Ouvinte para fechar o modal caso desista
    if (btnCancelarExclusao) {
        btnCancelarExclusao.addEventListener('click', () => {
            if (modalSenhaAdmin) modalSenhaAdmin.style.display = 'none';
        });
    }

    // =========================================================================
    // 8. FILTROS E BUSCA POR DIGITAÇÃO
    // =========================================================================
    if (inputBusca) {
        inputBusca.addEventListener('input', function(e) {
            const termo = e.target.value.toLowerCase();
            const filtrados = compromissos.filter(c => c.title.toLowerCase().includes(termo));
            calendar.removeAllEvents();
            calendar.addEventSource(filtrados);
        });
    }

    botoesFiltro.forEach(botao => {
        botao.addEventListener('click', function() {
            botoesFiltro.forEach(b => b.classList.remove('ativo'));
            this.classList.add('ativo');
            
            const filtroTexto = this.innerText.trim();
            calendar.removeAllEvents();
            
            if (filtroTexto === 'Todos') {
                calendar.addEventSource(compromissos);
            } else if (filtroTexto === 'Cancelamento') {
                calendar.addEventSource(compromissos.filter(c => c.tipo === 'Cancelado' || c.tipo === 'Cancelamento'));
            } else {
                calendar.addEventSource(compromissos.filter(c => c.tipo === filtroTexto));
            }
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
            
            if (dataRelatorio) {
                dataRelatorio.innerText = `Gerado em: ${new Date().toLocaleString('pt-BR')}`;
            }

            // Pega os contadores atuais direto dos cards da tela
            document.getElementById('repTreinamentos').innerText = document.getElementById('cardTreinamentos').innerText;
            document.getElementById('repVisitas').innerText = document.getElementById('cardVisitas').innerText;
            document.getElementById('repDemandas').innerText = document.getElementById('cardDemandas').innerText;
            document.getElementById('repCancelados').innerText = document.getElementById('cardCancelados').innerText;

            // Monta a lista textual limpa para impressão
            if (listaAtividadesRelatorio) {
                listaAtividadesRelatorio.innerHTML = '';
                
                if (compromissos.length === 0) {
                    listaAtividadesRelatorio.innerHTML = '<p style="color:#64748b; font-size:13px; text-align:center;">Nenhum compromisso agendado.</p>';
                } else {
                    compromissos.forEach(comp => {
                        const dataComp = new Date(comp.start).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'});
                        const itemHtml = `
                            <div style="padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px;">
                                <strong style="color:#1e293b;">${comp.title}</strong><br>
                                <span style="color:#64748b;">📅 ${dataComp} | Tipo: ${comp.tipo}</span>
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
        const { data, error } = await supabaseClient.from('usuarios').select('*').order('usuario');
        if (error) {
            alert('⚠️ Erro ao carregar usuários: ' + error.message);
            return [];
        }
        return data || [];
    }

    function resetarFormularioUsuario() {
        if (formUsuarioAdmin) formUsuarioAdmin.reset();
        if (usuarioOriginalEdicao) usuarioOriginalEdicao.value = "";
        if (txtNovoUsuario) txtNovoUsuario.disabled = false;
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
                txtNovaSenha.value = u.senha;
                selNovoRole.value = u.role;
                usuarioOriginalEdicao.value = u.usuario;
                btnSalvarUsuarioAdmin.innerHTML = "💾 Salvar Alterações";
                btnCancelarEdicaoUsuario.style.display = "inline-block";
                formUsuarioAdmin.scrollIntoView({ behavior: "smooth", block: "start" });
            });

            div.querySelector(".btn-apagar-usuario").addEventListener("click", async function() {
                if (usuarioLogado && usuarioLogado.usuario === u.usuario) {
                    alert("🚫 Você não pode apagar o usuário com o qual está logado.");
                    return;
                }
                const totalAdmins = lista.filter(x => x.role === "admin").length;
                if (u.role === "admin" && totalAdmins <= 1) {
                    alert("🚫 Não é possível apagar o último Admin do sistema.");
                    return;
                }
                if (confirm(`Tem certeza que deseja apagar o usuário "${u.usuario}"?`)) {
                    const { error } = await supabaseClient.from('usuarios').delete().eq('usuario', u.usuario);
                    if (error) {
                        alert('⚠️ Erro ao apagar usuário: ' + error.message);
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
                // Editando um usuário já existente
                const { error } = await supabaseClient
                    .from('usuarios')
                    .update({ senha: senhaDigitada, role: roleEscolhida })
                    .eq('usuario', emEdicao);

                if (error) {
                    alert('⚠️ Erro ao salvar alterações do usuário: ' + error.message);
                    return;
                }

                // Se o usuário editado é o que está logado agora, atualiza a sessão também
                if (usuarioLogado && usuarioLogado.usuario === emEdicao) {
                    usuarioLogado.senha = senhaDigitada;
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
                    alert("🚫 Já existe um usuário com esse nome de login.");
                    return;
                }

                const { error } = await supabaseClient
                    .from('usuarios')
                    .insert({ usuario: nomeDigitado, senha: senhaDigitada, role: roleEscolhida });

                if (error) {
                    alert('⚠️ Erro ao criar usuário: ' + error.message);
                    return;
                }
            }

            resetarFormularioUsuario();
            renderizarListaUsuarios();
        });
    }

    document.getElementById("btnLogin").onclick = async function(){
        const usuario = document.getElementById("usuario").value;
        const senha = document.getElementById("senha").value;
        const erroLoginEl = document.getElementById("erroLogin");

        erroLoginEl.innerHTML = "Entrando...";

        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('usuario', usuario)
            .eq('senha', senha)
            .maybeSingle();

        if (error) {
            erroLoginEl.innerHTML = "⚠️ Erro ao conectar com o Supabase: " + error.message;
            return;
        }

        if (data) {
            localStorage.setItem("usuarioLogado", JSON.stringify(data));
            location.reload();
        } else {
            erroLoginEl.innerHTML = "Usuário ou senha inválidos.";
        }
    };

    // Executa a primeira carga (só se já estiver logado, evita chamada desnecessária ao Supabase)
    if (usuarioLogado) {
        await carregarCompromissos();
    }
});
