import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Card, Button, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchChildren } from '../store/slices/childrenSlice';
import { fetchSongs } from '../store/slices/songsSlice';
import { users } from '../services/api';
import { theme, spacing, shadows } from '../utils/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: children } = useSelector((state) => state.children);
  const { list: songs } = useSelector((state) => state.songs);

  const [refreshing, setRefreshing] = useState(false);
  const [usage, setUsage] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    dispatch(fetchChildren());
    dispatch(fetchSongs({ limit: 5 }));
    loadUsage();
  };

  const loadUsage = async () => {
    try {
      setLoadingUsage(true);
      const data = await users.getUsage();
      setUsage(data);
    } catch (error) {
      console.error('Failed to load usage:', error);
    } finally {
      setLoadingUsage(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const recentSongs = songs.slice(0, 3);
  const completedSongs = songs.filter(s => s.status === 'completed');

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header with Gradient */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <Text style={styles.greeting}>{getGreeting()}!</Text>
        <Text style={styles.userName}>{user?.name || 'Parent'}</Text>
        {children.length > 0 && (
          <Text style={styles.childrenText}>
            {children.length} {children.length === 1 ? 'child' : 'children'} registered
          </Text>
        )}
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <View style={styles.statContent}>
            <Ionicons name="musical-notes" size={32} color={theme.colors.primary} />
            <Text style={styles.statNumber}>
              {loadingUsage ? '...' : completedSongs.length}
            </Text>
            <Text style={styles.statLabel}>Songs Created</Text>
          </View>
        </Card>

        <Card style={styles.statCard}>
          <View style={styles.statContent}>
            <Ionicons name="heart" size={32} color={theme.colors.accent} />
            <Text style={styles.statNumber}>
              {songs.filter(s => s.isFavorite).length}
            </Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </Card>

        <Card style={styles.statCard}>
          <View style={styles.statContent}>
            <Ionicons name="time" size={32} color={theme.colors.tertiary} />
            <Text style={styles.statNumber}>
              {loadingUsage ? '...' : usage?.limit || 20}
            </Text>
            <Text style={styles.statLabel}>Monthly Limit</Text>
          </View>
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('Generate')}
          >
            <Ionicons name="add-circle-outline" size={40} color="#FFFFFF" />
            <Text style={styles.actionText}>Create Song</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.colors.tertiary }]}
            onPress={() => navigation.navigate('Children')}
          >
            <Ionicons name="people-outline" size={40} color="#FFFFFF" />
            <Text style={styles.actionText}>Add Child</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.colors.secondary }]}
            onPress={() => navigation.navigate('Library')}
          >
            <Ionicons name="library-outline" size={40} color="#FFFFFF" />
            <Text style={styles.actionText}>My Library</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* No Children State */}
      {children.length === 0 && (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Text style={styles.emptyEmoji}>👶</Text>
            <Text style={styles.emptyTitle}>Add Your First Child!</Text>
            <Text style={styles.emptyText}>
              Start by adding your child's profile to create personalized songs.
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Children')}
              style={styles.emptyButton}
              buttonColor={theme.colors.primary}
            >
              Add Child Profile
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Children Quick View */}
      {children.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Children</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Children')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {children.map((child) => (
              <Card key={child.id} style={styles.childCard}>
                <Card.Content style={styles.childContent}>
                  <View style={styles.childAvatar}>
                    <Text style={styles.childAvatarText}>
                      {child.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childAge}>{child.age} years old</Text>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Recent Songs */}
      {recentSongs.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Songs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Library')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentSongs.map((song) => (
            <TouchableOpacity
              key={song.id}
              onPress={() => navigation.navigate('SongDetail', { songId: song.id })}
            >
              <Card style={styles.songCard}>
                <Card.Content style={styles.songContent}>
                  <View style={styles.songIcon}>
                    <Ionicons
                      name={song.status === 'completed' ? 'musical-note' : 'hourglass'}
                      size={24}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={styles.songInfo}>
                    <Text style={styles.songTitle}>{song.title}</Text>
                    <Text style={styles.songMeta}>
                      {song.category} • {song.status}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Tips Section */}
      <Card style={styles.tipCard}>
        <Card.Content>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={24} color={theme.colors.accent} />
            <Text style={styles.tipTitle}>💡 Parenting Tip</Text>
          </View>
          <Text style={styles.tipText}>
            Try creating a bedtime song with your child's favorite things!
            Songs with familiar elements help children feel safe and relaxed.
          </Text>
        </Card.Content>
      </Card>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
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
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greeting: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: spacing.xs,
  },
  childrenText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginTop: -30,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
    borderRadius: 16,
    ...shadows.medium,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    aspectRatio: 1,
    marginHorizontal: spacing.xs,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  emptyCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: 16,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: spacing.md,
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
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  emptyButton: {
    borderRadius: 25,
  },
  childCard: {
    width: 120,
    marginRight: spacing.md,
    borderRadius: 16,
    ...shadows.small,
  },
  childContent: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  childAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  childAvatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  childAge: {
    fontSize: 12,
    color: '#999',
    marginTop: spacing.xs,
  },
  songCard: {
    marginBottom: spacing.sm,
    borderRadius: 12,
    ...shadows.small,
  },
  songContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background,
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
    marginBottom: spacing.xs,
  },
  songMeta: {
    fontSize: 12,
    color: '#999',
  },
  tipCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: 16,
    backgroundColor: '#FFF9E6',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: spacing.sm,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
