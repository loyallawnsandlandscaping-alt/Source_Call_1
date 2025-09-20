
# Drum Kit Audio Assets

This directory contains audio files for the drum kit functionality from the loyallawnsandlandscaping-alt/Drum-Kit repository.

## Required Files (35 Sounds)

To use the complete drum kit, you need to add the following 35 audio files from the loyallawnsandlandscaping-alt/Drum-Kit repository:

### Kick Drums (5 files)
- `kick_1.wav`
- `kick_2.wav`
- `kick_3.wav`
- `kick_4.wav`
- `kick_5.wav`

### Snare Drums (6 files)
- `snare_1.wav`
- `snare_2.wav`
- `snare_3.wav`
- `snare_4.wav`
- `snare_5.wav`
- `snare_6.wav`

### Hi-Hats (4 files)
- `hihat_closed_1.wav`
- `hihat_closed_2.wav`
- `hihat_open_1.wav`
- `hihat_open_2.wav`
- `hihat_pedal.wav`
- `hihat_splash.wav`

### Cymbals (3 files)
- `crash_1.wav`
- `crash_2.wav`
- `ride_1.wav`
- `ride_2.wav`
- `china.wav`

### Toms (6 files)
- `tom_high_1.wav`
- `tom_high_2.wav`
- `tom_mid_1.wav`
- `tom_mid_2.wav`
- `tom_low_1.wav`
- `tom_low_2.wav`

### Percussion (4 files)
- `cowbell.wav`
- `woodblock.wav`
- `tambourine.wav`
- `shaker.wav`

### Electronic Sounds (3 files)
- `electronic_kick.wav`
- `electronic_snare.wav`
- `electronic_hihat.wav`

## Installation Instructions

1. Download all audio files from the loyallawnsandlandscaping-alt/Drum-Kit repository
2. Copy all 35 audio files to this directory (`assets/sounds/`)
3. Ensure all files are in WAV format for best performance
4. The app will automatically detect and load these files for low-latency playback

## Audio Requirements

- **Format**: WAV (preferred) or MP3
- **Sample Rate**: 44.1kHz recommended
- **Bit Depth**: 16-bit or 24-bit
- **Duration**: Keep individual samples under 5 seconds for optimal performance
- **File Size**: Smaller files load faster and use less memory

## Performance Optimizations

The drum kit implementation includes several optimizations for low-latency playback:

- **Sound Pooling**: Each sound has 3 instances for polyphonic playback
- **Preloading**: All sounds are loaded into memory at startup
- **Audio Mode**: Configured for low-latency audio playback
- **Error Handling**: Graceful fallbacks if sounds fail to load

## Fallback Behavior

If any of the 35 drum files are missing, the app will:
1. Log a warning message
2. Use `silence.mp3` as a fallback
3. Continue to function with available sounds
4. Display error information in the UI

## File Naming Convention

- Use exact filenames as listed above
- Keep filenames lowercase with underscores
- Use consistent audio format (preferably WAV)
- Maintain original sound names from the repository

## Testing

After adding the audio files:
1. Launch the app and navigate to the Drum Kit tab
2. Wait for all 35 sounds to load (progress indicator will show)
3. Test each drum pad for proper sound playback
4. Verify low-latency performance by rapid tapping
5. Test the demo pattern to ensure all sounds work together
