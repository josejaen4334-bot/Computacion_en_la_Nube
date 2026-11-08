document.addEventListener("DOMContentLoaded", function () {
    // Marca que JavaScript está activo (habilita las animaciones de aparición)
    document.documentElement.classList.add("js-listo");

    // ===== Elementos del DOM =====
    const btnMenu = document.getElementById("btnMenu");
    const menu = document.getElementById("menuPrincipal");
    const enlacesNav = document.querySelectorAll(".NavH3");
    const btnSubir = document.getElementById("btnSubir");

    const formulario = document.getElementById("formSimulador");
    const selectServicio = document.getElementById("selectServicio");
    const inputHoras = document.getElementById("inputHoras");
    const resultadoDOM = document.getElementById("resultadoDOM");

    // ===== Menú hamburguesa =====
    function cerrarMenu() {
        menu.classList.remove("Abierto");
        btnMenu.setAttribute("aria-expanded", "false");
        btnMenu.setAttribute("aria-label", "Abrir menú");
    }

    btnMenu.addEventListener("click", function () {
        const abierto = menu.classList.toggle("Abierto");
        btnMenu.setAttribute("aria-expanded", String(abierto));
        btnMenu.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    });

    // Cerrar el menú al elegir una opción o con la tecla Escape
    enlacesNav.forEach(function (enlace) {
        enlace.addEventListener("click", cerrarMenu);
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            cerrarMenu();
        }
    });

    // ===== Resaltar en el menú la sección visible =====
    const secciones = document.querySelectorAll("main section[id]");

    if ("IntersectionObserver" in window) {
        const observadorNav = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    enlacesNav.forEach(function (enlace) {
                        const activo = enlace.getAttribute("href") === "#" + entrada.target.id;
                        enlace.classList.toggle("Activo", activo);
                        if (activo) {
                            enlace.setAttribute("aria-current", "true");
                        } else {
                            enlace.removeAttribute("aria-current");
                        }
                    });
                }
            });
        }, { rootMargin: "-40% 0px -55% 0px" });

        secciones.forEach(function (seccion) {
            observadorNav.observe(seccion);
        });

        // ===== Aparición de secciones al hacer scroll =====
        const observadorReveal = new IntersectionObserver(function (entradas, obs) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("Visible");
                    obs.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.08 });

        document.querySelectorAll(".Reveal").forEach(function (el) {
            observadorReveal.observe(el);
        });
    } else {
        // Navegadores antiguos: mostrar todo sin animación
        document.querySelectorAll(".Reveal").forEach(function (el) {
            el.classList.add("Visible");
        });
    }

    // ===== Botón volver arriba =====
    window.addEventListener("scroll", function () {
        btnSubir.classList.toggle("Visible", window.scrollY > 500);
    }, { passive: true });

    btnSubir.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // ===== Simulador de costos =====
    const tarifas = {
        IaaS: 0.05,
        PaaS: 0.12,
        SaaS: 0.25
    };

    function mostrarMensajeError(mensaje) {
        resultadoDOM.innerHTML = "";

        const tarjeta = document.createElement("div");
        tarjeta.className = "TarjetaResultado Error";

        const texto = document.createElement("span");
        texto.className = "ResError";
        texto.textContent = "⚠️ " + mensaje;

        tarjeta.appendChild(texto);
        resultadoDOM.appendChild(tarjeta);
    }

    function mostrarResultado(servicio, horas, tarifa, total) {
        resultadoDOM.innerHTML = "";

        const tarjeta = document.createElement("div");
        tarjeta.className = "TarjetaResultado";

        const lineas = [
            ["ResTitulo", "Resumen de estimación"],
            ["ResLinea", "Servicio: ", servicio + " ($" + tarifa.toFixed(2) + "/hr)"],
            ["ResLinea", "Horas de cómputo: ", horas + " hrs"]
        ];

        lineas.forEach(function (datos) {
            const div = document.createElement("div");
            div.className = datos[0];
            if (datos[2]) {
                div.appendChild(document.createTextNode(datos[1]));
                const fuerte = document.createElement("strong");
                fuerte.textContent = datos[2];
                div.appendChild(fuerte);
            } else {
                div.textContent = datos[1];
            }
            tarjeta.appendChild(div);
        });

        tarjeta.appendChild(document.createElement("hr"));

        const totalDiv = document.createElement("div");
        totalDiv.className = "ResTotal";
        totalDiv.textContent = "Costo total: $" + total + " USD";
        tarjeta.appendChild(totalDiv);

        resultadoDOM.appendChild(tarjeta);
    }

    function calcularCosto() {
        const servicio = selectServicio.value;
        const horas = parseFloat(inputHoras.value);

        if (isNaN(horas) || horas <= 0) {
            inputHoras.classList.add("Invalido");
            inputHoras.setAttribute("aria-invalid", "true");
            mostrarMensajeError("Por favor, ingresa una cantidad de horas válida (mayor que 0).");
            inputHoras.focus();
            return;
        }

        inputHoras.classList.remove("Invalido");
        inputHoras.removeAttribute("aria-invalid");

        const tarifa = tarifas[servicio];
        const total = (horas * tarifa).toFixed(2);
        mostrarResultado(servicio, horas, tarifa, total);
    }

    // El submit cubre tanto el clic en el botón como la tecla Enter
    formulario.addEventListener("submit", function (e) {
        e.preventDefault();
        calcularCosto();
    });

    // Quitar el aviso de error en cuanto el usuario vuelve a escribir
    inputHoras.addEventListener("input", function () {
        inputHoras.classList.remove("Invalido");
        inputHoras.removeAttribute("aria-invalid");
    });
});
