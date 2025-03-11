const ResistanceCalculator = (() => {
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

    const DOM = {
        numBands: document.getElementById("numBands"),
        band1: document.getElementById("band1"),
        band2: document.getElementById("band2"),
        band3: document.getElementById("band3"),
        multiplier: document.getElementById("multiplier"),
        tolerance: document.getElementById("tolerance"),
        tempCoeff: document.getElementById("tempCoeff"),
        resistor: document.querySelector(".resistor"),
        result: document.getElementById("resistance-value"),
        procedure: document.getElementById("calculation-procedure"),
        calculateBtn: document.querySelector(".calculate-btn")
    };

    const init = () => {
        if (!DOM.numBands || !DOM.band1 || !DOM.band2 || !DOM.multiplier || !DOM.tolerance || !DOM.resistor || !DOM.result || !DOM.procedure || !DOM.calculateBtn) {
            console.error("Error: Uno o más elementos DOM no se encontraron.");
            return;
        }
        setupEventListeners();
        populateInitialSelects();
        updateBands();
    };

    const setupEventListeners = () => {
        DOM.numBands.addEventListener("change", updateBands);
        DOM.calculateBtn.addEventListener("click", calculateResistance);
        document.querySelectorAll(".band-selector").forEach(select => {
            select.addEventListener("change", updateResistor);
        });
    };

    const populateInitialSelects = () => {
        populateSelect(DOM.band1, 'value');
        populateSelect(DOM.band2, 'value');
        populateSelect(DOM.band3, 'value');
        populateSelect(DOM.multiplier, 'multiplier');
        populateSelect(DOM.tolerance, 'tolerance');
        populateSelect(DOM.tempCoeff, 'tempCoeff');
    };

    const populateSelect = (selectElement, filterType) => {
        selectElement.innerHTML = '<option value="">Selecciona el color de la franja...</option>';
        const filteredColors = colors.filter(color => {
            switch(filterType) {
                case 'value': return color.value !== null;
                case 'multiplier': return color.multiplier !== null;
                case 'tolerance': return color.tolerance !== null;
                case 'tempCoeff': return color.tempCoeff !== null;
                default: return false;
            }
        });
        filteredColors.forEach(color => {
            const option = document.createElement("option");
            option.value = color.name;
            option.textContent = color.name;
            option.dataset.hex = color.hex;
            option.dataset.value = color.value ?? '';
            option.dataset.multiplier = color.multiplier ?? '';
            option.dataset.tolerance = color.tolerance ?? '';
            option.dataset.tempCoeff = color.tempCoeff ?? '';
            selectElement.appendChild(option);
        });
    };

    const updateBands = () => {
        const numBands = parseInt(DOM.numBands.value);
        document.getElementById("band3-group").classList.toggle("hidden", numBands < 5);
        document.getElementById("tempCoeff-group").classList.toggle("hidden", numBands !== 6);
        DOM.resistor.setAttribute("data-bands", numBands);
        if(numBands >= 5) populateSelect(DOM.band3, 'value');
        if(numBands === 6) populateSelect(DOM.tempCoeff, 'tempCoeff');
        updateResistor();
    };

    const updateResistor = () => {
        const getColorHex = (select) => {
            const selected = select.selectedOptions[0];
            return selected ? selected.dataset.hex : 'transparent';
        };
        const bands = DOM.resistor.querySelectorAll(".band");
        const numBands = parseInt(DOM.numBands.value);
        bands[0].style.backgroundColor = getColorHex(DOM.band1);
        bands[1].style.backgroundColor = getColorHex(DOM.band2);
        bands[2].style.backgroundColor = numBands >= 5 ? getColorHex(DOM.band3) : getColorHex(DOM.multiplier);
        bands[3].style.backgroundColor = numBands >= 5 ? getColorHex(DOM.multiplier) : getColorHex(DOM.tolerance);
        if(numBands >= 5) {
            bands[4].style.backgroundColor = getColorHex(DOM.tolerance);
            bands[4].classList.remove("hidden");
        }
        if(numBands === 6) {
            bands[5].style.backgroundColor = getColorHex(DOM.tempCoeff);
            bands[5].classList.remove("hidden");
        }
        bands.forEach((band, index) => {
            if(index >= numBands) band.classList.add("hidden");
        });
    };

    const validateBands = () => {
        const numBands = parseInt(DOM.numBands.value);
        const missingBands = [];

        if (!DOM.band1.value) missingBands.push("Franja 1");
        if (!DOM.band2.value) missingBands.push("Franja 2");
        if (numBands >= 5 && !DOM.band3.value) missingBands.push("Franja 3");
        if (!DOM.multiplier.value) missingBands.push("Multiplicador");
        if (!DOM.tolerance.value) missingBands.push("Tolerancia");
        if (numBands === 6 && !DOM.tempCoeff.value) missingBands.push("Coeficiente térmico");

        if (missingBands.length > 0) {
            DOM.result.textContent = "Error: Faltan seleccionar las siguientes bandas:";
            DOM.procedure.innerHTML = missingBands.map(band => `<p style="color: red;">• ${band}</p>`).join("");
            return false;
        }
        return true;
    };

    const calculateResistance = () => {
        if (!validateBands()) return;

        const getSelectedValue = (select) => {
            const option = select.selectedOptions[0];
            return option ? {
                value: parseFloat(option.dataset.value),
                multiplier: parseFloat(option.dataset.multiplier),
                tolerance: option.dataset.tolerance,
                name: option.value
            } : null;
        };

        const numBands = parseInt(DOM.numBands.value);
        let resistanceValue = 0;
        let procedureSteps = [];

        try {
            const band1 = getSelectedValue(DOM.band1);
            const band2 = getSelectedValue(DOM.band2);
            const band3 = getSelectedValue(DOM.band3);
            const multiplier = getSelectedValue(DOM.multiplier);
            const tolerance = getSelectedValue(DOM.tolerance);
            const tempCoeff = getSelectedValue(DOM.tempCoeff);

            if(!band1 || !band2 || !multiplier) throw new Error("Selecciona todas las bandas requeridas");

            switch(numBands) {
                case 4:
                    resistanceValue = (band1.value * 10 + band2.value) * multiplier.multiplier;
                    procedureSteps = [
                        `• Primera banda (${band1.name}): ${band1.value}`,
                        `• Segunda banda (${band2.name}): ${band2.value}`,
                        `• Multiplicador (${multiplier.name}): ×${multiplier.multiplier}`,
                        `• Cálculo: (${band1.value} * 10 + ${band2.value}) * ${multiplier.multiplier} = ${resistanceValue}`,
                        `• Tolerancia: ${tolerance?.tolerance || 'No especificada'}`
                    ];
                    break;
                case 5:
                    resistanceValue = (band1.value * 100 + band2.value * 10 + band3.value) * multiplier.multiplier;
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
                    resistanceValue = (band1.value * 100 + band2.value * 10 + band3.value) * multiplier.multiplier;
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

            const toleranceValue = tolerance ? parseFloat(tolerance.tolerance.replace('±', '').replace('%', '')) : 0;
            const minResistance = resistanceValue * (1 - toleranceValue / 100);
            const maxResistance = resistanceValue * (1 + toleranceValue / 100);
            procedureSteps.push(`• Rango de tolerancia: ${minResistance}Ω - ${maxResistance}Ω`);

            const formatted = resistanceValue.toLocaleString('es-ES');
            const toleranceText = tolerance ? ` ${tolerance.tolerance}` : '';

            DOM.result.textContent = `${formatted}Ω${toleranceText}`;
            DOM.procedure.innerHTML = `
                <strong>Procedimiento de cálculo:</strong><br>
                ${procedureSteps.join('<br>')}
            `;

        } catch (error) {
            DOM.result.textContent = error.message;
            DOM.procedure.textContent = "";
        }
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
    ResistanceCalculator.init();
});