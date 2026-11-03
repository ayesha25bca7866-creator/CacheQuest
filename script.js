
let performanceChart = null;

function runSimulation(selectedType = null, showResults = true) {
  const type = selectedType || document.getElementById("mappingType").value;
  const policy = document.getElementById("replacementPolicy")?.value || "fifo";
  const input = document.getElementById("blocks").value.trim();

  if (!input) {
    if (showResults) {
      document.getElementById("results").textContent =
        "Please enter memory block IDs.";
    }
    return null;
  }

  const blocks = input.split(",").map(x => x.trim());

  if (blocks.some(x => !/^\d+$/.test(x))) {
    if (showResults) {
      document.getElementById("results").textContent =
        "Please enter valid whole-number block IDs separated by commas.";
    }
    return null;
  }

  const cache = Array(4).fill(null);
  const loadOrder = [[], []];
  const lastUsed = [[], []];

  let hits = 0;
  let misses = 0;
  const history = [];

  blocks.forEach((blockText, index) => {
    const block = Number(blockText);
    let hit = false;
    let line = -1;
    let set = 0;

    if (type === "direct") {
      line = block % 4;
      hit = cache[line] === block;

      if (!hit) cache[line] = block;

    } else {
      if (type === "set") {
        set = block % 2;
      }

      const start = type === "set" ? set * 2 : 0;
      const end = type === "set" ? start + 2 : 4;

      for (let i = start; i < end; i++) {
        if (cache[i] === block) {
          hit = true;
          line = i;
          break;
        }
      }

      if (hit) {
        if (policy === "lru") {
          lastUsed[set] = lastUsed[set].filter(x => x !== line);
          lastUsed[set].push(line);
        }
      } else {
        let emptyLine = -1;

        for (let i = start; i < end; i++) {
          if (cache[i] === null) {
            emptyLine = i;
            break;
          }
        }

        if (emptyLine !== -1) {
          line = emptyLine;
        } else if (policy === "fifo") {
          line = loadOrder[set].shift();
        } else {
          line = lastUsed[set].shift();
        }

        cache[line] = block;

        loadOrder[set] = loadOrder[set].filter(x => x !== line);
        loadOrder[set].push(line);

        lastUsed[set] = lastUsed[set].filter(x => x !== line);
        lastUsed[set].push(line);
      }
    }

    if (hit) hits++;
    else misses++;

    history.push({
      access: index + 1,
      block,
      hit,
      cache: [...cache]
    });
  });

  const hitRate = hits / blocks.length * 100;
  const missRate = misses / blocks.length * 100;

  if (!showResults) {
    return {
      name: getMappingName(type),
      hits,
      misses,
      hitRate,
      missRate
    };
  }

  let output = `
    <h3>Simulation Results</h3>
    <p><b>Mapping Technique:</b> ${getMappingName(type)}</p>
    <p><b>Replacement Policy:</b> ${type === "direct" ? "Not applicable" : policy.toUpperCase()}</p>
    <table>
      <tr>
        <th>Access</th>
        <th>Memory Block</th>
        <th>Result</th>
        <th>Cache Contents</th>
      </tr>
  `;

  history.forEach(item => {
    output += `
      <tr>
        <td>${item.access}</td>
        <td>${item.block}</td>
        <td><b>${item.hit ? "HIT" : "MISS"}</b></td>
        <td>${item.cache.map((v, i) =>
          `L${i}: ${v === null ? "Empty" : v}`
        ).join(" | ")}</td>
      </tr>
    `;
  });

  output += `
    </table>
    <h3>Performance Summary</h3>
    <p>Total Memory Accesses: ${blocks.length}</p>
    <p>Total Hits: ${hits}</p>
    <p>Total Misses: ${misses}</p>
    <p>Hit Rate: ${hitRate.toFixed(2)}%</p>
    <p>Miss Rate: ${missRate.toFixed(2)}%</p>
    <h3>Final Cache Contents</h3>
    <p>${cache.map((v, i) =>
      `Line ${i}: ${v === null ? "Empty" : v}`
    ).join("<br>")}</p>
  `;

  document.getElementById("results").innerHTML = output;

  animateCache(history);
  updatePerformanceChart(hits, misses);

  return { name: getMappingName(type), hits, misses, hitRate, missRate };
}

function getMappingName(type) {
  if (type === "direct") return "Direct Mapping";
  if (type === "set") return "2-Way Set Associative";
  return "Fully Associative";
}

function animateCache(history) {
  const visual = document.getElementById("cacheVisual");
  if (!visual) return;

  visual.innerHTML = Array.from({ length: 4 }, (_, i) => `
    <div class="card cache-line" id="cacheLine${i}">
      <h3>Cache Line ${i}</h3>
      <p>Empty</p>
    </div>
  `).join("");

  let step = 0;

  function showNext() {
    if (step >= history.length) return;

    const item = history[step];

    item.cache.forEach((value, i) => {
      const card = document.getElementById(`cacheLine${i}`);
      if (!card) return;

      card.className = "card cache-line " +
        (item.hit ? "hit" : "miss");

      card.innerHTML = `
        <h3>Cache Line ${i}</h3>
        <p>${value === null ? "Empty" : "Block " + value}</p>
        <b>${item.hit ? "HIT" : "MISS"}</b>
      `;
    });

    step++;
    setTimeout(showNext, 700);
  }

  showNext();
}

function compareMappings() {
  const direct = runSimulation("direct", false);
  const associative = runSimulation("associative", false);
  const set = runSimulation("set", false);

  if (!direct || !associative || !set) return;

  const results = [direct, associative, set];

  let html = `
    <h3>Mapping Technique Comparison</h3>
    <table>
      <tr>
        <th>Technique</th>
        <th>Hits</th>
        <th>Misses</th>
        <th>Hit Rate</th>
      </tr>
  `;

  results.forEach(r => {
    html += `
      <tr>
        <td>${r.name}</td>
        <td>${r.hits}</td>
        <td>${r.misses}</td>
        <td>${r.hitRate.toFixed(2)}%</td>
      </tr>
    `;
  });

  html += "</table>";

  const container = document.getElementById("comparisonResults");
  if (container) container.innerHTML = html;
}

function updatePerformanceChart(hits, misses) {
  const canvas = document.getElementById("performanceChart");
  if (!canvas || typeof Chart === "undefined") return;

  if (performanceChart) performanceChart.destroy();

  performanceChart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Hits", "Misses"],
      datasets: [{
        data: [hits, misses]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "#e2e8f0"
          }
        },
        title: {
          display: true,
          text: "Cache Performance",
          color: "#e2e8f0"
        }
      }
    }
  });
}

function checkAnswer(answer) {
  document.getElementById("quizResult").textContent =
    answer === "correct"
      ? "Correct! Fully associative mapping allows a block in any cache line."
      : "Incorrect. Try again!";
}
