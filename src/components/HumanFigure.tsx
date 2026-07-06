/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BodyPartKey } from '../types';
import { BODY_PARTS } from '../utils';

interface HumanFigureProps {
  mode: 'interactive-select' | 'dashboard-view';
  selectedParts?: Record<BodyPartKey, boolean>;
  onChange?: (key: BodyPartKey, selected: boolean) => void;
  counts?: Record<BodyPartKey, number>;
  hideLabels?: boolean;
}

// Map body parts to coordinate offsets on a 200x500 virtual canvas (fully aligned coordinates)
const PART_COORDINATES: Record<BodyPartKey, { x: number; y: number; labelSide: 'left' | 'right'; lineYOffset?: number }> = {
  head: { x: 100, y: 20, labelSide: 'left' },
  eye: { x: 86, y: 38, labelSide: 'left' },
  face: { x: 100, y: 48, labelSide: 'left' },
  ear: { x: 118, y: 42, labelSide: 'right' },
  throat_neck: { x: 100, y: 76, labelSide: 'left' },
  tooth_teeth: { x: 105, y: 60, labelSide: 'right' },
  shoulder: { x: 74, y: 95, labelSide: 'left' },
  lungs: { x: 90, y: 125, labelSide: 'left' },
  breast: { x: 108, y: 125, labelSide: 'right' },
  back: { x: 100, y: 160, labelSide: 'left' },
  elbow: { x: 55, y: 160, labelSide: 'right' },
  abdomen_pelvis: { x: 100, y: 190, labelSide: 'left' },
  arm: { x: 58, y: 140, labelSide: 'right' },
  hip_leg: { x: 82, y: 270, labelSide: 'left' },
  hand_wrist: { x: 48, y: 220, labelSide: 'right' },
  finger: { x: 44, y: 245, labelSide: 'right' },
  groin: { x: 100, y: 235, labelSide: 'left' },
  knee: { x: 80, y: 340, labelSide: 'left' },
  foot_ankle: { x: 83, y: 445, labelSide: 'right' },
  toe: { x: 83, y: 475, labelSide: 'right' }
};

export default function HumanFigure({
  mode,
  selectedParts = {} as Record<BodyPartKey, boolean>,
  onChange,
  counts = {} as Record<BodyPartKey, number>,
  hideLabels = false
}: HumanFigureProps) {
  const [hoveredPart, setHoveredPart] = React.useState<BodyPartKey | null>(null);
  const [mobileTappedPart, setMobileTappedPart] = React.useState<BodyPartKey | null>(null);

  const handlePartClick = (key: BodyPartKey) => {
    if (onChange) {
      onChange(key, !selectedParts[key]);
    }
  };

  React.useEffect(() => {
    if (mobileTappedPart) {
      const timer = setTimeout(() => {
        setMobileTappedPart(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [mobileTappedPart]);

  // Helper to get color intensity based on incident counts featuring DKSH Red gradients
  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'rgba(90, 93, 1 gray, 0.45)';
    if (count < 2) return '#EAB308'; // Safety gold yellow for low
    if (count < 5) return '#EA580C'; // Vibrant orange for medium
    return '#9D2235'; // Intense DKSH Red for high frequency
  };

  const keys = Object.keys(PART_COORDINATES) as BodyPartKey[];

  return (
    <div id="human-figure-outer-container" className={`relative w-full mx-auto flex flex-col md:flex-row items-center justify-center transition-all ${
      hideLabels 
        ? 'p-0 bg-transparent border-none shadow-none gap-0' 
        : 'max-w-4xl bg-white rounded-2xl border border-gray-200 p-6 gap-8 shadow-sm'
    }`}>
      
      {/* Title indicating mode/role */}
      {!hideLabels && (
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${mode === 'interactive-select' ? 'bg-dksh-red animate-pulse' : 'bg-[#5A5D60]'}`} />
          <span className="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-widest">
            {mode === 'interactive-select' ? 'Form Mode: Click diagram fields to flag body part' : 'Compliance Heatmap Analysis View'}
          </span>
        </div>
      )}

      {/* LEFT COLUMN: Labels (pointing to left side coordinates) */}
      {!hideLabels && (
        <div id="left-side-indicators-container" className="hidden md:flex w-full md:w-[290px] flex-col gap-2 select-none text-right">
          <h4 className="text-[10px] font-bold text-[#5A5D60] uppercase tracking-wider border-b pb-1 mb-1">Left Side Indicators</h4>
          {keys
            .filter(k => PART_COORDINATES[k].labelSide === 'left')
            .map(k => {
              const isSelected = selectedParts[k];
              const count = counts[k] || 0;
              const isHovered = hoveredPart === k;
              
              return (
                <div
                  key={k}
                  onMouseEnter={() => setHoveredPart(k)}
                  onMouseLeave={() => setHoveredPart(null)}
                  className={`group flex items-center justify-end gap-2 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 cursor-pointer ${
                    mode === 'interactive-select'
                      ? isSelected
                        ? 'bg-red-50 text-dksh-red font-bold border-r-3 border-dksh-red'
                        : 'hover:bg-gray-50 text-gray-600'
                      : count > 0
                      ? 'bg-red-50 text-dksh-red font-bold border-r-3 border-dksh-red shadow-xs'
                      : 'text-gray-400 hover:text-gray-600'
                  } ${isHovered ? 'scale-102 bg-gray-50/80 shadow-xs' : ''}`}
                  onClick={() => handlePartClick(k)}
                >
                  <span className="text-[10px] font-mono bg-white border border-gray-100 px-1.5 py-0.5 rounded text-gray-500 shadow-2xs">
                    {mode === 'interactive-select' ? (isSelected ? '✓' : '—') : `${count} Case(s)`}
                  </span>
                  <span className="font-semibold text-gray-800 whitespace-nowrap">{BODY_PARTS[k]}</span>
                </div>
              );
            })}
        </div>
      )}

      {/* CENTER COLUMN: Symmetrical Anatomical Blueprint Vector */}
      <div id="human-figure-center-graphic-wrapper" className="relative w-[300px] h-[520px] flex items-center justify-center bg-[#F4F4F4] rounded-xl border border-gray-200/80 p-2 overflow-visible shadow-2xs">
        <svg
          viewBox="0 0 200 500"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* DEFINITIONS for glow filters */}
          <defs>
            <filter id="glow-danger" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComponentTransfer in="blur" result="boost">
                <feFuncA type="linear" slope="1.5"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="boost" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#475569" floodOpacity="0.15" />
            </filter>
            
            {/* Realistic human body shading linear gradients */}
            <linearGradient id="body-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            
            <linearGradient id="muscle-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f1f5f9" stopOpacity="0.1" />
            </linearGradient>

            <linearGradient id="limb-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>

          {/* GLOWING GRID/RADAR BACKGROUND */}
          <g stroke="rgba(90, 93, 96, 0.08)" strokeWidth="0.5" fill="none">
            <circle cx="100" cy="230" r="210" />
            <circle cx="100" cy="230" r="150" />
            <circle cx="100" cy="230" r="90" />
            <line x1="100" y1="15" x2="100" y2="485" strokeDasharray="3 3.5" />
            <line x1="15" y1="230" x2="185" y2="230" strokeDasharray="3 3.5" stroke="rgba(90, 93, 96, 0.12)" />
            
            {/* Grid Coordinates markings to enhance engineer blueprint tone */}
            <text x="100" y="10" fill="rgba(90, 93, 96, 0.25)" fontSize="7px" textAnchor="middle" fontWeight="bold">0° LAT</text>
            <text x="10" y="233" fill="rgba(90, 93, 96, 0.25)" fontSize="7px">90° W</text>
            <text x="172" y="233" fill="rgba(90, 93, 96, 0.25)" fontSize="7px">90° E</text>
          </g>

          {/* SYMMETRICAL ANATOMICAL SILHOUETTE */}
          <g filter="url(#shadow)" className="transition-opacity duration-300">
            {/* 1. Base soft body shadow backplate */}
            <g transform="translate(100, 41) scale(1.5) translate(-100, -41)">
              <path
                d="M 100,16 C 114,16 122,23 121,38 C 120,49 113,56 107,59 L 104,65 C 103,66 97,66 96,65 L 93,59 C 87,56 80,49 79,38 C 78,23 86,16 100,16 Z"
                fill="rgba(241, 245, 249, 0.95)"
                stroke="none"
              />
            </g>
            <path
              d="M 94,59 C 93,65 91,72 87,76 Q 100,75 113,76 C 109,72 107,65 106,59 Z
                 M 73,83 C 65,85 58,95 58,107 C 58,118 64,124 71,126
                 M 127,83 C 135,85 142,95 142,107 C 142,118 136,124 129,126
                 M 72,83 C 65,95 62,112 65,135 C 68,155 72,175 72,195 C 72,215 68,232 68,245 C 68,255 77,262 100,262 C 123,262 132,255 132,245 C 132,232 128,215 128,195 C 128,175 132,155 135,135 C 138,112 135,95 128,83 Z"
              fill="rgba(241, 245, 249, 0.95)"
              stroke="none"
            />

            {/* 2. Head with stylized hair and ears */}
            <g transform="translate(100, 41) scale(1.5) translate(-100, -41)">
              {/* Outer Head & Jaw shape - rich volumetric gradient applied */}
              <path
                d="M 91,26 C 90,28 90,32 91,37 C 90,37 89.5,39 89.5,42 C 89.5,45 91,48 93,51 C 94,54 97,58 100,58 C 103,58 106,54 107,51 C 109,48 110.5,45 110.5,42 C 110.5,39 110,37 109,37 C 110,32 110,28 109,26 C 109,26 100,24 91,26 Z"
                fill="url(#body-grad)"
                stroke="#1e293b"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Muscle model crew cut Hair Details */}
              <path
                d="M 91,26 Q 95,21 100,22 Q 105,21 109,26 C 109,26 105,26 100,25 C 95,26 91,26 91,26 Z"
                fill="#1e293b"
                stroke="#1e293b"
                strokeWidth="1"
              />
              {/* Symmetrical Ears */}
              <path d="M 89.5,37 C 88,37 87.5,41 89,44" fill="url(#body-grad)" stroke="#1e293b" strokeWidth="1.25" />
              <path d="M 110.5,37 C 112,37 112.5,41 111,44" fill="url(#body-grad)" stroke="#1e293b" strokeWidth="1.25" />
            </g>

            {/* 3. Neck & Trapezius Muscle Curves */}
            <g>
              <path
                d="M 92,58 L 92,80 L 108,80 L 108,58 Z"
                fill="url(#body-grad)"
                stroke="#1e293b"
                strokeWidth="1.5"
              />
              {/* Symmetrical Trapezius slope lines going down to shoulder limit */}
              <path d="M 92,60 Q 83,64 74,75" fill="none" stroke="#1e293b" strokeWidth="1.5" />
              <path d="M 108,60 Q 117,64 126,75" fill="none" stroke="#1e293b" strokeWidth="1.5" />
              {/* Inner neck muscles lines */}
              <path d="M 96,65 L 100,75 L 104,65" fill="none" stroke="#1e293b" strokeWidth="1.25" opacity="0.6" />
            </g>

            {/* 4. Torso, Clavicles, Chest plates & Obliques */}
            <g>
              {/* Outer Ribcage/Abdomen silhouette backing */}
              <path
                d="M 74,75 C 74,75 70,110 70,126 C 70,142 74,168 74,195 C 74,215 68,232 68,245 C 68,255 77,262 100,262 C 123,262 132,255 132,245 C 132,232 126,215 126,195 C 126,168 130,142 130,126 C 130,110 126,75 126,75 Z"
                fill="url(#body-grad)"
                stroke="#1e293b"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
              
              {/* Symmetrical Clavicle Collar Bones */}
              <path d="M 100,81 L 87,76 Q 81,75 74,75" fill="none" stroke="#1e293b" strokeWidth="1.5" />
              <path d="M 100,81 L 113,76 Q 119,75 126,75" fill="none" stroke="#1e293b" strokeWidth="1.5" />

              {/* Bold Symmetrical Pectoral Chest muscles meeting in center */}
              <path
                d="M 74,75 C 74,95 80,118 100,118 L 100,81 Z"
                fill="none"
                stroke="#1e293b"
                strokeWidth="1.5"
              />
              <path
                d="M 126,75 C 126,95 120,118 100,118 L 100,81 Z"
                fill="none"
                stroke="#1e293b"
                strokeWidth="1.5"
              />

              {/* Center line down the sternum/abs line (Linea alba) */}
              <line x1="100" y1="118" x2="100" y2="242" stroke="#1e293b" strokeWidth="1.5" />

              {/* Abdominal muscle pairs (Six-pack) */}
              {/* Top block */}
              <path d="M 82,118 Q 91,121 100,121" fill="none" stroke="#1e293b" strokeWidth="1.25" />
              <path d="M 118,118 Q 109,121 100,121" fill="none" stroke="#1e293b" strokeWidth="1.25" />
              {/* Top/Mid separation */}
              <path d="M 81,146 Q 90.5,148 100,148 Q 109.5,148 119,146" fill="none" stroke="#1e293b" strokeWidth="1.5" />
              {/* Mid/Lower separation */}
              <path d="M 81,174 Q 90.5,176 100,176 Q 109.5,176 119,174" fill="none" stroke="#1e293b" strokeWidth="1.5" />
              {/* Bottom separation */}
              <path d="M 81,202 Q 90.5,204 100,204 Q 109.5,204 119,202" fill="none" stroke="#1e293b" strokeWidth="1.5" />
              {/* Abs side boundary lines */}
              <path d="M 81,118 L 81,202" fill="none" stroke="#1e293b" strokeWidth="1.5" />
              <path d="M 119,118 L 119,202" fill="none" stroke="#1e293b" strokeWidth="1.5" />

              {/* Obliques external serratus lines */}
              <path d="M 70,128 Q 76,134 81,138" fill="none" stroke="#1e293b" strokeWidth="1.25" />
              <path d="M 70,146 Q 76,152 81,156" fill="none" stroke="#1e293b" strokeWidth="1.25" />
              <path d="M 71,164 Q 76,170 81,174" fill="none" stroke="#1e293b" strokeWidth="1.25" />
              <path d="M 71,182 Q 76,190 81,194" fill="none" stroke="#1e293b" strokeWidth="1.25" />
              
              <path d="M 130,128 Q 124,134 119,138" fill="none" stroke="#1e293b" strokeWidth="1.25" />
              <path d="M 130,146 Q 124,152 119,156" fill="none" stroke="#1e293b" strokeWidth="1.25" />
              <path d="M 129,164 Q 124,170 119,174" fill="none" stroke="#1e293b" strokeWidth="1.25" />
              <path d="M 129,182 Q 124,190 119,194" fill="none" stroke="#1e293b" strokeWidth="1.25" />

              {/* Lower t-line/belly button */}
              <circle cx="100" cy="190" r="1.75" fill="#1e293b" />
            </g>

            {/* 5. Left Shoulder, Arm, Forearm & Detailed Open Hand */}
            <g>
              {/* Shoulder Cap (Deltoid) */}
              <path
                d="M 74,75 C 67,77 60,86 58,98 C 57,110 61,118 70,121 C 71,105 74,86 74,75 Z"
                fill="url(#limb-grad)"
                stroke="#1e293b"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Biceps / Triceps muscle segments */}
              <path
                d="M 58,98 C 53,103 52,118 55,134 C 55,134 62,141 68,131 C 67,118 70,121 70,121 Z"
                fill="url(#limb-grad)"
                stroke="#1e293b"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Bicep muscle split line of definition */}
              <path d="M 58,111 Q 63,115 67,119" fill="none" stroke="#1e293b" strokeWidth="1.25" opacity="0.6" />
              {/* Forearm bulge tapering to wrist */}
              <path
                d="M 55,134 C 51,148 42,185 40,205 C 44,210 47,204 49,195 C 52,180 62,150 68,131 Z"
                fill="url(#limb-grad)"
                stroke="#1e293b"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Forearm structural line */}
              <path d="M 51,152 C 47,170 43,185 42,198" fill="none" stroke="#1e293b" strokeWidth="1" opacity="0.5" />
              
              {/* Left hand & open palm with detailed separate fingers (outstretched, palms open/facing view) */}
              <path
                d="M 40,205 L 36,218 L 31,230 L 32,233 L 42,221 L 43,212 L 44,203"
                fill="url(#limb-grad)"
                stroke="#1e293b"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Fingers detailing exactly as shown in picture */}
              <path d="M 31,230 C 27,233 22,243 25,248 C 28,248 31,238 32,233" fill="url(#limb-grad)" stroke="#1e293b" strokeWidth="1.25" strokeLinecap="round" />
              <path d="M 32,234 C 28,239 25,251 28,255 C 31,255 33,243 33,235" fill="url(#limb-grad)" stroke="#1e293b" strokeWidth="1.25" strokeLinecap="round" />
              <path d="M 33,237 C 30,242 27,255 31,258 C 34,258 35,245 35,238" fill="url(#limb-grad)" stroke="#1e293b" strokeWidth="1.25" strokeLinecap="round" />
              <path d="M 35,239 C 33,243 31,253 34,255 C 37,255 38,244 37,240" fill="url(#limb-grad)" stroke="#1e293b" strokeWidth="1.25" strokeLinecap="round" />
            </g>

            {/* 6. Right Shoulder, Arm, Forearm & Detailed Open Hand */}
            <g>
              {/* Shoulder Cap (Deltoid) */}
              <path
                d="M 126,75 C 133,77 140,86 142,98 C 143,110 139,118 130,121 C 129,105 126,86 126,75 Z"
                fill="url(#limb-grad)"
                stroke="#1e293b"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Biceps / Triceps muscle segments */}
              <path
                d="M 142,98 C 147,103 148,118 145,134 C 145,134 138,141 132,131 C 133,118 130,121 130,121 Z"
                fill="url(#limb-grad)"
                stroke="#1e293b"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Bicep muscle split line of definition */}
              <path d="M 142,111 Q 137,115 133,119" fill="none" stroke="#1e293b" strokeWidth="1.25" opacity="0.6" />
              {/* Forearm bulge tapering to wrist */}
              <path
                d="M 145,134 C 149,148 158,185 160,205 C 156,210 153,204 151,195 C 148,180 138,150 132,131 Z"
                fill="url(#limb-grad)"
                stroke="#1e293b"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Forearm structural line */}
              <path d="M 149,152 C 153,170 157,185 158,198" fill="none" stroke="#1e293b" strokeWidth="1" opacity="0.5" />
              
              {/* Right hand & open palm with detailed separate fingers */}
              <path
                d="M 160,205 L 164,218 L 169,230 L 168,233 L 158,221 L 157,212 L 156,203"
                fill="url(#limb-grad)"
                stroke="#1e293b"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Symmetrical Fingers detailing */}
              <path d="M 169,230 C 173,233 178,243 175,248 C 172,248 169,238 168,233" fill="url(#limb-grad)" stroke="#1e293b" strokeWidth="1.25" strokeLinecap="round" />
              <path d="M 168,234 C 172,239 175,251 172,255 C 169,255 167,243 167,235" fill="url(#limb-grad)" stroke="#1e293b" strokeWidth="1.25" strokeLinecap="round" />
              <path d="M 167,237 C 170,242 173,255 169,258 C 166,258 165,245 165,238" fill="url(#limb-grad)" stroke="#1e293b" strokeWidth="1.25" strokeLinecap="round" />
              <path d="M 165,239 C 167,243 169,253 166,255 C 163,255 162,244 163,240" fill="url(#limb-grad)" stroke="#1e293b" strokeWidth="1.25" strokeLinecap="round" />
            </g>

            {/* 7. Groin / Apollo's Belt (Muscular Lower Pelvis V-Line) */}
            <g>
              {/* Symmetrical groin oblique crest lines (tapering to crotch base) */}
              <path d="M 68,245 C 68,245 74,233 82,233" fill="none" stroke="#1e293b" strokeWidth="1.5" />
              <path d="M 132,245 C 132,245 126,233 118,233" fill="none" stroke="#1e293b" strokeWidth="1.5" />
              {/* Internal Iliac Crest guides */}
              <path d="M 68,245 Q 85,255 100,258 Q 115,255 132,245" fill="none" stroke="#1e293b" strokeWidth="1.5" />
              <path d="M 82,233 C 88,248 94,258 100,258 C 106,258 112,248 118,233" fill="none" stroke="#1e293b" strokeWidth="1.5" />
              {/* Center crotch divide */}
              <line x1="100" y1="242" x2="100" y2="265" stroke="#1e293b" strokeWidth="1.5" />
            </g>

            {/* 8. Highly Muscular Left Leg, Thigh (Quads), Calf and Foot */}
            <g>
              {/* Thigh (Quadriceps) with inner/outer separation contours */}
              <path
                d="M 68,245 C 61,275 63,315 67,335 C 72,342 77,343 82,335 C 84,315 88,275 88,245 L 82,255 Z"
                fill="url(#limb-grad)"
                stroke="#1e293b"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Outer thigh line */}
              <path d="M 68,245 C 65,275 66,305 68,328" fill="none" stroke="#1e293b" strokeWidth="1.25" opacity="0.6" />
              {/* Internal muscle contours (rectus femoris & vastus channels) */}
              <path d="M 82,255 C 78,285 73,310 73,322" fill="none" stroke="#1e293b" strokeWidth="1.5" />
              {/* Vastus Medialis (teardrop) muscle above knee */}
              <path d="M 79,308 Q 83,322 81,332 Q 77,333 76,325 Z" fill="none" stroke="#1e293b" strokeWidth="1.25" />

              {/* Symmetrical Calf & Lower Leg */}
              <path
                d="M 67,347 C 62,370 61,410 67,445 C 71,448 75,446 77,445 C 79,410 79,370 79,347 Z"
                fill="url(#limb-grad)"
                stroke="#1e293b"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Shin Bone split (tibialis anterior outline) */}
              <path d="M 72,347 C 71,375 70,415 71,445" fill="none" stroke="#1e293b" strokeWidth="1.5" />
              {/* Calf muscle line */}
              <path d="M 67,347 C 64,365 63,385 66,402" fill="none" stroke="#1e293b" strokeWidth="1.25" opacity="0.5" />

              {/* Realistic foot structure with toes pointing outwards */}
              <path
                d="M 67,445 C 67,445 64,455 60,465 C 58,470 61,475 70,475 C 75,475 75,460 75,445 Z"
                fill="url(#limb-grad)"
                stroke="#1e293b"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M 60,465 C 60,470 61,475 63,475 M 63,467 C 63,472 65,475 66,475 M 66,469 C 66,473 67.5,475 68.5,475" fill="none" stroke="#1e293b" strokeWidth="1" />
            </g>

            {/* 9. Highly Muscular Right Leg, Thigh (Quads), Calf and Foot */}
            <g>
              {/* Thigh (Quadriceps) with inner/outer separation contours */}
              <path
                d="M 132,245 C 139,275 137,315 133,335 C 128,342 123,343 118,335 C 116,315 112,275 112,245 L 118,255 Z"
                fill="url(#limb-grad)"
                stroke="#1e293b"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Outer thigh line */}
              <path d="M 132,245 C 135,275 134,305 132,328" fill="none" stroke="#1e293b" strokeWidth="1.25" opacity="0.6" />
              {/* Internal muscle contours (rectus femoris & vastus channels) */}
              <path d="M 118,255 C 122,285 127,310 127,322" fill="none" stroke="#1e293b" strokeWidth="1.5" />
              {/* Vastus Medialis (teardrop) muscle above knee */}
              <path d="M 121,308 Q 117,322 119,332 Q 123,333 124,325 Z" fill="none" stroke="#1e293b" strokeWidth="1.25" />

              {/* Symmetrical Calf & Lower Leg */}
              <path
                d="M 133,347 C 138,370 139,410 133,445 C 129,448 125,446 123,445 C 121,410 121,370 121,347 Z"
                fill="url(#limb-grad)"
                stroke="#1e293b"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Shin Bone split (tibialis anterior outline) */}
              <path d="M 128,347 C 129,375 130,415 129,445" fill="none" stroke="#1e293b" strokeWidth="1.5" />
              {/* Calf muscle line */}
              <path d="M 133,347 C 136,365 137,385 134,402" fill="none" stroke="#1e293b" strokeWidth="1.25" opacity="0.5" />

              {/* Realistic foot structure with toes pointing outwards */}
              <path
                d="M 133,445 C 133,445 136,455 140,465 C 142,470 139,475 130,475 C 125,475 125,460 125,445 Z"
                fill="url(#limb-grad)"
                stroke="#1e293b"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M 140,465 C 140,470 139,475 137,475 M 137,467 C 137,472 135,475 134,475 M 134,469 C 134,473 132.5,475 131.5,475" fill="none" stroke="#1e293b" strokeWidth="1" />
            </g>

            {/* 10. Anatomical Symmetrical Kneecaps (Patellas Outline) */}
            <g>
              <ellipse cx="73" cy="341" rx="4.5" ry="5" fill="url(#body-grad)" stroke="#1e293b" strokeWidth="1.5" />
              <ellipse cx="127" cy="341" rx="4.5" ry="5" fill="url(#body-grad)" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="73" y1="336" x2="73" y2="346" stroke="#1e293b" strokeWidth="0.75" />
              <line x1="127" y1="336" x2="127" y2="346" stroke="#1e293b" strokeWidth="0.75" />
            </g>
          </g>

          {/* CONNECTOR RADAR GUIDES (Fine lines connecting points to side channels) */}
          {!hideLabels && keys.map((k) => {
            const coord = PART_COORDINATES[k];
            const isSelected = selectedParts[k];
            const count = counts[k] || 0;
            const isHovered = hoveredPart === k;

            const shouldHighlight = isSelected || isHovered || (mode === 'dashboard-view' && count > 0);
            if (!shouldHighlight) return null;

            const startX = coord.x;
            const startY = coord.y;
            const endX = coord.labelSide === 'left' ? 12 : 188;
            const endY = startY;

            // Target Highlight Color matching selection
            const actColor = mode === 'interactive-select' ? '#9D2235' : getHeatmapColor(count);

            return (
              <g key={`line-${k}`} className="transition-all duration-300 pointer-events-none">
                {/* Horizontal dotted link line */}
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={actColor}
                  strokeWidth={isHovered ? 1.5 : 0.75}
                  strokeDasharray="2.5 2"
                  opacity={isHovered ? 1 : 0.65}
                />
                
                {/* Visual anchor point */}
                <circle
                  cx={startX}
                  cy={startY}
                  r={isHovered ? 4.5 : 2.5}
                  fill="none"
                  stroke={actColor}
                  strokeWidth="1"
                />
                <circle
                  cx={endX}
                  cy={endY}
                  r="2"
                  fill={actColor}
                />
              </g>
            );
          })}

          {/* ACTIVE CLICKABLE COGNITIVE HOTSPOTS */}
          {keys.map((k) => {
            const coord = PART_COORDINATES[k];
            const isSelected = selectedParts[k];
            const count = counts[k] || 0;
            const isHovered = hoveredPart === k;

            // Compute dynamic attributes for the hotspot triggers
            let activeColor = 'rgba(90, 93, 96, 0.4)';
            let strokeColor = 'rgba(255, 255, 255, 0.9)';
            let scaleRadius = 7.5;

            if (mode === 'interactive-select') {
              if (isSelected) {
                activeColor = '#9D2235'; // DKSH Red
                strokeColor = '#FFFFFF';
                scaleRadius = 9.5;
              } else if (isHovered) {
                activeColor = '#E11D48'; // Lighter Red focus
                scaleRadius = 9.5;
              }
            } else {
              // Dashboard heatmap count mode
              if (isSelected) {
                activeColor = '#9D2235'; // DKSH Red (High emphasis for active selection)
                strokeColor = '#FFFFFF';
                scaleRadius = 13.5;
              } else if (count > 0) {
                activeColor = getHeatmapColor(count);
                strokeColor = '#FFFFFF';
                scaleRadius = Math.min(15, 8 + count * 1.5);
              } else if (isHovered) {
                activeColor = '#E2E8F0';
                scaleRadius = 9.5;
              }
            }

            return (
              <g
                key={`hotspot-${k}`}
                className="cursor-pointer transition-all duration-200"
                onClick={() => {
                  handlePartClick(k);
                  setMobileTappedPart(k);
                }}
                onMouseEnter={() => setHoveredPart(k)}
                onMouseLeave={() => setHoveredPart(null)}
              >
                {/* Invisible larger touch target circle (at least 44px by 44px) to prevent frustrating mis-taps on mobile */}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={22}
                  fill="transparent"
                  className="cursor-pointer"
                />

                {/* Multi-layered Pulsing Radar Ring on selection or high-count items */}
                {(isSelected || (mode === 'dashboard-view' && count > 0)) && (
                  <>
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={scaleRadius + 6}
                      fill="none"
                      stroke={mode === 'interactive-select' ? '#9D2235' : activeColor}
                      strokeWidth="1"
                      opacity="0.45"
                      className="animate-ping"
                      style={{ animationDuration: '2.5s' }}
                    />
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={scaleRadius + 12}
                      fill="none"
                      stroke={mode === 'interactive-select' ? 'rgba(157, 34, 53, 0.15)' : activeColor}
                      strokeWidth="0.5"
                      opacity="0.25"
                      className="animate-pulse"
                    />
                  </>
                )}

                {/* Primary Solid Hotspot Node */}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={scaleRadius}
                  fill={activeColor}
                  stroke={strokeColor}
                  strokeWidth="1.75"
                  filter={count >= 4 || isSelected ? 'url(#glow-danger)' : undefined}
                />

                {/* Micro numerical indicator inside node for Dashboard mode */}
                {mode === 'dashboard-view' && count > 0 && (
                  <text
                    x={coord.x}
                    y={coord.y + 3}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="8.5px"
                    fontWeight="bold"
                    className="select-none font-mono"
                  >
                    {count}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Mobile touch-first popover/tooltip near the dot */}
        {mobileTappedPart && (() => {
          const coord = PART_COORDINATES[mobileTappedPart];
          const isTop = coord.y < 80; // Head, Eye, Face, Ear, Tooth
          const isFarLeft = coord.x < 65;
          const isFarRight = coord.x > 135;

          const topPercent = (coord.y / 500) * 100;
          const topStyle = isTop 
            ? `calc(${topPercent}% + 22px)` 
            : `calc(${topPercent}% - 44px)`;

          const leftPercent = (coord.x / 200) * 100;
          let leftStyle = `${leftPercent}%`;
          let transformStyle = 'translateX(-50%)';

          if (isFarLeft) {
            transformStyle = 'translateX(5px)';
          } else if (isFarRight) {
            transformStyle = 'translateX(-95%)';
          }

          return (
            <div
              className="absolute bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-700 z-50 flex items-center gap-1.5 animate-fade-in pointer-events-auto md:hidden"
              style={{
                top: topStyle,
                left: leftStyle,
                transform: transformStyle,
              }}
            >
              <span>{BODY_PARTS[mobileTappedPart]}</span>
              <span className={selectedParts[mobileTappedPart] ? 'text-rose-400 font-extrabold' : 'text-gray-400'}>
                ({selectedParts[mobileTappedPart] ? 'Selected' : 'Removed'})
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileTappedPart(null);
                }}
                className="ml-1 text-gray-400 hover:text-white p-0.5 rounded cursor-pointer"
              >
                ✕
              </button>
              {/* Tooltip caret arrow: point up if top (rendered below), point down if normal (rendered above) */}
              {isTop ? (
                <div className={`absolute bottom-full border-4 border-transparent border-b-slate-900 ${
                  isFarLeft ? 'left-[15%]' : isFarRight ? 'left-[85%]' : 'left-1/2 -translate-x-1/2'
                }`} />
              ) : (
                <div className={`absolute top-full border-4 border-transparent border-t-slate-900 ${
                  isFarLeft ? 'left-[15%]' : isFarRight ? 'left-[85%]' : 'left-1/2 -translate-x-1/2'
                }`} />
              )}
            </div>
          );
        })()}

        {/* Floating context banner inside component viewport when hovering body segments */}
        {hoveredPart && !mobileTappedPart && (
          <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 text-white p-2.5 rounded-lg border border-slate-700/80 shadow-lg z-25 backdrop-blur-xs transition-opacity duration-150">
            <div className="font-bold flex justify-between items-center text-xs">
              <span className="tracking-wide uppercase font-semibold text-gray-100">{BODY_PARTS[hoveredPart]}</span>
              <span className="text-red-400 font-mono font-medium">
                {mode === 'interactive-select'
                  ? selectedParts[hoveredPart] ? 'Part Flagged' : 'Available'
                  : `${counts[hoveredPart] || 0} Incident(s)`}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {mode === 'interactive-select'
                ? 'Click hotspot node or side menu to toggle classification.'
                : 'Aggregated frequency for active date and context scope.'}
            </p>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Labels (pointing to right side coordinates) */}
      {!hideLabels && (
        <div id="right-side-indicators-container" className="hidden md:flex w-full md:w-[290px] flex-col gap-2 select-none text-left">
          <h4 className="text-[10px] font-bold text-[#5A5D60] uppercase tracking-wider border-b pb-1 mb-1">Right Side Indicators</h4>
          {keys
            .filter(k => PART_COORDINATES[k].labelSide === 'right')
            .map(k => {
              const isSelected = selectedParts[k];
              const count = counts[k] || 0;
              const isHovered = hoveredPart === k;

              return (
                <div
                  key={k}
                  onMouseEnter={() => setHoveredPart(k)}
                  onMouseLeave={() => setHoveredPart(null)}
                  className={`group flex items-center justify-start gap-2 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 cursor-pointer ${
                    mode === 'interactive-select'
                      ? isSelected
                        ? 'bg-red-50 text-dksh-red font-bold border-l-3 border-dksh-red'
                        : 'hover:bg-gray-50 text-gray-600'
                      : count > 0
                      ? 'bg-red-50 text-dksh-red font-bold border-l-3 border-dksh-red shadow-xs'
                      : 'text-gray-400 hover:text-gray-600'
                  } ${isHovered ? 'scale-102 bg-gray-50/80 shadow-xs' : ''}`}
                  onClick={() => handlePartClick(k)}
                >
                  <span className="font-semibold text-gray-800 whitespace-nowrap">{BODY_PARTS[k]}</span>
                  <span className="text-[10px] font-mono bg-white border border-gray-100 px-1.5 py-0.5 rounded text-gray-500 shadow-2xs">
                    {mode === 'interactive-select' ? (isSelected ? '✓' : '—') : `${count} Case(s)`}
                  </span>
                </div>
              );
            })}
        </div>
      )}

      {/* 5. SELECTION SUMMARY FEEDBACK: Visible only on mobile screens at the bottom of the central graphic wrapper */}
      {mode === 'interactive-select' && (
        <div className="w-full mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl md:hidden text-left shadow-xs" id="mobile-selection-summary">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Selected Body Parts</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', minHeight: '48px' }}>
            {Object.keys(selectedParts)
              .filter(key => selectedParts[key as BodyPartKey])
              .map(key => {
                const bodyPartKey = key as BodyPartKey;
                const label = BODY_PARTS[bodyPartKey];
                return (
                  <span
                    key={bodyPartKey}
                    className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1.5 rounded-full border border-rose-200 shadow-3xs"
                  >
                    <span>{label}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onChange) {
                          onChange(bodyPartKey, false);
                        }
                      }}
                      className="text-rose-500 hover:text-rose-800 font-extrabold text-[13px] ml-1 focus:outline-none cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                );
              })}
            {Object.keys(selectedParts).filter(key => selectedParts[key as BodyPartKey]).length === 0 && (
              <p className="text-xs text-slate-400 italic">None selected (tap hotspots above)</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

