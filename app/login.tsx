import { auth } from "@/firebase";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // _layout will redirect to "/"
    } catch (e: any) {
      setError(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>Log in</Text>

      <Text style={{ marginBottom: 6 }}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@email.com"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 10,
          padding: 12,
          marginBottom: 12,
        }}
      />

      <Text style={{ marginBottom: 6 }}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Password"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 10,
          padding: 12,
          marginBottom: 12,
        }}
      />

      {error ? <Text style={{ color: "red", marginBottom: 12 }}>{error}</Text> : null}

      <Pressable
        onPress={onLogin}
        disabled={loading}
        style={{
          backgroundColor: "#111",
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
          opacity: loading ? 0.7 : 1,
          marginBottom: 12,
        }}
      >
        {loading ? <ActivityIndicator /> : <Text style={{ color: "white", fontWeight: "700" }}>Log in</Text>}
      </Pressable>

      <Pressable onPress={() => router.push("/register")} style={{ alignItems: "center" }}>
        <Text>Create an account</Text>
      </Pressable>
    </View>
  );
}
