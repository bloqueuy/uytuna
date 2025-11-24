// scrollAnimations.js

// Registrar ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Función para inicializar las animaciones
function initScrollAnimations() {
    // Slide desde la izquierda
    gsap.utils.toArray('.u-slide-left').forEach(element => {
        gsap.fromTo(element, {
            opacity: 0,
            x: -100
        }, {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: element,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });
    });

    // Slide desde la derecha
    gsap.utils.toArray('.u-slide-right').forEach(element => {
        gsap.fromTo(element, {
            opacity: 0,
            x: 100
        }, {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: element,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });
    });

    // Slide desde arriba (hacia abajo)
    gsap.utils.toArray('.u-slide-down').forEach(element => {
        gsap.fromTo(element, {
            opacity: 0,
            y: -100
        }, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: element,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });
    });
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
} else {
    // El DOM ya está cargado
    initScrollAnimations();
}