document.addEventListener('DOMContentLoaded', () => {
    async function loadNotes() {
        const notesList = document.getElementById("notes-list");
        
        // Multiple ways to get class level with detailed logging
        let classLevel = window.CLASS_LEVEL;
        console.log('🔍 Checking class level from window.CLASS_LEVEL:', classLevel);
        
        // Fallback: extract from URL if CLASS_LEVEL is not set
        if (!classLevel) {
            const currentPage = window.location.pathname.split('/').pop();
            const currentURL = window.location.href;
            console.log('🔍 Current page filename:', currentPage);
            console.log('🔍 Full URL:', currentURL);
            
            if (currentPage.includes('notes-4th') || currentURL.includes('notes-4th')) {
                classLevel = '4th';
            } else if (currentPage.includes('notes-5th') || currentURL.includes('notes-5th')) {
                classLevel = '5th';
            } else if (currentPage.includes('notes-6th') || currentURL.includes('notes-6th')) {
                classLevel = '6th';
            } else if (currentPage.includes('notes-7th') || currentURL.includes('notes-7th')) {
                classLevel = '7th';
            }
            
            if (classLevel) {
                console.log('✅ Class level detected from URL:', classLevel);
                window.CLASS_LEVEL = classLevel; // Store for future use
            }
        }
        
        console.log('🎯 Final class level determined:', classLevel);
        
        if (!classLevel) {
            notesList.innerHTML = `<div class="no-notes">❌ <strong>Error: Could not determine class level!</strong><br><br>
            🔍 <strong>Debug Info:</strong><br>
            Current URL: ${window.location.href}<br>
            Page Name: ${window.location.pathname.split('/').pop()}<br><br>
            🔄 <strong>Solution:</strong> Please go back to home page and select your class again.<br><br>
            <button onclick="window.location.href='index.html'" style="background:#FF4444;color:white;border:none;padding:10px 20px;border-radius:10px;cursor:pointer;">🏠 Go to Home</button></div>`;
            return;
        }
        
        // Show loading message with class info
        notesList.innerHTML = `<div class="no-notes">⏳ Loading notes for <strong>${classLevel} Standard</strong>...<br><br>Please wait while we fetch your notes! 📚</div>`;
        
        try {
            // Add cache-busting parameter for immediate updates
            const cacheBuster = Date.now();
            const jsonUrl = `notes-${classLevel}.json?cache=${cacheBuster}`;
            
            console.log(`📡 Fetching notes from: ${jsonUrl}`);
            
            const response = await fetch(jsonUrl, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            
            console.log(`📊 Response status: ${response.status}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    notesList.innerHTML = `<div class="no-notes">📚 <strong>No notes found for ${classLevel} Standard yet.</strong><br><br>
                    🎓 Your teacher hasn't uploaded any notes for your class!<br><br>
                    💡 <strong>What to do:</strong><br>
                    • Ask your teacher to use the /addnote command<br>
                    • Check back later for updates<br><br>
                    <button onclick="window.location.reload()" style="background:#FF4444;color:white;border:none;padding:10px 20px;border-radius:10px;cursor:pointer;">🔄 Refresh Page</button></div>`;
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseText = await response.text();
            console.log(`📄 Raw response preview: ${responseText.substring(0, 200)}...`);
            
            let notes;
            try {
                notes = JSON.parse(responseText);
            } catch (parseError) {
                console.error('❌ JSON Parse Error:', parseError);
                throw new Error('Invalid JSON format in notes file');
            }
            
            console.log(`📋 Parsed notes for ${classLevel} Standard:`, notes);
            
            notesList.innerHTML = "";
            
            if (!Array.isArray(notes) || notes.length === 0) {
                notesList.innerHTML = `<div class="no-notes">📚 <strong>No notes available for ${classLevel} Standard yet.</strong><br><br>
                🎓 Your class notes section is empty!<br><br>
                💡 <strong>Ask your teacher to:</strong><br>
                • Use the /addnote command in the bot<br>
                • Upload study materials for your class<br><br>
                ⏰ <strong>Auto-refresh:</strong> This page updates every 20 seconds<br><br>
                <button onclick="window.location.reload()" style="background:#FF4444;color:white;border:none;padding:10px 20px;border-radius:10px;cursor:pointer;">🔄 Refresh Now</button></div>`;
                return;
            }
            
            // Create note items
            notes.forEach((note, index) => {
                console.log(`🏗️ Creating note ${index + 1}: ${note.title}`);
                
                const noteItem = document.createElement("div");
                noteItem.className = "note-item";
                
                // Add thumbnail with cache busting
                if (note.thumbnail) {
                    const thumbnail = document.createElement("img");
                    thumbnail.src = note.thumbnail + `?cache=${cacheBuster}`;
                    thumbnail.className = "note-thumbnail";
                    thumbnail.alt = note.title;
                    thumbnail.onerror = function() {
                        console.log('📸 Thumbnail failed to load, showing placeholder for:', note.title);
                        const placeholder = document.createElement("div");
                        placeholder.className = "note-thumbnail";
                        placeholder.style.cssText = "background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;align-items:center;justify-content:center;font-size:3rem;color:white;";
                        placeholder.innerHTML = "📄";
                        this.parentNode.replaceChild(placeholder, this);
                    };
                    noteItem.appendChild(thumbnail);
                } else {
                    const placeholder = document.createElement("div");
                    placeholder.className = "note-thumbnail";
                    placeholder.style.cssText = "background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;align-items:center;justify-content:center;font-size:3rem;color:white;";
                    placeholder.innerHTML = "📄";
                    noteItem.appendChild(placeholder);
                }
                
                // Create content container
                const noteContent = document.createElement("div");
                noteContent.className = "note-content";
                
                // Add title
                const noteTitle = document.createElement("div");
                noteTitle.className = "note-title";
                noteTitle.innerText = note.title || "Untitled Note";
                noteContent.appendChild(noteTitle);
                
                // Add download button
                const downloadButton = document.createElement("button");
                downloadButton.className = "download-button";
                downloadButton.innerHTML = "⬇️ Download Now";
                downloadButton.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log(`📥 Download initiated for: ${note.title}`);
                    
                    // Create download link with cache-busting
                    const link = document.createElement('a');
                    link.href = note.link + `?download=true&cache=${cacheBuster}`;
                    link.download = (note.title || 'download').replace(/[^a-zA-Z0-9.-]/g, '_');
                    link.target = '_blank';
                    link.style.display = 'none';
                    
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    // Visual feedback
                    downloadButton.innerHTML = "✅ Downloaded!";
                    downloadButton.style.backgroundColor = "#28a745";
                    setTimeout(() => {
                        downloadButton.innerHTML = "⬇️ Download Now";
                        downloadButton.style.backgroundColor = "";
                    }, 2000);
                    
                    console.log(`✅ Download completed for: ${note.title}`);
                };
                
                noteContent.appendChild(downloadButton);
                noteItem.appendChild(noteContent);
                notesList.appendChild(noteItem);
            });
            
            console.log(`🎉 Successfully loaded ${notes.length} notes for ${classLevel} Standard`);
            
        } catch (error) {
            console.error('💥 Error loading notes:', error);
            notesList.innerHTML = `<div class="no-notes">❌ <strong>Unable to load notes for ${classLevel} Standard</strong><br><br>
            🐛 <strong>Error Details:</strong> ${error.message}<br><br>
            🔄 <strong>Auto-refresh in 10 seconds...</strong><br><br>
            <button onclick="window.location.reload()" style="background:#FF4444;color:white;border:none;padding:10px 20px;border-radius:10px;cursor:pointer;">🔄 Refresh Now</button></div>`;
            
            // Auto-refresh after error
            setTimeout(() => {
                console.log('🔄 Auto-refreshing page after error...');
                window.location.reload();
            }, 10000);
        }
    }
    
    // Load notes immediately
    console.log('🚀 Starting notes loading process...');
    loadNotes();
    
    // Auto-refresh every 20 seconds for immediate updates
    setInterval(() => {
        console.log('⏰ Auto-refresh triggered (20s interval)');
        loadNotes();
    }, 20000);
    
    // Also refresh when page becomes visible again
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            console.log('👁️ Page became visible, refreshing notes...');
            setTimeout(loadNotes, 1000);
        }
    });
});