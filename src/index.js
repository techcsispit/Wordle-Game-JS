import { testDictionary, realDictionary } from './dictionary.js';

// for testing purposes, make sure to use the test dictionary
// console.log('test dictionary:', testDictionary);
// Get difficulty select element
const difficultySelect = document.getElementById('difficulty-select');
// Word arrays for different difficulties
let easyWords = [];
let mediumWords = [];
let hardWords = [];

// Function to load and convert CSV into an array
function loadCSVToArray(filePath, callback) {
  fetch(filePath)
    .then(response => response.text()) // Get the file content as text
    .then(data => {
      const wordArray = data.trim().split('\n').map(word => word.trim()); // Split by new lines and trim spaces
      callback(wordArray); // Pass the array to the callback function
    })
    .catch(error => console.error('Error loading CSV:', error));
}




function setGameDifficulty() {
  const difficulty = difficultySelect.value; // Get selected difficulty level

  difficultySelect.disabled = true; // Disable the difficulty selector once chosen

  if (difficulty === 'easy') {
    // Load words from easy.csv
    loadCSVToArray('./data/easy_words.csv', (words) => {
      easyWords = words;
      startGame(easyWords);
    });
  } else if (difficulty === 'medium') {
    // Load words from medium.csv
    loadCSVToArray('./data/medium_words.csv', (words) => {
      mediumWords = words;
      startGame(mediumWords);
    });
  } else if (difficulty === 'hard') {
    // Load words from hard.csv
    loadCSVFile('.data/hard_words.csv', (words) => {
      hardWords = words;
      startGame(hardWords);
    });
  }
}
// Attach event listener to trigger when difficulty is selected
difficultySelect.addEventListener('change', setGameDifficulty);


// Function to start the game once words are loaded
function startGame(wordList) {
  const dictionary = wordList;
  state.secret = dictionary[Math.floor(Math.random() * dictionary.length)];
  drawGrid(document.getElementById('game'));
  registerKeyboardEvents();
}





const dictionary = realDictionary;
// Game state and other functions remain unchanged
const state = {
  secret: '', // This will be set once we load the word list based on difficulty
  grid: Array(6)
    .fill()
    .map(() => Array(5).fill('')),
  currentRow: 0,
  currentCol: 0,
};

function drawGrid(container) {
  const grid = document.createElement('div');
  grid.className = 'grid';

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 5; j++) {
      drawBox(grid, i, j);
    }
  }

  container.appendChild(grid);
}

function updateGrid() {
  for (let i = 0; i < state.grid.length; i++) {
    for (let j = 0; j < state.grid[i].length; j++) {
      const box = document.getElementById(`box${i}${j}`);
      box.textContent = state.grid[i][j];
    }
  }
}

function drawBox(container, row, col, letter = '') {
  const box = document.createElement('div');
  box.className = 'box';
  box.textContent = letter;
  box.id = `box${row}${col}`;

  container.appendChild(box);
  return box;
}

function registerKeyboardEvents() {
  document.body.onkeydown = (e) => {
    const key = e.key;
    if (key === 'Enter') {
      if (state.currentCol === 5) {
        const word = getCurrentWord();
        if (isWordValid(word)) {
          revealWord(word);
          state.currentRow++;
          state.currentCol = 0;
        } else {
          alert('Not a valid word.');
        }
      }
    }
    if (key === 'Backspace') {
      removeLetter();
    }
    if (isLetter(key)) {
      addLetter(key);
    }

    updateGrid();
  };
}

function getCurrentWord() {
  return state.grid[state.currentRow].reduce((prev, curr) => prev + curr);
}

function isWordValid(word) {
  return dictionary.includes(word);
}

function getNumOfOccurrencesInWord(word, letter) {
  let result = 0;
  for (let i = 0; i < word.length; i++) {
    if (word[i] === letter) {
      result++;
    }
  }
  return result;
}

function getPositionOfOccurrence(word, letter, position) {
  let result = 0;
  for (let i = 0; i <= position; i++) {
    if (word[i] === letter) {
      result++;
    }
  }
  return result;
}

function revealWord(guess) {
  const row = state.currentRow;
  const animation_duration = 500; // ms

  for (let i = 0; i < 5; i++) {
    const box = document.getElementById(`box${row}${i}`);
    const letter = box.textContent;
    const numOfOccurrencesSecret = getNumOfOccurrencesInWord(
      state.secret,
      letter
    );
    const numOfOccurrencesGuess = getNumOfOccurrencesInWord(guess, letter);
    const letterPosition = getPositionOfOccurrence(guess, letter, i);

    setTimeout(() => {
      if (
        numOfOccurrencesGuess > numOfOccurrencesSecret &&
        letterPosition > numOfOccurrencesSecret
      ) {
        box.classList.add('empty');
      } else {
        if (letter === state.secret[i]) {
          box.classList.add('right');
        } else if (state.secret.includes(letter)) {
          box.classList.add('wrong');
        } else {
          box.classList.add('empty');
        }
      }
    }, ((i + 1) * animation_duration) / 2);

    box.classList.add('animated');
    box.style.animationDelay = `${(i * animation_duration) / 2}ms`;
  }

  const isWinner = state.secret === guess;
  const isGameOver = state.currentRow === 5;

  setTimeout(() => {
    if (isWinner) {
      alert('Congratulations!');
    } else if (isGameOver) {
      alert(`Better luck next time! The word was ${state.secret}.`);
    }
  }, 3 * animation_duration);
}

function isLetter(key) {
  return key.length === 1 && key.match(/[a-z]/i);
}

function addLetter(letter) {
  if (state.currentCol === 5) return;
  state.grid[state.currentRow][state.currentCol] = letter;
  state.currentCol++;
}

function removeLetter() {
  if (state.currentCol === 0) return;
  state.grid[state.currentRow][state.currentCol - 1] = '';
  state.currentCol--;
}

function startup() {
  const game = document.getElementById('game');
  drawGrid(game);

  registerKeyboardEvents();
}

startup();
