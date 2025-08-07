import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DocumentUpload } from './DocumentUpload';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { UserCheck, FileText, Camera, Shield, AlertTriangle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';

const formSchema = z.object({
  nomeCompleto: z.string().min(2, 'Nome completo é obrigatório'),
  cpfCnpj: z.string().min(11, 'CPF ou CNPJ é obrigatório'),
  telefone: z.string().min(10, 'Telefone é obrigatório'),
  enderecoCompleto: z.string().min(10, 'Endereço completo é obrigatório'),
  chavePix: z.string().min(1, 'Chave PIX é obrigatória'),
  confirmarChavePix: z.string().min(1, 'Confirmação da chave PIX é obrigatória'),
  message: z.string().optional(),
  termosAceitos: z.boolean().refine(val => val === true, 'Você deve aceitar os termos e condições'),
}).refine((data) => data.chavePix === data.confirmarChavePix, {
  message: "As chaves PIX não coincidem",
  path: ["confirmarChavePix"],
});

type FormData = z.infer<typeof formSchema>;

interface EnhancedSellerRequestFormProps {
  onSuccess?: () => void;
  onRequestSubmitted?: () => void;
}

export const EnhancedSellerRequestForm: React.FC<EnhancedSellerRequestFormProps> = ({ onSuccess, onRequestSubmitted }) => {
  const [documentoUrl, setDocumentoUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pixMismatch, setPixMismatch] = useState(false);
  const { user } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeCompleto: '',
      cpfCnpj: '',
      telefone: '',
      enderecoCompleto: '',
      chavePix: '',
      confirmarChavePix: '',
      message: '',
      termosAceitos: false,
    },
  });

  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 11) {
      // Formato CPF: 000.000.000-00
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // Formato CNPJ: 00.000.000/0000-00
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 10) {
      // Formato telefone: (00) 0000-0000
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      // Formato celular: (00) 00000-0000
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para enviar a solicitação.",
        variant: "destructive"
      });
      return;
    }

    if (!documentoUrl || !selfieUrl) {
      toast({
        title: "Documentos obrigatórios",
        description: "Por favor, envie tanto o documento de identificação quanto a selfie.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('seller_requests')
        .insert({
          user_id: user.id,
          nome_completo: data.nomeCompleto,
          cpf_cnpj: data.cpfCnpj,
          telefone: data.telefone,
          endereco_completo: data.enderecoCompleto,
          chave_pix: data.chavePix,
          documento_foto_url: documentoUrl,
          selfie_documento_url: selfieUrl,
          message: data.message || null,
          termos_aceitos: data.termosAceitos,
          status: 'pending'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação para se tornar vendedor foi enviada com sucesso. Nossa equipe analisará seus documentos em até 48 horas.",
      });

      form.reset();
      setDocumentoUrl('');
      setSelfieUrl('');
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (onRequestSubmitted) {
        onRequestSubmitted();
      }

    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar solicitação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-6 w-6" />
            Solicitação para se Tornar Vendedor
          </CardTitle>
          <p className="text-muted-foreground">
            Preencha todos os dados abaixo e envie os documentos necessários para verificação.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Dados Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nomeCompleto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite seu nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cpfCnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF ou CNPJ *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="000.000.000-00 ou 00.000.000/0000-00"
                            {...field}
                            onChange={(e) => {
                              const formatted = formatCpfCnpj(e.target.value);
                              field.onChange(formatted);
                            }}
                            maxLength={18}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone/WhatsApp *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(00) 00000-0000"
                            {...field}
                            onChange={(e) => {
                              const formatted = formatTelefone(e.target.value);
                              field.onChange(formatted);
                            }}
                            maxLength={15}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enderecoCompleto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço Completo *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Rua, número, bairro, cidade, estado, CEP"
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chavePix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chave PIX *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite sua chave PIX (CPF, e-mail, telefone ou chave aleatória)"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              const confirmarChave = form.getValues('confirmarChavePix');
                              setPixMismatch(e.target.value !== confirmarChave && confirmarChave.length > 0);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmarChavePix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Chave PIX *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite novamente sua chave PIX"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              const chavePix = form.getValues('chavePix');
                              const confirmarChave = e.target.value;
                              setPixMismatch(chavePix !== confirmarChave && confirmarChave.length > 0);
                            }}
                            className={pixMismatch ? 'border-red-500 focus-visible:ring-red-500' : ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {pixMismatch && (
                    <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700 dark:text-red-300">
                        As chaves PIX não coincidem. Por favor, digite a mesma chave PIX nos dois campos.
                      </AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensagem Adicional (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Conte-nos mais sobre você e por que deseja ser um vendedor..."
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Upload de Documentos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Documentos de Verificação
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Para sua segurança e a de nossos clientes, precisamos verificar sua identidade.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <DocumentUpload
                    type="documento"
                    label="Documento de Identificação com Foto"
                    description="Envie uma foto clara do seu RG, CNH, Passaporte ou outro documento oficial com foto"
                    onUploadComplete={setDocumentoUrl}
                    currentUrl={documentoUrl}
                  />

                  <DocumentUpload
                    type="selfie"
                    label="Selfie com Documento"
                    description="Tire uma selfie segurando o documento de identificação ao lado do seu rosto"
                    onUploadComplete={setSelfieUrl}
                    currentUrl={selfieUrl}
                  />
                </CardContent>
              </Card>

              {/* Termos e Condições */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Termos e Condições
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="termosAceitos"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium">
                            Aceito os termos e condições para vendedores *
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Ao marcar esta opção, você concorda com nossos termos de uso e política de privacidade,
                            e confirma que todas as informações fornecidas são verdadeiras e precisas.
                          </p>
                          <Link 
                            to="/termos-vendedores" 
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs text-tech-highlight hover:text-tech-highlight/80 underline mt-2"
                          >
                            Ler termos e condições para vendedores
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isSubmitting || !documentoUrl || !selfieUrl || pixMismatch}
              >
                {isSubmitting ? 'Enviando Solicitação...' : 'Enviar Solicitação'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};