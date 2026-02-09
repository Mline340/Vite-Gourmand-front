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

async function loadStats() {
    console.log("🟢 loadStats appelée");
    
    try {
        // Attend que Chart.js soit chargé
        await loadChartJS();
        console.log("✅ Chart.js chargé");
        
        const response = await fetch(`${apiUrl}admin/stats/commandes-par-menu`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        const stats = data.member || data;
        
        createChart(stats);
        createTable(stats);
        
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

function createTable(stats) {
    const tableContainer = document.getElementById('statsTable');
    
    // 🔒 SÉCURITÉ XSS : Créer le tableau de façon sécurisée
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
        
        // Menu
        const tdMenu = document.createElement('td');
        tdMenu.textContent = s.menuLibelle;
        row.appendChild(tdMenu);
        
        // Nombre de commandes
        const tdNb = document.createElement('td');
        tdNb.textContent = s.nombreCommandes;
        row.appendChild(tdNb);
        
        // Prix par personne
        const tdPrix = document.createElement('td');
        tdPrix.textContent = s.prixParPersonne + '€';
        row.appendChild(tdPrix);
        
        // Chiffre d'affaires
        const tdCA = document.createElement('td');
        tdCA.textContent = s.chiffreAffaires + '€';
        row.appendChild(tdCA);
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    
    // Remplacer le contenu
    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);
}

// Charge les stats au chargement de la page
loadStats();