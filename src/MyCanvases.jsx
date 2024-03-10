// MyCanvases.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from './Auth';
import { listAll, ref as storageRef, getDownloadURL } from "firebase/storage";
import { storage } from './firebase';

const MyCanvases = () => {
  const [canvasImages, setCanvasImages] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const userCanvasPath = `paintings/${user.uid}/`;
      const canvasesRef = storageRef(storage, userCanvasPath);

      listAll(canvasesRef)
        .then((res) => {
          const imageUrlsPromise = res.items.map((itemRef) => 
            getDownloadURL(itemRef)
          );

          Promise.all(imageUrlsPromise)
            .then((urls) => {
              setCanvasImages(urls);
            })
            .catch((error) => console.log(error));
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  }, [user]);

  return (
    <div className='canvas-list-container'>
      <button className='back-btn' onClick={() => navigate('/')}>Back to List</button>
      <div className='canvas-grid'>
        {canvasImages.map((url, index) => (
          <div key={index} className='canvas-image-container'>
            <img src={url} alt={`Canvas ${index + 1}`} style={{width: '100%', height: 'auto'}}/>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCanvases;
