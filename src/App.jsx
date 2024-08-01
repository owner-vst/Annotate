
import { useEffect, useRef, useState } from 'react';
import { Annotorious } from '@recogito/annotorious';

import '@recogito/annotorious/dist/annotorious.min.css';
import './App.css'; // Add your CSS file

function App() {
  // Ref to the image DOM element
  const imgEl = useRef();

  // The current Annotorious instance
  const [anno, setAnno] = useState();

  // Current drawing tool name
  const [tool, setTool] = useState('rect');

  // State to store annotations
  const [annotations, setAnnotations] = useState([]);

  // State to store the image source
  const [imageSrc, setImageSrc] = useState("https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp");

  // Init Annotorious when the component mounts
  useEffect(() => {
    let annotorious = null;

    if (imgEl.current) {
      // Init
      annotorious = new Annotorious({
        image: imgEl.current
      });

      // Attach event handlers here
      annotorious.on('createAnnotation', annotation => {
        console.log('created', annotation);
        setAnnotations(prevAnnotations => [...prevAnnotations, annotation]);
      });

      annotorious.on('updateAnnotation', (annotation, previous) => {
        console.log('updated', annotation, previous);
        setAnnotations(prevAnnotations => prevAnnotations.map(ann => ann.id === previous.id ? annotation : ann));
      });

      annotorious.on('deleteAnnotation', annotation => {
        console.log('deleted', annotation);
        setAnnotations(prevAnnotations => prevAnnotations.filter(ann => ann.id !== annotation.id));
      });
    }

    // Keep current Annotorious instance in state
    setAnno(annotorious);

    // Cleanup: destroy current instance
    return () => annotorious.destroy();
  }, [imageSrc]);

  // Toggles current tool + button label
  const toggleTool = (toolName) => {
    setTool(toolName);
    anno.setDrawingTool(toolName);
  }

  // Handles image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handles URL input
  const handleUrlInput = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      setImageSrc(url);
    }
  };

  return (
    <div className="container">
      <div className="toolbar">
        <button className={`tool-button ${tool === 'rect' ? 'active' : ''}`} onClick={() => toggleTool('rect')}>
          RECTANGLE
        </button>
        <button className={`tool-button ${tool === 'polygon' ? 'active' : ''}`} onClick={() => toggleTool('polygon')}>
          POLYGON
        </button>
      </div>

      <div className="image-container">
        <div className="upload-options">
          <label htmlFor="upload-image" className="upload-button">Upload Image</label>
          <input
            type="file"
            id="upload-image"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleImageUpload}
          />
          <button className="upload-button" onClick={handleUrlInput}>Upload from URL</button>
        </div>
        <div className="image-box">
          <img
            ref={imgEl}
            src={imageSrc}
            alt="Annotated"
          />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Coordinates</th>
            </tr>
          </thead>
          <tbody>
            {annotations.map(annotation => (
              <tr key={annotation.id}>
                <td>{annotation.id}</td>
                <td>{annotation.target.selector.value.includes('polygon') ? 'Polygon' : 'Rectangle'}</td>
                <td>{annotation.target.selector.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
