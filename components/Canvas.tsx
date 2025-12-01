
import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';

export interface CanvasRef {
  clearCanvas: () => void;
  getImageData: () => string | null;
}

export const Canvas = forwardRef<CanvasRef, {}>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;
    
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const { width, height } = entry.contentRect;
            canvas.width = width;
            canvas.height = height;
            setupContext();
        }
    });
    
    resizeObserver.observe(parent);
    
    const setupContext = () => {
        const context = canvas.getContext('2d');
        if (context) {
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.strokeStyle = document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#1F2937'; // gray-200 or gray-800
            context.lineWidth = 4;
            contextRef.current = context;
        }
    };
    
    setupContext();

    return () => {
        resizeObserver.disconnect();
    };
  }, []);

  const getCoords = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in event) {
        return {
            x: event.touches[0].clientX - rect.left,
            y: event.touches[0].clientY - rect.top,
        };
    }
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const context = contextRef.current;
    if (!context) return;
    const { x, y } = getCoords(event);
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
    if (!isDirty) setIsDirty(true);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current) return;
    const { x, y } = getCoords(event);
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (contextRef.current) {
        contextRef.current.closePath();
    }
    setIsDrawing(false);
  };

  useImperativeHandle(ref, () => ({
    clearCanvas: () => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (canvas && context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        setIsDirty(false);
      }
    },
    getImageData: () => {
      const canvas = canvasRef.current;
      if (!canvas || !isDirty) return null;
      // Create a temporary canvas to draw a white background
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if(tempCtx){
        tempCtx.fillStyle = '#FFFFFF';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(canvas, 0, 0);
        return tempCanvas.toDataURL('image/png');
      }
      return canvas.toDataURL('image/png');
    },
  }));

  return (
    <div className="absolute inset-0 w-full h-full touch-none">
       {!isDirty && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-2xl text-gray-400 dark:text-gray-500 font-medium select-none">
            Write a math problem here...
          </p>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    </div>
  );
});
