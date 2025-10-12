import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../type'; 

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function resetToLogin() {
    if (navigationRef.isReady()) {
        navigationRef.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    } else {
        console.log("Navigation not ready yet");
    }
}
