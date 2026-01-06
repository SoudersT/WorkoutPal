import { auth } from "@/firebase";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export default function Index() {
  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Welcome to my workout tracking app!</Text>
      <Text>{auth.currentUser?.email}</Text>

      <Pressable
        onPress={() => router.push("/workout")}
        style={{ backgroundColor: "#111", padding: 14, borderRadius: 12, width: "100%", maxWidth: 260, alignItems: "center" }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>My Workouts</Text>
      </Pressable>

      <Pressable
        onPress={onLogout}
        disabled={loading}
        style={{ backgroundColor: "#333", padding: 14, borderRadius: 12, width: "100%", maxWidth: 260, alignItems: "center", opacity: loading ? 0.7 : 1 }}
      >
        {loading ? <ActivityIndicator /> : <Text style={{ color: "white", fontWeight: "700" }}>Sign out</Text>}
      </Pressable>
    </View>
  );
}
