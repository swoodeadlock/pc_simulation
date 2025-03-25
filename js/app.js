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
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  function handleDrop(e) {
    e.stopPropagation();
    if (dragSrcEl !== this) {
      if (
        this.parentNode.classList.contains('ordered-options') ||
        this.closest('.ordered-options')
      ) {
        if (this.parentNode.classList.contains('ordered-options')) {
          this.parentNode.appendChild(dragSrcEl);
        } else {
          this.parentNode.insertBefore(dragSrcEl, this);
        }
      } else if (this.parentNode.classList.contains('unordered-options')) {
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
    document.querySelectorAll('.sequence-item').forEach((item) => {
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
    scenarios.forEach((scenario) => {
      if (scenario.type === 'decision') {
        const bestOption =
          scenario.options.find((option) => option.isCorrect) ||
          scenario.options.reduce((prev, current) => (prev.score > current.score ? prev : current));
        maxScore += bestOption.score;

        if (scenario.followUp) {
          const bestFollowUpOption =
            scenario.followUp.options.find((option) => option.isCorrect) ||
            scenario.followUp.options.reduce((prev, current) => (prev.score > current.score ? prev : current));
          maxScore += bestFollowUpOption.score;
        }
        if (scenario.finalFollowUp) {
          const bestFinalOption =
            scenario.finalFollowUp.options.find((option) => option.isCorrect) ||
            scenario.finalFollowUp.options.reduce((prev, current) => (prev.score > current.score ? prev : current));
          maxScore += bestFinalOption.score;
        }
      } else if (scenario.type === 'multipleSelect') {
        scenario.options.forEach((option) => {
          if (option.isCorrect) {
            maxScore += option.score;
          }
        });
        if (scenario.followUp && scenario.followUp.type === 'multipleSelect') {
          scenario.followUp.options.forEach((option) => {
            if (option.isCorrect) {
              maxScore += option.score;
            }
          });
        }
        if (scenario.finalFollowUp && scenario.finalFollowUp.type === 'multipleSelect') {
          scenario.finalFollowUp.options.forEach((option) => {
            if (option.isCorrect) {
              maxScore += option.score;
            }
          });
        }
      } else if (scenario.type === 'sequence') {
        maxScore += 5;
      }
    });
    return maxScore;
  }

  // Handle setup task submission
  function handleSetupTaskSubmit(scenario) {
    const selectedOptions = [];
    const checkboxOptions = document.querySelectorAll('.setup-option input[type="checkbox"]:checked');
    checkboxOptions.forEach((checkbox) => {
      const optionId = checkbox.id;
      const option = scenario.options.find((opt) => opt.id === optionId);
      if (option) selectedOptions.push(option);
    });

    userChoices.push({
      scenarioId: scenario.id,
      selectedOptions: selectedOptions.map((opt) => opt.id)
    });

    let optionsScore = 0;
    selectedOptions.forEach((option) => {
      if (option.isCorrect) {
        optionsScore += option.score || 1;
      } else {
        optionsScore -= 1;
      }
    });
    scenario.options.forEach((option) => {
      if (option.isCorrect && !selectedOptions.some((sel) => sel.id === option.id)) {
        optionsScore -= 1;
      }
    });
    const score = Math.max(0, optionsScore);
    userScores.push(score);

    const feedbackContainer = document.querySelector('.feedback-container');
    const feedbackContent = feedbackContainer.querySelector('.feedback-content');

    document.querySelectorAll('.setup-option').forEach((optionElement) => {
      const checkboxInput = optionElement.querySelector('input[type="checkbox"]');
      const option = scenario.options.find((opt) => opt.id === optionElement.dataset.id);
      if (option.isCorrect) {
        optionElement.classList.add('correct-option');
        if (!checkboxInput.checked) optionElement.classList.add('missed-option');
      } else if (checkboxInput.checked && !option.isCorrect) {
        optionElement.classList.add('incorrect-option');
      }
    });

    feedbackContent.innerHTML = `
      <p>${scenario.feedback || 'Thank you for your selections.'}</p>
      <div class="correct-answers mt-1">
        <h4>Correct Setup:</h4>
        <ul>
          ${scenario.options
            .filter((option) => option.isCorrect)
            .map((option) => `<li>${option.text}</li>`)
            .join('')}
        </ul>
      </div>
    `;
    feedbackContainer.classList.remove('hidden');
    const submitSetup = document.querySelector('.submit-setup');
    if (submitSetup) submitSetup.style.display = 'none';
    document.querySelectorAll('.setup-option input[type="checkbox"]').forEach((checkbox) => {
      checkbox.disabled = true;
    });

    const continueBtn = feedbackContainer.querySelector('.continue-btn');
    continueBtn.addEventListener('click', () => {
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
        currentScenario++;
        if (currentScenario < scenarios.length) {
          loadScenario(scenarios[currentScenario]);
        } else {
          showResults();
        }
      }
    });
  }

  // Handle form submission
  function handleFormSubmit(scenario) {
    const form = document.getElementById('interactive-form');
    const formData = new FormData(form);
    const formValues = {};
    let score = 0;
    let totalPossibleScore = 0;

    scenario.fields.forEach((field) => {
      if (field.type === 'text') {
        const value = formData.get(field.id);
        formValues[field.id] = value;
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
        if (field.correctAnswers) {
          const correctOptions = field.correctAnswers;
          let optionScore = 0;
          values.forEach((value) => {
            if (correctOptions.includes(value)) {
              optionScore++;
            } else {
              optionScore--;
            }
          });
          correctOptions.forEach((correct) => {
            if (!values.includes(correct)) {
              optionScore--;
            }
          });
          score += Math.max(0, optionScore);
          totalPossibleScore += correctOptions.length;
        }
      }
    });

    const normalizedScore = Math.round((score / totalPossibleScore) * 5);
    userScores.push(normalizedScore);
    userChoices.push({
      scenarioId: scenario.id,
      formComplete: true,
      formScore: normalizedScore
    });

    scenario.fields.forEach((field) => {
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
          } else if (selectedValues.includes(option)) {
            checkboxOption.classList.add('incorrect-option');
          }
        });
      }
    });

    const feedbackContainer = document.querySelector('.feedback-container');
    const feedbackContent = feedbackContainer.querySelector('.feedback-content');
    feedbackContent.innerHTML = `
      <p>${scenario.feedback}</p>
      <p>Your form score: ${normalizedScore}/5</p>
      <div class="correct-answers mt-1">
        <h4>Correct Answers:</h4>
        <ul class="correct-answers-list">
          ${scenario.fields
            .map((field) => {
              if (field.type === 'text') {
                return `<li><strong>${field.label}:</strong> ${field.correctAnswer}</li>`;
              } else if (field.type === 'radio') {
                return `<li><strong>${field.label}:</strong> ${field.correctAnswer}</li>`;
              } else if (field.type === 'checkbox') {
                return `<li><strong>${field.label}:</strong> ${field.correctAnswers.join(', ')}</li>`;
              }
              return '';
            })
            .join('')}
        </ul>
      </div>
    `;
    feedbackContainer.classList.remove('hidden');
    const submitFormBtn = document.querySelector('.submit-form');
    if (submitFormBtn) submitFormBtn.style.display = 'none';
    form.querySelectorAll('input, select, textarea').forEach((input) => (input.disabled = true));
    const continueBtn = feedbackContainer.querySelector('.continue-btn');
    continueBtn.addEventListener('click', () => {
      currentScenario++;
      if (currentScenario < scenarios.length) {
        loadScenario(scenarios[currentScenario]);
      } else {
        showResults();
      }
    });
  }

  // Handle follow-up for decision scenarios
  function handleFollowUpDecision(followUp) {
    const scenarioScreen = document.querySelector('.scenario-screen');
    const decisionPoint = scenarioScreen.querySelector('.decision-point');
    const feedbackContainer = scenarioScreen.querySelector('.feedback-container');
    feedbackContainer.classList.add('hidden');

    if (followUp.narratorText) {
      const narratorText = scenarioScreen.querySelector('.narrator-text');
      narratorText.textContent = followUp.narratorText;
    }
    const decisionQuestion = decisionPoint.querySelector('.decision-question');
    decisionQuestion.textContent = followUp.decisionQuestion;
    const optionsContainer = decisionPoint.querySelector('.options-container');
    optionsContainer.innerHTML = '';

    followUp.options.forEach((option) => {
      const optionElement = document.createElement('div');
      optionElement.className = 'option';
      optionElement.dataset.id = option.id;
      optionElement.textContent = option.text;
      optionElement.addEventListener('click', () => {
        document.querySelectorAll('.option').forEach((opt) => opt.classList.remove('selected'));
        optionElement.classList.add('selected');
        const existingSubmit = document.querySelector('.follow-up-submit-btn');
        if (existingSubmit) existingSubmit.remove();
        const submitButton = document.createElement('button');
        submitButton.className = 'follow-up-submit-btn btn';
        submitButton.textContent = 'Submit';
        submitButton.addEventListener('click', () => handleFollowUpDecisionSubmit(followUp, option));
        optionsContainer.parentElement.appendChild(submitButton);
      });
      optionsContainer.appendChild(optionElement);
    });
  }

  function handleFollowUpDecisionSubmit(followUp, selectedOption) {
    userChoices.push({ followUpId: selectedOption.id });
    userScores.push(selectedOption.score);
    const feedbackContainer = document.querySelector('.feedback-container');
    const feedbackContent = feedbackContainer.querySelector('.feedback-content');

    document.querySelectorAll('.option').forEach((optionElement) => {
      const option = followUp.options.find((opt) => opt.id === optionElement.dataset.id);
      if (option.isCorrect) {
        optionElement.classList.add('correct');
      } else if (optionElement.classList.contains('selected') && !option.isCorrect) {
        optionElement.classList.add('incorrect');
      }
    });
    feedbackContent.innerHTML = `<p>${selectedOption.feedback}</p>`;
    const continueBtn = feedbackContainer.querySelector('.continue-btn');
    continueBtn.addEventListener('click', () => {
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
        currentScenario++;
        if (currentScenario < scenarios.length) {
          loadScenario(scenarios[currentScenario]);
        } else {
          showResults();
        }
      }
    });
    feedbackContainer.classList.remove('hidden');
    const submitBtn = document.querySelector('.follow-up-submit-btn');
    if (submitBtn) submitBtn.remove();
  }

  // Handle follow-up for multiple select scenarios
  function handleFollowUpMultipleSelect(followUp) {
    const scenarioScreen = document.querySelector('.scenario-screen');
    const feedbackContainer = scenarioScreen.querySelector('.feedback-container');
    feedbackContainer.classList.add('hidden');

    if (followUp.narratorText) {
      const narratorText = scenarioScreen.querySelector('.narrator-text');
      narratorText.textContent = followUp.narratorText;
    }
    const multipleSelect = scenarioScreen.querySelector('.multiple-select');
    multipleSelect.querySelector('.selection-question').textContent = followUp.selectionQuestion;
    const selectionInstruction = multipleSelect.querySelector('.selection-instruction');
    if (followUp.selectionInstruction) {
      selectionInstruction.textContent = followUp.selectionInstruction;
    } else {
      selectionInstruction.remove();
    }
    const checkboxesContainer = multipleSelect.querySelector('.checkboxes-container');
    checkboxesContainer.innerHTML = '';
    followUp.options.forEach((option) => {
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
    const submitBtn = multipleSelect.querySelector('.submit-selection');
    submitBtn.style.display = 'block';
    submitBtn.addEventListener('click', () => handleMultipleSelectSubmit(followUp));
  }

  // Handle follow-up for sequence scenarios
  function handleFollowUpSequence(followUp) {
    const scenarioScreen = document.querySelector('.scenario-screen');
    const feedbackContainer = scenarioScreen.querySelector('.feedback-container');
    feedbackContainer.classList.add('hidden');

    if (followUp.narratorText) {
      const narratorText = scenarioScreen.querySelector('.narrator-text');
      narratorText.textContent = followUp.narratorText;
    }
    const sequenceTask = scenarioScreen.querySelector('.sequence-task');
    sequenceTask.querySelector('.sequence-question').textContent = followUp.taskDescription;
    const unorderedOptions = sequenceTask.querySelector('.unordered-options');
    const orderedOptions = sequenceTask.querySelector('.ordered-options');
    unorderedOptions.innerHTML = '';
    orderedOptions.innerHTML = '';

    const shuffledItems = [...followUp.items].sort(() => Math.random() - 0.5);
    shuffledItems.forEach((item) => {
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
      sequenceItem.addEventListener('dragstart', handleDragStart);
      sequenceItem.addEventListener('dragover', handleDragOver);
      sequenceItem.addEventListener('drop', handleDrop);
      sequenceItem.addEventListener('dragend', handleDragEnd);
      unorderedOptions.appendChild(sequenceItem);
    });
    const submitBtn = sequenceTask.querySelector('.submit-sequence');
    submitBtn.style.display = 'block';
    submitBtn.addEventListener('click', () => handleSequenceSubmit(followUp));
  }

  // Handle follow-up for form scenarios
  function handleFollowUpForm(followUp) {
    const scenarioScreen = document.querySelector('.scenario-screen');
    const feedbackContainer = scenarioScreen.querySelector('.feedback-container');
    feedbackContainer.classList.add('hidden');

    if (followUp.narratorText) {
      const narratorText = scenarioScreen.querySelector('.narrator-text');
      narratorText.textContent = followUp.narratorText;
    }
    let formContainer = scenarioScreen.querySelector('.form-container');
    if (!formContainer) {
      formContainer = document.createElement('div');
      formContainer.className = 'form-container';
      scenarioScreen.appendChild(formContainer);
    }
    let formTitle = formContainer.querySelector('.form-title');
    if (!formTitle) {
      formTitle = document.createElement('h3');
      formTitle.className = 'form-title';
      formContainer.appendChild(formTitle);
    }
    formTitle.textContent = followUp.formTitle;
    let form = formContainer.querySelector('#interactive-form');
    if (form) {
      form.innerHTML = '';
    } else {
      form = document.createElement('form');
      form.id = 'interactive-form';
      formContainer.appendChild(form);
    }
    followUp.fields.forEach((field) => {
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
      }
      form.appendChild(formGroup);
    });
    let submitButton = formContainer.querySelector('.submit-form');
    if (!submitButton) {
      submitButton = document.createElement('button');
      submitButton.className = 'submit-form btn';
      submitButton.textContent = 'Submit Form';
      formContainer.appendChild(submitButton);
    }
    submitButton.addEventListener('click', (e) => {
      e.preventDefault();
      handleFormSubmit(followUp);
    });
  }

  // Handle decision submission
  function handleDecisionSubmit(scenario, selectedOption) {
    userChoices.push({
      scenarioId: scenario.id,
      optionId: selectedOption.id
    });
    userScores.push(selectedOption.score);

    const feedbackContainer = document.querySelector('.feedback-container');
    const feedbackContent = feedbackContainer.querySelector('.feedback-content');

    document.querySelectorAll('.option').forEach((optionElement) => {
      const option = scenario.options.find((opt) => opt.id === optionElement.dataset.id);
      if (option.isCorrect) {
        optionElement.classList.add('correct');
      } else if (optionElement.classList.contains('selected') && !option.isCorrect) {
        optionElement.classList.add('incorrect');
      }
    });

    feedbackContent.innerHTML = `<p>${selectedOption.feedback}</p>`;
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
              ${selectedOption.responseContent.steps.map((step) => `<li>${step}</li>`).join('')}
            </ol>
            <div class="simulation-result">
              <strong>Result:</strong> ${selectedOption.responseContent.result}
            </div>
          </div>
        `;
      }
      feedbackContent.appendChild(responseElement);
    }
    const continueBtn = document.querySelector('.continue-btn');
    continueBtn.addEventListener('click', () => {
      continueBtn.disabled = true;
      if (scenario.followUp && (!scenario.followUp.condition || scenario.followUp.condition.includes(selectedOption.id))) {
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
        currentScenario++;
        if (currentScenario < scenarios.length) {
          loadScenario(scenarios[currentScenario]);
        } else {
          showResults();
        }
      }
    });
    feedbackContainer.classList.remove('hidden');
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) submitBtn.remove();
  }

  // Handle multiple select submission
  function handleMultipleSelectSubmit(scenario) {
    const selectedOptions = [];
    const checkboxOptions = document.querySelectorAll('.checkbox-option input[type="checkbox"]:checked');
    checkboxOptions.forEach((checkbox) => {
      const optionId = checkbox.id;
      const option = scenario.options.find((opt) => opt.id === optionId);
      if (option) selectedOptions.push(option);
    });

    userChoices.push({
      scenarioId: scenario.id,
      selectedOptions: selectedOptions.map((opt) => opt.id)
    });

    let optionsScore = 0;
    selectedOptions.forEach((option) => {
      if (option.isCorrect) {
        optionsScore += option.score || 1;
      } else {
        optionsScore -= 1;
      }
    });
    scenario.options.forEach((option) => {
      if (option.isCorrect && !selectedOptions.some((sel) => sel.id === option.id)) {
        optionsScore -= 1;
      }
    });
    const score = Math.max(0, optionsScore);
    userScores.push(score);

    const feedbackContainer = document.querySelector('.feedback-container');
    const feedbackContent = feedbackContainer.querySelector('.feedback-content');

    document.querySelectorAll('.checkbox-option').forEach((optionElement) => {
      const checkboxInput = optionElement.querySelector('input[type="checkbox"]');
      const option = scenario.options.find((opt) => opt.id === optionElement.dataset.id);
      if (option.isCorrect) {
        optionElement.classList.add('correct-option');
        if (!checkboxInput.checked) optionElement.classList.add('missed-option');
      } else if (checkboxInput.checked && !option.isCorrect) {
        optionElement.classList.add('incorrect-option');
      }
    });

    feedbackContent.innerHTML = `
      <p>${scenario.feedback || 'Thank you for your selections.'}</p>
      <div class="correct-answers mt-1">
        <h4>Correct Options:</h4>
        <ul>
          ${scenario.options
            .filter((option) => option.isCorrect)
            .map((option) => `<li>${option.text}</li>`)
            .join('')}
        </ul>
      </div>
    `;
    feedbackContainer.classList.remove('hidden');
    const submitSelectionBtn = document.querySelector('.submit-selection');
    if (submitSelectionBtn) submitSelectionBtn.style.display = 'none';
    document.querySelectorAll('.checkbox-option input[type="checkbox"]').forEach(
      (checkbox) => (checkbox.disabled = true)
    );
    const continueBtn = feedbackContainer.querySelector('.continue-btn');
    continueBtn.addEventListener('click', () => {
      if (scenario.followUp && (!scenario.followUp.condition || 
          (scenario.followUp.condition.some && scenario.followUp.condition.some((cond) =>
            selectedOptions.some((opt) => opt.id === cond))))) {
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
        currentScenario++;
        if (currentScenario < scenarios.length) {
          loadScenario(scenarios[currentScenario]);
        } else {
          showResults();
        }
      }
    });
  }

  // Handle sequence submission
  function handleSequenceSubmit(scenario) {
    const orderedOptions = document.querySelector('.ordered-options');
    const orderedItems = Array.from(orderedOptions.children);
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

    const accuracy = orderedItems.length > 0 ? correctCount / orderedItems.length : 0;
    const score = Math.round(accuracy * 5);
    userScores.push(score);
    userChoices.push({
      scenarioId: scenario.id,
      sequence: userSequence
    });

    const feedbackContainer = document.querySelector('.feedback-container');
    const feedbackContent = feedbackContainer.querySelector('.feedback-content');
    feedbackContent.innerHTML = `
      <p>${scenario.feedback || "Here's how your sequence compares to the optimal sequence:"}</p>
      <div class="correct-answers mt-1">
        <h4>Correct Sequence:</h4>
        <ol>
          ${scenario.items
            .sort((a, b) => a.correctPosition - b.correctPosition)
            .map((item) => `<li>${item.text}</li>`)
            .join('')}
        </ol>
      </div>
    `;
    feedbackContainer.classList.remove('hidden');
    const submitSequenceBtn = document.querySelector('.submit-sequence');
    if (submitSequenceBtn) submitSequenceBtn.style.display = 'none';
    document.querySelectorAll('.sequence-item').forEach((item) => {
      item.draggable = false;
      item.removeEventListener('dragstart', handleDragStart);
      item.removeEventListener('dragover', handleDragOver);
      item.removeEventListener('drop', handleDrop);
      item.removeEventListener('dragend', handleDragEnd);
    });
    const continueBtn = feedbackContainer.querySelector('.continue-btn');
    continueBtn.addEventListener('click', () => {
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
        currentScenario++;
        if (currentScenario < scenarios.length) {
          loadScenario(scenarios[currentScenario]);
        } else {
          showResults();
        }
      }
    });
  }

  // Load a scenario
  function loadScenario(scenario) {
    scenarioContainer.innerHTML = '';
    let scenarioElement;
    switch (scenario.type) {
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
      const progressIndicators = scenarioContainer.querySelectorAll('.current-scenario, .total-scenarios');
      progressIndicators.forEach((indicator) => {
        indicator.textContent = indicator.classList.contains('current-scenario') ? currentScenario + 1 : scenarios.length;
      });
    }
  }

  // Create a decision scenario
  function createDecisionScenario(scenario) {
    const template = decisionTemplate.content.cloneNode(true);
    template.querySelector('.scenario-title').textContent = scenario.title;
    template.querySelector('.narrator-text').textContent = scenario.narratorText;
    const systemInfoElement = template.querySelector('.system-info');
    if (scenario.systemInfo) {
      systemInfoElement.textContent = scenario.systemInfo;
    } else {
      systemInfoElement.remove();
    }
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
    template.querySelector('.decision-question').textContent = scenario.decisionQuestion;
    const optionsContainer = template.querySelector('.options-container');
    scenario.options.forEach((option) => {
      const optionElement = document.createElement('div');
      optionElement.className = 'option';
      optionElement.dataset.id = option.id;
      optionElement.textContent = option.text;
      optionElement.addEventListener('click', () => {
        document.querySelectorAll('.option').forEach((opt) => opt.classList.remove('selected'));
        optionElement.classList.add('selected');
        const existingSubmit = document.querySelector('.submit-btn');
        if (existingSubmit) existingSubmit.remove();
        const submitButton = document.createElement('button');
        submitButton.className = 'submit-btn btn';
        submitButton.textContent = 'Submit';
        submitButton.addEventListener('click', () => handleDecisionSubmit(scenario, option));
        optionsContainer.parentElement.appendChild(submitButton);
      });
      optionsContainer.appendChild(optionElement);
    });
    return template;
  }

  // Create a multiple-select scenario
  function createMultipleSelectScenario(scenario) {
    const template = multipleSelectTemplate.content.cloneNode(true);
    template.querySelector('.scenario-title').textContent = scenario.title;
    template.querySelector('.narrator-text').textContent = scenario.narratorText;
    const systemInfoElement = template.querySelector('.system-info');
    if (scenario.systemInfo) {
      systemInfoElement.textContent = scenario.systemInfo;
    } else {
      systemInfoElement.remove();
    }
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
    const multipleSelect = template.querySelector('.multiple-select');
    multipleSelect.querySelector('.selection-question').textContent = scenario.selectionQuestion;
    const selectionInstruction = multipleSelect.querySelector('.selection-instruction');
    if (scenario.selectionInstruction) {
      selectionInstruction.textContent = scenario.selectionInstruction;
    } else {
      selectionInstruction.remove();
    }
    const checkboxesContainer = multipleSelect.querySelector('.checkboxes-container');
    scenario.options.forEach((option) => {
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
    const submitButton = multipleSelect.querySelector('.submit-selection');
    submitButton.addEventListener('click', () => handleMultipleSelectSubmit(scenario));
    return template;
  }

  // Create a sequence scenario
  function createSequenceScenario(scenario) {
    const template = sequenceTemplate.content.cloneNode(true);
    template.querySelector('.scenario-title').textContent = scenario.title;
    template.querySelector('.narrator-text').textContent = scenario.narratorText;
    const systemInfoElement = template.querySelector('.system-info');
    if (scenario.systemInfo) {
      systemInfoElement.textContent = scenario.systemInfo;
    } else {
      systemInfoElement.remove();
    }
    const visualElementsContainer = template.querySelector('.visual-elements');
    if (scenario.visualElements) {
      if (scenario.visualElements.type === 'scene') {
        const sceneDescription = document.createElement('div');
        sceneDescription.className = 'scene-description';
        sceneDescription.textContent = scenario.visualElements.description;
        visualElementsContainer.appendChild(sceneDescription);
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
    template.querySelector('.sequence-question').textContent = scenario.taskDescription;
    const unorderedOptions = template.querySelector('.unordered-options');
    const shuffledItems = [...scenario.items].sort(() => Math.random() - 0.5);
    shuffledItems.forEach((item) => {
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
      sequenceItem.addEventListener('dragstart', handleDragStart);
      sequenceItem.addEventListener('dragover', handleDragOver);
      sequenceItem.addEventListener('drop', handleDrop);
      sequenceItem.addEventListener('dragend', handleDragEnd);
      unorderedOptions.appendChild(sequenceItem);
    });
    const submitButton = template.querySelector('.submit-sequence');
    submitButton.addEventListener('click', () => handleSequenceSubmit(scenario));
    return template;
  }

  // Create a setup task scenario
  function createSetupTaskScenario(scenario) {
    const template = setupTaskTemplate.content.cloneNode(true);
    template.querySelector('.scenario-title').textContent = scenario.title;
    template.querySelector('.narrator-text').textContent = scenario.narratorText;
    const systemInfoElement = template.querySelector('.system-info');
    if (scenario.systemInfo) {
      systemInfoElement.textContent = scenario.systemInfo;
    } else {
      systemInfoElement.remove();
    }
    template.querySelector('.task-description').textContent = scenario.taskDescription;
    const setupOptions = template.querySelector('.setup-options');
    scenario.options.forEach((option) => {
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
    const submitButton = template.querySelector('.submit-setup');
    submitButton.addEventListener('click', () => handleSetupTaskSubmit(scenario));
    return template;
  }

  // Create a form scenario
  function createFormScenario(scenario) {
    const template = formTemplate.content.cloneNode(true);
    template.querySelector('.scenario-title').textContent = scenario.title;
    template.querySelector('.narrator-text').textContent = scenario.narratorText;
    template.querySelector('.form-title').textContent = scenario.formTitle;
    const form = template.querySelector('#interactive-form');
    scenario.fields.forEach((field) => {
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
      }
      form.appendChild(formGroup);
    });
    const formContainer = template.querySelector('.form-container');
    let submitButton = formContainer.querySelector('.submit-form');
    if (!submitButton) {
      submitButton = document.createElement('button');
      submitButton.className = 'submit-form btn';
      submitButton.textContent = 'Submit Form';
      formContainer.appendChild(submitButton);
    }
    submitButton.addEventListener('click', (e) => {
      e.preventDefault();
      handleFormSubmit(scenario);
    });
    return template;
  }

  // Show final results
  function showResults() {
    scenarioContainer.innerHTML = '';
    scenarioContainer.classList.remove('active');
    resultsScreen.classList.add('active');
    const totalScore = userScores.reduce((sum, score) => sum + score, 0);
    const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);
    let performanceLevel = performanceLevels[performanceLevels.length - 1];
    for (const level of performanceLevels) {
      if (percentageScore >= level.minScore) {
        performanceLevel = level;
        break;
      }
    }
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
    resultsHTML += '<div class="category-assessments">';
    assessmentCategories.forEach((category) => {
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
