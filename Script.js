const maleVoiceButton = document.getElementById('maleVoice');
const femaleVoiceButton = document.getElementById('femaleVoice');
const decreaseSpeedButton = document.getElementById('decreaseSpeed');
const increaseSpeedButton = document.getElementById('increaseSpeed');
const speedDisplay = document.getElementById('speedDisplay');
const playButton = document.getElementById('playButton');
const textInput = document.getElementById('text');
const errorMessage = document.getElementById('errorMessage');
const fileInput = document.getElementById('fileInput');

let selectedVoiceGender = 'male';
let speed = 1.0;
let voices = [];

function loadVoices() {
  return new Promise((resolve, reject) => {
    const synth = window.speechSynthesis;
    const id = setInterval(() => {
      voices = synth.getVoices();
      if (voices.length > 0) {
        clearInterval(id);
        resolve(voices);
      }
    }, 10);
    setTimeout(() => {
      if (voices.length === 0) reject('No voices loaded');
    }, 1000);
  });
}

function cancelSpeech() {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
}

fileInput.addEventListener('change', async function () {
  const file = fileInput.files[0];
  if (file) {
    const fileReader = new FileReader();
    fileReader.onload = async function () {
      const typedarray = new Uint8Array(this.result);
      const loadingTask = pdfjsLib.getDocument(typedarray);
      try {
        const pdf = await loadingTask.promise;
        let textContent = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          text.items.forEach(item => {
            textContent += item.str + ' ';
          });
        }
        textInput.value = textContent;
      } catch (error) {
        errorMessage.textContent = 'Error reading PDF.';
      }
    };
    fileReader.readAsArrayBuffer(file);
  }
});

maleVoiceButton.addEventListener('click', () => {
  selectedVoiceGender = 'male';
  updateVoiceSelection(maleVoiceButton, femaleVoiceButton);
});

femaleVoiceButton.addEventListener('click', () => {
  selectedVoiceGender = 'female';
  updateVoiceSelection(femaleVoiceButton, maleVoiceButton);
});

function updateVoiceSelection(selected, other) {
  selected.setAttribute('aria-pressed', 'true');
  other.setAttribute('aria-pressed', 'false');
  selected.style.backgroundColor = '#218838';
  other.style.backgroundColor = '#007bff';
}

decreaseSpeedButton.addEventListener('click', () => {
  if (speed > 0.5) {
    speed = Math.round((speed - 0.1) * 10) / 10;
    speedDisplay.textContent = `${speed}x`;
  }
});

increaseSpeedButton.addEventListener('click', () => {
  if (speed < 2.0) {
    speed = Math.round((speed + 0.1) * 10) / 10;
    speedDisplay.textContent = `${speed}x`;
  }
});

playButton.addEventListener('click', async () => {
  const text = textInput.value;
  if (!text) {
    errorMessage.textContent = 'Please upload a PDF.';
    return;
  }
  errorMessage.textContent = '';
  cancelSpeech();
  try {
    await loadVoices();
  } catch {
    errorMessage.textContent = 'Voices not loaded.';
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = speed;
  let selectedVoice = voices.find(v => selectedVoiceGender === 'male'
    ? v.name.toLowerCase().includes('male')
    : v.name.toLowerCase().includes('female'));
  if (!selectedVoice) selectedVoice = voices[0];
  utterance.voice = selectedVoice;
  window.speechSynthesis.speak(utterance);
});
