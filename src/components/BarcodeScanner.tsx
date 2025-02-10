import React, { useEffect, useRef, useState } from 'react';
import Quagga from '@ericblade/quagga2';
import { X, Camera, CameraOff } from 'lucide-react';


interface BarcodeScannerProps {
  onClose: () => void;
  onScan: (result: string) => void;
  showCloseButton?: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onClose, onScan, showCloseButton = true }) => {

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
        await Quagga.init({
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector("#interactive"),
            constraints: {
              facingMode: "environment",
              width: { min: 450, ideal: 1280, max: 1920 },
              height: { min: 300, ideal: 720, max: 1080 },
              aspectRatio: { min: 1, max: 2 },
              frameRate: { ideal: 30, min: 15 }
            },
            area: {
              top: "30%",    // Zone de scan réduite
              right: "15%",
              left: "15%",
              bottom: "30%"
            }
          },
          locator: {
            patchSize: "medium",
            halfSample: true,
            debug: {
              showCanvas: true,
              showPatches: false,
              showFoundPatches: false,
              showSkeleton: false,
              showLabels: false,
              showPatchLabels: false,
              showRemainingPatchLabels: false,
              boxFromPatches: {
                showTransformed: false,
                showTransformedBox: false,
                showBB: true
              }
            }
          },
          numOfWorkers: 4,
          decoder: {
            readers: ["ean_reader", "ean_8_reader", "code_128_reader", "code_39_reader", "upc_reader", "upc_e_reader"],
            debug: {
              drawBoundingBox: true,
              showFrequency: false,
              drawScanline: true,
              showPattern: false
            },
            multiple: false
          },
          locate: true,
          frequency: 10
        });

        if (!mountedRef.current) return;

        Quagga.start();
        console.log('Quagga started successfully');

        Quagga.onDetected((result) => {
          if (!mountedRef.current) return;

          const now = Date.now();
          if (now - lastScanTimeRef.current < 300) return;

          const code = result.codeResult?.code;
          if (!code || !/^\d{8,13}$/.test(code)) return; // Validation stricte du format

          // Vérification de la qualité du scan
          const confidence = result.codeResult?.confidence;
          if (confidence < 0.75) return; // Ignore les scans de faible qualité

          if (!scanAttempts.current[code]) {
            scanAttempts.current[code] = 1;
          } else {
            scanAttempts.current[code]++;
          }

          if (scanAttempts.current[code] >= 2 && code !== lastResultRef.current) {
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
              }, 300);
            } catch (e) {
              console.warn('Error during scan processing:', e);
              if (mountedRef.current && isStarted) {
                Quagga.start();
              }
            }
          }
        });

        Quagga.onProcessed((result) => {
          const drawingCtx = Quagga.canvas?.ctx?.overlay;
          const drawingCanvas = Quagga.canvas?.dom?.overlay;

          if (!drawingCtx || !drawingCanvas) return;

          const width = drawingCanvas.width || parseInt(drawingCanvas.getAttribute("width") || "0");
          const height = drawingCanvas.height || parseInt(drawingCanvas.getAttribute("height") || "0");

          if (width && height) {
            drawingCtx.clearRect(0, 0, width, height);

            // Dessiner le rectangle de scan
            drawingCtx.strokeStyle = "#FF3B58";
            drawingCtx.lineWidth = 3;
            const rectWidth = width * 0.7;  // 70% de la largeur
            const rectHeight = height * 0.4; // 40% de la hauteur
            const rectX = (width - rectWidth) / 2;
            const rectY = (height - rectHeight) / 2;
            drawingCtx.strokeRect(rectX, rectY, rectWidth, rectHeight);

            // Ligne de scan
            const scanLineY = rectY + (rectHeight / 2);
            drawingCtx.beginPath();
            drawingCtx.moveTo(rectX, scanLineY);
            drawingCtx.lineTo(rectX + rectWidth, scanLineY);
            drawingCtx.strokeStyle = "red";
            drawingCtx.lineWidth = 2;
            drawingCtx.stroke();
          }

          if (result?.box) {
            drawingCtx.beginPath();
            drawingCtx.strokeStyle = "#00F";
            drawingCtx.lineWidth = 2;
            drawingCtx.moveTo(result.box[0][0], result.box[0][1]);
            result.box.forEach((p: number[]) => drawingCtx.lineTo(p[0], p[1]));
            drawingCtx.closePath();
            drawingCtx.stroke();
          }

          if (result?.codeResult?.code) {
            // Afficher le code détecté
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