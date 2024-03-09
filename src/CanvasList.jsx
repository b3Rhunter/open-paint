// CanvasList.jsx
import { useEffect, useState } from 'react';
import { ref, push, onValue } from 'firebase/database';
import { database } from './firebase';
import { useNavigate } from 'react-router-dom';
import useAuth from './Auth';

const CanvasList = () => {
  const [canvases, setCanvases] = useState([]);
  const [canvasName, setCanvasName] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const canvasesRef = ref(database, 'canvases');
    onValue(canvasesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedCanvases = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .sort((a, b) => b.createdAt - a.createdAt);
        setCanvases(loadedCanvases);
      } else {
        setCanvases([]);
      }
    });
  }, []);

  const createNewCanvas = () => {
    if (!canvasName.trim()) {
      alert("Please enter a canvas name.");
      return;
    }
    const newCanvasRef = push(ref(database, 'canvases'), {
      name: canvasName,
      createdAt: Date.now(),
      createdBy: user.uid
    });
    setCanvasName('');
    navigate(`/canvas/${newCanvasRef.key}`);
  };
  
  return (
    <div className='canvas-list-container'>

      <div className='new-canvas-container'>
        <input
          type="text"
          value={canvasName}
          onChange={(e) => setCanvasName(e.target.value)}
          placeholder="Enter Canvas Name"
        />
        <button onClick={createNewCanvas}>Create New Canvas</button>
      </div>

      <h2>Open Canvases</h2>

      <div className='canvas-list'>
        {canvases.map((canvas) => (
          <div className='canvas-buttons' key={canvas.id}>
            <button onClick={() => navigate(`/canvas/${canvas.id}`)}>
              {canvas.name || 'Unnamed Canvas'} 
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CanvasList;
