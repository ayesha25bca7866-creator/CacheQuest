
// ========================================
// CACHEQUEST - CACHE SIMULATION ENGINE
// ========================================

function runCacheSimulation(
    blockNumbers,
    mappingType,
    cacheLines,
    ways = 1,
    replacementPolicy = "LRU"
) {
    // 1. VALIDATE INPUTS

    if (!Array.isArray(blockNumbers) || blockNumbers.length === 0) {
        throw new Error("Enter at least one memory block.");
    }

    if (!Number.isInteger(cacheLines) || cacheLines < 1) {
        throw new Error("Cache lines must be a positive integer.");
    }

    if (!["direct", "associative", "set-associative"].includes(mappingType)) {
        throw new Error("Invalid mapping type.");
    }

    if (!["FIFO", "LRU"].includes(replacementPolicy)) {
        throw new Error("Replacement policy must be FIFO or LRU.");
    }

    if (
        mappingType === "set-associative" &&
        (
            !Number.isInteger(ways) ||
            ways < 1 ||
            ways > cacheLines ||
            cacheLines % ways !== 0
        )
    ) {
        throw new Error(
            "Number of ways must be a positive divisor of the cache lines."
        );
    }

    for (const block of blockNumbers) {
        if (!Number.isInteger(block) || block < 0) {
            throw new Error(
                "Memory blocks must be non-negative integers."
            );
        }
    }

    // 2. DETERMINE CACHE ORGANIZATION

    let numberOfSets;
    let capacityPerSet;

    if (mappingType === "direct") {
        numberOfSets = cacheLines;
        capacityPerSet = 1;
    } else if (mappingType === "associative") {
        numberOfSets = 1;
        capacityPerSet = cacheLines;
    } else {
        numberOfSets = cacheLines / ways;
        capacityPerSet = ways;
    }

    // 3. CREATE EMPTY CACHE

    const cache = Array.from(
        { length: numberOfSets },
        () => []
    );

    let hits = 0;
    let misses = 0;
    let accessTime = 0;

    const trace = [];

    // 4. PROCESS EACH MEMORY BLOCK

    blockNumbers.forEach(function (block) {

        let targetSet;
        let tag;
        let location;

        // DIRECT MAPPING
        if (mappingType === "direct") {
            location = block % cacheLines;
            tag = Math.floor(block / cacheLines);

            targetSet = cache[location];
        }

        // FULLY ASSOCIATIVE MAPPING
        else if (mappingType === "associative") {
            location = 0;
            tag = block;

            targetSet = cache[0];
        }

        // SET-ASSOCIATIVE MAPPING
        else {
            location = block % numberOfSets;
            tag = Math.floor(block / numberOfSets);

            targetSet = cache[location];
        }

        // 5. CHECK WHETHER BLOCK ALREADY EXISTS

        const existingIndex = targetSet.findIndex(
            entry => entry.block === block
        );

        let result;
        let replacedBlock = null;

        // 6. CACHE HIT

        if (existingIndex !== -1) {

            hits++;
            result = "HIT";

            // Update recent usage for LRU.
            // FIFO does not use lastUsed for replacement.
            targetSet[existingIndex].lastUsed = accessTime;

        }

        // 7. CACHE MISS

        else {

            misses++;
            result = "MISS";

            const newEntry = {
                block: block,
                tag: tag,
                loadedAt: accessTime,
                lastUsed: accessTime
            };

            // 8. CHECK WHETHER CACHE SET IS FULL

            if (targetSet.length >= capacityPerSet) {

                let victimIndex = 0;

                // Direct mapping always replaces its existing line.
                // Associative mappings use the selected policy.

                if (mappingType !== "direct") {

                    if (replacementPolicy === "LRU") {

                        // Least Recently Used
                        victimIndex = targetSet.reduce(
                            (oldestIndex, entry, index, array) =>
                                entry.lastUsed <
                                array[oldestIndex].lastUsed
                                    ? index
                                    : oldestIndex,
                            0
                        );

                    } else {

                        // First In First Out
                        victimIndex = targetSet.reduce(
                            (oldestIndex, entry, index, array) =>
                                entry.loadedAt <
                                array[oldestIndex].loadedAt
                                    ? index
                                    : oldestIndex,
                            0
                        );

                    }
                }

                replacedBlock = targetSet[victimIndex].block;

                targetSet.splice(victimIndex, 1);
            }

            // Insert the new memory block.
            targetSet.push(newEntry);
        }

        // 9. SAVE THIS ACCESS FOR ANIMATION AND RESULTS

        trace.push({
            block: block,
            result: result,
            location: location,
            tag: tag,
            replacedBlock: replacedBlock,

            cacheState: cache.map(set =>
                set.map(entry => entry.block)
            )
        });

        accessTime++;

    });

    // 10. CALCULATE FINAL PERFORMANCE

    const totalAccesses = hits + misses;

    const hitRatio = hits / totalAccesses;
    const missRatio = misses / totalAccesses;

    // 11. RETURN RESULTS TO THE WEBSITE

    return {
        mappingType: mappingType,
        replacementPolicy: replacementPolicy,

        hits: hits,
        misses: misses,
        totalAccesses: totalAccesses,

        hitRatio: hitRatio,
        missRatio: missRatio,

        trace: trace,

        finalCache: cache.map(set =>
            set.map(entry => entry.block)
        )
    };
}
