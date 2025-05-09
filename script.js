let gold = parseInt(localStorage.getItem('gold')) || 100;
let grandPrize = parseInt(localStorage.getItem('grandPrize')) || 0;

const goldDisplay = document.getElementById('gold');
const grandPrizeDisplay = document.getElementById('grand-prize');
const goldTimerDisplay = document.getElementById('gold-timer');
const result = document.getElementById('result');

const lever = document.getElementById('lever');
const slot1 = document.getElementById('slot1');
const slot2 = document.getElementById('slot2');
const slot3 = document.getElementById('slot3');

const symbols = ["🍒", "🍋", "🔔", "🍀", "💎", "7️⃣"];
const spinCost = 7;

// x3 match weights for a 3% match chance
const x3WeightedSymbols = [
  { symbol: "🍒", weight: 1.2 },
  { symbol: "🍋", weight: 0.7 },
  { symbol: "🔔", weight: 0.5 },
  { symbol: "🍀", weight: 0.3 },
  { symbol: "💎", weight: 0.2 },
  { symbol: "7️⃣", weight: 0.1 }
];

function getRandomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function chooseX3Symbol() {
  const totalWeight = x3WeightedSymbols.reduce((sum, item) => sum + item.weight, 0);
  let r = Math.random() * totalWeight;
  for (let item of x3WeightedSymbols) {
    if (r < item.weight) return item.symbol;
    r -= item.weight;
  }
  return "🍒"; // fallback
}

function updateGold(amount) {
  gold += amount;
  goldDisplay.textContent = gold;
  localStorage.setItem('gold', gold);
}

function updateGrandPrize(amount) {
  grandPrize += amount;
  grandPrizeDisplay.textContent = grandPrize;
  localStorage.setItem('grandPrize', grandPrize);
}

function updateDisplays() {
  goldDisplay.textContent = gold;
  grandPrizeDisplay.textContent = grandPrize;
}

function applyPassiveGold() {
  const now = Date.now();
  const lastCollected = parseInt(localStorage.getItem('lastGoldTime')) || now;
  const goldCap = 210;
  const hourlyGold = 30;
  const hourMs = 60 * 60 * 1000;

  const timePassed = now - lastCollected;
  const hoursPassed = Math.floor(timePassed / hourMs);
  const potentialGold = hoursPassed * hourlyGold;

  if (hoursPassed > 0 && gold < goldCap) {
    const goldToAdd = Math.min(potentialGold, goldCap - gold);
    updateGold(goldToAdd);
    localStorage.setItem('lastGoldTime', lastCollected + hoursPassed * hourMs);
  } else {
    localStorage.setItem('lastGoldTime', lastCollected);
  }
}

function updateGoldTimer() {
  const now = Date.now();
  const lastCollected = parseInt(localStorage.getItem('lastGoldTime')) || now;
  const msUntilNext = 60 * 60 * 1000 - (now - lastCollected) % (60 * 60 * 1000);

  const minutes = Math.floor(msUntilNext / 60000);
  const seconds = Math.floor((msUntilNext % 60000) / 1000);
  goldTimerDisplay.textContent = `Next +30 gold in: ${minutes}:${seconds.toString().padStart(2, '0')}`;
}

setInterval(() => {
  applyPassiveGold();
  updateGoldTimer();
}, 1000);

function animateReels(s1, s2, s3, callback) {
  const baseSpins = 30;
  let count1 = 0, count2 = 0;

  [slot1, slot2, slot3].forEach(el => el.classList.remove('fixed', 'slot-win'));

  const interval1 = setInterval(() => {
    slot1.textContent = getRandomSymbol();
    count1++;
    if (count1 >= baseSpins) {
      clearInterval(interval1);
      slot1.textContent = s1;
      slot1.classList.add('fixed');
    }
  }, 50);

  const interval2 = setInterval(() => {
    slot2.textContent = getRandomSymbol();
    count2++;
    if (count2 >= baseSpins + 8) {
      clearInterval(interval2);
      slot2.textContent = s2;
      slot2.classList.add('fixed');
    }
  }, 50);

  let steps = 45;
  let currentStep = 0;

  function spinStep() {
    if (currentStep >= steps) {
      slot3.textContent = s3;
      slot3.classList.add('fixed');
      setTimeout(() => {
        callback();
        highlightWins(s1, s2, s3);
      }, 200);
      return;
    }

    slot3.textContent = getRandomSymbol();
    currentStep++;

    const t = currentStep / steps;
    const delay = 50 + 150 * t * t;
    setTimeout(spinStep, delay);
  }

  if (s1 === s2) {
    spinStep();
  } else {
    let count3 = 0;
    const interval3 = setInterval(() => {
      slot3.textContent = getRandomSymbol();
      count3++;
      if (count3 >= baseSpins + 16) {
        clearInterval(interval3);
        slot3.textContent = s3;
        slot3.classList.add('fixed');
        setTimeout(() => {
          callback();
          highlightWins(s1, s2, s3);
        }, 200);
      }
    }, 50);
  }
}

function highlightWins(s1, s2, s3) {
  if (s1 === s2 && s2 === s3) {
    [slot1, slot2, slot3].forEach(el => el.classList.add('slot-win'));
  } else if (s1 === s2) {
    slot1.classList.add('slot-win');
    slot2.classList.add('slot-win');
  } else if (s2 === s3) {
    slot2.classList.add('slot-win');
    slot3.classList.add('slot-win');
  } else if (s1 === s3) {
    slot1.classList.add('slot-win');
    slot3.classList.add('slot-win');
  }
}

function spinSlots() {
  if (gold < spinCost) {
    alert("Not enough gold!");
    return;
  }

  updateGold(-spinCost);
  updateGrandPrize(5);
  result.textContent = "Spinning...";
  result.classList.remove('win');

  lever.style.transition = "transform 0.2s ease";
  lever.style.transform = "translateY(40px)";
  setTimeout(() => {
    lever.style.transition = "transform 0.3s cubic-bezier(0.25, 1.5, 0.5, 1)";
    lever.style.transform = "translateY(0)";
  }, 200);

  let s1, s2, s3;
  let winnings = 0;
  const isX3 = Math.random() < 0.03;
  let jackpotSymbol = null;

  if (isX3) {
    jackpotSymbol = chooseX3Symbol();
    s1 = s2 = s3 = jackpotSymbol;
  } else {
    s1 = getRandomSymbol();
    s2 = getRandomSymbol();
    s3 = getRandomSymbol();
  }

  animateReels(s1, s2, s3, () => {
    if (s1 === s2 && s2 === s3) {
      const symbol = s1;
      if (symbol === "7️⃣") {
        winnings = grandPrize;
        result.textContent = `🎉 JACKPOT! You won the GRAND PRIZE of ${winnings} gold!`;
        updateGold(winnings);
        grandPrize = 350;
        grandPrizeDisplay.textContent = grandPrize;
        localStorage.setItem('grandPrize', grandPrize);
      } else {
        switch (symbol) {
          case "🍒": winnings = 30; break;
          case "🍋": winnings = 50; break;
          case "🔔": winnings = 100; break;
          case "🍀": winnings = 150; break;
          case "💎": winnings = 300; break;
        }
        result.textContent = `🎉 You won ${winnings} gold!`;
        updateGold(winnings);
      }
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
      winnings = 5;
      result.textContent = `✨ You matched 2 symbols! +${winnings} gold`;
      updateGold(winnings);
    } else {
      result.textContent = "Try again!";
    }

    if (winnings > 0) {
      result.classList.add('win');
    } else {
      result.classList.remove('win');
    }
  });
}

lever.addEventListener('click', spinSlots);

// Init displays and apply offline passive income
applyPassiveGold();
updateDisplays();
updateGoldTimer();
