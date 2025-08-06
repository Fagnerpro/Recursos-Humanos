import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Volume2, CheckCircle, Clock, User, Briefcase } from 'lucide-react';

const AudioInterview = () => {
  const [interviewState, setInterviewState] = useState('setup'); // setup, active, recording, processing, completed
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [position, setPosition] = useState('');
  const [responses, setResponses] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  const [audioPermission, setAudioPermission] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const questionAudioRef = useRef(null);
  const streamRef = useRef(null);

  // Solicita permissão de áudio ao carregar
  useEffect(() => {
    requestAudioPermission();
  }, []);

  const requestAudioPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioPermission(true);
      streamRef.current = stream;
      console.log('Permissão de áudio concedida');
    } catch (error) {
      console.error('Erro ao solicitar permissão de áudio:', error);
      alert('É necessário permitir acesso ao microfone para realizar a entrevista.');
    }
  };

  const startInterview = async () => {
    if (!candidateName || !position) {
      alert('Por favor, preencha nome e posição');
      return;
    }

    try {
      const response = await fetch('https://5001-ipbdc7e05uh2p1nk8ot57-b831f1d4.manusvm.computer/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_name: candidateName,
          position: position
        })
      });

      const data = await response.json();
      setSessionId(data.session_id);
      setInterviewState('active');
      
      // Carrega primeira pergunta
      await loadCurrentQuestion(data.session_id);
    } catch (error) {
      console.error('Erro ao iniciar entrevista:', error);
      alert('Erro ao iniciar entrevista. Verifique se o servidor está rodando.');
    }
  };

  const loadCurrentQuestion = async (sessionId) => {
    try {
      // Busca informações da pergunta
      const infoResponse = await fetch(`https://5001-ipbdc7e05uh2p1nk8ot57-b831f1d4.manusvm.computer/api/interview/${sessionId}/question/info`);
      const infoData = await infoResponse.json();
      
      if (infoData.finished) {
        await finalizeInterview();
        return;
      }

      setCurrentQuestion(infoData.question_text);
      setQuestionNumber(infoData.question_number);
      setTotalQuestions(infoData.total_questions);

      // Carrega áudio da pergunta
      const audioResponse = await fetch(`https://5001-ipbdc7e05uh2p1nk8ot57-b831f1d4.manusvm.computer/api/interview/${sessionId}/question`);
      const audioBlob = await audioResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (questionAudioRef.current) {
        questionAudioRef.current.src = audioUrl;
      }
    } catch (error) {
      console.error('Erro ao carregar pergunta:', error);
    }
  };

  const playQuestion = () => {
    if (questionAudioRef.current) {
      setIsPlayingQuestion(true);
      questionAudioRef.current.play();
    }
  };

  const startRecording = async () => {
    if (!audioPermission || !streamRef.current) {
      await requestAudioPermission();
      return;
    }

    try {
      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(streamRef.current);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await submitAudioResponse(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setInterviewState('processing');
    }
  };

  const submitAudioResponse = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'response.wav');

      const response = await fetch(`https://5001-ipbdc7e05uh2p1nk8ot57-b831f1d4.manusvm.computer/api/interview/${sessionId}/respond`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      // Adiciona resposta ao histórico
      setResponses(prev => [...prev, {
        question: currentQuestion,
        transcript: data.transcript,
        analysis: data.analysis
      }]);

      if (data.next_question_available) {
        // Carrega próxima pergunta
        await loadCurrentQuestion(sessionId);
        setInterviewState('active');
      } else {
        // Finaliza entrevista
        await finalizeInterview();
      }
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      setInterviewState('active');
    }
  };

  const finalizeInterview = async () => {
    try {
      const response = await fetch(`https://5001-ipbdc7e05uh2p1nk8ot57-b831f1d4.manusvm.computer/api/interview/${sessionId}/finalize`, {
        method: 'POST'
      });

      const data = await response.json();
      setFinalReport(data.report);
      setInterviewState('completed');
    } catch (error) {
      console.error('Erro ao finalizar entrevista:', error);
    }
  };

  const resetInterview = () => {
    setInterviewState('setup');
    setSessionId(null);
    setCurrentQuestion(null);
    setQuestionNumber(0);
    setTotalQuestions(0);
    setResponses([]);
    setFinalReport(null);
    setCandidateName('');
    setPosition('');
  };

  // Componente de Setup
  if (interviewState === 'setup') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mic className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Entrevista por Áudio</h2>
          <p className="text-gray-600">Sistema de entrevista realista com IA - Perguntas e respostas em áudio</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nome Completo
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: João Silva Santos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="w-4 h-4 inline mr-2" />
              Posição Desejada
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione uma posição</option>
              
              {/* Tecnologia */}
              <option value="Desenvolvedor Python">Desenvolvedor Python</option>
              <option value="Desenvolvedor Java">Desenvolvedor Java</option>
              <option value="Desenvolvedor JavaScript">Desenvolvedor JavaScript</option>
              <option value="Desenvolvedor React">Desenvolvedor React</option>
              <option value="Desenvolvedor Angular">Desenvolvedor Angular</option>
              <option value="Desenvolvedor Mobile">Desenvolvedor Mobile</option>
              <option value="Desenvolvedor Full Stack">Desenvolvedor Full Stack</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
              <option value="Arquiteto de Software">Arquiteto de Software</option>
              <option value="Analista de Sistemas">Analista de Sistemas</option>
              <option value="Cientista de Dados">Cientista de Dados</option>
              <option value="Engenheiro de Machine Learning">Engenheiro de Machine Learning</option>
              <option value="Analista de Dados">Analista de Dados</option>
              <option value="DBA - Administrador de Banco">DBA - Administrador de Banco</option>
              <option value="Especialista em Cybersecurity">Especialista em Cybersecurity</option>
              <option value="UX/UI Designer">UX/UI Designer</option>
              <option value="Product Manager">Product Manager</option>
              <option value="Scrum Master">Scrum Master</option>
              <option value="QA Engineer">QA Engineer</option>
              <option value="Analista de Infraestrutura">Analista de Infraestrutura</option>
              
              {/* Recursos Humanos */}
              <option value="Analista de RH">Analista de RH</option>
              <option value="Coordenador de RH">Coordenador de RH</option>
              <option value="Gerente de RH">Gerente de RH</option>
              <option value="Especialista em Recrutamento">Especialista em Recrutamento</option>
              <option value="Business Partner de RH">Business Partner de RH</option>
              <option value="Analista de Treinamento">Analista de Treinamento</option>
              <option value="Especialista em Folha de Pagamento">Especialista em Folha de Pagamento</option>
              
              {/* Gestão e Liderança */}
              <option value="Gerente de Projetos">Gerente de Projetos</option>
              <option value="Coordenador de Projetos">Coordenador de Projetos</option>
              <option value="Diretor Executivo">Diretor Executivo</option>
              <option value="Gerente Geral">Gerente Geral</option>
              <option value="Supervisor de Equipe">Supervisor de Equipe</option>
              <option value="Team Leader">Team Leader</option>
              
              {/* Marketing e Vendas */}
              <option value="Analista de Marketing">Analista de Marketing</option>
              <option value="Coordenador de Marketing">Coordenador de Marketing</option>
              <option value="Especialista em Marketing Digital">Especialista em Marketing Digital</option>
              <option value="Social Media">Social Media</option>
              <option value="Vendedor">Vendedor</option>
              <option value="Consultor de Vendas">Consultor de Vendas</option>
              <option value="Gerente de Vendas">Gerente de Vendas</option>
              <option value="Account Manager">Account Manager</option>
              <option value="Business Development">Business Development</option>
              
              {/* Financeiro */}
              <option value="Analista Financeiro">Analista Financeiro</option>
              <option value="Contador">Contador</option>
              <option value="Auditor">Auditor</option>
              <option value="Controller">Controller</option>
              <option value="Gerente Financeiro">Gerente Financeiro</option>
              <option value="Analista de Crédito">Analista de Crédito</option>
              <option value="Tesoureiro">Tesoureiro</option>
              
              {/* Operações */}
              <option value="Analista de Operações">Analista de Operações</option>
              <option value="Coordenador de Operações">Coordenador de Operações</option>
              <option value="Gerente de Operações">Gerente de Operações</option>
              <option value="Analista de Processos">Analista de Processos</option>
              <option value="Especialista em Qualidade">Especialista em Qualidade</option>
              <option value="Supervisor de Produção">Supervisor de Produção</option>
              
              {/* Atendimento ao Cliente */}
              <option value="Atendente">Atendente</option>
              <option value="Analista de Atendimento">Analista de Atendimento</option>
              <option value="Coordenador de Atendimento">Coordenador de Atendimento</option>
              <option value="Customer Success">Customer Success</option>
              <option value="Suporte Técnico">Suporte Técnico</option>
              
              {/* Jurídico */}
              <option value="Advogado">Advogado</option>
              <option value="Analista Jurídico">Analista Jurídico</option>
              <option value="Coordenador Jurídico">Coordenador Jurídico</option>
              <option value="Compliance Officer">Compliance Officer</option>
              
              {/* Administrativo */}
              <option value="Assistente Administrativo">Assistente Administrativo</option>
              <option value="Analista Administrativo">Analista Administrativo</option>
              <option value="Coordenador Administrativo">Coordenador Administrativo</option>
              <option value="Secretário Executivo">Secretário Executivo</option>
              <option value="Recepcionista">Recepcionista</option>
              
              {/* Logística */}
              <option value="Analista de Logística">Analista de Logística</option>
              <option value="Coordenador de Logística">Coordenador de Logística</option>
              <option value="Gerente de Supply Chain">Gerente de Supply Chain</option>
              <option value="Almoxarife">Almoxarife</option>
              <option value="Expedidor">Expedidor</option>
            </select>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Como funciona:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• A IA fará perguntas em áudio</li>
              <li>• Você responde falando no microfone</li>
              <li>• Suas respostas são analisadas automaticamente</li>
              <li>• Relatório final é gerado ao término</li>
            </ul>
          </div>

          <button
            onClick={startInterview}
            disabled={!candidateName || !position || !audioPermission}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {!audioPermission ? 'Aguardando permissão de áudio...' : 'Iniciar Entrevista'}
          </button>
        </div>
      </div>
    );
  }

  // Componente de Entrevista Ativa
  if (interviewState === 'active' || interviewState === 'recording' || interviewState === 'processing') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Header da Entrevista */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{candidateName}</h2>
              <p className="text-gray-600">{position}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Pergunta</div>
              <div className="text-2xl font-bold text-blue-600">
                {questionNumber} / {totalQuestions}
              </div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Pergunta Atual */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Volume2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">Pergunta da IA:</h3>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">{currentQuestion}</p>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={playQuestion}
                  disabled={isPlayingQuestion}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {isPlayingQuestion ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlayingQuestion ? 'Reproduzindo...' : 'Ouvir Pergunta'}</span>
                </button>
                
                <audio
                  ref={questionAudioRef}
                  onEnded={() => setIsPlayingQuestion(false)}
                  onPlay={() => setIsPlayingQuestion(true)}
                  onPause={() => setIsPlayingQuestion(false)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Área de Resposta */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 relative">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                isRecording ? 'bg-red-100 animate-pulse' : 'bg-gray-100'
              }`}>
                {isRecording ? (
                  <MicOff className="w-12 h-12 text-red-600" />
                ) : (
                  <Mic className="w-12 h-12 text-gray-600" />
                )}
              </div>
              {isRecording && (
                <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
              )}
            </div>

            {interviewState === 'processing' ? (
              <div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Processando sua resposta...</p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isRecording ? 'Gravando sua resposta...' : 'Sua vez de responder'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {isRecording 
                    ? 'Fale naturalmente. Clique em "Parar" quando terminar.'
                    : 'Clique no botão abaixo para começar a gravar sua resposta.'
                  }
                </p>

                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                    isRecording 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isRecording ? 'Parar Gravação' : 'Iniciar Gravação'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Histórico de Respostas */}
        {responses.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-medium text-gray-900 mb-4">Respostas Anteriores:</h3>
            <div className="space-y-4">
              {responses.map((response, index) => (
                <div key={index} className="border-l-4 border-blue-200 pl-4">
                  <p className="text-sm text-gray-600 mb-1">P{index + 1}: {response.question}</p>
                  <p className="text-gray-900 mb-2">{response.transcript}</p>
                  {response.analysis && (
                    <div className="text-sm text-green-600">
                      Score: {response.analysis.score}/100
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Componente de Relatório Final
  if (interviewState === 'completed' && finalReport) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Entrevista Finalizada</h2>
            <p className="text-gray-600">Relatório completo da entrevista de {candidateName}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-bold text-blue-900 mb-2">Score Final</h3>
              <div className="text-3xl font-bold text-blue-600">{finalReport.score_final}/100</div>
            </div>
            <div className={`p-6 rounded-lg ${
              finalReport.recomendacao === 'CONTRATAR' ? 'bg-green-50' : 
              finalReport.recomendacao === 'CONSIDERAR' ? 'bg-yellow-50' : 'bg-red-50'
            }`}>
              <h3 className="font-bold mb-2">Recomendação</h3>
              <div className={`text-2xl font-bold ${
                finalReport.recomendacao === 'CONTRATAR' ? 'text-green-600' : 
                finalReport.recomendacao === 'CONSIDERAR' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {finalReport.recomendacao}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Resumo Executivo</h3>
              <p className="text-gray-700">{finalReport.resumo_executivo}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Competências Técnicas</h4>
                <div className="text-2xl font-bold text-blue-600">{finalReport.competencias_tecnicas}/10</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Competências Comportamentais</h4>
                <div className="text-2xl font-bold text-green-600">{finalReport.competencias_comportamentais}/10</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Fit Cultural</h4>
                <div className="text-2xl font-bold text-purple-600">{finalReport.fit_cultural}/10</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Pontos Fortes</h3>
                <ul className="space-y-2">
                  {finalReport.pontos_fortes.map((ponto, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{ponto}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Áreas de Desenvolvimento</h3>
                <ul className="space-y-2">
                  {finalReport.areas_desenvolvimento.map((area, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3">Próximos Passos</h3>
              <ul className="space-y-2">
                {finalReport.proximos_passos.map((passo, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <span className="text-blue-600 text-sm font-bold">{index + 1}</span>
                    </div>
                    <span className="text-gray-700">{passo}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={resetInterview}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Nova Entrevista
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AudioInterview;

