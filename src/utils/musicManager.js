/**
 * Music Manager - 管理背景音乐播放
 * 根据图片分类选择对应的背景音乐
 */

// 音乐文件映射
const MUSIC_MAPPING = {
  Chinese: [
    '/src/assets/Curio Music/Chinese/Chinese_1.mp3',
    '/src/assets/Curio Music/Chinese/Chinese_2.mp3',
    '/src/assets/Curio Music/Chinese/Chinese_3.mp3',
    '/src/assets/Curio Music/Chinese/Chinese_4.mp3',
    '/src/assets/Curio Music/Chinese/Chinese_5.mp3'
  ],
  European: [
    '/src/assets/Curio Music/European/European_1.mp3',
    '/src/assets/Curio Music/European/European_2.mp3',
    '/src/assets/Curio Music/European/European_3.mp3',
    '/src/assets/Curio Music/European/European_4.mp3',
    '/src/assets/Curio Music/European/European_5.mp3',
    '/src/assets/Curio Music/European/European_6.mp3'
  ],
  Modern: [
    '/src/assets/Curio Music/Modern/Modern_1.mp3',
    '/src/assets/Curio Music/Modern/Modern_2.mp3',
    '/src/assets/Curio Music/Modern/Modern_3.mp3',
    '/src/assets/Curio Music/Modern/Modern_4.mp3'
  ]
};

class MusicManager {
  constructor() {
    this.currentAudio = null;
    this.currentCategory = null;
    this.currentTrack = null;
    this.volume = 0.3; // 默认音量
    this.isPlaying = false;
    this.playPromise = null;
    this.isStopping = false; // 防止并发操作的标志
    this.isStarting = false; // 防止并发播放的标志
  }

  /**
   * 根据分类和背景ID选择音乐
   * @param {string} category - 分类 (Chinese, European, Modern)
   * @param {string} backgroundId - 背景图片ID，用于确定性选择音乐
   * @returns {string} - 音乐文件路径
   */
  selectMusicByCategory(category, backgroundId) {
    console.log('=== MUSIC SELECTION START ===');
    console.log('Input parameters:', { category, backgroundId });
    console.log('Available categories:', Object.keys(MUSIC_MAPPING));
    console.log('Category music tracks:', MUSIC_MAPPING[category] ? MUSIC_MAPPING[category].length : 0);

    const categoryMusic = MUSIC_MAPPING[category];
    if (!categoryMusic || categoryMusic.length === 0) {
      console.log('No music found for category, using European fallback');
      const fallbackMusic = MUSIC_MAPPING.European;
      const selectedTrack = fallbackMusic[0]; // 使用第一首作为默认
      console.log('Selected fallback track:', selectedTrack);
      return selectedTrack;
    }

    // 基于backgroundId确定性地选择音乐，确保同一背景总是播放相同音乐
    let trackIndex = 0;
    if (backgroundId) {
      // 使用backgroundId的hash值来确定性选择
      const hash = this.simpleHash(backgroundId);
      trackIndex = hash % categoryMusic.length;
    }

    const selectedTrack = categoryMusic[trackIndex];
    console.log(`Selected track ${trackIndex + 1}/${categoryMusic.length}:`, selectedTrack);
    console.log('Track details:', {
      category,
      backgroundId,
      hash: backgroundId ? this.simpleHash(backgroundId) : 'no-id',
      trackIndex,
      filename: selectedTrack.split('/').pop()
    });
    console.log('=== MUSIC SELECTION COMPLETE ===');
    return selectedTrack;
  }

  /**
   * 简单hash函数，用于确定性选择
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * 播放音乐
   * @param {string} category - 分类
   * @param {string} backgroundId - 背景ID
   * @param {boolean} forceRestart - 是否强制重新开始播放
   */
  async playMusic(category, backgroundId, forceRestart = false) {
    console.log('=== MUSIC PLAY START ===');
    console.log('Request:', { category, backgroundId, forceRestart });
    console.log('Current state:', { 
      currentCategory: this.currentCategory, 
      currentTrack: this.currentTrack, 
      isPlaying: this.isPlaying,
      isStopping: this.isStopping,
      isStarting: this.isStarting
    });

    // 如果正在播放或停止音乐，等待完成
    if (this.isStopping) {
      console.log('Waiting for stop to complete...');
      while (this.isStopping) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    if (this.isStarting) {
      console.log('Another playMusic call is in progress, skipping');
      return;
    }

    this.isStarting = true;

    try {
      const selectedTrack = this.selectMusicByCategory(category, backgroundId);

      // 如果是相同的音乐且正在播放，根据forceRestart决定是否重新播放
      if (this.currentTrack === selectedTrack && this.isPlaying) {
        if (forceRestart) {
          console.log('Force restarting same track');
          await this.stop();
        } else {
          console.log('Same track already playing, continuing');
          return;
        }
      }

      // 如果是不同的音乐，停止当前播放
      if (this.currentTrack !== selectedTrack) {
        console.log('Switching to different track');
        await this.stop();
      }

      // 总是停止当前音乐并创建新的音频对象，确保干净的状态
      await this.stop();
      
      console.log('Creating new audio object for:', selectedTrack);
      this.currentAudio = new Audio(selectedTrack);
      this.currentAudio.volume = this.volume;
      this.currentAudio.loop = true; // 循环播放
      
      // 添加事件监听器
      this.currentAudio.addEventListener('loadstart', () => {
        console.log('Music loading started');
      });
      
      this.currentAudio.addEventListener('canplaythrough', () => {
        console.log('Music can play through');
      });
      
      this.currentAudio.addEventListener('error', (e) => {
        console.error('Music loading error:', e);
        this.isPlaying = false;
        this.isStarting = false;
      });

      // 开始播放
      console.log('Starting playback');
      this.playPromise = this.currentAudio.play();
      await this.playPromise;
      
      this.currentCategory = category;
      this.currentTrack = selectedTrack;
      this.isPlaying = true;
      
      console.log('✓ Music playback started successfully');
      console.log('=== MUSIC PLAY COMPLETE ===');
      
    } catch (error) {
      console.error('❌ Error playing music:', error);
      this.isPlaying = false;
      this.currentAudio = null;
      this.currentTrack = null;
    } finally {
      this.isStarting = false;
    }
  }

  /**
   * 停止音乐
   */
  async stop() {
    console.log('=== MUSIC STOP START ===');
    
    // 设置停止标志防止其他操作干扰
    this.isStopping = true;
    
    if (this.playPromise) {
      try {
        await this.playPromise;
      } catch (error) {
        console.log('Play promise rejected, continuing with stop');
      }
      this.playPromise = null;
    }

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        // 完全清除音频源
        this.currentAudio.src = '';
        this.currentAudio.load(); // 重置音频对象
        // 移除事件监听器以防内存泄漏
        this.currentAudio.removeEventListener('loadstart', () => {});
        this.currentAudio.removeEventListener('canplaythrough', () => {});
        this.currentAudio.removeEventListener('error', () => {});
        // 清除音频对象引用
        this.currentAudio = null;
        console.log('✓ Audio stopped, reset and cleaned up');
      } catch (error) {
        console.log('Error during audio cleanup:', error);
      }
    }
    
    this.isPlaying = false;
    this.currentTrack = null;
    this.currentCategory = null;
    this.isStopping = false;
    
    // 添加额外延迟确保清理完成
    await new Promise(resolve => setTimeout(resolve, 50));
    
    console.log('=== MUSIC STOP COMPLETE ===');
  }

  /**
   * 暂停音乐
   */
  pause() {
    console.log('=== MUSIC PAUSE ===');
    if (this.currentAudio && this.isPlaying) {
      this.currentAudio.pause();
      this.isPlaying = false;
      console.log('✓ Music paused');
    }
  }

  /**
   * 恢复播放
   */
  async resume() {
    console.log('=== MUSIC RESUME ===');
    if (this.currentAudio && !this.isPlaying) {
      try {
        await this.currentAudio.play();
        this.isPlaying = true;
        console.log('✓ Music resumed');
      } catch (error) {
        console.error('❌ Error resuming music:', error);
      }
    }
  }

  /**
   * 设置音量
   * @param {number} volume - 音量 (0-1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.currentAudio) {
      this.currentAudio.volume = this.volume;
    }
    console.log('Volume set to:', this.volume);
  }

  /**
   * 获取当前播放状态
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentCategory: this.currentCategory,
      currentTrack: this.currentTrack,
      volume: this.volume
    };
  }

  /**
   * 清理资源
   */
  cleanup() {
    console.log('=== MUSIC CLEANUP ===');
    this.stop();
    if (this.currentAudio) {
      this.currentAudio = null;
    }
    this.currentCategory = null;
    this.currentTrack = null;
    console.log('✓ Music manager cleaned up');
  }
}

// 创建全局音乐管理器实例
export const musicManager = new MusicManager();

// 导出类以便需要时创建新实例
export default MusicManager;
