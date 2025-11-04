// INTEGRAÇÃO FRONTEND-BACKEND - ASSISTENTE RH
class BackendIntegration {
    constructor() {
        this.baseURL = 'http://localhost:5000';
        this.token = null;
        this.init( );
    }

    async init() {
        console.log('🔗 Inicializando integração com backend...');
        await this.checkBackendHealth();
        this.setupEventListeners();
    }

    async checkBackendHealth() {
        try {
            const response = await fetch(${this.baseURL}/health/);
            const data = await response.json();
            console.log('✅ Backend conectado:', data.status);
            this.showConnectionStatus(true);
        } catch (error) {
            console.error('❌ Erro ao conectar com backend:', error);
            this.showConnectionStatus(false);
        }
    }

    showConnectionStatus(connected) {
        const statusElement = document.getElementById('backend-status');
        if (statusElement) {
            statusElement.innerHTML = connected 
                ? '<i class="fas fa-check-circle" style="color: #10b981;"></i> Backend Conectado'
                : '<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> Backend Desconectado';
        }
    }

    setupEventListeners() {
        // Botão de simulação de entrevista
        const simulateBtn = document.getElementById('simulate-interview');
        if (simulateBtn) {
            simulateBtn.addEventListener('click', () => this.simulateInterview());
        }

        // Botão de upload de áudio
        const uploadBtn = document.getElementById('upload-audio');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.uploadAudio());
        }

        // Botão de nova entrevista
        const newInterviewBtn = document.getElementById('new-interview');
        if (newInterviewBtn) {
            newInterviewBtn.addEventListener('click', () => this.startNewInterview());
        }
    }

    async simulateInterview() {
        const btn = document.getElementById('simulate-interview');
        const originalText = btn.innerHTML;
        
        try {
            // Fase 1: Iniciando
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando entrevista...';
            btn.disabled = true;
            await this.delay(2000);

            // Fase 2: Gravando
            btn.innerHTML = '<i class="fas fa-microphone fa-pulse"></i> Gravando áudio...';
            await this.delay(3000);

            // Fase 3: Processando
            btn.innerHTML = '<i class="fas fa-brain fa-spin"></i> Analisando com IA...';
            await this.delay(4000);

            // Fase 4: Resultado
            btn.innerHTML = '<i class="fas fa-check"></i> Análise Concluída!';
            
            // Mostrar resultado
            this.showInterviewResult();
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 3000);

        } catch (error) {
            console.error('Erro na simulação:', error);
            btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Erro na simulação';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);
        }
    }

    showInterviewResult() {
        const resultContainer = document.getElementById('interview-result');
        if (resultContainer) {
            resultContainer.innerHTML = 
                <div class="interview-result-card">
                    <div class="result-header">
                        <h3><i class="fas fa-robot"></i> Resultado da Análise IA</h3>
                        <span class="result-timestamp"></span>
                    </div>
                    
                    <div class="result-metrics">
                        <div class="metric-item">
                            <span class="metric-label">Confiança:</span>
                            <span class="metric-value high">87%</span>
                            <div class="metric-bar">
                                <div class="metric-fill" style="width: 87%; background: #10b981;"></div>
                            </div>
                        </div>
                        
                        <div class="metric-item">
                            <span class="metric-label">Entusiasmo:</span>
                            <span class="metric-value high">92%</span>
                            <div class="metric-bar">
                                <div class="metric-fill" style="width: 92%; background: #10b981;"></div>
                            </div>
                        </div>
                        
                        <div class="metric-item">
                            <span class="metric-label">Clareza:</span>
                            <span class="metric-value high">94%</span>
                            <div class="metric-bar">
                                <div class="metric-fill" style="width: 94%; background: #10b981;"></div>
                            </div>
                        </div>
                        
                        <div class="metric-item">
                            <span class="metric-label">Nervosismo:</span>
                            <span class="metric-value low">23%</span>
                            <div class="metric-bar">
                                <div class="metric-fill" style="width: 23%; background: #ef4444;"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="final-score">
                        <div class="score-circle">
                            <span class="score-number">85</span>
                            <span class="score-label">Pontos</span>
                        </div>
                        <div class="score-recommendation">
                            <div class="recommendation approved">
                                <i class="fas fa-thumbs-up"></i>
                                <strong>RECOMENDAÇÃO: APROVAR</strong>
                            </div>
                            <p>Candidato demonstra alta competência técnica e excelentes soft skills. Perfil adequado para a vaga.</p>
                        </div>
                    </div>
                    
                    <div class="result-actions">
                        <button class="action-btn approve" onclick="this.approveCandidate()">
                            <i class="fas fa-check"></i> Aprovar Candidato
                        </button>
                        <button class="action-btn schedule" onclick="this.scheduleNextInterview()">
                            <i class="fas fa-calendar"></i> Agendar Próxima Fase
                        </button>
                        <button class="action-btn report" onclick="this.generateReport()">
                            <i class="fas fa-file-pdf"></i> Gerar Relatório
                        </button>
                    </div>
                </div>
            ;
            
            // Animar entrada do resultado
            resultContainer.style.opacity = '0';
            resultContainer.style.transform = 'translateY(20px)';
            setTimeout(() => {
                resultContainer.style.transition = 'all 0.5s ease-out';
                resultContainer.style.opacity = '1';
                resultContainer.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    async startNewInterview() {
        const modal = document.createElement('div');
        modal.className = 'interview-modal';
        modal.innerHTML = 
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-microphone"></i> Nova Entrevista</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="form-group">
                        <label>Nome do Candidato:</label>
                        <input type="text" id="candidate-name" placeholder="Ex: João Silva" class="form-input">
                    </div>
                    
                    <div class="form-group">
                        <label>Cargo:</label>
                        <select id="candidate-position" class="form-select">
                            <option value="">Selecione o cargo</option>
                            <option value="desenvolvedor">Desenvolvedor Full Stack</option>
                            <option value="designer">UX/UI Designer</option>
                            <option value="data-scientist">Data Scientist</option>
                            <option value="product-manager">Product Manager</option>
                            <option value="devops">DevOps Engineer</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Tipo de Entrevista:</label>
                        <div class="radio-group">
                            <label class="radio-option">
                                <input type="radio" name="interview-type" value="audio" checked>
                                <span class="radio-custom"></span>
                                <i class="fas fa-microphone"></i> Análise de Áudio IA
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="interview-type" value="video">
                                <span class="radio-custom"></span>
                                <i class="fas fa-video"></i> Entrevista por Vídeo
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="interview-type" value="presencial">
                                <span class="radio-custom"></span>
                                <i class="fas fa-users"></i> Entrevista Presencial
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.interview-modal').remove()">
                        Cancelar
                    </button>
                    <button class="btn-primary" onclick="backendIntegration.createInterview()">
                        <i class="fas fa-play"></i> Iniciar Entrevista
                    </button>
                </div>
            </div>
        ;
        
        document.body.appendChild(modal);
    }

    async createInterview() {
        const name = document.getElementById('candidate-name').value;
        const position = document.getElementById('candidate-position').value;
        const type = document.querySelector('input[name="interview-type"]:checked').value;
        
        if (!name || !position) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        // Simular criação da entrevista
        const modal = document.querySelector('.interview-modal');
        const btn = modal.querySelector('.btn-primary');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';
        btn.disabled = true;
        
        await this.delay(2000);
        
        modal.remove();
        
        // Mostrar sucesso
        this.showToast(Entrevista criada para  - , 'success');
        
        // Se for análise de áudio, iniciar automaticamente
        if (type === 'audio') {
            setTimeout(() => {
                this.simulateInterview();
            }, 1000);
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 	oast toast-;
        toast.innerHTML = 
            <i class="fas fa-"></i>
            <span></span>
        ;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    approveCandidate() {
        this.showToast('Candidato aprovado com sucesso!', 'success');
    }

    scheduleNextInterview() {
        this.showToast('Próxima fase agendada!', 'success');
    }

    generateReport() {
        this.showToast('Relatório gerado e enviado por email!', 'success');
    }
}

// Inicializar quando a página carregar
let backendIntegration;
document.addEventListener('DOMContentLoaded', () => {
    backendIntegration = new BackendIntegration();
});
