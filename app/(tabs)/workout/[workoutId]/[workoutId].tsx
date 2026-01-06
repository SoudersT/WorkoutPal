import { auth, db } from "@/firebase";
import { router, useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
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

type Exercise = {
  id: string;
  name: string;
  createdAt?: any;
};

export default function WorkoutDetail() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const uid = auth.currentUser?.uid;

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const exercisesCol = useMemo(() => {
    if (!uid || !workoutId) return null;
    return collection(db, "users", uid, "workouts", workoutId, "exercises");
  }, [uid, workoutId]);

  useEffect(() => {
    if (!exercisesCol) return;

    const q = query(exercisesCol, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: Exercise[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setExercises(rows);
        setLoading(false);
      },
      (err) => {
        console.log("exercise snapshot error:", err);
        setLoading(false);
        Alert.alert("Error", err?.message ?? "Failed to load exercises");
      }
    );

    return unsub;
  }, [exercisesCol]);

  const addExercise = async () => {
    if (!exercisesCol) return;
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert("Exercise name required", "Enter an exercise like Bench Press.");
      return;
    }

    setSaving(true);
    try {
      await addDoc(exercisesCol, {
        name: trimmed,
        createdAt: serverTimestamp(),
      });
      setName("");
    } catch (err: any) {
      console.log("add exercise error:", err);
      Alert.alert("Error", err?.message ?? "Failed to add exercise");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (exerciseId: string, exerciseName: string) => {
    Alert.alert(
      "Delete exercise?",
      `Remove "${exerciseName}" from this workout?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!uid || !workoutId) return;
            try {
              await deleteDoc(
                doc(db, "users", uid, "workouts", workoutId, "exercises", exerciseId)
              );
            } catch (err: any) {
              console.log("delete exercise error:", err);
              Alert.alert("Error", err?.message ?? "Failed to delete exercise");
            }
          },
        },
      ]
    );
  };

  if (!uid || !workoutId) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Invalid workout.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 56 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
        Exercises
      </Text>

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Add exercise (e.g., Bench Press)"
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
          onPress={addExercise}
          disabled={saving}
          style={{
            backgroundColor: "#111",
            paddingHorizontal: 14,
            justifyContent: "center",
            borderRadius: 12,
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? (
            <ActivityIndicator />
          ) : (
            <Text style={{ color: "white", fontWeight: "700" }}>Add</Text>
          )}
        </Pressable>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
  data={exercises}
  keyExtractor={(item) => item.id}
  ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
  renderItem={({ item }) => (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/workout/[workoutId]/exercise/[exerciseId]",
          params: {
            workoutId,
            exerciseId: item.id,
  },
})
      }
      onLongPress={() => confirmDelete(item.id, item.name)}
      style={{
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 14,
        padding: 14,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "700" }}>
        {item.name}
      </Text>
      <Text style={{ marginTop: 4, color: "#555" }}>
        Tap to log sets • Long-press to delete
      </Text>
    </Pressable>
  )}
/>
      )}
    </View>
  );
}
