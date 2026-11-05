
const quizData = [
    {
        question: "Which memory is the fastest in the memory hierarchy?",
        options: [
            "Main Memory",
            "Cache Memory",
            "CPU Registers",
            "Secondary Storage"
        ],
        answer: 2,
        explanation: "CPU registers are the fastest storage locations and are directly accessible by the processor."
    },
    {
        question: "What is the main purpose of cache memory?",
        options: [
            "To increase hard disk capacity",
            "To reduce average memory access time",
            "To replace the CPU",
            "To store permanent files"
        ],
        answer: 1,
        explanation: "Cache stores frequently accessed data to reduce the time required to access main memory."
    },
    {
        question: "What is a cache hit?",
        options: [
            "Data is not available in cache",
            "Data is found in cache",
            "Cache memory is full",
            "Main memory is deleted"
        ],
        answer: 1,
        explanation: "A cache hit occurs when the requested data is already present in cache."
    },
    {
        question: "What is a cache miss?",
        options: [
            "Requested data is absent from cache",
            "Requested data is in a register",
            "Cache access is successful",
            "Data is permanently deleted"
        ],
        answer: 0,
        explanation: "A cache miss occurs when the requested data must be retrieved from a lower memory level."
    },
    {
        question: "Which mapping technique allows any memory block to occupy any cache line?",
        options: [
            "Direct Mapping",
            "Fully Associative Mapping",
            "Set Associative Mapping",
            "Sequential Mapping"
        ],
        answer: 1,
        explanation: "Fully associative mapping allows a memory block to be placed in any available cache line."
    },
    {
        question: "In direct mapping, where can a memory block be placed?",
        options: [
            "Anywhere in cache",
            "Only in a particular cache line",
            "Only in main memory",
            "In every cache line"
        ],
        answer: 1,
        explanation: "Direct mapping assigns each memory block to one specific cache line."
    },
    {
        question: "What does LRU stand for?",
        options: [
            "Least Recently Used",
            "Last Required Unit",
            "Least Required Usage",
            "Last Recently Updated"
        ],
        answer: 0,
        explanation: "LRU replaces the cache block that has not been used for the longest time."
    },
    {
        question: "What does FIFO stand for in cache replacement?",
        options: [
            "First In First Out",
            "Fast Input Fast Output",
            "First Input Final Output",
            "File In File Out"
        ],
        answer: 0,
        explanation: "FIFO replaces the block that entered the cache earliest."
    },
    {
        question: "Which principle explains why recently accessed data is likely to be accessed again?",
        options: [
            "Spatial Locality",
            "Temporal Locality",
            "Sequential Mapping",
            "Virtual Addressing"
        ],
        answer: 1,
        explanation: "Temporal locality means recently accessed instructions or data are likely to be accessed again."
    },
    {
        question: "What does AMAT stand for?",
        options: [
            "Average Memory Access Time",
            "Advanced Memory Allocation Technique",
            "Automatic Memory Address Translation",
            "Average Main Address Transfer"
        ],
        answer: 0,
        explanation: "AMAT represents the average time required to access memory, considering cache hits and misses."
    }
];
