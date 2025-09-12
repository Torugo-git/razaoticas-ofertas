document.addEventListener('DOMContentLoaded', () => {
    // --- REFERÊNCIAS AOS ELEMENTOS DO DOM ---
    const leadsTableBody = document.getElementById('leads-table-body');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    // KPIs
    const kpiTotalLeads = document.getElementById('kpi-total-leads');
    const kpiLeadsToday = document.getElementById('kpi-leads-today');
    const kpiBestUnit = document.getElementById('kpi-best-unit');
    const kpiBestCampaign = document.getElementById('kpi-best-campaign');

    // Filtros e Ações
    const filtersForm = document.getElementById('filters-form');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const unitFilterInput = document.getElementById('unit-filter');
    const clearFiltersButton = document.getElementById('clear-filters');
    const searchInput = document.getElementById('search-input');
    const exportCsvButton = document.getElementById('export-csv');
    
    // Paginação
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    // Cabeçalhos da Tabela para Ordenação
    const sortableHeaders = document.querySelectorAll('th.sortable');

    // --- VARIÁVEIS DE ESTADO ---
    let allLeads = []; // Cache local com todos os leads do Firestore
    let displayedLeads = []; // Leads atualmente filtrados e ordenados
    let currentPage = 1;
    const LEADS_PER_PAGE = 15;
    let sortState = { column: 'dataCadastro', direction: 'desc' }; // Ordenação inicial

    // --- FUNÇÕES AUXILIARES ---
    function formatTimestamp(timestamp) {
        if (!timestamp || !timestamp.toDate) return 'Data inválida';
        const date = timestamp.toDate();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    function formatUnitName(unitSlug) {
        if (!unitSlug) return 'Não especificada';
        return unitSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    // --- FUNÇÕES PRINCIPAIS DE RENDERIZAÇÃO E LÓGICA ---

    /**
     * Renderiza uma página específica de leads na tabela.
     */
    function renderTablePage() {
        leadsTableBody.innerHTML = ''; // Clear existing rows safely
        const startIndex = (currentPage - 1) * LEADS_PER_PAGE;
        const endIndex = startIndex + LEADS_PER_PAGE;
        const pageLeads = displayedLeads.slice(startIndex, endIndex);

        if (pageLeads.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 6;
            td.textContent = 'Nenhum lead encontrado.';
            td.style.textAlign = 'center';
            tr.appendChild(td);
            leadsTableBody.appendChild(tr);
            return;
        }

        // Helper function to create table cells safely
        const createCell = (text) => {
            const td = document.createElement('td');
            td.textContent = text;
            return td;
        };

        pageLeads.forEach(lead => {
            const tr = document.createElement('tr');

            tr.appendChild(createCell(formatTimestamp(lead.dataCadastro)));
            tr.appendChild(createCell(lead.nome || ''));
            tr.appendChild(createCell(lead.telefone || ''));
            tr.appendChild(createCell(lead.email || ''));
            tr.appendChild(createCell(formatUnitName(lead.unidade)));
            tr.appendChild(createCell(lead.origem ? (lead.origem.campaign || 'N/A') : 'N/A'));

            leadsTableBody.appendChild(tr);
        });
    }

    /**
     * Atualiza os controlos de paginação (botões e texto).
     */
    function updatePagination() {
        const totalPages = Math.ceil(displayedLeads.length / LEADS_PER_PAGE);
        pageInfo.textContent = `Página ${currentPage} de ${totalPages > 0 ? totalPages : 1}`;
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages || totalPages === 0;
    }

    /**
     * Atualiza os cartões de KPI com base em todos os leads.
     */
    function updateKpis(leads) {
        kpiTotalLeads.textContent = leads.length;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const leadsToday = leads.filter(l => l.dataCadastro && l.dataCadastro.toDate() >= today);
        kpiLeadsToday.textContent = leadsToday.length;
        
        const calculateBestOf = (key) => {
            if (leads.length === 0) return "N/A";
            const counts = leads.reduce((acc, lead) => {
                const value = key === 'unidade' ? lead.unidade : lead.origem?.campaign;
                if (value) {
                    acc[value] = (acc[value] || 0) + 1;
                }
                return acc;
            }, {});
            if (Object.keys(counts).length === 0) return "N/A";
            const bestSlug = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
            return key === 'unidade' ? formatUnitName(bestSlug) : bestSlug;
        };

        kpiBestUnit.textContent = calculateBestOf('unidade');
        kpiBestCampaign.textContent = calculateBestOf('campaign');
    }
    
    /**
     * Função central que aplica filtros, ordenação e atualiza a exibição.
     */
    function updateDisplay() {
        // 1. Aplicar Filtros
        const startDate = startDateInput.value ? new Date(startDateInput.value + 'T00:00:00') : null;
        const endDate = endDateInput.value ? new Date(endDateInput.value + 'T23:59:59') : null;
        const selectedUnit = unitFilterInput.value;
        const searchTerm = searchInput.value.toLowerCase();

        let filteredLeads = allLeads.filter(lead => {
            const leadDate = lead.dataCadastro ? lead.dataCadastro.toDate() : null;
            if (!leadDate) return false;

            const isAfterStartDate = !startDate || leadDate >= startDate;
            const isBeforeEndDate = !endDate || leadDate <= endDate;
            const isCorrectUnit = !selectedUnit || lead.unidade === selectedUnit;
            const matchesSearch = !searchTerm || 
                (lead.nome && lead.nome.toLowerCase().includes(searchTerm)) ||
                (lead.email && lead.email.toLowerCase().includes(searchTerm)) ||
                (lead.telefone && lead.telefone.includes(searchTerm));

            return isAfterStartDate && isBeforeEndDate && isCorrectUnit && matchesSearch;
        });
        
        // 2. Aplicar Ordenação
        filteredLeads.sort((a, b) => {
            let valA, valB;
            if (sortState.column === 'dataCadastro') {
                valA = a.dataCadastro?.toMillis() || 0;
                valB = b.dataCadastro?.toMillis() || 0;
            } else if (sortState.column === 'campanha') {
                valA = a.origem?.campaign?.toLowerCase() || '';
                valB = b.origem?.campaign?.toLowerCase() || '';
            } else {
                valA = a[sortState.column]?.toLowerCase() || '';
                valB = b[sortState.column]?.toLowerCase() || '';
            }

            if (valA < valB) return sortState.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortState.direction === 'asc' ? 1 : -1;
            return 0;
        });

        displayedLeads = filteredLeads;
        
        // 3. Resetar para a primeira página e renderizar
        currentPage = 1;
        renderTablePage();
        updatePagination();
    }
    
    /**
     * Lida com a exportação dos dados para um ficheiro CSV.
     */
    function exportToCsv() {
        if (displayedLeads.length === 0) {
            alert("Não há dados para exportar.");
            return;
        }

        const headers = ["Data de Cadastro", "Nome", "Telefone", "Email", "Unidade", "Campanha (UTM)"];
        const rows = displayedLeads.map(lead => [
            `"${formatTimestamp(lead.dataCadastro)}"`,
            `"${lead.nome || ''}"`,
            `"${lead.telefone || ''}"`,
            `"${lead.email || ''}"`,
            `"${formatUnitName(lead.unidade)}"`,
            `"${lead.origem ? (lead.origem.campaign || 'N/A') : 'N/A'}"`
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(',')].concat(rows).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "leads_raza_oticas.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    /**
     * Busca todos os leads do Firestore uma única vez.
     */
    async function fetchAllLeadsOnce() {
        loadingSpinner.style.display = 'flex';
        try {
            const snapshot = await db.collection('leads').get();
            allLeads = snapshot.docs.map(doc => doc.data());
            
            updateDisplay(); // Aplica a ordenação inicial
            updateKpis(allLeads); // KPIs são calculados sobre o total

        } catch (error) {
            console.error("Erro ao buscar os leads:", error);
            leadsTableBody.innerHTML = `<tr><td colspan="6" style="color: red; text-align: center;">Erro ao carregar os dados.</td></tr>`;
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    // --- EVENT LISTENERS ---

    // Filtros e Pesquisa (em tempo real)
    [startDateInput, endDateInput, unitFilterInput].forEach(el => el.addEventListener('change', updateDisplay));
    searchInput.addEventListener('input', updateDisplay);
    
    // Limpar filtros
    clearFiltersButton.addEventListener('click', () => {
        filtersForm.reset(); // Limpa os campos do formulário
        searchInput.value = ''; // Limpa a pesquisa
        sortState = { column: 'dataCadastro', direction: 'desc' }; // Restaura ordenação padrão
        updateSortHeaders();
        updateDisplay();
    });
    
    // Paginação
    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTablePage();
            updatePagination();
        }
    });
    nextPageButton.addEventListener('click', () => {
        const totalPages = Math.ceil(displayedLeads.length / LEADS_PER_PAGE);
        if (currentPage < totalPages) {
            currentPage++;
            renderTablePage();
            updatePagination();
        }
    });

    // Ordenação
    function updateSortHeaders() {
        sortableHeaders.forEach(header => {
            const column = header.dataset.sort;
            const arrow = header.querySelector('.sort-arrow');
            if (column === sortState.column) {
                header.classList.add(sortState.direction);
                arrow.innerHTML = sortState.direction === 'asc' ? '&#9650;' : '&#9660;';
            } else {
                header.classList.remove('asc', 'desc');
                arrow.innerHTML = '&#8693;';
            }
        });
    }
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.sort;
            if (sortState.column === column) {
                sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
            } else {
                sortState.column = column;
                sortState.direction = 'desc';
            }
            updateSortHeaders();
            updateDisplay();
        });
    });

    // Exportar CSV
    exportCsvButton.addEventListener('click', exportToCsv);

    // --- INICIALIZAÇÃO ---
    auth.onAuthStateChanged(user => {
        if (user && window.location.pathname.includes('painel.html')) {
            fetchAllLeadsOnce();
            updateSortHeaders();
        }
    });
});