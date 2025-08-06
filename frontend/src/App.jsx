import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Calendar, 
  FileText, 
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  BarChart3,
  PieChart,
  Activity,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Mic,
  Volume2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  MessageSquare,
  HelpCircle,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Bell,
  Settings
} from 'lucide-react';
import AudioInterview from './components/AudioInterview';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

// Dados mockados para demonstração
const mockData = {
  metrics: {
    totalCandidates: 1247,
    interviewsToday: 8,
    approvalRate: 73.2,
    averageScore: 82.5,
    pendingReviews: 23,
    activeJobs: 12
  },
  chartData: [
    { month: 'Jan', candidates: 65, interviews: 45, hired: 12 },
    { month: 'Fev', candidates: 78, interviews: 52, hired: 15 },
    { month: 'Mar', candidates: 92, interviews: 68, hired: 18 },
    { month: 'Abr', candidates: 85, interviews: 61, hired: 16 },
    { month: 'Mai', candidates: 105, interviews: 78, hired: 22 },
    { month: 'Jun', candidates: 118, interviews: 89, hired: 25 }
  ],
  pieData: [
    { name: 'Aprovados', value: 35, color: '#10b981' },
    { name: 'Em Análise', value: 28, color: '#f59e0b' },
    { name: 'Rejeitados', value: 22, color: '#ef4444' },
    { name: 'Agendados', value: 15, color: '#3b82f6' }
  ],
  candidates: [
    {
      id: 1,
      name: 'Carlos Silva',
      email: 'carlos.silva@email.com',
      phone: '(11) 99999-9999',
      position: 'Desenvolvedor Python',
      experience: '5 anos',
      status: 'approved',
      score: 88,
      location: 'São Paulo, SP',
      appliedDate: '2024-08-01',
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
      education: 'Ciência da Computação - USP',
      lastInterview: '2024-08-03'
    },
    {
      id: 2,
      name: 'Ana Costa',
      email: 'ana.costa@email.com',
      phone: '(11) 88888-8888',
      position: 'Analista de Dados',
      experience: '3 anos',
      status: 'pending',
      score: 76,
      location: 'Rio de Janeiro, RJ',
      appliedDate: '2024-08-02',
      skills: ['Python', 'SQL', 'Power BI', 'Excel'],
      education: 'Estatística - UFRJ',
      lastInterview: null
    },
    {
      id: 3,
      name: 'João Santos',
      email: 'joao.santos@email.com',
      phone: '(11) 77777-7777',
      position: 'Gerente de Projetos',
      experience: '8 anos',
      status: 'interview',
      score: 91,
      location: 'Belo Horizonte, MG',
      appliedDate: '2024-07-30',
      skills: ['Scrum', 'Agile', 'Jira', 'Leadership'],
      education: 'Administração - UFMG',
      lastInterview: '2024-08-04'
    }
  ],
  interviews: [
    {
      id: 1,
      candidateName: 'Carlos Silva',
      position: 'Desenvolvedor Python',
      date: '2024-08-05',
      time: '14:00',
      status: 'completed',
      score: 88,
      interviewer: 'Maria Oliveira',
      duration: '45 min',
      type: 'technical'
    },
    {
      id: 2,
      candidateName: 'Ana Costa',
      position: 'Analista de Dados',
      date: '2024-08-05',
      time: '16:00',
      status: 'scheduled',
      interviewer: 'Pedro Silva',
      type: 'behavioral'
    },
    {
      id: 3,
      candidateName: 'João Santos',
      position: 'Gerente de Projetos',
      date: '2024-08-06',
      time: '10:00',
      status: 'scheduled',
      interviewer: 'Carla Mendes',
      type: 'leadership'
    }
  ]
};

// Componente de Métrica
const MetricCard = ({ icon: Icon, title, value, change, changeType, description }) => (
  <div className="metric-card hover-lift hover-glow">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${changeType === 'positive' ? 'bg-green-100 text-green-600' : changeType === 'negative' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
      {change && (
        <div className={`flex items-center space-x-1 text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
          {changeType === 'positive' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          <span>{change}</span>
        </div>
      )}
    </div>
    {description && (
      <p className="text-xs text-muted-foreground mt-2">{description}</p>
    )}
  </div>
);

// Componente de Candidato
const CandidateCard = ({ candidate, onView, onEdit, onDelete, onInterview }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'status-success';
      case 'pending': return 'status-warning';
      case 'rejected': return 'status-error';
      case 'interview': return 'status-info';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Pendente';
      case 'rejected': return 'Rejeitado';
      case 'interview': return 'Entrevista';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover-lift hover-glow fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
            {candidate.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{candidate.name}</h3>
            <p className="text-sm text-muted-foreground">{candidate.position}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
            {getStatusText(candidate.status)}
          </span>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{candidate.score}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>{candidate.email}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{candidate.phone}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{candidate.location}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Briefcase className="h-4 w-4" />
          <span>{candidate.experience} de experiência</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">Habilidades:</p>
        <div className="flex flex-wrap gap-1">
          {candidate.skills.map((skill, index) => (
            <span key={index} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          Aplicou em {new Date(candidate.appliedDate).toLocaleDateString('pt-BR')}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(candidate)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
            aria-label={`Ver detalhes de ${candidate.name}`}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(candidate)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
            aria-label={`Editar ${candidate.name}`}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onInterview(candidate)}
            className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            Entrevistar
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Principal
function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isInterviewMode, setIsInterviewMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [interviewAnswers, setInterviewAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');

  const interviewQuestions = [
    'Fale sobre sua experiência profissional e principais conquistas.',
    'Por que você se interessou por esta posição em nossa empresa?',
    'Quais são seus principais pontos fortes e como eles se aplicam a este cargo?',
    'Como você lida com desafios e pressão no ambiente de trabalho?',
    'Onde você se vê profissionalmente em 5 anos?'
  ];

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleNavigation = (view) => {
    setCurrentView(view);
    setIsInterviewMode(false);
    setSelectedCandidate(null);
  };

  const handleInterviewStart = (candidate) => {
    setSelectedCandidate(candidate);
    setIsInterviewMode(true);
    setCurrentQuestion(0);
    setInterviewAnswers([]);
    setCurrentAnswer('');
  };

  const handleNextQuestion = () => {
    const newAnswers = [...interviewAnswers, currentAnswer];
    setInterviewAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentQuestion < interviewQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Finalizar entrevista
      const score = Math.floor(Math.random() * 30) + 70; // Score entre 70-100
      alert(`Entrevista finalizada!\n\nCandidato: ${selectedCandidate.name}\nScore: ${score}/100\nRecomendação: ${score >= 80 ? 'CONTRATAR' : score >= 70 ? 'CONSIDERAR' : 'REJEITAR'}`);
      setIsInterviewMode(false);
      setSelectedCandidate(null);
      setCurrentView('candidates');
    }
  };

  const filteredCandidates = mockData.candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderDashboard = () => (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema de recrutamento</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Download className="h-4 w-4" />
            <span>Exportar Relatório</span>
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <MetricCard
          icon={Users}
          title="Total de Candidatos"
          value={mockData.metrics.totalCandidates.toLocaleString()}
          change="+12%"
          changeType="positive"
          description="Este mês"
        />
        <MetricCard
          icon={Calendar}
          title="Entrevistas Hoje"
          value={mockData.metrics.interviewsToday}
          change="3 agendadas"
          changeType="neutral"
          description="Próximas 8 horas"
        />
        <MetricCard
          icon={TrendingUp}
          title="Taxa de Aprovação"
          value={`${mockData.metrics.approvalRate}%`}
          change="+5%"
          changeType="positive"
          description="Este mês"
        />
        <MetricCard
          icon={Star}
          title="Score Médio"
          value={mockData.metrics.averageScore}
          change="+2.3"
          changeType="positive"
          description="Últimos 30 dias"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Tendência de Candidatos</h3>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockData.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.01 240)" />
              <XAxis dataKey="month" stroke="oklch(0.45 0.02 240)" />
              <YAxis stroke="oklch(0.45 0.02 240)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'oklch(1 0 0)', 
                  border: '1px solid oklch(0.90 0.01 240)',
                  borderRadius: '8px'
                }} 
              />
              <Area type="monotone" dataKey="candidates" stroke="oklch(0.45 0.15 240)" fill="oklch(0.45 0.15 240 / 0.1)" />
              <Area type="monotone" dataKey="interviews" stroke="oklch(0.55 0.18 180)" fill="oklch(0.55 0.18 180 / 0.1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Status dos Candidatos</h3>
            <PieChart className="h-5 w-5 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={mockData.pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {mockData.pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Entrevistas Recentes</h3>
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          {mockData.interviews.slice(0, 3).map((interview) => (
            <div key={interview.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${interview.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <div>
                  <p className="font-medium text-foreground">{interview.candidateName}</p>
                  <p className="text-sm text-muted-foreground">{interview.position}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{interview.date} - {interview.time}</p>
                <p className="text-xs text-muted-foreground">{interview.interviewer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCandidates = () => (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Candidatos</h1>
          <p className="text-muted-foreground">Gerencie todos os candidatos do sistema</p>
        </div>
        <button 
          onClick={() => setCurrentView('new-candidate')}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Candidato</span>
        </button>
      </div>

      <div className="flex items-center space-x-4 bg-card border border-border rounded-lg p-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar candidatos por nome, posição ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors">
          <Filter className="h-4 w-4" />
          <span>Filtros</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            onView={(candidate) => console.log('Ver:', candidate)}
            onEdit={(candidate) => console.log('Editar:', candidate)}
            onDelete={(candidate) => console.log('Deletar:', candidate)}
            onInterview={handleInterviewStart}
          />
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum candidato encontrado</h3>
          <p className="text-muted-foreground">Tente ajustar os filtros ou adicione novos candidatos.</p>
        </div>
      )}
    </div>
  );

  const renderNewCandidate = () => (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Novo Candidato</h1>
        <p className="text-muted-foreground">Adicione um novo candidato ao sistema</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Digite o nome completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Telefone
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Posição *
              </label>
              <select
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Selecione a posição</option>
                <option value="desenvolvedor-python">Desenvolvedor Python</option>
                <option value="analista-dados">Analista de Dados</option>
                <option value="gerente-projetos">Gerente de Projetos</option>
                <option value="designer-ux">Designer UX/UI</option>
                <option value="analista-marketing">Analista de Marketing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Anos de Experiência
              </label>
              <input
                type="number"
                min="0"
                max="50"
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Localização
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="São Paulo, SP"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Habilidades (separadas por vírgula)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Python, JavaScript, React, Node.js"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Resumo Profissional
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Descreva a experiência e objetivos profissionais do candidato..."
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => setCurrentView('candidates')}
              className="px-6 py-2 border border-border rounded-md hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Criar Candidato
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderInterview = () => (
    <div className="space-y-6 fade-in">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Entrevista - {selectedCandidate?.name}</h2>
            <p className="text-muted-foreground">{selectedCandidate?.position}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            Pergunta {currentQuestion + 1} de {interviewQuestions.length}
          </div>
        </div>

        <div className="mb-6">
          <div className="w-full bg-secondary rounded-full h-2 mb-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / interviewQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium text-foreground mb-4">
            {interviewQuestions[currentQuestion]}
          </h3>
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            placeholder="Digite a resposta do candidato..."
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors">
              <Mic className="h-4 w-4" />
              <span>Gravar Áudio</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors">
              <Volume2 className="h-4 w-4" />
              <span>Reproduzir</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            {currentQuestion > 0 && (
              <button
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                className="px-6 py-2 border border-border rounded-md hover:bg-accent transition-colors"
              >
                Anterior
              </button>
            )}
            <button
              onClick={handleNextQuestion}
              disabled={!currentAnswer.trim()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestion === interviewQuestions.length - 1 ? 'Finalizar Entrevista' : 'Próxima Pergunta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground">Análises e relatórios detalhados do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 hover-lift hover-glow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Relatório de Candidatos</h3>
              <p className="text-sm text-muted-foreground">Resumo geral dos candidatos</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Gerar Relatório
          </button>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover-lift hover-glow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Relatório de Entrevistas</h3>
              <p className="text-sm text-muted-foreground">Análise das entrevistas realizadas</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Gerar Relatório
          </button>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover-lift hover-glow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Relatório de Performance</h3>
              <p className="text-sm text-muted-foreground">Métricas de performance do RH</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Gerar Relatório
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Relatórios Gerados</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-medium text-foreground">candidates_summary</p>
              <p className="text-sm text-muted-foreground">Gerado em: 8/4/2025, 9:25:50 PM</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">Total de candidatos: 1</p>
              <p className="text-sm font-medium text-foreground">Total de entrevistas: 1</p>
              <p className="text-sm font-medium text-foreground">Score médio: 82.5</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    if (isInterviewMode) {
      return renderInterview();
    }

    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'candidates':
        return renderCandidates();
      case 'new-candidate':
        return renderNewCandidate();
      case 'interviews':
        return (
          <div className="space-y-6 fade-in">
            <h1 className="text-3xl font-bold text-foreground">Entrevistas</h1>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </div>
        );
      case 'audio-interview':
        return <AudioInterview />;
      case 'reports':
        return renderReports();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border">
        <div className="flex items-center space-x-3 p-6 border-b border-sidebar-border">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sidebar-foreground">Assistente RH</h1>
            <p className="text-xs text-sidebar-foreground/60">Sistema Inteligente</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            onClick={() => handleNavigation('dashboard')}
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => handleNavigation('candidates')}
            className={`nav-item ${currentView === 'candidates' ? 'active' : ''}`}
          >
            <Users className="h-4 w-4" />
            <span>Candidatos</span>
          </button>
          <button
            onClick={() => handleNavigation('new-candidate')}
            className={`nav-item ${currentView === 'new-candidate' ? 'active' : ''}`}
          >
            <UserPlus className="h-4 w-4" />
            <span>Novo Candidato</span>
          </button>
          <button
            onClick={() => handleNavigation('interviews')}
            className={`nav-item ${currentView === 'interviews' ? 'active' : ''}`}
          >
            <Calendar className="h-4 w-4" />
            <span>Entrevistas</span>
          </button>
          <button
            onClick={() => handleNavigation('audio-interview')}
            className={`nav-item ${currentView === 'audio-interview' ? 'active' : ''}`}
          >
            <Mic className="h-4 w-4" />
            <span>Entrevista por Áudio</span>
          </button>
          <button
            onClick={() => handleNavigation('reports')}
            className={`nav-item ${currentView === 'reports' ? 'active' : ''}`}
          >
            <FileText className="h-4 w-4" />
            <span>Relatórios</span>
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-sidebar-foreground">Admin</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-sidebar-accent rounded-md transition-colors"
              aria-label="Alternar tema"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
          <button className="nav-item w-full justify-start">
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-foreground capitalize">
                {currentView.replace('-', ' ')}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-accent rounded-md transition-colors relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-accent rounded-md transition-colors">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </button>
              <button className="p-2 hover:bg-accent rounded-md transition-colors">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </header>

        <main className="container-responsive py-8">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}

export default App;

