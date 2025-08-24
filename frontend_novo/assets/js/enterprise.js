// ENTERPRISE DASHBOARD JAVASCRIPT
class EnterpriseDashboard {
    constructor() {
        this.init();
        this.setupCharts();
        this.setupInteractions();
        this.startRealTimeUpdates();
    }

    init() {
        console.log('🚀 Enterprise Dashboard Initialized');
        this.showLoadingAnimation();
        
        // Simular carregamento
        setTimeout(() => {
            this.hideLoadingAnimation();
            this.animateStats();
        }, 1500);
    }

    showLoadingAnimation() {
        // Adicionar overlay de loading se necessário
        document.body.style.opacity = '0.8';
    }

    hideLoadingAnimation() {
        document.body.style.opacity = '1';
    }

    animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach((stat, index) => {
            const finalValue = stat.textContent;
            const numericValue = parseFloat(finalValue.replace(/[^0-9.]/g, ''));
            
            if (!isNaN(numericValue)) {
                this.animateNumber(stat, 0, numericValue, finalValue.includes('%') ? '%' : '', 2000 + (index * 200));
            }
        });
    }

    animateNumber(element, start, end, suffix = '', duration = 2000) {
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * easeOutCubic;
            
            if (suffix === '%') {
                element.textContent = current.toFixed(1) + suffix;
            } else if (end >= 1000) {
                element.textContent = Math.floor(current).toLocaleString() + suffix;
            } else {
                element.textContent = Math.floor(current) + suffix;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    setupCharts() {
        // Chart.js para gráficos profissionais
        this.setupCandidatesChart();
        this.setupStatusChart();
    }

    setupCandidatesChart() {
        const ctx = document.getElementById('candidatesChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Candidatos',
                    data: [65, 78, 90, 81, 96, 124],
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    setupStatusChart() {
        const ctx = document.getElementById('statusChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Aprovados', 'Em Análise', 'Reprovados'],
                datasets: [{
                    data: [67, 23, 10],
                    backgroundColor: [
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    setupInteractions() {
        // Hover effects para cards
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Navigation active state
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    startRealTimeUpdates() {
        // Simular atualizações em tempo real
        setInterval(() => {
            this.updateNotificationBadge();
            this.updateStats();
        }, 30000); // A cada 30 segundos
    }

    updateNotificationBadge() {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            const currentCount = parseInt(badge.textContent);
            const newCount = Math.max(0, currentCount + Math.floor(Math.random() * 3) - 1);
            badge.textContent = newCount;
            
            if (newCount > 0) {
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    updateStats() {
        // Simular pequenas variações nos stats
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const currentValue = parseFloat(stat.textContent.replace(/[^0-9.]/g, ''));
            if (!isNaN(currentValue)) {
                const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
                const newValue = currentValue * (1 + variation);
                
                if (stat.textContent.includes('%')) {
                    stat.textContent = newValue.toFixed(1) + '%';
                } else if (currentValue >= 1000) {
                    stat.textContent = Math.floor(newValue).toLocaleString();
                } else {
                    stat.textContent = Math.floor(newValue);
                }
            }
        });
    }
}

// Função para exportar relatório
function exportReport() {
    const btn = document.querySelector('.export-btn');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Exportando...</span>';
    btn.disabled = true;
    
    // Simular export
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> <span>Exportado!</span>';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            
            // Mostrar mensagem de sucesso
            showSuccessMessage('Relatório exportado com sucesso!');
        }, 2000);
    }, 3000);
}

function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-success';
    toast.innerHTML = 
        <i class="fas fa-check-circle"></i>
        <span></span>
    ;
    
    toast.style.cssText = 
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    ;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Adicionar animações CSS via JavaScript
const style = document.createElement('style');
style.textContent = 
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
;
document.head.appendChild(style);

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new EnterpriseDashboard();
});

// Adicionar efeitos de partículas no background (opcional)
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    particlesContainer.style.cssText = 
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
    ;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = 
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            animation: float s infinite linear;
            left: %;
            top: %;
        ;
        particlesContainer.appendChild(particle);
    }
    
    document.body.appendChild(particlesContainer);
}

// Adicionar animação de float para partículas
const particleStyle = document.createElement('style');
particleStyle.textContent = 
    @keyframes float {
        0% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
;
document.head.appendChild(particleStyle);

// Inicializar partículas
setTimeout(createParticles, 1000);

console.log('🎯 Enterprise Dashboard System Ready!');
