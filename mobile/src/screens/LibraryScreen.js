import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Card, Chip, Searchbar, ActivityIndicator, IconButton, Menu } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSongs, deleteSong } from '../store/slices/songsSlice';
import { fetchChildren } from '../store/slices/childrenSlice';
import { theme, spacing, shadows } from '../utils/theme';
import { Alert } from 'react-native';

export default function LibraryScreen({ navigation }) {
  const dispatch = useDispatch();
  const { list: songs, loading } = useSelector((state) => state.songs);
  const { list: children } = useSelector((state) => state.children);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [menuVisible, setMenuVisible] = useState({});

  useEffect(() => {
    dispatch(fetchSongs());
    dispatch(fetchChildren());
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchSongs());
    setRefreshing(false);
  };

  const toggleMenu = (songId) => {
    setMenuVisible((prev) => ({ ...prev, [songId]: !prev[songId] }));
  };

  const handleDelete = (song) => {
    Alert.alert(
      'Delete Song',
      `Are you sure you want to delete "${song.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteSong(song.id)).unwrap();
              Alert.alert('Deleted', 'Song has been deleted.');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete song');
            }
          },
        },
      ]
    );
  };

  const filteredSongs = songs.filter((song) => {
    const matchesSearch = song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         song.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChild = !selectedChild || song.childIds?.includes(selectedChild);
    const matchesStatus = !selectedStatus || song.status === selectedStatus;
    return matchesSearch && matchesChild && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return theme.colors.tertiary;
      case 'processing': return theme.colors.accent;
      case 'failed': return '#E74C3C';
      default: return '#999';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'processing': return 'hourglass';
      case 'failed': return 'close-circle';
      default: return 'ellipse';
    }
  };

  const renderSongCard = ({ item: song }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('SongDetail', { songId: song.id })}
      activeOpacity={0.7}
    >
      <Card style={styles.songCard}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.songRow}>
            {/* Icon */}
            <View style={[styles.songIcon, { backgroundColor: getStatusColor(song.status) + '20' }]}>
              <Ionicons
                name={getStatusIcon(song.status)}
                size={28}
                color={getStatusColor(song.status)}
              />
            </View>

            {/* Info */}
            <View style={styles.songInfo}>
              <Text style={styles.songTitle} numberOfLines={1}>{song.title || 'Untitled Song'}</Text>
              <Text style={styles.songMeta} numberOfLines={1}>
                {song.category || 'Unknown'} • {new Date(song.createdAt || Date.now()).toLocaleDateString()}
              </Text>
              <View style={styles.tagsRow}>
                <Chip
                  mode="flat"
                  compact
                  style={styles.statusChip}
                  textStyle={{ fontSize: 11, color: getStatusColor(song.status) }}
                >
                  {song.status}
                </Chip>
                {song.isFavorite && (
                  <Ionicons name="heart" size={16} color={theme.colors.accent} style={{ marginLeft: 8 }} />
                )}
              </View>
            </View>

            {/* Menu */}
            <Menu
              visible={menuVisible[song.id] || false}
              onDismiss={() => toggleMenu(song.id)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => toggleMenu(song.id)}
                />
              }
            >
              <Menu.Item
                onPress={() => {
                  toggleMenu(song.id);
                  navigation.navigate('SongDetail', { songId: song.id });
                }}
                leadingIcon="play"
                title="Play"
              />
              <Menu.Item
                onPress={() => {
                  toggleMenu(song.id);
                  // TODO: Implement share
                  Alert.alert('Share', 'Sharing coming soon!');
                }}
                leadingIcon="share"
                title="Share"
              />
              <Menu.Item
                onPress={() => {
                  toggleMenu(song.id);
                  handleDelete(song);
                }}
                leadingIcon="delete"
                title="Delete"
                titleStyle={{ color: '#E74C3C' }}
              />
            </Menu>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.secondary, theme.colors.primary]}
        style={styles.header}
      >
        <Text style={styles.headerEmoji}>📚</Text>
        <Text style={styles.headerTitle}>My Library</Text>
        <Text style={styles.headerSubtitle}>
          {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'}
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Search Bar */}
        <Searchbar
          placeholder="Search songs..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={theme.colors.primary}
        />

        {/* Filters */}
        <View style={styles.filtersSection}>
          <Text style={styles.filtersLabel}>Filter by:</Text>
          <View style={styles.filtersRow}>
            {/* Child Filter */}
            <Chip
              mode={selectedChild === null ? 'flat' : 'outlined'}
              selected={selectedChild === null}
              onPress={() => setSelectedChild(null)}
              style={styles.filterChip}
              textStyle={styles.filterChipText}
            >
              All Children
            </Chip>
            {children.map((child) => (
              <Chip
                key={child.childId}
                mode={selectedChild === child.childId ? 'flat' : 'outlined'}
                selected={selectedChild === child.childId}
                onPress={() => setSelectedChild(child.childId)}
                style={styles.filterChip}
                textStyle={styles.filterChipText}
              >
                {child.name}
              </Chip>
            ))}
          </View>

          <View style={styles.filtersRow}>
            {/* Status Filter */}
            <Chip
              mode={selectedStatus === null ? 'flat' : 'outlined'}
              selected={selectedStatus === null}
              onPress={() => setSelectedStatus(null)}
              style={styles.filterChip}
              textStyle={styles.filterChipText}
            >
              All Status
            </Chip>
            <Chip
              mode={selectedStatus === 'completed' ? 'flat' : 'outlined'}
              selected={selectedStatus === 'completed'}
              onPress={() => setSelectedStatus('completed')}
              style={styles.filterChip}
              textStyle={styles.filterChipText}
            >
              Completed
            </Chip>
            <Chip
              mode={selectedStatus === 'processing' ? 'flat' : 'outlined'}
              selected={selectedStatus === 'processing'}
              onPress={() => setSelectedStatus('processing')}
              style={styles.filterChip}
              textStyle={styles.filterChipText}
            >
              Processing
            </Chip>
          </View>
        </View>

        {/* Songs List */}
        {loading && songs.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading your library...</Text>
          </View>
        ) : filteredSongs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎵</Text>
            <Text style={styles.emptyTitle}>
              {songs.length === 0 ? 'No Songs Yet' : 'No Matching Songs'}
            </Text>
            <Text style={styles.emptyText}>
              {songs.length === 0
                ? 'Create your first personalized song!'
                : 'Try adjusting your filters or search.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredSongs}
            renderItem={renderSongCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: spacing.xl,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerEmoji: {
    fontSize: 60,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  searchBar: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
  },
  filtersSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  filtersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: spacing.sm,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  filterChip: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterChipText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  songCard: {
    marginBottom: spacing.md,
    borderRadius: 12,
    ...shadows.small,
  },
  cardContent: {
    padding: spacing.sm,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  songMeta: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    height: 24,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
