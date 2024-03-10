//Canvas.jsx
import { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { database, storage } from './firebase';
import { ref, onValue, push, set } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const Canvas = ({ user }) => {
  const { id: canvasId } = useParams(); 
  const canvasRef = useRef(null);
  const [isPainting, setIsPainting] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    fillCanvasWhite();
    const dbRef = ref(database, `canvases/${canvasId}/lines`);

    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      const loadedLines = data ? Object.values(data) : [];
      redraw(context, loadedLines);
    });

    return unsubscribe;
  }, [user, canvasId]);

  const fillCanvasWhite = () => {
    const context = canvasRef.current.getContext('2d');
    context.fillStyle = '#e6e6e6';
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const clearCanvas = () => {
    fillCanvasWhite();
  };

  const startPaint = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setIsPainting(true);
    addPoint(offsetX, offsetY, false);
  };

  const paint = (e) => {
    if (!isPainting) return;
    const { offsetX, offsetY } = e.nativeEvent;
    addPoint(offsetX, offsetY, true);
  };

  const stopPaint = () => {
    setIsPainting(false);
  };

  const addPoint = (x, y, dragging) => {
    if (!user) return;

    const newLine = { x, y, dragging, uid: user.uid, color, size: brushSize };
    push(ref(database, `canvases/${canvasId}/lines`), newLine);
  };


  const redraw = (context, lines) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillStyle = '#e6e6e6';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    lines.forEach((line) => {
      context.beginPath();
      context.moveTo(line.x, line.y);
      if (line.dragging) {
        const prevIndex = lines.indexOf(line) - 1;
        if (prevIndex >= 0) {
          context.lineTo(lines[prevIndex].x, lines[prevIndex].y);
        }
      } else {
        context.lineTo(line.x, line.y);
      }
      context.strokeStyle = line.color || '#000000';
      context.lineWidth = line.size || 5;
      context.stroke();
    });
  };

const finalizeCanvas = async () => {
  if (!user || !canvasRef.current) {
    console.error('User is not logged in or canvas reference is undefined.');
    return;
  }

  const canvasDataRef = ref(database, `canvases/${canvasId}`);
  onValue(canvasDataRef, async (snapshot) => {
    const canvasData = snapshot.val();
    if (canvasData && canvasData.createdBy === user.uid) {
      // Ensure this gets lines related to the current canvas
      const currentLines = await getCurrentLines(`canvases/${canvasId}/lines`);
      
      // Redraw the canvas with these lines
      const context = canvasRef.current.getContext('2d');
      redraw(context, currentLines);

      // Convert canvas to Blob after ensuring redraw is complete
      setTimeout(() => {
        canvasRef.current.toBlob(async (blob) => {
          const fileRef = storageRef(storage, `paintings/${user.uid}/${new Date().toISOString()}.jpg`);
          await uploadBytes(fileRef, blob);
          const fileURL = await getDownloadURL(fileRef);
          console.log("Saved painting URL:", fileURL);

          // Consider clearing the canvas and lines after ensuring the blob has been saved
          clearCanvas();
          clearLines();
          await set(ref(database, `canvases/${canvasId}/lines`), null);
          await set(canvasDataRef, null);
          navigate('/');
        }, 'image/jpeg');
      }, 100); // A short delay to ensure redraw completes
    } else {
      alert("You're not authorized to finalize this canvas.");
    }
  }, {
    onlyOnce: true
  });
};

const getCurrentLines = async (path) => {
  return new Promise((resolve) => {
    const dbRef = ref(database, path);
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      const loadedLines = data ? Object.values(data) : [];
      resolve(loadedLines);
    }, {
      onlyOnce: true
    });
  });
};


  const clearLines = () => {
    const dbRef = ref(database, 'lines/shared');
    set(dbRef, null);
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        onMouseDown={startPaint}
        onMouseMove={paint}
        onMouseUp={stopPaint}
        onMouseOut={stopPaint}
        style={{ borderRadius: '1em', backgroundColor: 'white' }}
      />
      <div className='canvas-ui'>
        <input className='color-picker' type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <input className='brush-size' type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(e.target.value)} style={{ margin: '0 10px' }} />
        <button onClick={finalizeCanvas}>Finalize Painting</button>
        <button className='back-btn' onClick={() => navigate('/')}>Back to List</button>
      </div>
    </>
  );
};

Canvas.propTypes = {
  user: PropTypes.shape({
    uid: PropTypes.string.isRequired,
  }),
  canvasId: PropTypes.string, 
};

export default Canvas;
