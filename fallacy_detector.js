
//Fallacies

const FALLACY_PATTERNS = [
    {
        type: "Ad Hominem (Personal Attack)",
        patterns: [
            /\b(bobo|tanga|abnoy|ignorante| stupid|dumb|walang pinag-aralan|walang kwenta|inutil|uneducated)\b/gi
        ],
        description: "Attacks the person instead of the argument"
    },
    {
        type: "Appeal to Emotion",
        patterns: [
            /\b(kawawa|maawa|isipin ang mga bata|paghihirap|masakit sa damdamin|luha ng bayan|think of the children)\b/gi
        ],
        description: "Uses emotional manipulation to persuade"
    },
    {
        type: "Bandwagon (Argumentum ad Populum)",
        patterns: [
            /\b(lahat naman|karamihan|uso na|sikat na|buong bayan|lahat ng botante|popular na opinyon|everyone|most people|majority|widely accepted|trending|popular belief|everyone)\b/gi
        ],
        description: "Claims something is true because many people believe it"
    },
    {
        type: "Strawman",
        patterns: [
            /\b(ibig mong sabihin ay|bumagsak ang bansa|ayaw mo ng kaunlaran|galit ka lang sa gobyerno|sinasabi mo na dapat|so you’re saying)\b/gi
        ],
        description: "Misrepresents an opponent’s argument (surface-level detection)"
    },
    {
        type: "False Dilemma",
        patterns: [
            /\b(o ako o siya|wala kang ibang pagpipilian|kung hindi ka pabor, kalaban ka|dalawa lang ang pagpipilian|either…or|either you support this or you’re against us)\b/gi
        ],
        description: "Presents only two choices when more options exist"
    },
    {
        type: "Whataboutism",
        patterns: [
            /\b(paano naman|yung ginawa nila|bakit hindi ninyo banggitin|ano naman ang sa kanila|what about|how about)\b/gi
        ],
        description: "Deflects criticism by pointing to another issue"
    }
];
 // PREPROCESSING STAGE

function preprocessText(text) {
    return text
        .replace(/\n+/g, ". ")
        .trim();
}

//Sentence Segmentation
function splitIntoSentences(text) {
    return text
        .split(/(?<=[.!?])\s+/)
        .filter(s => s.length > 0);
}

//Parsing and Pattern Analysis

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

    //Semantic Aggression

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

//System Pipeline

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

//Output

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
