let mascotElement: HTMLElement | null = null;

export function showMascot(coordinates: { x: number; y: number }) {
  // Remove existing mascot if any
  hideMascot();

  // Create mascot element
  mascotElement = document.createElement("div");
  mascotElement.id = "pear-mascot";
  mascotElement.className = "pear-mascot";

  // Add SVG
  mascotElement.innerHTML = `
    <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="shine" cx="25%" cy="25%">
          <stop offset="0%" style="stop-color:white;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:white;stop-opacity:0" />
        </radialGradient>
      </defs>
      <ellipse class="pear-body" cx="50" cy="70" rx="25" ry="35" fill="#92C5F7"/>
      <ellipse class="pear-body" cx="50" cy="45" rx="18" ry="20" fill="#92C5F7"/>
      <ellipse fill="url(#shine)" cx="40" cy="50" rx="10" ry="18" opacity="0.7"/>
      <ellipse cx="55" cy="25" rx="9" ry="5" transform="rotate(25 55 25)" fill="#27AE60"/>
      <ellipse cx="44" cy="50" rx="3" ry="3.5" fill="#2c3e50"/>
      <ellipse cx="56" cy="50" rx="3" ry="3.5" fill="#2c3e50"/>
      <path d="M 46 60 Q 50 63 54 60" stroke="#2c3e50" stroke-width="2.5" fill="none"/>
    </svg>
  `;

  // Position mascot
  mascotElement.style.left = coordinates.x - 40 + "px";
  mascotElement.style.top = coordinates.y - 40 + "px";

  // Inject CSS if not exists
  if (!document.getElementById("pear-mascot-styles")) {
    const style = document.createElement("style");
    style.id = "pear-mascot-styles";
    style.textContent = `
.pear-mascot {
  position: absolute;
  width: 80px;
  height: 80px;
  z-index: 10000;
  pointer-events: none;
  opacity: 0;
  transform: scale(0.1) rotate(-180deg);
  transition: all 1s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 8px 25px rgba(0,0,0,0.2));
}

.pear-mascot.visible {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.pear-mascot.working .pear-body {
  fill: #9b59b6;
  animation: processing-glow 1.8s ease-in-out infinite;
}

@keyframes processing-glow {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.08); filter: brightness(1.2); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;
    document.head.appendChild(style);
  }

  // Add to page
  document.body.appendChild(mascotElement);

  // Show with animation
  setTimeout(() => {
    mascotElement?.classList.add("visible", "working");
  }, 100);
}

export function updateMascotPosition(coordinates: { x: number; y: number }) {
  if (mascotElement) {
    // Just update position without recreating
    mascotElement.style.left = coordinates.x - 40 + "px";
    mascotElement.style.top = coordinates.y - 40 + "px";
  } else {
    // If mascot doesn't exist, create it
    showMascot(coordinates);
  }
}

export function hideMascot() {
  if (mascotElement) {
    mascotElement.remove();
    mascotElement = null;
  }
}
