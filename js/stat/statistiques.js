console.log("🔵 Statistique chargées !");

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
    const table = `
        <table>
            <thead>
                <tr>
                    <th>Menu</th>
                    <th>Nb commandes</th>
                    <th>Prix/personne</th>
                    <th>CA brut</th>
                </tr>
            </thead>
            <tbody>
                ${stats.map(s => `
                    <tr>
                        <td>${s.menuLibelle}</td>
                        <td>${s.nombreCommandes}</td>
                        <td>${s.prixParPersonne}€</td>
                        <td>${s.chiffreAffaires}€</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    document.getElementById('statsTable').innerHTML = table;
}

// Charge les stats au chargement de la page
loadStats();
