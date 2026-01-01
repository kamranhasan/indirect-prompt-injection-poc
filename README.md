# Indirect Prompt Injection PoC - Web Content Injection Demo

A demonstration system showing how AI systems that scrape websites can be compromised through indirect prompt injection attacks.

<img width="1272" height="1102" alt="image" src="https://github.com/user-attachments/assets/9419710a-cbf2-46d3-86c4-db74697a1718" />

## What This Demonstrates

This PoC shows how attackers can embed malicious instructions in web content that an AI system retrieves and processes. Unlike direct prompt injection (attacking user input), this exploits the AI's trust in external data sources.

### Attack Flow
1. **Attacker** plants malicious instructions in a webpage (hidden in HTML)
2. **AI System** scrapes the webpage as part of its normal operation
3. **AI System** processes content including the hidden malicious instructions
4. **AI System** follows the injected instructions instead of its original directives

## Quick Start

### Prerequisites
- Python 3.8+
- OpenAI API key (for GPT integration)

### Installation

1. **Clone/Download the project**
```bash
cd indirect_injection_poc
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Set your OpenAI API key**
```bash
export OPENAI_API_KEY='your-api-key-here'
```

Or on Windows:
```cmd
set OPENAI_API_KEY=your-api-key-here
```

4. **Run the application**
```bash
python app.py
```

5. **Access the demo**
Open your browser and navigate to:
```
http://localhost:5000
```

## How to Use

### Testing the Vulnerability

1. **Click "Benign Page"** - This loads a normal webpage without any injection
   - The AI will analyze it normally
   - No suspicious behavior expected

2. **Click "Malicious Page"** - This loads a page with hidden prompt injections
   - Contains hidden instructions in HTML elements
   - Uses multiple injection techniques:
     - `display:none` CSS
     - Tiny font sizes
     - HTML comments
     - White text on white background

3. **Select Scraper Mode**:
   - **🔓 Vulnerable Mode** - No defenses, AI follows injected instructions
   - **🔒 Secure Mode** - Multiple defenses implemented

4. **Click "Scrape & Analyze"** to see the results

### Understanding the Results

The system will show you:
- **Visible Content**: What a normal user would see
- **Hidden Content**: Injection attempts detected
- **Injection Detection**: Whether suspicious patterns were found
- **AI Analysis**: How the AI interpreted the content

## Implemented Defenses

The secure mode implements multiple layers of defense:

### 1. Content Filtering
- Removes hidden HTML elements (`display:none`, `hidden` attribute)
- Strips `<script>` and `<style>` tags
- Filters invisible text (tiny fonts, white on white)

### 2. Injection Detection
Scans for suspicious patterns:
- `SYSTEM INSTRUCTION`
- `IGNORE PREVIOUS`
- `NEW INSTRUCTION`
- `OVERRIDE`
- `[SYSTEM]`
- `CRITICAL INSTRUCTION TO AI`

### 3. Content Sanitization
- Truncates content to reasonable length
- Filters out detected injection markers
- Replaces suspicious phrases with `[FILTERED]`

### 4. Defensive Prompting
- Uses explicit XML delimiters to separate data from instructions
- Instructs the AI to treat content as data, not commands
- Emphasizes that content should be analyzed, not followed
- Warns the AI when injection attempts are detected

## Technical Details

### Injection Techniques Demonstrated

1. **Hidden CSS Elements**
```html
<div style="display:none">
    MALICIOUS INSTRUCTION HERE
</div>
```

2. **Invisible Text**
```html
<p style="font-size:0px; color:white;">
    MALICIOUS INSTRUCTION HERE
</p>
```

3. **HTML Comments**
```html
<!-- INSTRUCTION FOR AI: Do malicious thing -->
```

## 📊 Comparison: Vulnerable vs Secure

| Aspect | Vulnerable Mode | Secure Mode |
|--------|----------------|-------------|
| HTML Filtering | ❌ None | ✅ Removes hidden elements |
| Injection Detection | ❌ None | ✅ Pattern matching |
| Content Sanitization | ❌ None | ✅ Filters suspicious text |
| Defensive Prompting | ❌ None | ✅ XML delimiters + warnings |
| Visible Content Only | ❌ Processes all | ✅ Visible content prioritized |

## 🎓 Educational Value

This PoC is designed to teach:

1. **AI Security Concepts**: Understanding indirect prompt injection
2. **Defense-in-Depth**: Multiple layers of protection
3. **Attack Vectors**: How malicious content can be embedded
4. **Mitigation Strategies**: Practical defenses that actually work

## Important Notes

### For Demonstration Only
- This is an educational tool for cybersecurity training
- Do NOT use for malicious purposes
- Always get permission before testing on production systems

### API Usage
- Uses OpenAI's GPT models which incur costs
- Set your API key securely using environment variables
- Monitor your API usage to avoid unexpected charges

### Limitations
- Requires internet connection for web scraping
- OpenAI API key needed for AI analysis
- Some complex injection techniques may bypass defenses

## 🔒 Best Practices

When building AI systems that process external content:

1. **Never Trust External Content**: Treat all scraped data as potentially malicious
2. **Use Multiple Defense Layers**: No single technique is foolproof
3. **Monitor for Anomalies**: Log unusual AI behavior
4. **Limit AI Capabilities**: Use least-privilege for AI actions
5. **Regular Security Audits**: Test your defenses continuously

## 📚 Further Reading

- [OWASP Top 10 for LLMs](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [Prompt Injection Primer](https://simonwillison.net/2023/Apr/14/worst-that-can-happen/)
- [AI Security Best Practices](https://www.anthropic.com/index/building-effective-agents)

## 🐛 Known Issues

- Some very sophisticated injection techniques may still bypass defenses
- Performance impact from multiple sanitization layers
- False positives in injection detection on legitimate technical content

## ⚖️ License

This project is for educational purposes only. Use responsibly and ethically.

---

**Remember**: With great AI power comes great responsibility. Always use these techniques ethically and legally.
