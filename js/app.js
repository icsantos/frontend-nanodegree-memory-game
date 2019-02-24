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
 * @param {{timeHr: number, timeMin: number, timeSec: number}} time Object containing the time elapsed
 * @returns {number} Number of seconds elapsed
 */
function timeToSeconds(time) {
  return time.timeHr * 60 + time.timeMin * 60 + time.timeSec;
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
  'use strict';
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Shuffles the contents of a one-dimensional array
 *
 * [Source: comment by BetonMAN on Nov 29, 2017]{@link https://gist.github.com/guilhermepontes/17ae0cc71fa2b13ea8c20c94c5c35dc4}
 * @param {array} sourceArray A one-dimensional array
 * @returns {array} The shuffled array
 */
function shuffleArray(sourceArray) {
  'use strict';
  return sourceArray.map((a) => [Math.random(),a]).sort((a,b) => a[0]-b[0]).map((a) => a[1]);
}

/**
 * Selects the cards to use in the current game
 * @returns {string[]} An array of objects.  Each object contains the CSS
 * classes that represent the card faces and colors to use in the current game.
 */
function selectCards() {
  'use strict';
  let shuffledCards = shuffleArray(cardFaces);
  let cards = [], card;

  for (let i = 0; i < cardPairsValue; i++) {
    card = {
      style: shuffledCards[i].split(' ')[0],
      icon: shuffledCards[i].split(' ')[1],
      color: cardColors[randomInteger(0, cardColors.length - 1)],
      pairNumber: i
    };
    cards.push(card); // 1st card of the pair
    cards.push(card); // 2nd card of the pair
  }
  return shuffleArray(shuffleArray(shuffleArray(cards)));
}

// Array to hold player's best stats for each 'number of pairs'
let playerBest = [];
let playerBestUpdated = false;

playerBest.init = function() {
  'use strict';
  const minPairs = Number(cardPairs.min);
  const maxPairs = Number(cardPairs.max);
  for (let i = minPairs; i <= maxPairs; i++) {
    playerBest[i] = {
      moves: 1000,
      stars: 0,
      timeHr: 1000,
      timeMin: 1000,
      timeSec: 1000,
      gamesPlayed: 0
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
    bestForPairs.timeHr = currentGame.timeHr;
    bestForPairs.timeMin = currentGame.timeMin;
    bestForPairs.timeSec = currentGame.timeSec;
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
    if (timeToSeconds(bestForPairs) > timeToSeconds(currentGame)) {
      bestForPairs.timeHr = currentGame.timeHr;
      bestForPairs.timeMin = currentGame.timeMin;
      bestForPairs.timeSec = currentGame.timeSec;
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
  showTime(bestScore, bestForPairs);
};

// Object to hold current game stats
let currentGame = {};

currentGame.init = function() {
  'use strict';
  currentGame.moves = 0;
  currentGame.stars = 3;
  currentGame.timeHr = 0;
  currentGame.timeMin = 0;
  currentGame.timeSec = 0;
  currentGame.matches = 0;
};

currentGame.updStars = function() {
  'use strict';
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
  const timeHr = (time.timeHr > 9 ? time.timeHr : "0" + time.timeHr);
  if (clockHr.textContent !== timeHr) {
    clockHr.textContent = timeHr;
  }

  const clockMin = clock.querySelector('.clock-minutes');
  const timeMin = (time.timeMin > 9 ? time.timeMin : "0" + time.timeMin);
  if (clockMin.textContent !== timeMin) {
    clockMin.textContent = timeMin;
  }

  const clockSec = clock.querySelector('.clock-seconds');
  const timeSec = (time.timeSec > 9 ? time.timeSec : "0" + time.timeSec);
  if (clockSec.textContent !== timeSec) {
    clockSec.textContent = timeSec;
  }
}

function timerTick() {
  currentGame.timeSec++;
  if (currentGame.timeSec >= 60) {
      currentGame.timeSec = 0;
      currentGame.timeMin++;
      if (currentGame.timeMin >= 60) {
          currentGame.timeMin = 0;
          currentGame.timeHr++;
      }
  }
  showTime(gameScore, currentGame);
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
  showTime(gameScore, currentGame);
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
  resetGame()
  makeGameBoard();
});

modalCloseBtn.addEventListener('click', toggleModal);
window.addEventListener('click', windowOnClick);

playerBest.init();
currentGame.init();
