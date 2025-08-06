import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, Calendar, TrendingUp, Award, Clock, CheckCircle, AlertCircle, UserCheck } from 'lucide-react';

const Dashboard = () => {
  // Dados simulados para demonstração
  const metricsData = [
    { name: 'Jan', candidatos: 45, entrevistas: 32, contratacoes: 8 },
    { name: 'Fev', candidatos: 52, entrevistas: 38, contratacoes: 12 },
    { name: 'Mar', candidatos: 48, entrevistas: 35, contratacoes: 10 },
    { name: 'Abr', candidatos: 61, entrevistas: 42, contratacoes: 15 },
    { name: 'Mai', candidatos: 55, entrevistas: 40, contratacoes: 13 },
    { name: 'Jun', candidatos: 67, entrevistas: 48, contratacoes: 18 }
  ];

  const statusData = [
    { name: 'Novos', value: 45, color: '#3B82F6' },
    { name: 'Em Triagem', value: 28, color: '#F59E0B' },
    { name: 'Entrevista', value: 15, color: '#8B5CF6' },
    { name: 'Aprovados', value: 12, color: '#10B981' }
  ];

  const recentActivities = [
    { id: 1, type: 'interview', candidate: 'João Silva', position: 'Desenvolvedor Python', time: '2 horas atrás', status: 'completed' },
    { id: 2, type: 'application', candidate: 'Maria Santos', position: 'UX Designer', time: '4 horas atrás', status: 'new' },
    { id: 3, type: 'interview', candidate: 'Pedro Costa', position: 'Analista de Dados', time: '6 horas atrás', status: 'scheduled' },
    { id: 4, type: 'hire', candidate: 'Ana Oliveira', position: 'Product Manager', time: '1 dia atrás', status: 'hired' }
  ];

  const MetricCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {change > 0 ? '+' : ''}{change}% este mês
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const getActivityIcon = (type, status) => {
    switch (type) {
      case 'interview':
        return status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Calendar className="w-5 h-5 text-blue-500" />;
      case 'application':
        return <Users className="w-5 h-5 text-gray-500" />;
      case 'hire':
        return <UserCheck className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getActivityText = (type, status) => {
    switch (type) {
      case 'interview':
        return status === 'completed' ? 'Entrevista concluída' : 'Entrevista agendada';
      case 'application':
        return 'Nova candidatura';
      case 'hire':
        return 'Candidato contratado';
      default:
        return 'Atividade';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do sistema de recrutamento</p>
        </div>
        <div className="text-sm text-gray-500">
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Candidatos"
          value="156"
          change={12}
          icon={Users}
          color="bg-blue-500"
        />
        <MetricCard
          title="Entrevistas Hoje"
          value="8"
          change={-5}
          icon={Calendar}
          color="bg-purple-500"
        />
        <MetricCard
          title="Taxa de Aprovação"
          value="73%"
          change={8}
          icon={Award}
          color="bg-green-500"
        />
        <MetricCard
          title="Score Médio"
          value="82.5"
          change={3}
          icon={TrendingUp}
          color="bg-orange-500"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras - Métricas mensais */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas Mensais</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="candidatos" fill="#3B82F6" name="Candidatos" />
              <Bar dataKey="entrevistas" fill="#8B5CF6" name="Entrevistas" />
              <Bar dataKey="contratacoes" fill="#10B981" name="Contratações" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de pizza - Status dos candidatos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Candidatos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Atividades recentes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Atividades Recentes</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                {getActivityIcon(activity.type, activity.status)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {getActivityText(activity.type, activity.status)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {activity.candidate} - {activity.position}
                  </p>
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h4 className="text-lg font-semibold mb-2">Entrevistas por Áudio</h4>
          <p className="text-3xl font-bold">124</p>
          <p className="text-blue-100">Realizadas este mês</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h4 className="text-lg font-semibold mb-2">Tempo Médio</h4>
          <p className="text-3xl font-bold">18min</p>
          <p className="text-green-100">Por entrevista</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <h4 className="text-lg font-semibold mb-2">Satisfação</h4>
          <p className="text-3xl font-bold">4.7/5</p>
          <p className="text-purple-100">Avaliação dos candidatos</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

