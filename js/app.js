/**
 * Card 'faces' using icons from https://fontawesome.com
 * @const {string[]}
 * @requires https://use.fontawesome.com/releases/v5.0.4/js/all.js
 */
const cardFaces = [
  'fas fa-anchor',
  'fas fa-asterisk',
  'fas fa-balance-scale',
  'fas fa-bell',
  'fas fa-bicycle',
  'fas fa-birthday-cake',
  'fas fa-bug',
  'fas fa-bullhorn',
  'fas fa-camera',
  'fas fa-child',
  'fas fa-cut',
  'fas fa-desktop',
  'fas fa-envelope',
  'fas fa-eye',
  'fas fa-flag',
  'fas fa-flask',
  'fas fa-gem',
  'fas fa-gift',
  'fas fa-heart',
  'fas fa-home',
  'fas fa-key',
  'fas fa-leaf',
  'fas fa-lightbulb',
  'fas fa-microphone',
  'fas fa-music',
  'fas fa-paperclip',
  'fas fa-paw',
  'fas fa-plane',
  'fas fa-rocket',
  'fas fa-search',
  'fas fa-shopping-cart',
  'fas fa-smile',
  'fas fa-snowflake',
  'fas fa-sun',
  'fas fa-tag',
  'fas fa-thumbtack',
  'fas fa-tree',
  'fas fa-trophy',
  'fas fa-umbrella',
  'fas fa-utensils'
];

/**
 * Colors for the card faces
 * @const {string[]}
 */
const cardColors = [
  'color1',
  'color2',
  'color3',
  'color4'
];

/*
   Constants
*/
const MIN_PER_HR = 60;
const SEC_PER_MIN = 60;

// Input for how many pairs of cards
const cardPairs = document.querySelector('#cardPairs');
let cardPairsValue = Number(cardPairs.value);

// Game board container
const gameBoard = document.querySelector('.board');

// Current game statistics
const gameScore = document.querySelector('.game');

gameScore.moves = gameScore.querySelector('.moves');

// Player best statistics
const bestScore = document.querySelector('.best');

bestScore.stats = bestScore.querySelector('.stats');
bestScore.moves = bestScore.querySelector('.moves');

// Modal window after completion of game
const modal = document.querySelector('.modal');
const modalCloseBtn = document.querySelector('.close-button');

// Array to hold info about the last two cards clicked
let cardsOpen = [];

// Variable to hold game timer
let gameTimer;
let timerStarted = false;

/*
   Utility functions
*/

/**
 * Converts time in hours, minutes and seconds to seconds
 * @param {{hours: number, minutes: number, seconds: number}} time Object containing the time elapsed
 * @returns {number} Number of seconds elapsed
 */
function timeToSeconds(time) {
  const hrsToSeconds = time.hours * MIN_PER_HR * SEC_PER_MIN;
  const minToSeconds = time.minutes * SEC_PER_MIN;

  return hrsToSeconds + minToSeconds + time.seconds;
}

/**
 * Generate a random integer to use for
 * selecting a card's face and color, and its placement
 * on the game board.
 * @param {number} min The lower boundary
 * @param {number} max The upper boundary
 * @returns {number} An integer within the specified boundaries
 */
function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Shuffles the contents of a one-dimensional array
 * - Turn each element into an array [random number, element]
 * - sort by the random number
 * - return the original element
 *
 * Example
 * - array: ```['a', 'b', 'c']```
 * - 1st map: ```[[0.444, 'a'], [0.856, 'b'], [0.203, 'c']]```
 * - sort: ```[[0.203, 'c'], [0.444, 'a'], [0.856, 'b']]```
 * - 2nd map: ```['c', 'a', 'b']```
 *
 * [Source: Shuffle Array - JavaScript ES2015, ES6]{@link https://gist.github.com/guilhermepontes/17ae0cc71fa2b13ea8c20c94c5c35dc4}
 * @param {array} sourceArray A one-dimensional array
 * @returns {array} The shuffled array
 */
function shuffleArray(sourceArray) {
  return sourceArray
    .map((el) => [Math.random(), el])
    .sort((r1, r2) => r1[0] - r2[0])
    .map((el) => el[1]);
}

/**
 * Selects the cards to use in the current game
 * @returns {string[]} An array of objects.  Each object contains the CSS
 * classes that represent the card faces and colors to use in the current game.
 */
function selectCards() {
  const shuffledCards = shuffleArray(cardFaces);
  const cards = [];

  for (let idx = 0; idx < cardPairsValue; idx++) {
    const card = {
      'style': shuffledCards[idx].split(' ')[0],
      'icon': shuffledCards[idx].split(' ')[1],
      'color': cardColors[randomInteger(0, cardColors.length - 1)],
      'pairNumber': idx
    };

    // Add 1st card of the pair
    cards.push(card);

    // Add 2nd card of the pair
    cards.push(card);
  }

  return shuffleArray(shuffleArray(shuffleArray(cards)));
}

/**
 * Object to hold current game statistics
 */
const currentGame = {};

/** Initializes the current game statistics to their default values
 *  @returns {undefined} No return value
*/
currentGame.init = function() {
  currentGame.moves = 0;
  currentGame.stars = 3;
  currentGame.time = {
    'hours': 0,
    'minutes': 0,
    'seconds': 0
  };
  currentGame.matches = 0;
};

/** Update the number of stars earned during the current game
 *  @returns {undefined} No return value
*/
currentGame.updStars = function() {
  const degreeOfDifficulty = Math.ceil(cardPairsValue / 10);
  const rate = (currentGame.moves / cardPairsValue) / degreeOfDifficulty;

  if (rate <= 1.75) {
    currentGame.stars = 3;
  } else if (rate <= 2.50) {
    currentGame.stars = 2;
  } else {
    currentGame.stars = 1;
  }
};

/** Updates the time elapsed during the current game
 *  @returns {undefined} No return value
*/
currentGame.updTime = function() {
  currentGame.time.seconds++;
  if (currentGame.time.seconds >= 60) {
      currentGame.time.seconds = 0;
      currentGame.time.minutes++;
      if (currentGame.time.minutes >= 60) {
          currentGame.time.minutes = 0;
          currentGame.time.hours++;
      }
  }
};

// Array to hold player's best stats for each 'number of pairs'
let playerBest = [];
let playerBestUpdated = false;

playerBest.init = function() {
  'use strict';
  const minPairs = Number(cardPairs.min);
  const maxPairs = Number(cardPairs.max);
  for (let i = minPairs; i <= maxPairs; i++) {
    playerBest[i] = {
      'moves': 1000,
      'stars': 0,
      'time': {
          'hours': 1000,
          'minutes': 1000,
          'seconds': 1000
        },
      'gamesPlayed': 0
    };
  }
};

playerBest.update = function() {
  'use strict';
  let bestForPairs = playerBest[cardPairsValue];
  playerBestUpdated = false;

  if (bestForPairs.gamesPlayed === 0) {
    bestForPairs.moves = currentGame.moves;
    bestForPairs.stars = currentGame.stars;
    bestForPairs.time.hours = currentGame.time.hours;
    bestForPairs.time.minutes = currentGame.time.minutes;
    bestForPairs.time.seconds = currentGame.time.seconds;
    playerBestUpdated = true;
  } else {
    if (bestForPairs.moves > currentGame.moves) {
      bestForPairs.moves = currentGame.moves;
      playerBestUpdated = true;
    }
    if (bestForPairs.stars < currentGame.stars) {
      bestForPairs.stars = currentGame.stars;
      playerBestUpdated = true;
    }
    if (timeToSeconds(bestForPairs.time) > timeToSeconds(currentGame.time)) {
      bestForPairs.time.hours = currentGame.time.hours;
      bestForPairs.time.minutes = currentGame.time.minutes;
      bestForPairs.time.seconds = currentGame.time.seconds;
      playerBestUpdated = true;
    }
  }
  bestForPairs.gamesPlayed++;
};

playerBest.display = function() {
  'use strict';
  let bestForPairs = playerBest[cardPairsValue];
  if (bestForPairs.gamesPlayed === 0) {
    bestScore.stats.classList.add('hide');
  } else {
    bestScore.moves.textContent = bestForPairs.moves;
    showStars(bestScore, bestForPairs.stars);
    bestScore.stats.classList.remove('hide');
  }
  showTime(bestScore, bestForPairs.time);
};

function showStars(node, count) {
  const stars = node.querySelector('.stars').querySelectorAll('li');
  for (let i = 0; i < count; i++) {
    stars[i].classList.remove('hide');
  }
  for (let i = count; i < stars.length; i++) {
    stars[i].classList.add('hide');
  }
}

function showTime(node, time) {
  const clock = node.querySelector('.clock');

  const clockHr = clock.querySelector('.clock-hours');
  const timeHr = (time.hours > 9 ? time.hours : "0" + time.hours);
  if (clockHr.textContent !== timeHr) {
    clockHr.textContent = timeHr;
  }

  const clockMin = clock.querySelector('.clock-minutes');
  const timeMin = (time.minutes > 9 ? time.minutes : "0" + time.minutes);
  if (clockMin.textContent !== timeMin) {
    clockMin.textContent = timeMin;
  }

  const clockSec = clock.querySelector('.clock-seconds');
  const timeSec = (time.seconds > 9 ? time.seconds : "0" + time.seconds);
  if (clockSec.textContent !== timeSec) {
    clockSec.textContent = timeSec;
  }
}

function timerTick() {
  currentGame.updTime();
  showTime(gameScore, currentGame.time);
  startTimer();
}

function startTimer() {
  timerStarted = true;
  gameTimer = setTimeout(timerTick, 1000);
}

function stopTimer() {
  timerStarted = false;
  clearTimeout(gameTimer);
}

/**
 * Set up the game board
 */
function makeGameBoard() {
  'use strict';
  let cards = selectCards();
  let liElem, spanElem;

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < cards.length; i++) {
    spanElem = document.createElement('span');
    spanElem.classList.add('hide', cards[i].style, cards[i].icon);

    liElem = document.createElement('li');
    liElem.classList.add('card', cards[i].color);
    liElem.dataset.pairNumber = cards[i].pairNumber;
    liElem.dataset.index = i;
    liElem.appendChild(spanElem);

    fragment.appendChild(liElem);
  }

  // remove existing cards then add the new cards
  gameBoard.innerHTML = '';
  gameBoard.appendChild(fragment);
  gameBoard.addEventListener('click', cardClicked);
}

function resetGame() {
  currentGame.init();
  gameScore.moves.textContent = currentGame.moves;
  showStars(gameScore, 3);
  showTime(gameScore, currentGame.time);
  playerBest.display();
}

/**
 * if the card face is hidden, show it
 * if it's visible, hide it
 */
function showCard(card) {
  'use strict';
  card.classList.add('open');
  card.classList.remove('hide');
}

function removeCard(card) {
  'use strict';
  card.classList.add('hide');
  card.classList.remove('open');
}

function showCardFace(card) {
  'use strict';
  card.classList.add('open');
  card.firstChild.classList.remove('hide');
}

function hideCardFace(card) {
  'use strict';
  card.classList.remove('open');
  card.firstChild.classList.add('hide');
}

function addSpin(card) {
  card.classList.add('fa-spin');
}

function stopSpin(card) {
  card.classList.remove('fa-spin');
}

/**
 * Save the two cards opened during this turn
 */
function saveCard(card) {
  'use strict';
  if (cardsOpen.length < 2) {
    cardsOpen.push(card);
  }
}

/**
 * Compare the two cards opened during this turn.
 * Consider it a successful match if two cards were opened (the player didn't
 * just click on the same card twice) and the faces on the two cards match
 */
function compareCards() {
  'use strict';
  if (cardsOpen.length === 2) {

    if (cardsOpen[0].dataset.index !== cardsOpen[1].dataset.index &&
        cardsOpen[0].dataset.pairNumber === cardsOpen[1].dataset.pairNumber) {
      if (++currentGame.matches !== cardPairsValue) {
        cardsOpen.forEach(function(card) {
          setTimeout(removeCard, 500, card);
        });
      }
    } else {
      cardsOpen.forEach(function(card) {
        setTimeout(hideCardFace, 500, card);
      });
    }

    // increment moves only if the two cards are different
    if (cardsOpen[0].dataset.index !== cardsOpen[1].dataset.index) {
      gameScore.moves.textContent = ++currentGame.moves;
    }
    cardsOpen = [];
  }
}

/**
 * user has found all pairs
 */
function toggleModal() {
  'use strict';
  modal.classList.toggle('hide');
}

function celebrate() {
  'use strict';
  const cards = document.querySelectorAll('li.card');
  for (let card of cards) {
    addSpin(card);
    showCard(card);
    setTimeout(stopSpin, 4000, card);
  }
}

function congratulate() {
  'use strict';
  const time = gameScore.querySelector('.clock').innerText;
  const newBest = playerBestUpdated ? ' You achieved a new best!' : '';
  const heading = playerBestUpdated ? 'Congratulations!' : 'Bravo!';
  const message = `A ${currentGame.stars}-star accomplishment with a time of ${time}!${newBest}`;

  document.querySelector('.modal-heading').textContent = heading;
  document.querySelector('.modal-message').textContent = message;
  toggleModal();
}

/**
 * user has clicked on a card
 */
function cardClicked(evt) {
  'use strict';
  let card;
  const node = evt.target;

  // Font Awesome 5 changes the <li><span></span></li> to
  // an <li><svg><path></path></svg></li>
  // so we need to test what the user actually clicked on
  switch (node.nodeName.toLowerCase()) {
    case 'li':
      card = node;
      break;
    case 'svg':
      card = node.parentNode;
      break;
    case 'path':
      card = node.parentNode.parentNode;
  }

  // Did not click inside an <li> so do nothing
  if (!card) return;

  if (timerStarted === false) {
    startTimer();
  }

  saveCard(card);
  if (cardsOpen.length <= 2) {
    showCardFace(card);
    compareCards();
    currentGame.updStars();
    showStars(gameScore, currentGame.stars);
    if (currentGame.matches === cardPairsValue) {
      gameBoard.removeEventListener('click', cardClicked);
      stopTimer();
      playerBest.update();
      playerBest.display();
      celebrate();
      congratulate();
    }
  }
}

function windowOnClick(evt) {
  'use strict';
  if (evt.target === modal) {
    toggleModal();
  }
}

/**
 * When number of card pairs is submitted by the user, call makeGameBoard()
 */
document.querySelector('#sizePicker').addEventListener('submit', function (evt) {
  evt.preventDefault();
  cardPairsValue = Number(cardPairs.value);
  resetGame();
  makeGameBoard();
});

modalCloseBtn.addEventListener('click', toggleModal);
window.addEventListener('click', windowOnClick);

currentGame.init();
playerBest.init();
