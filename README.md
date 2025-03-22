# pc_simulation
# Deaf and Hard of Hearing Patient Care Simulation

An interactive training experience for healthcare professionals to learn best practices for communicating with deaf and hard of hearing patients.

## Features

- Interactive branching scenarios based on realistic healthcare situations
- Decision points with detailed feedback on each choice
- Multiple-choice questions with comprehensive feedback
- Sequence arrangement tasks
- Form-based activities
- Progress tracking and final assessment

## Live Demo

You can view the live site at [YOUR_GITHUB_USERNAME.github.io/patient-care-simulation](https://YOUR_GITHUB_USERNAME.github.io/patient-care-simulation) (replace YOUR_GITHUB_USERNAME with your actual GitHub username after deployment)

## Deployment Instructions

### Option 1: GitHub Pages

1. Fork or clone this repository
2. Go to the repository settings
3. Navigate to "Pages" section
4. Under "Source", select "main" branch
5. Click "Save"
6. Your site will be published at https://YOUR_GITHUB_USERNAME.github.io/patient-care-simulation

### Option 2: Local Development

1. Clone the repository
2. Open the folder in your preferred code editor
3. Use a local server to view the site (e.g., VS Code's Live Server extension)

## Project Structure

```
patient-care-simulation/
│
├── index.html        # Main HTML file
├── css/
│   └── styles.css    # Main stylesheet
├── js/
│   ├── app.js        # Application logic
│   └── scenarios.js  # Scenario data
└── images/           # Image assets (you'll need to add your own)
```

## Customization

### Adding Your Own Scenarios

To add or modify scenarios, edit the `js/scenarios.js` file. Each scenario follows a specific structure based on its type:

- `decision`: A single-choice question with options
- `multipleSelect`: A multiple-choice question where users can select several answers
- `sequence`: A task where users must arrange items in the correct order
- `form`: A form-filling activity

### Adding Images

Add your own images to the `images/` directory and reference them in the scenarios. The current implementation uses placeholder references.

## Credits

This project was created as an interactive training tool for healthcare professionals working with deaf and hard of hearing patients.

## License

MIT License
