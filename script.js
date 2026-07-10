// ================================
// VARIÁVEIS GLOBAIS E ESTADO
// ================================
let calendar;
let eventoSelecionado = null;
let eventoMenu = null;
const menuEvento = document.getElementById("menuEvento");
const SENHA_SEGURANCA = "262505";

// ================================
// Dados para os seletores dinâmicos
// ================================
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

// ================================
// INICIALIZAÇÃO
// ================================
document.addEventListener("DOMContentLoaded", () => {
    iniciarMunicipios();
    iniciarCalendario();
    iniciarModais();
    iniciarFiltros();
});

// ================================
// COMPONENTES DE INTERFACE
// ================================
function iniciarMunicipios() {
    const selectMunicipio = document.getElementById("municipio");
    const selectUnidade = document.getElementById("unidade");

    if (!selectMunicipio || !selectUnidade) return;

    for (let cidade in municipios) {
        let option = document.createElement("option");
        option.value = cidade;
        option.textContent = cidade;
        selectMunicipio.appendChild(option);
    }

    selectMunicipio.addEventListener("change", function () {
        selectUnidade.innerHTML = '<option value="">Selecione...</option>';
        let cidadeSelecionada = this.value;

        if (cidadeSelecionada && municipios[cidadeSelecionada]) {
            municipios[cidadeSelecionada].forEach(unidade => {
                let option = document.createElement("option");
                option.value = unidade;
                option.textContent = unidade;
                selectUnidade.appendChild(option);
            });
        }
    });
}

function iniciarModais() {
    const btnFecharCadastro = document.querySelector("#modal .fechar");
    if (btnFecharCadastro) {
        btnFecharCadastro.onclick = () => {
            document.getElementById("modal").style.display = "none";
            eventoSelecionado = null;
        };
    }

    const btnFecharDetalhes = document.querySelector(".fechar-detalhes");
    if (btnFecharDetalhes) {
        btnFecharDetalhes.onclick = () => {
            document.getElementById("detalhesEvento").style.display = "none";
        };
    }

    // Fecha os menus e modais ao clicar fora deles
    window.onclick = (e) => {
        const modalCadastro = document.getElementById("modal");
        const modalDetalhes = document.getElementById("detalhesEvento");

        if (e.target === modalCadastro) {
            modalCadastro.style.display = "none";
            eventoSelecionado = null;
        }
        if (e.target === modalDetalhes) {
            modalDetalhes.style.display = "none";
        }
        if (menuEvento && !menuEvento.contains(e.target)) {
            menuEvento.style.display = "none";
        }
    };

    // Criar evento a partir dos Cards superiores
    document.querySelectorAll(".card").forEach(card => {
        card.onclick = () => {
            let tituloCard = card.querySelector("h2").innerText;
            let tipoLimpo = tituloCard.replace(/[^a-zA-ZáàâãéèêíïóôõöúçÑ ]/g, '').trim();
            abrirModalCadastro(tipoLimpo);
        };
    });
}

function abrirModalCadastro(titulo, dadosEdicao = null) {
    document.getElementById("tituloModal").innerHTML = titulo;
    document.getElementById("modal").style.display = "flex";
    
    const camposExtrasContainer = document.getElementById('camposExtras');
    camposExtrasContainer.innerHTML = '';

    if (titulo.includes('Treinamento')) {
        camposExtrasContainer.innerHTML = `
            <div>
                <label>Tema do Treinamento</label>
                <input type="text" id="temaTreinamento" placeholder="Ex: Módulo Inicial de Faturamento" required value="${dadosEdicao?.extendedProps?.tema || ''}">
            </div>
        `;
    } else if (titulo.includes('Visita')) {
        camposExtrasContainer.innerHTML = `
            <div>
                <label>Motivo da Visita</label>
                <input type="text" id="motivoVisita" placeholder="Ex: Alinhamento técnico com a coordenação" required value="${dadosEdicao?.extendedProps?.motivo || ''}">
            </div>
        `;
    }

    if (dadosEdicao) {
        const dataStr = dadosEdicao.startStr || new Date(dadosEdicao.start).toISOString();
        document.getElementById("data").value = dataStr.substring(0, 10);
        document.getElementById("hora").value = dataStr.substring(11, 16) || "08:00";
        document.getElementById("municipio").value = dadosEdicao.extendedProps?.municipio || "";
        
        document.getElementById("municipio").dispatchEvent(new Event('change'));
        document.getElementById("unidade").value = dadosEdicao.extendedProps?.unidade || "";
        
        document.getElementById("sistema").value = dadosEdicao.extendedProps?.sistema || "";
        document.getElementById("status").value = dadosEdicao.extendedProps?.status || "Pendente";
        document.getElementById("responsavel").value = dadosEdicao.extendedProps?.responsavel || "";
        document.getElementById("observacao").value = dadosEdicao.extendedProps?.observacao || "";
    } else {
        document.getElementById("formEvento").reset();
    }
}

function abrirModalDetalhes(evento) {
    const conteudo = document.getElementById("conteudoDetalhes");
    const dataFormatada = evento.start ? new Date(evento.start).toLocaleDateString("pt-BR") : "-";
    const horaFormatada = evento.start ? new Date(evento.start).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }) : "-";
    
    const isCancelado = evento.extendedProps?.status === 'Cancelado';

    conteudo.innerHTML = `
        <p><strong>Evento:</strong> ${evento.title}</p>
        <p><strong>Data:</strong> ${dataFormatada}</p>
        <p><strong>Hora:</strong> ${horaFormatada}</p>
        <p><strong>Município:</strong> ${evento.extendedProps?.municipio || "-"}</p>
        <p><strong>Unidade:</strong> ${evento.extendedProps?.unidade || "-"}</p>
        <p><strong>Sistema:</strong> ${evento.extendedProps?.sistema || "-"}</p>
        <p><strong>Responsável Original:</strong> ${evento.extendedProps?.responsavel || "-"}</p>
        <p><strong>Status:</strong> <span style="color: ${isCancelado ? 'red' : 'green'}; font-weight: bold;">${evento.extendedProps?.status || "-"}</span></p>
        
        ${isCancelado && evento.extendedProps?.responsavelCancelamento ? `
            <div style="background-color: #ffeeeb; border-left: 4px solid #ef4444; padding: 10px; margin: 15px 0; border-radius: 4px;">
                <p style="margin: 0; color: #b91c1c;"><strong>❌ Cancelado por:</strong> ${evento.extendedProps.responsavelCancelamento}</p>
            </div>
        ` : ""}

        <p><strong>Observação:</strong><br><span style="white-space: pre-line;">${evento.extendedProps?.observacao || "-"}</span></p>
        ${evento.extendedProps?.tema ? `<p><strong>Tema:</strong> ${evento.extendedProps.tema}</p>` : ""}
        ${evento.extendedProps?.motivo ? `<p><strong>Motivo:</strong> ${evento.extendedProps.motivo}</p>` : ""}
    `;

    document.getElementById("detalhesEvento").style.display = "flex";
}

// ================================
// CALENDÁRIO
// ================================
function iniciarCalendario() {
    const calendarEl = document.getElementById("calendar");
    if (!calendarEl) return;

    calendar = new FullCalendar.Calendar(calendarEl, {
        locale: "pt-br",
        initialView: "dayGridMonth",
        firstDay: 1,
        weekends: false,
        selectable: true,
        height: "auto",
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
        },
        buttonText: {
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia"
        },
        dateClick(info) {
            document.getElementById("data").value = info.dateStr;
            document.getElementById("hora").value = "08:00";
            abrirModalCadastro("Novo Treinamento");
        },
        // CLIQUE ESQUERDO
        eventClick(info) {
            info.jsEvent.preventDefault();
            info.jsEvent.stopPropagation();
            abrirModalDetalhes(info.event);
        },
        // CLIQUE DIREITO
        eventDidMount(info) {
            info.el.addEventListener("contextmenu", function(e) {
                e.preventDefault(); 
                e.stopPropagation();

                eventoMenu = info.event;
                
                menuEvento.style.display = "flex";
                menuEvento.style.left = e.clientX + "px";
                menuEvento.style.top = e.clientY + "px";
            });
        }
    });

    calendar.render();
    carregarEventos();
}

// ================================
// FORMULÁRIO E OPERAÇÕES (CRUD)
// ================================
document.getElementById("formEvento").addEventListener("submit", function (e) {
    e.preventDefault();

    let titulo = document.getElementById("tituloModal").innerHTML;
    let inicio = document.getElementById("data").value + "T" + document.getElementById("hora").value;
    let municipioSel = document.getElementById("municipio").value;
    let unidadeSel = document.getElementById("unidade").value || "Geral";
    let sistemaSel = document.getElementById("sistema").value;
    let statusSel = document.getElementById("status").value;
    let responsavelSel = document.getElementById("responsavel").value;
    let observacaoSel = document.getElementById("observacao").value;

    let campoTema = document.getElementById("temaTreinamento");
    let campoMotivo = document.getElementById("motivoVisita");
    
    let extendedProps = {
        municipio: municipioSel,
        unidade: unidadeSel,
        sistema: sistemaSel,
        status: statusSel,
        responsavel: responsavelSel,
        observacao: observacaoSel,
        tema: campoTema ? campoTema.value : "",
        motivo: campoMotivo ? campoMotivo.value : ""
    };

    let backgroundColor = statusSel === "Cancelado" ? corEvento("Cancelado") : corEvento(titulo);

    if (eventoSelecionado) {
        eventoSelecionado.setProp("title", titulo.includes(" - ") ? titulo : titulo + " - " + unidadeSel);
        eventoSelecionado.setStart(inicio);
        eventoSelecionado.setProp("backgroundColor", backgroundColor);
        eventoSelecionado.setProp("borderColor", backgroundColor);
        for (let prop in extendedProps) {
            eventoSelecionado.setExtendedProp(prop, extendedProps[prop]);
        }
    } else {
        calendar.addEvent({
            title: titulo + " - " + unidadeSel,
            start: inicio,
            backgroundColor: backgroundColor,
            borderColor: backgroundColor,
            textColor: "#fff",
            extendedProps: extendedProps
        });
    }

    salvarEventos();
    atualizarResumo();
    atualizarListaEventos();

    document.getElementById("modal").style.display = "none";
    this.reset();
    eventoSelecionado = null;
});

function corEvento(tipo) {
    if (tipo.includes("Treinamento")) return "#2563eb"; 
    if (tipo.includes("Visita")) return "#f59e0b";      
    if (tipo.includes("Demanda")) return "#8b5cf6";     
    if (tipo.includes("Cancelar") || tipo.includes("Cancelamento") || tipo.includes("Cancelado")) return "#ef4444"; 
    return "#22c55e"; 
}

// ================================
// PERSISTÊNCIA (LOCALSTORAGE)
// ================================
function salvarEventos() {
    let lista = [];
    calendar.getEvents().forEach(evento => {
        lista.push({
            title: evento.title,
            start: evento.startStr || evento.start,
            backgroundColor: evento.backgroundColor,
            borderColor: evento.borderColor,
            extendedProps: evento.extendedProps
        });
    });
    localStorage.setItem("eventos", JSON.stringify(lista));
}

function carregarEventos() {
    let lista = JSON.parse(localStorage.getItem("eventos")) || [];
    lista.forEach(evento => {
        calendar.addEvent(evento);
    });
    atualizarResumo();
    atualizarListaEventos();
}

// ================================
// DASHBOARD ATUALIZADORES
// ================================
function atualizarResumo() {
    let treinamento = 0, visita = 0, demanda = 0, cancelado = 0;

    calendar.getEvents().forEach(evento => {
        const status = evento.extendedProps?.status;
        
        if (status === "Cancelado" || evento.title.includes("Cancelar") || evento.title.includes("Cancelamento")) {
            cancelado++;
        } else {
            if (evento.title.includes("Treinamento")) treinamento++;
            if (evento.title.includes("Visita")) visita++;
            if (evento.title.includes("Demanda")) demanda++;
        }
    });

    if(document.getElementById("totalTreinamentos")) document.getElementById("totalTreinamentos").innerHTML = treinamento;
    if(document.getElementById("totalVisitas")) document.getElementById("totalVisitas").innerHTML = visita;
    if(document.getElementById("totalDemandas")) document.getElementById("totalDemandas").innerHTML = demanda;

    if(document.getElementById("cardTreinamentos")) document.getElementById("cardTreinamentos").innerHTML = treinamento;
    if(document.getElementById("cardVisitas")) document.getElementById("cardVisitas").innerHTML = visita;
    if(document.getElementById("cardDemandas")) document.getElementById("cardDemandas").innerHTML = demanda;
    if(document.getElementById("cardCancelados")) document.getElementById("cardCancelados").innerHTML = cancelado;
}

function atualizarListaEventos() {
    let lista = document.getElementById("listaEventos");
    if (!lista) return;
    lista.innerHTML = "";

    calendar.getEvents().forEach(evento => {
        let div = document.createElement("div");
        div.className = "itemEvento";
        let dataFormatada = evento.start ? new Date(evento.start).toLocaleDateString("pt-BR") : "";
        const isCancelado = evento.extendedProps?.status === 'Cancelado';

        div.innerHTML = `
            <h4 style="${isCancelado ? 'text-decoration: line-through; color: #aaa;' : ''}">${evento.title}</h4>
            <p>📅 ${dataFormatada} ${isCancelado ? '<strong>(Cancelado)</strong>' : ''}</p>
        `;
        
        div.onclick = () => abrirModalDetalhes(evento);
        lista.appendChild(div);
    });
}

function iniciarFiltros() {
    document.querySelectorAll(".filtro").forEach(botao => {
        botao.onclick = () => {
            let tipo = botao.dataset.tipo;
            calendar.getEvents().forEach(evento => {
                if (tipo == "Todos") {
                    evento.setProp("display", "auto");
                } else if (evento.title.includes(tipo) || (tipo === "Cancelar" && evento.extendedProps?.status === "Cancelado")) {
                    evento.setProp("display", "auto");
                } else {
                    evento.setProp("display", "none");
                }
            });
        };
    });
}

// ================================
// AÇÕES DO MENU CONTEXTUAL
// ================================

// FUNÇÃO PARA VALIDAR A SENHA
function verificarSenhaAutorizacao() {
    let senhaDigitada = prompt("⚠️ Esta ação requer autorização.\nDigite a senha para prosseguir:");
    
    if (senhaDigitada === null) return false; 
    
    if (senhaDigitada === SENHA_SEGURANCA) {
        return true; 
    } else {
        alert("❌ Senha incorreta! Operação cancelada.");
        return false;
    }
}

// EDITAR (REQUER SENHA)
if (document.getElementById("btnEditar")) {
    document.getElementById("btnEditar").onclick = () => {
        if (eventoMenu) {
            if (verificarSenhaAutorizacao()) {
                eventoSelecionado = eventoMenu;
                abrirModalCadastro(eventoMenu.title, eventoMenu);
            }
        }
        menuEvento.style.display = "none";
    };
}

// APAGAR DEFINITIVAMENTE (REQUER SENHA)
const btnApagar = document.getElementById("btnApagar");
if (btnApagar) {
    btnApagar.onclick = () => {
        if (eventoMenu) {
            if (verificarSenhaAutorizacao()) {
                if (confirm(`Excluir permanentemente "${eventoMenu.title}"?`)) {
                    eventoMenu.remove();
                    salvarEventos();
                    atualizarResumo();
                    atualizarListaEventos();
                    alert("Compromisso excluído!");
                }
            }
        }
        menuEvento.style.display = "none";
    };
}

// CANCELAR COMPROMISSO (LIVRE - APENAS PÕE O NOME)
const btnCancelarCompromisso = document.getElementById("btnCancelarCompromisso");
if (btnCancelarCompromisso) {
    btnCancelarCompromisso.onclick = () => {
        if (eventoMenu) {
            let quemCancelou = prompt("Por favor, digite o nome de quem está cancelando:");
            
            if (quemCancelou === null) {
                menuEvento.style.display = "none";
                return;
            }
            
            if (quemCancelou.trim() === "") {
                alert("É necessário informar o nome.");
                menuEvento.style.display = "none";
                return;
            }

            eventoMenu.setExtendedProp("status", "Cancelado");
            eventoMenu.setExtendedProp("responsavelCancelamento", quemCancelou.trim());
            
            let obsAtual = eventoMenu.extendedProps?.observacao || "";
            let dataHoraHoje = new Date().toLocaleString("pt-BR");
            eventoMenu.setExtendedProp(
                "observacao", 
                `${obsAtual}\n[Cancelado por ${quemCancelou.trim()} em ${dataHoraHoje}]`.trim()
            );
            
            eventoMenu.setProp("backgroundColor", corEvento("Cancelado"));
            eventoMenu.setProp("borderColor", corEvento("Cancelado"));

            salvarEventos();
            atualizarResumo();
            atualizarListaEventos();
            
            alert("Compromisso cancelado!");
        }
        menuEvento.style.display = "none";
    };
}

// DUPLICAR (LIVRE)
if (document.getElementById("btnDuplicar")) {
    document.getElementById("btnDuplicar").onclick = () => {
        if (eventoMenu) {
            calendar.addEvent({
                title: eventoMenu.title,
                start: eventoMenu.startStr || eventoMenu.start,
                backgroundColor: eventoMenu.backgroundColor,
                borderColor: eventoMenu.borderColor,
                extendedProps: { ...eventoMenu.extendedProps }
            });
            salvarEventos();
            atualizarResumo();
            atualizarListaEventos();
        }
        menuEvento.style.display = "none";
    };
}