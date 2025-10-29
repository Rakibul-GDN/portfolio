"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useTheme } from "next-themes";

interface DelicateAsciiDotsProps {
    lightBackgroundColor?: string;
    darkBackgroundColor?: string;
    lightTextColor?: string;
    darkTextColor?: string;
    gridSize?: number;
    removeWaveLine?: boolean;
    animationSpeed?: number;
}

interface Wave {
    x: number;
    y: number;
    frequency: number;
    amplitude: number;
    phase: number;
    speed: number;
}

interface GridCell {
    char: string;
    opacity: number;
}

const DelicateAsciiDots = ({
    lightBackgroundColor = "#ffffff", // Light theme background
    darkBackgroundColor = "#000000",  // Dark theme background
    lightTextColor = "100, 100, 100", // Light theme text (dark gray)
    darkTextColor = "150, 150, 150",  // Dark theme text (light gray)
    gridSize = 100, // Increased default grid size for better visibility
    removeWaveLine = true,
    animationSpeed = 0.75,
}: DelicateAsciiDotsProps) => {
    const { theme = 'light', systemTheme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseRef = useRef({ x: 0, y: 0, isDown: false });
    const wavesRef = useRef<Wave[]>([]);
    const timeRef = useRef<number>(0);
    const animationFrameId = useRef<number | null>(null);
    const clickWaves = useRef<Array<{ x: number; y: number; time: number; intensity: number }>>([]);
    const dimensionsRef = useRef({ width: 0, height: 0 });

    // Determine current theme
    const currentTheme = theme === 'system' ? systemTheme : theme;
    
    // Get colors based on current theme
    const backgroundColor = currentTheme === 'dark' ? darkBackgroundColor : lightBackgroundColor;
    const textColor = currentTheme === 'dark' ? darkTextColor : lightTextColor;

    const CHARS =
        "⣾⣽⣻⢿⡿⣟⣯⣷⣦⣧⣪⣫⣬⣭⣮⣯⣱⣲⣳⣴⣵⣶⣷⣸⣹⣺⣻⣼⣽⣾⣿";

    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const containerRect = container.getBoundingClientRect();
        const width = containerRect.width;
        const height = containerRect.height;

        // Store dimensions for coordinate calculations
        dimensionsRef.current = { width, height };

        const dpr = window.devicePixelRatio || 1;

        // Set canvas size to match container
        canvas.width = width * dpr;
        canvas.height = height * dpr;

        canvas.style.width = width + "px";
        canvas.style.height = height + "px";

        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.scale(dpr, dpr);
        }
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        mouseRef.current = {
            x: x,
            y: y,
            isDown: mouseRef.current.isDown,
        };
    }, []);

    const handleMouseDown = useCallback(
        (e: MouseEvent) => {
            mouseRef.current.isDown = true;
            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Convert screen coordinates to grid coordinates
            const { width, height } = dimensionsRef.current;
            const cellWidth = width / gridSize;
            const cellHeight = height / gridSize;

            const gridX = x / cellWidth;
            const gridY = y / cellHeight;

            clickWaves.current.push({
                x: gridX,
                y: gridY,
                time: Date.now(),
                intensity: 1.5, // Reduced intensity for subtler effect
            });

            // Clean up old waves
            const now = Date.now();
            clickWaves.current = clickWaves.current.filter((wave) => now - wave.time < 3000); // Reduced duration
        },
        [gridSize]
    );

    const handleMouseUp = useCallback(() => {
        mouseRef.current.isDown = false;
    }, []);

    const getClickWaveInfluence = (x: number, y: number, currentTime: number): number => {
        let totalInfluence = 0;

        clickWaves.current.forEach((wave) => {
            const age = currentTime - wave.time;
            const maxAge = 3000; // Reduced duration
            if (age < maxAge) {
                const dx = x - wave.x;
                const dy = y - wave.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const waveRadius = (age / maxAge) * gridSize * 0.6; // Smaller radius
                const waveWidth = gridSize * 0.1; // Thinner waves

                if (Math.abs(distance - waveRadius) < waveWidth) {
                    const waveStrength = (1 - age / maxAge) * wave.intensity;
                    const proximityToWave = Math.max(0, 1 - Math.abs(distance - waveRadius) / waveWidth);
                    totalInfluence += waveStrength * proximityToWave * Math.sin((distance - waveRadius) * 0.5);
                }
            }
        });

        return totalInfluence;
    };

    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const currentTime = Date.now();
        timeRef.current += animationSpeed * 0.016;

        const { width, height } = dimensionsRef.current;
        if (width === 0 || height === 0) return;

        // Clear canvas with theme-appropriate background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        const newGrid: (GridCell | null)[][] = Array(gridSize)
            .fill(0)
            .map(() => Array(gridSize).fill(null));

        // Calculate cell dimensions
        const cellWidth = width / gridSize;
        const cellHeight = height / gridSize;

        // Convert mouse position to grid coordinates
        const mouseGridX = mouseRef.current.x / cellWidth;
        const mouseGridY = mouseRef.current.y / cellHeight;

        // Create mouse wave
        const mouseWave: Wave = {
            x: mouseGridX,
            y: mouseGridY,
            frequency: 0.25, // Reduced frequency for subtler effect
            amplitude: 0.8, // Reduced amplitude for subtler effect
            phase: timeRef.current * 1.5, // Slower phase for subtler effect
            speed: 0.8, // Slower wave speed
        };

        // Calculate wave interference
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                let totalWave = 0;

                // Sum all wave contributions
                const allWaves = wavesRef.current.concat([mouseWave]);

                allWaves.forEach((wave) => {
                    const dx = x - wave.x;
                    const dy = y - wave.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const falloff = 1 / (1 + dist * 0.05); // Reduced falloff for wider spread
                    const value = Math.sin(dist * wave.frequency - timeRef.current * wave.speed + wave.phase) * wave.amplitude * falloff;

                    totalWave += value;
                });

                // Add click wave influence
                const clickInfluence = getClickWaveInfluence(x, y, currentTime);
                totalWave += clickInfluence;

                // Enhanced mouse interaction with theme-aware response
                const mouseDistance = Math.sqrt((x - mouseGridX) ** 2 + (y - mouseGridY) ** 2);
                if (mouseDistance < gridSize * 0.25) { // Smaller interaction radius
                    const mouseEffect = (1 - mouseDistance / (gridSize * 0.25)) * 0.6; // Reduced effect
                    totalWave += mouseEffect * Math.sin(timeRef.current * 2); // Slower oscillation
                }

                // Map interference pattern to characters and opacity
                const normalizedWave = (totalWave + 2) / 4;
                if (Math.abs(totalWave) > 0.15) { // Slightly reduced threshold for more characters
                    const charIndex = Math.min(CHARS.length - 1, Math.max(0, Math.floor(normalizedWave * (CHARS.length - 1))));
                    const opacity = Math.min(0.7, Math.max(0.2, 0.2 + normalizedWave * 0.5)); // Reduced max opacity for subtler effect

                    newGrid[y][x] = {
                        char: CHARS[charIndex] || CHARS[0],
                        opacity: opacity,
                    };
                }
            }
        }

        // Calculate optimal font size
        const fontSize = Math.min(cellWidth, cellHeight) * 0.9; // Slightly larger font
        ctx.font = `400 ${fontSize}px monospace`; // Added font weight
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Draw characters with theme-appropriate color
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const cell = newGrid[y][x];
                if (cell && cell.char) {
                    ctx.fillStyle = `rgba(${textColor}, ${cell.opacity})`;
                    ctx.fillText(cell.char, x * cellWidth + cellWidth / 2, y * cellHeight + cellHeight / 2);
                }
            }
        }

        // Draw click wave effects (visual ripples)
        if (!removeWaveLine) {
            clickWaves.current.forEach((wave) => {
                const age = currentTime - wave.time;
                const maxAge = 3000; // Consistent with cleanup
                if (age < maxAge) {
                    const progress = age / maxAge;
                    const radius = progress * Math.min(width, height) * 0.3; // Smaller max radius
                    const alpha = (1 - progress) * 0.2 * wave.intensity; // Reduced alpha for subtler effect

                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${textColor}, ${alpha})`;
                    ctx.lineWidth = 0.8; // Thinner lines
                    ctx.arc(wave.x * cellWidth, wave.y * cellHeight, radius, 0, 2 * Math.PI);
                    ctx.stroke();
                }
            });
        }

        animationFrameId.current = requestAnimationFrame(animate);
    }, [backgroundColor, textColor, gridSize, animationSpeed, removeWaveLine]);

    // Update theme when it changes
    useEffect(() => {
        setIsMounted(true);
        // The animation will automatically use the updated theme colors
    }, [theme, systemTheme]);

    useEffect(() => {
        if (!isMounted) return;

        // Initialize background waves
        const waves: Wave[] = [];
        const numWaves = 3; // Reduced number for cleaner look

        for (let i = 0; i < numWaves; i++) {
            waves.push({
                x: gridSize * (0.2 + Math.random() * 0.6), // More centralized position
                y: gridSize * (0.2 + Math.random() * 0.6),
                frequency: 0.15 + Math.random() * 0.2, // Reduced frequency for subtler effect
                amplitude: 0.4 + Math.random() * 0.3,   // Reduced amplitude for subtler effect
                phase: Math.random() * Math.PI * 2,
                speed: 0.4 + Math.random() * 0.3,      // Slower speeds
            });
        }

        wavesRef.current = waves;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Initial resize
        resizeCanvas();

        const handleResize = () => {
            resizeCanvas();
        };

        window.addEventListener("resize", handleResize);
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mouseup", handleMouseUp);

        // Start animation
        animate();

        return () => {
            window.removeEventListener("resize", handleResize);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("mouseup", handleMouseUp);

            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }
            timeRef.current = 0;
            clickWaves.current = [];
            wavesRef.current = [];
        };
    }, [animate, resizeCanvas, handleMouseMove, handleMouseDown, handleMouseUp, gridSize, isMounted, backgroundColor, textColor]);

    // Don't render until mounted to prevent SSR issues
    if (!isMounted) {
        return (
            <div className="w-full h-full fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] overflow-hidden" 
                 style={{ backgroundColor: theme === 'dark' ? darkBackgroundColor : lightBackgroundColor }} />
        );
    }

    return (
        <div
            ref={containerRef}
            className="w-full h-full fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] overflow-hidden"
            style={{ backgroundColor: backgroundColor }}
        >
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
};

export default DelicateAsciiDots;
