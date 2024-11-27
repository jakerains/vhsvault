import { useState } from "react";
import { Barcode, Type, X } from "lucide-react";
import { useZxing } from "react-zxing";
import { createWorker } from "tesseract.js";
import Webcam from "react-webcam";
import { useMovieStore } from "../store/movieStore";
import { searchMovies } from "../services/omdbApi";

interface CameraScannerProps {
  onClose: () => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onClose }) => {
  const [mode, setMode] = useState<"barcode" | "ocr">("barcode");
  const [isProcessing, setIsProcessing] = useState(false);
  const addMovie = useMovieStore((state) => state.addMovie);
  const webcamRef = useZxing({
    onDecodeResult: async (result) => {
      setIsProcessing(true);
      try {
        // Use the barcode to search for the movie
        const searchResults = await searchMovies(result.getText());
        if (searchResults.length > 0) {
          const movie = searchResults[0];
          await addMovie({
            title: movie.Title,
            year: movie.Year,
            coverUrl: movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450',
            genre: movie.Genre.split(', '),
            plot: movie.Plot,
            director: movie.Director,
            actors: movie.Actors.split(', '),
            rating: movie.imdbRating,
            imdbId: movie.imdbID,
            collection: movie.Collection,
          });
          onClose();
        }
      } catch (error) {
        console.error('Error processing barcode:', error);
      } finally {
        setIsProcessing(false);
      }
    },
  });

  const handleOCRCapture = async () => {
    if (!webcamRef.current) return;
    
    setIsProcessing(true);
    try {
      const worker = await createWorker();
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(imageSrc);
      await worker.terminate();

      // Search for movie using extracted text
      const searchResults = await searchMovies(text);
      if (searchResults.length > 0) {
        const movie = searchResults[0];
        await addMovie({
          title: movie.Title,
          year: movie.Year,
          coverUrl: movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450',
          genre: movie.Genre.split(', '),
          plot: movie.Plot,
          director: movie.Director,
          actors: movie.Actors.split(', '),
          rating: movie.imdbRating,
          imdbId: movie.imdbID,
          collection: movie.Collection,
        });
        onClose();
      }
    } catch (error) {
      console.error('Error processing OCR:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="scanline" />
      <div className="crt-effect" />
      
      <div className="retro-card w-full max-w-lg mx-auto my-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-2xl font-bold text-purple-400 font-['Press_Start_2P']">
            Scan Movie
          </h2>
          <button
            onClick={onClose}
            className="text-purple-400 hover:text-purple-300"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode("barcode")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded text-sm sm:text-base ${
              mode === "barcode" ? "bg-purple-700" : "bg-purple-900/50"
            }`}
          >
            <Barcode size={16} />
            Barcode
          </button>
          <button
            onClick={() => setMode("ocr")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded text-sm sm:text-base ${
              mode === "ocr" ? "bg-purple-700" : "bg-purple-900/50"
            }`}
          >
            <Type size={16} />
            Text
          </button>
        </div>

        <div className="relative aspect-[3/4] sm:aspect-video bg-black rounded-lg overflow-hidden">
          <Webcam
            ref={webcamRef}
            className="w-full h-full object-cover"
            screenshotFormat="image/jpeg"
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-purple-400 animate-pulse">Processing...</div>
            </div>
          )}
        </div>

        {mode === "ocr" && (
          <button
            onClick={handleOCRCapture}
            disabled={isProcessing}
            className="retro-button w-full mt-4"
          >
            Capture & Scan Text
          </button>
        )}

        <p className="text-sm text-purple-300 mt-4">
          {mode === "barcode"
            ? "Point camera at movie barcode"
            : "Point camera at movie title"}
        </p>
      </div>
    </div>
  );
};