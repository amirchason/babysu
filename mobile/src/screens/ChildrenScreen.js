import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Card, Button, FAB, IconButton, Menu } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchChildren, deleteChild } from '../store/slices/childrenSlice';
import { theme, spacing, shadows } from '../utils/theme';

export default function ChildrenScreen({ navigation }) {
  const dispatch = useDispatch();
  const { list: children, loading } = useSelector((state) => state.children);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState({});

  useEffect(() => {
    dispatch(fetchChildren());
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchChildren());
    setRefreshing(false);
  };

  const handleDelete = (child) => {
    Alert.alert(
      'Delete Child Profile',
      `Are you sure you want to delete ${child.name}'s profile? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteChild(child.id)).unwrap();
              Alert.alert('Deleted', `${child.name}'s profile has been deleted.`);
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete child profile');
            }
          },
        },
      ]
    );
  };

  const toggleMenu = (childId) => {
    setMenuVisible((prev) => ({ ...prev, [childId]: !prev[childId] }));
  };

  const getAgeText = (age) => {
    if (age === 1) return '1 year old';
    if (age < 1) {
      const months = Math.round(age * 12);
      return `${months} months old`;
    }
    return `${age} years old`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.tertiary, theme.colors.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerEmoji}>👶</Text>
        <Text style={styles.headerTitle}>Your Children</Text>
        <Text style={styles.headerSubtitle}>
          {children.length === 0
            ? 'Add your first child profile'
            : `${children.length} ${children.length === 1 ? 'child' : 'children'} registered`}
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Empty State */}
        {children.length === 0 && !loading && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={styles.emptyEmoji}>🌟</Text>
              <Text style={styles.emptyTitle}>No Children Yet</Text>
              <Text style={styles.emptyText}>
                Add your child's profile to start creating personalized songs just for them!
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('AddChild')}
                style={styles.emptyButton}
                buttonColor={theme.colors.tertiary}
                icon="plus"
              >
                Add Your First Child
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Children List */}
        {children.map((child) => (
          <Card key={child.id} style={styles.childCard}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.childRow}>
                {/* Avatar */}
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{child.name.charAt(0).toUpperCase()}</Text>
                </View>

                {/* Info */}
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childAge}>{getAgeText(child.age)}</Text>
                  {child.gender && (
                    <View style={styles.genderBadge}>
                      <Ionicons
                        name={child.gender === 'boy' ? 'male' : child.gender === 'girl' ? 'female' : 'male-female'}
                        size={14}
                        color={theme.colors.primary}
                      />
                      <Text style={styles.genderText}>
                        {child.gender.charAt(0).toUpperCase() + child.gender.slice(1)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Menu */}
                <Menu
                  visible={menuVisible[child.id] || false}
                  onDismiss={() => toggleMenu(child.id)}
                  anchor={
                    <IconButton
                      icon="dots-vertical"
                      size={24}
                      onPress={() => toggleMenu(child.id)}
                    />
                  }
                >
                  <Menu.Item
                    onPress={() => {
                      toggleMenu(child.id);
                      navigation.navigate('AddChild', { child });
                    }}
                    leadingIcon="pencil"
                    title="Edit"
                  />
                  <Menu.Item
                    onPress={() => {
                      toggleMenu(child.id);
                      handleDelete(child);
                    }}
                    leadingIcon="delete"
                    title="Delete"
                    titleStyle={{ color: '#E74C3C' }}
                  />
                </Menu>
              </View>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="musical-notes" size={18} color={theme.colors.primary} />
                  <Text style={styles.statText}>12 songs</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="heart" size={18} color={theme.colors.accent} />
                  <Text style={styles.statText}>5 favorites</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="calendar" size={18} color={theme.colors.tertiary} />
                  <Text style={styles.statText}>
                    Added {new Date(child.createdAt || Date.now()).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* Quick Action Button */}
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Generate', { selectedChild: child.childId })}
                style={styles.generateButton}
                icon="music-note"
                textColor={theme.colors.primary}
              >
                Create Song for {child.name}
              </Button>
            </Card.Content>
          </Card>
        ))}

        <View style={{ height: spacing.xxl + 60 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        label={children.length === 0 ? undefined : 'Add Child'}
        onPress={() => navigation.navigate('AddChild')}
        color="#FFFFFF"
      />
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
    padding: spacing.md,
    marginTop: -20,
  },
  emptyCard: {
    marginTop: spacing.xl,
    borderRadius: 16,
    ...shadows.medium,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    lineHeight: 24,
  },
  emptyButton: {
    borderRadius: 25,
    paddingHorizontal: spacing.lg,
  },
  childCard: {
    marginBottom: spacing.lg,
    borderRadius: 16,
    ...shadows.medium,
  },
  cardContent: {
    padding: spacing.md,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: spacing.xs,
  },
  childAge: {
    fontSize: 14,
    color: '#999',
    marginBottom: spacing.xs,
  },
  genderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  genderText: {
    fontSize: 12,
    color: theme.colors.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginBottom: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  generateButton: {
    borderRadius: 20,
    borderColor: theme.colors.primary,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: theme.colors.tertiary,
    borderRadius: 28,
  },
});
