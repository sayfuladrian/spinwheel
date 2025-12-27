
import { parseData, calculateSegments } from './data.js';
import { Wheel } from './wheel.js';

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const dataInput = document.getElementById('dataInput');
    const csvInput = document.getElementById('csvInput');
    const updateWheelBtn = document.getElementById('updateWheelBtn');
    const spinBtn = document.getElementById('spinBtn');
    const stopBtn = document.getElementById('stopBtn');
    const durationInput = document.getElementById('duration');
    const stopModeSelect = document.getElementById('stopMode');
    const weightModeSelect = document.getElementById('weightMode');
    const showWeightsCheckbox = document.getElementById('showWeights');

    // Modal Elements
    const modal = document.getElementById('resultModal');
    const closeBtn = document.querySelector('.close-btn');
    const winnerName = document.getElementById('winnerName');
    const winnerGroup = document.getElementById('winnerGroup');

    // Initialize Wheel
    const wheel = new Wheel('wheelCanvas');
    let wheelData = [];

    // Helper to update wheel
    function updateWheel() {
        console.log('Updating wheel...');
        const text = dataInput.value;
        console.log('Input text:', text);
        const rawData = parseData(text);
        console.log('Parsed data:', rawData);

        // Weight Strategy
        const strategy = weightModeSelect.value;
        const segments = calculateSegments(rawData, strategy);
        console.log('Segments:', segments);

        wheelData = segments;
        wheel.setSegments(segments);
    }

    // Initial Load
    // Wait for fonts or just ensure data is ready.
    // The textarea now has default value in HTML, so value should be available.
    updateWheel();

    // Event Listeners
    updateWheelBtn.addEventListener('click', updateWheel);
    weightModeSelect.addEventListener('change', updateWheel);

    showWeightsCheckbox.addEventListener('change', (e) => {
        wheel.setShowWeights(e.target.checked);
    });

    csvInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            dataInput.value = event.target.result;
            updateWheel();
        };
        reader.readAsText(file);
    });

    spinBtn.addEventListener('click', () => {
        if (wheel.isSpinning) return;

        // Settings
        const duration = parseInt(durationInput.value, 10) || 5;
        const isAuto = stopModeSelect.value === 'auto';

        // UI State
        spinBtn.disabled = true;
        updateWheelBtn.disabled = true;
        if (!isAuto) {
            stopBtn.disabled = false;
        }

        wheel.startSpin(duration, isAuto, (winner) => {
            // On Finish
            showResult(winner);
            resetUI();
        });
    });

    stopBtn.addEventListener('click', () => {
        if (wheel.isSpinning && stopModeSelect.value === 'manual') {
            wheel.stopManual();
            stopBtn.disabled = true; // Prevent double click
        }
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    function showResult(winner) {
        if(!winner) return;
        winnerName.textContent = winner.name;
        winnerGroup.textContent = `Group: ${winner.group}`;
        modal.classList.remove('hidden');
    }

    function resetUI() {
        spinBtn.disabled = false;
        updateWheelBtn.disabled = false;
        stopBtn.disabled = true;
    }
});
