import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Slider,
  Typography,
  Avatar,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipPrevious,
  SkipNext,
  VolumeUp,
  VolumeOff,
  Favorite,
  FavoriteBorder,
  Close,
} from '@mui/icons-material';
import { colors } from '../theme';

/**
 * HTML5 Audio Player Component
 *
 * @param {Object} props
 * @param {Object} props.song - Song object with audioUrl, title, category, etc.
 * @param {Function} props.onToggleFavorite - Callback when favorite button is clicked
 * @param {Function} props.onPrevious - Callback for previous track
 * @param {Function} props.onNext - Callback for next track
 * @param {Function} props.onClose - Callback to close the player
 * @param {boolean} props.hasPrevious - Whether there's a previous track
 * @param {boolean} props.hasNext - Whether there's a next track
 */
export default function AudioPlayer({
  song,
  onToggleFavorite,
  onPrevious,
  onNext,
  onClose,
  hasPrevious = false,
  hasNext = false,
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Reset player when song changes
  useEffect(() => {
    console.log('🎵 AudioPlayer: Song changed', {
      songId: song?.id,
      audioUrl: song?.audioUrl,
      title: song?.title
    });
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [song?.id]);

  // Handle audio loaded metadata
  const handleLoadedMetadata = () => {
    console.log('✅ AudioPlayer: Audio metadata loaded', {
      duration: audioRef.current?.duration,
      src: audioRef.current?.src
    });
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle audio load error
  const handleAudioError = (e) => {
    console.error('❌ AudioPlayer: Failed to load audio', {
      error: e.target?.error,
      errorCode: e.target?.error?.code,
      errorMessage: e.target?.error?.message,
      audioUrl: song?.audioUrl,
      src: e.target?.src
    });
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle play/pause
  const togglePlayPause = async () => {
    if (!audioRef.current) {
      console.warn('⚠️ AudioPlayer: audioRef is null');
      return;
    }

    console.log('🎮 AudioPlayer: Play/Pause clicked', {
      isCurrentlyPlaying: isPlaying,
      audioUrl: song?.audioUrl,
      readyState: audioRef.current.readyState,
      networkState: audioRef.current.networkState
    });

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      console.log('⏸️ AudioPlayer: Paused');
    } else {
      try {
        console.log('▶️ AudioPlayer: Attempting to play...');
        await audioRef.current.play();
        setIsPlaying(true);
        console.log('✅ AudioPlayer: Playing');
      } catch (error) {
        console.error('❌ AudioPlayer: Play failed', {
          error: error.message,
          errorName: error.name,
          audioUrl: song?.audioUrl,
          readyState: audioRef.current.readyState,
          networkState: audioRef.current.networkState
        });
        setIsPlaying(false);
      }
    }
  };

  // Handle seek
  const handleSeek = (event, newValue) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newValue;
      setCurrentTime(newValue);
    }
  };

  // Handle volume change
  const handleVolumeChange = (event, newValue) => {
    if (audioRef.current) {
      audioRef.current.volume = newValue;
      setVolume(newValue);
      setIsMuted(newValue === 0);
    }
  };

  // Handle mute toggle
  const toggleMute = () => {
    if (audioRef.current) {
      const newMutedState = !isMuted;
      audioRef.current.muted = newMutedState;
      setIsMuted(newMutedState);

      if (!newMutedState && volume === 0) {
        audioRef.current.volume = 0.5;
        setVolume(0.5);
      }
    }
  };

  // Handle audio ended
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);

    // Auto-play next track if available
    if (hasNext && onNext) {
      onNext();
    }
  };

  // Format time in MM:SS
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!song || !song.audioUrl) {
    return null;
  }

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: 3,
        background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.secondary}15 100%)`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Audio Element */}
        <audio
          ref={audioRef}
          src={song.audioUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={handleAudioError}
        />

        {/* Song Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: colors.primary,
              mr: 2,
            }}
          >
            🎵
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
              {song.title || 'Untitled Song'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {song.category} • {song.topic || song.theme}
            </Typography>
          </Box>
          <IconButton
            onClick={() => onToggleFavorite && onToggleFavorite(song.id)}
            sx={{ color: song.isFavorite ? colors.accent : '#CCC', mr: 1 }}
          >
            {song.isFavorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
          {onClose && (
            <IconButton
              onClick={onClose}
              sx={{ color: '#999' }}
            >
              <Close />
            </IconButton>
          )}
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Slider
            value={currentTime}
            max={duration || 100}
            onChange={handleSeek}
            sx={{
              color: colors.primary,
              '& .MuiSlider-thumb': {
                width: 16,
                height: 16,
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              {formatTime(currentTime)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTime(duration)}
            </Typography>
          </Box>
        </Box>

        {/* Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <IconButton
            onClick={onPrevious}
            disabled={!hasPrevious}
            sx={{ color: hasPrevious ? colors.primary : '#CCC' }}
          >
            <SkipPrevious sx={{ fontSize: 32 }} />
          </IconButton>

          <IconButton
            onClick={togglePlayPause}
            sx={{
              bgcolor: colors.primary,
              color: '#FFF',
              width: 64,
              height: 64,
              mx: 2,
              '&:hover': {
                bgcolor: '#E55B8A',
              },
            }}
          >
            {isPlaying ? (
              <Pause sx={{ fontSize: 32 }} />
            ) : (
              <PlayArrow sx={{ fontSize: 32 }} />
            )}
          </IconButton>

          <IconButton
            onClick={onNext}
            disabled={!hasNext}
            sx={{ color: hasNext ? colors.primary : '#CCC' }}
          >
            <SkipNext sx={{ fontSize: 32 }} />
          </IconButton>
        </Box>

        {/* Volume Control */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={toggleMute} size="small">
            {isMuted || volume === 0 ? (
              <VolumeOff sx={{ color: '#999' }} />
            ) : (
              <VolumeUp sx={{ color: colors.primary }} />
            )}
          </IconButton>
          <Slider
            value={isMuted ? 0 : volume}
            min={0}
            max={1}
            step={0.01}
            onChange={handleVolumeChange}
            sx={{
              color: colors.primary,
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
