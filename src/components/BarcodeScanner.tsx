import React, { useEffect, useRef, useState } from 'react';
import Quagga from '@ericblade/quagga2';
import { X, Camera, CameraOff } from 'lucide-react';

interface BarcodeScannerProps {
  onClose: () => void;
  onScan: (result: string) => void;
  showCloseButton?: boolean;
}

interface QuaggaJSCanvas {
  ctx: {
    overlay: CanvasRenderingContext2D;
  };
  dom: {
    overlay: HTMLCanvasElement;
  };
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onClose,
  onScan,
  showCloseButton = true
}) => {
  const [isStarted, setIsStarted] = useState(true);
  const lastResultRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);
  const mountedRef = useRef(true);
  const scanAttempts = useRef<{[key: string]: number}>({});

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      try {
        Quagga.stop();
      } catch (e) {
        console.warn('Error stopping Quagga:', e);
      }
    };
  }, []);

  useEffect(() => {
    if (!isStarted) {
      try {
        Quagga.stop();
      } catch (e) {
        console.warn('Error stopping Quagga:', e);
      }
      return;
    }

    const initQuagga = async () => {
      try {
        const interactive = document.querySelector("#interactive") as HTMLElement;
        if (!interactive) return;

        await Quagga.init({
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: interactive,
            constraints: {
              facingMode: "environment",
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 },
              aspectRatio: { min: 1, max: 2 },
              frameRate: { ideal: 60, min: 30 }
            },
            area: {
              top: "40%",
              right: "20%",
              left: "20%",
              bottom: "40%"
            }
          },
          locator: {
            patchSize: "medium",
            halfSample: false
          },
          numOfWorkers: navigator.hardwareConcurrency || 4,
          decoder: {
            readers: ["ean_reader", "ean_8_reader"]
          },
          locate: true,
          frequency: 15
        });

        if (!mountedRef.current) return;

        await Quagga.start();
        console.log('Quagga started successfully');

        Quagga.onDetected((result: any) => {
          if (!mountedRef.current) return;

          const now = Date.now();
          if (now - lastScanTimeRef.current < 200) return;

          const { code, confidence } = result.codeResult;
          if (!code || !/^\d{8,13}$/.test(code)) return;

          if (confidence < 0.70) return;

          if (!scanAttempts.current[code]) {
            scanAttempts.current[code] = 1;
          } else {
            scanAttempts.current[code]++;
          }

          if (scanAttempts.current[code] >= 1 && code !== lastResultRef.current) {
            lastResultRef.current = code;
            lastScanTimeRef.current = now;

            try {
              Quagga.pause();
              onScan(code);
              scanAttempts.current = {};
              
              setTimeout(() => {
                if (mountedRef.current && isStarted) {
                  Quagga.start();
                }
              }, 200);
            } catch (e) {
              console.warn('Error during scan processing:', e);
              if (mountedRef.current && isStarted) {
                Quagga.start();
              }
            }
          }
        });

        Quagga.onProcessed((result: any) => {
          const canvas = (Quagga as unknown as { canvas: QuaggaJSCanvas }).canvas;
          if (!canvas?.ctx?.overlay || !canvas?.dom?.overlay) return;
        
          const drawingCtx = canvas.ctx.overlay;
          const drawingCanvas = canvas.dom.overlay;

          const width = drawingCanvas.width;
          const height = drawingCanvas.height;

          drawingCtx.clearRect(0, 0, width, height);

          // Rectangle de scan
          drawingCtx.strokeStyle = "#FF3B58";
          drawingCtx.lineWidth = 3;
          const rectWidth = width * 0.6;
          const rectHeight = height * 0.2;
          const rectX = (width - rectWidth) / 2;
          const rectY = (height - rectHeight) / 2;

          // Ajouter un fond semi-transparent autour du rectangle
          drawingCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          drawingCtx.fillRect(0, 0, width, rectY); // Haut
          drawingCtx.fillRect(0, rectY + rectHeight, width, height - (rectY + rectHeight)); // Bas
          drawingCtx.fillRect(0, rectY, rectX, rectHeight); // Gauche
          drawingCtx.fillRect(rectX + rectWidth, rectY, width - (rectX + rectWidth), rectHeight); // Droite

          // Dessiner le rectangle
          drawingCtx.strokeRect(rectX, rectY, rectWidth, rectHeight);

          // Ligne de scan (uniquement dans le rectangle)
          const scanLineY = rectY + (rectHeight / 2);
          drawingCtx.beginPath();
          drawingCtx.moveTo(rectX, scanLineY);
          drawingCtx.lineTo(rectX + rectWidth, scanLineY);
          drawingCtx.strokeStyle = "red";
          drawingCtx.lineWidth = 2;
          drawingCtx.stroke();

          if (result.box) {
            drawingCtx.beginPath();
            drawingCtx.strokeStyle = "#00F";
            drawingCtx.lineWidth = 2;
            result.box.forEach((p: [number, number], i: number) => {
              if (i === 0) {
                drawingCtx.moveTo(p[0], p[1]);
              } else {
                drawingCtx.lineTo(p[0], p[1]);
              }
            });
            drawingCtx.closePath();
            drawingCtx.stroke();
          }

          if (result.codeResult?.code) {
            drawingCtx.font = "bold 16px Arial";
            drawingCtx.fillStyle = "#00FF00";
            drawingCtx.fillText(result.codeResult.code, 10, height - 10);
          }
        });

      } catch (err) {
        console.warn('Scanner initialization error:', err);
      }
    };

    initQuagga();

    return () => {
      try {
        Quagga.stop();
      } catch (e) {
        console.warn('Error stopping Quagga:', e);
      }
    };
  }, [isStarted, onScan]);

  const handleToggleScanner = () => {
    setIsStarted(prev => !prev);
  };

  return (
    <div className={`relative ${showCloseButton ? 'h-[300px]' : 'h-full'}`}>
      {showCloseButton && (
        <div className="absolute top-2 right-2 z-10 flex space-x-2">
          <button
            onClick={handleToggleScanner}
            className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/40 transition-colors"
          >
            {isStarted ? <CameraOff size={20} /> : <Camera size={20} />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/40 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}

      <div id="interactive" className="viewport h-full w-full overflow-hidden rounded-lg">
        <style>{`
          #interactive.viewport {
            position: relative;
            width: 100%;
            height: 100%;
          }
          #interactive.viewport > canvas, #interactive.viewport > video {
            max-width: 100%;
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 0.5rem;
          }
          .drawingBuffer {
            position: absolute !important;
            top: 0;
            left: 0;
            width: 100% !important;
            height: 100% !important;
          }
          .viewport canvas.drawingBuffer {
            opacity: 0.8;
          }
        `}</style>
      </div>

      {!isStarted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <p className="text-white">Scanner désactivé</p>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;