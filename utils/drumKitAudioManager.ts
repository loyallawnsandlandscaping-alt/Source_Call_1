
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

export interface AudioFileInfo {
  name: string;
  path: string;
  exists: boolean;
  size?: number;
}

export class DrumKitAudioManager {
  private static readonly SOUNDS_DIRECTORY = `${FileSystem.documentDirectory}sounds/`;
  private static readonly REQUIRED_FILES = [
    // Kick drums (5 files)
    'kick_1.wav', 'kick_2.wav', 'kick_3.wav', 'kick_4.wav', 'kick_5.wav',
    
    // Snare drums (6 files)
    'snare_1.wav', 'snare_2.wav', 'snare_3.wav', 'snare_4.wav', 'snare_5.wav', 'snare_6.wav',
    
    // Hi-hats (6 files)
    'hihat_closed_1.wav', 'hihat_closed_2.wav', 'hihat_open_1.wav', 'hihat_open_2.wav', 
    'hihat_pedal.wav', 'hihat_splash.wav',
    
    // Cymbals (5 files)
    'crash_1.wav', 'crash_2.wav', 'ride_1.wav', 'ride_2.wav', 'china.wav',
    
    // Toms (6 files)
    'tom_high_1.wav', 'tom_high_2.wav', 'tom_mid_1.wav', 'tom_mid_2.wav', 
    'tom_low_1.wav', 'tom_low_2.wav',
    
    // Percussion (4 files)
    'cowbell.wav', 'woodblock.wav', 'tambourine.wav', 'shaker.wav',
    
    // Electronic sounds (3 files)
    'electronic_kick.wav', 'electronic_snare.wav', 'electronic_hihat.wav',
  ];

  /**
   * Initialize the sounds directory
   */
  static async initializeSoundsDirectory(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.SOUNDS_DIRECTORY);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.SOUNDS_DIRECTORY, { intermediates: true });
        console.log('Created sounds directory:', this.SOUNDS_DIRECTORY);
      }
    } catch (error) {
      console.error('Failed to initialize sounds directory:', error);
      throw error;
    }
  }

  /**
   * Check which audio files are available
   */
  static async checkAudioFiles(): Promise<AudioFileInfo[]> {
    const fileInfos: AudioFileInfo[] = [];

    for (const fileName of this.REQUIRED_FILES) {
      const filePath = `${this.SOUNDS_DIRECTORY}${fileName}`;
      
      try {
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        fileInfos.push({
          name: fileName,
          path: filePath,
          exists: fileInfo.exists,
          size: fileInfo.exists ? fileInfo.size : undefined,
        });
      } catch (error) {
        console.warn(`Failed to check file ${fileName}:`, error);
        fileInfos.push({
          name: fileName,
          path: filePath,
          exists: false,
        });
      }
    }

    return fileInfos;
  }

  /**
   * Get the URI for an audio file (with fallback to silence)
   */
  static async getAudioUri(fileName: string): Promise<{ uri: string; isLocal: boolean }> {
    const filePath = `${this.SOUNDS_DIRECTORY}${fileName}`;
    
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        return { uri: filePath, isLocal: true };
      }
    } catch (error) {
      console.warn(`Failed to access file ${fileName}:`, error);
    }

    // Fallback to bundled silence file
    console.warn(`Using silence fallback for missing file: ${fileName}`);
    return { uri: 'silence', isLocal: false };
  }

  /**
   * Validate audio file format and quality
   */
  static async validateAudioFile(filePath: string): Promise<{
    isValid: boolean;
    duration?: number;
    error?: string;
  }> {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: filePath },
        { shouldPlay: false }
      );

      const status = await sound.getStatusAsync();
      await sound.unloadAsync();

      if (status.isLoaded) {
        return {
          isValid: true,
          duration: status.durationMillis ? status.durationMillis / 1000 : undefined,
        };
      } else {
        return {
          isValid: false,
          error: 'Failed to load audio file',
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get missing files report
   */
  static async getMissingFilesReport(): Promise<{
    totalFiles: number;
    existingFiles: number;
    missingFiles: string[];
    existingFiles: string[];
  }> {
    const fileInfos = await this.checkAudioFiles();
    
    const existingFiles = fileInfos.filter(f => f.exists).map(f => f.name);
    const missingFiles = fileInfos.filter(f => !f.exists).map(f => f.name);

    return {
      totalFiles: this.REQUIRED_FILES.length,
      existingFiles: existingFiles.length,
      missingFiles,
      existingFiles,
    };
  }

  /**
   * Copy audio files from assets to documents directory
   * This would be used if files were bundled with the app
   */
  static async copyBundledAudioFiles(): Promise<void> {
    // This is a placeholder for copying bundled audio files
    // In a real implementation, you would copy files from the app bundle
    // to the documents directory for better performance
    console.log('copyBundledAudioFiles: Not implemented - files should be manually added');
  }

  /**
   * Get installation instructions for missing files
   */
  static getInstallationInstructions(): string {
    return `
To use the complete drum kit with all 35 sounds:

1. Download the audio files from the loyallawnsandlandscaping-alt/Drum-Kit repository
2. Copy all 35 .wav files to the app's sounds directory
3. Ensure files are named exactly as specified in the documentation
4. Restart the app to load the new sounds

Required files (35 total):
${this.REQUIRED_FILES.map(f => `- ${f}`).join('\n')}

The app will use silent fallbacks for any missing files.
    `.trim();
  }

  /**
   * Get the list of required files
   */
  static getRequiredFiles(): string[] {
    return [...this.REQUIRED_FILES];
  }

  /**
   * Get file categories for organization
   */
  static getFileCategories(): Record<string, string[]> {
    return {
      'Kick Drums': this.REQUIRED_FILES.slice(0, 5),
      'Snare Drums': this.REQUIRED_FILES.slice(5, 11),
      'Hi-Hats': this.REQUIRED_FILES.slice(11, 17),
      'Cymbals': this.REQUIRED_FILES.slice(17, 22),
      'Toms': this.REQUIRED_FILES.slice(22, 28),
      'Percussion': this.REQUIRED_FILES.slice(28, 32),
      'Electronic': this.REQUIRED_FILES.slice(32, 35),
    };
  }
}
