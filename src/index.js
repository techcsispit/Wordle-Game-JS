import { testDictionary, realDictionary } from './dictionary.js';

// for testing purposes, make sure to use the test dictionary
// console.log('test dictionary:', testDictionary);
// Get difficulty select element
const difficultySelect = document.getElementById('difficulty-select');
// Word arrays for different difficulties
import  easyWords  from './data/easy_words.js';
import  mediumWords  from './data/medium_words.js';
import  hardWords  from './data/hard_words.js';

// Load sounds
const winSound = new Audio('../assets/win.mp3');
const errorSound = new Audio('../assets/error.mp3');

// Play the win sound when the player wins
function playWinSound() {
  winSound.play();
}

// Play the error sound for incorrect guesses
function playErrorSound() {
  errorSound.play();
}

// Initialize global variable for dictionary (word list based on difficulty)
let dictionary = easyWords;
function setGameDifficulty() {
  const difficulty = difficultySelect.value; // Get selected difficulty level
  difficultySelect.disabled = true; // Disable the difficulty selector once chosen

  // Choose the correct word list based on the difficulty
  if (difficulty === 'easy') {
    dictionary = easyWords;
  } else if (difficulty === 'medium') {
    dictionary = mediumWords;
  } else if (difficulty === 'hard') {
    dictionary = hardWords;
  }

}

// Game state and other functions remain unchanged
let state = {
  secret: dictionary[Math.floor(Math.random() * dictionary.length)],
  grid: Array(6)
    .fill()
    .map(() => Array(5).fill('')),
  currentRow: 0,
  currentCol: 0,
};

console.log(state.secret)
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
  return easyWords.includes(word) || mediumWords.includes(word) || hardWords.includes(word);
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
    if (
      numOfOccurrencesGuess > numOfOccurrencesSecret &&
      letterPosition > numOfOccurrencesSecret
    ){
    box.classList.add('shake');
    }
    setTimeout(() => {
      if (
        numOfOccurrencesGuess > numOfOccurrencesSecret &&
        letterPosition > numOfOccurrencesSecret
      ) {
        playErrorSound(); 

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
            // Trigger confetti when the correct word is guessed
            playWinSound();  
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
      
      // alert('Congratulations!');
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
