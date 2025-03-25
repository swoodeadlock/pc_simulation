document.addEventListener('DOMContentLoaded', () => {
    // Global variables
    let currentScenario = 0;
    let userScores = [];
    let userChoices = [];
    let maxPossibleScore = 0;
    
    // DOM Elements
    const homeScreen = document.getElementById('home-screen');
    const scenarioContainer = document.getElementById('scenario-container');
    const resultsScreen = document.getElementById('results-screen');
    const finalResults = document.getElementById('final-results');
    const startButton = document.getElementById('start-simulation');
    const restartButton = document.getElementById('restart-btn');
    
    // Templates
    const decisionTemplate = document.getElementById('decision-template');
    const multipleSelectTemplate = document.getElementById('multiple-select-template');
    const sequenceTemplate = document.getElementById('sequence-template');
    const setupTaskTemplate = document.getElementById('setup-task-template');
    const formTemplate = document.getElementById('form-template');
    
    // Event Listeners
    startButton.addEventListener('click', startSimulation);
    restartButton.addEventListener('click', restartSimulation);
    
    // Drag and drop functionality for sequence items
    let dragSrcEl = null;

    function handleDragStart(e) {
        this.style.opacity = '0.4';
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
    }

    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        
        if (dragSrcEl !== this) {
            // If dropping into the ordered list
            if (this.parentNode.classList.contains('ordered-options') || this.closest('.ordered-options')) {
                const orderedOptions = document.querySelector('.ordered-options');
                
                if (this.parentNode.classList.contains('ordered-options')) {
                    // If dropping directly into the ordered list (not on another item)
                    this.parentNode.appendChild(dragSrcEl);
                } else {
                    // If dropping onto another item in the ordered list
                    this.parentNode.insertBefore(dragSrcEl, this);
                }
            } else if (this.parentNode.classList.contains('unordered-options')) {
                // If dropping within the unordered list
                const unorderedList = this.parentNode;
                const children = Array.from(unorderedList.children);
                const srcIndex = children.indexOf(dragSrcEl);
                const destIndex = children.indexOf(this);
                
                if (srcIndex < destIndex) {
                    unorderedList.insertBefore(dragSrcEl, this.nextSibling);
                } else {
                    unorderedList.insertBefore(dragSrcEl, this);
                }
            }
        }
        
        return false;
    }

    function handleDragEnd(e) {
        this.style.opacity = '1';
        
        document.querySelectorAll('.sequence-item').forEach(item => {
            item.classList.remove('over');
        });
    }
    
    // Start the simulation
    function startSimulation() {
        homeScreen.classList.remove('active');
        currentScenario = 0;
        userScores = [];
        userChoices = [];
        maxPossibleScore = calculateMaxScore();
        loadScenario(scenarios[currentScenario]);
    }
    
    // Restart the simulation
    function restartSimulation() {
        resultsScreen.classList.remove('active');
        startSimulation();
    }
    
    // Calculate maximum possible score
    function calculateMaxScore() {
        let maxScore = 0;
        
        scenarios.forEach(scenario => {
            if (scenario.type === 'decision') {
                const bestOption = scenario.options.find(option => option.isCorrect) || 
                                   scenario.options.reduce((prev, current) => 
                                   (prev.score > current.score) ? prev : current);
                maxScore += bestOption.score;
                
                // Check for follow-ups
                if (scenario.followUp) {
                    const bestFollowUpOption = scenario.followUp.options.find(option => option.isCorrect) || 
                                               scenario.followUp.options.reduce((prev, current) => 
                                               (prev.score > current.score) ? prev : current);
                    maxScore += bestFollowUpOption.score;
                }
                
                if (scenario.finalFollowUp) {
                    const bestFinalOption = scenario.finalFollowUp.options.find(option => option.isCorrect) || 
                                           scenario.finalFollowUp.options.reduce((prev, current) => 
                                           (prev.score > current.score) ? prev : current);
                    maxScore += bestFinalOption.score;
                }
            } else if (scenario.type === 'multipleSelect') {
                scenario.options.forEach(option => {
                    if (option.isCorrect) {
                        maxScore += option.score;
                    }
                });
                
                // Check for follow-ups
                if (scenario.followUp && scenario.followUp.type === 'multipleSelect') {
                    scenario.followUp.options.forEach(option => {
                        if (option.isCorrect) {
                            maxScore += option.score;
                        }
                    });
                }
                
                if (scenario.finalFollowUp && scenario.finalFollowUp.type === 'multipleSelect') {
                    scenario.finalFollowUp.options.forEach(option => {
                        if (option.isCorrect) {
                            maxScore += option.score;
                        }
                    });
                }
            } else if (scenario.type === 'sequence') {
                // For sequence tasks, usually a perfect score is awarded
                maxScore += 5;
            }
        });
    }
    
    // Handle submission of setup task scenario
    function handleSetupTaskSubmit(scenario) {
        // Get selected options
        const selectedOptions = [];
        const checkboxOptions = document.querySelectorAll('.setup-option input[type="checkbox"]:checked');
        checkboxOptions.forEach(checkbox => {
            const optionId = checkbox.id;
            const option = scenario.options.find(opt => opt.id === optionId);
            if (option) {
                selectedOptions.push(option);
            }
        });
        
        // Record user choices
        userChoices.push({
            scenarioId: scenario.id,
            selectedOptions: selectedOptions.map(opt => opt.id)
        });
        
        // Calculate score
        let score = 0;
        let optionsScore = 0;
        
        // Add score for correct selections and subtract for incorrect ones
        selectedOptions.forEach(option => {
            if (option.isCorrect) {
                optionsScore += option.score || 1;
            } else {
                optionsScore -= 1; // Penalty for selecting incorrect options
            }
        });
        
        // Check for missed correct answers
        scenario.options.forEach(option => {
            if (option.isCorrect && !selectedOptions.some(selected => selected.id === option.id)) {
                optionsScore -= 1; // Penalty for missed correct options
            }
        });
        
        // Ensure score is not negative
        score = Math.max(0, optionsScore);
        userScores.push(score);
        
        // Show feedback
        const feedbackContainer = document.querySelector('.feedback-container');
        const feedbackContent = feedbackContainer.querySelector('.feedback-content');
        
        // Mark correct/incorrect options
        document.querySelectorAll('.setup-option').forEach(optionElement => {
            const checkboxInput = optionElement.querySelector('input[type="checkbox"]');
            const option = scenario.options.find(opt => opt.id === optionElement.dataset.id);
            
            if (option.isCorrect) {
                optionElement.classList.add('correct-option');
                if (!checkboxInput.checked) {
                    optionElement.classList.add('missed-option');
                }
            } else if (checkboxInput.checked && !option.isCorrect) {
                optionElement.classList.add('incorrect-option');
            }
        });
        
        // Create feedback content
        feedbackContent.innerHTML = `
            <p>${scenario.feedback || 'Thank you for your selections.'}</p>
            <div class="correct-answers mt-1">
                <h4>Correct Setup:</h4>
                <ul>
                    ${scenario.options
                        .filter(option => option.isCorrect)
                        .map(option => `<li>${option.text}</li>`)
                        .join('')}
                </ul>
            </div>
        `;
        
        // Show feedback container
        feedbackContainer.classList.remove('hidden');
        
        // Hide submit button
        document.querySelector('.submit-setup').style.display = 'none';
        
        // Disable checkboxes
        document.querySelectorAll('.setup-option input[type="checkbox"]').forEach(checkbox => {
            checkbox.disabled = true;
        });
        
        // Add continue button event listener
        const continueBtn = feedbackContainer.querySelector('.continue-btn');
        continueBtn.addEventListener('click', () => {
            // Handle follow-up or move to next scenario
            if (scenario.followUp) {
                if (scenario.followUp.type === 'decision') {
                    handleFollowUpDecision(scenario.followUp);
                } else if (scenario.followUp.type === 'multipleSelect') {
                    handleFollowUpMultipleSelect(scenario.followUp);
                } else if (scenario.followUp.type === 'sequence') {
                    handleFollowUpSequence(scenario.followUp);
                } else if (scenario.followUp.type === 'form') {
                    handleFollowUpForm(scenario.followUp);
                }
            } else if (scenario.finalFollowUp) {
                if (scenario.finalFollowUp.type === 'decision') {
                    handleFollowUpDecision(scenario.finalFollowUp);
                } else if (scenario.finalFollowUp.type === 'multipleSelect') {
                    handleFollowUpMultipleSelect(scenario.finalFollowUp);
                } else if (scenario.finalFollowUp.type === 'sequence') {
                    handleFollowUpSequence(scenario.finalFollowUp);
                } else if (scenario.finalFollowUp.type === 'form') {
                    handleFollowUpForm(scenario.finalFollowUp);
                }
            } else {
                // Move to next scenario
                currentScenario++;
                if (currentScenario < scenarios.length) {
                    loadScenario(scenarios[currentScenario]);
                } else {
                    showResults();
                }
            }
        });
    }
    
    // Handle submission of form
    function handleFormSubmit(scenario) {
        const form = document.getElementById('interactive-form');
        const formData = new FormData(form);
        const formValues = {};
        let score = 0;
        let totalPossibleScore = 0;
        
        // Process form values
        scenario.fields.forEach(field => {
            if (field.type === 'text') {
                const value = formData.get(field.id);
                formValues[field.id] = value;
                
                // Check if text matches expected answer (case insensitive partial match)
                if (field.correctAnswer && value && field.correctAnswer.toLowerCase().includes(value.toLowerCase())) {
                    score++;
                }
                
                totalPossibleScore++;
            } else if (field.type === 'radio') {
                const value = formData.get(field.id);
                formValues[field.id] = value;
                
                if (value === field.correctAnswer) {
                    score++;
                }
                
                totalPossibleScore++;
            } else if (field.type === 'checkbox') {
                const values = formData.getAll(`${field.id}[]`);
                formValues[field.id] = values;
                
                // Check if checkbox selections match expected answers
                if (field.correctAnswers) {
                    const correctOptions = field.correctAnswers;
                    let optionScore = 0;
                    
                    // Check selected options against correct options
                    values.forEach(value => {
                        if (correctOptions.includes(value)) {
                            optionScore++;
                        } else {
                            // Penalty for incorrect selection
                            optionScore--;
                        }
                    });
                    
                    // Check for missed correct options
                    correctOptions.forEach(correct => {
                        if (!values.includes(correct)) {
                            // Penalty for missed correct option
                            optionScore--;
                        }
                    });
                    
                    // Ensure score is not negative
                    score += Math.max(0, optionScore);
                    totalPossibleScore += correctOptions.length;
                }
            }
        });
        
        // Normalize score to 0-5 scale
        const normalizedScore = Math.round((score / totalPossibleScore) * 5);
        userScores.push(normalizedScore);
        
        // Record user choice
        userChoices.push({
            scenarioId: scenario.id,
            formComplete: true,
            formScore: normalizedScore
        });
        
        // Mark form fields as correct/incorrect
        scenario.fields.forEach(field => {
            if (field.type === 'text') {
                const input = document.getElementById(field.id);
                const value = input.value;
                
                if (field.correctAnswer && value && field.correctAnswer.toLowerCase().includes(value.toLowerCase())) {
                    input.classList.add('correct-input');
                } else {
                    input.classList.add('incorrect-input');
                }
            } else if (field.type === 'radio') {
                const selectedValue = formValues[field.id];
                
                field.options.forEach((option, index) => {
                    const radio = document.getElementById(`${field.id}_${index}`);
                    const radioOption = radio.parentElement;
                    
                    if (option === field.correctAnswer) {
                        radioOption.classList.add('correct-option');
                    } else if (option === selectedValue && option !== field.correctAnswer) {
                        radioOption.classList.add('incorrect-option');
                    }
                });
            } else if (field.type === 'checkbox') {
                const selectedValues = formValues[field.id] || [];
                
                field.options.forEach((option, index) => {
                    const checkbox = document.getElementById(`${field.id}_${index}`);
                    const checkboxOption = checkbox.parentElement;
                    
                    if (field.correctAnswers && field.correctAnswers.includes(option)) {
                        checkboxOption.classList.add('correct-option');
                        
                        if (!selectedValues.includes(option)) {
                            checkboxOption.classList.add('missed-option');
                        }
                    } else if (selectedValues.includes(option) && (!field.correctAnswers || !field.correctAnswers.includes(option))) {
                        checkboxOption.classList.add('incorrect-option');
                    }
                });
            }
        });
        
        // Show feedback
        const feedbackContainer = document.querySelector('.feedback-container');
        const feedbackContent = feedbackContainer.querySelector('.feedback-content');
        
        // Create feedback content
        feedbackContent.innerHTML = `
            <p>${scenario.feedback}</p>
            <p>Your form score: ${normalizedScore}/5</p>
            <div class="correct-answers mt-1">
                <h4>Correct Answers:</h4>
                <ul class="correct-answers-list">
                    ${scenario.fields.map(field => {
                        if (field.type === 'text') {
                            return `<li><strong>${field.label}:</strong> ${field.correctAnswer}</li>`;
                        } else if (field.type === 'radio') {
                            return `<li><strong>${field.label}:</strong> ${field.correctAnswer}</li>`;
                        } else if (field.type === 'checkbox') {
                            return `<li><strong>${field.label}:</strong> ${field.correctAnswers.join(', ')}</li>`;
                        }
                        return '';
                    }).join('')}
                </ul>
            </div>
        `;
        
        // Show feedback container
        feedbackContainer.classList.remove('hidden');
        
        // Hide submit button
        document.querySelector('.submit-form').style.display = 'none';
        
        // Disable form inputs
        const formInputs = form.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => {
            input.disabled = true;
        });
        
        // Enable continue button
        const continueBtn = feedbackContainer.querySelector('.continue-btn');
        continueBtn.addEventListener('click', () => {
            // Move to next scenario
            currentScenario++;
            if (currentScenario < scenarios.length) {
                loadScenario(scenarios[currentScenario]);
            } else {
                showResults();
            }
        });
    }
    
    // Handle follow-up for decision
    function handleFollowUpDecision(followUp) {
        // Clear the current scenario content
        const scenarioScreen = document.querySelector('.scenario-screen');
        
        // Keep the header but update title if needed
        const decisionPoint = scenarioScreen.querySelector('.decision-point');
        const feedbackContainer = scenarioScreen.querySelector('.feedback-container');
        
        // Hide feedback
        feedbackContainer.classList.add('hidden');
        
        // Update narrator text if provided
        if (followUp.narratorText) {
            const narratorText = scenarioScreen.querySelector('.narrator-text');
            narratorText.textContent = followUp.narratorText;
        }
        
        // Update question
        const decisionQuestion = decisionPoint.querySelector('.decision-question');
        decisionQuestion.textContent = followUp.decisionQuestion;
        
        // Clear and create new options
        const optionsContainer = decisionPoint.querySelector('.options-container');
        optionsContainer.innerHTML = '';
        
        followUp.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.dataset.id = option.id;
            optionElement.textContent = option.text;
            
            optionElement.addEventListener('click', () => {
                // Remove selection from all options
                document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                
                // Add selection to clicked option
                optionElement.classList.add('selected');
                
                // Enable submit button if not already visible
                const submitBtn = document.querySelector('.follow-up-submit-btn');
                if (!submitBtn) {
                    const submitButton = document.createElement('button');
                    submitButton.className = 'follow-up-submit-btn btn';
                    submitButton.textContent = 'Submit';
                    submitButton.addEventListener('click', () => handleFollowUpDecisionSubmit(followUp, option));
                    optionsContainer.parentElement.appendChild(submitButton);
                }
            });
            
            optionsContainer.appendChild(optionElement);
        });
    }
    
    // Handle submission of a follow-up decision
    function handleFollowUpDecisionSubmit(followUp, selectedOption) {
        // Record user choice
        userChoices.push({
            followUpId: selectedOption.id
        });
        
        // Add score
        userScores.push(selectedOption.score);
        
        // Show feedback
        const feedbackContainer = document.querySelector('.feedback-container');
        const feedbackContent = feedbackContainer.querySelector('.feedback-content');
        
        // Mark correct/incorrect options
        document.querySelectorAll('.option').forEach(optionElement => {
            const option = followUp.options.find(opt => opt.id === optionElement.dataset.id);
            
            if (option.isCorrect) {
                optionElement.classList.add('correct');
            } else if (optionElement.classList.contains('selected') && !option.isCorrect) {
                optionElement.classList.add('incorrect');
            }
        });
        
        // Update feedback content
        feedbackContent.innerHTML = `<p>${selectedOption.feedback}</p>`;
        
        // Combined event listener for continue button for follow-up decision
        const continueBtn = feedbackContainer.querySelector('.continue-btn');
        continueBtn.addEventListener('click', () => {
            // Prevent multiple clicks
            continueBtn.disabled = true;
            
            if (followUp.followUp && (!followUp.followUp.condition || followUp.followUp.condition.includes(selectedOption.id))) {
                if (followUp.followUp.type === 'decision') {
                    handleFollowUpDecision(followUp.followUp);
                } else if (followUp.followUp.type === 'multipleSelect') {
                    handleFollowUpMultipleSelect(followUp.followUp);
                } else if (followUp.followUp.type === 'sequence') {
                    handleFollowUpSequence(followUp.followUp);
                } else if (followUp.followUp.type === 'form') {
                    handleFollowUpForm(followUp.followUp);
                }
            } else if (followUp.finalFollowUp) {
                if (followUp.finalFollowUp.type === 'decision') {
                    handleFollowUpDecision(followUp.finalFollowUp);
                } else if (followUp.finalFollowUp.type === 'multipleSelect') {
                    handleFollowUpMultipleSelect(followUp.finalFollowUp);
                } else if (followUp.finalFollowUp.type === 'sequence') {
                    handleFollowUpSequence(followUp.finalFollowUp);
                } else if (followUp.finalFollowUp.type === 'form') {
                    handleFollowUpForm(followUp.finalFollowUp);
                }
            } else {
                // Move to next scenario
                currentScenario++;
                if (currentScenario < scenarios.length) {
                    loadScenario(scenarios[currentScenario]);
                } else {
                    showResults();
                }
            }
        });
        
        // Show feedback container
        feedbackContainer.classList.remove('hidden');
        
        // Hide submit button
        document.querySelector('.follow-up-submit-btn').remove();
    }
    
    // Handle follow-up for multiple select
    function handleFollowUpMultipleSelect(followUp) {
        // Clear the current scenario content
        const scenarioScreen = document.querySelector('.scenario-screen');
        
        // Clear feedback
        const feedbackContainer = scenarioScreen.querySelector('.feedback-container');
        feedbackContainer.classList.add('hidden');
        
        // Update narrator text if provided
        if (followUp.narratorText) {
            const narratorText = scenarioScreen.querySelector('.narrator-text');
            narratorText.textContent = followUp.narratorText;
        }
        
        // Get the multiple select container
        const multipleSelect = scenarioScreen.querySelector('.multiple-select');
        
        // Update question
        const selectionQuestion = multipleSelect.querySelector('.selection-question');
        selectionQuestion.textContent = followUp.selectionQuestion;
        
        // Update instruction if provided
        const selectionInstruction = multipleSelect.querySelector('.selection-instruction');
        if (followUp.selectionInstruction) {
            selectionInstruction.textContent = followUp.selectionInstruction;
        }
        
        // Clear and create new checkboxes
        const checkboxesContainer = multipleSelect.querySelector('.checkboxes-container');
        checkboxesContainer.innerHTML = '';
        
        followUp.options.forEach(option => {
            const checkboxOption = document.createElement('div');
            checkboxOption.className = 'checkbox-option';
            checkboxOption.dataset.id = option.id;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = option.id;
            
            const label = document.createElement('label');
            label.htmlFor = option.id;
            label.textContent = option.text;
            
            checkboxOption.appendChild(checkbox);
            checkboxOption.appendChild(label);
            checkboxesContainer.appendChild(checkboxOption);
        });
        
        // Show submit button
        const submitBtn = multipleSelect.querySelector('.submit-selection');
        submitBtn.style.display = 'block';
        submitBtn.addEventListener('click', () => handleMultipleSelectSubmit(followUp));
    }
    
    // Handle follow-up for sequence
    function handleFollowUpSequence(followUp) {
        // Clear the current scenario content
        const scenarioScreen = document.querySelector('.scenario-screen');
        
        // Clear feedback
        const feedbackContainer = scenarioScreen.querySelector('.feedback-container');
        feedbackContainer.classList.add('hidden');
        
        // Update narrator text if provided
        if (followUp.narratorText) {
            const narratorText = scenarioScreen.querySelector('.narrator-text');
            narratorText.textContent = followUp.narratorText;
        }
        
        // Get the sequence task container
        const sequenceTask = scenarioScreen.querySelector('.sequence-task');
        
        // Update question
        const sequenceQuestion = sequenceTask.querySelector('.sequence-question');
        sequenceQuestion.textContent = followUp.taskDescription;
        
        // Clear options
        const unorderedOptions = sequenceTask.querySelector('.unordered-options');
        const orderedOptions = sequenceTask.querySelector('.ordered-options');
        unorderedOptions.innerHTML = '';
        orderedOptions.innerHTML = '';
        
        // Shuffle items for display
        const shuffledItems = [...followUp.items].sort(() => Math.random() - 0.5);
        
        shuffledItems.forEach(item => {
            const sequenceItem = document.createElement('div');
            sequenceItem.className = 'sequence-item';
            sequenceItem.draggable = true;
            sequenceItem.dataset.id = item.id;
            sequenceItem.dataset.position = item.correctPosition;
            
            const itemText = document.createElement('span');
            itemText.textContent = item.text;
            
            const handle = document.createElement('span');
            handle.className = 'handle';
            handle.innerHTML = '<i class="fas fa-grip-lines"></i>';
            
            sequenceItem.appendChild(itemText);
            sequenceItem.appendChild(handle);
            
            // Add drag events
            sequenceItem.addEventListener('dragstart', handleDragStart);
            sequenceItem.addEventListener('dragover', handleDragOver);
            sequenceItem.addEventListener('drop', handleDrop);
            sequenceItem.addEventListener('dragend', handleDragEnd);
            
            unorderedOptions.appendChild(sequenceItem);
        });
        
        // Show submit button
        const submitBtn = sequenceTask.querySelector('.submit-sequence');
        submitBtn.style.display = 'block';
        submitBtn.addEventListener('click', () => handleSequenceSubmit(followUp));
    }
    
    // Handle follow-up form
    function handleFollowUpForm(followUp) {
        // Clear the current scenario content
        const scenarioScreen = document.querySelector('.scenario-screen');
        
        // Clear feedback
        const feedbackContainer = scenarioScreen.querySelector('.feedback-container');
        feedbackContainer.classList.add('hidden');
        
        // Update narrator text if provided
        if (followUp.narratorText) {
            const narratorText = scenarioScreen.querySelector('.narrator-text');
            narratorText.textContent = followUp.narratorText;
        }
        
        // Create a new form container if not exists
        let formContainer = scenarioScreen.querySelector('.form-container');
        if (!formContainer) {
            formContainer = document.createElement('div');
            formContainer.className = 'form-container';
            scenarioScreen.appendChild(formContainer);
        }
        
        // Update form title
        let formTitle = formContainer.querySelector('.form-title');
        if (!formTitle) {
            formTitle = document.createElement('h3');
            formTitle.className = 'form-title';
            formContainer.appendChild(formTitle);
        }
        formTitle.textContent = followUp.formTitle;
        
        // Create a new form
        let form = formContainer.querySelector('#interactive-form');
        if (form) {
            form.innerHTML = '';
        } else {
            form = document.createElement('form');
            form.id = 'interactive-form';
            formContainer.appendChild(form);
        }
        
        // Create form fields
        followUp.fields.forEach(field => {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            
            const label = document.createElement('label');
            label.htmlFor = field.id;
            label.textContent = field.label;
            formGroup.appendChild(label);
            
            if (field.type === 'text') {
                const input = document.createElement('input');
                input.type = 'text';
                input.id = field.id;
                input.name = field.id;
                formGroup.appendChild(input);
            } else if (field.type === 'radio') {
                const radioGroup = document.createElement('div');
                radioGroup.className = 'radio-group';
                
                field.options.forEach((option, index) => {
                    const radioOption = document.createElement('div');
                    radioOption.className = 'radio-option';
                    
                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.id = `${field.id}_${index}`;
                    radio.name = field.id;
                    radio.value = option;
                    
                    const radioLabel = document.createElement('label');
                    radioLabel.htmlFor = `${field.id}_${index}`;
                    radioLabel.textContent = option;
                    
                    radioOption.appendChild(radio);
                    radioOption.appendChild(radioLabel);
                    radioGroup.appendChild(radioOption);
    function handleSequenceSubmit(scenario) {
        const orderedOptions = document.querySelector('.ordered-options');
        const orderedItems = Array.from(orderedOptions.children);
        
        // Compare user sequence with correct sequence
        let correctCount = 0;
        let userSequence = [];
        
        orderedItems.forEach((item, index) => {
            const itemId = item.dataset.id;
            const correctPosition = parseInt(item.dataset.position);
            userSequence.push({
                id: itemId,
                userPosition: index + 1,
                correctPosition: correctPosition
            });
            
            if (index + 1 === correctPosition) {
                correctCount++;
                item.classList.add('correct-position');
            } else {
                item.classList.add('incorrect-position');
            }
        });
        
        // Calculate score based on accuracy
        const accuracy = orderedItems.length > 0 ? correctCount / orderedItems.length : 0;
        const score = Math.round(accuracy * 5); // Scale to 0-5
        
        userScores.push(score);
        
        // Record user choice
        userChoices.push({
            scenarioId: scenario.id,
            sequence: userSequence
        });
        
        // Show feedback
        const feedbackContainer = document.querySelector('.feedback-container');
        const feedbackContent = feedbackContainer.querySelector('.feedback-content');
        
        // Create feedback content
        feedbackContent.innerHTML = `
            <p>${scenario.feedback || 'Here\'s how your sequence compares to the optimal sequence:'}</p>
            <div class="correct-answers mt-1">
                <h4>Correct Sequence:</h4>
                <ol>
                    ${scenario.items
                        .sort((a, b) => a.correctPosition - b.correctPosition)
                        .map(item => `<li>${item.text}</li>`)
                        .join('')}
                </ol>
            </div>
        `;
        
        // Show feedback container
        feedbackContainer.classList.remove('hidden');
        
        // Hide submit button
        document.querySelector('.submit-sequence').style.display = 'none';
        
        // Disable drag and drop
        document.querySelectorAll('.sequence-item').forEach(item => {
            item.draggable = false;
            item.removeEventListener('dragstart', handleDragStart);
            item.removeEventListener('dragover', handleDragOver);
            item.removeEventListener('drop', handleDrop);
            item.removeEventListener('dragend', handleDragEnd);
        });
        
        // Add continue button event listener
        const continueBtn = feedbackContainer.querySelector('.continue-btn');
        continueBtn.addEventListener('click', () => {
            // Handle follow-up or move to next scenario
            if (scenario.followUp) {
                if (scenario.followUp.type === 'decision') {
                    handleFollowUpDecision(scenario.followUp);
                } else if (scenario.followUp.type === 'multipleSelect') {
                    handleFollowUpMultipleSelect(scenario.followUp);
                } else if (scenario.followUp.type === 'sequence') {
                    handleFollowUpSequence(scenario.followUp);
                } else if (scenario.followUp.type === 'form') {
                    handleFollowUpForm(scenario.followUp);
                }
            } else if (scenario.finalFollowUp) {
                if (scenario.finalFollowUp.type === 'decision') {
                    handleFollowUpDecision(scenario.finalFollowUp);
                } else if (scenario.finalFollowUp.type === 'multipleSelect') {
                    handleFollowUpMultipleSelect(scenario.finalFollowUp);
                } else if (scenario.finalFollowUp.type === 'sequence') {
                    handleFollowUpSequence(scenario.finalFollowUp);
                } else if (scenario.finalFollowUp.type === 'form') {
                    handleFollowUpForm(scenario.finalFollowUp);
                }
            } else {
                // Move to next scenario
                currentScenario++;
                if (currentScenario < scenarios.length) {
                    loadScenario(scenarios[currentScenario]);
                } else {
                    showResults();
                }
            }
        });
        
        return maxScore;
    }
    
    // Load a scenario
    function loadScenario(scenario) {
        // Clear previous scenario
        scenarioContainer.innerHTML = '';
        
        // Create scenario based on type
        let scenarioElement;
        
        switch(scenario.type) {
            case 'decision':
                scenarioElement = createDecisionScenario(scenario);
                break;
            case 'multipleSelect':
                scenarioElement = createMultipleSelectScenario(scenario);
                break;
            case 'sequence':
                scenarioElement = createSequenceScenario(scenario);
                break;
            case 'setupTask':
                scenarioElement = createSetupTaskScenario(scenario);
                break;
            case 'form':
                scenarioElement = createFormScenario(scenario);
                break;
            default:
                console.error('Unknown scenario type:', scenario.type);
        }
        
        if (scenarioElement) {
            scenarioContainer.appendChild(scenarioElement);
            scenarioContainer.classList.add('active');
            
            // Set progress indicators
            const progressIndicators = scenarioContainer.querySelectorAll('.current-scenario, .total-scenarios');
            progressIndicators.forEach(indicator => {
                if (indicator.classList.contains('current-scenario')) {
                    indicator.textContent = currentScenario + 1;
                } else {
                    indicator.textContent = scenarios.length;
                }
            });
        }
    }
    
    // Create a decision-based scenario
    function createDecisionScenario(scenario) {
        const template = decisionTemplate.content.cloneNode(true);
        
        // Set scenario title
        template.querySelector('.scenario-title').textContent = scenario.title;
        
        // Set narrator text
        template.querySelector('.narrator-text').textContent = scenario.narratorText;
        
        // Set system info if available
        const systemInfoElement = template.querySelector('.system-info');
        if (scenario.systemInfo) {
            systemInfoElement.textContent = scenario.systemInfo;
        } else {
            systemInfoElement.remove();
        }
        
        // Set visual elements if available
        const visualElementsContainer = template.querySelector('.visual-elements');
        if (scenario.visualElements) {
            if (scenario.visualElements.type === 'email') {
                const emailDialog = document.createElement('div');
                emailDialog.className = 'dialog-box email-dialog';
                
                const emailHeader = document.createElement('div');
                emailHeader.className = 'dialog-header';
                emailHeader.innerHTML = `
                    <strong>From:</strong> ${scenario.visualElements.content.from}<br>
                    <strong>Subject:</strong> ${scenario.visualElements.content.subject}<br>
                    <strong>Date:</strong> ${scenario.visualElements.content.date}
                `;
                
                const emailBody = document.createElement('div');
                emailBody.className = 'dialog-body';
                emailBody.innerHTML = scenario.visualElements.content.body.replace(/\n/g, '<br>');
                
                emailDialog.appendChild(emailHeader);
                emailDialog.appendChild(emailBody);
                visualElementsContainer.appendChild(emailDialog);
            } else if (scenario.visualElements.type === 'scene') {
                const sceneDescription = document.createElement('div');
                sceneDescription.className = 'scene-description';
                sceneDescription.textContent = scenario.visualElements.description;
                visualElementsContainer.appendChild(sceneDescription);
                
                // Placeholder for a real image
                const sceneImage = document.createElement('div');
                sceneImage.className = 'scene-image';
                sceneImage.innerHTML = `<img src="images/placeholder-${scenario.id}.jpg" alt="${scenario.title}" onerror="this.style.display='none'">`;
                visualElementsContainer.appendChild(sceneImage);
            } else if (scenario.visualElements.type === 'device') {
                const deviceInterface = document.createElement('div');
                deviceInterface.className = 'device-interface';
                deviceInterface.textContent = scenario.visualElements.description;
                visualElementsContainer.appendChild(deviceInterface);
            }
        } else {
            visualElementsContainer.remove();
        }
        
        // Set decision question
        template.querySelector('.decision-question').textContent = scenario.decisionQuestion;
        
        // Create options
        const optionsContainer = template.querySelector('.options-container');
        scenario.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.dataset.id = option.id;
            optionElement.textContent = option.text;
            
            optionElement.addEventListener('click', () => {
                // Remove selection from all options
                document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                
                // Add selection to clicked option
                optionElement.classList.add('selected');
                
                // Enable submit button if not already visible
                const submitBtn = document.querySelector('.submit-btn');
                if (!submitBtn) {
                    const submitButton = document.createElement('button');
                    submitButton.className = 'submit-btn btn';
                    submitButton.textContent = 'Submit';
                    submitButton.addEventListener('click', () => handleDecisionSubmit(scenario, option));
                    optionsContainer.parentElement.appendChild(submitButton);
                }
            });
            
            optionsContainer.appendChild(optionElement);
        });
        
        return template;
    }
    
    // Create a multiple-select scenario
    function createMultipleSelectScenario(scenario) {
        const template = multipleSelectTemplate.content.cloneNode(true);
        
        // Set scenario title
        template.querySelector('.scenario-title').textContent = scenario.title;
        
        // Set narrator text
        template.querySelector('.narrator-text').textContent = scenario.narratorText;
        
        // Set system info if available
        const systemInfoElement = template.querySelector('.system-info');
        if (scenario.systemInfo) {
            systemInfoElement.textContent = scenario.systemInfo;
        } else {
            systemInfoElement.remove();
        }
        
        // Set visual elements if available
        const visualElementsContainer = template.querySelector('.visual-elements');
        if (scenario.visualElements) {
            // Similar to createDecisionScenario visual elements code
            if (scenario.visualElements.type === 'email') {
                const emailDialog = document.createElement('div');
                emailDialog.className = 'dialog-box email-dialog';
                
                const emailHeader = document.createElement('div');
                emailHeader.className = 'dialog-header';
                emailHeader.innerHTML = `
                    <strong>From:</strong> ${scenario.visualElements.content.from}<br>
                    <strong>Subject:</strong> ${scenario.visualElements.content.subject}<br>
                    <strong>Date:</strong> ${scenario.visualElements.content.date}
                `;
                
                const emailBody = document.createElement('div');
                emailBody.className = 'dialog-body';
                emailBody.innerHTML = scenario.visualElements.content.body.replace(/\n/g, '<br>');
                
                emailDialog.appendChild(emailHeader);
                emailDialog.appendChild(emailBody);
                visualElementsContainer.appendChild(emailDialog);
            } else if (scenario.visualElements.type === 'scene') {
                const sceneDescription = document.createElement('div');
                sceneDescription.className = 'scene-description';
                sceneDescription.textContent = scenario.visualElements.description;
                visualElementsContainer.appendChild(sceneDescription);
                
                // Placeholder for a real image
                const sceneImage = document.createElement('div');
                sceneImage.className = 'scene-image';
                sceneImage.innerHTML = `<img src="images/placeholder-${scenario.id}.jpg" alt="${scenario.title}" onerror="this.style.display='none'">`;
                visualElementsContainer.appendChild(sceneImage);
            } else if (scenario.visualElements.type === 'device') {
                const deviceInterface = document.createElement('div');
                deviceInterface.className = 'device-interface';
                deviceInterface.textContent = scenario.visualElements.description;
                visualElementsContainer.appendChild(deviceInterface);
            }
        } else {
            visualElementsContainer.remove();
        }
        
        // Set multiple select section
        const multipleSelect = template.querySelector('.multiple-select');
        
        // Set selection question
        multipleSelect.querySelector('.selection-question').textContent = scenario.selectionQuestion;
        
        // Set instruction if provided
        const selectionInstruction = multipleSelect.querySelector('.selection-instruction');
        if (scenario.selectionInstruction) {
            selectionInstruction.textContent = scenario.selectionInstruction;
        } else {
            selectionInstruction.remove();
        }
        
        // Create checkboxes
        const checkboxesContainer = multipleSelect.querySelector('.checkboxes-container');
        scenario.options.forEach(option => {
            const checkboxOption = document.createElement('div');
            checkboxOption.className = 'checkbox-option';
            checkboxOption.dataset.id = option.id;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = option.id;
            
            const label = document.createElement('label');
            label.htmlFor = option.id;
            label.textContent = option.text;
            
            checkboxOption.appendChild(checkbox);
            checkboxOption.appendChild(label);
            checkboxesContainer.appendChild(checkboxOption);
        });
        
        // Add submit button event listener
        const submitButton = multipleSelect.querySelector('.submit-selection');
        submitButton.addEventListener('click', () => handleMultipleSelectSubmit(scenario));
        
        return template;
    }
    
    // Create a sequence scenario
    function createSequenceScenario(scenario) {
        const template = sequenceTemplate.content.cloneNode(true);
        
        // Set scenario title
        template.querySelector('.scenario-title').textContent = scenario.title;
        
        // Set narrator text
        template.querySelector('.narrator-text').textContent = scenario.narratorText;
        
        // Set system info if available
        const systemInfoElement = template.querySelector('.system-info');
        if (scenario.systemInfo) {
            systemInfoElement.textContent = scenario.systemInfo;
        } else {
            systemInfoElement.remove();
        }
        
        // Set visual elements if available
        const visualElementsContainer = template.querySelector('.visual-elements');
        if (scenario.visualElements) {
            if (scenario.visualElements.type === 'scene') {
                const sceneDescription = document.createElement('div');
                sceneDescription.className = 'scene-description';
                sceneDescription.textContent = scenario.visualElements.description;
                visualElementsContainer.appendChild(sceneDescription);
                
                // Placeholder for a real image
                const sceneImage = document.createElement('div');
                sceneImage.className = 'scene-image';
                sceneImage.innerHTML = `<img src="images/placeholder-${scenario.id}.jpg" alt="${scenario.title}" onerror="this.style.display='none'">`;
                visualElementsContainer.appendChild(sceneImage);
            } else if (scenario.visualElements.type === 'device') {
                const deviceInterface = document.createElement('div');
                deviceInterface.className = 'device-interface';
                deviceInterface.textContent = scenario.visualElements.description;
                visualElementsContainer.appendChild(deviceInterface);
            }
        } else {
            visualElementsContainer.remove();
        }
        
        // Set sequence task question
        template.querySelector('.sequence-question').textContent = scenario.taskDescription;
        
        // Create sequence items
        const unorderedOptions = template.querySelector('.unordered-options');
        
        // Shuffle items for display
        const shuffledItems = [...scenario.items].sort(() => Math.random() - 0.5);
        
        shuffledItems.forEach(item => {
            const sequenceItem = document.createElement('div');
            sequenceItem.className = 'sequence-item';
            sequenceItem.draggable = true;
            sequenceItem.dataset.id = item.id;
            sequenceItem.dataset.position = item.correctPosition;
            
            const itemText = document.createElement('span');
            itemText.textContent = item.text;
            
            const handle = document.createElement('span');
            handle.className = 'handle';
            handle.innerHTML = '<i class="fas fa-grip-lines"></i>';
            
            sequenceItem.appendChild(itemText);
            sequenceItem.appendChild(handle);
            
            // Add drag events
            sequenceItem.addEventListener('dragstart', handleDragStart);
            sequenceItem.addEventListener('dragover', handleDragOver);
            sequenceItem.addEventListener('drop', handleDrop);
            sequenceItem.addEventListener('dragend', handleDragEnd);
            
            unorderedOptions.appendChild(sequenceItem);
        });
        
        // Add submit button event listener
        const submitButton = template.querySelector('.submit-sequence');
        submitButton.addEventListener('click', () => handleSequenceSubmit(scenario));
        
        return template;
    }
    
    // Create a setup task scenario
    function createSetupTaskScenario(scenario) {
        const template = setupTaskTemplate.content.cloneNode(true);
        
        // Set scenario title
        template.querySelector('.scenario-title').textContent = scenario.title;
        
        // Set narrator text
        template.querySelector('.narrator-text').textContent = scenario.narratorText;
        
        // Set system info if available
        const systemInfoElement = template.querySelector('.system-info');
        if (scenario.systemInfo) {
            systemInfoElement.textContent = scenario.systemInfo;
        } else {
            systemInfoElement.remove();
        }
        
        // Set task description
        template.querySelector('.task-description').textContent = scenario.taskDescription;
        
        // Create setup options
        const setupOptions = template.querySelector('.setup-options');
        scenario.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'setup-option';
            optionElement.dataset.id = option.id;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = option.id;
            
            const label = document.createElement('label');
            label.htmlFor = option.id;
            label.textContent = option.text;
            
            optionElement.appendChild(checkbox);
            optionElement.appendChild(label);
            setupOptions.appendChild(optionElement);
        });
        
        // Add submit button event listener
        const submitButton = template.querySelector('.submit-setup');
        submitButton.addEventListener('click', () => handleSetupTaskSubmit(scenario));
        
        return template;
    }
    
    // Create a form scenario
    function createFormScenario(scenario) {
        const template = formTemplate.content.cloneNode(true);
        
        // Set scenario title
        template.querySelector('.scenario-title').textContent = scenario.title;
        
        // Set narrator text
        template.querySelector('.narrator-text').textContent = scenario.narratorText;
        
        // Set form title
        template.querySelector('.form-title').textContent = scenario.formTitle;
        
        // Create form fields
        const form = template.querySelector('#interactive-form');
        scenario.fields.forEach(field => {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            
            const label = document.createElement('label');
            label.htmlFor = field.id;
            label.textContent = field.label;
            formGroup.appendChild(label);
            
            if (field.type === 'text') {
                const input = document.createElement('input');
                input.type = 'text';
                input.id = field.id;
                input.name = field.id;
                formGroup.appendChild(input);
            } else if (field.type === 'radio') {
                const radioGroup = document.createElement('div');
                radioGroup.className = 'radio-group';
                
                field.options.forEach((option, index) => {
                    const radioOption = document.createElement('div');
                    radioOption.className = 'radio-option';
                    
                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.id = `${field.id}_${index}`;
                    radio.name = field.id;
                    radio.value = option;
                    
                    const radioLabel = document.createElement('label');
                    radioLabel.htmlFor = `${field.id}_${index}`;
                    radioLabel.textContent = option;
                    
                    radioOption.appendChild(radio);
                    radioOption.appendChild(radioLabel);
                    radioGroup.appendChild(radioOption);
                });
                
                formGroup.appendChild(radioGroup);
            } else if (field.type === 'checkbox') {
                const checkboxGroup = document.createElement('div');
                checkboxGroup.className = 'checkbox-group';
                
                field.options.forEach((option, index) => {
                    const checkboxOption = document.createElement('div');
                    checkboxOption.className = 'checkbox-option';
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = `${field.id}_${index}`;
                    checkbox.name = `${field.id}[]`;
                    checkbox.value = option;
                    
                    const checkboxLabel = document.createElement('label');
                    checkboxLabel.htmlFor = `${field.id}_${index}`;
                    checkboxLabel.textContent = option;
                    
                    checkboxOption.appendChild(checkbox);
                    checkboxOption.appendChild(checkboxLabel);
                    checkboxGroup.appendChild(checkboxOption);
                });
                
                formGroup.appendChild(checkboxGroup);
            } else if (field.type === 'checkbox') {
                const checkboxGroup = document.createElement('div');
                checkboxGroup.className = 'checkbox-group';
                
                field.options.forEach((option, index) => {
                    const checkboxOption = document.createElement('div');
                    checkboxOption.className = 'checkbox-option';
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = `${field.id}_${index}`;
                    checkbox.name = `${field.id}[]`;
                    checkbox.value = option;
                    
                    const checkboxLabel = document.createElement('label');
                    checkboxLabel.htmlFor = `${field.id}_${index}`;
                    checkboxLabel.textContent = option;
                    
                    checkboxOption.appendChild(checkbox);
                    checkboxOption.appendChild(checkboxLabel);
                    checkboxGroup.appendChild(checkboxOption);
                });
                
                formGroup.appendChild(checkboxGroup);
            }
            
            form.appendChild(formGroup);
        });
        
        // Add submit button
        let submitButton = formContainer.querySelector('.submit-form');
        if (!submitButton) {
            submitButton = document.createElement('button');
            submitButton.className = 'submit-form btn';
            submitButton.textContent = 'Submit Form';
            formContainer.appendChild(submitButton);
        }
        
        submitButton.addEventListener('click', () => handleFormSubmit(followUp));
    }
    
    // Show final results
    function showResults() {
        scenarioContainer.innerHTML = '';
        scenarioContainer.classList.remove('active');
        resultsScreen.classList.add('active');
        
        // Calculate total score
        const totalScore = userScores.reduce((sum, score) => sum + score, 0);
        const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);
        
        // Determine performance level
        let performanceLevel = performanceLevels[performanceLevels.length - 1];
        for (const level of performanceLevels) {
            if (percentageScore >= level.minScore) {
                performanceLevel = level;
                break;
            }
        }
        
        // Create results content
        let resultsHTML = `
            <div class="results-summary">
                <h3>Overall Performance: ${performanceLevel.level}</h3>
                <p>${performanceLevel.description}</p>
                <div class="overall-score">
                    <p>Total Score: ${totalScore}/${maxPossibleScore} (${percentageScore}%)</p>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${percentageScore}%"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Add category assessments
        resultsHTML += '<div class="category-assessments">';
        
        assessmentCategories.forEach(category => {
            resultsHTML += `
                <div class="results-category">
                    <h4>${category.title}</h4>
                    <p>${category.description}</p>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${Math.round(Math.random() * 40) + 60}%"></div>
                    </div>
                </div>
            `;
        });
        
        resultsHTML += '</div>';
        
        // Add key learning points
        resultsHTML += `
            <div class="learning-points mt-1">
                <h3>Key Learning Points</h3>
                <ul>
                    <li>Effective communication with deaf patients requires both technical preparation and interpersonal skills.</li>
                    <li>Always offer direct communication and respect patient autonomy in choosing communication methods.</li>
                    <li>Preparation is key to ensuring interpretation services are seamlessly integrated into appointments.</li>
                    <li>During emergencies, balance immediate medical needs with necessary communication.</li>
                    <li>Visual aids significantly enhance understanding of complex medical information.</li>
                </ul>
            </div>
        `;
        
        finalResults.innerHTML = resultsHTML;
    }
});
        });
        
        // Add submit button event listener
        const submitButton = template.querySelector('.submit-form');
        submitButton.addEventListener('click', () => handleFormSubmit(scenario));
        
        return template;
    }
    
    // Handle submission of a decision
    function handleDecisionSubmit(scenario, selectedOption) {
        // Record user choice
        userChoices.push({
            scenarioId: scenario.id,
            optionId: selectedOption.id
        });
        
        // Add score
        userScores.push(selectedOption.score);
        
        // Show feedback
        const feedbackContainer = document.querySelector('.feedback-container');
        const feedbackContent = feedbackContainer.querySelector('.feedback-content');
        
        // Mark correct/incorrect options
        document.querySelectorAll('.option').forEach(optionElement => {
            const option = scenario.options.find(opt => opt.id === optionElement.dataset.id);
            
            if (option.isCorrect) {
                optionElement.classList.add('correct');
            } else if (optionElement.classList.contains('selected') && !option.isCorrect) {
                optionElement.classList.add('incorrect');
            }
        });
        
        // Update feedback content with selected option feedback
        feedbackContent.innerHTML = `<p>${selectedOption.feedback}</p>`;
        
        // Display additional response content if available
        if (selectedOption.responseContent) {
            const responseElement = document.createElement('div');
            responseElement.className = 'response-content mt-1';
            
            if (selectedOption.responseContent.type === 'email') {
                responseElement.innerHTML = `
                    <h4>Your Response:</h4>
                    <div class="dialog-box email-dialog">
                        <div class="dialog-header">
                            <strong>To:</strong> ${selectedOption.responseContent.content.to}<br>
                            <strong>Subject:</strong> ${selectedOption.responseContent.content.subject}
                        </div>
                        <div class="dialog-body">
                            ${selectedOption.responseContent.content.body.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                `;
            } else if (selectedOption.responseContent.type === 'dialog') {
                responseElement.innerHTML = `
                    <h4>Your Interaction:</h4>
                    <div class="dialog-box">
                        <div class="dialog-body">
                            ${selectedOption.responseContent.content.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                `;
            } else if (selectedOption.responseContent.type === 'simulation') {
                responseElement.innerHTML = `
                    <h4>Your Actions:</h4>
                    <div class="dialog-box">
                        <ol>
                            ${selectedOption.responseContent.steps.map(step => `<li>${step}</li>`).join('')}
                        </ol>
                        <div class="simulation-result">
                            <strong>Result:</strong> ${selectedOption.responseContent.result}
                        </div>
                    </div>
                `;
            }
            
            feedbackContent.appendChild(responseElement);
        }
        
        // Combined continue button event listener to avoid duplicate declarations
        const continueBtn = feedbackContainer.querySelector('.continue-btn');
        continueBtn.addEventListener('click', () => {
            // Prevent multiple clicks
            continueBtn.disabled = true;
            
            if (scenario.followUp && (!scenario.followUp.condition || scenario.followUp.condition.includes(selectedOption.id))) {
                // Handle follow-up based on type
                if (scenario.followUp.type === 'decision') {
                    handleFollowUpDecision(scenario.followUp);
                } else if (scenario.followUp.type === 'multipleSelect') {
                    handleFollowUpMultipleSelect(scenario.followUp);
                } else if (scenario.followUp.type === 'sequence') {
                    handleFollowUpSequence(scenario.followUp);
                } else if (scenario.followUp.type === 'form') {
                    handleFollowUpForm(scenario.followUp);
                }
            } else if (scenario.finalFollowUp) {
                // Handle final follow-up
                if (scenario.finalFollowUp.type === 'decision') {
                    handleFollowUpDecision(scenario.finalFollowUp);
                } else if (scenario.finalFollowUp.type === 'multipleSelect') {
                    handleFollowUpMultipleSelect(scenario.finalFollowUp);
                } else if (scenario.finalFollowUp.type === 'sequence') {
                    handleFollowUpSequence(scenario.finalFollowUp);
                } else if (scenario.finalFollowUp.type === 'form') {
                    handleFollowUpForm(scenario.finalFollowUp);
                }
            } else {
                // Move to next scenario
                currentScenario++;
                if (currentScenario < scenarios.length) {
                    loadScenario(scenarios[currentScenario]);
                } else {
                    showResults();
                }
            }
        });
        
        // Show feedback container
        feedbackContainer.classList.remove('hidden');
        
        // Hide submit button
        document.querySelector('.submit-btn').remove();
    }
    
    // Handle submission of multiple select scenario
    function handleMultipleSelectSubmit(scenario) {
        // Get selected options
        const selectedOptions = [];
        const checkboxOptions = document.querySelectorAll('.checkbox-option input[type="checkbox"]:checked');
        checkboxOptions.forEach(checkbox => {
            const optionId = checkbox.id;
            const option = scenario.options.find(opt => opt.id === optionId);
            if (option) {
                selectedOptions.push(option);
            }
        });
        
        // Record user choices
        userChoices.push({
            scenarioId: scenario.id,
            selectedOptions: selectedOptions.map(opt => opt.id)
        });
        
        // Calculate score
        let score = 0;
        let optionsScore = 0;
        
        // Add score for correct selections and subtract for incorrect ones
        selectedOptions.forEach(option => {
            if (option.isCorrect) {
                optionsScore += option.score || 1;
            } else {
                optionsScore -= 1; // Penalty for selecting incorrect options
            }
        });
        
        // Check for missed correct answers
        scenario.options.forEach(option => {
            if (option.isCorrect && !selectedOptions.some(selected => selected.id === option.id)) {
                optionsScore -= 1; // Penalty for missed correct options
            }
        });
        
        // Ensure score is not negative
        score = Math.max(0, optionsScore);
        userScores.push(score);
        
        // Show feedback
        const feedbackContainer = document.querySelector('.feedback-container');
        const feedbackContent = feedbackContainer.querySelector('.feedback-content');
        
        // Mark correct/incorrect options
        document.querySelectorAll('.checkbox-option').forEach(optionElement => {
            const checkboxInput = optionElement.querySelector('input[type="checkbox"]');
            const option = scenario.options.find(opt => opt.id === optionElement.dataset.id);
            
            if (option.isCorrect) {
                optionElement.classList.add('correct-option');
                if (!checkboxInput.checked) {
                    optionElement.classList.add('missed-option');
                }
            } else if (checkboxInput.checked && !option.isCorrect) {
                optionElement.classList.add('incorrect-option');
            }
        });
        
        // Create feedback content
        feedbackContent.innerHTML = `
            <p>${scenario.feedback || 'Thank you for your selections.'}</p>
            <div class="correct-answers mt-1">
                <h4>Correct Options:</h4>
                <ul>
                    ${scenario.options
                        .filter(option => option.isCorrect)
                        .map(option => `<li>${option.text}</li>`)
                        .join('')}
                </ul>
            </div>
        `;
        
        // Show feedback container
        feedbackContainer.classList.remove('hidden');
        
        // Hide submit button
        document.querySelector('.submit-selection').style.display = 'none';
        
        // Disable checkboxes
        document.querySelectorAll('.checkbox-option input[type="checkbox"]').forEach(checkbox => {
            checkbox.disabled = true;
        });
        
        // Add continue button event listener
        const continueBtn = feedbackContainer.querySelector('.continue-btn');
        continueBtn.addEventListener('click', () => {
            // Handle follow-up or move to next scenario
            if (scenario.followUp && (!scenario.followUp.condition || 
                (scenario.followUp.condition.some && scenario.followUp.condition.some(cond => 
                    selectedOptions.some(opt => opt.id === cond))))) {
                
                if (scenario.followUp.type === 'decision') {
                    handleFollowUpDecision(scenario.followUp);
                } else if (scenario.followUp.type === 'multipleSelect') {
                    handleFollowUpMultipleSelect(scenario.followUp);
                } else if (scenario.followUp.type === 'sequence') {
                    handleFollowUpSequence(scenario.followUp);
                } else if (scenario.followUp.type === 'form') {
                    handleFollowUpForm(scenario.followUp);
                }
            } else if (scenario.finalFollowUp) {
                if (scenario.finalFollowUp.type === 'decision') {
                    handleFollowUpDecision(scenario.finalFollowUp);
                } else if (scenario.finalFollowUp.type === 'multipleSelect') {
                    handleFollowUpMultipleSelect(scenario.finalFollowUp);
                } else if (scenario.finalFollowUp.type === 'sequence') {
                    handleFollowUpSequence(scenario.finalFollowUp);
                } else if (scenario.finalFollowUp.type === 'form') {
                    handleFollowUpForm(scenario.finalFollowUp);
                }
            } else {
                // Move to next scenario
                currentScenario++;
                if (currentScenario < scenarios.length) {
                    loadScenario(scenarios[currentScenario]);
                } else {
                    showResults();
                }
            }
