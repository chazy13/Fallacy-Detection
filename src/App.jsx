import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Fallacy Detection Logic
const FALLACY_PATTERNS = [
  {
    type: "Ad Hominem (Personal Attack)",
    patterns: [
      /\b(bobo|tanga|abnoy|ignorante|stupid|dumb|walang pinag-aralan|walang kwenta|inutil|uneducated|corrupt naman yan)\b/gi
    ],
    description: "Attacking the person making the argument rather than the argument itself."
  },
  {
    type: "Appeal to Emotion",
    patterns: [
      /\b(kawawa|maawa|isipin ang mga bata|isipin ninyo ang kinabukasan|paghihirap|masakit sa damdamin|luha ng bayan|think of the children|maghihirap)\b/gi
    ],
    description: "Uses emotional manipulation to persuade."
  },
  {
    type: "Bandwagon",
    patterns: [
      /\b(lahat naman|karamihan|uso na|sikat na|buong bayan|lahat ng botante|popular na opinyon|everyone|most people|majority|widely accepted|trending|popular belief|sumusuporta ang lahat)\b/gi
    ],
    description: "Arguing that something is true or good simply because many people believe it."
  },
  {
    type: "Straw Man",
    patterns: [
      /\b(ibig mong sabihin ay|bumagsak ang bansa|ayaw mo ng kaunlaran|galit ka lang sa gobyerno|sinasabi mo na dapat|so you're saying|gusto niya ng kaguluhan)\b/gi
    ],
    description: "Misrepresenting someone's argument to make it easier to attack."
  },
  {
    type: "False Dilemma",
    patterns: [
      /\b(o ako o siya|wala kang ibang pagpipilian|kung hindi ka pabor, kalaban ka|dalawa lang ang pagpipilian|either|kasama ninyo|against kayo)\b/gi
    ],
    description: "Presenting only two options as if they're the only possibilities."
  },
  {
    type: "Whataboutism",
    patterns: [
      /\b(paano naman|yung ginawa nila|bakit hindi ninyo banggitin|ano naman ang sa kanila|what about|how about|eh ano naman ang ginawa|pero ano naman)\b/gi
    ],
    description: "Deflects criticism by pointing to another issue."
  },
  {
    type: "Hasty Generalization",
    patterns: [
      /\b(nakasalubong ko|tatlong tao|malinaw na sang-ayon ang buong|lahat ng tao sa|everyone in)\b/gi
    ],
    description: "Drawing broad conclusions from insufficient evidence."
  }
];

function preprocessText(text) {
  return text.replace(/\n+/g, ". ").trim();
}

function splitIntoSentences(text) {
  return text.split(/(?<=[.!?])\s+/).filter(s => s.length > 0);
}

function detectFallacies(text) {
  const cleanText = preprocessText(text);
  const sentences = splitIntoSentences(cleanText);

  let detectedFallacies = [];

  sentences.forEach((sentence) => {
    FALLACY_PATTERNS.forEach(rule => {
      rule.patterns.forEach(pattern => {
        const matches = sentence.match(pattern);
        if (matches) {
          matches.forEach(match => {
            detectedFallacies.push({
              name: rule.type,
              phrase: match,
              explanation: rule.description,
              sentence: sentence
            });
          });
        }
      });
    });
  });

  return detectedFallacies;
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
      setExpandedFallacies({}); // Reset expanded state
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