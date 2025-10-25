import { loadSlim } from "tsparticles-slim";

// Initialize tsParticles
async function initParticles() {
  await loadSlim(tsParticles);

  await tsParticles.load("tsparticles", {
    autoPlay: true,
    detectRetina: true,
    fpsLimit: 120,
    pauseOnBlur: true,
    pauseOnOutsideViewport: true,
    fullScreen: {
      enable: true,
      zIndex: -1 // Behind content
    },
    interactivity: {
      detectsOn: "window",
      events: {
        onClick: {
          enable: true,
          mode: "push"
        },
        onHover: {
          enable: true,
          mode: "repulse",
          parallax: {
            enable: true,
            force: 60,
            smooth: 10
          }
        },
        resize: {
          delay: 0.5,
          enable: true
        }
      },
      modes: {
        repulse: {
          distance: 200,
          duration: 0.4
        },
        push: {
          quantity: 4
        }
      }
    },
    particles: {
      color: {
        value: "#ffffff"
      },
      links: {
        color: "#ffffff",
        enable: true,
        opacity: 0.4,
        distance: 150,
        width: 1
      },
      move: {
        enable: true,
        speed: 1,
        direction: "none",
        random: false,
        straight: false,
        outModes: {
          default: "out"
        }
      },
      number: {
        value: 100,
        density: {
          enable: true,
          width: 1920,
          height: 1080
        }
      },
      opacity: {
        value: {
          min: 0.1,
          max: 0.5
        },
        animation: {
          enable: true,
          speed: 3,
          sync: false,
          startValue: "random"
        }
      },
      size: {
        value: {
          min: 1,
          max: 5
        },
        animation: {
          enable: true,
          speed: 20,
          sync: false,
          startValue: "random"
        }
      },
      shape: {
        type: "circle"
      }
    },
    motion: {
      disable: false,
      reduce: {
        factor: 4,
        value: true
      }
    }
  });
}

// Call the function
initParticles();
