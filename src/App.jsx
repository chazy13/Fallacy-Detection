import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';

const FALLACY_COLORS = {
  'Ad Hominem': 'bg-red-200 text-red-900',
  'Straw Man': 'bg-orange-200 text-orange-900',
  'False Dilemma': 'bg-amber-200 text-amber-900',
  'Appeal to Emotion': 'bg-pink-200 text-pink-900',
  'Red Herring': 'bg-purple-200 text-purple-900',
  'Bandwagon': 'bg-indigo-200 text-indigo-900',
  'Hasty Generalization': 'bg-yellow-200 text-yellow-900'
};

const FALLACY_ACCENT_COLORS = {
  'Ad Hominem': '#ef4444',
  'Straw Man': '#f97316',
  'False Dilemma': '#f59e0b',
  'Appeal to Emotion': '#ec4899',
  'Red Herring': '#a855f7',
  'Bandwagon': '#6366f1',
  'Hasty Generalization': '#eab308'
};

/*
const FALLACY_PIE_COLORS = {
  'Ad Hominem': '#fca5a5',
  'Straw Man': '#fdba74',
  'False Dilemma': '#fcd34d',
  'Appeal to Emotion': '#f9a8d4',
  'Red Herring': '#d8b4fe',
  'Bandwagon': '#a5b4fc',
  'Hasty Generalization': '#fde047'
}; */

const CharotChecker = () => {
  const resultsRef = useRef(null);

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;800&family=Inter:wght@300;400;500&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    // Add SF Pro font fallback
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'SF Pro Display';
        src: local('SF Pro Display'), local('-apple-system'), local('BlinkMacSystemFont');
        font-weight: 100 900;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const [text, setText] = useState('');
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [expandedFallacies, setExpandedFallacies] = useState({});

  // Simulated detected fallacies - replace with actual detection logic
  const detectedFallacies = [
    {
      name: "Ad Hominem",
      phrase: "yuck",
      explanation: "Attacking the person making the argument rather than the argument itself."
    },
    {
      name: "Straw Man",
      phrase: "yuck",
      explanation: "Misrepresenting someone's argument to make it easier to attack."
    },
    {
      name: "False Dilemma",
      phrase: "example phrase",
      explanation: "Presenting two opposing options as the only possibilities when more exist."
    }
  ];

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
    if (!text.trim()) return;

    setLoading(true);
    setAnalyzed(false);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setAnalyzed(true);

      // Scroll to results after they appear
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 150);
    }, 1200);
  };

  /* INLINE HIGHLIGHT RENDERER */
  const getHighlightedText = () => {
    let highlighted = text;

    detectedFallacies.forEach((fallacy) => {
      const regex = new RegExp(`(${fallacy.phrase})`, 'gi');
      highlighted = highlighted.replace(
        regex,
        `<mark class="px-1 rounded ${FALLACY_COLORS[fallacy.name]} hover:brightness-110 transition">$1</mark>`
      );
    });

    return highlighted.replace(/\n/g, '<br />');
  };

  // Pie chart component
  const PieChart = ({ data }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const total = data.reduce((sum, item) => sum + item.count, 0);
    let currentAngle = 0;
    
    const colors = ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];
    
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
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200 pointer-events-none"
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
    <div className="min-h-screen bg-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img 
              src="/fallacy-logo.png" 
              alt="Charot Checker Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-center">
            <h1 className="text-gray-900" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 800, fontSize: '48px', lineHeight: '1.2', color: '#261815' }}>Charot Checker</h1>
            <p className="text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 300, fontSize: '18px', fontStyle: 'italic', color: '#301E1B' }}>A Filipino Political Speech Fallacy Detector</p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8 text-center max-w-6xl mx-auto">
          <p className="text-gray-800" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 425, fontSize: '16px', lineHeight: '1.2', color: '#261815' }}>
            <span className="font-bold">Charot Checker</span> is your quick guide to spotting falsehoods and twisted logic in Filipino politics, because <span className="font-bold italic">knowing the truth matters</span>.
          </p>
        </div>

        {/* Main Content - Input with Inline Highlighting */}
        <div className={`transition-all duration-700 ease-in-out mb-8`}>
          <div className={`bg-white rounded-2xl shadow-sm p-6 transition-all duration-700 w-full`}>
            <h2 className="text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, fontSize: '18px', color: '#261815' }}>Paste text here to spot fallacies</h2>
            
            <div className="relative">
              {/* Highlight layer */}
              <div
                className="absolute inset-0 p-4 whitespace-pre-wrap break-words pointer-events-none overflow-hidden rounded-xl"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  color: 'transparent'
                }}
                dangerouslySetInnerHTML={{
                  __html: analyzed ? getHighlightedText() : text.replace(/\n/g, '<br />')
                }}
              />

              {/* Textarea */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste speech here..."
                className="relative w-full min-h-[380px] p-4 border border-gray-300 rounded-xl resize-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-700/30 text-gray-800 transition-all duration-200"
                style={{ 
                  fontFamily: 'Inter, sans-serif', 
                  fontWeight: 300, 
                  fontSize: '14px', 
                  fontStyle: text ? 'normal' : 'italic', 
                  lineHeight: '1.5',
                  color: analyzed ? 'transparent' : '#1f2937'
                }}
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-900 text-white py-3 rounded-xl font-medium shadow-sm hover:bg-blue-800 hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px' }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Analyzing…
                </>
              ) : (
                'Analyze Text'
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {analyzed && (
          <div ref={resultsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in">
            {/* Left Column - Fallacies List */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {detectedFallacies.length === 0 ? (
                <div className="flex items-center gap-3 p-4 text-center bg-green-50 border-l-4 border-green-700 rounded-xl">
                  <CheckCircle className="text-green-700 flex-shrink-0" size={24} />
                  <div>
                    <h2 className="font-semibold text-green-800" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '20px'}}>
                      NO FALLACY FOUND!
                    </h2>
                    <p className="text-green-700 text-sm mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      This speech is free of logical fallacies.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <AlertTriangle className="text-red-700" size={24} />
                    <h2 
                      className="font-semibold text-red-700" 
                      style={{ fontFamily: 'Poppins, sans-serif', fontSize: '24px' }}
                    >
                      {detectedFallacies.length === 1 ? 'FALLACY FOUND!' : 'FALLACIES FOUND!'}
                    </h2>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {detectedFallacies.map((fallacy, index) => (
                      <div 
                        key={index} 
                        className={`rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${FALLACY_COLORS[fallacy.name]} bg-opacity-30`}
                        style={{ borderLeft: `4px solid ${FALLACY_ACCENT_COLORS[fallacy.name]}` }}
                      >
                        <button
                          onClick={() => toggleFallacy(index)}
                          className="w-full flex items-center justify-between p-4 text-left font-semibold"
                          style={{ fontFamily: 'Poppins, sans-serif', fontSize: '17px' }}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-sm transition-transform" style={{ transform: expandedFallacies[index] ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                            {fallacy.name}
                          </span>
                        </button>
                        
                        {expandedFallacies[index] && (
                          <div className="px-4 pb-4 space-y-2">
                            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '1.6' }}>
                              <span className="font-semibold">Found Phrase:</span> "{fallacy.phrase}"
                            </p>
                            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '1.6' }}>
                              <span className="font-semibold">Explanation:</span> {fallacy.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Right Column - Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-center mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '24px', color: '#091942' }}>SUMMARY</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl border border-gray-200 p-4 transition hover:shadow-sm">
                  <p className="text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>Fallacies Found</p>
                  <p className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif'}}>
                    {detectedFallacies.length}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-4 transition hover:shadow-sm">
                  <p className="text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>Text Length</p>
                  <p className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {text.length}
                  </p>
                </div>
              </div>

              {detectedFallacies.length > 0 && (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {uniqueFallacies.map((fallacy, index) => (
                      <div key={index} className="text-center">
                        <h3 className="mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1e40af' }}>{fallacy.name}</h3>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '13px', color: '#3b82f6' }}>{fallacy.count} instance{fallacy.count !== 1 ? 's' : ''} detected</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center">
                    <PieChart data={uniqueFallacies} />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Instructions Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
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
                <h3 className="text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '20px' }}>How to Use</h3>
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
                  Understanding these fallacies will help you recognize when politicians are using flawed logic instead of sound arguments. These are the most frequently encountered fallacies in Filipino political speeches.
                </p>
                
                <div className="space-y-4 text-gray-700" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '15px', lineHeight: '1.6' }}>
                  <div>
                    <p className="font-bold mb-1">1. Ad Hominem (Attacking the Person)</p>
                    <p className="mb-2">Attacking an opponent's character, motives, or background instead of addressing their actual argument.</p>
                    <p className="italic text-gray-600">Halimbawa: "Huwag ninyong pakinggan ang economic plan ni Senator Cruz—corrupt naman yan at pansarili lang ang iniisip."</p>
                  </div>

                  <div>
                    <p className="font-bold mb-1">2. Appeal to Emotion</p>
                    <p className="mb-2">Manipulating emotions (fear, pity, pride, anger) instead of using logical reasoning and evidence.</p>
                    <p className="italic text-gray-600">Halimbawa: "Isipin ninyo ang kinabukasan ng inyong mga anak—iboto ninyo ako o sila ang maghihirap."</p>
                  </div>

                  <div>
                    <p className="font-bold mb-1">3. Straw Man</p>
                    <p className="mb-2">Distorting or oversimplifying an opponent's position to make it easier to attack, rather than engaging with their real argument.</p>
                    <p className="italic text-gray-600">Halimbawa: "Gusto ng kalaban ko na i-reform ang pulis, ibig sabihin gusto niya ng kaguluhan at walang batas sa ating mga kalye."</p>
                  </div>

                  <div>
                    <p className="font-bold mb-1">4. False Dilemma/False Dichotomy</p>
                    <p className="mb-2">Presenting only two options as if they're the only possibilities, when other alternatives exist.</p>
                    <p className="italic text-gray-600">Halimbawa: "Kasama ninyo ang administrasyong ito o kaya naman ay against kayo sa progress ng Pilipinas."</p>
                  </div>

                  <div>
                    <p className="font-bold mb-1">5. Red Herring/Whataboutism</p>
                    <p className="mb-2">Introducing an irrelevant topic to distract from the actual issue being discussed, or deflecting criticism by pointing to someone else's similar behavior.</p>
                    <p className="italic text-gray-600">Halimbawa: "Pero ano naman ang ginawa namin sa mga kalsada?" or "Eh ano naman ang ginawa ng nakaraang administrasyon?"</p>
                  </div>

                  <div>
                    <p className="font-bold mb-1">6. Bandwagon (Appeal to Popularity)</p>
                    <p className="mb-2">Arguing that something is true or good simply because many people believe it or do it.</p>
                    <p className="italic text-gray-600">Halimbawa: "Sumusuporta ang lahat sa bill na ito—dapat suportahan ninyo rin kung gusto ninyong makisama sa tama."</p>
                  </div>

                  <div>
                    <p className="font-bold mb-1">7. Hasty Generalization</p>
                    <p className="mb-2">Drawing broad conclusions from insufficient evidence or limited examples.</p>
                    <p className="italic text-gray-600">Halimbawa: "Nakasalubong ko tatlong tao mula sa probinsyang iyon na sumusuporta sa bill na ito, kaya malinaw na sang-ayon ang buong rehiyon."</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '20px' }}>Important Note</h3>
                <p className="text-gray-700 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '15px', lineHeight: '1.6' }}>
                  This tool analyzes the logical structure of arguments, not political ideology or policy positions. A speech may contain fallacies while still discussing valid concerns, just as a well-reasoned argument can support positions you disagree with. The presence of logical fallacies indicates weaknesses in reasoning, but should be considered alongside other factors like context, evidence, and the broader political landscape. This tool is designed to promote critical thinking and informed civic engagement, not to discredit any particular political position or party.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          .animate-fade-in {
            animation: fadeIn 0.4s ease-out;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(6px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default CharotChecker;