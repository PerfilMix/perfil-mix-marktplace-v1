import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBanners } from '@/hooks/useBanners';
import { BannerType } from '@/types';
import { Trash2, Upload, ExternalLink, X, Eye, EyeOff, Save, Monitor, Smartphone, Play, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BannerManager = () => {
  const { getBannersByType, uploadBanner, deleteBanner, toggleBannerStatus, isLoading, clearAllBanners } = useBanners();
  const { toast } = useToast();
  
  const [dragActive, setDragActive] = useState<{ desktop: boolean; mobile: boolean; dashboard: boolean }>({
    desktop: false,
    mobile: false,
    dashboard: false
  });
  const [previews, setPreviews] = useState<{ desktop: File | null; mobile: File | null; dashboard: File | null }>({
    desktop: null,
    mobile: null,
    dashboard: null
  });
  const [previewUrls, setPreviewUrls] = useState<{ desktop: string | null; mobile: string | null; dashboard: string | null }>({
    desktop: null,
    mobile: null,
    dashboard: null
  });
  const [links, setLinks] = useState<{ desktop: string; mobile: string; dashboard: string }>({
    desktop: '',
    mobile: '',
    dashboard: ''
  });
  const [showCarouselPreview, setShowCarouselPreview] = useState<{ desktop: boolean; mobile: boolean; dashboard: boolean }>({
    desktop: false,
    mobile: false,
    dashboard: false
  });

  const desktopFileRef = useRef<HTMLInputElement>(null);
  const mobileFileRef = useRef<HTMLInputElement>(null);
  const dashboardFileRef = useRef<HTMLInputElement>(null);

  const desktopBanners = getBannersByType('desktop');
  const mobileBanners = getBannersByType('mobile');
  const dashboardBanners = getBannersByType('dashboard');
  const activeDesktopBanners = desktopBanners.filter(b => b.isActive);
  const activeMobileBanners = mobileBanners.filter(b => b.isActive);
  const activeDashboardBanners = dashboardBanners.filter(b => b.isActive);

  const handleDrag = (e: React.DragEvent, type: BannerType) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [type]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDrop = (e: React.DragEvent, type: BannerType) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0], type);
    }
  };

  const handleFileSelect = (file: File, type: BannerType) => {
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrls(prev => ({ ...prev, [type]: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
    setPreviews(prev => ({ ...prev, [type]: file }));
  };

  const handleSaveBanner = async (type: BannerType) => {
    const file = previews[type];
    const linkUrl = links[type];

    if (!file) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione um arquivo primeiro.",
      });
      return;
    }

    try {
      await uploadBanner(file, type, linkUrl);
      
      // Reset form
      setPreviews(prev => ({ ...prev, [type]: null }));
      setPreviewUrls(prev => ({ ...prev, [type]: null }));
      setLinks(prev => ({ ...prev, [type]: '' }));
      const fileInput = type === 'desktop' ? desktopFileRef.current : 
                        type === 'mobile' ? mobileFileRef.current : 
                        dashboardFileRef.current;
      if (fileInput) fileInput.value = '';

      // Show success feedback with action to view homepage
      toast({
        title: "Banner salvo com sucesso! 🎉",
        description: "O banner está agora ativo na página inicial.",
        action: (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('/', '_blank')}
            className="text-xs"
          >
            Ver Página Inicial
          </Button>
        ),
      });
    } catch (error) {
      // Error already handled in hook
    }
  };

  const clearPreview = (type: BannerType) => {
    setPreviews(prev => ({ ...prev, [type]: null }));
    setPreviewUrls(prev => ({ ...prev, [type]: null }));
    setLinks(prev => ({ ...prev, [type]: '' }));
    const fileInput = type === 'desktop' ? desktopFileRef.current : 
                      type === 'mobile' ? mobileFileRef.current : 
                      dashboardFileRef.current;
    if (fileInput) fileInput.value = '';
  };

  const CarouselPreview = ({ banners, type }: { banners: any[]; type: BannerType }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const activeBanners = banners.filter(b => b.isActive);

    if (activeBanners.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          <p>Nenhum banner ativo para preview</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-300">Preview do Carrossel</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {currentIndex + 1} de {activeBanners.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentIndex((prev) => (prev + 1) % activeBanners.length)}
              className="h-6 w-6 p-0"
              disabled={activeBanners.length <= 1}
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <img
            src={activeBanners[currentIndex]?.imageData}
            alt="Preview do Banner"
            className="w-full object-cover transition-opacity duration-500"
            style={{
              height: type === 'desktop' ? '200px' : type === 'mobile' ? '150px' : '300px'
            }}
          />
          
          {activeBanners.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {activeBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-white scale-110' : 'bg-white/60 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const BannerSection = ({ type, title, banners, icon: IconComponent, recommendedSize }: {
    type: BannerType;
    title: string;
    banners: any[];
    icon: any;
    recommendedSize?: string;
  }) => {
    const activeBanners = banners.filter(b => b.isActive);
    
    return (
      <Card className="glass-card shadow-tech border-tech-accent/20" style={{ backgroundColor: '#1D1D1D', borderColor: '#374151' }}>
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconComponent className="h-5 w-5" />
              {title}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">({banners.length} total)</span>
                {activeBanners.length > 0 && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                    {activeBanners.length} ativo{activeBanners.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            
            {activeBanners.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCarouselPreview(prev => ({ ...prev, [type]: !prev[type] }))}
                className="text-xs"
              >
                <Play className="h-3 w-3 mr-1" />
                {showCarouselPreview[type] ? 'Ocultar' : 'Preview'} Carrossel
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Carousel Preview */}
          {showCarouselPreview[type] && activeBanners.length > 0 && (
            <div className="p-4 border border-tech-accent/20 rounded-lg bg-tech-darker/30">
              <CarouselPreview banners={banners} type={type} />
            </div>
          )}

          {/* Upload Section */}
          <div className="space-y-4 p-4 border border-tech-accent/20 rounded-lg bg-tech-darker/50">
            <div className="flex items-center justify-between">
              <h4 className="text-gray-300 font-medium">Adicionar Novo Banner</h4>
              <div className="text-xs text-gray-400">
                {recommendedSize || `Recomendado: ${type === 'desktop' ? '1200x200px' : type === 'mobile' ? '800x150px' : '300x600px'}`}
              </div>
            </div>
            
            {/* Step 1: Upload */}
            {!previewUrls[type] && (
              <>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                    dragActive[type] 
                      ? 'border-tech-accent bg-tech-accent/10' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onDragEnter={(e) => handleDrag(e, type)}
                  onDragLeave={(e) => handleDrag(e, type)}
                  onDragOver={(e) => handleDrag(e, type)}
                  onDrop={(e) => handleDrop(e, type)}
                >
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="text-gray-400">
                      Arraste uma imagem aqui ou clique para selecionar
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPEG, WebP - Máximo 5MB
                    </p>
                  </div>
                </div>

                <input
                  ref={type === 'desktop' ? desktopFileRef : type === 'mobile' ? mobileFileRef : dashboardFileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], type)}
                  className="hidden"
                />

                <Button
                  variant="outline"
                  onClick={() => {
                    const fileInput = type === 'desktop' ? desktopFileRef.current : 
                                    type === 'mobile' ? mobileFileRef.current : 
                                    dashboardFileRef.current;
                    fileInput?.click();
                  }}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Arquivo
                </Button>
              </>
            )}

            {/* Step 2: Preview and Save */}
            {previewUrls[type] && (
              <div className="space-y-4">
                <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-2 bg-gray-800 text-xs text-gray-300">
                    <span>Preview do Banner - {type === 'desktop' ? 'Desktop' : type === 'mobile' ? 'Mobile' : 'Dashboard'}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearPreview(type)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <img
                    src={previewUrls[type]!}
                    alt="Preview"
                    className="w-full object-cover"
                    style={{
                      height: type === 'desktop' ? '200px' : type === 'mobile' ? '150px' : '300px'
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Link (opcional)</Label>
                  <Input
                    value={links[type]}
                    onChange={(e) => setLinks(prev => ({ ...prev, [type]: e.target.value }))}
                    placeholder="https://exemplo.com"
                    className="glass-card border-tech-accent/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSaveBanner(type)}
                    disabled={isLoading}
                    className="flex-1 tech-gradient hover:shadow-glow text-white font-semibold"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Salvando...' : 'Salvar Banner'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => clearPreview(type)}
                    className="px-4"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Banners List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-gray-300 font-medium">Banners Gerenciados</h4>
              {banners.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => banners.forEach(banner => deleteBanner(banner.id))}
                  className="text-red-400 hover:text-red-300"
                >
                  Limpar Todos
                </Button>
              )}
            </div>
            
            {banners.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-gray-600 rounded-lg">
                <p className="text-gray-400">Nenhum banner adicionado ainda</p>
                <p className="text-xs text-gray-500 mt-1">
                  {type === 'dashboard' 
                    ? 'Adicione banners verticais para exibir no dashboard dos usuários'
                    : 'Adicione banners para criar um carrossel na página inicial'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {banners.map((banner, index) => (
                  <div key={banner.id} className="border border-tech-accent/20 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${banner.isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
                        <span className={`text-xs font-medium ${banner.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                          {banner.isActive ? 'ATIVO' : 'INATIVO'}
                        </span>
                        <span className="text-xs text-gray-500">#{index + 1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBannerStatus(banner.id)}
                          disabled={isLoading}
                          className="h-8 w-8 p-0"
                        >
                          {banner.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteBanner(banner.id)}
                          disabled={isLoading}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <img
                      src={banner.imageData}
                      alt="Banner"
                      className="w-full object-cover rounded"
                      style={{ height: '80px' }}
                    />
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex-1">
                        {banner.linkUrl && (
                          <a
                            href={banner.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-tech-accent hover:text-tech-highlight flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Ver Link
                          </a>
                        )}
                        <p className="text-gray-400 mt-1">
                          {new Date(banner.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciar Banners</h2>
          <p className="text-gray-400 text-sm mt-1">
            Gerencie banners que aparecerão na página inicial e dashboard dos usuários. Múltiplos banners ativos criam um carrossel automático.
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={clearAllBanners}
          disabled={desktopBanners.length === 0 && mobileBanners.length === 0 && dashboardBanners.length === 0}
        >
          Limpar Todos os Banners
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-tech-accent/20" style={{ backgroundColor: '#1D1D1D', borderColor: '#374151' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-blue-400" />
                <span className="font-medium text-white">Desktop</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{activeDesktopBanners.length}</div>
                <div className="text-xs text-gray-400">ativo{activeDesktopBanners.length !== 1 ? 's' : ''} de {desktopBanners.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-tech-accent/20" style={{ backgroundColor: '#1D1D1D', borderColor: '#374151' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-green-400" />
                <span className="font-medium text-white">Mobile</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{activeMobileBanners.length}</div>
                <div className="text-xs text-gray-400">ativo{activeMobileBanners.length !== 1 ? 's' : ''} de {mobileBanners.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-tech-accent/20" style={{ backgroundColor: '#1D1D1D', borderColor: '#374151' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 text-purple-400 flex items-center justify-center">
                  <div className="w-3 h-4 border-2 border-current rounded-sm"></div>
                </div>
                <span className="font-medium text-white">Dashboard</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{activeDashboardBanners.length}</div>
                <div className="text-xs text-gray-400">ativo{activeDashboardBanners.length !== 1 ? 's' : ''} de {dashboardBanners.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BannerSection
        type="desktop"
        title="Banners Desktop"
        banners={desktopBanners}
        icon={Monitor}
      />

      <BannerSection
        type="mobile"
        title="Banners Mobile"
        banners={mobileBanners}
        icon={Smartphone}
      />

      <BannerSection
        type="dashboard"
        title="Banners Dashboard"
        banners={dashboardBanners}
        icon={() => <div className="h-5 w-5 text-purple-400 flex items-center justify-center">
          <div className="w-3 h-4 border-2 border-current rounded-sm"></div>
        </div>}
        recommendedSize="Recomendado: 300x600px (vertical)"
      />
    </div>
  );
};

export default BannerManager;
