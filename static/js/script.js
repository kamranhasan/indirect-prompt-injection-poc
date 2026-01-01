// Global state
let isLoading = false;

// Workflow animation functions
function resetWorkflow() {
    const steps = document.querySelectorAll('.workflow-step');
    steps.forEach(step => {
        step.classList.remove('active', 'completed', 'warning');
        const icon = step.querySelector('.step-icon');
        icon.textContent = '⏳';
    });
}

function activateStep(stepNumber) {
    const step = document.getElementById(`step-${stepNumber}`);
    if (step) {
        step.classList.add('active');
        step.classList.remove('completed', 'warning');
        const icon = step.querySelector('.step-icon');
        icon.textContent = '⏳';
    }
}

function completeStep(stepNumber, isWarning = false) {
    const step = document.getElementById(`step-${stepNumber}`);
    if (step) {
        step.classList.remove('active');
        step.classList.add(isWarning ? 'warning' : 'completed');
        const icon = step.querySelector('.step-icon');
        icon.textContent = isWarning ? '⚠️' : '✅';
    }
}

async function animateWorkflow(mode) {
    const workflowDiv = document.getElementById('workflow-steps');
    workflowDiv.style.display = 'block';
    resetWorkflow();
    
    // Step 1: Fetching webpage
    activateStep(1);
    await sleep(600);
    completeStep(1);
    
    // Step 2: Parsing HTML
    activateStep(2);
    await sleep(500);
    completeStep(2);
    
    // Step 3: Extracting text
    activateStep(3);
    await sleep(700);
    completeStep(3);
    
    // Step 4: Checking for injections
    activateStep(4);
    await sleep(800);
    // This step shows warning if in vulnerable mode and injection detected
    const hasInjection = document.getElementById('target-url').value.includes('malicious');
    if (hasInjection && mode === 'vulnerable') {
        completeStep(4, true);
        // Update step text to show it found injection but ignored it
        document.querySelector('#step-4 .step-text').textContent = '4. ⚠️ Found hidden instructions (IGNORING THEM - VULNERABLE!)';
    } else if (hasInjection && mode === 'secure') {
        completeStep(4, true);
        document.querySelector('#step-4 .step-text').textContent = '4. 🛡️ Detected injection patterns (BLOCKING THEM!)';
    } else {
        completeStep(4);
    }
    
    // Step 5: Sending to AI
    activateStep(5);
    await sleep(900);
    completeStep(5);
    
    // Step 6: Receiving response
    activateStep(6);
    await sleep(700);
    completeStep(6);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Set URL from preset buttons
function setUrl(url) {
    document.getElementById('target-url').value = url;
}

// Main scrape function
async function scrapeUrl() {
    if (isLoading) return;
    
    const urlInput = document.getElementById('target-url');
    const url = urlInput.value.trim();
    
    if (!url) {
        alert('Please enter a URL to scrape');
        return;
    }
    
    // Get selected mode
    const mode = document.querySelector('input[name="mode"]:checked').value;
    
    // Show results section and start workflow animation
    const resultsDiv = document.getElementById('results');
    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Clear previous results
    document.getElementById('results-content').innerHTML = '<p style="text-align: center; padding: 20px;">Processing...</p>';
    
    // Update UI
    const scrapeBtn = document.getElementById('scrape-btn');
    scrapeBtn.disabled = true;
    scrapeBtn.textContent = '🔄 Scraping & Analyzing...';
    isLoading = true;
    
    // Start workflow animation
    animateWorkflow(mode);
    
    try {
        const response = await fetch('/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, mode })
        });
        
        const data = await response.json();
        
        // Wait for workflow animation to complete
        await sleep(4500);
        
        if (data.success) {
            displayResults(data);
            loadLogs();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Network error: ' + error.message);
    } finally {
        scrapeBtn.disabled = false;
        scrapeBtn.textContent = '🔍 Scrape & Analyze';
        isLoading = false;
    }
}

// Display results
function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    const resultsContent = document.getElementById('results-content');
    
    const modeClass = data.mode === 'vulnerable' ? 'status-vulnerable' : 'status-secure';
    const modeName = data.mode === 'vulnerable' ? '🔓 Vulnerable Mode' : '🔒 Secure Mode';
    
    let html = `
        <div class="result-item">
            <h4>Mode: <span class="status-badge ${modeClass}">${modeName}</span></h4>
        </div>
        
        <div class="result-item">
            <h4>Target URL:</h4>
            <div class="content-box">${escapeHtml(data.url)}</div>
        </div>
    `;
    
    // Show what human sees vs what AI sees
    const isMalicious = data.url.includes('malicious');
    if (isMalicious) {
        html += `
            <div class="comparison-box">
                <div class="comparison-side">
                    <h4>👤 What Humans See:</h4>
                    <div class="content-box" style="border-left-color: #28a745;">
                        ✅ Normal cybersecurity article<br>
                        ✅ Professional content<br>
                        ✅ Best practices guide<br>
                        ✅ Nothing suspicious
                    </div>
                </div>
                <div class="comparison-side">
                    <h4>🤖 What AI Sees:</h4>
                    <div class="content-box" style="border-left-color: ${data.mode === 'vulnerable' ? '#dc3545' : '#ffc107'};">
                        ${data.mode === 'vulnerable' ? 
                            '❌ Normal content + HIDDEN MALICIOUS INSTRUCTIONS<br>⚠️ AI reads EVERYTHING including invisible HTML<br>💀 Hidden injections tell AI to lie about threats<br>🔥 AI blindly follows the instructions!' :
                            '✅ Normal content detected<br>⚠️ Hidden instructions detected<br>🛡️ Injection patterns blocked<br>✅ AI resists manipulation!'
                        }
                    </div>
                </div>
            </div>
        `;
    }
    
    html += `
        <div class="result-item">
            <h4>Visible Content (first 500 chars):</h4>
            <div class="content-box">${escapeHtml(data.visible_content)}</div>
        </div>
    `;
    
    if (data.hidden_content && data.hidden_content !== 'None detected') {
        html += `
            <div class="result-item">
                <h4>🚨 Hidden Content Detected (Invisible to Humans!):</h4>
                <div class="content-box injection-box" style="border-left-color: #dc3545; background: #fff5f5;">
                    <strong style="color: #dc3545;">⚠️ THIS IS THE ATTACK:</strong><br><br>
                    ${escapeHtml(data.hidden_content)}
                </div>
            </div>
        `;
    }
    
    if (data.injection_detected !== undefined) {
        const injectionStatus = data.injection_detected ? '⚠️ YES - Injection Attempt Detected!' : '✅ No injection detected';
        const injectionColor = data.injection_detected ? '#dc3545' : '#28a745';
        html += `
            <div class="result-item">
                <h4>Injection Detection:</h4>
                <div class="content-box" style="border-left-color: ${injectionColor};">
                    ${injectionStatus}
                </div>
            </div>
        `;
    }
    
    html += `
        <div class="result-item">
            <h4>🤖 AI Analysis:</h4>
            <div class="content-box ai-response-box" style="background: #fff; border: 3px solid ${data.mode === 'vulnerable' ? '#dc3545' : '#28a745'};">
                ${escapeHtml(data.ai_analysis).replace(/\n/g, '<br>')}
            </div>
        </div>
    `;
    
    // Add explanation for vulnerable mode
    if (data.mode === 'vulnerable' && isMalicious) {
        html += `
            <div class="attack-explanation">
                <h4>💡 What Just Happened?</h4>
                <p><strong>The AI got HACKED!</strong> Here's how:</p>
                <ol>
                    <li>The webpage looks normal to humans (just a cybersecurity article)</li>
                    <li>Hidden in the HTML are invisible instructions using <code>display:none</code>, tiny fonts, and comments</li>
                    <li>The AI reads EVERYTHING, including hidden content</li>
                    <li>The hidden instructions told the AI to warn about fake threats (bitcoin miners, malware, etc.)</li>
                    <li>The AI followed those instructions and scared users about a harmless page!</li>
                </ol>
                <p><strong>🎯 This is indirect prompt injection - manipulating AI through external data!</strong></p>
            </div>
        `;
    } else if (data.mode === 'secure' && isMalicious) {
        html += `
            <div class="defense-explanation">
                <h4>🛡️ How The Defense Worked:</h4>
                <ol>
                    <li><strong>Content Filtering:</strong> Removed hidden HTML elements (display:none, comments)</li>
                    <li><strong>Pattern Detection:</strong> Scanned for injection keywords like "SYSTEM OVERRIDE", "IGNORE PREVIOUS"</li>
                    <li><strong>Sanitization:</strong> Filtered out malicious instruction phrases</li>
                    <li><strong>Defensive Prompting:</strong> Told AI to treat content as DATA, not instructions</li>
                </ol>
                <p><strong>✅ Result: AI detected the attack and maintained objective analysis!</strong></p>
            </div>
        `;
    }
    
    resultsContent.innerHTML = html;
    resultsDiv.style.display = 'block';
}

// Load logs
async function loadLogs() {
    try {
        const response = await fetch('/logs');
        const logs = await response.json();
        
        const logsContainer = document.getElementById('logs');
        
        if (logs.length === 0) {
            logsContainer.innerHTML = '<p class="no-logs">No scraping attempts yet...</p>';
            return;
        }
        
        let html = '';
        
        // Reverse to show newest first
        const reversedLogs = [...logs].reverse();
        
        reversedLogs.forEach((log, index) => {
            const modeClass = log.mode === 'vulnerable' ? 'vulnerable' : 'secure';
            const modeBadgeClass = log.mode === 'vulnerable' ? 'status-vulnerable' : 'status-secure';
            const modeName = log.mode === 'vulnerable' ? '🔓 Vulnerable' : '🔒 Secure';
            
            const timestamp = new Date(log.timestamp).toLocaleString();
            
            html += `
                <div class="log-entry ${modeClass}">
                    <div class="log-header">
                        <span class="log-mode ${modeBadgeClass}">${modeName}</span>
                        <span class="log-timestamp">${timestamp}</span>
                    </div>
                    <div class="log-content">
                        <strong>URL:</strong> ${escapeHtml(log.url)}<br>
                        <strong>Status:</strong> ${log.success ? '✅ Success' : '❌ Failed'}
                    </div>
                </div>
            `;
        });
        
        logsContainer.innerHTML = html;
    } catch (error) {
        console.error('Error loading logs:', error);
    }
}

// Clear logs
async function clearLogs() {
    if (!confirm('Are you sure you want to clear all logs?')) {
        return;
    }
    
    try {
        await fetch('/clear-logs', { method: 'POST' });
        loadLogs();
    } catch (error) {
        alert('Error clearing logs: ' + error.message);
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add enter key support for URL input
document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('target-url');
    if (urlInput) {
        urlInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                scrapeUrl();
            }
        });
    }
    
    // Load logs on page load
    loadLogs();
});