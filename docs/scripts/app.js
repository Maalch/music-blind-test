const musicInfoFile = selectedFile ? `data/${selectedFile}` : 'data/Aurelie.txt'; // Default to Aurelie.txt

let musicData = [];
let currentTrackIndex = 0;
let userScore = 0; // Initialize the user's score

document.addEventListener('DOMContentLoaded', () => {
    fetchMusicInfo();
    document.getElementById('play-button').addEventListener('click', playMusic);
    document.getElementById('guess-button').addEventListener('click', checkGuess);
    document.getElementById('skip-button').addEventListener('click', skipTrack);
    updateScoreDisplay(); // Initialize the score display
});


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Random index
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

function fetchMusicInfo() {
    fetch(musicInfoFile)
        .then(response => response.text())
        .then(data => {
            musicData = data.split('\n').filter(line => line.trim() !== '').map(line => {
                const [possibleAnswers, filePath, difficulty, shortDisplay, comment] = line.split(' $$$ ');
                if (!possibleAnswers || !filePath || !difficulty || !shortDisplay) {
                    console.error('Invalid line format:', line);
                    return null;
                }
                return {
                    possibleAnswers: possibleAnswers.replace('PossibleAnswers:', '').split(',').map(answer => answer.trim()),
                    filePath: filePath.replace('File:', '').trim(),
                    difficulty: parseInt(difficulty.replace('Difficulty:', '').trim()),
                    shortDisplay: shortDisplay.replace('ShortDisplay:', '').trim(),
                    comment: comment ? comment.replace('Comment:', '').trim() : '' // Handle optional comment
                };
            }).filter(track => track !== null);
            if (musicData.length > 0) {
                shuffleArray(musicData); // Shuffle the tracks after loading
                displayCurrentTrack();
            } else {
                console.error('No valid tracks found in the music info file.');
            }
        })
        .catch(error => console.error('Error fetching music info:', error));
}

function skipTrack() {
    // Stop the currently playing audio
    if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
        currentAudio.currentTime = 0; // Reset to the beginning
        document.getElementById('play-button').textContent = 'Ecouter'; // Reset button text
        currentAudio = null;
    }

    // Clear the input field
    document.getElementById('guess-input').value = '';

    // Display the correct answer in the modal
    const trackInfo = musicData[currentTrackIndex];
    const correctAnswerMessage = `Vous avez passé ! Les réponses acceptées étaient: ${trackInfo.possibleAnswers.join(', ')}`;
    showYouTubeModal(correctAnswerMessage, trackInfo.shortDisplay);
}

function displayCurrentTrack() {
    const trackInfo = musicData[currentTrackIndex];
    const difficultyInfo = document.getElementById('difficulty-info');

    document.getElementById('track-title').textContent = `Musique ${currentTrackIndex + 1} sur ${musicData.length}`;
    difficultyInfo.textContent = `Difficulté: ${getDifficultyText(trackInfo.difficulty)}`;

    // Remove existing difficulty classes
    difficultyInfo.className = '';
    // Add the appropriate difficulty class
    difficultyInfo.classList.add(`difficulty-${trackInfo.difficulty}`);

    // Display the comment if it exists
    const commentsDiv = document.getElementById('comments');
    if (trackInfo.comment) {
        commentsDiv.textContent = `Commentaire: ${trackInfo.comment}`;
        commentsDiv.style.display = 'block'; // Ensure the div is visible
    } else {
        commentsDiv.textContent = ''; // Clear the comment if none exists
        commentsDiv.style.display = 'none'; // Hide the div if no comment
    }
}

let currentAudio = null; // To keep track of the currently playing audio

function playMusic() {
    const playButton = document.getElementById('play-button');
    const trackInfo = musicData[currentTrackIndex];

    if (currentAudio && !currentAudio.paused) {
        // Stop the currently playing audio
        currentAudio.pause();
        currentAudio.currentTime = 0; // Reset to the beginning
        playButton.textContent = 'Ecouter';
        currentAudio = null;
    } else {
        // Play the selected audio
        currentAudio = new Audio(`assets/music/${trackInfo.filePath}`);
        currentAudio.play();
        playButton.textContent = 'Stop';

        // Reset button text when the audio ends
        currentAudio.addEventListener('ended', () => {
            playButton.textContent = 'Ecouter';
            currentAudio = null;
        });
    }
}

function updateScoreDisplay() {
    const scoreDiv = document.getElementById('score');
    scoreDiv.textContent = `Score: ${userScore}`;
}

let remainingTries = 3; // Initialize the number of tries

function checkGuess() {
    const userGuess = document.getElementById('guess-input').value.trim();
    const trackInfo = musicData[currentTrackIndex];
    const correctAnswers = trackInfo.possibleAnswers;

    // Check if the user's guess is correct
    if (correctAnswers.some(answer => answer.toLowerCase() === userGuess.toLowerCase())) {
        userScore++; // Increment the score for a correct answer
        updateScoreDisplay(); // Update the score display

        // Stop the currently playing audio
        if (currentAudio && !currentAudio.paused) {
            currentAudio.pause();
            currentAudio.currentTime = 0; // Reset to the beginning
            document.getElementById('play-button').textContent = 'Play'; // Reset button text
            currentAudio = null;
        }
        
        showYouTubeModal(`Bonne réponse ! Bravo !`, trackInfo.shortDisplay);
        return;
    } else {
        remainingTries--;
        if (remainingTries > 0) {
            alert(`Mauvaise réponse ! Encore ${remainingTries} tentatives...`);
        } else {
            const correctAnswerMessage = `Mauvaise réponse ! Les réponses acceptées étaient: ${correctAnswers.join(', ')}`;
            showYouTubeModal(correctAnswerMessage, trackInfo.shortDisplay);
        }
    }
}

function showYouTubeModal(message, youtubeUrl) {
    const youtubeModal = document.getElementById('youtube-modal');
    const youtubeIframe = document.getElementById('youtube-iframe');
    const modalMessage = document.getElementById('modal-message');

    // Set the message and YouTube video
    modalMessage.textContent = message;
    youtubeIframe.src = youtubeUrl;
    youtubeModal.style.display = 'flex';

    // Ensure only one event listener is attached to the "Next" button
    const nextButton = document.getElementById('next-button');
    nextButton.onclick = () => {
        youtubeModal.style.display = 'none'; // Hide the modal
        youtubeIframe.src = ''; // Clear the iframe
        resetTriesAndMoveToNextTrack(); // Move to the next track
    };
}

function resetTriesAndMoveToNextTrack() {
    // Stop the currently playing audio
    if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
        currentAudio.currentTime = 0; // Reset to the beginning
        document.getElementById('play-button').textContent = 'Play'; // Reset button text
        currentAudio = null;
    }

    // Clear the input field
    document.getElementById('guess-input').value = '';

    // Hide the YouTube modal (if open)
    const youtubeModal = document.getElementById('youtube-modal');
    youtubeModal.style.display = 'none';
    document.getElementById('youtube-iframe').src = ''; // Clear the iframe

    // Reset tries
    remainingTries = 3;

    // Check if this is the last track
    if (currentTrackIndex === musicData.length - 1) {
        // Display the final score in the modal
        showFinalScoreModal();
    } else {
        // Move to the next track
        currentTrackIndex = (currentTrackIndex + 1) % musicData.length;
        displayCurrentTrack();
    }
}


function showFinalScoreModal() {
    const youtubeModal = document.getElementById('youtube-modal');
    const modalMessage = document.getElementById('modal-message');
    const youtubeIframe = document.getElementById('youtube-iframe');

    // Display the final score with the player's name
    modalMessage.innerHTML = `
        <h2>Félicitations, ${playerName} !</h2>
        <p>Votre score final est de ${userScore} sur ${musicData.length}.</p>
        <p>Merci d'avoir joué !</p>
    `;

    // Hide the YouTube iframe for the final modal
    youtubeIframe.style.display = 'none';

    // Show the modal
    youtubeModal.style.display = 'flex';

    // Send the results to the backend
    const results = {
        userName: playerName,
        userScore: userScore,
        totalTracks: musicData.length,
        playList: selectedFile, // Include the name of the source file
        date: new Date().toISOString(), // Current date in ISO format
    };

    fetch('https://pacific-tor-04753-775fa950a6aa.herokuapp.com/save-results', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(results),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to save results: ${response.statusText}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log('Results saved successfully:', data);
            alert(`Résultats sauvegardés avec succès ! ID du fichier : ${data.fileId}`);
        })
        .catch((error) => {
            console.error('Error saving results:', error);
            alert('Une erreur est survenue lors de la sauvegarde des résultats.');
        });

    // Update the "Next" button to restart the game
    const nextButton = document.getElementById('next-button');
    nextButton.textContent = 'Rejouer';
    nextButton.onclick = () => {
        youtubeModal.style.display = 'none'; // Hide the modal
        restartGame(); // Restart the game
    };
}

function restartGame() {
    userScore = 0; // Reset the score
    currentTrackIndex = 0; // Reset the track index
    remainingTries = 5; // Reset the tries
    updateScoreDisplay(); // Update the score display
    displayCurrentTrack(); // Display the first track
}

function getDifficultyText(difficulty) {
    switch (difficulty) {
        case 1: return 'Très facile';
        case 2: return 'Facile';
        case 3: return 'Moyenne';
        case 4: return 'Difficile';
        case 5: return 'Très Difficile';
        default: return 'Inconnue';
    }
}