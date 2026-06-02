import React, { useState, useEffect } from 'react';
import { Search, Copy, Check, Sparkles, Send } from 'lucide-react';
import { useEmojiData, useEmojiMatcher } from './hooks/useEmoji';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const { emojis, loading } = useEmojiData();
  const results = useEmojiMatcher(activeSearch, emojis);
  
  const [selectedIndices, setSelectedIndices] = useState<Record<number, number>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSelectedIndices({});
  }, [activeSearch]);

  const handleConvert = () => {
    setActiveSearch(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConvert();
    }
  };

  const handleCopy = async () => {
    try {
      const textToCopy = results
        .map((res, i) => {
          if (!res.matches) return '';
          const index = selectedIndices[i] || 0;
          return res.matches[index]?.unicode || '';
        })
        .join('');

      if (textToCopy) {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = textToCopy;
          textArea.style.position = "fixed";
          textArea.style.left = "-9999px";
          textArea.style.top = "0";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const cycleEmoji = (charIndex: number, delta: number, max: number) => {
    setSelectedIndices(prev => {
      const current = prev[charIndex] || 0;
      let next = current + delta;
      if (next >= max) next = 0;
      if (next < 0) next = max - 1;
      return { ...prev, [charIndex]: next };
    });
  };

  return (
    <div style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '12px', background: 'linear-gradient(to right, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Let's Emoji
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>输入中文，按回车或点击按钮发现 Emoji</p>
      </header>

      <div style={{ position: 'relative', marginBottom: '50px', display: 'flex', gap: '12px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
            <Search size={20} />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入中文、按回车或点击转换发现 Emoji ..."
            style={{
              width: '100%',
              padding: '18px 18px 18px 48px',
              fontSize: '1.1rem',
              borderRadius: '16px',
              border: '2px solid #e2e8f0',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
              backgroundColor: '#fff'
            }}
            autoFocus
          />
        </div>
        <button
          onClick={handleConvert}
          disabled={loading || !input.trim()}
          style={{
            padding: '0 24px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'transform 0.1s, opacity 0.2s',
            opacity: (!input.trim() || loading) ? 0.6 : 1,
          }}
        >
          <Send size={18} />
          转换
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', minHeight: '200px' }}>
        {loading ? (
          <div style={{ color: '#2563eb', fontWeight: '500' }}>正在准备表情库...</div>
        ) : results.length > 0 ? (
          results.map((res, i) => (
            <div key={`${i}-${res.char}`} style={{ textAlign: 'center' }}>
              <div 
                onClick={() => res.matches && cycleEmoji(i, 1, res.matches.length)}
                style={{
                  width: '90px',
                  height: '90px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  backgroundColor: res.matches ? '#fff' : '#f8fafc',
                  border: `2px solid ${res.matches ? '#e2e8f0' : '#f1f5f9'}`,
                  borderRadius: '20px',
                  cursor: res.matches ? 'pointer' : 'default',
                  boxShadow: res.matches ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : 'none',
                  position: 'relative',
                  transition: 'transform 0.2s'
                }}
              >
                {res.matches ? (
                  <>
                    <span>{res.matches[selectedIndices[i] || 0]?.unicode}</span>
                    {res.matches.length > 1 && (
                      <div style={{ position: 'absolute', bottom: '8px', right: '8px', fontSize: '11px', fontWeight: '700', color: '#94a3b8', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '6px' }}>
                        {(selectedIndices[i] || 0) + 1}/{res.matches.length}
                      </div>
                    )}
                  </>
                ) : (
                  <span style={{ color: '#cbd5e1' }}>?</span>
                )}
              </div>
              <div style={{ marginTop: '8px', fontSize: '1rem', fontWeight: '500', color: '#64748b' }}>{res.char}</div>
            </div>
          ))
        ) : activeSearch && (
          <div style={{ color: '#94a3b8' }}>未找到匹配结果</div>
        )}
      </div>

      {results.some(r => r.matches) && (
        <div style={{ 
          position: 'fixed', 
          bottom: '30px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          backgroundColor: '#ffffff', 
          padding: '12px 24px', 
          borderRadius: '40px', 
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          display: 'flex', 
          alignItems: 'center', 
          gap: '20px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: '600' }}>
              {results.map((r, i) => r.matches ? r.matches[selectedIndices[i] || 0].unicode : '').join('')}
            </span>
          </div>
          <button 
            onClick={handleCopy}
            style={{ 
              padding: '10px 24px', 
              backgroundColor: copied ? '#22c55e' : '#2563eb', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '30px', 
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? '已复制' : '复制全部'}
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
