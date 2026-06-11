export const SHAPE_STYLES: Record<string, React.CSSProperties> = {
  circle: {
    borderRadius: "50%",
  },
  square: {
    borderRadius: "12%",
  },
  star: {
    clipPath:
      "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
    borderRadius: "0%",
  },
  triangle: {
    clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
    borderRadius: "0%",
  },
  diamond: {
    clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
    borderRadius: "0%",
  },
  hexagon: {
    clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
    borderRadius: "0%",
  },
};