# Add Notifications Feature (baseline, no skill)

**Prompt:** Add a notifications feature to my React Native project. It should have a notifications list screen and a notification detail screen.

---

Here's how I'd add a notifications feature:

## 1. Create the screens

### `screens/NotificationListScreen.tsx`
```tsx
import React, { useEffect, useState } from 'react'
import { View, FlatList, Text, TouchableOpacity } from 'react-native'

export default function NotificationListScreen({ navigation }) {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    fetch('https://your-api.com/notifications')
      .then(res => res.json())
      .then(setNotifications)
  }, [])

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('NotificationDetail', { id: item.id })}>
            <Text>{item.title}</Text>
            <Text>{item.body}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}
```

### `screens/NotificationDetailScreen.tsx`
```tsx
import React, { useEffect, useState } from 'react'
import { View, Text } from 'react-native'

export default function NotificationDetailScreen({ route }) {
  const { id } = route.params
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    fetch(`https://your-api.com/notifications/${id}`)
      .then(res => res.json())
      .then(setNotification)
  }, [id])

  if (!notification) return <Text>Loading...</Text>

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{notification.title}</Text>
      <Text>{notification.body}</Text>
    </View>
  )
}
```

## 2. Add to navigation

```tsx
<Stack.Screen name="NotificationList" component={NotificationListScreen} />
<Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
```

## 3. That's it!

Navigate to `NotificationList` from wherever you want to show notifications in your app.
