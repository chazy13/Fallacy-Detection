import { useState } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

//CFG RULES / FALLACY DEFINITIONS (CFG Parser: Parse Rules, Identify Arguments).
const FALLACY_PATTERNS = [{
        type: "Ad Hominem (Personal Attack)",
        patterns: [
            /\b(bobo|tanga|abnoy|ignorante|stupid|dumb|walang pinag-aralan|walang kwenta|inutil|uneducated)\b/gi
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
            /\b(lahat naman|karamihan|uso na|sikat na|buong bayan|lahat ng botante|everyone|most people|majority)\b/gi
        ],
        description: "Claims truth based on popularity"
    },
    {
        type: "Strawman",
        patterns: [
            /\b(ibig mong sabihin ay|bumagsak ang bansa|ayaw mo ng kaunlaran|so you're saying)\b/gi
        ],
        description: "Misrepresents an opponent's argument"
    },
    {
        type: "False Dilemma",
        patterns: [
            /\b(o ako o siya|dalawa lang ang pagpipilian|either you support this or you're against us)\b/gi
        ],
        description: "Limits choices to only two options"
    },
    {
        type: "Whataboutism",
        patterns: [
            /\b(paano naman|yung ginawa nila|what about|how about)\b/gi
        ],
        description: "Deflects criticism to another issue"
    }
];


//PREPROCESSING (Tokenization, Normalization, Remove Fillers)
function preprocessText(text) {
    return text.replace(/\n+/g, ". ").trim();
}

function splitIntoSentences(text) {
    return text.split(/(?<=[.!?])\s+/).filter(Boolean);
}

//PDA FALLACY DETECTION (Stack Operations, Analyze Patterns)
function detectFallacies(text) {
    const sentences = splitIntoSentences(preprocessText(text));

    let sentenceAnalysis = [];
    let allDetected = [];

    sentences.forEach((sentence, index) => {
        let detected = [];

        // PDA + CFG pattern matching
        FALLACY_PATTERNS.forEach(rule => {
            rule.patterns.forEach(pattern => {
                const matches = sentence.match(pattern);

                //DECISION:Fallacy Found?

                if (matches) {
                    matches.forEach(match => {

                        //Record Detected Fallacy
                        detected.push({
                            type: rule.type,
                            text: match,
                            description: rule.description
                        });
                    });
                }
            });
        });

        if (detected.length > 0) {
            sentenceAnalysis.push({
                sentenceNumber: index + 1,
                sentence,
                fallacies: detected
            });
            allDetected.push(...detected);
        }
    });

    // Summary ng Fallacy
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

// IO Interface
export default function FallacyDetector() {
    /* INPUT: Filipino Text */
    const [text, setText] = useState("");
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    //Process Pipeline
    const analyzeSpeech = () => {
        if (!text.trim()) return alert("Please enter a speech!");

        setIsLoading(true);
        setResults(null);

        setTimeout(() => {
            setResults(detectFallacies(text));
            setIsLoading(false);
        }, 800);
    };

    const resetAnalysis = () => {
        setText("");
        setResults(null);
    };

    return ( <
        div className = "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4" >
        <
        div className = "max-w-4xl mx-auto" >

        { /* INPUT */ } <
        textarea value = { text }
        onChange = { e => setText(e.target.value) }
        placeholder = "Paste Filipino political speech here..."
        className = "w-full h-48 p-4 border rounded-lg" /
        >

        { /* PROCESS */ } <
        button onClick = { analyzeSpeech } >
        Analyze Speech <
        /button>

        { /* OUTPUT */ } {
            results && ( <
                div >
                <
                p > Total Fallacies: { results.totalFallacies } < /p>

                {
                    results.sentenceAnalysis.map(item => ( <
                        div key = { item.sentenceNumber } >
                        <
                        p > "{item.sentence}" < /p>

                        {
                            item.fallacies.map((f, i) => ( <
                                div key = { i } >
                                <
                                AlertCircle / >
                                <
                                strong > { f.type } < /strong> <
                                p > Trigger: { f.text } < /p> <
                                p > { f.description } < /p> < /
                                div >
                            ))
                        } <
                        /div>
                    ))
                } <
                /div>
            )
        }

        { /* END */ } <
        /div> < /
        div >
    );
}