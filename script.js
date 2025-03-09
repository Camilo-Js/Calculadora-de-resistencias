const ResistanceCalculator = (() => {
    // Definición de los colores y sus valores asociados
    const colors = [
        { name: "Negro", value: 0, multiplier: 1, tolerance: null, tempCoeff: null, hex: "#000000" },
        { name: "Café", value: 1, multiplier: 10, tolerance: "±1%", tempCoeff: 100, hex: "#c97535" },
        { name: "Rojo", value: 2, multiplier: 100, tolerance: "±2%", tempCoeff: 50, hex: "#ff3434" },
        { name: "Naranja", value: 3, multiplier: 1000, tolerance: "±3%", tempCoeff: 15, hex: "#ff5733" },
        { name: "Amarillo", value: 4, multiplier: 10000, tolerance: "±4%", tempCoeff: 25, hex: "#fbff4d" },
        { name: "Verde", value: 5, multiplier: 100000, tolerance: "±0.5%", tempCoeff: 20, hex: "#6bff4d" },
        { name: "Azul", value: 6, multiplier: 1000000, tolerance: "±0.25%", tempCoeff: 10, hex: "#4d57ff" },
        { name: "Violeta", value: 7, multiplier: 10000000, tolerance: "±0.1%", tempCoeff: 5, hex: "#a54dff" },
        { name: "Gris", value: 8, multiplier: 100000000, tolerance: "±0.05%", tempCoeff: 1, hex: "#808080" },
        { name: "Blanco", value: 9, multiplier: 1000000000, tolerance: null, tempCoeff: null, hex: "#FFFFFF" },
        { name: "Dorado", value: null, multiplier: 0.1, tolerance: "±5%", tempCoeff: null, hex: "#FFD700" },
        { name: "Plata", value: null, multiplier: 0.01, tolerance: "±10%", tempCoeff: null, hex: "#d4d4d4" }
    ];

    // Selección de elementos del DOM
    const DOM = {
        numBands: document.getElementById("numBands"), // Selector de número de bandas
        band1: document.getElementById("band1"), // Selector de la primera banda
        band2: document.getElementById("band2"), // Selector de la segunda banda
        band3: document.getElementById("band3"), // Selector de la tercera banda (opcional)
        multiplier: document.getElementById("multiplier"), // Selector del multiplicador
        tolerance: document.getElementById("tolerance"), // Selector de tolerancia
        tempCoeff: document.getElementById("tempCoeff"), // Selector del coeficiente térmico (opcional)
        resistor: document.querySelector(".resistor"), // Representación visual del resistor
        result: document.getElementById("resistance-value"), // Elemento para mostrar el valor de la resistencia
        procedure: document.getElementById("calculation-procedure"), // Elemento para mostrar el procedimiento de cálculo
        calculateBtn: document.querySelector(".calculate-btn") // Botón para calcular la resistencia
    };

    // Función de inicialización
    const init = () => {
        // Verifica si todos los elementos del DOM están presentes
        if (!DOM.numBands || !DOM.band1 || !DOM.band2 || !DOM.multiplier || !DOM.tolerance || !DOM.resistor || !DOM.result || !DOM.procedure || !DOM.calculateBtn) {
            console.error("Error: Uno o más elementos DOM no se encontraron.");
            return;
        }
        setupEventListeners(); // Configura los event listeners
        populateInitialSelects(); // Llena los selects iniciales
        updateBands(); // Actualiza las bandas del resistor
    };

    // Configuración de event listeners
    const setupEventListeners = () => {
        DOM.numBands.addEventListener("change", updateBands); // Escucha cambios en el número de bandas
        DOM.calculateBtn.addEventListener("click", calculateResistance); // Escucha clics en el botón de calcular
        document.querySelectorAll(".band-selector").forEach(select => {
            select.addEventListener("change", updateResistor); // Escucha cambios en los selectores de bandas
        });
    };

    // Llenado de los selects iniciales
    const populateInitialSelects = () => {
        populateSelect(DOM.band1, 'value'); // Llena el selector de la primera banda
        populateSelect(DOM.band2, 'value'); // Llena el selector de la segunda banda
        populateSelect(DOM.band3, 'value'); // Llena el selector de la tercera banda
        populateSelect(DOM.multiplier, 'multiplier'); // Llena el selector del multiplicador
        populateSelect(DOM.tolerance, 'tolerance'); // Llena el selector de tolerancia
        populateSelect(DOM.tempCoeff, 'tempCoeff'); // Llena el selector del coeficiente térmico
    };

    // Función para llenar un select con opciones filtradas
    const populateSelect = (selectElement, filterType) => {
        selectElement.innerHTML = '<option value="">Seleccionar...</option>'; // Añade una opción por defecto
        
        // Filtra los colores según el tipo de filtro (valor, multiplicador, tolerancia, coeficiente térmico)
        const filteredColors = colors.filter(color => {
            switch(filterType) {
                case 'value': return color.value !== null; // Filtra colores con valor
                case 'multiplier': return color.multiplier !== null; // Filtra colores con multiplicador
                case 'tolerance': return color.tolerance !== null; // Filtra colores con tolerancia
                case 'tempCoeff': return color.tempCoeff !== null; // Filtra colores con coeficiente térmico
                default: return false;
            }
        });

        // Añade las opciones filtradas al select
        filteredColors.forEach(color => {
            const option = document.createElement("option");
            option.value = color.name; // Valor de la opción
            option.textContent = color.name; // Texto de la opción
            option.dataset.hex = color.hex; // Almacena el color en formato hexadecimal
            option.dataset.value = color.value ?? ''; // Almacena el valor numérico
            option.dataset.multiplier = color.multiplier ?? ''; // Almacena el multiplicador
            option.dataset.tolerance = color.tolerance ?? ''; // Almacena la tolerancia
            option.dataset.tempCoeff = color.tempCoeff ?? ''; // Almacena el coeficiente térmico
            selectElement.appendChild(option); // Añade la opción al select
        });
    };

    // Actualización de las bandas del resistor según el número de bandas seleccionado
    const updateBands = () => {
        const numBands = parseInt(DOM.numBands.value); // Obtiene el número de bandas seleccionado
        
        // Muestra u oculta los controles según el número de bandas
        document.getElementById("band3-group").classList.toggle("hidden", numBands < 5); // Oculta la tercera banda si hay menos de 5 bandas
        document.getElementById("tempCoeff-group").classList.toggle("hidden", numBands !== 6); // Oculta el coeficiente térmico si no hay 6 bandas
        DOM.resistor.setAttribute("data-bands", numBands); // Actualiza el atributo de bandas en el resistor
        
        // Actualiza los selects si es necesario
        if(numBands >= 5) populateSelect(DOM.band3, 'value'); // Llena la tercera banda si hay 5 o más bandas
        if(numBands === 6) populateSelect(DOM.tempCoeff, 'tempCoeff'); // Llena el coeficiente térmico si hay 6 bandas
        
        updateResistor(); // Actualiza la representación visual del resistor
    };

    // Actualización de la representación visual del resistor
    const updateResistor = () => {
        const getColorHex = (select) => {
            const selected = select.selectedOptions[0]; // Obtiene la opción seleccionada
            return selected ? selected.dataset.hex : 'transparent'; // Devuelve el color hexadecimal o transparente si no hay selección
        };

        const bands = DOM.resistor.querySelectorAll(".band"); // Obtiene todas las bandas del resistor
        const numBands = parseInt(DOM.numBands.value); // Obtiene el número de bandas seleccionado
        
        // Actualiza los colores de las bandas según las selecciones
        bands[0].style.backgroundColor = getColorHex(DOM.band1); // Primera banda
        bands[1].style.backgroundColor = getColorHex(DOM.band2); // Segunda banda
        bands[2].style.backgroundColor = numBands >= 5 ? getColorHex(DOM.band3) : getColorHex(DOM.multiplier); // Tercera banda o multiplicador
        bands[3].style.backgroundColor = numBands >= 5 ? getColorHex(DOM.multiplier) : getColorHex(DOM.tolerance); // Multiplicador o tolerancia
        
        if(numBands >= 5) {
            bands[4].style.backgroundColor = getColorHex(DOM.tolerance); // Tolerancia si hay 5 o más bandas
            bands[4].classList.remove("hidden"); // Muestra la cuarta banda
        }
        
        if(numBands === 6) {
            bands[5].style.backgroundColor = getColorHex(DOM.tempCoeff); // Coeficiente térmico si hay 6 bandas
            bands[5].classList.remove("hidden"); // Muestra la quinta banda
        }
        
        // Oculta las bandas no utilizadas
        bands.forEach((band, index) => {
            if(index >= numBands) band.classList.add("hidden"); // Oculta las bandas que no se usan
        });
    };

    // Función para calcular la resistencia
    const calculateResistance = () => {
        const getSelectedValue = (select) => {
            const option = select.selectedOptions[0]; // Obtiene la opción seleccionada
            return option ? {
                value: parseFloat(option.dataset.value), // Valor numérico
                multiplier: parseFloat(option.dataset.multiplier), // Multiplicador
                tolerance: option.dataset.tolerance, // Tolerancia
                name: option.value // Nombre del color
            } : null;
        };

        const numBands = parseInt(DOM.numBands.value); // Obtiene el número de bandas seleccionado
        let resistanceValue = 0; // Valor de la resistencia
        let procedureSteps = []; // Pasos del procedimiento de cálculo
        
        try {
            const band1 = getSelectedValue(DOM.band1); // Obtiene los valores de la primera banda
            const band2 = getSelectedValue(DOM.band2); // Obtiene los valores de la segunda banda
            const band3 = getSelectedValue(DOM.band3); // Obtiene los valores de la tercera banda (si existe)
            const multiplier = getSelectedValue(DOM.multiplier); // Obtiene los valores del multiplicador
            const tolerance = getSelectedValue(DOM.tolerance); // Obtiene los valores de la tolerancia
            const tempCoeff = getSelectedValue(DOM.tempCoeff); // Obtiene los valores del coeficiente térmico (si existe)

            // Validación de selecciones
            if(!band1 || !band2 || !multiplier) throw new Error("Selecciona todas las bandas requeridas");

            // Cálculo principal según el número de bandas
            switch(numBands) {
                case 4:
                    resistanceValue = (band1.value * 10 + band2.value) * multiplier.multiplier; // Cálculo para 4 bandas
                    procedureSteps = [
                        `• Primera banda (${band1.name}): ${band1.value}`,
                        `• Segunda banda (${band2.name}): ${band2.value}`,
                        `• Multiplicador (${multiplier.name}): ×${multiplier.multiplier}`,
                        `• Cálculo: (${band1.value} * 10 + ${band2.value}) * ${multiplier.multiplier} = ${resistanceValue}`,
                        `• Tolerancia: ${tolerance?.tolerance || 'No especificada'}`
                    ];
                    break;
                    
                case 5:
                    resistanceValue = (band1.value * 100 + band2.value * 10 + band3.value) * multiplier.multiplier; // Cálculo para 5 bandas
                    procedureSteps = [
                        `• Primera banda (${band1.name}): ${band1.value}`,
                        `• Segunda banda (${band2.name}): ${band2.value}`,
                        `• Tercera banda (${band3.name}): ${band3.value}`,
                        `• Multiplicador (${multiplier.name}): ×${multiplier.multiplier}`,
                        `• Cálculo: (${band1.value} * 100 + ${band2.value} * 10 + ${band3.value}) * ${multiplier.multiplier} = ${resistanceValue}`,
                        `• Tolerancia: ${tolerance?.tolerance || 'No especificada'}`
                    ];
                    break;
                    
                case 6:
                    resistanceValue = (band1.value * 100 + band2.value * 10 + band3.value) * multiplier.multiplier; // Cálculo para 6 bandas
                    procedureSteps = [
                        `• Primera banda (${band1.name}): ${band1.value}`,
                        `• Segunda banda (${band2.name}): ${band2.value}`,
                        `• Tercera banda (${band3.name}): ${band3.value}`,
                        `• Multiplicador (${multiplier.name}): ×${multiplier.multiplier}`,
                        `• Cálculo: (${band1.value} * 100 + ${band2.value} * 10 + ${band3.value}) * ${multiplier.multiplier} = ${resistanceValue}`,
                        `• Tolerancia: ${tolerance?.tolerance || 'No especificada'}`,
                        `• Coeficiente térmico: ${tempCoeff?.name || 'No especificado'}`
                    ];
                    break;
            }

            // Cálculo del rango de tolerancia
            const toleranceValue = tolerance ? parseFloat(tolerance.tolerance.replace('±', '').replace('%', '')) : 0; // Obtiene el valor de tolerancia
            const minResistance = resistanceValue * (1 - toleranceValue / 100); // Calcula el valor mínimo
            const maxResistance = resistanceValue * (1 + toleranceValue / 100); // Calcula el valor máximo
            procedureSteps.push(`• Rango de tolerancia: ${minResistance}Ω - ${maxResistance}Ω`); // Añade el rango al procedimiento

            // Formateo del resultado
            const formatted = resistanceValue.toLocaleString('es-ES'); // Formatea el valor de la resistencia
            const toleranceText = tolerance ? ` ${tolerance.tolerance}` : ''; // Añade la tolerancia si existe

            // Muestra los resultados en el DOM
            DOM.result.textContent = `${formatted}Ω${toleranceText}`; // Muestra el valor de la resistencia
            DOM.procedure.innerHTML = `
                <strong>Procedimiento de cálculo:</strong><br>
                ${procedureSteps.join('<br>')}
            `; // Muestra el procedimiento de cálculo

        } catch (error) {
            DOM.result.textContent = error.message; // Muestra un mensaje de error si algo falla
            DOM.procedure.textContent = ""; // Limpia el procedimiento
        }
    };

    return { init }; // Expone la función de inicialización
})();

// Inicialización de la calculadora al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    ResistanceCalculator.init(); // Llama a la función de inicialización
});