import { useEffect, useRef, useState } from 'react';
import { createWorker } from 'tesseract.js';
import './App.css';
import ImageWithOverlay from './ImageWithOverlay';

function App() {
    const workerInitedRef = useRef(false);
    const [worker, setWorker] = useState<Tesseract.Worker | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [result, setResult] = useState<Tesseract.RecognizeResult['data'] | undefined>();

    const initWorker = async () => {
        if (workerInitedRef.current) return;

        workerInitedRef.current = true;
        const w = await createWorker('eng', 1, {
            logger: (m) => console.log(m),
        });
        setWorker(w);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const result = await worker?.recognize(file, undefined, {
                blocks: true,
                hocr: true,
            });
            setImage(URL.createObjectURL(file));
            setResult(result?.data);
        }
    };

    useEffect(() => {
        initWorker();

        return () => {
            worker?.terminate();
        };
    }, []);

    return worker ? (
        <>
            <input type="file" onChange={handleFileChange} />
            {image && result && <ImageWithOverlay image={image} data={result} />}
        </>
    ) : (
        <div>Loading...</div>
    );
}

export default App;
