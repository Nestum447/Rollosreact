import React, { useRef, useState } from "react";

function App() {
  const [image, setImage] = useState(null);
  const [rollos, setRollos] = useState([]);
  const canvasRef = useRef(null);

  const handleUpload = (e) => {
    if (e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setImage(url);
      setRollos([]);
    }
  };

  const detectRollos = async () => {
    if (!image || !window.cv) return;

    const img = new Image();
    img.src = image;

    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      let src = window.cv.imread(canvas);
      let gray = new window.cv.Mat();
      window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY, 0);
      window.cv.medianBlur(gray, gray, 5);

      let circles = new window.cv.Mat();
      window.cv.HoughCircles(
        gray,
        circles,
        window.cv.HOUGH_GRADIENT,
        1,
        50,
        100,
        30,
        10,
        200
      );

      let puntos = [];
      for (let i = 0; i < circles.cols; ++i) {
        let x = circles.data32F[i * 3];
        let y = circles.data32F[i * 3 + 1];
        puntos.push({ x, y });
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }

      setRollos(puntos);
      src.delete();
      gray.delete();
      circles.delete();
    };
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>📦 Detector de Rollos</h1>
      <input type="file" accept="image/*" onChange={handleUpload} />
      <br />
      {image && (
        <>
          <canvas ref={canvasRef} style={{ maxWidth: "100%", marginTop: 10 }} />
          <br />
          <button onClick={detectRollos} style={{ marginTop: 10 }}>
            🔍 Detectar rollos
          </button>
          <h2>Total detectados: {rollos.length}</h2>
        </>
      )}
    </div>
  );
}

export default App;
