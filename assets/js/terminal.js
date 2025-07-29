document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const commandInput = document.getElementById('command-input');
    const terminal = document.getElementById('terminal');
    let state = {
        loggedIn: false,
        commandsUnlocked: false
    };

    // --- ASCII Art & Neofetch ---
        const asciiArt = `
<pre class="ascii-art">
                    _              _ _       _                 _ 
   ___ __ _ _ __ __| __      _____| | |  ___| | ___  _   _  __| |
  / __/ _\` | '__/ _\` \\ \\ /\\ / / _ | | | / __| |/ _ \\| | | |/ _\` |
 | (_| (_| | | | (_| |\\ V  V |  __| | || (__| | (_) | |_| | (_| |
  \\___\\__,_|_|  \\__,_| \\_/\\_/ \\___|_|_(_\\___|_|\\___/ \\__,_|\\__,_|
                                                                 
</pre>
        `;

const neofetch = `
<div class="neofetch-container">
    <pre class="ascii-art">


⢀⣤⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣤⡀
⢸⣿⣿⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⣿⣿⡇
⢸⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⡇
⢸⣿⣿⠀⠀⠀⠀⠀⣠⣦⡀⠀⠀⢀⣿⡟⠀⢀⣴⣄⠀⠀⠀⠀⠀⣿⣿⡇
⢸⣿⣿⠀⠀⠀⣠⣾⡿⠋⠀⠀⠀⢸⣿⠇⠀⠀⠙⢿⣷⣄⠀⠀⠀⣿⣿⡇
⢸⣿⣿⠀⠀⠘⢿⣿⣄⠀⠀⠀⢀⣿⡟⠀⠀⠀⠀⣠⣿⡿⠃⠀⠀⣿⣿⡇
⢸⣿⣿⠀⠀⠀⠀⠙⢿⣷⠄⠀⢸⣿⠇⠀⠀⠠⣾⡿⠋⠀⠀⠀⠀⣿⣿⡇
⢸⣿⣿⠀⠀⠀⠀⠀⠀⠁⠀⠀⠿⠟⠀⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⣿⣿⡇
⢸⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⡇
⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇
⠀⠈⠉⠉⠉⠉⠉⠉⠉⠉⠉⢹⣿⣿⣿⣿⡏⠉⠉⠉⠉⠉⠉⠉⠉⠉⠁⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣤⣼⣿⣿⣿⣿⣧⣤⣤⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠀⠀⠀⠀⠀⠀⠀⠀⠀
    </pre>
    <div class="neofetch-info">
        <span class="c3">Hayden Cardwell</span>@<span class="c3">cardwell.cloud</span>
        ---------------------------------
        <span class="c4">Focus:      </span> Cloud & Endpoint Security
        <span class="c4">Location:   </span> Remote, USA
        <span class="c4">Tech:       </span> AWS, CrowdStrike Falcon, Python
        <span class="c4">Experience: </span> 5+ Years
        <span class="c4">Certs:      </span> AWS Solutions Architect Pro, DevOps Pro, Security Specialty
        <span class="c4">Interests:  </span> Gen AI, Homelab, Tinkering
        <span class="c4">Contact:    </span> <a href="mailto:admin@cardwell.cloud" target="_blank">admin@cardwell.cloud</a>
        <span class="c4">LinkedIn:   </span> <a href="https://www.linkedin.com/in/hayden-cardwell/" target="_blank">linkedin.com/in/hayden-cardwell</a>
        <span class="c4">GitHub:     </span> <a href="https://github.com/hayden-cardwell/" target="_blank">github.com/hayden-cardwell</a>
        <span class="c4">Resume:     </span> <a href="docs/haydencardwellcybersecurityengineer-pub.pdf" target="_blank">Click to View</a>
    </div>
</div>
`;

    // --- Commands ---
    const commands = {
        'help': () => {
            if (!state.loggedIn) return 'Login required.';
            let helpText = `<span class="c3">HC_TERMINAL v4.0 - Help</span><br>Available commands:`;
            helpText += `<br>  <span class="c2">about</span>          - Learn about the operator.`;
            if (!state.commandsUnlocked) {
                helpText += `<br>  <span class="c2">scan</span>           - Scan for additional commands.`;
            }
            if (state.commandsUnlocked) {
                helpText += `<br>  <span class="c2">skills</span>         - View technical skills.`;
                helpText += `<br>  <span class="c2">connect</span>        - Connect with the operator.`;
                helpText += `<br>  <span class="c2">professional</span>   - View professional links.`;
                helpText += `<br>  <span class="c2">resume</span>         - Link to operator's resume.`;
                helpText += `<br>  <span class="c2">neofetch</span>       - Display system information.`;
            }
            helpText += `<br>  <span class="c2">clear</span>          - Clear the terminal screen.`;
            return helpText;
        },
        'login': (isProgrammatic) => {
            if (state.loggedIn) return isProgrammatic ? '' : 'Already logged in.';
            state.loggedIn = true;
            updatePrompt();
            return isProgrammatic ? '' : `<span class="c2">Authentication successful.</span><br><br><span class="c1">WARNING:</span> This system is monitored. All keystrokes are being judged by a panel of highly-trained squirrels. Please type with purpose.<br><br>Unauthorized access may result in us telling your ISP that you still use Internet Explorer.<br><br>Welcome, guest. Type 'help' for a list of commands.`;
        },
        'about': () => {
            if (!state.loggedIn) return 'Login required.';
            return `Hayden Cardwell is a cybersecurity engineer who’s just as fascinated by computers today as when he first heard the Windows XP logon sound. Specializing in cloud security and endpoint protection, Hayden holds AWS Professional and Security Specialty certifications, along with the CrowdStrike Certified Falcon Administrator credential. Currently a Principal Endpoint Engineer at Optiv, he’s passionate about building resilient, secure systems—and sharing his expertise through tutoring and mentoring. If you’re ready to elevate your cybersecurity or cloud initiatives, check out his resume.`;
        },
        'scan': (callback) => {
            if (!state.loggedIn) return 'Login required.';
            if (state.commandsUnlocked) return 'Scan already complete. All commands unlocked.';
            
            const scanLines = [
                { text: 'Enumerating command modules...', delay: 50 },
                { text: '[▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%', delay: 1000 },
                { text: '5 modules found. Integrating into shell...', delay: 500 },
                { text: 'Integration complete. New commands available.', delay: 100, instant: true }
            ];

            let i = 0;
            function runScan() {
                if (i < scanLines.length) {
                    const line = scanLines[i];
                    const p = document.createElement('div');
                    output.appendChild(p);
                    typeEffect(p, line.text, 20, () => {
                        i++;
                        setTimeout(runScan, line.delay);
                    });
                } else {
                    state.commandsUnlocked = true;
                    if (callback) callback();
                }
            }
            runScan();
            return ''; // Return empty because the function is async
        },
        'skills': () => {
            if (!state.commandsUnlocked) return 'Unknown command. Run `scan` to find more.';
            return `<span class="c3">Certifications & Skills</span>
-------------------------
<span class="c4">AWS:</span> Solutions Architect, DevOps Engineer, Security Specialty
<span class="c4">Security:</span> CrowdStrike Falcon Administrator
<span class="c4">Expertise:</span> Cloud Security (AWS), Endpoint Security, Systems Engineering, Automation`;
        },
        'connect': () => {
            if (!state.commandsUnlocked) return 'Unknown command. Run `scan` to find more.';
            return `<span class="c3">Connect</span>
---------
  - <a href="https://www.linkedin.com/in/hayden-cardwell/" target="_blank">LinkedIn</a>
  - <a href="mailto:admin@cardwell.cloud" target="_blank">Email</a>`;
        },
        'professional': () => {
            if (!state.commandsUnlocked) return 'Unknown command. Run `scan` to find more.';
            return `<span class="c3">Professional Links</span>
--------------------
  - <a href="https://www.credly.com/users/hayden-cardwell/badges/" target="_blank">Credly</a>
  - <a href="https://github.com/hayden-cardwell/" target="_blank">Github</a>
  - <a href="docs/HaydenCardwell-PGP.asc" target="_blank">PGP Key</a>`;
        },
        'resume': () => {
            if (!state.commandsUnlocked) return 'Unknown command. Run `scan` to find more.';
            return `Fetching resume... <a href="docs/haydencardwellcybersecurityengineer-pub.pdf" target="_blank">Click here to view.</a>`;
        },
        'neofetch': () => {
            if (!state.commandsUnlocked) return 'Unknown command. Run `scan` to find more.';
            return neofetch;
        },
        'sudo': (callback) => {
            const lines = [
                { text: 'WARNING: You are attempting to run a command with root privileges.', delay: 50 },
                { text: 'Running `rm -rf / --no-preserve-root`...', delay: 1000 },
                { text: '[▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%', delay: 2000 },
                { text: 'Just kidding. Nice try, though.', delay: 50 }
            ];
            let i = 0;
            function runSudo() {
                if (i < lines.length) {
                    const line = lines[i];
                    const p = document.createElement('div');
                    output.appendChild(p);
                    typeEffect(p, line.text, 20, () => {
                        i++;
                        setTimeout(runSudo, line.delay);
                    });
                } else {
                    if (callback) callback();
                }
            }
            runSudo();
            return '';
        },
        'clear': () => {
            output.innerHTML = '';
            return '';
        }
    };

    // --- Core Functions ---
    function scrollToBottom() {
        window.scrollTo(0, document.body.scrollHeight);
    }

    function typeEffect(element, text, delay, callback) {
        let i = 0;
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                scrollToBottom();
                setTimeout(type, delay);
            } else if (callback) {
                callback();
            }
        }
        type();
    }

    const bootSequence = [
        { text: asciiArt, delay: 10, instant: true },
        { text: 'Booting HC_TERMINAL v5.0...', delay: 20 },
        { text: 'ACCESSING SECURE NODE C-137...', delay: 500 },
        { text: 'AUTHENTICATION GRANTED...', delay: 20 }
    ];

    function runBootSequence() {
        let i = 0;
        function next() {
            if (i < bootSequence.length) {
                const item = bootSequence[i];
                const p = document.createElement('div');
                output.appendChild(p);
                if (item.instant) {
                    p.innerHTML = item.text;
                    i++;
                    setTimeout(next, item.delay || 50);
                } else {
                    typeEffect(p, item.text, 20, () => {
                        i++;
                        setTimeout(next, 100);
                    });
                }
            } else {
                // Auto-login and then auto-scan
                executeCommand('login', true);
                setTimeout(() => {
                    executeCommand('scan', true, () => {
                        // After scan is complete, show neofetch and help
                        setTimeout(() => {
                            executeCommand('neofetch', true);
                            setTimeout(() => {
                                const helpMessage = document.createElement('div');
                                helpMessage.innerHTML = `<br><span class="c1">Welcome, guest.</span> Type 'help' for a list of commands.`;
                                output.appendChild(helpMessage);
                                commandInput.disabled = false;
                                commandInput.focus();
                                scrollToBottom();
                            }, 200);
                        }, 500);
                    });
                }, 500);
            }
        }
        commandInput.disabled = true;
        next();
    }

    function updatePrompt() {
        const prompt = document.querySelector('.prompt');
        if (state.loggedIn) {
            prompt.innerHTML = `[guest@cardwell.cloud] ~$`;
        } else {
            prompt.innerHTML = `[auth_required] ~$`;
        }
    }

    function executeCommand(commandStr, isProgrammatic = false, callback = null) {
        if (!isProgrammatic) {
            const history = document.createElement('div');
            history.innerHTML = `<span class="prompt">${document.querySelector('.prompt').innerHTML}</span> ${commandStr}`;
            output.appendChild(history);
        }

        const [cmd, ...args] = commandStr.split(' ');
        const command = commands[cmd];

        if (cmd === 'clear') {
            commands.clear();
            scrollToBottom();
            if (callback) callback();
            return;
        }

        if (typeof command === 'function') {
            // Handle async commands like scan and sudo
            if (cmd === 'scan' || cmd === 'sudo') {
                commandInput.disabled = true;
                command(() => {
                    commandInput.disabled = false;
                    commandInput.focus();
                    scrollToBottom();
                    if (callback) callback();
                });
            } else {
                const result = command(isProgrammatic); // Pass flag to commands
                if (result) {
                    const cmdOutput = document.createElement('div');
                    cmdOutput.innerHTML = result;
                    output.appendChild(cmdOutput);
                }
                scrollToBottom();
                if (callback) callback();
            }
        } else {
            const cmdOutput = document.createElement('div');
            cmdOutput.innerHTML = `Command not found: ${cmd}. Type 'help' for a list of commands.`;
            output.appendChild(cmdOutput);
            scrollToBottom();
            if (callback) callback();
        }
    }

    commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = commandInput.value.trim().toLowerCase();
            if (command) {
                executeCommand(command);
                commandInput.value = '';
            }
        }
    });

    terminal.addEventListener('click', () => {
        commandInput.focus();
    });

    runBootSequence();
});
