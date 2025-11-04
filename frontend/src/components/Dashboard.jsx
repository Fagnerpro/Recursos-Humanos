import React from 'react';
import '../styles/professional.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="logo">
          <h1>Assistente RH</h1>
          <p>Sistema Inteligente Enterprise</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <h1>Dashboard Profissional</h1>
            <p>Sistema de Recrutamento com IA</p>
          </div>
          <button className="export-btn">
            📊 Exportar Relatório
          </button>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total de Candidatos</h3>
            <h2 style={{fontSize: '2.5rem', color: '#2563eb'}}>1.247</h2>
            <p style={{color: '#10b981'}}>↗ +12% Este mês</p>
          </div>
          
          <div className="stat-card">
            <h3>Entrevistas Hoje</h3>
            <h2 style={{fontSize: '2.5rem', color: '#2563eb'}}>8</h2>
            <p style={{color: '#ef4444'}}>↘ 3 agendadas</p>
          </div>
          
          <div className="stat-card">
            <h3>Taxa de Aprovação</h3>
            <h2 style={{fontSize: '2.5rem', color: '#2563eb'}}>73.2%</h2>
            <p style={{color: '#10b981'}}>↗ +5% Últimas 8h</p>
          </div>
          
          <div className="stat-card">
            <h3>Score Médio</h3>
            <h2 style={{fontSize: '2.5rem', color: '#2563eb'}}>82.5</h2>
            <p style={{color: '#10b981'}}>↗ +2.3 Últimos 30 dias</p>
          </div>
        </div>

        <div style={{background: '#d1fae5', padding: '1rem', borderRadius: '0.5rem', borderLeft: '4px solid #10b981', color: '#065f46'}}>
          ✅ <strong>Sistema Enterprise Funcionando!</strong> Interface profissional implementada com sucesso para impressionar investidores.
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
