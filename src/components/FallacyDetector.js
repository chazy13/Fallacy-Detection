// FallacyDetector.jsx - Main Logic & App
import { useState } from "react";


// CFG Grammar Rules
const ARGUMENT_GRAMMAR = {
    adHominem: { pattern: /(\b(?:bobo|tanga|walang pinag-aralan)\b).+(\b(?:kaya|dahil|kasi)\b).+(\b(?:mali|tama|dapat)\b)/gi, structure: "INSULT + CONNECTOR + CLAIM" },
    emotionalAppeal: { pattern: /(\b(?:kawawa|maawa)\b).+(\b(?:mga|ang)\b)\s+(\w+).+(\b(?:kaya|dahil)\b)/gi, structure: "EMOTION + TARGET + REASON" },
    bandwagon: { pattern: /(\b(?:lahat|marami|karamihan)\b).+(\b(?:gusto|suporta|ayaw)\b).+(\b(?:kaya|so)\b)/gi, structure: "MAJORITY + ACTION + CONCLUSION" },
    strawman: { pattern: /(\b(?:ibig mong sabihin|gusto mo|ayaw mo)\b).+(\b(?:ay|na|ng)\b).+(\b(?:mali|tama|dapat)\b)/gi, structure: "MISREPRESENTATION + CONNECTOR + CLAIM" },
    falseDilemma: { pattern: /(\b(?:kung hindi|either)\b).+(\b(?:o|or)\b).+(\b(?:walang|nothing)\b)/gi, structure: "CONDITION + OR + ALTERNATIVE" },
    whataboutism: { pattern: /(\b(?:paano naman|what about|eh yung)\b).+(\b(?:nila|kanila|mga)\b)/gi, structure: "DEFLECTION + COUNTER_SUBJECT" }
};

// PDA Stack Checker
function pdaAnalyze(sentence) {
    const stack = [],
        tokens = sentence.toLowerCase().split(/\s+/);
    let state = 'START',
        detectedStructure = [],
        hasPersonReference = false;

    tokens.forEach(token => {
        if (/ka|ikaw|mo|niya|siya/.test(token)) hasPersonReference = true;
        if (/bobo|tanga|ignorante|stupid|walang pinag-aralan/.test(token)) {
            stack.push('INSULT');
            state = 'HAS_INSULT';
            detectedStructure.push('INSULT');
        } else if (/kaya|dahil|kasi|because|so/.test(token) && state === 'HAS_INSULT') {
            stack.push('CONNECTOR');
            state = 'HAS_CONNECTOR';
            detectedStructure.push('CONNECTOR');
        } else if (/mali|tama|dapat|wrong|right|should/.test(token) && state === 'HAS_CONNECTOR') {
            stack.push('CLAIM');
            state = 'COMPLETE_AD_HOMINEM';
            detectedStructure.push('CLAIM');
        }
    });

    if (state === 'COMPLETE_AD_HOMINEM' && stack.length === 3 && hasPersonReference) {
        return { valid: true, fallacyType: 'Ad Hominem', structure: detectedStructure.join(' → '), confidence: 'HIGH' };
    }
    return { valid: false };
}

// Semantic Context
const ARGUMENT_INDICATORS = {
    pronouns: /\b(ka|ikaw|kayo|kita|mo|niya|siya|nila|sila|ninyo|natin|atin|namin|amin)\b/gi,
    connectors: /\b(kaya|dahil|kasi|because|so|therefore|kaya nga|dahil sa|kung|kapag|samantalang|pero|ngunit|subalit|at|however|but)\b/gi,
    claims: /\b(mali|tama|dapat|wrong|right|should|shouldn't|ayaw|gusto|need|kailangan|wag|huwag|maganda|pangit|masama|mabuti)\b/gi,
    verbs: /\b(sinabi|nagsabi|claims|argue|believes|thinks|says|told|mentioned)\b/gi
};

const NON_ARGUMENT_CONTEXTS = {
    descriptive: /\b(ang|ng|sa|na|ay|yung|nung|noong)\s+(lamesa|upuan|pinto|bintana|bahay|kotse|libro|cellphone|computer|phone|laptop|tablet|keyboard|mouse|monitor|damit|sapatos|pagkain|inumin|hayop|pusa|aso|manok|ibon|bagay|gamit|appliance|furniture|gadget)\b/gi,
    objects: /\b(lamesa|upuan|pinto|bintana|bahay|kotse|libro|cellphone|computer|phone|laptop|tablet|keyboard|mouse|monitor|damit|sapatos|pagkain|inumin|hayop|pusa|aso|manok|ibon|halaman|puno|bulaklak|bagay|gamit|appliance|furniture|gadget|tool|eraser|pencil|pen|notebook|bag|wallet|watch|clock)\b/gi,
    physicalDescriptors: /\b(malaki|maliit|puti|itim|pula|asul|berde|dilaw|malambot|matigas|mainit|malamig)\s+(ang|ng|yung)\s+/gi,
    possession: /\b(may|meron|wala)\s+(akong|kong|niyang|nyang)\s+/gi
};

function isArgumentativeContext(sentence) {
    const s = sentence.toLowerCase();
    if (NON_ARGUMENT_CONTEXTS.descriptive.test(s) || NON_ARGUMENT_CONTEXTS.physicalDescriptors.test(s) || NON_ARGUMENT_CONTEXTS.possession.test(s)) return false;
    if (NON_ARGUMENT_CONTEXTS.objects.test(s) && !ARGUMENT_INDICATORS.pronouns.test(s) && !ARGUMENT_INDICATORS.connectors.test(s)) return false;
    if (s.trim().split(/\s+/).length < 4) return false;

    const hasPronoun = ARGUMENT_INDICATORS.pronouns.test(s);
    const hasConnector = ARGUMENT_INDICATORS.connectors.test(s);
    const hasClaim = ARGUMENT_INDICATORS.claims.test(s);
    const hasVerb = ARGUMENT_INDICATORS.verbs.test(s);
    const indicatorCount = [hasPronoun, hasConnector, hasClaim, hasVerb].filter(Boolean).length;

    return hasPronoun && indicatorCount >= 3;
}

// Fallacy Patterns
const FALLACY_PATTERNS = [
    { type: "Ad Hominem (Personal Attack)", patterns: [/\b(bobo|tanga|abnoy|ignorante|stupid|dumb|walang pinag-aralan|walang kwenta|inutil|uneducated|bastos|dropout|corrupt|drug addict|taga-probinsya|mahirap|pulpol|bayaran|dilawan|DDS|walang trabaho|puro kabit|NPA supporter|komunista|trapo|elitista|walang experience|bata ka pa|lasing|showbiz|convicted|iskwater|ugly|walang asawa|adik|plastik|mukha|peke|balimbing|walang anak|atheist|chinese|LGBTQ+|matanda|divorced|puro social media|spoiled|brat|walang master's degree|bisaya|amerikano citizen|di ka naman taga dito|single)\b/gi], description: "Attacks the person instead of the argument", requiresContext: true },
    { type: "Appeal to Emotion", patterns: [/\b(kawawa|maawa|isipin ang mga|paghihirap|masakit sa damdamin|luha ng|think of the children|mawawalan ng kinabukasan|kapakanan|mahal|takot|nangungulila|umiiyak|galit|kinabukasan|mamamamatay|mag-isa|nasasaktan|mapapahiya|namatay|iiyak|mawawala|sawa na|mamamatay|nakakaawa|ginawa ko lahat|dumudugo|legacy|konsensya|susunugin|Diyos|bayan|naaawa|nagmamakaawa|walang kinabukasan|kilabot|hindi kita bibiguin|nasasaktan|magagalit|pinaghirapan|walang makain)\b/gi], description: "Uses emotional manipulation to persuade", requiresContext: true },
    { type: "Bandwagon (Argumentum ad Populum)", patterns: [/\b(lahat naman|karamihan|uso na|sikat na|buong bayan|lahat|everyone|most|majority|popular|lahat ng|approval rating|maraming|trending|nanalo sa survey|milyun-milyong tao|pinaka-popular|number 1 sa poll|viral|sabi ng survey|buong bansa|sold out ang rally|top choice|nationwide support)\b/gi], description: "Claims truth based on popularity", requiresContext: true },
    { type: "Strawman", patterns: [/\b(ibig mong sabihin ay|bumagsak ang bansa|ayaw mo ng kaunlaran|so you're saying|galit ka lang|sinasabi mo na dapat|gusto mo|pabayaan ang|gusto mong|adik ka siguro|hatiin|pabor ka|ka pala|sumusuporta ka|bahala na pala|anti-|sirain ang|lawless society|okay lang sayo|ayaw mo|walang projects|ka no|ka ba|pabor ka|may tinatago ka ba|takot ka|government control|sirain ang simbahan|may ginagamit ka|balik sa|ayaw mo ng|sayang|bmalik sa|mas importante sayo)\b/gi], description: "Misrepresents an opponent's argument", requiresContext: true },
    { type: "False Dilemma", patterns: [/\b(o ako o siya|dalawa lang ang pagpipilian|either you support this or you're against us|walang ibang pagpipilian|kung hindi ka|kasama mo kami o kalaban|either|gusto mo na ba|walang iba|kung ayaw mo eh di|walang gitna|ayaw mo)\b/gi], description: "Limits choices to only two options", requiresContext: true },
    { type: "Whataboutism", patterns: [/\b(paano naman|yung ginawa nila|what about|how about|bakit hindi ninyo banggitin|ano naman ang sa kanila|eh yung kalaban mo|ikaw din naman|eh yung mga|eh yung|eh si|ikaw naman perpekto|ikaw ba|sila ba)\b/gi], description: "Deflects criticism to another issue", requiresContext: true }
];

// CFG Parser
function cfgParse(sentence) {
    let cfgResults = [];
    Object.entries(ARGUMENT_GRAMMAR).forEach(([key, grammar]) => {
        if (grammar.pattern.test(sentence)) {
            cfgResults.push({ matched: true, type: key.replace(/([A-Z])/g, ' $1').trim(), structure: grammar.structure });
        }
    });
    return cfgResults.length > 0 ? cfgResults : null;
}

// Main Detection
function detectFallacies(text) {
    const sentences = text.replace(/\n+/g, ". ").trim().split(/(?<=[.!?])\s+/).filter(Boolean);
    let sentenceAnalysis = [],
        allDetected = [];

    sentences.forEach((sentence, index) => {
        let detected = [];
        const isArgument = isArgumentativeContext(sentence);

        FALLACY_PATTERNS.forEach(rule => {
            rule.patterns.forEach(pattern => {
                const matches = sentence.match(pattern);
                if (matches && (!rule.requiresContext || isArgument)) {
                    matches.forEach(match => {
                        detected.push({ type: rule.type, text: match, description: rule.description, cfg: cfgParse(sentence), pda: pdaAnalyze(sentence), isArgument });
                    });
                }
            });
        });

        if (detected.length > 0) {
            sentenceAnalysis.push({ sentenceNumber: index + 1, sentence, fallacies: detected, isArgumentative: isArgument });
            allDetected.push(...detected);
        }
    });

    const fallacyCounts = {};
    allDetected.forEach(f => { fallacyCounts[f.type] = (fallacyCounts[f.type] || 0) + 1; });

    return { totalFallacies: allDetected.length, fallacyCounts, sentenceAnalysis };
}

// Main Component
export default function FallacyDetector() {
    const [text, setText] = useState("");
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const analyzeSpeech = () => {
        if (!text.trim()) return alert("Please enter a speech!");
        setIsLoading(true);
        setResults(null);
        setTimeout(() => {
            setResults(detectFallacies(text));
            setIsLoading(false);
        }, 800);
    };

    return ( <
            div className = "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4" >
            <
            div className = "max-w-4xl mx-auto" >
            <
            Header / >

            <
            InputSection text = { text }
            setText = { setText }
            isLoading = { isLoading }
            onAnalyze = { analyzeSpeech }
            onReset = {
                () => {
                    setText("");
                    setResults(null);
                }
            }
            />

            {
                results && < ResultsSection results = { results }
                />} < /
                div > <
                    /div>
            );