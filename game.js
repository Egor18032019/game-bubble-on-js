'use strict';
/**
 * Забрать topScore:"Лучший результат " из хранилища localStorage
 */
function loadTopScore() {
  if (!localStorage) return 0;
  // из localStorage браузера забираем данные
  const score = localStorage.getItem('topScore');
  return score ? score : 0;
}
/**
 * Записать topScore:"Лучший результат " в хранилище localStorage
 */
function saveTopScore(score) {
  if (!localStorage) return;
  // в localStorage браузера записываем данные
  localStorage.setItem('topScore', score);
}

/**
 * Вернет случайное число в заданом интервале включая минимальное и максимальное значение
 * @param {*} from 
 * @param {*} to 
 */
const getRandomInRange = (from, to) => {
  return Math.floor((to - from + 1) * Math.random()) + from;
}

/**
 * возвращает случайный элемент из массива
 * @param {*} list массив 
 */
const randomItem = function (list) {
  const next = list[getRandomInRange(0, list.length - 1)];
  // следующая проверка проверяет что предыдущий элемент не равен новому. Что бы шарики не подряд шли 
  if (randomItem.prev && randomItem.prev === next) {
    return randomItem(list);
  }
  randomItem.prev = next;
  return next;
}

/**
 * Функция показа которая добавляет класс up и если был `boom` то убирает класс boom 
 * @param {className} field 
 */
function show(field) {
  field.classList.remove('boom');

  let classNameArray = [`up`, `down`,`skew`] // по очереди вставляет то дракона то шарик
  let classForBubble = randomItem(classNameArray)
  field.classList.add(classForBubble);
}
/**
 * функция скрытия котороая убирает класс up
 */
function hide(field) {
  field.classList.remove('up');
  field.classList.remove('down');
  field.classList.remove('skew');
  let mov = document.querySelector(`.field`);
  mov.removeChild(mov.lastChild);
}

/**
 * Преобразования времени
 * @param {*} time 
 * @returns {string} время в строке
 */
function timeToString(time) {
  const MSECONDS_IN_SEC = 1000;
  const MSECONDS_IN_MIN = 60 * MSECONDS_IN_SEC;

  let min = Math.floor(time / MSECONDS_IN_MIN);
  let sec = Math.floor((time % MSECONDS_IN_MIN) / MSECONDS_IN_SEC);
  let msec = (time % MSECONDS_IN_MIN) % MSECONDS_IN_SEC;
  let spacer = msec > 500 ? ':' : '&nbsp;';
  return [min, sec]
    .map(number => number >= 10 ? number : `0${number}`)
    .join(spacer);
}

/**
 * Переписывает таймер в зависимоси от значения заранее обьявленной startedAt
 */
function updateTimer() {
  if (!isStarted) {
    return null;
  }
  let timeout = GAME_TIMEOUT - (Date.now() - startedAt);
  if (timeout < 0) {
    timeout = 0;
  }
  timer.innerHTML = timeToString(timeout);
}

/**
 * Функция для апдейта счета
 * @param {*} points кол-во сбитых шариков
 */
function updateScoreboard(points) {
  scoreboard.dataset.points = points;
  bestScore.dataset.points = topScore;
}

/**
 * функция нажатия на шарик
 */
function handleClick() {
  const field = this.parentElement;
  //  field.timeout - добавляем в функции next. счетчик сколько будет показываться шарик
  if (!field.timeout) {
    return;
  }
  clearTimeout(field.timeout);
  field.classList.add('boom'); // добавляем класс чтобы изменить картинку на взрыв
  setTimeout(
    () => {
      hide(field);
      points = points + 1;
      updateScoreboard(points);
    }, 500); // задержка выполнения нужна чтобы при взрыве шарик в верху завис и была анимация взрыва

}
// генерация следующего шарика
function next() {
  let foo = document.createElement("div");
  foo.className="test";
  let mov = document.querySelector(`.field`);
  mov.appendChild(foo);
  const field = randomItem(fields);
  show(field);
  field.timeout = setTimeout(i => {
    hide(field);
  }, getRandomInRange(1200, 3000));
}
/**
 * Фунция которая будет через рандомный промежуток времени проверять идет игра и если идет то вызывает функицю которая 
 * генерирует следующий шарик
 */
const tic = () => {
  setTimeout(
    () => {
      if (isStarted) {
        next();
        tic();
      } else {
        startButton.style.display = 'initial';
        topScore = Math.max(points, topScore);
        saveTopScore(topScore);
        updateScoreboard(points);
        clearInterval(timerInterval); // сбрасваем значение таймера
      }
    },
    getRandomInRange(500, 2500)
  );
}

function start() {
  points = 0;
  startedAt = Date.now();
  // вызывам и передаём ноль
  updateScoreboard(points);
  // убираем кнопку
  startButton.style.display = 'none';
  // переключаем флаг на то что игра началась
  isStarted = true;
  // запускаем таймер который переключит флаг в false  через заданый промежуток времени
  setTimeout(() => isStarted = false, GAME_TIMEOUT);
  // Запускаем функию которая через заданный интревал времени будет запускать перерисовку таймера
  timerInterval = setInterval(updateTimer, 500);
  tic();
}

/**
 * время игры
 */
const GAME_TIMEOUT = 20000;
/**
 * флаг для обозначения начало игры
 */
let isStarted = false;
/**
 * время начало игры
 */
let startedAt;
let timeout = false
let timerInterval = false
// Лучший результат который будет лежать в localStorage
let topScore = loadTopScore();
let points = 0;
/**
 * псевдомассив полей по которым двигаеться шарик. div c классом field
 */
const fields = document.getElementsByClassName('field'); //нужна именно живая колекция
const bubbles = document.getElementsByClassName('bubble');
const drakes = document.getElementsByClassName('drake');
const airplanes = document.getElementsByClassName('airplane');
const scoreboard = document.getElementById('currentScorePlayer');
const bestScore = document.getElementById('topScoreBoard');
const startButton = document.querySelector('.startButton');
/**
 * html элемент куда записываем время
 */
const timer = document.querySelector('.timer');
Array.from(bubbles).forEach(bubble => bubble.addEventListener('click', handleClick));
Array.from(drakes).forEach(drake => drake.addEventListener('click', handleClick));
Array.from(airplanes).forEach(airplane => airplane.addEventListener('click', handleClick));
startButton.addEventListener('click', start);

updateScoreboard(points);