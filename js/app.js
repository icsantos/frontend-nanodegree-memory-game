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
  'fas fa-bug',
  'fas fa-bullhorn',
  'fas fa-bullseye',
  'fas fa-camera',
  'fas fa-child',
  'fas fa-circle',
  'fas fa-cut',
  'fas fa-desktop',
  'fas fa-envelope',
  'fas fa-eye',
  'fas fa-flag',
  'fas fa-flask',
  'fas fa-gem',
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

// Game board container
const gameBoard = document.querySelector('.board');

// Container for number of attempts made
const attemptsMade = document.querySelector('.attempts');

// Array to hold info about the last two cards clicked
let cardsOpen = [];

// Counters for number of attempts to match a pair of cards
let countAttempts = 0;
let countMatches = 0;

/**
 * Generate a random integer between <tt>min</tt> and <tt>max</tt>
 * to use for selecting a card's face and color, and its placement
 * on the game board.
 * @param {number} min - The lower bound.
 * @param {number} max - The upper bound.
 * @returns {number}
 */
function randomInteger(min, max) {
  'use strict';
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Shuffles the contents of a one-dimensional array
 * Source: comment by BetonMAN on Nov 29, 2017
 * in https://gist.github.com/guilhermepontes/17ae0cc71fa2b13ea8c20c94c5c35dc4
 * @param {array} sourceArray
 * @returns {array}
 */
function shuffleArray(sourceArray) {
  'use strict';
  return sourceArray.map((a) => [Math.random(),a]).sort((a,b) => a[0]-b[0]).map((a) => a[1]);
}

/**
 * Generate an array of objects containing the classes representing
 * the card faces and colors to use in the current game
 * @returns {string[]}
 */
function selectCards() {
  'use strict';
  let shuffledCards = shuffleArray(cardFaces);
  let cards = [], card;

  for (let i = 0; i < cardPairs.value; i++) {
    card = {
      style: shuffledCards[i].split(' ')[0],
      icon: shuffledCards[i].split(' ')[1],
      color: cardColors[randomInteger(0, cardColors.length - 1)],
      pairNumber: i
    };
    cards.push(card); // 1st card of the pair
    cards.push(card); // 2nd card of the pair
  }
  return shuffleArray(shuffleArray(cards));
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

function resetCounts() {
  countAttempts = 0;
  countMatches = 0;
  attemptsMade.textContent = countAttempts;
}

/**
 * if the card face is hidden, show it
 * if it's visible, hide it
 */
function toggleCard(card) {
  'use strict';
  card.classList.toggle('open');
  card.firstChild.classList.toggle('hide');
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

function removeCard(card) {
  'use strict';
  card.classList.add('hide');
  card.classList.remove('open');
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
      cardsOpen.forEach(function(card) {
        setTimeout(removeCard, 500, card);
      });
      countMatches++;
    } else {
      cardsOpen.forEach(function(card) {
        setTimeout(hideCardFace, 500, card);
      });
    }

    cardsOpen = [];
    attemptsMade.textContent = ++countAttempts;
  }
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

  saveCard(card);
  if (cardsOpen.length <= 2) {
    showCardFace(card);
    compareCards();
  }
}

/**
 * When number of card pairs is submitted by the user, call makeGameBoard()
 */
document.querySelector('#sizePicker').addEventListener('submit', function (evt) {
  evt.preventDefault();
  resetCounts()
  makeGameBoard();
});
