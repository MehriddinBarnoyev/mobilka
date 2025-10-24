import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import {
  Home as HomeIcon,
  Search as SearchIcon,
  User as UserIcon,
  Download as DownloadIcon,
} from "lucide-react-native"
import { Platform, useWindowDimensions } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import MyDownloadsScreen from "../../screens/MyDownloadsScreen"
import { useNetwork } from "../../../hooks/NetworkProvider"
import Home from '../home/page';
import SearchScreen from '../search/page';
import AccountScreen from '../accaunt/page';
const Tab = createBottomTabNavigator()

export default function MainScreen() {
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const { isConnected , isInternetReachable} = useNetwork();
  console.log('Tarmoq:', isConnected, 'Internet:', isInternetReachable);


  const baseHeight = height < 700 ? (Platform.OS === "android" ? 55 : 70) : Platform.OS === "android" ? 65 : 85

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: baseHeight + insets.bottom,
        },
        tabBarIcon: ({ color, size }) => {
          const iconProps = { color, size }

          if (route.name === "HomeScreen") return <HomeIcon {...iconProps} />
          if (route.name === "Search") return <SearchIcon {...iconProps} />
          if (route.name === "Account") return <UserIcon {...iconProps} />
          if (route.name === "MyDownloads") return <DownloadIcon {...iconProps} />
        },
      })}
    >
      {!isConnected || !isInternetReachable ? (
        <><Tab.Screen name="MyDownloads" component={MyDownloadsScreen} />
          <Tab.Screen name="HomeScreen" component={Home} />
        </>
      ) : <>
        <Tab.Screen name="HomeScreen" component={Home} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Account" component={AccountScreen} /></>}

    </Tab.Navigator>
  )
}
