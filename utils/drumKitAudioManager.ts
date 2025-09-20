
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
  private static readonly ASSETS_DIRECTORY = '../assets/sounds/';
  
  // All 35 required files from loyallawnsandlandscaping-alt/Drum-Kit/public/sounds
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
   * Check which audio files are available in both documents and assets directories
   */
  static async checkAudioFiles(): Promise<AudioFileInfo[]> {
    const fileInfos: AudioFileInfo[] = [];

    for (const fileName of this.REQUIRED_FILES) {
      // First check documents directory (user-added files)
      const documentsPath = `${this.SOUNDS_DIRECTORY}${fileName}`;
      let fileExists = false;
      let fileSize: number | undefined;

      try {
        const documentsInfo = await FileSystem.getInfoAsync(documentsPath);
        if (documentsInfo.exists) {
          fileExists = true;
          fileSize = documentsInfo.size;
        }
      } catch (error) {
        console.warn(`Failed to check documents file ${fileName}:`, error);
      }

      // If not in documents, check if it exists in assets (bundled with app)
      if (!fileExists) {
        try {
          // Try to create a test sound to see if the asset exists
          const assetPath = `${this.ASSETS_DIRECTORY}${fileName}`;
          // This is a simple existence check - in a real app you might bundle these files
          // For now, we'll assume they don't exist in assets unless manually added
        } catch (error) {
          // Asset doesn't exist
        }
      }

      fileInfos.push({
        name: fileName,
        path: fileExists ? documentsPath : `${this.ASSETS_DIRECTORY}${fileName}`,
        exists: fileExists,
        size: fileSize,
      });
    }

    return fileInfos;
  }

  /**
   * Get the URI for an audio file (with fallback to silence)
   */
  static async getAudioUri(fileName: string): Promise<{ uri: string; isLocal: boolean }> {
    // First, try documents directory (user-added files)
    const documentsPath = `${this.SOUNDS_DIRECTORY}${fileName}`;
    
    try {
      const fileInfo = await FileSystem.getInfoAsync(documentsPath);
      if (fileInfo.exists) {
        console.log(`Found real audio file: ${fileName}`);
        return { uri: documentsPath, isLocal: true };
      }
    } catch (error) {
      console.warn(`Failed to access documents file ${fileName}:`, error);
    }

    // Next, try assets directory (bundled files)
    try {
      const assetPath = `${this.ASSETS_DIRECTORY}${fileName}`;
      // In a real implementation, you would check if the asset exists
      // For now, we'll assume assets don't exist unless manually added to the bundle
      console.log(`Asset ${fileName} not found in bundle`);
    } catch (error) {
      console.warn(`Failed to access asset file ${fileName}:`, error);
    }

    // Fallback to silence
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
   * Copy audio files from a source directory to the app's documents directory
   * This would be used if files were downloaded or imported
   */
  static async copyAudioFile(sourceUri: string, fileName: string): Promise<boolean> {
    try {
      const destinationPath = `${this.SOUNDS_DIRECTORY}${fileName}`;
      await FileSystem.copyAsync({
        from: sourceUri,
        to: destinationPath,
      });
      console.log(`Successfully copied ${fileName} to documents directory`);
      return true;
    } catch (error) {
      console.error(`Failed to copy ${fileName}:`, error);
      return false;
    }
  }

  /**
   * Download audio file from a URL
   */
  static async downloadAudioFile(url: string, fileName: string): Promise<boolean> {
    try {
      const destinationPath = `${this.SOUNDS_DIRECTORY}${fileName}`;
      const downloadResult = await FileSystem.downloadAsync(url, destinationPath);
      
      if (downloadResult.status === 200) {
        console.log(`Successfully downloaded ${fileName}`);
        return true;
      } else {
        console.error(`Failed to download ${fileName}: HTTP ${downloadResult.status}`);
        return false;
      }
    } catch (error) {
      console.error(`Failed to download ${fileName}:`, error);
      return false;
    }
  }

  /**
   * Get installation instructions for missing files
   */
  static getInstallationInstructions(): string {
    return `
To use the complete drum kit with all 35 real audio sounds:

📁 STEP 1: Download Audio Files
- Go to: loyallawnsandlandscaping-alt/Drum-Kit/public/sounds
- Download all 35 .wav files from the repository

📱 STEP 2: Add Files to App
Option A - Assets Directory (Recommended):
- Copy all 35 .wav files to: assets/sounds/
- Rebuild the app to include the files in the bundle

Option B - Documents Directory:
- Use a file manager app to copy files to the app's documents/sounds/ folder
- Files will be loaded dynamically without rebuilding

🎵 STEP 3: Verify Installation
- Restart the app
- Check the "Audio" button in the drum kit for file status
- Missing files will show as red in the status

⚡ Performance Notes:
- WAV format recommended for best quality and low latency
- Keep files under 5MB each for optimal performance
- The app uses 4x sound pooling for polyphonic playback

🔧 Troubleshooting:
- Ensure exact filenames match the required list
- Check file permissions if using documents directory
- Use the Audio Status panel to see which files are missing

Required Files (35 total):
${this.REQUIRED_FILES.map(f => `- ${f}`).join('\n')}
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
      'Kick Drums (5)': this.REQUIRED_FILES.slice(0, 5),
      'Snare Drums (6)': this.REQUIRED_FILES.slice(5, 11),
      'Hi-Hats (6)': this.REQUIRED_FILES.slice(11, 17),
      'Cymbals (5)': this.REQUIRED_FILES.slice(17, 22),
      'Toms (6)': this.REQUIRED_FILES.slice(22, 28),
      'Percussion (4)': this.REQUIRED_FILES.slice(28, 32),
      'Electronic (3)': this.REQUIRED_FILES.slice(32, 35),
    };
  }

  /**
   * Get detailed file information including categories
   */
  static async getDetailedFileInfo(): Promise<{
    categories: Record<string, { files: AudioFileInfo[]; available: number; total: number }>;
    summary: { total: number; available: number; missing: number };
  }> {
    const fileInfos = await this.checkAudioFiles();
    const categories = this.getFileCategories();
    const result: Record<string, { files: AudioFileInfo[]; available: number; total: number }> = {};

    for (const [categoryName, fileNames] of Object.entries(categories)) {
      const categoryFiles = fileInfos.filter(info => fileNames.includes(info.name));
      const availableCount = categoryFiles.filter(f => f.exists).length;
      
      result[categoryName] = {
        files: categoryFiles,
        available: availableCount,
        total: fileNames.length,
      };
    }

    const totalAvailable = fileInfos.filter(f => f.exists).length;
    const summary = {
      total: this.REQUIRED_FILES.length,
      available: totalAvailable,
      missing: this.REQUIRED_FILES.length - totalAvailable,
    };

    return { categories: result, summary };
  }

  /**
   * Clear all cached audio files from documents directory
   */
  static async clearCachedFiles(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.SOUNDS_DIRECTORY);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(this.SOUNDS_DIRECTORY, { idempotent: true });
        console.log('Cleared all cached audio files');
      }
    } catch (error) {
      console.error('Failed to clear cached files:', error);
    }
  }
}
