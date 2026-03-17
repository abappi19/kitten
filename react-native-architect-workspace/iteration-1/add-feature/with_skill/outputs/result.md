# Add Notifications Feature (with skill)

**Prompt:** Add a notifications feature to my React Native project. It should have a notifications list screen and a notification detail screen.

---

## Files to create

```
src/features/notifications/
├── api/
│   └── useNotifications.ts
├── components/
│   └── NotificationItem.tsx
├── hooks/
├── screens/
│   ├── NotificationsScreen.tsx
│   └── NotificationDetailScreen.tsx
├── store/
│   └── notificationsStore.ts
└── types.ts
```

---

## `src/features/notifications/types.ts`
```ts
export interface Notification {
  id: string
  title: string
  body: string
  read: boolean
  createdAt: string
}
```

---

## `src/features/notifications/store/notificationsStore.ts`
```ts
import { create } from 'zustand'

interface NotificationsState {
  unreadCount: number
  setUnreadCount: (count: number) => void
  markRead: (id: string) => void
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  markRead: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
}))
```

---

## `src/features/notifications/api/useNotifications.ts`
```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../services/api'
import type { Notification } from '../types'

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications'),
  })
}

export function useNotification(id: string) {
  return useQuery<Notification>({
    queryKey: ['notifications', id],
    queryFn: () => api.get(`/notifications/${id}`),
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}
```

---

## `src/features/notifications/screens/NotificationsScreen.tsx`
```tsx
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/types'
import { useNotifications } from '../api/useNotifications'
import { NotificationItem } from '../components/NotificationItem'

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>

export function NotificationsScreen({ navigation }: Props) {
  const { data: notifications, isLoading } = useNotifications()

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => navigation.navigate('NotificationDetail', { id: item.id })}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No notifications</Text>}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
})
```

---

## `src/features/notifications/screens/NotificationDetailScreen.tsx`
```tsx
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/types'
import { useNotification, useMarkNotificationRead } from '../api/useNotifications'
import { useEffect } from 'react'

type Props = NativeStackScreenProps<RootStackParamList, 'NotificationDetail'>

export function NotificationDetailScreen({ route }: Props) {
  const { id } = route.params
  const { data: notification, isLoading } = useNotification(id)
  const { mutate: markRead } = useMarkNotificationRead()

  useEffect(() => {
    if (notification && !notification.read) {
      markRead(id)
    }
  }, [notification])

  if (isLoading || !notification) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.date}>{new Date(notification.createdAt).toLocaleDateString()}</Text>
        <Text style={styles.body}>{notification.body}</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 24 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  date: { fontSize: 13, color: '#999', marginBottom: 16 },
  body: { fontSize: 16, lineHeight: 24, color: '#333' },
})
```

---

## `src/features/notifications/components/NotificationItem.tsx`
```tsx
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native'
import type { Notification } from '../types'

interface Props {
  notification: Notification
  onPress: () => void
}

export function NotificationItem({ notification, onPress }: Props) {
  return (
    <TouchableOpacity style={[styles.container, !notification.read && styles.unread]} onPress={onPress}>
      <Text style={styles.title}>{notification.title}</Text>
      <Text style={styles.body} numberOfLines={2}>{notification.body}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  unread: { backgroundColor: '#f0f4ff' },
  title: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  body: { fontSize: 14, color: '#666' },
})
```

---

## Navigator registration

Add to `src/navigation/types.ts`:
```ts
export type RootStackParamList = {
  // ... existing routes ...
  Notifications: undefined
  NotificationDetail: { id: string }
}
```

Add to `src/navigation/RootNavigator.tsx`:
```tsx
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen'
import { NotificationDetailScreen } from '../features/notifications/screens/NotificationDetailScreen'

// Inside Stack.Navigator:
<Stack.Screen name="Notifications" component={NotificationsScreen} />
<Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
```

---

## Summary

**Files created:** 7 files

- `types.ts` — Notification interface
- `store/notificationsStore.ts` — Zustand store for unread count
- `api/useNotifications.ts` — React Query hooks (list, detail, markRead)
- `screens/NotificationsScreen.tsx` — FlatList with tap-to-detail
- `screens/NotificationDetailScreen.tsx` — Detail + auto-mark-read on open
- `components/NotificationItem.tsx` — List row component
- Navigator routes registered in `RootNavigator.tsx` and `types.ts`
