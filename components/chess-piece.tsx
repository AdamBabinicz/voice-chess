// components/chess-piece.tsx
"use client";

import React from "react";

interface ChessPieceProps {
  type: string; // 'p' | 'n' | 'b' | 'r' | 'q' | 'k'
  color: "w" | "b";
}

export function ChessPiece({ type, color }: ChessPieceProps) {
  const isWhite = color === "w";

  // Klasyczny międzynarodowy zestaw wektorowy Staunton (standard Lichess / Wikipedia)
  const renderStauntonPiece = () => {
    if (isWhite) {
      switch (type) {
        case "p":
          return (
            <g
              style={{
                opacity: 1,
                fill: "#ffffff",
                fillOpacity: 1,
                fillRule: "nonzero",
                stroke: "#18181b",
                strokeWidth: 1.5,
                strokeLinecap: "round",
                strokeLinejoin: "miter",
                strokeMiterlimit: 4,
              }}
            >
              <path d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z" />
            </g>
          );
        case "r":
          return (
            <g
              style={{
                opacity: 1,
                fill: "#ffffff",
                fillOpacity: 1,
                fillRule: "evenodd",
                stroke: "#18181b",
                strokeWidth: 1.5,
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }}
            >
              <path
                d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z"
                style={{ strokeLinecap: "butt" }}
              />
              <path
                d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z"
                style={{ strokeLinecap: "butt" }}
              />
              <path
                d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14"
                style={{ strokeLinecap: "butt" }}
              />
              <path d="M 34,14 L 31,17 L 14,17 L 11,14" />
              <path
                d="M 31,17 L 31,29.5 L 14,29.5 L 14,17"
                style={{ strokeLinecap: "butt", strokeLinejoin: "miter" }}
              />
              <path
                d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5"
                style={{ strokeLinecap: "butt" }}
              />
              <path
                d="M 11,14 L 34,14"
                style={{
                  fill: "none",
                  stroke: "#18181b",
                  strokeLinejoin: "miter",
                }}
              />
            </g>
          );
        case "n":
          return (
            <g
              style={{
                opacity: 1,
                fill: "none",
                fillOpacity: 1,
                fillRule: "evenodd",
                stroke: "#18181b",
                strokeWidth: 1.5,
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }}
            >
              <path
                d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18"
                style={{ fill: "#ffffff", stroke: "#18181b" }}
              />
              <path
                d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.07,8.05 18,5.5 C 18.09,5.25 18.26,5.19 18.5,5.5 C 18.61,5.64 18.83,5.61 19,5.5 C 19.18,5.39 19.36,5.45 19.5,5.5 C 19.64,5.55 19.82,5.5 20,5.5 C 20.46,5.5 20.94,5.4 21,6 C 21.5,6.5 21.5,7 21.5,7 C 24,7.5 25,10 25.5,12 C 25.75,13 26.5,15.5 27,16 C 28.5,14.5 29.5,12 30,10.5 C 30.5,9 31.5,7.5 33,6.5 C 33.5,8 33.5,10.5 32,12 C 30.5,13.5 29.5,15 28.5,17 C 27.5,19 27,21 27,21"
                style={{ fill: "#ffffff", stroke: "#18181b" }}
              />
              <path
                d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z"
                style={{ fill: "#18181b", stroke: "#18181b" }}
              />
              <path
                d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z"
                transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)"
                style={{ fill: "#18181b", stroke: "#18181b" }}
              />
            </g>
          );
        case "b":
          return (
            <g
              style={{
                opacity: 1,
                fill: "none",
                fillOpacity: 1,
                fillRule: "evenodd",
                stroke: "#18181b",
                strokeWidth: 1.5,
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }}
            >
              <g
                style={{
                  fill: "#ffffff",
                  stroke: "#18181b",
                  strokeLinecap: "butt",
                }}
              >
                <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.54 9,36 9,36 z" />
                <path d="M 12,36 C 11,32 18.5,27.7 16,16 C 17,13 28,13 29,16 C 26.5,27.7 34,32 33,36 L 12,36 z" />
                <path
                  d="M 11,14 A 3.5 3.5 0 1 1 4,14 A 3.5 3.5 0 1 1 11,14 z"
                  transform="translate(15,-6)"
                />
              </g>
              <path
                d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18"
                style={{
                  fill: "none",
                  stroke: "#18181b",
                  strokeLinejoin: "miter",
                }}
              />
            </g>
          );
        case "q":
          return (
            <g
              style={{
                opacity: 1,
                fill: "#ffffff",
                fillOpacity: 1,
                fillRule: "evenodd",
                stroke: "#18181b",
                strokeWidth: 1.5,
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }}
            >
              <path
                d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z"
                transform="translate(-1,-1)"
              />
              <path
                d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z"
                transform="translate(7,-5)"
              />
              <path
                d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z"
                transform="translate(16.5,-6.5)"
              />
              <path
                d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z"
                transform="translate(26,-5)"
              />
              <path
                d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z"
                transform="translate(34,-1)"
              />
              <path
                d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 31,11 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14,11 L 14,25 L 7,14 L 9,26 z"
                style={{ strokeLinecap: "butt" }}
              />
              <path
                d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10,36 C 9.5,37.5 11,38.5 11,38.5 L 34,38.5 C 34,38.5 35.5,37.5 35,36 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z"
                style={{ strokeLinecap: "butt" }}
              />
              <path
                d="M 11.5,30 C 15,29 30,29 33.5,30"
                style={{ fill: "none", stroke: "#18181b" }}
              />
              <path
                d="M 12,33.5 C 18,32.5 27,32.5 33,33.5"
                style={{ fill: "none", stroke: "#18181b" }}
              />
            </g>
          );
        case "k":
          return (
            <g
              style={{
                opacity: 1,
                fill: "none",
                fillOpacity: 1,
                fillRule: "evenodd",
                stroke: "#18181b",
                strokeWidth: 1.5,
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }}
            >
              <path
                d="M 22.5,11.63 L 22.5,6"
                style={{
                  fill: "none",
                  stroke: "#18181b",
                  strokeLinejoin: "miter",
                }}
              />
              <path
                d="M 20,8 L 25,8"
                style={{
                  fill: "none",
                  stroke: "#18181b",
                  strokeLinejoin: "miter",
                }}
              />
              <path
                d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 22.5,11.5 C 24,11.5 21,11.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25"
                style={{
                  fill: "#ffffff",
                  stroke: "#18181b",
                  strokeLinecap: "butt",
                  strokeLinejoin: "miter",
                }}
              />
              <path
                d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 36.5,30 36.5,28.5 36.5,24 C 36.5,19.5 34.5,13 31,13 C 26.5,13 22.5,23.5 22.5,23.5 C 22.5,23.5 18.5,13 14,13 C 10.5,13 8.5,19.5 8.5,24 C 8.5,28.5 8.5,30 11.5,37 z"
                style={{ fill: "#ffffff", stroke: "#18181b" }}
              />
              <path
                d="M 11.5,30 C 17,27 28,27 33.5,30"
                style={{ fill: "none", stroke: "#18181b" }}
              />
              <path
                d="M 11.5,33.5 C 17,30.5 28,30.5 33.5,33.5"
                style={{ fill: "none", stroke: "#18181b" }}
              />
              <path
                d="M 11.5,37 C 17,34 28,34 33.5,37"
                style={{ fill: "none", stroke: "#18181b" }}
              />
            </g>
          );
      }
    } else {
      // Czarne figury (klasyczny turniejowy Staunton)
      switch (type) {
        case "p":
          return (
            <g
              style={{
                opacity: 1,
                fill: "#27272a",
                fillOpacity: 1,
                fillRule: "nonzero",
                stroke: "#09090b",
                strokeWidth: 1.5,
                strokeLinecap: "round",
                strokeLinejoin: "miter",
                strokeMiterlimit: 4,
              }}
            >
              <path d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z" />
            </g>
          );
        case "r":
          return (
            <g
              style={{
                opacity: 1,
                fill: "#27272a",
                fillOpacity: 1,
                fillRule: "evenodd",
                stroke: "#09090b",
                strokeWidth: 1.5,
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }}
            >
              <path
                d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z"
                style={{ strokeLinecap: "butt" }}
              />
              <path
                d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z"
                style={{ strokeLinecap: "butt" }}
              />
              <path
                d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14"
                style={{ strokeLinecap: "butt" }}
              />
              <path d="M 34,14 L 31,17 L 14,17 L 11,14" />
              <path
                d="M 31,17 L 31,29.5 L 14,29.5 L 14,17"
                style={{ strokeLinecap: "butt", strokeLinejoin: "miter" }}
              />
              <path
                d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5"
                style={{ strokeLinecap: "butt" }}
              />
              <path
                d="M 11,14 L 34,14"
                style={{ fill: "none", stroke: "#e4e4e7", strokeWidth: 1 }}
              />
            </g>
          );
        case "n":
          return (
            <g
              style={{
                opacity: 1,
                fill: "none",
                fillOpacity: 1,
                fillRule: "evenodd",
                stroke: "#09090b",
                strokeWidth: 1.5,
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }}
            >
              <path
                d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18"
                style={{ fill: "#27272a", stroke: "#09090b" }}
              />
              <path
                d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.07,8.05 18,5.5 C 18.09,5.25 18.26,5.19 18.5,5.5 C 18.61,5.64 18.83,5.61 19,5.5 C 19.18,5.39 19.36,5.45 19.5,5.5 C 19.64,5.55 19.82,5.5 20,5.5 C 20.46,5.5 20.94,5.4 21,6 C 21.5,6.5 21.5,7 21.5,7 C 24,7.5 25,10 25.5,12 C 25.75,13 26.5,15.5 27,16 C 28.5,14.5 29.5,12 30,10.5 C 30.5,9 31.5,7.5 33,6.5 C 33.5,8 33.5,10.5 32,12 C 30.5,13.5 29.5,15 28.5,17 C 27.5,19 27,21 27,21"
                style={{ fill: "#27272a", stroke: "#09090b" }}
              />
              <path
                d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z"
                style={{ fill: "#e4e4e7", stroke: "#e4e4e7" }}
              />
              <path
                d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z"
                transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)"
                style={{ fill: "#e4e4e7", stroke: "#e4e4e7" }}
              />
            </g>
          );
        case "b":
          return (
            <g
              style={{
                opacity: 1,
                fill: "none",
                fillOpacity: 1,
                fillRule: "evenodd",
                stroke: "#09090b",
                strokeWidth: 1.5,
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }}
            >
              <g
                style={{
                  fill: "#27272a",
                  stroke: "#09090b",
                  strokeLinecap: "butt",
                }}
              >
                <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.54 9,36 9,36 z" />
                <path d="M 12,36 C 11,32 18.5,27.7 16,16 C 17,13 28,13 29,16 C 26.5,27.7 34,32 33,36 L 12,36 z" />
                <path
                  d="M 11,14 A 3.5 3.5 0 1 1 4,14 A 3.5 3.5 0 1 1 11,14 z"
                  transform="translate(15,-6)"
                />
              </g>
              <path
                d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18"
                style={{ fill: "none", stroke: "#e4e4e7", strokeWidth: 1 }}
              />
            </g>
          );
        case "q":
          return (
            <g
              style={{
                opacity: 1,
                fill: "#27272a",
                fillOpacity: 1,
                fillRule: "evenodd",
                stroke: "#09090b",
                strokeWidth: 1.5,
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }}
            >
              <path
                d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z"
                transform="translate(-1,-1)"
              />
              <path
                d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z"
                transform="translate(7,-5)"
              />
              <path
                d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z"
                transform="translate(16.5,-6.5)"
              />
              <path
                d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z"
                transform="translate(26,-5)"
              />
              <path
                d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z"
                transform="translate(34,-1)"
              />
              <path
                d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 31,11 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14,11 L 14,25 L 7,14 L 9,26 z"
                style={{ strokeLinecap: "butt" }}
              />
              <path
                d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10,36 C 9.5,37.5 11,38.5 11,38.5 L 34,38.5 C 34,38.5 35.5,37.5 35,36 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z"
                style={{ strokeLinecap: "butt" }}
              />
              <path
                d="M 11.5,30 C 15,29 30,29 33.5,30"
                style={{ fill: "none", stroke: "#e4e4e7", strokeWidth: 1 }}
              />
              <path
                d="M 12,33.5 C 18,32.5 27,32.5 33,33.5"
                style={{ fill: "none", stroke: "#e4e4e7", strokeWidth: 1 }}
              />
            </g>
          );
        case "k":
          return (
            <g
              style={{
                opacity: 1,
                fill: "none",
                fillOpacity: 1,
                fillRule: "evenodd",
                stroke: "#09090b",
                strokeWidth: 1.5,
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }}
            >
              <path
                d="M 22.5,11.63 L 22.5,6"
                style={{
                  fill: "none",
                  stroke: "#09090b",
                  strokeLinejoin: "miter",
                }}
              />
              <path
                d="M 20,8 L 25,8"
                style={{
                  fill: "none",
                  stroke: "#09090b",
                  strokeLinejoin: "miter",
                }}
              />
              <path
                d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 22.5,11.5 C 24,11.5 21,11.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25"
                style={{
                  fill: "#27272a",
                  stroke: "#09090b",
                  strokeLinecap: "butt",
                  strokeLinejoin: "miter",
                }}
              />
              <path
                d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 36.5,30 36.5,28.5 36.5,24 C 36.5,19.5 34.5,13 31,13 C 26.5,13 22.5,23.5 22.5,23.5 C 22.5,23.5 18.5,13 14,13 C 10.5,13 8.5,19.5 8.5,24 C 8.5,28.5 8.5,30 11.5,37 z"
                style={{ fill: "#27272a", stroke: "#09090b" }}
              />
              <path
                d="M 11.5,30 C 17,27 28,27 33.5,30"
                style={{ fill: "none", stroke: "#e4e4e7", strokeWidth: 1 }}
              />
              <path
                d="M 11.5,33.5 C 17,30.5 28,30.5 33.5,33.5"
                style={{ fill: "none", stroke: "#e4e4e7", strokeWidth: 1 }}
              />
              <path
                d="M 11.5,37 C 17,34 28,34 33.5,37"
                style={{ fill: "none", stroke: "#e4e4e7", strokeWidth: 1 }}
              />
            </g>
          );
      }
    }
  };

  return (
    <svg
      viewBox="0 0 45 45"
      className="h-[84%] w-[84%] max-h-[84%] max-w-[84%] drop-shadow-sm select-none pointer-events-none transition-transform duration-100"
      aria-hidden="true"
    >
      {renderStauntonPiece()}
    </svg>
  );
}
