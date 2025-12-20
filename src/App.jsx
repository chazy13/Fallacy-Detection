import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const CharotChecker = () => {
  // Load Google Fonts
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
  const [openInstruction, setOpenInstruction] = useState(null);

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

  // For testing different scenarios, you can modify this:
  // const detectedFallacies = []; // No fallacies
  // const detectedFallacies = [{ name: "Ad Hominem", phrase: "yuck", explanation: "..." }]; // One fallacy

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
      setAnalyzed(true);
    }
  };

  // Pie chart component
  const PieChart = ({ data }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const total = data.reduce((sum, item) => sum + item.count, 0);
    let currentAngle = 0;
    
    const colors = ['#5f0f40', '#9a1750', '#d62246', '#e63946', '#f77f00'];
    
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
                
                // Calculate path for pie slice
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
          
          {/* Tooltip */}
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
        
        {/* Legend - without counts */}
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
        {/* Header */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img 
              src="/fallacy-logo.png" 
              alt="Charot Checker Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '48px', lineHeight: '1.0' }}>Charot Checker</h1>
            <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 300, fontSize: '18px', fontStyle: 'italic' }}>A Filipino Political Speech Fallacy Detector</p>
          </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <p className="text-gray-800 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 300, fontSize: '16px', lineHeight: '1.6' }}>
            <span className="font-bold">Charot Checker</span> is your quick guide to spotting falsehoods and twisted logic in Filipino politics, because <span className="font-bold italic">knowing the truth matters</span>.
          </p>
        </div>

        {/* Input Section */}
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

        {/* Analyze Button */}
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

        {/* Results Section */}
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
                            <span className="font-semibold">Explanation:</span> {fallacy.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary Section */}
            {detectedFallacies.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-center mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '24px', color: '#1f2937' }}>SUMMARY</h2>
                
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {uniqueFallacies.map((fallacy, index) => (
                    <div key={index} className="text-center">
                      <h3 className="mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#5f0f40' }}>{fallacy.name}</h3>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '14px', color: '#5f0f40' }}>{fallacy.count} instance{fallacy.count !== 1 ? 's' : ''} detected</p>
                    </div>
                  ))}
                </div>

                {/* Pie Chart */}
                <div className="flex justify-center">
                  <PieChart data={uniqueFallacies} />
                </div>
              </div>
            )}
          </>
        )}

        {/* Instructions Section*/}
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
    </div>
  );
};

export default CharotChecker;