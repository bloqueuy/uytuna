// scrollAnimations.js

// Registrar ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

function initDirectionalAnimation(options) {
    const {
        selector,
        enterFrom,
        enterBackFrom,
        leaveTo,
        leaveBackTo,
        duration = 0.6
    } = options;

    const elements = gsap.utils.toArray(selector);
    const resolvedEnterBack = enterBackFrom || enterFrom;
    const resolvedLeaveTo = leaveTo || resolvedEnterBack;
    const resolvedLeaveBack = leaveBackTo || enterFrom;

    const playFrom = (element, fromVars) => {
        gsap.killTweensOf(element);
        gsap.fromTo(element, fromVars, {
            opacity: 1,
            x: fromVars.x !== undefined ? 0 : undefined,
            y: fromVars.y !== undefined ? 0 : undefined,
            duration,
            ease: "power2.out"
        });
    };

    const hideTo = (element, toVars) => {
        gsap.killTweensOf(element);
        gsap.to(element, {
            opacity: 0,
            x: toVars.x,
            y: toVars.y,
            duration: 0.6,
            ease: "power2.inOut"
        });
    };

    elements.forEach(element => {
        // NO establecer estado inicial aquí - dejamos que ScrollTrigger lo maneje
        
        const trigger = ScrollTrigger.create({
            trigger: element,
            start: "top 80%",
            end: "bottom 20%",
            // Callbacks más simples y predecibles
            onEnter: () => playFrom(element, enterFrom),
            onEnterBack: () => playFrom(element, resolvedEnterBack),
            onLeave: () => hideTo(element, resolvedLeaveTo),
            onLeaveBack: () => hideTo(element, resolvedLeaveBack),
            // Inicializar el estado basado en la posición actual
            onRefresh: (self) => {
                // Si el elemento está en viewport al cargar, mostrarlo inmediatamente
                if (self.progress > 0 && self.progress < 1) {
                    gsap.set(element, { opacity: 1, x: 0, y: 0 });
                } else {
                    // Si está fuera del viewport, usar el estado inicial apropiado
                    gsap.set(element, self.progress <= 0 ? enterFrom : resolvedLeaveTo);
                }
            }
        });
    });
}

// Función para inicializar las animaciones
function initScrollAnimations() {
    // Slide desde la izquierda
    initDirectionalAnimation({
        selector: '.u-animation-left',
        enterFrom: { opacity: 0, x: -100 },
        leaveTo: { x: -60 }
    });

    // Slide desde la derecha
    initDirectionalAnimation({
        selector: '.u-animation-right',
        enterFrom: { opacity: 0, x: 100 },
        leaveTo: { x: 60 }
    });

    // Slide desde arriba (hacia abajo)
    initDirectionalAnimation({
        selector: '.u-animation-down',
        enterFrom: { opacity: 0, y: -100 },
        enterBackFrom: { opacity: 0, y: 100 },
        leaveTo: { y: 100 },
        leaveBackTo: { y: -60 }
    });

    // Aparición sutil en secuencia
    const sequenceElements = gsap.utils.toArray('.u-animation-sequence');
    
    // Inicializar estado de elementos de secuencia
    sequenceElements.forEach(el => {
        gsap.set(el, { opacity: 0, y: 20 });
    });

    ScrollTrigger.batch('.u-animation-sequence', {
        start: "top 85%",
        end: "bottom 15%",
        onEnter: batch => {
            gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: "power1.out",
                stagger: 0.15,
                overwrite: 'auto'
            });
        },
        onEnterBack: batch => {
            gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power1.out",
                stagger: 0.1,
                overwrite: 'auto'
            });
        },
        onLeave: batch => {
            gsap.to(batch, {
                opacity: 0,
                y: 20,
                duration: 0.6,
                ease: "power1.inOut",
                overwrite: 'auto'
            });
        },
        onLeaveBack: batch => {
            gsap.to(batch, {
                opacity: 0,
                y: -20,
                duration: 0.6,
                ease: "power1.inOut",
                overwrite: 'auto'
            });
        },
        onRefresh: batches => {
            batches.forEach((batch, i) => {
                batch.forEach(el => {
                    const trigger = ScrollTrigger.getById(el._gsap?.id);
                    if (!trigger) return;
                    
                    if (trigger.progress > 0 && trigger.progress < 1) {
                        gsap.set(el, { opacity: 1, y: 0 });
                    } else {
                        gsap.set(el, { opacity: 0, y: trigger.progress <= 0 ? 20 : -20 });
                    }
                });
            });
        }
    });

    // Refresh después de que todo esté configurado
    ScrollTrigger.refresh();
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
} else {
    initScrollAnimations();
}