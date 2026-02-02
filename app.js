class AFIAnalyzer {
            constructor() {
                this.uploadArea = document.getElementById('uploadArea');
                this.fileInput = document.getElementById('fileInput');
                this.analyzeBtn = document.getElementById('analyzeBtn');
                this.downloadReportBtn = document.getElementById('downloadReportBtn');
                this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
                this.progressBar = document.getElementById('progressBar');
                this.progressFill = document.getElementById('progressFill');
                this.resultsSection = document.getElementById('resultsSection');
                this.perFileResults = document.getElementById('perFileResults');
                this.previewGrid = document.getElementById('previewGrid');
                this.afiValue = document.getElementById('afiValue');
                this.meterIndicator = document.getElementById('meterIndicator');
                this.statusBadges = document.getElementById('statusBadges');
                this.interpretation = document.getElementById('interpretation');
                this.historyList = document.getElementById('historyList');
                this.darkModeToggle = document.getElementById('darkModeToggle');
                this.selectedFiles = [];
                this.lastResponse = null;

                this.initializeEventListeners();
                this.initializeNavigation();
                this.initializeDarkMode();
                this.loadHistory();
            }

            initializeEventListeners() {
                // File upload events
                this.uploadArea.addEventListener('click', () => this.fileInput && this.fileInput.click());
                this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));
                const initialUploadBtn = document.getElementById('uploadBtn');
                if (initialUploadBtn) {
                    initialUploadBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.fileInput && this.fileInput.click();
                    });
                }
                
                // Drag and drop events
                this.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
                this.uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
                this.uploadArea.addEventListener('drop', this.handleDrop.bind(this));
                
                // Analysis button
                this.analyzeBtn.addEventListener('click', this.performAnalysis.bind(this));
                this.downloadReportBtn.addEventListener('click', this.downloadReport.bind(this));
                this.clearHistoryBtn.addEventListener('click', this.clearHistory.bind(this));
                const clearSelectionBtn = document.getElementById('clearSelectionBtn');
                if (clearSelectionBtn) {
                    clearSelectionBtn.addEventListener('click', () => this.clearSelection());
                }

                // Keyboard shortcuts
                document.addEventListener('keydown', (e) => {
                    if (e.ctrlKey || e.metaKey) {
                        switch(e.key) {
                            case 'u':
                                e.preventDefault();
                                this.fileInput.click();
                                break;
                            case 'Enter':
                                if (!this.analyzeBtn.disabled) {
                                    this.analyzeBtn.click();
                                }
                                break;
                        }
                    }
                });
            }

            initializeNavigation() {
                const navLinks = document.querySelectorAll('.nav-link');
                const navBar = document.querySelector('.navbar');
                const headerOffset = navBar ? navBar.offsetHeight + 10 : 0; // extra spacing
                const analysisSection = document.getElementById('analysis');
                const reportsSection = document.getElementById('reports');
                const guidelinesHeader = document.getElementById('guidelines');

                function scrollToTop() {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }

                function scrollToWithOffset(element, align = 'start') {
                    if (!element) return;
                    const rect = element.getBoundingClientRect();
                    const absoluteTop = rect.top + window.scrollY;
                    let targetTop = absoluteTop - headerOffset;
                    if (align === 'end') {
                        targetTop = absoluteTop + element.offsetHeight - window.innerHeight + headerOffset;
                    }
                    window.scrollTo({ top: Math.max(targetTop, 0), behavior: 'smooth' });
                }

                navLinks.forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        navLinks.forEach(l => l.classList.remove('active'));
                        link.classList.add('active');

                        const target = link.getAttribute('href');
                        switch (target) {
                            case '#dashboard':
                                scrollToTop();
                                break;
                            case '#analysis':
                                scrollToWithOffset(analysisSection, 'start');
                                break;
                            case '#reports':
                                scrollToWithOffset(reportsSection, 'start');
                                break;
                            case '#guidelines':
                                scrollToWithOffset(guidelinesHeader, 'start');
                                break;
                            case '#patients':
                            case '#settings':
                                scrollToWithOffset(analysisSection, 'end');
                                break;
                            default:
                                const el = document.querySelector(target);
                                scrollToWithOffset(el, 'start');
                        }
                    });
                });
            }

            initializeDarkMode() {
                const saved = localStorage.getItem('afi_dark_mode');
                const isDark = saved === 'true';
                document.body.classList.toggle('dark', isDark);
                if (this.darkModeToggle) {
                    this.darkModeToggle.checked = isDark;
                    this.darkModeToggle.addEventListener('change', () => {
                        document.body.classList.toggle('dark', this.darkModeToggle.checked);
                        localStorage.setItem('afi_dark_mode', String(this.darkModeToggle.checked));
                    });
                }
            }

            handleDragOver(e) {
                e.preventDefault();
                this.uploadArea.classList.add('dragover');
            }

            handleDragLeave(e) {
                e.preventDefault();
                this.uploadArea.classList.remove('dragover');
            }

            handleDrop(e) {
                e.preventDefault();
                this.uploadArea.classList.remove('dragover');
                this.handleFileSelect(e.dataTransfer.files);
            }

            handleFileSelect(files) {
                const maxFiles = 10;
                const maxSizeBytes = 20 * 1024 * 1024; // 20MB
                const valid = [];
                for (const f of Array.from(files)) {
                    if (!f.type.startsWith('image/')) {
                        this.showNotification(`Unsupported file: ${f.name}`, 'error');
                        continue;
                    }
                    if (f.size > maxSizeBytes) {
                        this.showNotification(`Too large (>20MB): ${f.name}`, 'error');
                        continue;
                    }
                    valid.push(f);
                }
                const combined = [...this.selectedFiles, ...valid].slice(0, maxFiles);
                if (combined.length > maxFiles) {
                    this.showNotification(`Only first ${maxFiles} images kept`, 'error');
                }
                this.selectedFiles = combined;
                this.renderPreviews();
                this.updateUploadArea();
                this.analyzeBtn.disabled = this.selectedFiles.length === 0;
            }

            clearSelection() {
                this.selectedFiles = [];
                this.renderPreviews();
                this.updateUploadArea();
                this.analyzeBtn.disabled = true;
            }

            renderPreviews() {
                if (!this.previewGrid) return;
                this.previewGrid.innerHTML = '';
                this.selectedFiles.forEach((file, idx) => {
                    const url = URL.createObjectURL(file);
                    const card = document.createElement('div');
                    card.style.position = 'relative';
                    card.style.border = '1px solid rgba(0,0,0,0.1)';
                    card.style.borderRadius = '8px';
                    card.style.overflow = 'hidden';
                    card.innerHTML = `
                        <img src="${url}" style="width:100%; height:100px; object-fit:cover;" alt="preview">
                        <button data-idx="${idx}" class="remove-btn" style="position:absolute; top:6px; right:6px; background:#e53e3e; color:#fff; border:none; border-radius:6px; padding:4px 8px; cursor:pointer;">Remove</button>
                        <div style="padding:6px; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${file.name}</div>
                    `;
                    this.previewGrid.appendChild(card);
                    card.querySelector('.remove-btn').onclick = (e) => {
                        const i = Number(e.currentTarget.getAttribute('data-idx'));
                        this.selectedFiles.splice(i, 1);
                        this.renderPreviews();
                        this.updateUploadArea();
                        this.analyzeBtn.disabled = this.selectedFiles.length === 0;
                    };
                });
            }

            updateUploadArea() {
                if (this.selectedFiles.length > 0) {
                    this.uploadArea.innerHTML = `
                        <div class="upload-icon">✅</div>
                        <h4>${this.selectedFiles.length} file(s) selected</h4>
                        <p>Click to change or add more files</p>
                        <div style="margin-top:1rem;">
                            <button type="button" class="btn" id="uploadBtn">Upload</button>
                        </div>
                    `;
                    this.showNotification('Files selected successfully!', 'success');
                } else {
                    this.uploadArea.innerHTML = `
                        <div class="upload-icon">📷</div>
                        <h4>Upload scanning image</h4>
                        <p>or click to browse files</p>
                        <div style="margin-top:1rem;">
                            <button type="button" class="btn" id="uploadBtn">Upload</button>
                        </div>
                    `;
                }

                // Ensure a hidden file input exists after re-render and is bound
                let input = document.getElementById('fileInput');
                if (!input || !this.uploadArea.contains(input)) {
                    input = document.createElement('input');
                    input.type = 'file';
                    input.id = 'fileInput';
                    input.className = 'file-input';
                    input.accept = 'image/*';
                    input.multiple = true;
                    this.uploadArea.appendChild(input);
                }
                this.fileInput = input;
                this.fileInput.onchange = (e) => this.handleFileSelect(e.target.files);

                // Bind Upload button to open picker
                const uploadBtn = document.getElementById('uploadBtn');
                if (uploadBtn) {
                    uploadBtn.onclick = () => this.fileInput && this.fileInput.click();
                }
            }

            async performAnalysis() {
                if (this.selectedFiles.length === 0) return;

                this.analyzeBtn.disabled = true;
                this.analyzeBtn.textContent = 'Analyzing...';
                this.analyzeBtn.classList.add('pulse');
                this.progressBar.style.display = 'block';

                // Simulate analysis progress while uploading
                const progressTask = this.simulateProgress();

                try {
                    const form = new FormData();
                    for (const file of this.selectedFiles) {
                        form.append('files', file, file.name);
                    }
                    const res = await fetch('/upload', { method: 'POST', body: form });
                    if (!res.ok) throw new Error('Upload failed');
                    const data = await res.json();
                    this.lastResponse = data;
                    this.displayBackendResults(data);
                    this.saveHistoryEntry(data);
                    this.downloadReportBtn.disabled = false;
                } catch (err) {
                    this.showNotification(err.message || 'Something went wrong', 'error');
                } finally {
                    await progressTask;
                    this.analyzeBtn.disabled = false;
                    this.analyzeBtn.textContent = 'Analyze Images';
                    this.analyzeBtn.classList.remove('pulse');
                    this.progressBar.style.display = 'none';
                    this.progressFill.style.width = '0%';
                }
            }

            async simulateProgress() {
                const steps = [
                    { progress: 20, message: 'Uploading images...' },
                    { progress: 40, message: 'Processing images...' },
                    { progress: 60, message: 'Detecting fluid pockets...' },
                    { progress: 80, message: 'Measuring quadrants...' },
                    { progress: 100, message: 'Calculating AFI...' }
                ];

                for (const step of steps) {
                    await new Promise(resolve => setTimeout(resolve, 600));
                    this.progressFill.style.width = step.progress + '%';
                    this.showNotification(step.message, 'success', 1500);
                }
            }

            displayBackendResults(data) {
                this.resultsSection.style.display = 'block';
                // Per-file list
                this.perFileResults.innerHTML = '';
                data.results.forEach(r => {
                    const badge = this.getStatusBadge(r.afi);
                    const row = document.createElement('div');
                    row.style.display = 'flex';
                    row.style.justifyContent = 'space-between';
                    row.style.alignItems = 'center';
                    row.style.padding = '.5rem 0';
                    row.innerHTML = `<div>${r.filename}</div><div>${r.afi.toFixed(2)} cm ${badge}</div>`;
                    this.perFileResults.appendChild(row);
                });

                // Average and indicator
                this.afiValue.textContent = data.average_afi.toFixed(2) + ' cm';
                const percentage = Math.min(Math.max((data.average_afi / 30) * 100, 0), 100);
                this.meterIndicator.style.left = `calc(${percentage}% - 15px)`;

                // Interpretation
                this.updateStatusDisplay({ value: data.average_afi });
                this.showNotification('Analysis completed successfully!', 'success');
            }

            getStatusBadge(value) {
                let cls = 'status-normal';
                let text = 'Normal';
                if (value < 5) { cls = 'status-low'; text = 'Oligohydramnios'; }
                else if (value < 8) { cls = 'status-low'; text = 'Borderline Low'; }
                else if (value > 24) { cls = 'status-high'; text = 'Polyhydramnios'; }
                else if (value > 18) { cls = 'status-high'; text = 'Borderline High'; }
                return `<span class="status-badge ${cls}">${text}</span>`;
            }

            updateStatusDisplay(result) {
                let statusClass, statusText, interpretation;

                if (result.value < 5) {
                    statusClass = 'status-low';
                    statusText = 'Oligohydramnios';
                    interpretation = 'AFI below 5 cm indicates oligohydramnios (low amniotic fluid). Consider clinical correlation and potential causes. May require closer monitoring and specialist consultation.';
                } else if (result.value > 24) {
                    statusClass = 'status-high';
                    statusText = 'Polyhydramnios';
                    interpretation = 'AFI above 24 cm indicates polyhydramnios (excess amniotic fluid). Investigate potential causes including fetal anomalies, maternal diabetes, or other conditions.';
                } else if (result.value < 8) {
                    statusClass = 'status-low';
                    statusText = 'Borderline Low';
                    interpretation = 'AFI between 5-8 cm is borderline low. Monitor closely and consider clinical context. May warrant increased surveillance.';
                } else if (result.value > 18) {
                    statusClass = 'status-high';
                    statusText = 'Borderline High';
                    interpretation = 'AFI between 18-24 cm is borderline high. Continue routine monitoring while staying alert for signs of polyhydramnios.';
                } else {
                    statusClass = 'status-normal';
                    statusText = 'Normal';
                    interpretation = 'AFI within normal range (8-18 cm). Continue routine prenatal care and monitoring as appropriate for gestational age.';
                }

                this.statusBadges.innerHTML = `<span class="status-badge ${statusClass}">${statusText}</span>`;
                this.interpretation.textContent = interpretation;
            }

            showNotification(message, type = 'success', duration = 3000) {
                const notification = document.getElementById('notification');
                const notificationText = document.getElementById('notificationText');
                
                notificationText.textContent = message;
                notification.className = `notification ${type}`;
                notification.classList.add('show');

                setTimeout(() => {
                    notification.classList.remove('show');
                }, duration);
            }

            downloadReport() {
                if (!this.lastResponse) return;
                const blob = new Blob([JSON.stringify(this.lastResponse, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `afi_report_${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
            }

            saveHistoryEntry(data) {
                const history = JSON.parse(localStorage.getItem('afi_history') || '[]');
                const entry = { ts: Date.now(), ...data };
                history.unshift(entry);
                localStorage.setItem('afi_history', JSON.stringify(history.slice(0, 20)));
                this.renderHistory();
            }

            loadHistory() {
                this.renderHistory();
            }

            renderHistory() {
                const history = JSON.parse(localStorage.getItem('afi_history') || '[]');
                this.historyList.innerHTML = '';
                if (history.length === 0) {
                    this.historyList.textContent = 'No previous analyses.';
                    return;
                }
                history.forEach(item => {
                    const d = new Date(item.ts);
                    const el = document.createElement('div');
                    el.style.padding = '.5rem 0';
                    el.style.borderBottom = '1px solid rgba(0,0,0,0.05)';
                    el.innerHTML = `
                        <div style="display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
                            <div><strong>${d.toLocaleString()}</strong></div>
                            <div>Avg AFI: ${item.average_afi.toFixed(2)} cm</div>
                        </div>
                    `;
                    this.historyList.appendChild(el);
                });
            }

            clearHistory() {
                localStorage.removeItem('afi_history');
                this.renderHistory();
                this.showNotification('History cleared', 'success');
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            new AFIAnalyzer();
            // Animate cards on view
            const cards = document.querySelectorAll('.card');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                    }
                });
            });
            cards.forEach(card => observer.observe(card));
        });

        (function(){
            var toggle = document.getElementById('darkModeToggle');
    
            function applyTheme(isDark){
                if(isDark){
                    document.body.classList.add('dark-mode');
                }else{
                    document.body.classList.remove('dark-mode');
                }
                if(toggle){ toggle.checked = !!isDark; }
            }
    
            // Initialize from saved preference or system
            var stored = null;
            try { stored = localStorage.getItem('theme'); } catch(e) {}
            if(stored === 'dark'){
                applyTheme(true);
            } else if(stored === 'light'){
                applyTheme(false);
            } else {
                var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                applyTheme(prefersDark);
            }
    
            if(toggle){
                toggle.addEventListener('change', function(e){
                    var isDark = !!e.target.checked;
                    applyTheme(isDark);
                    try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch(err) {}
                });
            }
        })();
