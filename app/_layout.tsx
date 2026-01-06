import { auth } from "@/firebase";
import { useRouter, useSegments } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";


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

  const firstSegment = segments[0];

  const inAuthRoute =
    firstSegment === "login" || firstSegment === "register";

  if (!user && !inAuthRoute) {
    router.replace("/login");
    return;
  }

  if (user && inAuthRoute) {
    router.replace("/");
    return;
  }
}, [user, loading, segments, router]);
}