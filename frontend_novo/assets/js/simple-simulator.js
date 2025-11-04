console.log('Assistente RH - Sistema iniciado');

// Funcoes globais simples
function updateStatus() {
    const statusElement = document.getElementById('backend-status');
    if (statusElement) {
        statusElement.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i> Sistema Ativo';
    }
}

function simulateInterview() {
    const btn = document.getElementById('simulate-interview');
    if (!btn) return;
    
    const originalText = btn.innerHTML;
    
    // Fase 1
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando...';
    btn.disabled = true;
    
    setTimeout(() => {
        // Fase 2
        btn.innerHTML = '<i class="fas fa-microphone" style="color: red;"></i> Gravando...';
        
        setTimeout(() => {
            // Fase 3
            btn.innerHTML = '<i class="fas fa-brain fa-spin" style="color: purple;"></i> Analisando...';
            
            setTimeout(() => {
                // Fase 4
                btn.innerHTML = '<i class="fas fa-check" style="color: green;"></i> Concluido!';
                
                // Mostrar resultado
                showResult();
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 3000);
                
            }, 3000);
        }, 2000);
    }, 2000);
}

function showResult() {
    const container = document.getElementById('interview-result');
    if (!container) return;
    
    container.innerHTML = 
        '<div style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin: 2rem 0;">' +
            '<h3 style="color: #4f46e5; margin-bottom: 1rem;"><i class="fas fa-robot"></i> Resultado da Analise IA</h3>' +
            
            '<div style="display: grid; gap: 1rem; margin-bottom: 2rem;">' +
                '<div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8fafc; border-radius: 8px;">' +
                    '<span>Confianca:</span>' +
                    '<span style="font-weight: bold; color: #10b981;">87%</span>' +
                '</div>' +
                '<div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8fafc; border-radius: 8px;">' +
                    '<span>Entusiasmo:</span>' +
                    '<span style="font-weight: bold; color: #10b981;">92%</span>' +
                '</div>' +
                '<div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8fafc; border-radius: 8px;">' +
                    '<span>Clareza:</span>' +
                    '<span style="font-weight: bold; color: #10b981;">94%</span>' +
                '</div>' +
                '<div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8fafc; border-radius: 8px;">' +
                    '<span>Nervosismo:</span>' +
                    '<span style="font-weight: bold; color: #ef4444;">23%</span>' +
                '</div>' +
            '</div>' +
            
            '<div style="display: flex; align-items: center; gap: 2rem; padding: 2rem; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; margin-bottom: 2rem;">' +
                '<div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);">' +
                    '<span style="font-size: 2rem; font-weight: 900;">85</span>' +
                    '<span style="font-size: 0.8rem; font-weight: 600;">PONTOS</span>' +
                '</div>' +
                '<div>' +
                    '<div style="display: flex; align-items: center; gap: 0.5rem; font-size: 1.2rem; font-weight: 700; margin-bottom: 1rem; color: #059669;">' +
                        '<i class="fas fa-thumbs-up"></i>' +
                        '<strong>RECOMENDACAO: APROVAR</strong>' +
                    '</div>' +
                    '<p>Candidato demonstra alta competencia tecnica e excelentes soft skills. Perfil adequado para a vaga.</p>' +
                '</div>' +
            '</div>' +
            
            '<div style="display: flex; gap: 1rem; flex-wrap: wrap;">' +
                '<button onclick="showToast(\'Candidato aprovado!\')" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer;">' +
                    '<i class="fas fa-check"></i> Aprovar' +
                '</button>' +
                '<button onclick="showToast(\'Proxima fase agendada!\')" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer;">' +
                    '<i class="fas fa-calendar"></i> Agendar' +
                '</button>' +
                '<button onclick="showToast(\'Relatorio gerado!\')" style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer;">' +
                    '<i class="fas fa-file-pdf"></i> Relatorio' +
                '</button>' +
            '</div>' +
        '</div>';
}

function showNewInterviewModal() {
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    
    modal.innerHTML = 
        '<div style="background: white; border-radius: 15px; width: 90%; max-width: 500px; padding: 2rem;">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">' +
                '<h3><i class="fas fa-microphone"></i> Nova Entrevista</h3>' +
                '<button onclick="this.closest(\'div\').parentElement.remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>' +
            '</div>' +
            
            '<div style="margin-bottom: 1.5rem;">' +
                '<label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Nome do Candidato:</label>' +
                '<input type="text" id="candidate-name" placeholder="Ex: Joao Silva" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px;">' +
            '</div>' +
            
            '<div style="margin-bottom: 1.5rem;">' +
                '<label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Cargo:</label>' +
                '<select id="candidate-position" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px;">' +
                    '<option value="">Selecione o cargo</option>' +
                    '<option value="desenvolvedor">Desenvolvedor Full Stack</option>' +
                    '<option value="designer">UX/UI Designer</option>' +
                    '<option value="data-scientist">Data Scientist</option>' +
                '</select>' +
            '</div>' +
            
            '<div style="display: flex; justify-content: flex-end; gap: 1rem;">' +
                '<button onclick="this.closest(\'div\').parentElement.remove()" style="background: #f3f4f6; color: #374151; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">Cancelar</button>' +
                '<button onclick="createInterview()" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;"><i class="fas fa-play"></i> Iniciar</button>' +
            '</div>' +
        '</div>';
    
    document.body.appendChild(modal);
}

function createInterview() {
    const name = document.getElementById('candidate-name').value;
    const position = document.getElementById('candidate-position').value;
    
    if (!name || !position) {
        alert('Preencha todos os campos!');
        return;
    }
    
    document.querySelector('[style*="position: fixed"]').remove();
    showToast('Entrevista criada para ' + name);
    
    setTimeout(() => {
        simulateInterview();
    }, 1000);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: white; padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); z-index: 10001; border-left: 4px solid #10b981; color: #10b981; font-weight: 600;';
    toast.innerHTML = '<i class="fas fa-check-circle"></i> ' + message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Inicializar quando carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema carregado');
    updateStatus();
    
    // Configurar botoes
    const simulateBtn = document.getElementById('simulate-interview');
    if (simulateBtn) {
        simulateBtn.addEventListener('click', simulateInterview);
    }
    
    const newInterviewBtn = document.getElementById('new-interview');
    if (newInterviewBtn) {
        newInterviewBtn.addEventListener('click', showNewInterviewModal);
    }
});
