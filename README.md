# Music Blind Test

This project is a web-based application designed to provide users with a blind test for music samples. Users will listen to music samples and guess the titles of the tracks. The text on screen is displayed in French.

## Project Structure

```
music-blind-test
├── src
│   ├── index.html          # Main HTML document for the web page
│   ├── styles              # Directory for CSS styles
│   │   └── style.css       # Styles for the web page
│   ├── scripts             # Directory for JavaScript files
│   │   └── app.js          # JavaScript code for handling music samples and user interactions
│   ├── assets              # Directory for static assets
│   │   └── music
│   │       └── sample.mp3  # Sample music track for the blind test
│   └── data                # Directory for data files
│       └── music-info.txt  # Text file containing music information
├── package.json            # npm configuration file
└── README.md               # Documentation for the project
```

## Getting Started

To set up and run the web page, follow these steps:

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd music-blind-test
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Open the `src/index.html` file in a web browser** to start the application.

## Usage

- Listen to the music samples provided in the application.
- Enter your guesses for the titles of the tracks based on what you hear.
- The application will validate your guesses against the information in `src/data/*.txt`.
- Format of the file should be:
   - PossibleAnswers:A,B,C... $$$ File:XXX.mp3 $$$ Difficulty:1to5 $$$ ShortDisplay:youtubeembedURL $$$ Comment:(optional)

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements for the project.