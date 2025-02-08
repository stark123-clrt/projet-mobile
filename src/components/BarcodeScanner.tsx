import React, { useEffect, useRef, useState } from 'react';
import Quagga from '@ericblade/quagga2';
import { X, Camera, CameraOff } from 'lucide-react';
// import { useTheme } from '../context/ThemeContext';

interface BarcodeScannerProps {
  onClose: () => void;
  onScan: (result: string) => void;
  showCloseButton?: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onClose, onScan, showCloseButton = true }) => {
  // const { darkMode } = useTheme();ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
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
            // target: document.querySelector("#interactive"),fffffffffffffffffffffffffffffffffff
            constraints: {
              facingMode: "environment",
              width: { min: 450, ideal: 1280, max: 1920 },
              height: { min: 300, ideal: 720, max: 1080 },
              aspectRatio: { min: 1, max: 2 },
              // focusMode: "continuous",ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
              frameRate: { ideal: 30, min: 15 }
            },
            area: {
              top: "0%",
              right: "0%",
              left: "0%",
              bottom: "0%"
            }
          },
          locator: {
            patchSize: "medium",
            halfSample: true
          },
          numOfWorkers: 4,
          decoder: {
            readers: ["ean_reader", "ean_8_reader", "code_128_reader", "code_39_reader", "upc_reader", "upc_e_reader"]
          },
          locate: true
        });

        if (!mountedRef.current) return;

        Quagga.start();
        console.log('Quagga started successfully');

        // Gestionnaire de détection optimisé
        Quagga.onDetected((result) => {
          if (!mountedRef.current) return;

          const now = Date.now();
          if (now - lastScanTimeRef.current < 300) return;

          const code = result.codeResult?.code;
          if (!code) return;

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

        // Gestionnaire de traitement sécurisé
        Quagga.onProcessed((result) => {
          const drawingCtx = Quagga.canvas?.ctx?.overlay;
          const drawingCanvas = Quagga.canvas?.dom?.overlay;

          if (!drawingCtx || !drawingCanvas) return;

          // Récupération sécurisée des dimensions
          const width = drawingCanvas.width || parseInt(drawingCanvas.getAttribute("width") || "0");
          const height = drawingCanvas.height || parseInt(drawingCanvas.getAttribute("height") || "0");

          if (width && height) {
            drawingCtx.clearRect(0, 0, width, height);
          }

          if (result?.boxes) {
            const box = result.box;
            result.boxes.forEach((b: any) => {
              if (b !== box) {
                drawingCtx.beginPath();
                drawingCtx.strokeStyle = "green";
                drawingCtx.lineWidth = 2;
                drawingCtx.moveTo(b[0][0], b[0][1]);
                b.forEach((p: number[]) => drawingCtx.lineTo(p[0], p[1]));
                drawingCtx.closePath();
                drawingCtx.stroke();
              }
            });
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
            drawingCtx.beginPath();
            drawingCtx.strokeStyle = "red";
            drawingCtx.lineWidth = 3;
            result.line.forEach((p: { x: number, y: number }, i: number) => {
              if (i === 0) {
                drawingCtx.moveTo(p.x, p.y);
              } else {
                drawingCtx.lineTo(p.x, p.y);
              }
            });
            drawingCtx.stroke();
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