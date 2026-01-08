import { auth } from "@/firebase";
import { Stack, useRouter, useSegments } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (loading) return;

    const first = segments?.[0] ?? ""; // "", "login", "register", "(tabs)", etc.

    // If your auth screens are at /login and /register (root-level)
    const inAuthRoute = first === "login" || first === "register";

    // If your logged-in app lives in a route group like /(tabs)
    const inAppRoute = first === "(tabs)";

    if (!user && !inAuthRoute) {
      router.replace("/login");
      return;
    }

    if (user && (inAuthRoute || !inAppRoute)) {
      router.replace("/(tabs)");
      return;
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
