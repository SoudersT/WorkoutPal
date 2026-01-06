import { auth, db } from "@/firebase";
import { router } from "expo-router";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type Workout = {
  id: string;
  name: string;
  createdAt?: any;
};

export default function WorkoutsScreen() {
  const uid = auth.currentUser?.uid;
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  const workoutsCol = useMemo(() => {
    if (!uid) return null;
    return collection(db, "users", uid, "workouts");
  }, [uid]);

  useEffect(() => {
    if (!workoutsCol) return;

    const q = query(workoutsCol, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: Workout[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setWorkouts(rows);
        setLoadingList(false);
      },
      (err) => {
        console.log("workouts snapshot error:", err);
        setLoadingList(false);
        Alert.alert("Error", err?.message ?? "Failed to load workouts");
      }
    );

    return unsub;
  }, [workoutsCol]);

  const createWorkout = async () => {
    if (!uid || !workoutsCol) return;
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert("Workout name required", "Enter a name like Push, Pull, Legs, Upper, Lower.");
      return;
    }

    setSaving(true);
    try {
      const ref = await addDoc(workoutsCol, {
        name: trimmed,
        createdAt: serverTimestamp(),
      });
      setName("");
      // Go to detail page (we'll build it next)
    router.push({
        pathname: "/workout/[workoutId]/[workoutId]",
        params: { workoutId: ref.id },
});
    } catch (err: any) {
      console.log("create workout error:", err);
      Alert.alert("Error", err?.message ?? "Failed to create workout");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (workoutId: string, workoutName: string) => {
    Alert.alert(
      "Delete workout?",
      `This will delete "${workoutName}".`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!uid) return;
            try {
              await deleteDoc(doc(db, "users", uid, "workouts", workoutId));
            } catch (err: any) {
              console.log("delete workout error:", err);
              Alert.alert("Error", err?.message ?? "Failed to delete workout");
            }
          },
        },
      ]
    );
  };

  if (!uid) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text>You are not logged in.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 56 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>Workouts</Text>

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="New workout (e.g., Push Day)"
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        />
        <Pressable
          onPress={createWorkout}
          disabled={saving}
          style={{
            backgroundColor: "#111",
            paddingHorizontal: 14,
            justifyContent: "center",
            borderRadius: 12,
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? <ActivityIndicator /> : <Text style={{ color: "white", fontWeight: "700" }}>Add</Text>}
        </Pressable>
      </View>

      {loadingList ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({
                pathname: "/workout/[workoutId]/[workoutId]",
                params: { workoutId: item.id },
            })}
              onLongPress={() => confirmDelete(item.id, item.name)}
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 14,
                padding: 14,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700" }}>{item.name}</Text>
              <Text style={{ marginTop: 4, color: "#555" }}>
                Long-press to delete
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={{ color: "#555", marginTop: 16 }}>
              No workouts yet. Add “Push”, “Pull”, or “Legs” to start.
            </Text>
          }
        />
      )}
    </View>
  );
}
