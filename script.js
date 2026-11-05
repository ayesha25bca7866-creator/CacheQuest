
// =====================================================
// CACHEQUEST - COMPLETE GAME SCRIPT
// =====================================================


// =====================================================
// 1. START SCREEN AND NAVIGATION
// =====================================================

const startButton = document.getElementById("startButton");

if (startButton) {
    startButton.addEventListener("click", function () {
        const playerName = document.getElementById("playerName").value.trim();

        if (!playerName) {
            alert("Please enter your player name.");
            return;
        }

        localStorage.setItem("cacheQuestPlayer", playerName);
        loadPlayerProgress(playerName);

        showScreen("dashboard");

        const welcome = document.getElementById("dashboardWelcome");

        if (welcome) {
            welcome.textContent =
                "Welcome, " + playerName + ". Your CacheQuest mission is ready.";
        }
    });
}

function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const selected = document.getElementById(screenId);

    if (selected) {
        selected.classList.add("active");
    }

    if (screenId !== "gameWorld") {
        stopMazeAnimation();
    } else if (mazeRunning) {
        startMazeAnimation();
    }
}


// =====================================================
// 2. LEARNING CENTER AND MISSIONS
// =====================================================

const missions = [
    {
        number: "01",
        title: "THE MEMORY GATE",
        level: "BEGINNER",
        description: "Understand memory hierarchy, cache memory, hits, misses and locality."
    },
    {
        number: "02",
        title: "DIRECT MAPPING",
        level: "INTERMEDIATE",
        description: "Calculate cache lines, tags, indexes and identify conflict misses."
    },
    {
        number: "03",
        title: "ASSOCIATIVE ARENA",
        level: "INTERMEDIATE",
        description: "Explore fully associative mapping and replacement policies."
    },
    {
        number: "04",
        title: "SET-ASSOCIATIVE MAZE",
        level: "ADVANCED",
        description: "Calculate sets, ways, tags and simulate cache replacement."
    },
    {
        number: "05",
        title: "THE FINAL BOSS",
        level: "ADVANCED",
        description: "Solve mixed cache problems and compare cache performance using AMAT."
    }
];


// LEARNING CENTER LESSON DATA

const lessons = [
    {
        title: "01. Memory Hierarchy",
        explanation: `
            <h4>What is Memory Hierarchy?</h4>
            <p>Memory hierarchy is the arrangement of computer storage based on speed, cost and capacity.</p>

            <h4>Levels of Memory</h4>
            <ul>
                <li>CPU Registers – Fastest storage.</li>
                <li>Cache Memory – Stores frequently accessed data.</li>
                <li>Main Memory (RAM) – Stores currently running programs and data.</li>
                <li>Secondary Storage – Provides long-term storage.</li>
            </ul>

            <p>Generally, moving down the hierarchy increases capacity but decreases access speed.</p>
        `
    },
    {
        title: "02. Cache Basics",
        explanation: `
            <h4>What is Cache Memory?</h4>
            <p>Cache is a small, high-speed memory located close to the CPU.</p>

            <h4>Why is it used?</h4>
            <p>It stores frequently accessed instructions and data to reduce average memory access time.</p>

            <h4>Cache Levels</h4>
            <ul>
                <li>L1 – Usually the smallest and fastest cache.</li>
                <li>L2 – Usually larger than L1.</li>
                <li>L3 – Often larger and shared between CPU cores.</li>
            </ul>
        `
    },
    {
        title: "03. Cache Hits & Misses",
        explanation: `
            <h4>Cache Hit</h4>
            <p>A cache hit occurs when requested data is found in cache.</p>

            <h4>Cache Miss</h4>
            <p>A cache miss occurs when requested data is not found in cache.</p>

            <h4>Performance Formulas</h4>
            <p>Hit Ratio = Cache Hits / Total Memory Accesses</p>
            <p>Miss Ratio = Cache Misses / Total Memory Accesses</p>
            <p>Hit Ratio + Miss Ratio = 1 (or 100%).</p>
        `
    },
    {
        title: "04. Locality of Reference",
        explanation: `
            <h4>What is Locality?</h4>
            <p>Locality of reference means programs tend to access certain memory locations repeatedly or access nearby locations.</p>

            <h4>Types of Locality</h4>
            <ul>
                <li>Temporal Locality – Recently accessed data may be accessed again.</li>
                <li>Spatial Locality – Nearby memory locations may be accessed soon.</li>
            </ul>

            <p>Cache memory uses these principles to improve performance.</p>
        `
    }
];


// DISPLAY MISSION CARDS

function renderMissions() {
    const list = document.getElementById("missionList");

    if (!list) return;

    list.innerHTML = missions.map((mission, index) => {

        const completed = completedMissions.includes(index);
        const unlocked =
            index === 0 || completedMissions.includes(index - 1);

        let buttonText = "ENTER MISSION";

        if (completed) {
            buttonText = "MISSION COMPLETED";
        } else if (!unlocked) {
            buttonText = "LOCKED";
        }

        return `
            <div class="mission-card">
                <div class="mission-number">
                    MISSION ${mission.number}
                </div>

                <h3>${mission.title}</h3>

                <p class="mission-level">${mission.level}</p>

                <p>${mission.description}</p>

                <button
                    onclick="openDashboardMission(${index})"
                    ${!unlocked || completed ? "disabled" : ""}>
                    ${buttonText}
                </button>
            </div>
        `;
    }).join("");
}
// OPEN A SELECTED LESSON

function loadLesson(index) {
    const lesson = lessons[index];
    const content = document.getElementById("learningContent");

    if (!lesson || !content) {
        console.error("Lesson or learningContent element not found.");
        return;
    }

    content.innerHTML = `
        <h3>${lesson.title}</h3>

        <div class="lesson-explanation">
            ${lesson.explanation}
        </div>

        <button onclick="showScreen('learning')">
            BACK TO LESSONS
        </button>
    `;
}




// =====================================================
// 3. CACHE SIMULATOR
// =====================================================

let latestSimulationResult = null;

const runButton = document.getElementById("runSimulationButton");

if (runButton) {
    runButton.addEventListener("click", function () {

        const mapping = document.getElementById("mappingType").value;
        const lines = Number(document.getElementById("cacheLines").value);
        const ways = Number(document.getElementById("ways").value);
        const policy = document.getElementById("replacementPolicy").value;
        const input = document.getElementById("blockInput").value.trim();
        const output = document.getElementById("simulationResults");

        if (!input) {
            output.innerHTML = "<p>Please enter memory blocks.</p>";
            return;
        }

        const values = input.split(",").map(v => v.trim());

        if (values.some(v => !/^\d+$/.test(v))) {
            output.innerHTML =
                "<p>Enter valid non-negative integer blocks separated by commas.</p>";
            return;
        }

        const blocks = values.map(Number);

        if (
            blocks.some(v => !Number.isSafeInteger(v)) ||
            !Number.isSafeInteger(lines) ||
            lines < 1
        ) {
            output.innerHTML = "<p>Invalid cache configuration.</p>";
            return;
        }

        if (
            mapping === "set-associative" &&
            (
                !Number.isInteger(ways) ||
                ways < 1 ||
                ways > lines ||
                lines % ways !== 0
            )
        ) {
            output.innerHTML = "<p>Ways must divide the total cache lines.</p>";
            return;
        }

        try {
            const result = runCacheSimulation(
                blocks,
                mapping,
                lines,
                ways,
                policy
            );

            displaySimulationResults(result);

        } catch (error) {
            output.innerHTML = `<p>${error.message}</p>`;
        }
    });
}

function displaySimulationResults(result) {

    latestSimulationResult = result;

    const output = document.getElementById("simulationResults");

    if (!output) return;

    const finalCacheHTML = result.finalCache.map((line, index) => `
        <div class="cache-line">
            <strong>
                ${
                    result.mappingType === "set-associative"
                        ? "SET " + index
                        : result.mappingType === "direct"
                            ? "LINE " + index
                            : "STORAGE " + (index + 1)
                }
            </strong>
            <span>${line.length ? line.join(", ") : "EMPTY"}</span>
        </div>
    `).join("");

    const traceHTML = result.trace.map((step, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${step.block}</td>
            <td class="${step.result === "HIT" ? "hit-text" : "miss-text"}">
                ${step.result}
            </td>
            <td>${step.location}</td>
            <td>${step.tag}</td>
            <td>${step.replacedBlock === null ? "—" : step.replacedBlock}</td>
        </tr>
    `).join("");

    output.innerHTML = `
        <h3>SIMULATION REPORT</h3>

        <div class="result-stats">
            <div class="result-card">
                <span>TOTAL ACCESS</span>
                <h2>${result.totalAccesses}</h2>
            </div>

            <div class="result-card">
                <span>CACHE HITS</span>
                <h2 class="hit-text">${result.hits}</h2>
            </div>

            <div class="result-card">
                <span>CACHE MISSES</span>
                <h2 class="miss-text">${result.misses}</h2>
            </div>

            <div class="result-card">
                <span>HIT RATIO</span>
                <h2>${(result.hitRatio * 100).toFixed(2)}%</h2>
            </div>

            <div class="result-card">
                <span>MISS RATIO</span>
                <h2>${(result.missRatio * 100).toFixed(2)}%</h2>
            </div>
        </div>

        <h3>FINAL CACHE CONTENTS</h3>
        <div class="cache-display">${finalCacheHTML}</div>

        <h3>MEMORY ACCESS TRACE</h3>

        <div class="trace-table-container">
            <table class="trace-table">
                <thead>
                    <tr>
                        <th>Step</th>
                        <th>Block</th>
                        <th>Result</th>
                        <th>Line/Set</th>
                        <th>Tag</th>
                        <th>Evicted Block</th>
                    </tr>
                </thead>
                <tbody>${traceHTML}</tbody>
            </table>
        </div>
    `;

    renderCacheAnimation(result);
}


// =====================================================
// 4. ADDRESS DECODER
// =====================================================

const decodeButton = document.getElementById("decodeAddressButton");

if (decodeButton) {
    decodeButton.addEventListener("click", function () {

        const address = Number(document.getElementById("addressInput").value);
        const bits = Number(document.getElementById("addressBits").value);
        const blockSize = Number(document.getElementById("blockSize").value);

        const mapping = document.getElementById("mappingType").value;
        const lines = Number(document.getElementById("cacheLines").value);
        const ways = Number(document.getElementById("ways").value);

        const output = document.getElementById("addressResults");

        if (
            !Number.isSafeInteger(address) ||
            !Number.isInteger(bits) ||
            !Number.isInteger(blockSize) ||
            address < 0 ||
            bits < 1 ||
            bits > 52 ||
            blockSize < 1 ||
            (blockSize & (blockSize - 1)) !== 0 ||
            address >= 2 ** bits
        ) {
            output.innerHTML = "<p>Enter valid address settings.</p>";
            return;
        }

        if (
            !Number.isInteger(lines) ||
            lines < 1 ||
            (lines & (lines - 1)) !== 0
        ) {
            output.innerHTML = "<p>Cache lines must be a power of two.</p>";
            return;
        }

        let sets = 1;

        if (mapping === "set-associative") {
            if (
                !Number.isInteger(ways) ||
                ways < 1 ||
                lines % ways !== 0
            ) {
                output.innerHTML = "<p>Invalid number of ways.</p>";
                return;
            }

            sets = lines / ways;

            if ((sets & (sets - 1)) !== 0) {
                output.innerHTML =
                    "<p>Number of sets must be a power of two.</p>";
                return;
            }
        }

        const offsetBits = Math.log2(blockSize);

        let indexBits = 0;

        if (mapping === "direct") {
            indexBits = Math.log2(lines);
        }

        if (mapping === "set-associative") {
            indexBits = Math.log2(sets);
        }

        const tagBits = bits - indexBits - offsetBits;

        if (tagBits < 0) {
            output.innerHTML = "<p>Address width is too small.</p>";
            return;
        }

        const blockNumber = Math.floor(address / blockSize);
        const offset = address % blockSize;

        let index = 0;
        let tag = blockNumber;

        if (mapping === "direct") {
            index = blockNumber % lines;
            tag = Math.floor(blockNumber / lines);
        }

        if (mapping === "set-associative") {
            index = blockNumber % sets;
            tag = Math.floor(blockNumber / sets);
        }

        const binary = address.toString(2).padStart(bits, "0");

        const tagBinary = binary.slice(0, tagBits) || "0";
        const indexBinary = indexBits
            ? binary.slice(tagBits, tagBits + indexBits)
            : "N/A";

        const offsetBinary = offsetBits
            ? binary.slice(bits - offsetBits)
            : "N/A";

        output.innerHTML = `
            <h3>ADDRESS BREAKDOWN</h3>
            <div class="address-binary">${binary}</div>

            <div class="address-fields">
                <div>
                    <span>TAG</span>
                    <h3>${tagBinary}</h3>
                    <p>${tag} (Decimal)</p>
                    <small>${tagBits} bits</small>
                </div>

                <div>
                    <span>INDEX</span>
                    <h3>${indexBinary}</h3>
                    <p>${indexBits ? index : "Not used"}</p>
                    <small>${indexBits} bits</small>
                </div>

                <div>
                    <span>BLOCK OFFSET</span>
                    <h3>${offsetBinary}</h3>
                    <p>${offset} (Decimal)</p>
                    <small>${offsetBits} bits</small>
                </div>
            </div>

            <p>Memory Block Number: <strong>${blockNumber}</strong></p>
            <p>Address format: Tag + Index + Offset</p>
        `;
    });
}


// =====================================================
// 5. AMAT CALCULATOR
// =====================================================

const amatButton = document.getElementById("calculateAMATButton");

if (amatButton) {
    amatButton.addEventListener("click", function () {

        const hitTime = Number(document.getElementById("hitTime").value);
        const missPenalty = Number(document.getElementById("missPenalty").value);

        const output = document.getElementById("amatResults");

        if (
            !Number.isFinite(hitTime) ||
            !Number.isFinite(missPenalty) ||
            hitTime < 0 ||
            missPenalty < 0
        ) {
            output.innerHTML =
                "<p>Enter valid non-negative timing values.</p>";
            return;
        }

        if (!latestSimulationResult) {
            output.innerHTML =
                "<p>Run a cache simulation first.</p>";
            return;
        }

        const missRate = latestSimulationResult.missRatio;
        const amat = hitTime + missRate * missPenalty;

        output.innerHTML = `
            <div class="amat-result-card">
                <p>Hit Time: ${hitTime} ns</p>
                <p>Miss Rate: ${(missRate * 100).toFixed(2)}%</p>
                <p>Miss Penalty: ${missPenalty} ns</p>
                <h2>AMAT = ${amat.toFixed(2)} ns</h2>
                <p>Formula: Hit Time + (Miss Rate × Miss Penalty)</p>
            </div>
        `;
    });
}


// =====================================================
// 6. CACHE ANIMATION
// =====================================================

let animationResult = null;
let animationStep = 0;
let animationTimer = null;

function renderCacheAnimation(result) {
    animationResult = result;
    animationStep = 0;

    pauseCacheAnimation();
    showAnimationStep();
}

function showAnimationStep() {

    if (!animationResult) return;

    const output = document.getElementById("cacheAnimation");
    const trace = animationResult.trace;

    if (!output || !trace || !trace.length) return;

    const step = trace[animationStep];

    updateMemoryMovement(step);
    updateLiveStatistics();

    const cacheHTML = step.cacheState.map((set, index) => {

        let name;

        if (animationResult.mappingType === "set-associative") {
            name = "SET " + index;
        } else if (animationResult.mappingType === "direct") {
            name = "LINE " + index;
        } else {
            name = "STORAGE " + (index + 1);
        }

        return `
            <div class="animation-line ${
                index === step.location ? "active" : ""
            }">
                <strong>${name}</strong>
                <p>${set.length ? set.join(", ") : "EMPTY"}</p>
            </div>
        `;
    }).join("");

    output.innerHTML = `
        <div class="animation-status">
            <h3>STEP ${animationStep + 1} / ${trace.length}</h3>
            <p>Progress: ${((animationStep + 1) / trace.length * 100).toFixed(0)}%</p>
            <h3>REQUESTED BLOCK: ${step.block}</h3>
            <h2 class="${step.result === "HIT" ? "animation-hit" : "animation-miss"}">
                CACHE ${step.result}
            </h2>
            <p>Cache Location: ${step.location}</p>
            <p>Tag: ${step.tag}</p>
            <p>Evicted Block: ${step.replacedBlock === null ? "None" : step.replacedBlock}</p>
        </div>

        <h3>CURRENT CACHE CONTENTS</h3>
        <div class="animation-cache">${cacheHTML}</div>

        <div class="animation-controls">
            <button onclick="previousAnimationStep()">PREVIOUS</button>
            <button onclick="playCacheAnimation()">PLAY</button>
            <button onclick="pauseCacheAnimation()">PAUSE</button>
            <button onclick="nextAnimationStep()">NEXT</button>
            <button onclick="resetCacheAnimation()">RESET</button>
        </div>
    `;
}

function nextAnimationStep() {
    pauseCacheAnimation();

    if (
        animationResult &&
        animationStep < animationResult.trace.length - 1
    ) {
        animationStep++;
        showAnimationStep();
    }
}

function previousAnimationStep() {
    pauseCacheAnimation();

    if (animationStep > 0) {
        animationStep--;
        showAnimationStep();
    }
}

function playCacheAnimation() {

    if (!animationResult || animationTimer) return;

    if (animationStep >= animationResult.trace.length - 1) {
        animationStep = 0;
        showAnimationStep();
    }

    animationTimer = setInterval(() => {

        if (animationStep < animationResult.trace.length - 1) {
            animationStep++;
            showAnimationStep();
        } else {
            pauseCacheAnimation();
        }

    }, 1200);
}

function pauseCacheAnimation() {
    if (animationTimer) {
        clearInterval(animationTimer);
        animationTimer = null;
    }
}

function resetCacheAnimation() {
    pauseCacheAnimation();
    animationStep = 0;
    showAnimationStep();
}

function updateMemoryMovement(step) {

    const memory = document.getElementById("mainMemoryBlocks");
    const cache = document.getElementById("cacheMovementBlocks");

    if (!memory || !cache) return;

    const blocks = [...new Set(
        animationResult.trace.map(item => item.block)
    )];

    memory.innerHTML = blocks.map(block => `
        <div class="memory-block ${block === step.block ? "selected" : ""}">
            BLOCK ${block}
        </div>
    `).join("");

    cache.innerHTML = step.cacheState.map((set, index) => `
        <div class="memory-block">
            CACHE ${index}: ${set.length ? set.join(", ") : "EMPTY"}
        </div>
    `).join("");
}

function updateLiveStatistics() {

    if (!animationResult) return;

    const completed =
        animationResult.trace.slice(0, animationStep + 1);

    const hits =
        completed.filter(item => item.result === "HIT").length;

    const misses = completed.length - hits;
    const total = completed.length;

    const hitRatio = total ? hits / total * 100 : 0;
    const missRatio = total ? misses / total * 100 : 0;

    const access = document.getElementById("liveAccess");
    const hitElement = document.getElementById("liveHits");
    const missElement = document.getElementById("liveMisses");
    const ratio = document.getElementById("liveHitRatio");
    const hitBar = document.getElementById("hitBar");
    const missBar = document.getElementById("missBar");

    if (access) access.textContent = total;
    if (hitElement) hitElement.textContent = hits;
    if (missElement) missElement.textContent = misses;
    if (ratio) ratio.textContent = hitRatio.toFixed(2) + "%";
    if (hitBar) hitBar.style.width = hitRatio + "%";
    if (missBar) missBar.style.width = missRatio + "%";
}


// =====================================================
// 7. CACHE MAPPING COMPARISON
// =====================================================

function compareCacheMappings() {

    const sequenceInput = document.getElementById("blockInput");
    const linesInput = document.getElementById("cacheLines");
    const waysInput = document.getElementById("ways");
    const policyInput = document.getElementById("replacementPolicy");
    const output = document.getElementById("comparisonResults");

    if (!sequenceInput || !linesInput || !waysInput ||
        !policyInput || !output) {
        alert("Comparison HTML elements not found. Check your HTML IDs.");
        return;
    }

    const raw = sequenceInput.value.trim();
    const lines = Number(linesInput.value);
    const ways = Number(waysInput.value);
    const policy = policyInput.value.trim().toUpperCase();

    if (!raw) {
        output.innerHTML = "<p>Please enter memory blocks.</p>";
        return;
    }

    const values = raw.split(",").map(v => v.trim());

    if (values.some(v => !/^\d+$/.test(v))) {
        output.innerHTML = "<p>Enter valid memory blocks.</p>";
        return;
    }

    const sequence = values.map(Number);

    if (
        sequence.some(v => !Number.isSafeInteger(v)) ||
        !Number.isSafeInteger(lines) ||
        lines < 1
    ) {
        output.innerHTML = "<p>Invalid input.</p>";
        return;
    }

    if (
        !Number.isSafeInteger(ways) ||
        ways < 1 ||
        ways > lines ||
        lines % ways !== 0
    ) {
        output.innerHTML = "<p>Ways must divide cache lines.</p>";
        return;
    }

    if (policy !== "LRU" && policy !== "FIFO") {
        output.innerHTML = "<p>Select LRU or FIFO.</p>";
        return;
    }

    function simulate(type) {

        let setCount;
        let capacity;

        if (type === "direct") {
            setCount = lines;
            capacity = 1;
        } else if (type === "fully-associative") {
            setCount = 1;
            capacity = lines;
        } else {
            setCount = lines / ways;
            capacity = ways;
        }

        const cache = Array.from(
            { length: setCount },
            () => []
        );

        let hits = 0;
        let misses = 0;

        sequence.forEach(block => {

            let index = 0;

            if (type === "direct") {
                index = block % lines;
            }

            if (type === "set-associative") {
                index = block % setCount;
            }

            const current = cache[index];
            const position = current.indexOf(block);

            if (position !== -1) {

                hits++;

                if (policy === "LRU" && capacity > 1) {
                    const item = current.splice(position, 1)[0];
                    current.push(item);
                }

            } else {

                misses++;

                if (current.length >= capacity) {
                    current.shift();
                }

                current.push(block);
            }
        });

        return {
            name:
                type === "direct"
                    ? "DIRECT MAPPING"
                    : type === "fully-associative"
                        ? "FULLY ASSOCIATIVE"
                        : "SET ASSOCIATIVE",
            hits,
            misses,
            hitRatio: hits / sequence.length * 100,
            missRatio: misses / sequence.length * 100
        };
    }

    const results = [
        simulate("direct"),
        simulate("fully-associative"),
        simulate("set-associative")
    ];

    const best = Math.max(...results.map(r => r.hitRatio));

    output.innerHTML = `
        <div class="comparison-grid">
            ${results.map(result => `
                <div class="comparison-card">
                    <h3>${result.name}</h3>
                    ${
                        Math.abs(result.hitRatio - best) < 0.000001
                            ? '<p class="best-result">BEST HIT RATIO</p>'
                            : ""
                    }
                    <p>Cache Hits: ${result.hits}</p>
                    <p>Cache Misses: ${result.misses}</p>
                    <p>Hit Ratio: ${result.hitRatio.toFixed(2)}%</p>
                    <p>Miss Ratio: ${result.missRatio.toFixed(2)}%</p>
                </div>
            `).join("")}
        </div>

        <h3>COMPARISON SUMMARY</h3>
        <p>Memory Accesses: ${sequence.length}</p>
        <p>Cache Lines: ${lines}</p>
        <p>Ways: ${ways}</p>
        <p>Replacement Policy: ${policy}</p>
        <p>Best Hit Ratio: ${best.toFixed(2)}%</p>
    `;
}


// =====================================================
// 8. CHALLENGE ARENA
// =====================================================

let currentQuestionIndex = 0;
let challengeScore = 0;
let selectedAnswer = null;
let answerSubmitted = false;

function startChallenge() {

    if (typeof quizData === "undefined" || !quizData.length) {
        const container = document.getElementById("challengeContent");

        if (container) {
            container.innerHTML =
                "<p>Quiz questions could not be loaded. Check quiz-data.js.</p>";
        }

        return;
    }

    currentQuestionIndex = 0;
    challengeScore = 0;
    selectedAnswer = null;
    answerSubmitted = false;

    showScreen("challenges");
    displayQuestion();
}

function displayQuestion() {

    const container = document.getElementById("challengeContent");

    if (!container) return;

    if (currentQuestionIndex >= quizData.length) {
        showChallengeResults();
        return;
    }

    const question = quizData[currentQuestionIndex];

    selectedAnswer = null;
    answerSubmitted = false;

    container.innerHTML = `
        <div class="challenge-card">
            <p class="eyebrow">CACHEQUEST KNOWLEDGE TEST</p>

            <h3>QUESTION ${currentQuestionIndex + 1} / ${quizData.length}</h3>

            <div class="challenge-progress">Score: ${challengeScore}</div>

            <h2>${question.question}</h2>

            <div class="challenge-options">
                ${question.options.map((option, index) => `
                    <button
                        class="challenge-option"
                        data-answer="${index}"
                        onclick="selectChallengeAnswer(${index})">
                        ${String.fromCharCode(65 + index)}. ${option}
                    </button>
                `).join("")}
            </div>

            <div id="challengeFeedback"></div>

            <button id="submitChallengeButton" onclick="submitChallengeAnswer()">
                SUBMIT ANSWER
            </button>

            <button onclick="showScreen('dashboard')">
                BACK TO MISSION CONTROL
            </button>
        </div>
    `;
}

function selectChallengeAnswer(index) {

    if (answerSubmitted) return;

    selectedAnswer = index;

    document.querySelectorAll(".challenge-option").forEach(button => {
        button.classList.remove("selected");
    });

    const selected = document.querySelector(
        `.challenge-option[data-answer="${index}"]`
    );

    if (selected) selected.classList.add("selected");
}

function submitChallengeAnswer() {

    if (selectedAnswer === null) {
        alert("Please select an answer first.");
        return;
    }

    if (answerSubmitted) return;

    answerSubmitted = true;

    const question = quizData[currentQuestionIndex];
    const correct = selectedAnswer === question.answer;

    if (correct) challengeScore++;

    const feedback = document.getElementById("challengeFeedback");

    feedback.innerHTML = `
        <div class="challenge-feedback">
            <h3>${correct ? "CORRECT ANSWER!" : "INCORRECT ANSWER"}</h3>
            <p>Correct Answer: ${question.options[question.answer]}</p>
            <p>${question.explanation}</p>
        </div>
    `;

    document.querySelectorAll(".challenge-option").forEach(button => {
        button.disabled = true;
    });

    const submit = document.getElementById("submitChallengeButton");

    submit.textContent = "NEXT QUESTION";
    submit.onclick = nextChallengeQuestion;
}

function nextChallengeQuestion() {
    currentQuestionIndex++;
    displayQuestion();
}

function showChallengeResults() {

    const container = document.getElementById("challengeContent");

    if (!container) return;

    const percentage = challengeScore / quizData.length * 100;

    let performance = "ROOKIE PLAYER";

    if (percentage >= 80) {
        performance = "CACHE MASTER";
    } else if (percentage >= 50) {
        performance = "MEMORY EXPLORER";
    }

    container.innerHTML = `
        <div class="challenge-results">
            <p class="eyebrow">MISSION COMPLETED</p>
            <h2>CHALLENGE RESULTS</h2>
            <h1>${challengeScore} / ${quizData.length}</h1>
            <h3>${percentage.toFixed(2)}% ACCURACY</h3>
            <h2>${performance}</h2>
            <button onclick="startChallenge()">PLAY AGAIN</button>
            <button onclick="showScreen('dashboard')">BACK TO MISSION CONTROL</button>
        </div>
    `;
}


// =====================================================
// 9. ADVENTURE WORLD PROGRESS
// =====================================================



    localStorage.getItem("cacheQuestPlayer") || "Guest";

let currentPlayer = "";
let playerKey = "";
let gameXP = 0;
let completedMissions = [];

function loadPlayerProgress(name) {
    currentPlayer = name.trim();
    playerKey = currentPlayer.toLowerCase();

    gameXP = Number(
        localStorage.getItem("cacheQuestXP_" + playerKey)
    ) || 0;

    try {
        completedMissions = JSON.parse(
            localStorage.getItem("cacheQuestCompleted_" + playerKey) || "[]"
        );

        if (!Array.isArray(completedMissions)) {
            completedMissions = [];
        }

        completedMissions = completedMissions.filter(
            index => Number.isInteger(index) && index >= 0 && index < 5
        );

    } catch {
        completedMissions = [];
    }

    updateGameProgress();
    renderMissions();
}

const gameMissions = [
    {
        title: "THE MEMORY KINGDOM",
        description: "Your journey begins! Learn how the memory hierarchy works.",
        question: "Which memory is closest to the CPU?",
        options: ["Hard Disk", "RAM", "Cache Memory", "DVD"],
        answer: 2,
        explanation: "Cache memory is located close to the CPU.",
        reward: 100
    },
    {
        title: "CACHE CITY",
        description: "Discover how cache hits and misses affect performance.",
        question: "What happens when requested data is already in cache?",
        options: ["Cache Miss", "Cache Hit", "Memory Failure", "Data Loss"],
        answer: 1,
        explanation: "A cache hit occurs when requested data is found in cache.",
        reward: 150
    },
    {
        title: "ADDRESS LABYRINTH",
        description: "Decode memory addresses and identify their fields.",
        question: "Which field identifies a cache line in direct mapping?",
        options: ["Tag", "Index", "Offset", "Data"],
        answer: 1,
        explanation: "The index selects the cache line in direct mapping.",
        reward: 200
    },
    {
        title: "REPLACEMENT WAR",
        description: "Explore cache replacement concepts.",
        question: "Which policy replaces the least recently used block?",
        options: ["FIFO", "LRU", "Direct Mapping", "AMAT"],
        answer: 1,
        explanation: "LRU replaces the block not accessed for the longest time.",
        reward: 250
    },
    {
        title: "THE FINAL BOSS",
        description: "Complete your final memory architecture examination.",
        question: "What is the formula for AMAT?",
        options: [
            "Hit Time + (Miss Rate × Miss Penalty)",
            "Hit Time × Miss Rate",
            "Miss Rate + Cache Size",
            "Cache Lines ÷ Memory Blocks"
        ],
        answer: 0,
        explanation: "AMAT = Hit Time + (Miss Rate × Miss Penalty).",
        reward: 500
    }
    ];
    
    function openDashboardMission(index) {

    if (
        index > 0 &&
        !completedMissions.includes(index - 1)
    ) {
        alert("Complete the previous mission first!");
        return;
    }

    if (completedMissions.includes(index)) {
        alert("You have already completed this mission!");
        return;
    }

    showScreen("gameWorld");

    startGameMission(index);
}

function updateGameProgress() {

    const xp = document.getElementById("playerXP");
    const completed = document.getElementById("missionsCompleted");
    const rankElement = document.getElementById("playerRank");

    if (xp) xp.textContent = gameXP;
    if (completed) completed.textContent = completedMissions.length;

    let rank = "Rookie";

    if (gameXP >= 1000) rank = "CACHE LEGEND";
    else if (gameXP >= 500) rank = "MEMORY MASTER";
    else if (gameXP >= 200) rank = "MEMORY EXPLORER";

    if (rankElement) rankElement.textContent = rank;

   if (playerKey) {
    localStorage.setItem("cacheQuestXP_" + playerKey, gameXP);

    localStorage.setItem(
        "cacheQuestCompleted_" + playerKey,
        JSON.stringify(completedMissions)
    );
}

    gameMissions.forEach((mission, index) => {

        const button = document.querySelector(
            `.world-card:nth-child(${index + 1}) button`
        );

        if (!button) return;

        if (completedMissions.includes(index)) {
            button.textContent = "MISSION COMPLETED";
            button.disabled = true;
        } else if (index === 0 || completedMissions.includes(index - 1)) {
            button.textContent = "ENTER WORLD";
            button.disabled = false;
        } else {
            button.textContent = "LOCKED";
            button.disabled = true;
        }
    });
        // Update Mission Control statistics
    const dashboardCompleted =
        document.getElementById("completedCount");

    const dashboardScore =
        document.getElementById("totalScore");

    const dashboardMastery =
        document.getElementById("mastery");

    if (dashboardCompleted) {
        dashboardCompleted.textContent =
            completedMissions.length + " / 5";
    }

    if (dashboardScore) {
        dashboardScore.textContent = gameXP + " XP";
    }

    if (dashboardMastery) {
        dashboardMastery.textContent =
            Math.round(completedMissions.length / 5 * 100) + "%";
    }
}

function startGameMission(index) {

    if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= gameMissions.length
    ) return;

    if (index > 0 && !completedMissions.includes(index - 1)) {
        alert("Complete the previous mission first!");
        return;
    }

    const mission = gameMissions[index];
    const container = document.getElementById("gameMissionContent");

    if (!mission || !container) return;

    container.innerHTML = `
        <div class="mission-game-panel">
            <p>MISSION ${index + 1} / 5</p>
            <h2>${mission.title}</h2>
            <p>${mission.description}</p>
            <h3>${mission.question}</h3>

            <div class="game-options">
                ${mission.options.map((option, i) => `
                    <button class="game-answer"
                        onclick="checkGameAnswer(${index}, ${i})">
                        ${String.fromCharCode(65 + i)}. ${option}
                    </button>
                `).join("")}
            </div>

            <div id="gameFeedback"></div>
            <button onclick="showScreen('dashboard')">EXIT MISSION</button>
        </div>
    `;
}

function checkGameAnswer(missionIndex, answerIndex) {

    const mission = gameMissions[missionIndex];
    const feedback = document.getElementById("gameFeedback");

    if (!mission || !feedback) return;

    if (completedMissions.includes(missionIndex)) {
        feedback.innerHTML = "<h3>MISSION ALREADY COMPLETED</h3>";
        return;
    }

    document.querySelectorAll(".game-answer").forEach(button => {
        button.disabled = true;
    });

    if (answerIndex === mission.answer) {

        gameXP += mission.reward;

        completedMissions.push(missionIndex);

        feedback.innerHTML = `
            <div class="game-feedback">
                <h3>MISSION SUCCESSFUL!</h3>
                <p>${mission.explanation}</p>
                <h3>+${mission.reward} XP EARNED</h3>
                <button onclick="finishGameMission()">CONTINUE</button>
            </div>
        `;

    } else {

        feedback.innerHTML = `
            <div class="game-feedback">
                <h3>NOT QUITE! TRY AGAIN.</h3>
                <p>${mission.explanation}</p>
                <button onclick="retryGameMission(${missionIndex})">TRY AGAIN</button>
            </div>
        `;
    }

    updateGameProgress();
}

function retryGameMission(index) {
    startGameMission(index);
}

function finishGameMission() {

    updateGameProgress();

    const container = document.getElementById("gameMissionContent");

    if (!container) return;

    container.innerHTML = `
        <div class="mission-game-panel">
            <h2>MISSION COMPLETED!</h2>
            <p>Your progress has been saved.</p>
            <button onclick="startGameMission(Math.min(completedMissions.length, 4))">
                NEXT MISSION
            </button>
            <button onclick="showScreen('gameWorld')">
                RETURN TO WORLD MAP
            </button>
        </div>
    `;

    if (completedMissions.length === 5) {
        container.innerHTML += `
            <h2>YOU ARE A CACHEQUEST CHAMPION!</h2>
            <p>You have completed all five worlds.</p>
        `;
    }
}


// =====================================================
// 10. FIVE-LEVEL 2D MEMORY MAZE GAME
// =====================================================

const mazeCanvas = document.getElementById("mazeCanvas");
const mazeCtx = mazeCanvas ? mazeCanvas.getContext("2d") : null;

const TILE = 40;
const COLS = 20;
const ROWS = 15;

const mazeLevels = [
    {
        name: "THE MEMORY GATE",
        subtitle: "Collect the memory crystals",
        crystals: [[4, 1], [4, 3], [6, 5], [3, 9], [3, 11]],
        enemySpeed: 1100,
        boss: false
    },
    {
        name: "CACHE CITY",
        subtitle: "Avoid the moving memory guards",
        crystals: [[3, 1], [8, 3], [5, 5], [2, 9], [5, 11]],
        enemySpeed: 850,
        boss: false
    },
    {
        name: "ADDRESS LABYRINTH",
        subtitle: "Find all address fragments",
        crystals: [[2, 1], [8, 3], [6, 5], [3, 9], [5, 11]],
        enemySpeed: 700,
        boss: false
    },
    {
        name: "REPLACEMENT WAR",
        subtitle: "Escape the replacement guardians",
        crystals: [[4, 1], [8, 3], [6, 5], [2, 9], [5, 11]],
        enemySpeed: 550,
        boss: false
    },
    {
        name: "THE FINAL BOSS",
        subtitle: "Defeat the Memory Guardian",
        crystals: [[3, 1], [8, 3], [6, 5], [2, 9], [5, 11]],
        enemySpeed: 400,
        boss: true
    }
];

const baseMaze = [
    "####################",
    "#....#......#......#",
    "#.##.#.####.#.####.#",
    "#....#....#.#......#",
    "####.###..#.#.####.#",
    "#......#..#...#....#",
    "#.####.#.#####.##..#",
    "#.#....#.....#.....#",
    "#.#.#######..#.###.#",
    "#...#.....#..#.....#",
    "###.#.###.#.####.#.#",
    "#...#...#.#......#.#",
    "#.#####.#.########.#",
    "#..................#",
    "####################"
];

let mazeLevel = 0;
let mazePlayer = { x: 1, y: 1 };
let mazeCrystals = [];
let mazeEnemies = [];

let mazeCollected = 0;
let mazeScore = 0;
let mazeLives = 3;

let mazeRunning = false;
let mazeWon = false;
let mazeGameCompleted = false;

let mazeAnimationFrame = null;
let mazeLastEnemyMove = 0;
let mazePulse = 0;


// =====================================================
// CRYSTAL QUESTIONS - UNIQUE PER CRYSTAL AND LEVEL
// =====================================================

const crystalQuestions = [
    [
        ["Which memory is fastest?", ["RAM", "Cache", "Hard Disk", "DVD"], 1],
        ["Which memory is closest to the CPU?", ["Hard Disk", "RAM", "Cache", "USB"], 2],
        ["Which memory is volatile?", ["RAM", "ROM", "SSD", "DVD"], 0],
        ["Which memory generally has the largest capacity?", ["Register", "Cache", "RAM", "Hard Disk"], 3],
        ["What is the main purpose of cache?", ["Permanent storage", "Reduce memory access time", "Increase disk space", "Replace RAM"], 1]
    ],
    [
        ["What is a cache hit?", ["Data found in cache", "Data missing from cache", "Cache is full", "CPU stopped"], 0],
        ["What is a cache miss?", ["Data found in cache", "Data not found in cache", "Cache is full", "CPU error"], 1],
        ["Which ratio measures successful cache accesses?", ["Miss ratio", "Hit ratio", "Block ratio", "Memory ratio"], 1],
        ["A high hit ratio generally indicates?", ["Better cache performance", "More misses", "Slower CPU", "More disk space"], 0],
        ["After a cache miss, data is normally fetched from?", ["Lower memory level", "Keyboard", "Monitor", "Printer"], 0]
    ],
    [
        ["What does the block offset identify?", ["Cache set", "Location within a block", "Memory tag", "CPU speed"], 1],
        ["What does the index identify?", ["Cache line or set", "Byte position", "Disk sector", "Clock speed"], 0],
        ["What does the tag identify?", ["Memory block", "Byte offset", "RAM size", "Clock speed"], 0],
        ["A 16-byte block requires how many offset bits?", ["2", "3", "4", "16"], 2],
        ["How many bits are required to select 8 sets?", ["2", "3", "4", "8"], 1]
    ],
    [
        ["Direct mapping places a block in?", ["Any cache line", "One specific cache line", "Every cache line", "Main memory only"], 1],
        ["Fully associative mapping allows a block in?", ["Any cache line", "Only line zero", "One fixed line", "No cache line"], 0],
        ["What does LRU stand for?", ["Last Recently Used", "Least Recently Used", "Least Random Usage", "Latest Replacement Unit"], 1],
        ["FIFO replaces the block that?", ["Was loaded first", "Was used most recently", "Is largest", "Has the highest address"], 0],
        ["Set-associative mapping combines?", ["RAM and ROM", "Direct and associative mapping", "CPU and GPU", "Cache and disk"], 1]
    ],
    [
        ["Which formula calculates AMAT?", ["Hit time + Miss rate × Miss penalty", "Hit time × Cache size", "Miss rate + Cache size", "Accesses / Hits"], 0],
        ["If every access is a hit, the miss rate is?", ["100%", "50%", "0%", "25%"], 2],
        ["Which replacement policy uses recent access history?", ["FIFO", "LRU", "Direct mapping", "Random only"], 1],
        ["What is spatial locality?", ["Nearby addresses may be accessed", "Old data is deleted", "Memory never changes", "CPU stops"], 0],
        ["What is temporal locality?", ["Recently accessed data may be accessed again", "Nearby addresses only", "Data is permanent", "Cache has no misses"], 0]
    ]
];


// =====================================================
// ENEMY PATHS
// =====================================================

const enemyPaths = [
    [
        { x: 1, y: 5 },
        { x: 2, y: 5 },
        { x: 3, y: 5 },
        { x: 4, y: 5 },
        { x: 5, y: 5 },
        { x: 6, y: 5 }
    ],
    [
        { x: 13, y: 3 },
        { x: 14, y: 3 },
        { x: 15, y: 3 },
        { x: 16, y: 3 },
        { x: 17, y: 3 },
        { x: 18, y: 3 }
    ],
    [
        { x: 2, y: 13 },
        { x: 3, y: 13 },
        { x: 4, y: 13 },
        { x: 5, y: 13 },
        { x: 6, y: 13 },
        { x: 7, y: 13 }
    ]
];


// =====================================================
// OPEN ADVENTURE WORLD
// =====================================================

function openAdventureWorld() {
    launchMazeGame();
}

function launchMazeGame() {

    if (!mazeCanvas || !mazeCtx) {
        alert("Maze canvas not found. Check index.html.");
        return;
    }

    showScreen("gameWorld");

    if (mazeGameCompleted) {
        mazeLevel = 0;
        mazeScore = 0;
        mazeLives = 3;
        mazeGameCompleted = false;
    }

    startMazeLevel();
}


// =====================================================
// START LEVEL
// =====================================================

function startMazeLevel() {

    if (mazeLevel >= mazeLevels.length) {
        finishMazeGame();
        return;
    }

    mazePlayer = { x: 1, y: 1 };
    mazeCollected = 0;
    mazeWon = false;
    mazeRunning = true;
    mazeLastEnemyMove = 0;

    const level = mazeLevels[mazeLevel];

    mazeCrystals = level.crystals.map(([x, y]) => ({
        x,
        y,
        collected: false
    }));

    mazeEnemies = [];

    const enemyCount = Math.min(mazeLevel + 1, 3);

    for (let i = 0; i < enemyCount; i++) {

        const path = enemyPaths[i];

        mazeEnemies.push({
            path,
            pathIndex: 0,
            x: path[0].x,
            y: path[0].y
        });
    }

    const gameOverPanel = document.getElementById("gameOverPanel");
    const levelPanel = document.getElementById("levelCompletePanel");

    if (gameOverPanel) gameOverPanel.hidden = true;
    if (levelPanel) levelPanel.hidden = true;

    updateMazeHUD();

    showMazeMessage(level.name + ": " + level.subtitle);

    stopMazeAnimation();
    drawMazeGame();
    startMazeAnimation();
}


// =====================================================
// MAZE HUD
// =====================================================

function updateMazeHUD() {

    const score = document.getElementById("mazeScore");
    const status = document.getElementById("mazeStatus");
    const livesDisplay = document.getElementById("playerLives");

    if (score) {
        score.textContent = mazeCollected + " / 5";
    }

    if (status) {
        status.textContent = "LEVEL " + (mazeLevel + 1) + " / 5";
    }

    if (livesDisplay) {
        livesDisplay.textContent =
            "❤️ ".repeat(mazeLives).trim() || "0";
    }
}


// =====================================================
// DRAW MAZE MAP
// =====================================================

function drawMazeMap() {

    if (!mazeCtx) return;

    mazeCtx.clearRect(
        0,
        0,
        mazeCanvas.width,
        mazeCanvas.height
    );

    for (let y = 0; y < ROWS; y++) {

        for (let x = 0; x < COLS; x++) {

            const wall = baseMaze[y][x] === "#";

            mazeCtx.fillStyle =
                wall ? "#123b60" : "#09182d";

            mazeCtx.fillRect(
                x * TILE,
                y * TILE,
                TILE,
                TILE
            );

            mazeCtx.strokeStyle = "#173650";

            mazeCtx.strokeRect(
                x * TILE,
                y * TILE,
                TILE,
                TILE
            );

            if (wall) {

                mazeCtx.fillStyle = "#087eaa";

                mazeCtx.fillRect(
                    x * TILE + 5,
                    y * TILE + 5,
                    TILE - 10,
                    TILE - 10
                );
            }
        }
    }
}


// =====================================================
// DRAW EXIT
// =====================================================

function drawMazeExit() {

    const x = 18 * TILE + TILE / 2;
    const y = 13 * TILE + TILE / 2;

    const unlocked = mazeCollected === 5;

    mazeCtx.save();

    mazeCtx.shadowBlur = 20;
    mazeCtx.shadowColor = unlocked ? "#00ffae" : "#ff397a";
    mazeCtx.fillStyle = unlocked ? "#00ffae" : "#8b3158";

    mazeCtx.beginPath();

    mazeCtx.arc(
        x,
        y,
        13 + Math.sin(mazePulse) * 3,
        0,
        Math.PI * 2
    );

    mazeCtx.fill();

    mazeCtx.restore();
}


// =====================================================
// DRAW CRYSTALS
// =====================================================

function drawMazeCrystals() {

    mazeCrystals.forEach(crystal => {

        if (crystal.collected) return;

        const x = crystal.x * TILE + TILE / 2;
        const y = crystal.y * TILE + TILE / 2;

        mazeCtx.save();

        mazeCtx.translate(x, y);
        mazeCtx.rotate(Math.PI / 4);

        mazeCtx.shadowBlur = 18;
        mazeCtx.shadowColor = "#00e5ff";

        mazeCtx.fillStyle = "#00e5ff";

        mazeCtx.fillRect(-8, -8, 16, 16);

        mazeCtx.restore();
    });
}


// =====================================================
// DRAW PLAYER
// =====================================================

function drawMazePlayer() {

    const x = mazePlayer.x * TILE + TILE / 2;
    const y = mazePlayer.y * TILE + TILE / 2;

    const radius = 12 + Math.sin(mazePulse) * 2;

    mazeCtx.save();

    mazeCtx.shadowBlur = 20;
    mazeCtx.shadowColor = "#00e5ff";

    mazeCtx.fillStyle = "#00e5ff";

    mazeCtx.beginPath();

    mazeCtx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
    );

    mazeCtx.fill();

    mazeCtx.shadowBlur = 0;

    mazeCtx.fillStyle = "#ffffff";

    mazeCtx.beginPath();

    mazeCtx.arc(
        x,
        y,
        5,
        0,
        Math.PI * 2
    );

    mazeCtx.fill();

    mazeCtx.restore();
}


// =====================================================
// DRAW ENEMIES AND FINAL BOSS
// =====================================================

function drawMazeEnemies() {

    mazeEnemies.forEach((enemy, index) => {

        const x = enemy.x * TILE + TILE / 2;
        const y = enemy.y * TILE + TILE / 2;

        const isBoss =
            mazeLevels[mazeLevel].boss && index === 0;

        mazeCtx.save();

        mazeCtx.shadowBlur = isBoss ? 25 : 15;
        mazeCtx.shadowColor = isBoss ? "#ff1744" : "#ff7b36";

        mazeCtx.fillStyle = isBoss ? "#ff1744" : "#ff7b36";

        mazeCtx.beginPath();

        mazeCtx.arc(
            x,
            y,
            isBoss ? 16 + Math.sin(mazePulse) * 2 : 11,
            0,
            Math.PI * 2
        );

        mazeCtx.fill();

        mazeCtx.shadowBlur = 0;

        mazeCtx.fillStyle = "#ffffff";

        mazeCtx.beginPath();

        mazeCtx.arc(x - 4, y - 3, 2, 0, Math.PI * 2);
        mazeCtx.arc(x + 4, y - 3, 2, 0, Math.PI * 2);

        mazeCtx.fill();

        mazeCtx.restore();
    });
}


// =====================================================
// DRAW COMPLETE GAME
// =====================================================

function drawMazeGame() {

    if (!mazeCtx) return;

    drawMazeMap();
    drawMazeExit();
    drawMazeCrystals();
    drawMazeEnemies();
    drawMazePlayer();
}


// =====================================================
// ANIMATION LOOP
// =====================================================

function startMazeAnimation() {

    if (!mazeRunning || mazeAnimationFrame) return;

    function animate(timestamp) {

        if (!mazeRunning) {
            mazeAnimationFrame = null;
            return;
        }

        mazePulse += 0.08;

        const level = mazeLevels[mazeLevel];

        if (
            !mazeLastEnemyMove ||
            timestamp - mazeLastEnemyMove > level.enemySpeed
        ) {
            moveMazeEnemies();
            mazeLastEnemyMove = timestamp;
        }

        drawMazeGame();

        mazeAnimationFrame = requestAnimationFrame(animate);
    }

    mazeAnimationFrame = requestAnimationFrame(animate);
}

function stopMazeAnimation() {

    if (mazeAnimationFrame) {
        cancelAnimationFrame(mazeAnimationFrame);
        mazeAnimationFrame = null;
    }
}


// =====================================================
// PLAYER MOVEMENT
// =====================================================

function mazeMove(dx, dy) {

    if (!mazeRunning || mazeWon) return;

    const newX = mazePlayer.x + dx;
    const newY = mazePlayer.y + dy;

    if (
        newX < 0 ||
        newX >= COLS ||
        newY < 0 ||
        newY >= ROWS ||
        baseMaze[newY][newX] === "#"
    ) {
        return;
    }

    mazePlayer.x = newX;
    mazePlayer.y = newY;

    const crystalIndex = mazeCrystals.findIndex(crystal =>
        !crystal.collected &&
        crystal.x === newX &&
        crystal.y === newY
    );

    if (crystalIndex !== -1) {
        collectMazeCrystal(crystalIndex);
    }

    if (!mazeRunning) return;

    checkMazeEnemyCollision();

    if (!mazeRunning) return;

    if (newX === 18 && newY === 13) {

        if (mazeCollected === 5) {
            completeMazeLevel();
        } else {
            showMazeMessage(
                "EXIT LOCKED! Collect all 5 crystals first."
            );
        }
    }

    drawMazeGame();
}


// =====================================================
// COLLECT CRYSTAL
// =====================================================

function collectMazeCrystal(crystalIndex) {

    const crystal = mazeCrystals[crystalIndex];

    if (!crystal || crystal.collected) return;

    const question = crystalQuestions[mazeLevel][crystalIndex];

    const answer = prompt(
        "💎 MEMORY CRYSTAL CHALLENGE\n\n" +
        question[0] + "\n\n" +
        question[1]
            .map((option, i) =>
                (i + 1) + ". " + option
            )
            .join("\n") +
        "\n\nEnter your answer (1-4):"
    );

    if (answer === null) {
        showMazeMessage(
            "Crystal not collected. Touch it again to retry."
        );
        return;
    }

    if (!["1", "2", "3", "4"].includes(answer.trim())) {
        showMazeMessage(
            "Enter a number from 1 to 4. The crystal is still waiting."
        );
        return;
    }

    if (Number(answer) !== question[2] + 1) {

        showMazeMessage(
            "INCORRECT! The crystal is still waiting. Try again."
        );

        alert("Incorrect answer! The crystal has not been collected.");

        return;
    }

    crystal.collected = true;

    mazeCollected++;
    mazeScore += 50;

    updateMazeHUD();

    showMazeMessage(
        "CORRECT! Crystal collected: " +
        mazeCollected +
        " / 5 | +50 points"
    );
}


// =====================================================
// ENEMY MOVEMENT
// =====================================================

function moveMazeEnemies() {

    if (!mazeRunning) return;

    mazeEnemies.forEach(enemy => {

        if (!enemy.path || enemy.path.length < 2) return;

        enemy.pathIndex =
            (enemy.pathIndex + 1) % enemy.path.length;

        const next = enemy.path[enemy.pathIndex];

        enemy.x = next.x;
        enemy.y = next.y;
    });

    checkMazeEnemyCollision();
}


// =====================================================
// ENEMY COLLISION
// =====================================================

function checkMazeEnemyCollision() {

    if (!mazeRunning) return;

    const collision = mazeEnemies.some(enemy =>
        enemy.x === mazePlayer.x &&
        enemy.y === mazePlayer.y
    );

    if (!collision) return;

    mazeLives--;

    updateMazeHUD();

    if (mazeLives <= 0) {

        mazeRunning = false;

        stopMazeAnimation();

        const gameOverPanel =
            document.getElementById("gameOverPanel");

        const levelPanel =
            document.getElementById("levelCompletePanel");

        if (gameOverPanel) gameOverPanel.hidden = false;
        if (levelPanel) levelPanel.hidden = true;

        showMazeMessage("GAME OVER! You lost all three lives.");

        const status =
            document.getElementById("mazeStatus");

        if (status) status.textContent = "GAME OVER";

        return;
    }

    mazePlayer = { x: 1, y: 1 };

    showMazeMessage(
        "A MEMORY GUARDIAN CAUGHT YOU! Lives remaining: " +
        mazeLives
    );

    drawMazeGame();
}


// =====================================================
// LEVEL COMPLETION
// =====================================================

function completeMazeLevel() {

    if (mazeWon) return;

    mazeWon = true;
    mazeRunning = false;

    stopMazeAnimation();

    mazeScore += 200;
    gameXP += 100;

    const levelPanel =
        document.getElementById("levelCompletePanel");

    const gameOverPanel =
        document.getElementById("gameOverPanel");

    const levelXP =
        document.getElementById("levelXP");

    if (gameOverPanel) gameOverPanel.hidden = true;

    if (mazeLevel === 4) {

        updateGameProgress();

        showMazeMessage(
            "FINAL BOSS DEFEATED! YOU SAVED THE MEMORY KINGDOM!"
        );

        finishMazeGame();

        return;
    }

    if (levelPanel) levelPanel.hidden = false;
    if (levelXP) levelXP.textContent = "100";

    updateGameProgress();

    const status =
        document.getElementById("mazeStatus");

    if (status) status.textContent = "LEVEL COMPLETED";

    showMazeMessage(
        "LEVEL " + (mazeLevel + 1) +
        " COMPLETED! +200 POINTS"
    );
}

// =====================================================
// FINAL GAME COMPLETION
// =====================================================

function finishMazeGame() {

    if (mazeGameCompleted) return;

    mazeGameCompleted = true;
    mazeRunning = false;
    mazeWon = true;

    stopMazeAnimation();

    gameXP += 500;

    localStorage.setItem("cacheQuestXP_" + playerKey, gameXP);
    localStorage.setItem("cacheQuestMazeCompleted", "true");

    updateGameProgress();

    const gameOverPanel =
        document.getElementById("gameOverPanel");

    const levelPanel =
        document.getElementById("levelCompletePanel");

    if (gameOverPanel) gameOverPanel.hidden = true;
    if (levelPanel) levelPanel.hidden = true;

    const message =
        document.getElementById("mazeMessage");

    if (message) {
        message.innerHTML = `
            🏆 YOU SAVED THE MEMORY KINGDOM!
            <br><br>
            All five levels completed!
            <br>
            Final Maze Score: ${mazeScore}
            <br>
            Final Bonus: +500 XP
            <br><br>
            <button onclick="restartFullMazeGame()">
                PLAY AGAIN
            </button>
            <button onclick="showScreen('dashboard')">
                BACK TO DASHBOARD
            </button>
        `;
    }

    const status =
        document.getElementById("mazeStatus");

    if (status) status.textContent = "KINGDOM SAVED!";
}


// =====================================================
// RESTART COMPLETE GAME
// =====================================================

function finishMazeGame() {

    if (mazeGameCompleted) return;

    mazeGameCompleted = true;
    mazeRunning = false;
    mazeWon = true;

    stopMazeAnimation();

    gameXP += 500;

    localStorage.setItem(
        "cacheQuestMazeCompleted_" + playerKey,
        "true"
    );

    updateGameProgress();

    const gameOverPanel =
        document.getElementById("gameOverPanel");

    const levelPanel =
        document.getElementById("levelCompletePanel");

    if (gameOverPanel) gameOverPanel.hidden = true;
    if (levelPanel) levelPanel.hidden = true;

    const message =
        document.getElementById("mazeMessage");

    if (message) {
        message.innerHTML = `
            🏆 YOU SAVED THE MEMORY KINGDOM!
            <br><br>
            All five levels completed!
            <br>
            Final Maze Score: ${mazeScore}
            <br>
            Final Bonus: +500 XP
            <br><br>
            <button onclick="restartFullMazeGame()">
                PLAY AGAIN
            </button>
            <button onclick="showScreen('dashboard')">
                BACK TO DASHBOARD
            </button>
        `;
    }

    const status =
        document.getElementById("mazeStatus");

    if (status) status.textContent = "KINGDOM SAVED!";
}

// =====================================================
// RESTART CURRENT LEVEL
// =====================================================

function restartMazeGame() {

    mazeLives = 3;
    mazeCollected = 0;
    mazeWon = false;
    mazeRunning = false;

    const gameOverPanel =
        document.getElementById("gameOverPanel");

    const levelPanel =
        document.getElementById("levelCompletePanel");

    if (gameOverPanel) gameOverPanel.hidden = true;
    if (levelPanel) levelPanel.hidden = true;

    startMazeLevel();

    showMazeMessage(
        "LEVEL RESTARTED! Collect all five crystals and reach the exit."
    );
}


// =====================================================
// MAZE MESSAGE
// =====================================================

function showMazeMessage(message) {

    const element =
        document.getElementById("mazeMessage");

    if (element) {
        element.textContent = message;
    }
}


// =====================================================
// KEYBOARD CONTROLS
// =====================================================

document.addEventListener("keydown", function (event) {

    const screen =
        document.getElementById("gameWorld");

    if (!screen || !screen.classList.contains("active")) return;

    const controls = {
        ArrowUp: [0, -1],
        w: [0, -1],
        W: [0, -1],

        ArrowDown: [0, 1],
        s: [0, 1],
        S: [0, 1],

        ArrowLeft: [-1, 0],
        a: [-1, 0],
        A: [-1, 0],

        ArrowRight: [1, 0],
        d: [1, 0],
        D: [1, 0]
    };

    const move = controls[event.key];

    if (move) {
        event.preventDefault();
        mazeMove(move[0], move[1]);
    }
});


// =====================================================
// 11. INITIALIZE CACHEQUEST
// =====================================================

updateGameProgress();
renderMissions();
drawMaze();
