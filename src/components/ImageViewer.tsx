import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Maximize,
  Move,
  RotateCcw
} from "lucide-react";

interface ImageViewerProps {
  imageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  hideKeyboardShortcuts?: boolean;
  hideDownload?: boolean;
}

const ImageViewer = ({ imageUrl, isOpen, onClose, title = "Visualizar Imagem", hideKeyboardShortcuts = false, hideDownload = false }: ImageViewerProps) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset quando a imagem muda ou o modal abre
  useEffect(() => {
    if (isOpen && imageUrl) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setIsFullscreen(false);
    }
  }, [isOpen, imageUrl]);

  // Controles de zoom
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  // Controles de rotação
  const handleRotateClockwise = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const handleRotateCounterClockwise = useCallback(() => {
    setRotation(prev => (prev - 90 + 360) % 360);
  }, []);

  // Zoom com scroll do mouse
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(5, prev * delta)));
  }, []);

  // Funcionalidade de arrastar
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Download da imagem
  const handleDownload = useCallback(async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `imagem-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
    }
  }, [imageUrl]);

  // Controles de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          handleResetZoom();
          break;
        case 'r':
          handleRotateClockwise();
          break;
        case 'R':
          handleRotateCounterClockwise();
          break;
        case 'f':
          setIsFullscreen(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose, handleZoomIn, handleZoomOut, handleResetZoom, handleRotateClockwise, handleRotateCounterClockwise]);

  if (!imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`${
          isFullscreen 
            ? 'max-w-none max-h-none w-screen h-screen m-0 p-0' 
            : 'max-w-[95vw] max-h-[95vh]'
        } bg-black/95 border-0 overflow-hidden`}
      >
        {/* Controles */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomOut}
            className="bg-black/70 hover:bg-black/80 text-white border-white/20"
            title="Zoom Out (-)"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomIn}
            className="bg-black/70 hover:bg-black/80 text-white border-white/20"
            title="Zoom In (+)"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleResetZoom}
            className="bg-black/70 hover:bg-black/80 text-white border-white/20 px-3"
            title="Reset (0)"
          >
            {Math.round(zoom * 100)}%
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRotateCounterClockwise}
            className="bg-black/70 hover:bg-black/80 text-white border-white/20"
            title="Girar Anti-horário (Shift+R)"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRotateClockwise}
            className="bg-black/70 hover:bg-black/80 text-white border-white/20"
            title="Girar Horário (R)"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          
          {!hideDownload && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              className="bg-black/70 hover:bg-black/80 text-white border-white/20"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="bg-black/70 hover:bg-black/80 text-white border-white/20"
            title="Tela Cheia (F)"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>

        {/* Botão de fechar */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-4 right-4 z-20 bg-red-600/70 hover:bg-red-600/80 text-white border-red-500/20"
          onClick={onClose}
          title="Fechar (Esc)"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Título */}
        {!isFullscreen && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/70 px-3 py-1 rounded text-white text-sm">
            {title}
          </div>
        )}

        {/* Indicador de arrastar */}
        {zoom > 1 && !isFullscreen && (
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-black/70 px-3 py-1 rounded text-white text-xs">
            <Move className="h-3 w-3" />
            Clique e arraste para mover
          </div>
        )}

        {/* Atalhos de teclado */}
        {!isFullscreen && !hideKeyboardShortcuts && (
          <div className="absolute bottom-4 right-4 z-20 bg-black/70 px-3 py-1 rounded text-white text-xs">
            <div>+ = Zoom In | - = Zoom Out | 0 = Reset</div>
            <div>R = Girar | F = Tela Cheia | Esc = Fechar</div>
          </div>
        )}

        {/* Container da imagem */}
        <div 
          ref={containerRef}
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default' }}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt={title}
            className="max-w-none select-none transition-transform duration-200"
            draggable={false}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
            onLoad={() => {
              // Ajustar tamanho inicial se necessário
              if (imageRef.current && containerRef.current) {
                const img = imageRef.current;
                const container = containerRef.current;
                const imgRatio = img.naturalWidth / img.naturalHeight;
                const containerRatio = container.clientWidth / container.clientHeight;
                
                // Se a imagem for muito grande, ajustar zoom inicial
                if (img.naturalWidth > container.clientWidth || img.naturalHeight > container.clientHeight) {
                  const scale = Math.min(
                    container.clientWidth / img.naturalWidth,
                    container.clientHeight / img.naturalHeight
                  ) * 0.9; // 90% do tamanho do container
                  setZoom(scale);
                }
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;