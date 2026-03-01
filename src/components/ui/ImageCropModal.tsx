"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut, Crop, RotateCcw } from "lucide-react";

interface ImageCropModalProps {
  /** The source image file selected by the user */
  imageFile: File;
  /** Called with the cropped square image blob */
  onCrop: (croppedBlob: Blob) => void;
  /** Called when the user cancels cropping */
  onCancel: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.01;
const OUTPUT_SIZE = 512; // Output square size in px

export default function ImageCropModal({
  imageFile,
  onCrop,
  onCancel,
}: ImageCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Image state
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [cropping, setCropping] = useState(false);

  // Drag state
  const dragRef = useRef({
    dragging: false,
    lastX: 0,
    lastY: 0,
  });

  // Container size for rendering
  const [cropSize, setCropSize] = useState(280);

  // Load the image when file changes
  useEffect(() => {
    const url = URL.createObjectURL(imageFile);
    const image = new Image();
    image.onload = () => {
      setImg(image);
      setZoom(MIN_ZOOM);
      setOffset({ x: 0, y: 0 });
    };
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  // Compute crop size based on container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        // Crop circle should be 280px on desktop, smaller on mobile
        setCropSize(Math.min(280, w - 48));
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Clamp offset so the image always covers the crop circle
  const clampOffset = useCallback(
    (ox: number, oy: number, z: number) => {
      if (!img) return { x: ox, y: oy };

      // Compute the scaled image dimensions that would fill the crop area
      const aspect = img.width / img.height;
      let scaledW: number, scaledH: number;

      if (aspect >= 1) {
        // Landscape or square: height fits the crop size
        scaledH = cropSize * z;
        scaledW = scaledH * aspect;
      } else {
        // Portrait: width fits the crop size
        scaledW = cropSize * z;
        scaledH = scaledW / aspect;
      }

      const maxOffsetX = Math.max(0, (scaledW - cropSize) / 2);
      const maxOffsetY = Math.max(0, (scaledH - cropSize) / 2);

      return {
        x: Math.max(-maxOffsetX, Math.min(maxOffsetX, ox)),
        y: Math.max(-maxOffsetY, Math.min(maxOffsetY, oy)),
      };
    },
    [img, cropSize],
  );

  // Draw the canvas whenever state changes
  useEffect(() => {
    if (!img || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displaySize = cropSize + 80; // Extra padding around crop circle
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;
    canvas.style.width = `${displaySize}px`;
    canvas.style.height = `${displaySize}px`;
    ctx.scale(dpr, dpr);

    const centerX = displaySize / 2;
    const centerY = displaySize / 2;

    // Compute image draw dimensions (fit shortest side to cropSize, then scale by zoom)
    const aspect = img.width / img.height;
    let drawW: number, drawH: number;

    if (aspect >= 1) {
      drawH = cropSize * zoom;
      drawW = drawH * aspect;
    } else {
      drawW = cropSize * zoom;
      drawH = drawW / aspect;
    }

    const drawX = centerX - drawW / 2 + offset.x;
    const drawY = centerY - drawH / 2 + offset.y;

    // Clear
    ctx.clearRect(0, 0, displaySize, displaySize);

    // Draw full image (dimmed)
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();

    // Clip to circle and draw bright image
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, cropSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();

    // Draw circle border
    ctx.beginPath();
    ctx.arc(centerX, centerY, cropSize / 2, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw corner indicators (subtle crosshairs)
    const r = cropSize / 2;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1;
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(centerX - r - 8, centerY);
    ctx.lineTo(centerX - r + 12, centerY);
    ctx.moveTo(centerX + r - 12, centerY);
    ctx.lineTo(centerX + r + 8, centerY);
    // Vertical line
    ctx.moveTo(centerX, centerY - r - 8);
    ctx.lineTo(centerX, centerY - r + 12);
    ctx.moveTo(centerX, centerY + r - 12);
    ctx.lineTo(centerX, centerY + r + 8);
    ctx.stroke();
  }, [img, zoom, offset, cropSize]);

  // --- Interaction handlers ---

  const handlePointerDown = (e: React.PointerEvent | React.TouchEvent) => {
    const point = "touches" in e ? e.touches[0] : e;
    dragRef.current = {
      dragging: true,
      lastX: point.clientX,
      lastY: point.clientY,
    };
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent | React.TouchEvent) => {
      if (!dragRef.current.dragging) return;
      const point = "touches" in e ? e.touches[0] : e;
      const dx = point.clientX - dragRef.current.lastX;
      const dy = point.clientY - dragRef.current.lastY;
      dragRef.current.lastX = point.clientX;
      dragRef.current.lastY = point.clientY;

      setOffset((prev) => clampOffset(prev.x + dx, prev.y + dy, zoom));
    },
    [zoom, clampOffset],
  );

  const handlePointerUp = () => {
    dragRef.current.dragging = false;
  };

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP * 5 : ZOOM_STEP * 5;
      setZoom((prev) => {
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta));
        setOffset((prevOffset) =>
          clampOffset(prevOffset.x, prevOffset.y, newZoom),
        );
        return newZoom;
      });
    },
    [clampOffset],
  );

  // Attach wheel listener with { passive: false } to prevent page scroll
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
    setOffset((prev) => clampOffset(prev.x, prev.y, newZoom));
  };

  const handleReset = () => {
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
  };

  // --- Crop handler ---
  const handleCrop = async () => {
    if (!img) return;
    setCropping(true);

    try {
      // Create an offscreen canvas at the output size
      const offscreen = document.createElement("canvas");
      offscreen.width = OUTPUT_SIZE;
      offscreen.height = OUTPUT_SIZE;
      const ctx = offscreen.getContext("2d");
      if (!ctx) return;

      // Replicate the same draw math but mapped to OUTPUT_SIZE
      const aspect = img.width / img.height;
      let drawW: number, drawH: number;

      if (aspect >= 1) {
        drawH = OUTPUT_SIZE * zoom;
        drawW = drawH * aspect;
      } else {
        drawW = OUTPUT_SIZE * zoom;
        drawH = drawW / aspect;
      }

      // offset is relative to cropSize, scale to OUTPUT_SIZE
      const scale = OUTPUT_SIZE / cropSize;
      const drawX = OUTPUT_SIZE / 2 - drawW / 2 + offset.x * scale;
      const drawY = OUTPUT_SIZE / 2 - drawH / 2 + offset.y * scale;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      offscreen.toBlob(
        (blob) => {
          if (blob) {
            onCrop(blob);
          }
          setCropping(false);
        },
        "image/webp",
        0.92,
      );
    } catch {
      setCropping(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        ref={containerRef}
        className="relative z-10 w-[95vw] max-w-[460px] bg-white rounded-3xl shadow-2xl overflow-hidden animate-[fade-in-up_0.3s_ease-out]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 font-[family-name:var(--font-outfit)]">
              Crop Profile Photo
            </h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Drag to reposition • Scroll to zoom
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex items-center justify-center bg-gray-900 py-6 px-4 select-none">
          <canvas
            ref={canvasRef}
            className="cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          />
        </div>

        {/* Zoom Controls */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                handleZoomChange(Math.max(MIN_ZOOM, zoom - ZOOM_STEP * 10))
              }
              className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={ZOOM_STEP}
              value={zoom}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-red-600
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-red-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
            />
            <button
              type="button"
              onClick={() =>
                handleZoomChange(Math.min(MAX_ZOOM, zoom + ZOOM_STEP * 10))
              }
              className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-400 ml-1"
              title="Reset position"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-400 font-medium mt-2">
            {Math.round(zoom * 100)}%
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCrop}
            disabled={cropping || !img}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-500 disabled:bg-red-200 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg shadow-red-600/20 hover:shadow-red-600/30"
          >
            {cropping ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Crop className="w-4 h-4" />
            )}
            {cropping ? "Processing…" : "Crop & Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
