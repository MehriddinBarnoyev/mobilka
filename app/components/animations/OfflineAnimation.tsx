import { MotiView } from 'moti'
import Icon from 'react-native-vector-icons/Ionicons'
import { View } from 'react-native'

export const OfflineAnimation = () => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <MotiView
        from={{ opacity: 0.5, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1.1 }}
        transition={{
          type: 'timing',
          duration: 1000,
          loop: true,
        }}
      >
        <Icon name="cloud-offline" size={60} color="#fff" />
      </MotiView>
    </View>
  )
}
