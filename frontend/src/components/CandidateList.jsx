import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Eye, MessageSquare, Calendar, Star, User, Mail, Phone, MapPin, Clock, Award } from 'lucide-react';

const CandidateList = ({ onNewCandidate, onViewCandidate, onStartInterview }) => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Dados simulados para demonstração
  const mockCandidates = [
    {
      id: 1,
      full_name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 99999-9999',
      position_applied: 'Desenvolvedor Python',
      experience_years: 5,
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
      status: 'entrevista_realizada',
      overall_score: 85.2,
      technical_score: 88.0,
      behavioral_score: 82.5,
      ai_recommendation: 'CONTRATAR',
      created_at: '2024-01-15T10:30:00Z',
      interview_completed: '2024-01-20T14:00:00Z',
      current_company: 'Tech Solutions',
      source: 'LinkedIn'
    },
    {
      id: 2,
      full_name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '(11) 88888-8888',
      position_applied: 'UX Designer',
      experience_years: 3,
      skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
      status: 'novo',
      overall_score: 0,
      technical_score: 0,
      behavioral_score: 0,
      ai_recommendation: null,
      created_at: '2024-01-22T09:15:00Z',
      interview_completed: null,
      current_company: 'Design Studio',
      source: 'Site'
    },
    {
      id: 3,
      full_name: 'Pedro Costa',
      email: 'pedro.costa@email.com',
      phone: '(11) 77777-7777',
      position_applied: 'Analista de Dados',
      experience_years: 4,
      skills: ['Python', 'SQL', 'Power BI', 'Machine Learning'],
      status: 'entrevista',
      overall_score: 0,
      technical_score: 0,
      behavioral_score: 0,
      ai_recommendation: null,
      created_at: '2024-01-18T16:45:00Z',
      interview_completed: null,
      current_company: 'Data Corp',
      source: 'Indicação'
    },
    {
      id: 4,
      full_name: 'Ana Oliveira',
      email: 'ana.oliveira@email.com',
      phone: '(11) 66666-6666',
      position_applied: 'Product Manager',
      experience_years: 6,
      skills: ['Product Strategy', 'Agile', 'Analytics', 'Leadership'],
      status: 'aprovado',
      overall_score: 92.8,
      technical_score: 90.0,
      behavioral_score: 95.5,
      ai_recommendation: 'CONTRATAR',
      created_at: '2024-01-10T11:20:00Z',
      interview_completed: '2024-01-16T15:30:00Z',
      current_company: 'Product Inc',
      source: 'LinkedIn'
    }
  ];

  useEffect(() => {
    // Simular carregamento de dados
    setLoading(true);
    setTimeout(() => {
      setCandidates(mockCandidates);
      setFilteredCandidates(mockCandidates);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Filtrar candidatos
    let filtered = candidates;

    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.position_applied.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.status === statusFilter);
    }

    if (positionFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.position_applied === positionFilter);
    }

    setFilteredCandidates(filtered);
  }, [searchTerm, statusFilter, positionFilter, candidates]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'novo': { label: 'Novo', color: 'bg-blue-100 text-blue-800' },
      'triagem': { label: 'Em Triagem', color: 'bg-yellow-100 text-yellow-800' },
      'entrevista': { label: 'Entrevista Agendada', color: 'bg-purple-100 text-purple-800' },
      'entrevista_realizada': { label: 'Entrevista Realizada', color: 'bg-indigo-100 text-indigo-800' },
      'aprovado': { label: 'Aprovado', color: 'bg-green-100 text-green-800' },
      'rejeitado': { label: 'Rejeitado', color: 'bg-red-100 text-red-800' },
      'contratado': { label: 'Contratado', color: 'bg-emerald-100 text-emerald-800' }
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRecommendationBadge = (recommendation) => {
    if (!recommendation) return null;

    const config = {
      'CONTRATAR': { label: 'Contratar', color: 'bg-green-100 text-green-800' },
      'CONSIDERAR': { label: 'Considerar', color: 'bg-yellow-100 text-yellow-800' },
      'REJEITAR': { label: 'Rejeitar', color: 'bg-red-100 text-red-800' }
    };

    const rec = config[recommendation];
    if (!rec) return null;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${rec.color}`}>
        {rec.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const uniquePositions = [...new Set(candidates.map(c => c.position_applied))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidatos</h1>
          <p className="text-gray-600">Gerencie todos os candidatos do sistema</p>
        </div>
        <button
          onClick={onNewCandidate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Candidato</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou posição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="novo">Novo</option>
            <option value="triagem">Em Triagem</option>
            <option value="entrevista">Entrevista Agendada</option>
            <option value="entrevista_realizada">Entrevista Realizada</option>
            <option value="aprovado">Aprovado</option>
            <option value="rejeitado">Rejeitado</option>
            <option value="contratado">Contratado</option>
          </select>

          {/* Filtro por posição */}
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas as posições</option>
            {uniquePositions.map(position => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de candidatos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {filteredCandidates.length} candidato(s) encontrado(s)
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Filter className="w-4 h-4" />
              <span>Filtros ativos</span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredCandidates.map((candidate) => (
            <div key={candidate.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{candidate.full_name}</h4>
                      <p className="text-gray-600">{candidate.position_applied}</p>
                    </div>
                    {getStatusBadge(candidate.status)}
                    {getRecommendationBadge(candidate.ai_recommendation)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{candidate.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{candidate.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{candidate.current_company}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{candidate.experience_years} anos de exp.</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.slice(0, 4).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{candidate.skills.length - 4} mais
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Scores */}
                  {candidate.overall_score > 0 && (
                    <div className="mt-4 flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Score Geral:</span>
                        <span className={`font-semibold ${getScoreColor(candidate.overall_score)}`}>
                          {candidate.overall_score.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Técnico:</span>
                        <span className={`font-semibold ${getScoreColor(candidate.technical_score)}`}>
                          {candidate.technical_score.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Comportamental:</span>
                        <span className={`font-semibold ${getScoreColor(candidate.behavioral_score)}`}>
                          {candidate.behavioral_score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => onViewCandidate(candidate)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center space-x-2 text-sm transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver Detalhes</span>
                  </button>
                  
                  {candidate.status === 'novo' || candidate.status === 'triagem' ? (
                    <button
                      onClick={() => onStartInterview(candidate)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 text-sm transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Entrevistar</span>
                    </button>
                  ) : candidate.interview_completed ? (
                    <div className="text-xs text-gray-500 text-center">
                      Entrevista em {formatDate(candidate.interview_completed)}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCandidates.length === 0 && (
          <div className="p-12 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum candidato encontrado</h3>
            <p className="text-gray-600 mb-4">
              Não há candidatos que correspondam aos filtros selecionados.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPositionFilter('all');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateList;

