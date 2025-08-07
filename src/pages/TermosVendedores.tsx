import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, Users, CreditCard, AlertTriangle, Lock, RefreshCw, CheckCircle } from 'lucide-react';

const TermosVendedores = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-tech-dark text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-tech-light hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <Card className="bg-tech-secondary border-tech-border">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <FileText className="h-8 w-8 text-tech-highlight" />
                Termos e Condições para Vendedores
              </CardTitle>
              <p className="text-tech-light">
                Marketplace de Contas — Leia atentamente antes de prosseguir com seu cadastro
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Conteúdo dos Termos */}
        <div className="space-y-6">
          {/* 1. Objetivo */}
          <Card className="bg-tech-secondary border-tech-border">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <span className="bg-tech-highlight text-tech-dark rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                Objetivo
              </CardTitle>
            </CardHeader>
            <CardContent className="text-tech-light">
              <p>
                Estes Termos e Condições regulamentam a participação de usuários como vendedores no Marketplace de Contas, 
                incluindo cadastro, venda, entrega das contas e recebimento de valores.
              </p>
            </CardContent>
          </Card>

          {/* 2. Cadastro como Vendedor */}
          <Card className="bg-tech-secondary border-tech-border">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <span className="bg-tech-highlight text-tech-dark rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                <Users className="h-5 w-5" />
                Cadastro como Vendedor
              </CardTitle>
            </CardHeader>
            <CardContent className="text-tech-light space-y-4">
              <p>Para se tornar vendedor, o usuário deve preencher corretamente os dados solicitados:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Nome completo</li>
                <li>CPF ou CNPJ</li>
                <li>Telefone WhatsApp</li>
                <li>Endereço completo</li>
                <li>Mensagem adicional (opcional)</li>
                <li>Chave PIX para recebimento de valores</li>
              </ul>
              <p className="font-medium">É obrigatório enviar:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Documento oficial com foto (RG, CNH ou Passaporte)</li>
                <li>Foto selfie segurando o documento ao lado do rosto</li>
              </ul>
              <div className="bg-red-950 border border-red-800 rounded-lg p-3 mt-4">
                <p className="text-red-300 font-medium">
                  ⚠️ O envio de informações e documentos falsos ou incompletos poderá resultar na recusa ou 
                  cancelamento do cadastro, além de eventuais medidas legais.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 3. Aprovação e Liberação */}
          <Card className="bg-tech-secondary border-tech-border">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <span className="bg-tech-highlight text-tech-dark rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                <CheckCircle className="h-5 w-5" />
                Aprovação e Liberação
              </CardTitle>
            </CardHeader>
            <CardContent className="text-tech-light space-y-3">
              <p>
                Após análise dos dados e documentos enviados, o Marketplace se reserva o direito de aprovar ou rejeitar o cadastro como vendedor.
              </p>
              <p>
                O vendedor só poderá anunciar contas após a liberação oficial do seu perfil.
              </p>
            </CardContent>
          </Card>

          {/* 4. Cadastro e Venda de Contas */}
          <Card className="bg-tech-secondary border-tech-border">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <span className="bg-tech-highlight text-tech-dark rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                Cadastro e Venda de Contas
              </CardTitle>
            </CardHeader>
            <CardContent className="text-tech-light space-y-4">
              <p>
                O vendedor, uma vez aprovado, poderá cadastrar suas contas (TikTok, Kwai, YouTube, Facebook, Instagram ou outras).
              </p>
              <p>No cadastro de cada conta à venda, é obrigatório fornecer:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Todas as informações da conta</li>
                <li>E-mail e senha vinculados à conta</li>
              </ul>
              <div className="bg-blue-950 border border-blue-800 rounded-lg p-3">
                <p className="text-blue-300">
                  💡 O vendedor declara ser único e legítimo titular das contas oferecidas e garante que elas não possuem 
                  bloqueios, restrições ou disputas.
                </p>
              </div>
              <p className="font-medium">
                O vendedor é integralmente responsável pelas informações, segurança e autenticidade das contas disponibilizadas.
              </p>
            </CardContent>
          </Card>

          {/* 5. Transferência ao Comprador */}
          <Card className="bg-tech-secondary border-tech-border">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <span className="bg-tech-highlight text-tech-dark rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</span>
                Transferência ao Comprador
              </CardTitle>
            </CardHeader>
            <CardContent className="text-tech-light space-y-3">
              <p>
                Quando a conta é vendida, as credenciais (e-mail e senha) são disponibilizadas diretamente ao comprador 
                em sua área "Minhas Compras".
              </p>
              <p>
                O vendedor se compromete a não alterar, recuperar ou acessar a conta após a venda.
              </p>
              <p className="font-medium">
                O vendedor deve garantir a plena transferência e disponibilidade da conta ao comprador.
              </p>
            </CardContent>
          </Card>

          {/* 6. Recebimento de Valores e Saque */}
          <Card className="bg-tech-secondary border-tech-border">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <span className="bg-tech-highlight text-tech-dark rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">6</span>
                <CreditCard className="h-5 w-5" />
                Recebimento de Valores e Saque
              </CardTitle>
            </CardHeader>
            <CardContent className="text-tech-light space-y-3">
              <p>
                O valor das vendas será disponibilizado ao vendedor após a confirmação da entrega bem-sucedida ao comprador.
              </p>
              <p>
                O vendedor deverá solicitar o saque do saldo acumulado, que será transferido via PIX para a chave cadastrada.
              </p>
              <p>
                O Marketplace poderá reter ou cancelar pagamentos em caso de irregularidades ou disputas.
              </p>
            </CardContent>
          </Card>

          {/* 7. Responsabilidades e Obrigações */}
          <Card className="bg-tech-secondary border-tech-border">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <span className="bg-tech-highlight text-tech-dark rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">7</span>
                <AlertTriangle className="h-5 w-5" />
                Responsabilidades e Obrigações
              </CardTitle>
            </CardHeader>
            <CardContent className="text-tech-light space-y-4">
              <p>
                O vendedor é responsável por quaisquer danos causados ao comprador ou ao Marketplace em razão de 
                informações falsas, contas problemáticas ou violação de direitos de terceiros.
              </p>
              <p>
                O vendedor concorda em arcar com todas as consequências legais decorrentes de suas ações.
              </p>
              <div className="bg-red-950 border border-red-800 rounded-lg p-4">
                <p className="font-medium text-red-300 mb-2">É expressamente proibido:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-red-300">
                  <li>Anunciar contas obtidas de forma ilícita ou irregular</li>
                  <li>Utilizar dados falsos ou de terceiros</li>
                  <li>Reacessar ou prejudicar contas após a venda</li>
                </ul>
              </div>
              <p className="font-medium">
                O não cumprimento das obrigações poderá resultar em suspensão ou exclusão definitiva do cadastro de vendedor, 
                sem prejuízo de outras medidas legais.
              </p>
            </CardContent>
          </Card>

          {/* 8. Privacidade e Proteção de Dados */}
          <Card className="bg-tech-secondary border-tech-border">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <span className="bg-tech-highlight text-tech-dark rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">8</span>
                <Lock className="h-5 w-5" />
                Privacidade e Proteção de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="text-tech-light space-y-3">
              <p>
                Os dados pessoais e documentos enviados serão utilizados exclusivamente para verificação, segurança e gestão financeira do vendedor.
              </p>
              <p>
                O Marketplace adota medidas de segurança para proteger os dados em conformidade com a legislação vigente (ex.: LGPD).
              </p>
            </CardContent>
          </Card>

          {/* 9. Limitação de Responsabilidade */}
          <Card className="bg-tech-secondary border-tech-border">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <span className="bg-tech-highlight text-tech-dark rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">9</span>
                <Shield className="h-5 w-5" />
                Limitação de Responsabilidade do Marketplace
              </CardTitle>
            </CardHeader>
            <CardContent className="text-tech-light space-y-3">
              <p>
                O Marketplace atua apenas como intermediador tecnológico, não assumindo responsabilidade sobre a procedência, 
                qualidade ou funcionamento das contas.
              </p>
              <p>
                Eventuais problemas decorrentes da transação são de exclusiva responsabilidade do vendedor.
              </p>
            </CardContent>
          </Card>

          {/* 10. Atualizações dos Termos */}
          <Card className="bg-tech-secondary border-tech-border">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <span className="bg-tech-highlight text-tech-dark rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">10</span>
                <RefreshCw className="h-5 w-5" />
                Atualizações dos Termos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-tech-light space-y-3">
              <p>
                Estes Termos podem ser alterados a qualquer momento, sendo disponibilizados em versão atualizada no momento do acesso.
              </p>
              <p>
                O uso contínuo ou novas solicitações de venda implicam aceitação automática das alterações.
              </p>
            </CardContent>
          </Card>

          {/* Aceitação */}
          <Card className="bg-green-950 border-green-800">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-400" />
                Aceitação
              </CardTitle>
            </CardHeader>
            <CardContent className="text-green-100">
              <p>
                Ao confirmar o cadastro como vendedor e enviar seus documentos, o usuário declara que leu, compreendeu e aceita 
                integralmente estes Termos e Condições, comprometendo-se a respeitar todas as obrigações aqui estabelecidas.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => navigate(-1)}
            className="bg-tech-highlight hover:bg-tech-highlight/90 text-tech-dark font-medium"
          >
            Voltar ao Formulário
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TermosVendedores;