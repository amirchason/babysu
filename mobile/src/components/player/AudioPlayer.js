import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import TrackPlayer, { usePlaybackState, useProgress } from 'react-native-track-player';
import PropTypes from 'prop-types';
import { theme, spacing, shadows } from '../../utils/theme';
import PlayerControls from './PlayerControls';
import ProgressBar from './ProgressBar';

/**
 * Audio Player Component
 *
 * Main audio player with controls, progress bar, and track information.
 * Uses react-native-track-player for audio playback.
 *
 * @example
 * <AudioPlayer
 *   song={{
 *     id: '1',
 *     title: 'Bedtime Song',
 *     audioUrl: 'https://...',
 *     category: 'Lullaby'
 *   }}
 *   onClose={handleClose}
 * />
 */
const AudioPlayer = ({ song, onClose, style }) => {
  const playbackState = usePlaybackState();
  const progress = useProgress();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (song && song.audioUrl) {
      setupPlayer();
    }
    return () => {
      TrackPlayer.reset();
    };
  }, [song]);

  const setupPlayer = async () => {
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: song.id,
        url: song.audioUrl,
        title: song.title,
        artist: song.category || 'BabySu',
        artwork: song.imageUrl || undefined,
      });
    } catch (error) {
      console.error('Failed to setup player:', error);
    }
  };

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Failed to toggle playback:', error);
    }
  };

  const handleSeek = async (value) => {
    try {
      await TrackPlayer.seekTo(value);
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  };

  const handleSkipForward = async () => {
    try {
      const position = await TrackPlayer.getPosition();
      await TrackPlayer.seekTo(Math.min(position + 10, progress.duration));
    } catch (error) {
      console.error('Failed to skip forward:', error);
    }
  };

  const handleSkipBackward = async () => {
    try {
      const position = await TrackPlayer.getPosition();
      await TrackPlayer.seekTo(Math.max(position - 10, 0));
    } catch (error) {
      console.error('Failed to skip backward:', error);
    }
  };

  if (!song) {
    return null;
  }

  return (
    <Card style={[styles.container, style]}>
      <Card.Content style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Now Playing</Text>
          {onClose && (
            <Ionicons
              name="close"
              size={24}
              color={theme.colors.text}
              onPress={onClose}
            />
          )}
        </View>

        {/* Album Art / Song Image */}
        <View style={styles.artworkContainer}>
          {song.imageUrl ? (
            <Image source={{ uri: song.imageUrl }} style={styles.artwork} />
          ) : (
            <View style={[styles.artwork, styles.placeholderArtwork]}>
              <Ionicons name="musical-notes" size={80} color={theme.colors.primary} />
            </View>
          )}
        </View>

        {/* Song Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {song.title}
          </Text>
          <Text style={styles.category}>{song.category || 'Song'}</Text>
        </View>

        {/* Progress Bar */}
        <ProgressBar
          currentTime={progress.position}
          duration={progress.duration}
          onSeek={handleSeek}
        />

        {/* Controls */}
        <PlayerControls
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onSkipForward={handleSkipForward}
          onSkipBackward={handleSkipBackward}
        />
      </Card.Content>
    </Card>
  );
};

AudioPlayer.propTypes = {
  song: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    audioUrl: PropTypes.string.isRequired,
    category: PropTypes.string,
    imageUrl: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func,
  style: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    ...shadows.large,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.placeholder,
    textTransform: 'uppercase',
  },
  artworkContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  artwork: {
    width: 280,
    height: 280,
    borderRadius: 20,
  },
  placeholderArtwork: {
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  category: {
    fontSize: 16,
    color: theme.colors.placeholder,
  },
});

export default AudioPlayer;
