console.log("🔵 Statistique chargées !");

// FONCTION DE SÉCURITÉ CONTRE XSS
function escapeHtml(text) {
    if (!text) return 'Non renseigné';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function loadChartJS() {
    return new Promise((resolve, reject) => {
        if (typeof Chart !== 'undefined') {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

const token = localStorage.getItem('apiToken'); 
let allStats = []; // Stocker toutes les stats pour le filtrage

async function loadStats() {
    console.log("🟢 loadStats appelée");
    
    try {
        await loadChartJS();
        console.log("✅ Chart.js chargé");
        
        const response = await fetch(`${apiUrl}admin/stats/commandes-par-menu`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        const stats = data.member || data;
        
        // Stocker avec menuId pour le filtrage
        allStats = stats.map(s => ({
            menuId: s.menuId,
            menuLibelle: s.menuLibelle,
            nombreCommandes: s.nombreCommandes,
            chiffreAffaires: s.chiffreAffaires,
            prixParPersonne: s.prixParPersonne
        }));
        
        createChart(allStats);
        createFilters(allStats);
        createTable(allStats);
        
    } catch (error) {
        console.error('Erreur chargement stats:', error);
    }
}

function createChart(stats) {
    const canvas = document.getElementById('commandesChart');
    console.log("Canvas trouvé:", canvas);
    
    if (!canvas) {
        console.error("❌ Canvas non trouvé !");
        return;
    }
    const ctx = canvas.getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: stats.map(s => s.menuLibelle),
            datasets: [{
                label: 'Nombre de commandes',
                data: stats.map(s => s.nombreCommandes),
                backgroundColor: 'rgba(54, 162, 235, 0.6)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 🆕 CRÉATION DES FILTRES
function createFilters(stats) {
    const filterContainer = document.getElementById('filters');
    if (!filterContainer) return;
    
    filterContainer.innerHTML = '';
    
    // Filtre par menu
    const menuFilter = document.createElement('div');
    menuFilter.style.marginBottom = '15px';
    
    const menuLabel = document.createElement('label');
    menuLabel.textContent = 'Filtrer par menu : ';
    menuLabel.style.marginRight = '10px';
    
    const menuSelect = document.createElement('select');
    menuSelect.id = 'menuFilter';
    menuSelect.style.padding = '5px';
    
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = 'Tous les menus';
    menuSelect.appendChild(allOption);
    
    stats.forEach(s => {
        const option = document.createElement('option');
        option.value = s.menuLibelle;
        option.textContent = s.menuLibelle;
        menuSelect.appendChild(option);
    });
    
    menuFilter.appendChild(menuLabel);
    menuFilter.appendChild(menuSelect);
    
    // Filtre par période
    const periodFilter = document.createElement('div');
    periodFilter.style.marginBottom = '15px';
    
    const periodLabel = document.createElement('label');
    periodLabel.textContent = 'Période : ';
    periodLabel.style.marginRight = '10px';
    
    const periodSelect = document.createElement('select');
    periodSelect.id = 'periodFilter';
    periodSelect.style.padding = '5px';
    
    ['Toutes périodes', '7 derniers jours', '30 derniers jours', 'Ce mois', 'Cette année'].forEach(p => {
        const option = document.createElement('option');
        option.value = p;
        option.textContent = p;
        periodSelect.appendChild(option);
    });
    
    periodFilter.appendChild(periodLabel);
    periodFilter.appendChild(periodSelect);
    
    // Filtre par date précise
    const dateFilter = document.createElement('div');
    dateFilter.style.marginBottom = '15px';
    
    const dateLabel = document.createElement('label');
    dateLabel.textContent = 'Date précise : ';
    dateLabel.style.marginRight = '10px';
    
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.id = 'dateFilter';
    dateInput.style.padding = '5px';
    
    dateFilter.appendChild(dateLabel);
    dateFilter.appendChild(dateInput);
    
    // Bouton appliquer
    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Appliquer les filtres';
    applyBtn.onclick = applyFilters;
    applyBtn.style.marginLeft = '10px';
    applyBtn.style.padding = '5px 15px';
    
    filterContainer.appendChild(menuFilter);
    filterContainer.appendChild(periodFilter);
    filterContainer.appendChild(dateFilter);
    filterContainer.appendChild(applyBtn);
}

// 🆕 APPLIQUER LES FILTRES
async function applyFilters() {
    const menuValue = document.getElementById('menuFilter').value;
    const periodValue = document.getElementById('periodFilter').value;
    const dateValue = document.getElementById('dateFilter').value;
    
    // Construire l'URL avec paramètres
    let url = `${apiUrl}admin/stats/commandes-par-menu`;
    const params = new URLSearchParams();
    
    // Filtre par menu
    if (menuValue) {
        const menuId = allStats.find(s => s.menuLibelle === menuValue)?.menuId;
        if (menuId) params.append('menuId', menuId);
    }
    
    // Filtre par date précise
    if (dateValue) {
        params.append('dateDebut', dateValue);
        params.append('dateFin', dateValue);
    } 
    // Filtre par période
    else if (periodValue !== 'Toutes périodes') {
        const dates = calculerPeriode(periodValue);
        if (dates.debut) params.append('dateDebut', dates.debut);
        if (dates.fin) params.append('dateFin', dates.fin);
    }
    
    if (params.toString()) url += '?' + params.toString();
    
    console.log('🔍 URL API:', url);
    
    // Appeler l'API
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        const stats = data.member || data;
        console.log('✅ Stats filtrées:', stats);
        createTable(stats);
    } catch (error) {
        console.error('Erreur filtrage:', error);
    }
}

// Calculer les dates selon la période
function calculerPeriode(periode) {
    const aujourd = new Date();
    let debut = null;
    let fin = aujourd.toISOString().split('T')[0];
    
    switch(periode) {
        case '7 derniers jours':
            debut = new Date(aujourd);
            debut.setDate(debut.getDate() - 7);
            break;
        case '30 derniers jours':
            debut = new Date(aujourd);
            debut.setDate(debut.getDate() - 30);
            break;
        case 'Ce mois':
            debut = new Date(aujourd.getFullYear(), aujourd.getMonth(), 1);
            break;
        case 'Cette année':
            debut = new Date(aujourd.getFullYear(), 0, 1);
            break;
    }
    
    return {
        debut: debut ? debut.toISOString().split('T')[0] : null,
        fin: fin
    };
}

function createTable(stats) {
    const tableContainer = document.getElementById('statsTable');
    
    const table = document.createElement('table');
    
    // En-tête
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    ['Menu', 'Nb commandes', 'Prix/personne', 'CA brut'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Corps du tableau
    const tbody = document.createElement('tbody');
    
    stats.forEach(s => {
        const row = document.createElement('tr');
        
        const tdMenu = document.createElement('td');
        tdMenu.textContent = s.menuLibelle;
        row.appendChild(tdMenu);
        
        const tdNb = document.createElement('td');
        tdNb.textContent = s.nombreCommandes;
        row.appendChild(tdNb);
        
        const tdPrix = document.createElement('td');
        tdPrix.textContent = s.prixParPersonne + '€';
        row.appendChild(tdPrix);
        
        const tdCA = document.createElement('td');
        tdCA.textContent = s.chiffreAffaires + '€';
        row.appendChild(tdCA);
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    
    // Total
    const totalRow = document.createElement('tr');
    totalRow.style.fontWeight = 'bold';
    totalRow.style.backgroundColor = '#f0f0f0';
    
    const tdTotal = document.createElement('td');
    tdTotal.textContent = 'TOTAL';
    totalRow.appendChild(tdTotal);
    
    const tdTotalNb = document.createElement('td');
    tdTotalNb.textContent = stats.reduce((sum, s) => sum + s.nombreCommandes, 0);
    totalRow.appendChild(tdTotalNb);
    
    const tdEmpty = document.createElement('td');
    tdEmpty.textContent = '-';
    totalRow.appendChild(tdEmpty);
    
    const tdTotalCA = document.createElement('td');
    tdTotalCA.textContent = stats.reduce((sum, s) => sum + s.chiffreAffaires, 0) + '€';
    totalRow.appendChild(tdTotalCA);
    
    tbody.appendChild(totalRow);
    
    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);
}

async function synchroniserStats() {
    const token = localStorage.getItem('apiToken');
    
    const btn = document.getElementById('btn-sync-stats');
    btn.disabled = true;
    btn.textContent = 'Synchronisation en cours...';
    
    try {
        const response = await fetch('https://vite-gourmand-back.onrender.com/api/admin/stats/sync',{
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('✅ ' + data.message);
            location.reload();
        } else {
            alert('❌ Erreur : ' + (data.message || 'Erreur inconnue'));
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Erreur de connexion au serveur');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Synchroniser les statistiques';
    }
}

loadStats();