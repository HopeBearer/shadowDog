let deletedPlayer = null;
//store
export function store(name, score) {
  if (localStorage.getItem("rankLists") === null) {
    /*
     * first store
     * create array store score
     */
    const rankLists = [{ name, score }];
    localStorage.setItem("rankLists", JSON.stringify(rankLists));
  } else {
    /*
     * after store
     * get localStorage core
     * push score to array
     * reset localStorage array
     *
     */
    const rankLists = JSON.parse(localStorage.getItem("rankLists"));
    rankLists.push({ name, score });
    // [{name:111,score:2},{name:asdjlwa,score:1}]
    if (rankLists.length > 50) {
      rankLists.sort((a, b) => b.score - a.score);
      deletedPlayer = rankLists.pop();
    }
    localStorage.setItem("rankLists", JSON.stringify(rankLists));
  }
}

export function rankListsSort() {
  const rankLists = JSON.parse(localStorage.getItem("rankLists"));
  try {
    return rankLists.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.log("LocalStorage is null");
  }
}

export function showRankLists(rankLists) {
  const tbody = document.querySelector("tbody");
  try {
    const newArr = rankLists.map((record, index) => {
      return `<tr class="${judgeClass(index)}">
      <td class='ranking'>${index + 1}</td>
      <td>${record.name}</td>
      <td>${record.score}</td>
      </tr>`;
    });
    tbody.innerHTML = newArr.join("");
  } catch (error) {
    tbody.innerHTML = `<div class="empty">空</div>`;
  }
}

function judgeClass(index) {
  if (index === 0) {
    return "champion";
  } else if (index === 1) {
    return "runner_up";
  } else if (index === 2) {
    return "third_place";
  } else {
    return "";
  }
}

const playerNames = new Set();
export function getRandomName() {
  if (localStorage.getItem("rankLists") === null) {
    playerNames.clear();
    console.log(playerNames);
  }
  let newName = "player";
  do {
    newName += Math.floor(Math.random() * 1000 + 1);
  } while (playerNames.has(newName));
  playerNames.add(newName);
  console.log(playerNames);
  return newName;
}
