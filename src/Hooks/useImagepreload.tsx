import { useEffect, useState, useRef } from "react";

function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function () {
      resolve(img);
    };
    img.onerror = img.onabort = function () {
      reject(src);
    };
    img.src = src;
  });
}

export default function useImagePreloader(imageList: string[]) {
  const [imageStates, setImageStates] = useState<Record<string, boolean>>({});
  const processedListRef = useRef<string[]>([]);

  useEffect(() => {
    const validImages = imageList.filter(Boolean);
    
    if (validImages.length === 0) return;

    // Check if we've already processed this exact list
    const currentListString = JSON.stringify(validImages);
    if (currentListString === JSON.stringify(processedListRef.current)) {
      return;
    }

    processedListRef.current = validImages;

    const processImages = async () => {
      const promises = validImages.map(async (imageUrl) => {
        try {
          await preloadImage(imageUrl);
          return { imageUrl, success: true };
        } catch {
          console.warn('Failed to preload image:', imageUrl);
          return { imageUrl, success: false };
        }
      });

      const results = await Promise.all(promises);
      
      const newStates: Record<string, boolean> = {};
      results.forEach(({ imageUrl, success }) => {
        newStates[imageUrl] = success;
      });

      setImageStates(newStates);
    };

    processImages();
  }, [imageList]);

  return { imageStates };
}
