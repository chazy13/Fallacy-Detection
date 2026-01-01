// Components.jsx - All UI Components
import { Loader2, CheckCircle, AlertCircle, Info } from "lucide-react";

export function Header() {
    return ( <
        div className = "bg-white rounded-lg shadow-lg p-8 mb-6" >
        <
        h1 className = "text-3xl font-bold text-gray-800 mb-2" >
        Filipino Fallacy Detector <
        /h1> <
        p className = "text-gray-600" > Semantic Analysis + CFG Parser + PDA < /p> <
        p className = "text-sm text-gray-500 mt-2" > ✨Context - aware detection - filters out non - argumentative statements <
        /p> <
        /div>
    );
}

export function InputSection({ text, setText, isLoading, onAnalyze, onReset }) {
    return ( <
        div className = "bg-white rounded-lg shadow-lg p-6 mb-6" >
        <
        label className = "block text-sm font-medium text-gray-700 mb-2" >
        Enter Filipino Political Speech <
        /label> <
        textarea value = { text }
        onChange = { e => setText(e.target.value) }
        placeholder = "Paste Filipino political speech here...&#10;&#10;Try: 'Bobo ka kaya mali ka.' (detected) vs 'Bobo ng lamesa.' (not detected)"
        className = "w-full h-48 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" /
        >

        <
        div className = "flex gap-3 mt-4" >
        <
        button onClick = { onAnalyze }
        disabled = { isLoading }
        className = "flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition" >
        {
            isLoading ? ( <
                >
                <
                Loader2 className = "animate-spin"
                size = { 20 }
                />
                Analyzing... <
                />
            ) : ( <
                >
                <
                CheckCircle size = { 20 }
                />
                Analyze Speech <
                />
            )
        } <
        /button>

        <
        button onClick = { onReset }
        className = "px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition" >
        Reset <
        /button> <
        /div> <
        /div>
    );
}

export function ResultsSection({ results }) {
    return ( <
        div className = "bg-white rounded-lg shadow-lg p-6" >
        <
        SummaryCard results = { results }
        /> <
        h3 className = "text-xl font-bold text-gray-800 mb-4" >
        Detailed Sentence Analysis <
        /h3> <
        div className = "space-y-6" > {
            results.sentenceAnalysis.map(item => ( <
                SentenceCard key = { item.sentenceNumber }
                item = { item }
                />
            ))
        } <
        /div> <
        /div>
    );
}

export function SummaryCard({ results }) {
    return ( <
        div className = "bg-red-50 border-l-4 border-red-500 p-4 mb-6" >
        <
        h2 className = "text-xl font-bold text-red-800 mb-2" >
        Analysis Summary <
        /h2> <
        p className = "text-2xl font-bold text-red-600" >
        Total Fallacies: { results.totalFallacies } <
        /p>

        <
        div className = "mt-4 space-y-2" > {
            Object.entries(results.fallacyCounts).map(([type, count]) => ( <
                div key = { type }
                className = "flex justify-between items-center" >
                <
                span className = "text-gray-700" > { type } < /span> <
                span className = "bg-red-100 text-red-800 px-3 py-1 rounded-full font-semibold" > { count } <
                /span> <
                /div>
            ))
        } <
        /div> <
        /div>
    );
}

export function SentenceCard({ item }) {
    return ( <
        div className = "border-2 border-gray-200 rounded-lg p-5" >
        <
        div className = "flex items-start gap-3 mb-4" >
        <
        span className = "bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold" >
        Sentence { item.sentenceNumber } <
        /span> {
            item.isArgumentative && ( <
                span className = "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold" > ✓Argumentative <
                /span>
            )
        } <
        /div>

        <
        p className = "text-gray-800 italic mb-4 bg-gray-50 p-3 rounded border-l-4 border-gray-300" >
        "{item.sentence}" <
        /p>

        <
        div className = "space-y-4" > {
            item.fallacies.map((f, i) => ( <
                FallacyCard key = { i }
                fallacy = { f }
                />
            ))
        } <
        /div> <
        /div>
    );
}

export function FallacyCard({ fallacy }) {
    return ( <
            div className = "bg-red-50 border border-red-200 rounded-lg p-4" >
            <
            div className = "flex items-start gap-3 mb-3" >
            <
            AlertCircle className = "text-red-600 flex-shrink-0 mt-1"
            size = { 20 }
            /> <
            div className = "flex-1" >
            <
            h4 className = "font-bold text-red-800 text-lg" > { fallacy.type } < /h4> <
            p className = "text-gray-600 text-sm mt-1" > { fallacy.description } < /p> <
            /div> <
            /div>

            <
            div className = "ml-8 space-y-3" >
            <
            div className = "bg-white p-3 rounded border border-red-100" >
            <
            span className = "text-xs font-semibold text-gray-500 uppercase" > Trigger Word < /span> <
            p className = "text-red-700 font-semibold mt-1" > "{fallacy.text}" < /p> <
            /div>

            {
                fallacy.cfg && fallacy.cfg.length > 0 && < CFGDisplay cfg = { fallacy.cfg }
                />} {
                    fallacy.pda && fallacy.pda.valid && < PDADisplay pda = { fallacy.pda }
                    />} <
                    /div> <
                    /div>
                );
            }

            export function CFGDisplay({ cfg }) {
                return ( <
                    div className = "bg-blue-50 p-3 rounded border border-blue-200" >
                    <
                    div className = "flex items-center gap-2 mb-2" >
                    <
                    Info size = { 16 }
                    className = "text-blue-600" / >
                    <
                    span className = "text-xs font-semibold text-blue-800 uppercase" >
                    CFG Grammar Structure <
                    /span> <
                    /div> {
                        cfg.map((c, idx) => ( <
                            div key = { idx }
                            className = "mt-1" >
                            <
                            p className = "text-blue-700 font-mono text-sm" > { c.structure } < /p> <
                            p className = "text-xs text-blue-600 mt-1" > Type: { c.type } < /p> <
                            /div>
                        ))
                    } <
                    /div>
                );
            }

            export function PDADisplay({ pda }) {
                return ( <
                    div className = "bg-green-50 p-3 rounded border border-green-200" >
                    <
                    div className = "flex items-center gap-2 mb-2" >
                    <
                    CheckCircle size = { 16 }
                    className = "text-green-600" / >
                    <
                    span className = "text-xs font-semibold text-green-800 uppercase" >
                    PDA State Machine <
                    /span> <
                    /div> <
                    p className = "text-green-700 font-mono text-sm mb-1" > { pda.structure } < /p> <
                    p className = "text-xs text-green-600" >
                    Fallacy Type: { pda.fallacyType } | Confidence: { pda.confidence } <
                    /p> <
                    /div>
                );
            }