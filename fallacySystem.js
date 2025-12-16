/* =========================================================
   FALLACY DETECTION SYSTEM
   Compiler-Inspired Architecture
   Lexical Analysis → Sentence Parsing → Pattern Matching
   ========================================================= */

/* ---------------- FALLACY KNOWLEDGE BASE ---------------- */

const FALLACY_PATTERNS = [
    {
        type: "Ad Hominem (Personal Attack)",
        patterns: [
            /\b(bobo|tanga|gago|engot|ulol|abnoy|ignorante|tonto|tangina|stupid|dumb)\b/gi,
            /\b(walang alam|walang kwenta|palpak siya|inutil)\b/gi,
            /\b(mahina utak mo|bakit ka nakikinig diyan)\b/gi
        ],
        description: "Attacks the person instead of the argument"
    },
    {
        type: "Appeal to Emotion",
        patterns: [
            /\b(kawawa|nakakaawa|nakakalungkot|kaawa awa|awa|maawa)\b/gi,
            /\b(para sa kinabukasan|para sa mga bata|para sa ating mga anak)\b/gi
        ],
        description: "Uses emotional manipulation to persuade"
    },
    {
        type: "Bandwagon",
        patterns: [
            /\b(lahat|karamihan|most people|majority)\b.*\b(sumusuporta|sang-ayon|bobotohin)\b/gi,
            /\b(uso na|trend|trending|sikat na)\b/gi
        ],
        description: "Claims something is true because many people believe it"
    },
    {
        type: "False Dilemma",
        patterns: [
            /\b(o ako o siya|o sila o tayo)\b/gi,
            /\b(walang ibang pagpipilian|only two choices)\b/gi
        ],
        description: "Presents only two options even when more exist"
    },
    {
        type: "Whataboutism",
        patterns: [
            /\b(eh ano naman yung|eh paano naman yung)\b/gi,
            /\b(what about|how about)\b/gi
        ],
        description: "Avoids the issue by comparing unrelated faults"
    }
];

/* ---------------- 1. LEXICAL / PREPROCESSING STAGE ---------------- */

function preprocessText(text) {
    return text
        .replace(/\n+/g, ". ")
        .trim();
}

/* Sentence segmentation = basic lexical unit for discourse */
function splitIntoSentences(text) {
    return text
        .split(/(?<=[.!?])\s+/)
        .filter(s => s.length > 0);
}

/* ---------------- 2. PARSING & PATTERN ANALYSIS ---------------- */

function detectFallacies(text) {
    const cleanText = preprocessText(text);
    const sentences = splitIntoSentences(cleanText);

    let sentenceAnalysis = [];
    let allDetected = [];

    sentences.forEach((sentence, index) => {
        let detectedInSentence = [];

        FALLACY_PATTERNS.forEach(rule => {
            rule.patterns.forEach(pattern => {
                const matches = sentence.match(pattern);
                if (matches) {
                    matches.forEach(match => {
                        detectedInSentence.push({
                            type: rule.type,
                            text: match,
                            description: rule.description
                        });
                    });
                }
            });
        });

        if (detectedInSentence.length > 0) {
            sentenceAnalysis.push({
                sentenceNumber: index + 1,
                sentence: sentence,
                fallacies: detectedInSentence
            });
            allDetected.push(...detectedInSentence);
        }
    });

    /* ---------------- 3. SEMANTIC AGGREGATION ---------------- */

    const fallacyCounts = {};
    allDetected.forEach(f => {
        fallacyCounts[f.type] = (fallacyCounts[f.type] || 0) + 1;
    });

    return {
        totalFallacies: allDetected.length,
        fallacyCounts,
        sentenceAnalysis
    };
}

/* ---------------- 4. CONTROLLER (SYSTEM PIPELINE) ---------------- */

function analyzeSpeech() {
    const text = document.getElementById("speechInput").value.trim();
    if (!text) {
        alert("Please enter a speech!");
        return;
    }

    document.getElementById("loadingSection").style.display = "block";
    document.getElementById("resultsSection").style.display = "none";

    /* Simulate processing delay (academic demo) */
    setTimeout(() => {
        const results = detectFallacies(text);
        displayResults(results);
        document.getElementById("loadingSection").style.display = "none";
        document.getElementById("resultsSection").style.display = "block";
    }, 800);
}

/* ---------------- 5. OUTPUT & VISUALIZATION ---------------- */

function displayResults(result) {
    const container = document.getElementById("resultsSection");
    let html = "";

    if (result.totalFallacies === 0) {
        container.innerHTML = `
            <div class="no-fallacy">
                <h3>✅ No logical fallacies detected!</h3>
                <p>The speech appears logically sound.</p>
            </div>
        `;
        return;
    }

    html += `
        <h2>📊 Summary</h2>
        <p>Total Fallacies Detected: <strong>${result.totalFallacies}</strong></p>
        <hr>
        <h3>📈 Fallacy Distribution</h3>
    `;

    for (const [type, count] of Object.entries(result.fallacyCounts)) {
        html += `<p><strong>${type}</strong>: ${count}</p>`;
    }

    html += `<hr><h3>📝 Sentence-Level Analysis</h3>`;

    result.sentenceAnalysis.forEach(item => {
        html += `
            <div class="sentence-card">
                <strong>Sentence #${item.sentenceNumber}</strong>
                <div class="sentence-text">${item.sentence}</div>
        `;

        item.fallacies.forEach(f => {
            html += `
                <div class="fallacy-detail">
                    <strong>${f.type}</strong><br>
                    ❌ Trigger: <em>${f.text}</em><br>
                    💡 ${f.description}
                </div>
            `;
        });

        html += `</div>`;
    });

    container.innerHTML = html;
}
