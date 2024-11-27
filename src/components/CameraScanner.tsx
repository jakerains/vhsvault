import { useState, useRef } from "react";
import { Barcode, Type, X, Camera } from "lucide-react";
import { useZxing } from "react-zxing";
import { createWorker } from "tesseract.js";
import Webcam from "react-webcam";
import { useMovieStore } from "../store/movieStore";
import { searchMovies } from "../services/omdbApi";
import type { Movie } from "../types/movie";

interface CameraScannerProps {
  onClose: () => void;
}

// Define a strict type for OMDB API response
interface OmdbMovie {
  Title: string;
  Year: string;
  Poster: string;
  Genre: string;
  Plot: string;
  Director: string;
  Actors: string;
  imdbRating: string;
  imdbID: string;
  Collection?: string;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onClose }) => {
  const [mode, setMode] = useState<"barcode" | "ocr">("barcode");
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<string>("");
  const addMovie = useMovieStore((state) => state.addMovie);
  const webcamRef = useRef<Webcam>(null);

  const handleScanSuccess = () => {
    setScanFeedback("Scan successful! Processing...");
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    const audio = new Audio("/success-beep.mp3");
    audio.play().catch(() => {});
  };

  const handleMovieData = async (searchResult: any) => {
    try {
      const movie: OmdbMovie = {
        Title: searchResult.Title || "",
        Year: searchResult.Year || "",
        Poster: searchResult.Poster || "",
        Genre: searchResult.Genre || "",
        Plot: searchResult.Plot || "",
        Director: searchResult.Director || "",
        Actors: searchResult.Actors || "",
        imdbRating: searchResult.imdbRating || "",
        imdbID: searchResult.imdbID || "",
        Collection: searchResult.Collection,
      };

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
    } catch (error) {
      console.error('Error adding movie:', error);
      setScanFeedback("Error adding movie. Please try again.");
    }
  };

  const { ref: zxingRef } = useZxing({
    onResult: async (result) => {
      setIsProcessing(true);
      handleScanSuccess();
      try {
        const searchResults = await searchMovies(result.getText());
        if (searchResults.length > 0) {
          await handleMovieData(searchResults[0]);
        } else {
          setScanFeedback("No movie found. Try scanning again.");
        }
      } catch (error) {
        console.error('Error processing barcode:', error);
        setScanFeedback("Error processing barcode. Try again.");
      } finally {
        setIsProcessing(false);
      }
    },
  });

  const handleOCRCapture = async () => {
    if (!webcamRef.current) return;
    
    setIsProcessing(true);
    handleScanSuccess();
    try {
      const worker = await createWorker("eng");
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        throw new Error("Failed to capture screenshot");
      }

      const { data: { text } } = await worker.recognize(imageSrc);
      await worker.terminate();

      const searchResults = await searchMovies(text);
      if (searchResults.length > 0) {
        await handleMovieData(searchResults[0]);
      } else {
        setScanFeedback("No movie found. Try scanning again.");
      }
    } catch (error) {
      console.error('Error processing OCR:', error);
      setScanFeedback("Error processing text. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full bg-black/95 backdrop-blur-sm animate-slide-down">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-2xl font-bold text-purple-400 font-['Press_Start_2P']">
              {mode === "barcode" ? "Scan Barcode" : "Scan Title"}
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
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded text-sm ${
                mode === "barcode" ? "bg-purple-700" : "bg-purple-900/50"
              }`}
            >
              <Barcode size={16} />
              Barcode
            </button>
            <button
              onClick={() => setMode("ocr")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded text-sm ${
                mode === "ocr" ? "bg-purple-700" : "bg-purple-900/50"
              }`}
            >
              <Type size={16} />
              Text
            </button>
          </div>

          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {mode === "barcode" ? (
              <video ref={zxingRef} className="w-full h-full object-cover" />
            ) : (
              <Webcam
                ref={webcamRef}
                className="w-full h-full object-cover"
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: { ideal: 'environment' },
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                }}
              />
            )}
            
            {/* Scanning Guidelines */}
            <div className="absolute inset-0 pointer-events-none">
              {mode === "barcode" ? (
                <div className="h-1/4 w-full absolute top-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                  <div className="w-3/4 h-full border-2 border-purple-500/50 rounded-lg">
                    <div className="w-full h-1 bg-purple-500/50 absolute top-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                </div>
              ) : (
                <div className="absolute inset-16 border-2 border-purple-500/50 rounded-lg">
                  <div className="absolute inset-0 border-4 border-dashed border-purple-500/30 rounded-lg animate-pulse" />
                </div>
              )}
            </div>

            {/* Processing Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="text-purple-400 animate-pulse text-lg mb-2">
                    Processing...
                  </div>
                  <Camera className="w-8 h-8 text-purple-400 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Feedback Message */}
          {scanFeedback && (
            <div className="mt-4 text-center text-sm text-purple-400">
              {scanFeedback}
            </div>
          )}

          {mode === "ocr" && (
            <button
              onClick={handleOCRCapture}
              disabled={isProcessing}
              className="retro-button w-full mt-4"
            >
              Capture & Scan Text
            </button>
          )}

          <p className="text-sm text-purple-300 mt-4 text-center">
            {mode === "barcode"
              ? "Center the barcode in the purple box"
              : "Center the movie title in the frame"}
          </p>
        </div>
      </div>
    </div>
  );
};