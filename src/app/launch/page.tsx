'use client';
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const SHEET_OPEN_Y = 90; // px from top when opened
const SHEET_CLOSED_VISIBLE = 300; // px of sheet visible from bottom when collapsed

const LaunchPage: React.FC = () => {
  // closedY is calculated from bottom: viewport height - visible portion
  // Use safe fallbacks for SSR and populate real values on mount.
  const [closedY, setClosedY] = useState<number>(500);

  const [sheetY, setSheetY] = useState<number>(500);
  const dragRef = useRef({
    dragging: false,
    startPointerY: 0,
    startSheetY: 0,
  });

  const router = useRouter();

  const clamp = (val: number, min: number, max: number) =>
    Math.min(Math.max(val, min), max);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.dragging = true;
    dragRef.current.startPointerY = e.clientY;
    dragRef.current.startSheetY = sheetY;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const delta = e.clientY - dragRef.current.startPointerY;
    const nextY = dragRef.current.startSheetY + delta;
    setSheetY(clamp(nextY, SHEET_OPEN_Y, closedY));
  };

  const onPointerUp = useCallback(() => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    const middle = (SHEET_OPEN_Y + closedY) / 2;
    setSheetY((prev) => (prev < middle ? SHEET_OPEN_Y : closedY));
    const shouldOpen = sheetY <= middle;
    console.log("sheetY:", sheetY, "middle:", middle, "shouldOpen:", shouldOpen);
   
    // If the sheet was dragged open, navigate to /map after the opening animation
    if (shouldOpen) {
      // wait for the CSS transition to complete so the open animation is visible
      setTimeout(() => {
        console.log("Navigating to /map");
        router.push("/map");
      }, 240);
    }
  }, [closedY, router, sheetY]);

useEffect(() => {
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);

  return () => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  };
}, [onPointerMove, onPointerUp]);


  // // Populate closedY and sheetY after mount to avoid SSR/window issues.
  // useEffect(() => {
  //   const initial = window.innerHeight - SHEET_CLOSED_VISIBLE;
  //   setClosedY(initial);
  //   setSheetY(initial);
  // }, []);

  // Recompute closedY on resize so the sheet stays anchored to the bottom
  // useEffect(() => {
  //   const handleResize = () => {
  //     const next = window.innerHeight - SHEET_CLOSED_VISIBLE;
  //     setClosedY((prevClosed) => {
  //       // if sheet currently at the previous closed position, move it to the new closed position
  //       setSheetY((prevSheet) => (prevSheet === prevClosed ? next : prevSheet));
  //       return next;
  //     });
  //   };

  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  return (
    <div style={styles.app}>
      {/* background */}
      <div style={styles.bgWrap}>
        <img
          src="launch-bg.jpeg"
          alt="Taipei street"
          style={styles.bgImg}
        />
        <div style={styles.overlay} />
        {/* <div style={styles.heroText}>
          <h1 style={styles.heroTitle}>台北城市漫步計畫</h1>
          <p style={styles.heroSub}>讓日常的移動也能成為改善城市的線索。</p>
        </div> */}
      </div>

      {/* bottom sheet */}
      <div
        style={{
          ...styles.sheet,
          transform: `translateY(${sheetY}px)`,
        }}
        onPointerDown={onPointerDown}
      >
        <div style={styles.handle} />
        <h2 style={styles.sheetTitle}>歡迎來到「台北城市漫步計畫」</h2>
        <p style={styles.sheetBody}>
          我們希望讓你的日常移動與探索，都能成為改善城市的線索。
          <br />
          <br />
          沒有固定路線，沒有時間限制。
          <br />
          <br />
          在這裡，你可以接下城市任務、走訪街區、上傳你的觀察，同時讓市府了解哪些都市空間更需要改變！
        </p>
      </div>
    </div>
  );
};

const styles: {
  app: React.CSSProperties;
  bgWrap: React.CSSProperties;
  bgImg: React.CSSProperties;
  overlay: React.CSSProperties;
  heroText: React.CSSProperties;
  heroTitle: React.CSSProperties;
  heroSub: React.CSSProperties;
  sheet: React.CSSProperties;
  handle: React.CSSProperties;
  sheetTitle: React.CSSProperties;
  sheetBody: React.CSSProperties;
} = {
  app: {
    height: "100vh",
    width: "100vw",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#111",
    fontFamily:
      "'Noto Sans TC', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  bgWrap: {
    position: "absolute",
    inset: 0,
  },
  bgImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover", // <-- now typed correctly
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.75) 100%)",
  },
  heroText: {
    position: "absolute",
    left: 24,
    bottom: 160,
    right: 24,
    color: "white",
  },
  heroTitle: {
    fontSize: "2.3rem",
    fontWeight: 700,
    lineHeight: 1.1,
    marginBottom: 12,
  },
  heroSub: {
    fontSize: "1rem",
    opacity: 0.85,
    maxWidth: 340,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    background: "rgba(0, 0, 0, 0.5)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: "16px 20px 30px",
    boxShadow: "0 -10px 30px rgba(0,0,0,0.25)",
    minHeight: 350,
    transition: "transform 0.22s ease-out",
    touchAction: "none",
  },
  handle: {
    width: 44,
    height: 5,
    background: "#d4d4d4",
    borderRadius: 999,
    margin: "0 auto 14px",
  },
  sheetTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    marginBottom: 12,
    color: "#fff",
  },
  sheetBody: {
    fontSize: "0.9rem",
    lineHeight: 1.6,
    color: "#fff",
  },
};

export default LaunchPage;
