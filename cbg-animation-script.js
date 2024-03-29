let spheres = [];
let routeSelected = false;
let currentPhase = 0;
let scaleTimerStarted = false;
let scaleTimer = 0;
let currentHoveredSphereId = null;
let hoverLock = true;
let firstTimeScatter = true;
let firstScatterClick = true;
let VIEWPORT = "";
let currentTargets = [];
let endAnimationHeightMeasurement;
let endAnimation = false;
let disabledPress = false;
let timestampEndingAnimation;
let durationEndingAnimation = 2000;
let bgColor = "#F0EBE6";

if (window.innerWidth > 1440) {
  VIEWPORT = "monitor";
} else if (window.innerWidth <= 1440 && window.innerWidth >= 600) {
  VIEWPORT = "laptop";
} else {
  VIEWPORT = "mobile";
}

const phases = ["FLOATING", "ECLIPSE", "SCATTER", "REDIRECT"];

function domContainerMapping(name) {
  switch (name) {
    case "art_direction":
      return document.getElementById("art_direction");

    case "design":
      return document.getElementById("design");

    case "visual_art":
      return document.getElementById("visual_art");

    case "web_development":
      return document.getElementById("web_development");

    case "data_analysis":
      return document.getElementById("data_analysis");

    case "social_media":
      return document.getElementById("social_media");

    default:
      return document.getElementById("art_direction");
  }
}

function setup() {
  let p5Canvas = createCanvas(windowWidth, windowHeight);
  p5Canvas.id("p5Canvas");
  spheres = [
    {
      x: -300,
      y: 100,
      size: 80,
      currentSize: 80,
      targetSize: 80,
      color: "#F79B00",
      text: "",
    },
    {
      x: 300,
      y: -100,
      size: 80,
      currentSize: 80,
      targetSize: 80,
      color: "#000",
      text: "",
    },
    {
      x: 0,
      y: 0,
      size: 80,
      currentSize: 80,
      targetSize: 80,
      color: "#F79B00",
      text: "Art direction",
      id: "art_direction",
    },
    {
      x: 0,
      y: 0,
      size: 80,
      currentSize: 80,
      targetSize: 80,
      color: "#F79B00",
      text: "Design",
      id: "design",
    },
    {
      x: 0,
      y: 0,
      size: 80,
      currentSize: 80,
      targetSize: 80,
      color: "#F79B00",
      text: "Visual Art",
      id: "visual_art",
    },
    {
      x: 0,
      y: 0,
      size: 80,
      currentSize: 80,
      targetSize: 80,
      color: "#F79B00",
      text: "Web development",
      id: "web_development",
    },
    {
      x: 0,
      y: 0,
      size: 80,
      currentSize: 80,
      targetSize: 80,
      color: "#F79B00",
      text: "Data analysis",
      id: "data_analysis",
    },
    {
      x: 0,
      y: 0,
      size: 80,
      currentSize: 80,
      targetSize: 80,
      color: "#F79B00",
      text: "Social media",
      id: "social_media",
    },
  ];
  generateCustomHtml();
  createContentContainers();
  injectStyles();
  const overlay = document.getElementById("cbg-animations-overlay");
  overlay.addEventListener("animationend", () => {
    overlay.style.zIndex = "11800";
  });
  setTimeout(() => {
    overlay.classList.add("fade-out-effect");
    document.body.overflow = 'hidden';
  }, 2000);
}

function exitSceneAndRedirect(_sphere) {
  endAnimation = true;
  timestampEndingAnimation = millis();

  spheres.slice(2, 8).forEach((sphere) => {
    if (_sphere.id === sphere.id) {
      sphere.isOrbiting = true;
      sphere.isExiting = true;
    } else {
      sphere.isExiting = true; // Mark the sphere as exiting
    }
  });

  const CbgTextHeading = document.getElementById("cbg_text_heading");
  CbgTextHeading.style.visibility = "visible";
  CbgTextHeading.style.opacity = 1;
}

function mousePressed() {
  if (disabledPress) {
    return;
  }
  if (phases[currentPhase] === "FLOATING") {
    currentPhase = (currentPhase + 1) % phases.length;
  } else if (phases[currentPhase] === "ECLIPSE") {
    if (hoverLock) {
      return;
    }
    const clickedSphere = checkSphereClicked();
    if (clickedSphere) {
      // A sphere was clicked, transition to the next phase
      currentPhase = (currentPhase + 1) % phases.length;
    }
  }
  if (phases[currentPhase] === "SCATTER") {
    if (firstScatterClick) {
      firstScatterClick = false;
      return;
    } else {
      for (let sphere of spheres.slice(2)) {
        let distance = dist(
          mouseX - width / 2,
          mouseY - height / 2,
          sphere.x,
          sphere.y
        );
        if (distance < sphere.size / 2) {
          exitSceneAndRedirect(sphere);
          return;
        }
      }
    }
  }
}

function draw() {
  background(bgColor);
  translate(width / 2, height / 2);

  let isHoveringAnySphere = false;
  const hoverScale = 1.2;
  let visibleSpheres = [];

  noStroke();

  if (phases[currentPhase] === "FLOATING") {
    visibleSpheres = spheres.slice(0, 2);
    const orbitCenter = [
      { x: -200, y: -50 },
      { x: 200, y: 50 },
    ];
    applyOrbitalBehavior(visibleSpheres[1], orbitCenter[0], 0.01, 20, 20, true);
    applyOrbitalBehavior(
      visibleSpheres[0],
      orbitCenter[1],
      0.01,
      20,
      10,
      false
    );
  }

  if (phases[currentPhase] === "ECLIPSE") {
    visibleSpheres = spheres.slice(0, 2);
    spheres[0].x = lerp(spheres[0].x, 0, 0.05);
    spheres[0].y = lerp(spheres[0].y, 0, 0.05);

    spheres[1].x = lerp(spheres[1].x, 0, 0.05);
    spheres[1].y = lerp(spheres[1].y, 0, 0.05);

    // Check if both spheres have reached their target positions
    const threshold = 1; // Small threshold for considering position reached
    let distance1 = dist(spheres[0].x, spheres[0].y, 0, 0);
    let distance2 = dist(spheres[1].x, spheres[1].y, 0, 0);
    if (distance1 < threshold && distance2 < threshold && !scaleTimerStarted) {
      scaleTimerStarted = true;
      scaleTimer = millis(); // Start timer
    }

    // After 500ms have passed since the timer started, begin scaling
    if (scaleTimerStarted && millis() - scaleTimer > 500) {
      spheres[0].currentSize = lerp(spheres[0].currentSize, 120, 0.05);
      hoverLock = false;
    }

    // Calculate normalized distance between the spheres
    let distance = dist(spheres[0].x, spheres[0].y, spheres[1].x, spheres[1].y);
    let maxDistance = sqrt(width * width + height * height); // Max possible distance on screen
    let normalizedDistance = map(distance, 0, maxDistance, 1, 0);

    // Lerp background color based on normalized distance
    bgColor = lerpColor(color("#F0EBE6"), color("#000000"), normalizedDistance);

    // Make sure the background is fully black when spheres overlap
    if (distance < 1) {
      bgColor = "#000000";
    }
  }

  if (phases[currentPhase] === "SCATTER") {
    bgColor = lerpColor(color(bgColor), color("#F0EBE6"), 0.1);

    if (!hoverLock && firstTimeScatter) {
      hoverLock = true;
      firstTimeScatter = false;
      setTimeout(() => {
        if (!(VIEWPORT === "mobile")) {
          hoverLock = false;
        }
      }, 500);
    }
    visibleSpheres = spheres.slice(2, 8);

    // According to the viewport size
    const monitorTargets = [
      { x: -500, y: -150 },
      { x: -300, y: -250 },
      { x: -100, y: -300 },
      { x: 100, y: -300 },
      { x: 300, y: -250 },
      { x: 500, y: -150 },
    ];
    const laptopTargets = [
      { x: -375, y: -112.5 },
      { x: -225, y: -187.5 },
      { x: -75, y: -225 },
      { x: 75, y: -225 },
      { x: 225, y: -187.5 },
      { x: 375, y: -112.5 },
    ];
    const mobileTargets = [
      { x: -(window.innerWidth / 4), y: -(window.innerHeight / 4) },
      { x: -(window.innerWidth / 4), y: 0 },
      { x: -(window.innerWidth / 4), y: window.innerHeight / 4 },
      { x: window.innerWidth / 4, y: window.innerHeight / 4 },
      { x: window.innerWidth / 4, y: 0 },
      { x: window.innerWidth / 4, y: -(window.innerHeight / 4) },
    ];

    if (VIEWPORT === "monitor") {
      currentTargets = monitorTargets;
      endAnimationHeightMeasurement = -250;
    } else if (VIEWPORT === "laptop") {
      endAnimationHeightMeasurement = -187.5;
      currentTargets = laptopTargets;
    } else {
      endAnimationHeightMeasurement = -140;
      currentTargets = mobileTargets;
    }

    spheres[2].x = lerp(spheres[2].x, currentTargets[0].x, 0.05);
    spheres[2].y = lerp(spheres[2].y, currentTargets[0].y, 0.05);

    spheres[3].x = lerp(spheres[3].x, currentTargets[1].x, 0.05);
    spheres[3].y = lerp(spheres[3].y, currentTargets[1].y, 0.05);

    spheres[4].x = lerp(spheres[4].x, currentTargets[2].x, 0.05);
    spheres[4].y = lerp(spheres[4].y, currentTargets[2].y, 0.05);

    spheres[5].x = lerp(spheres[5].x, currentTargets[3].x, 0.05);
    spheres[5].y = lerp(spheres[5].y, currentTargets[3].y, 0.05);

    spheres[6].x = lerp(spheres[6].x, currentTargets[4].x, 0.05);
    spheres[6].y = lerp(spheres[6].y, currentTargets[4].y, 0.05);

    spheres[7].x = lerp(spheres[7].x, currentTargets[5].x, 0.05);
    spheres[7].y = lerp(spheres[7].y, currentTargets[5].y, 0.05);
  }

  for (let sphere of visibleSpheres) {
    if (sphere.isExiting) {
      sphere.y = lerp(sphere.y, -1000, 0.05);
    } else if (sphere.isOrbiting) {
      const el = domContainerMapping(sphere.id);

      if (el) {
        el.style.visibility = "visible";
        el.style.opacity = 1;
      }
    }

    let d = dist(mouseX - width / 2, mouseY - height / 2, sphere.x, sphere.y);
    let isHovering = d < sphere.size / 2;
    sphere.currentSize = lerp(sphere.currentSize, sphere.targetSize, 0.1);

    if (!hoverLock) {
      sphere.targetSize = isHovering ? sphere.size * hoverScale : sphere.size;
    }

    if (isHovering) {
      handleSphereHover(sphere);
      isHoveringAnySphere = true;
    }

    fill(sphere.color);
    ellipse(sphere.x, sphere.y, sphere.currentSize);

    // Displaying text on each sphere, if it has text
    if (sphere.text && !sphere.isExiting && !sphere.isLastOrange) {
      drawCurvedText(sphere);
    }
  }

  // If no sphere is hovered, call handleNoHover
  if (!isHoveringAnySphere) {
    handleNoHover();
  }

  cursor(isHoveringAnySphere ? "pointer" : "default");
}

function handleSphereHover(sphere) {
  if (currentHoveredSphereId !== sphere.id) {
    const el = domContainerMapping(sphere.id);
    if (el && !hoverLock) {
      el.style.visibility = "visible";
      el.style.opacity = 1;
    }
    currentHoveredSphereId = sphere.id;
  }
}

function handleNoHover() {
  if (currentHoveredSphereId) {
    const el = domContainerMapping(currentHoveredSphereId);
    if (el) {
      el.style.visibility = "hidden";
      el.style.opacity = 0;
    }
    currentHoveredSphereId = null;
  }
}

function checkSphereClicked() {
  for (let i = 0; i < spheres.length; i++) {
    const sphere = spheres[i];
    const d = dist(mouseX - width / 2, mouseY - height / 2, sphere.x, sphere.y);
    if (d < sphere.size / 2) {
      return sphere; // Return the clicked sphere
    }
  }
  return null; // No sphere was clicked
}

function drawCurvedText(sphere) {
  let radius = sphere.currentSize / 2 + 20; // Adjust radius for text placement
  let textSizeVariable = 16; // Adjustable text size
  textSize(textSizeVariable);

  let circumference = TWO_PI * radius; // Circle circumference where text is placed

  // Function to calculate the angle degree occupied by each character
  function charAngleDegrees(charWidth, circumference) {
    return (charWidth / circumference) * 360; // Angle in degrees
  }

  // Calculate total angle occupied by the text
  let totalTextAngle = 0;
  for (let char of sphere.text) {
    let charWidth = textWidth(char); // Get width in pixels
    totalTextAngle += charAngleDegrees(charWidth, circumference); // Sum angles
  }

  // Calculate the starting angle to center the text at the top of the sphere
  let startAngleDegrees = -90 - totalTextAngle / 2;

  let currentAngleDegrees = startAngleDegrees;
  for (let i = 0; i < sphere.text.length; i++) {
    let char = sphere.text[i];
    let charWidth = textWidth(char);
    let charAngle = charAngleDegrees(charWidth, circumference);

    // Position for each character
    let angle = radians(currentAngleDegrees + charAngle / 2); // Center character in its allocated angle
    let x = sphere.x + cos(angle) * radius;
    let y = sphere.y + sin(angle) * radius;

    push();
    translate(x, y);
    rotate(angle + HALF_PI); // Adjust rotation to draw text upright
    fill(0); // Text color
    noStroke();
    textAlign(CENTER, CENTER);
    text(char, 0, 0); // Draw the character
    pop();

    // Update the current angle for the next character
    currentAngleDegrees += charAngle;
  }
}

function generateCustomHtml() {
  // Create the outermost div and set its id
  cbgTextHeading = document.createElement("div");
  cbgTextHeading.id = "cbg_text_heading";

  // Create the relative-positioned div container
  const relativeDiv = document.createElement("div");
  relativeDiv.style.position = "relative";

  // Create the first span with the class 'orange-sphere'
  const orangeSphere = document.createElement("span");
  orangeSphere.className = "orange-sphere";

  // Create the second span with the class 'black-sphere'
  const blackSphere = document.createElement("span");
  blackSphere.className = "black-sphere";

  // Append both spans to the relative-positioned div
  relativeDiv.appendChild(orangeSphere);
  relativeDiv.appendChild(blackSphere);

  // Create the h1 element and set its text
  const h1 = document.createElement("h1");
  h1.textContent = "CBG";

  // Append the relative-positioned div and h1 to the outermost div
  cbgTextHeading.appendChild(relativeDiv);
  cbgTextHeading.appendChild(h1);

  // Finally, append the outermost div to the body or a specific container in the document
  document.body.appendChild(cbgTextHeading);
}

function injectStyles() {
  const styleElement = document.createElement("style");
  styleElement.type = "text/css";
  const styleRules = `
      @font-face {
        font-family: Custom;
        src: url(./assets/fonts/AlbertSans.ttf);
      }
      
      #p5Canvas {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 12000;
      }
      
      #cbg_text_heading {
        display: flex;
        flex-direction: column;
        font-family: Custom;
        position: absolute;
        z-index: 12002;
        top: 250px;
        left: 50%;
        transform: translateX(-50%);
        transition: 2s;
        width: 200px;
        visibility: hidden;
        opacity: 0;
      }
      
      #cbg_text_heading .orange-sphere {
        background: #f79b00;
        height: 80px;
        width: 80px;
        border-radius: 100%;
        position: absolute;
        bottom: -80px;
        left: 90px;
      }
      
      #cbg_text_heading .black-sphere {
        position: absolute;
        background: #000;
        height: 80px;
        width: 80px;
        border-radius: 100%;
        left: 60px;
        bottom: -50px;
      }
      
      #cbg_text_heading h1 {
        margin: 0;
        font-weight: 400;
        font-size: 1.2rem;
        line-height: 1.4rem;
      }
      
      #cbg_text_heading h3 {
        margin: 0;
      }
      
      /* HIDE SHOW CONTENT */
      
      #art_direction,
      #design,
      #visual_art,
      #web_development,
      #data_analysis,
      #social_media {
        visibility: hidden;
        opacity: 0;
      }
      
      .content-container {
        font-family: Custom;
        padding: 1rem;
        position: fixed;
        z-index: 12001;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        transition: 0.5s;
        max-width: 600px;
        text-align: center;
        width: 100%;
      }
      
      .content-container h1 {
        margin: 0 0 1rem 0;
        font-size: 4rem;
      }
      
      .content-container p {
        margin: 0;
        font-size: 1.4rem;
        line-height: 160%;
      }
      
      /* MEDIA QUERIES */
      
      @media (max-width: 600px) {
        #cbg_text_heading {
          left: 50%;
        }
      
        .content-container {
          max-width: calc(100% - 2rem);
          width: 100%;
          margin: 0 auto;
        }
      
        .content-container h1 {
          font-size: 3rem;
        }
      }
      
      /* KEYFRAMES */
      
      @keyframes fadeOut {
        0% {
          opacity: 1;
          visibility: visible;
        }
        100% {
          opacity: 0;
          visibility: hidden;
        }
      }
      .fade-out-effect {
        animation: fadeOut 2s forwards;
      }  
  `;

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = styleRules; // Support for IE
  } else {
    styleElement.appendChild(document.createTextNode(styleRules)); // Support for others
  }

  document.head.appendChild(styleElement);
}

function createContentContainers() {
  // Define the content for each container
  const contents = [
    {
      id: "art_direction",
      title: "Art direction",
      text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem necessitatibus earum accusantium.",
    },
    {
      id: "design",
      title: "Design",
      text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem necessitatibus earum accusantium.",
    },
    {
      id: "visual_art",
      title: "Visual Art",
      text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem necessitatibus earum accusantium.",
    },
    {
      id: "web_development",
      title: "Web development",
      text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem necessitatibus earum accusantium.",
    },
    {
      id: "data_analysis",
      title: "Data analysis",
      text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem necessitatibus earum accusantium.",
    },
    {
      id: "social_media",
      title: "Social media",
      text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem necessitatibus earum accusantium.",
    },
  ];

  contents.forEach((content) => {
    // Create the container div
    const containerDiv = document.createElement("div");
    containerDiv.className = "content-container";
    containerDiv.id = content.id;

    // Create the h1 element for the title
    const titleH1 = document.createElement("h1");
    titleH1.textContent = content.title;

    // Create the paragraph element for the text
    const textP = document.createElement("p");
    textP.textContent = content.text;

    // Append the title and text to the container
    containerDiv.appendChild(titleH1);
    containerDiv.appendChild(textP);

    // Append the container to the body or a specific parent element
    document.body.appendChild(containerDiv);
  });
}

function applyOrbitalBehavior(
  sphere,
  center,
  angleIncrement,
  radiusX,
  radiusY,
  clockwise
) {
  // Initialize an angle property on the sphere if it doesn't exist
  if (sphere.angle === undefined) {
    sphere.angle = 0;
  }

  // Calculate the next angle
  if (clockwise) {
    sphere.angle += angleIncrement;
  } else {
    sphere.angle -= angleIncrement;
  }

  // Update the sphere's position based on the orbit
  sphere.x = center.x + radiusX * Math.cos(sphere.angle) * 2;
  sphere.y = center.y + radiusY * Math.sin(sphere.angle) * 1;
}
