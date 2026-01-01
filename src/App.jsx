import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// CFG Grammar Rules 
const ARGUMENT_GRAMMAR = {
  adHominem: { 
    pattern: /(\b(?:bobo|tanga|walang pinag-aralan|ignorante|stupid)\b).+(\b(?:ka|ikaw|mo|niya|siya)\b).+(\b(?:kaya|dahil|kasi)\b).+(\b(?:mali|tama|dapat)\b)/gi, 
    structure: "INSULT + PERSON_REF + CONNECTOR + CLAIM" 
  },
  emotionalAppeal: { 
    pattern: /(\b(?:kawawa|maawa|isipin ang mga)\b).+(\b(?:mga|ang)\b)\s+(\w+).+(\b(?:kaya|dahil|dapat)\b)/gi, 
    structure: "EMOTION + TARGET + REASON" 
  },
  bandwagon: { 
    pattern: /(\b(?:lahat|marami|karamihan|milyun-milyong)\b).+(\b(?:gusto|suporta|ayaw|naniniwala)\b).+(\b(?:kaya|so|dahil|dapat)\b)/gi, 
    structure: "MAJORITY + ACTION + CONCLUSION" 
  },
  strawman: { 
    pattern: /(\b(?:ibig mong sabihin|gusto mo|ayaw mo|sinasabi mo)\b).+(\b(?:ay|na|ng)\b).+(\b(?:mali|tama|dapat|pabayaan|sirain)\b)/gi, 
    structure: "MISREPRESENTATION + CONNECTOR + CLAIM" 
  },
  falseDilemma: { 
    pattern: /(\b(?:kung hindi|either|dalawa lang)\b).+(\b(?:o|or)\b).+(\b(?:walang|nothing|wala)\b)/gi, 
    structure: "CONDITION + OR + ALTERNATIVE" 
  },
  whataboutism: { 
    pattern: /(\b(?:paano naman|what about|eh yung|bakit hindi)\b).+(\b(?:nila|kanila|mga|sila)\b)/gi, 
    structure: "DEFLECTION + COUNTER_SUBJECT" 
  }
};

// PDA Stack Checker 
function pdaAnalyze(sentence) {
  const stack = [];
  const tokens = sentence.toLowerCase().split(/\s+/);
  let state = 'START';
  let detectedStructure = [];
  let hasPersonReference = false;

  tokens.forEach(token => {
    // Check for person reference
    if (/\b(ka|ikaw|mo|niya|siya|kayo|nila)\b/.test(token)) {
      hasPersonReference = true;
    }
    
    // State machine transitions
    if (state === 'START' && /\b(bobo|tanga|ignorante|stupid|walang pinag-aralan|inutil|abnoy)\b/.test(token)) {
      stack.push('INSULT');
      state = 'HAS_INSULT';
      detectedStructure.push('INSULT');
    } 
    else if (state === 'HAS_INSULT' && /\b(kaya|dahil|kasi|because|so|therefore)\b/.test(token)) {
      stack.push('CONNECTOR');
      state = 'HAS_CONNECTOR';
      detectedStructure.push('CONNECTOR');
    } 
    else if (state === 'HAS_CONNECTOR' && /\b(mali|tama|dapat|wrong|right|should|ayaw|gusto)\b/.test(token)) {
      stack.push('CLAIM');
      state = 'COMPLETE_AD_HOMINEM';
      detectedStructure.push('CLAIM');
    }
  });

  // Check for complete valid structure with person reference
  if (state === 'COMPLETE_AD_HOMINEM' && stack.length === 3 && hasPersonReference) {
    return { 
      valid: true, 
      fallacyType: 'Ad Hominem', 
      structure: detectedStructure.join(' → '), 
      confidence: 'HIGH' 
    };
  }
  
  // Check for partial matches (lower confidence)
  if (state === 'HAS_CONNECTOR' && stack.length >= 2 && hasPersonReference) {
    return {
      valid: true,
      fallacyType: 'Ad Hominem',
      structure: detectedStructure.join(' → '),
      confidence: 'MEDIUM'
    };
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

// Fallacy patterns 
const FALLACY_PATTERNS = [
    {
        type: "Ad Hominem (Personal Attack)",
        patterns: [
            /\b(bobo|tanga|abnoy|ignorante|stupid|dumb|walang pinag-aralan|walang kwenta|inutil|uneducated|bastos|dropout|corrupt|drug addict|taga-probinsya|mahirap|pulpol|bayaran|dilawan|DDS|walang trabaho|puro kabit|NPA supporter|komunista|trapo|elitista|walang experience|bata ka pa|lasing|showbiz|convicted|iskwater|ugly|walang asawa|adik|plastik|mukha|peke|balimbing|walang anak|atheist|chinese|LGBTQ+|matanda|divorced|puro social media|spoiled|brat|walang master's degree|bisaya|amerikano citizen|di ka naman taga dito|single)\b/gi
        ],
        contextRequired: true,
        description: "Attacks the person instead of the argument"
    },
    {
        type: "Appeal to Emotion",
        patterns: [
            /\b(kawawa|maawa|isipin ang mga|paghihirap|masakit sa damdamin|luha ng|think of the children|mawawalan ng kinabukasan|kapakanan|maawa|mahal|takot|nangungulila|umiiyak|galit|kinabukasan|kawawa|mamamamatay|mag-isa|nasasaktan|mapapahiya|namatay|iiyak|mawawala|sawa na|mamamatay|nakakaawa|ginawa ko lahat|dumudugo|legacy|konsensya|susunugin|Diyos|bayan|naaawa|nagmamakaawa|walang kinabukasan|kilabot|hindi kita bibiguin|nasasaktan|magagalit|pinaghirapan|walang makain|namatay)\b/gi
        ],
        contextRequired: true,
        description: "Uses emotional manipulation to persuade"
    },
    {
        type: "Bandwagon (Argumentum ad Populum)",
        patterns: [
            /\b(lahat naman|karamihan|uso na|sikat na|buong bayan|lahat|everyone|most|majority|popular|lahat|lahat ng|approval rating|maraming|trending|nanalo sa survey|milyun-milyong tao|pinaka-popular|number 1 sa poll|viral|sabi ng survey|maraming|buong bansa|sold out ang rally|top choice|nationwide support)\b/gi
        ],
        contextRequired: true,
        description: "Claims truth based on popularity"
    },
    {
        type: "Strawman",
        patterns: [
            /\b(ibig mong sabihin ay|bumagsak ang bansa|ayaw mo ng kaunlaran|so you're saying|galit ka lang|sinasabi mo na dapat|gusto mo|pabayaan ang|gusto mong|adik ka siguro|hatiin|pabor ka|ka pala|sumusuporta ka|bahala na pala|anti-|sirain ang|lawless society|okay lang sayo|ayaw mo|walang projects|ka no|ka ba|pabor ka|may tinatago ka ba|takot ka|government control|ayaw mo|anti-progress ka|sirain ang simbahan|may ginagamit ka|balik sa|ayaw mo ng |sayang|bmalik sa|mas importante sayo)\b/gi
        ],
        contextRequired: true,
        description: "Misrepresents an opponent's argument"
    },
    {
        type: "False Dilemma",
        patterns: [
            /\b(o ako o siya|dalawa lang ang pagpipilian|either you support this or you're against us|walang ibang pagpipilian|kung hindi ka|kasama mo kami o kalaban|either|gusto mo na ba|walang iba|kung ayaw mo eh di|walang gitna|ayaw mo)\b/gi
        ],
        contextRequired: true,
        description: "Limits choices to only two options"
    },
    {
        type: "Whataboutism",
        patterns: [
            /\b(paano naman|yung ginawa nila|what about|how about|bakit hindi ninyo banggitin|ano naman ang sa kanila|eh yung kalaban mo|ikaw din naman|eh yung mga|eh yung|eh si|ikaw naman perpekto|ikaw ba|sila ba)\b/gi
        ],
        contextRequired: true,
        description: "Deflects criticism to another issue"
    }
];

// CFG Parser
function cfgParse(sentence) {
  let cfgResults = [];
  Object.entries(ARGUMENT_GRAMMAR).forEach(([key, grammar]) => {
    if (grammar.pattern.test(sentence)) {
      cfgResults.push({ 
        matched: true, 
        type: key.replace(/([A-Z])/g, ' $1').trim(), 
        structure: grammar.structure 
      });
    }
  });
  return cfgResults.length > 0 ? cfgResults : null;
}

// Check if a sentence is argumentative 
function isArgumentative(sentence) {
    const s = sentence.toLowerCase();
    const wordCount = s.split(/\s+/).length;
    
    // Too short to be argumentative
    if (wordCount < 4) return false;

    // Filter out clearly descriptive/neutral sentences
    const descriptive = /\b(lamesa|upuan|pinto|bintana|bahay|kotse|libro|cellphone|computer|phone|laptop|tablet|keyboard|mouse|sapatos|damit|hayop|puno|bagay)\b/;
    if (descriptive.test(s)) return false;
    
    // Check for greetings or casual statements
    const casual = /^(hi|hello|kumusta|kamusta|good morning|good afternoon|salamat|thank you)\b/i;
    if (casual.test(s)) return false;

    // Count argumentative indicators
    const hasPronoun = /\b(ikaw|ka|kayo|mo|niya|siya|nila|sila|natin|atin)\b/.test(s);
    const hasConnector = /\b(kaya|dahil|kasi|so|therefore|pero|ngunit|subalit)\b/.test(s);
    const hasClaim = /\b(mali|tama|dapat|ayaw|gusto|need|kailangan|wag|huwag|maganda|pangit|masama|mabuti)\b/.test(s);
    const hasVerb = /\b(sinabi|nagsabi|sabi|claims|believes|thinks|told|mentioned)\b/.test(s);

    // Need at least 2 indicators for argumentative
    return [hasPronoun, hasConnector, hasClaim, hasVerb].filter(Boolean).length >= 2;
}

// Check if pattern match has proper context - NEW
function hasProperContext(sentence, rule) {
  if (!rule.contextRequired) return true;
  
  const s = sentence.toLowerCase();
  
  // For Ad Hominem: must have person reference + connector or claim
  if (rule.type === "Ad Hominem (Personal Attack)") {
    const hasPerson = /\b(ka|ikaw|mo|niya|siya|kayo)\b/.test(s);
    const hasConnector = /\b(kaya|dahil|kasi|so)\b/.test(s);
    const hasClaim = /\b(mali|tama|dapat)\b/.test(s);
    return hasPerson && (hasConnector || hasClaim);
  }
  
  // For Emotional Appeal: must have connector or directive
  if (rule.type === "Appeal to Emotion") {
    const hasConnector = /\b(kaya|dahil|dapat|kailangan)\b/.test(s);
    return hasConnector && sentence.length > 30;
  }
  
  // For Bandwagon: must have action verb + connector
  if (rule.type === "Bandwagon (Argumentum ad Populum)") {
    const hasAction = /\b(gusto|suporta|ayaw|naniniwala|bumoto)\b/.test(s);
    const hasConnector = /\b(kaya|so|dahil|dapat)\b/.test(s);
    return hasAction && hasConnector;
  }
  
  // For Strawman: must have pronoun reference
  if (rule.type === "Strawman") {
    const hasPronoun = /\b(mo|ka|ikaw)\b/.test(s);
    return hasPronoun;
  }
  
  // For False Dilemma: must have "or" structure
  if (rule.type === "False Dilemma") {
    return /\b(o|or)\b/.test(s);
  }
  
  // For Whataboutism: must have deflection structure
  if (rule.type === "Whataboutism") {
    const hasCounter = /\b(sila|nila|kanila|kayo)\b/.test(s);
    return hasCounter;
  }
  
  return true;
}

// Detect logical fallacies in speech - IMPROVED with all three methods
function detectFallacies(text) {
  const sentences = text
    .replace(/\n+/g, ". ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  let detected = [];
  const seen = new Set(); // track unique phrase + sentence

  sentences.forEach(sentence => {
    const isArg = isArgumentative(sentence);
    
    if (!isArg) return; // Skip non-argumentative sentences

    // METHOD 1: PDA Analysis 
    const pdaResult = pdaAnalyze(sentence);
    if (pdaResult.valid) {
      const key = `pda::${sentence.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        detected.push({
          name: pdaResult.fallacyType,
          phrase: pdaResult.structure,
          explanation: "Detected via PDA stack analysis",
          sentence,
          confidence: pdaResult.confidence,
          method: 'PDA'
        });
      }
    }

    // METHOD 2: CFG Parser
    const cfgResult = cfgParse(sentence);
    if (cfgResult) {
      cfgResult.forEach(result => {
        const key = `cfg::${result.type}::${sentence.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          detected.push({
            name: result.type,
            phrase: result.structure,
            explanation: `Matched grammar pattern: ${result.structure}`,
            sentence,
            confidence: 'HIGH',
            method: 'CFG'
          });
        }
      });
    }

    // METHOD 3: Pattern Matching with Context
    FALLACY_PATTERNS.forEach(rule => {
      rule.patterns.forEach(pattern => {
        const matches = sentence.match(pattern);

        if (matches && hasProperContext(sentence, rule)) {
          matches.forEach(match => {
            const key = `${match.toLowerCase()}||${sentence.toLowerCase()}`;

            if (!seen.has(key)) {
              seen.add(key);
              detected.push({
                name: rule.type,
                phrase: match,
                explanation: rule.description,
                sentence,
                confidence: 'MEDIUM',
                method: 'PATTERN'
              });
            }
          });
        }
      });
    });
  });

  return detected;
}

const CharotChecker = () => {
  React.useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;800&family=Inter:wght@300;400;500&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const [text, setText] = useState('');
  const [analyzed, setAnalyzed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [expandedFallacies, setExpandedFallacies] = useState({});
  const [detectedFallacies, setDetectedFallacies] = useState([]);

  const toggleFallacy = (index) => {
    setExpandedFallacies(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getFallacyCount = (fallacyName) => {
    return detectedFallacies.filter(f => f.name === fallacyName).length;
  };

  const uniqueFallacies = [...new Set(detectedFallacies.map(f => f.name))].map(name => ({
    name,
    count: getFallacyCount(name)
  }));

 const handleAnalyze = () => {
  if (text.trim()) {
    const results = detectFallacies(text);
    setDetectedFallacies(results);
    setAnalyzed(true);
    setExpandedFallacies({}); // reset expanded panels
  }
};


  const PieChart = ({ data }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const total = data.reduce((sum, item) => sum + item.count, 0);
    let currentAngle = 0;
    
    const colors = ['#5f0f40', '#9a1750', '#d62246', '#e63946', '#f77f00', '#fcbf49', '#457b9d'];
    
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <svg width="240" height="240" viewBox="0 0 240 240">
            <g transform="translate(120, 120)">
              {data.map((item, index) => {
                const percentage = (item.count / total) * 100;
                const angle = (percentage / 100) * 360;
                const startAngle = currentAngle;
                currentAngle += angle;
                
                const radius = 100;
                const startX = radius * Math.cos((Math.PI * startAngle) / 180);
                const startY = radius * Math.sin((Math.PI * startAngle) / 180);
                const endX = radius * Math.cos((Math.PI * currentAngle) / 180);
                const endY = radius * Math.sin((Math.PI * currentAngle) / 180);
                const largeArc = angle > 180 ? 1 : 0;
                
                const pathData = [
                  `M 0 0`,
                  `L ${startX} ${startY}`,
                  `A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`,
                  `Z`
                ].join(' ');
                
                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={colors[index % colors.length]}
                    stroke="white"
                    strokeWidth="3"
                    style={{
                      cursor: 'pointer',
                      opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.5,
                      transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </g>
          </svg>
          
          {hoveredIndex !== null && (
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200 pointer-events-none z-10"
              style={{ minWidth: '150px' }}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: colors[hoveredIndex % colors.length] }}
                ></div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
                  {data[hoveredIndex].name}
                </div>
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#6b7280', marginTop: '4px', marginLeft: '20px' }}>
                {data[hoveredIndex].count} ({((data[hoveredIndex].count / total) * 100).toFixed(1)}%)
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#374151' }}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img 
                src="/fallacy-logo.png" 
                alt="Charot Checker Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div>
              <h1 className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '48px', lineHeight: '1.0' }}>Charot Checker</h1>
              <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 300, fontSize: '18px', fontStyle: 'italic' }}>A Filipino Political Speech Fallacy Detector</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-gray-800 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 300, fontSize: '16px', lineHeight: '1.6' }}>
            <span className="font-bold">Charot Checker</span> is your quick guide to spotting falsehoods and twisted logic in Filipino politics, because <span className="font-bold italic">knowing the truth matters</span>.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, fontSize: '18px' }}>Paste text here to spot fallacies</h2>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste speech here"
            className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-800"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: '14px', fontStyle: text ? 'normal' : 'italic', lineHeight: '1.5' }}
          />
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={handleAnalyze}
            className="px-12 py-4 rounded-full shadow-md transition-all duration-200 bg-black hover:bg-gray-800 text-white"
            style={{ 
              fontFamily: 'Poppins, sans-serif', 
              fontWeight: 500, 
              fontSize: '18px'
            }}
          >
            Analyze
          </button>
        </div>

        {analyzed && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 
                className="text-center mb-4" 
                style={{ 
                  fontFamily: 'Poppins, sans-serif', 
                  fontWeight: 600, 
                  fontSize: '24px',
                  color: detectedFallacies.length === 0 ? '#0f4c5c' : '#5f0f40'
                }}
              >
                {detectedFallacies.length === 0 
                  ? 'NO FALLACY FOUND!' 
                  : detectedFallacies.length === 1 
                  ? 'FALLACY FOUND!' 
                  : 'FALLACIES FOUND!'}
              </h2>
              
              {detectedFallacies.length === 0 ? (
                <p className="text-gray-700 text-center" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '16px' }}>
                  This speech is free of fallacies.
                </p>
              ) : (
                <div className="space-y-4">
                  {detectedFallacies.map((fallacy, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleFallacy(index)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                      >
                        <h3 className="text-gray-900 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '18px' }}>
                          <span className="text-sm transition-transform" style={{ transform: expandedFallacies[index] ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                          {fallacy.name}
                        </h3>
                      </button>
                      
                      {expandedFallacies[index] && (
                        <div className="px-4 pb-4 border-t border-gray-200 pt-3 space-y-2">
                          <p className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '15px', lineHeight: '1.6' }}>
                            <span className="font-semibold">Found Phrase:</span> "{fallacy.phrase}"
                          </p>
                          <p className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '15px', lineHeight: '1.6' }}>
                            <span className="font-semibold">Context:</span> {fallacy.sentence}
                          </p>
                          <p className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '15px', lineHeight: '1.6' }}>
                            <span className="font-semibold">Explanation:</span> {fallacy.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {detectedFallacies.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-center mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '24px', color: '#1f2937' }}>SUMMARY</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {uniqueFallacies.map((fallacy, index) => (
                    <div key={index} className="text-center">
                      <h3 className="mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#5f0f40' }}>{fallacy.name}</h3>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '14px', color: '#5f0f40' }}>{fallacy.count} instance{fallacy.count !== 1 ? 's' : ''} detected</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <PieChart data={uniqueFallacies} />
                </div>
              </div>
            )}
          </>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-gray-900 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '22px' }}>
              {showInstructions ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
              How to Use the Fallacy Detector
            </h2>
          </button>
          
          {showInstructions && (
            <div className="px-6 pb-6 space-y-6">
              <div>
                <h3 className="text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '20px' }}>What This Tool Does</h3>
                <p className="text-gray-700 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '15px', lineHeight: '1.6' }}>
                  The Fallacy Detector helps you identify logical fallacies or errors in reasoning that weaken arguments in Filipino political speeches. Whether you're a student, journalist, voter, or concerned citizen, this tool empowers you to critically examine political rhetoric and make more informed judgments about the arguments presented to you.
                </p>
              </div>

              <div>
                <h3 className="text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '20px' }}>How to Use</h3>
                <ol className="space-y-2 text-gray-700" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '15px', lineHeight: '1.6' }}>
                  <li>1. Copy the speech text you want to analyze (from transcripts, news articles, or social media posts)</li>
                  <li>2. Paste it into the text box on the tool</li>
                  <li>3. Click "Analyze"</li>
                  <li>4. Review your results in 30 seconds or less</li>
                </ol>
                <p className="text-gray-700 leading-relaxed mt-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '15px', lineHeight: '1.6' }}>
                  The tool will highlight fallacies found in the text and explain why each instance represents flawed reasoning.
                </p>
              </div>

              <div>
                <h3 className="text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '20px' }}>Common Logical Fallacies in Political Discourse</h3>
                <p className="text-gray-700 mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '15px', lineHeight: '1.6' }}>
                  Understanding these fallacies will help you recognize when politicians are using flawed logic instead of sound arguments.
                </p>
                
                <div className="space-y-4 text-gray-700" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '15px', lineHeight: '1.6' }}>
                  <div>
                    <p className="font-bold mb-1">1. Ad Hominem (Attacking the Person)</p>
                    <p className="mb-2">Attacking an opponent's character instead of addressing their argument.</p>
                    <p className="italic text-gray-600">Halimbawa: "Huwag ninyong pakinggan ang economic plan ni Senator Cruz—corrupt naman yan."</p>
                  </div>

                  <div>
                    <p className="font-bold mb-1">2. Appeal to Emotion</p>
                    <p className="mb-2">Manipulating emotions instead of using logical reasoning.</p>
                    <p className="italic text-gray-600">Halimbawa: "Isipin ninyo ang kinabukasan ng inyong mga anak—iboto ninyo ako o sila ang maghihirap."</p>
                  </div>

                  <div>
                    <p className="font-bold mb-1">3. Straw Man</p>
                    <p className="mb-2">Distorting an opponent's position to make it easier to attack.</p>
                    <p className="italic text-gray-600">Halimbawa: "Gusto ng kalaban ko na i-reform ang pulis, ibig sabihin gusto niya ng kaguluhan."</p>
                  </div>

                  <div>
                    <p className="font-bold mb-1">4. False Dilemma</p>
                    <p className="mb-2">Presenting only two options when other alternatives exist.</p>
                    <p className="italic text-gray-600">Halimbawa: "Kasama ninyo ang administrasyong ito o against kayo sa progress."</p>
                  </div>

                  <div>
                    <p className="font-bold mb-1">5. Whataboutism</p>
                    <p className="mb-2">Deflecting criticism by pointing to someone else's behavior.</p>
                    <p className="italic text-gray-600">Halimbawa: "Eh ano naman ang ginawa ng nakaraang administrasyon?"</p>
                  </div>

                  <div>
                    <p className="font-bold mb-1">6. Bandwagon</p>
                    <p className="mb-2">Arguing something is true because many people believe it.</p>
                    <p className="italic text-gray-600">Halimbawa: "Sumusuporta ang lahat sa bill na ito."</p>
                  </div>

                  <div>
                    <p className="font-bold mb-1">7. Hasty Generalization</p>
                    <p className="mb-2">Drawing broad conclusions from insufficient evidence.</p>
                    <p className="italic text-gray-600">Halimbawa: "Nakasalubong ko tatlong tao na sumusuporta, kaya sang-ayon ang buong rehiyon."</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '20px' }}>Important Note</h3>
                <p className="text-gray-700 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '15px', lineHeight: '1.6' }}>
                  This tool analyzes the logical structure of arguments, not political ideology. A speech may contain fallacies while still discussing valid concerns. The presence of logical fallacies indicates weaknesses in reasoning, but should be considered alongside other factors like context and evidence.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharotChecker;