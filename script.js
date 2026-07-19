document.addEventListener('DOMContentLoaded', function() {
    
    // =========================================================================
    // 1. ESTADO GLOBAL E PERSISTÊNCIA (LOCALSTORAGE)
    // =========================================================================
    let compromissos = JSON.parse(localStorage.getItem('compromissos')) || [
        {
            id: '1710000000000',
            title: 'Treinamento - ESF Altinópolis',
            start: '2026-07-17T09:00:00',
            end: '2026-07-17T11:00:00',
            tipo: 'Treinamento',
            className: 'evento-treinamento',
            descricao: 'Treinamento do sistema com a equipe local.'
        },
        {
            id: '1710000000001',
            title: 'Visita - ESF Altinópolis',
            start: '2026-07-17T15:00:00',
            end: '2026-07-17T16:30:00',
            tipo: 'Visita',
            className: 'evento-visita',
            descricao: 'Visita técnica de acompanhamento.'
        }
    ];

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
        events: compromissos,
        editable: true,
        selectable: true,

        // Clique em um dia vazio -> Abre modal de Cadastro
        select: function(info) {
            dataSelecionadaClique = info.startStr;
            abrirModalCadastro(false, null);
        },

        // Clique normal em um evento -> Abre modal de Detalhes
        eventClick: function(info) {
            abrirModalDetalhes(info.event);
        },

        // Arrastar e soltar evento -> Atualiza a data no Array/Banco
        eventDrop: function(info) {
            atualizarDataEvento(info.event);
        },

        // Redimensionar tempo do evento -> Atualiza no Array/Banco
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

        // Salva o array atualizado no LocalStorage do Navegador
        localStorage.setItem('compromissos', JSON.stringify(compromissos));
    }

    // =========================================================================
    // 5. OPERAÇÕES DE CRUD (SALVAR, CRIAR, ATUALIZAR, SOLTAR)
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
        }

        if (modalCadastro) modalCadastro.style.display = 'flex';
    }

    if (formCadastro) {
        formCadastro.addEventListener('submit', function(e) {
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

            if (modoEdicao && idEventoSelecionado) {
                // Modo Edição: Atualiza registro no Array principal
                compromissos = compromissos.map(c => {
                    if (c.id === idEventoSelecionado) {
                        return {
                            ...c,
                            title: inputTitulo.value,
                            start: dataHoraInicio,
                            tipo: selectTipo.value,
                            className: classeCor,
                            agente: agente,
                            solicitante: solicitante,
                            cargoSolicitante: cargoSolicitante,
                            unidade: unidade,
                            status: status,
                            descricao: txtDescricao.value,
                            editadoPor: nomeEditorAtual || c.editadoPor || '',
                            // Se o compromisso foi reativado (tipo diferente de Cancelado),
                            // remove a marcação de quem cancelou
                            canceladoPor: selectTipo.value === 'Cancelado' ? c.canceladoPor : ''
                        };
                    }
                    return c;
                });
                nomeEditorAtual = '';
            } else {
                // Modo Criação: Dá um push de um novo objeto JSON completo
                const novoEvento = {
                    id: String(Date.now()),
                    title: inputTitulo.value,
                    start: dataHoraInicio,
                    tipo: selectTipo.value,
                    className: classeCor,
                    agente: agente,
                    solicitante: solicitante,
                    cargoSolicitante: cargoSolicitante,
                    unidade: unidade,
                    status: status,
                    descricao: txtDescricao.value
                };
                compromissos.push(novoEvento);
            }

            // Força renderização e atualiza indicadores
            calendar.removeAllEvents();
            calendar.addEventSource(compromissos);
            atualizarDashboard();
            
            if (modalCadastro) modalCadastro.style.display = 'none';
        });
    }

    function atualizarDataEvento(event) {
        compromissos = compromissos.map(c => {
            if (c.id === event.id) {
                return {
                    ...c,
                    start: event.startStr,
                    end: event.endStr || event.startStr
                };
            }
            return c;
        });
        atualizarDashboard();
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
    document.getElementById('btnDuplicarCompromisso').addEventListener('click', function() {
        if (eventoSelecionadoParaMenu) {
            const origem = compromissos.find(c => c.id === eventoSelecionadoParaMenu.id);
            if (origem) {
                const copiaClonada = {
                    ...origem,
                    id: String(Date.now()), // Gera um novo ID único baseado no timestamp
                    title: origem.title // Mantém o título livre/idêntico
                };
                compromissos.push(copiaClonada);
                calendar.removeAllEvents();
                calendar.addEventSource(compromissos);
                atualizarDashboard();
            }
        }
    });

    // ❌ Ação: CANCELAR (Pede nome, muda status/tipo e registra quem cancelou)
    document.getElementById('btnCancelarCompromisso').addEventListener('click', function() {
        if (eventoSelecionadoParaMenu) {
            const nomeCancelador = prompt("Quem está cancelando este compromisso?");
            
            if (nomeCancelador && nomeCancelador.trim() !== "") {
                compromissos = compromissos.map(c => {
                    if (c.id === eventoSelecionadoParaMenu.id) {
                        // Remove sufixos antigos que porventura estejam presos ao título
                        const tituloLimpo = c.title.split(" - Editado por")[0].split(" - Cancelado por")[0];
                        return { 
                            ...c, 
                            tipo: 'Cancelado', 
                            className: 'evento-cancelado',
                            title: tituloLimpo,
                            canceladoPor: nomeCancelador.trim()
                        };
                    }
                    return c;
                });
                
                calendar.removeAllEvents();
                calendar.addEventSource(compromissos);
                atualizarDashboard();
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

    // 🗑️ Ação: APAGAR (Abre o modal seguro mascarado)
    document.getElementById('btnApagar').addEventListener('click', function() {
        if (eventoSelecionadoParaMenu) {
            if (inputSenhaAdmin) inputSenhaAdmin.value = ''; // Limpa digitações anteriores
            if (modalSenhaAdmin) modalSenhaAdmin.style.display = 'flex';
            if (inputSenhaAdmin) inputSenhaAdmin.focus();
        }
    });

    // Evento de Confirmação da Senha Oculta
    if (btnConfirmarExclusao) {
        btnConfirmarExclusao.addEventListener('click', function() {
            // A senha continua sendo validada, mas agora não fica legível na tela ao digitar
            if (inputSenhaAdmin && inputSenhaAdmin.value === "262505") {
                compromissos = compromissos.filter(c => c.id !== eventoSelecionadoParaMenu.id);
                calendar.removeAllEvents();
                calendar.addEventSource(compromissos);
                atualizarDashboard();
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
    // Executa a primeira carga limpando caches e construindo o dashboard
    atualizarDashboard();
});