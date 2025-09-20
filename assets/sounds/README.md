
# Drum Kit Audio Assets

This directory should contain audio files for the drum kit functionality.

## Required Files

- `silence.mp3` - A silent audio file used as a fallback when drum sounds fail to load

## Adding Drum Sounds

To add custom drum sounds from the loyallawnsandlandscaping_alt/Drum_Kit repository:

1. Copy all audio files (.wav, .mp3, .aiff, etc.) to this directory
2. Update the `DEFAULT_DRUM_KIT` configuration in `hooks/useDrumKit.ts` to reference the correct file paths
3. Ensure all audio files are in a format supported by Expo AV (MP3, WAV, M4A, AAC)

## File Naming Convention

- Use descriptive names: `kick_drum.wav`, `snare_drum.wav`, `hihat_closed.wav`
- Keep filenames lowercase with underscores
- Use consistent audio format (preferably WAV or MP3)

## Audio Requirements

- Sample rate: 44.1kHz recommended
- Bit depth: 16-bit or 24-bit
- Format: WAV, MP3, or M4A
- Duration: Keep individual samples under 5 seconds for best performance
