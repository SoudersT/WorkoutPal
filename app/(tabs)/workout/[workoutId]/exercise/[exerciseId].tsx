import { auth, db } from "@/firebase";
import { useLocalSearchParams } from "expo-router";
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

type SetEntry = {
  id: string;
  weight: number;
  reps: number;
  createdAt?: any;
};

export default function ExerciseSets() {
  const { workoutId, exerciseId } = useLocalSearchParams<{
    workoutId: string;
    exerciseId: string;
  }>();

  const uid = auth.currentUser?.uid;

  const [sets, setSets] = useState<SetEntry[]>([]);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const setsCol = useMemo(() => {
    if (!uid || !workoutId || !exerciseId) return null;
    return collection(
      db,
      "users",
      uid,
      "workouts",
      workoutId,
      "exercises",
      exerciseId,
      "sets"
    );
  }, [uid, workoutId, exerciseId]);

  useEffect(() => {
    if (!setsCol) return;

    const q = query(setsCol, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: SetEntry[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setSets(rows);
        setLoading(false);
      },
      (err) => {
        console.log("sets snapshot error:", err);
        setLoading(false);
        Alert.alert("Error", err?.message ?? "Failed to load sets");
      }
    );

    return unsub;
  }, [setsCol]);

  const addSet = async () => {
    if (!setsCol) return;

    const w = Number(weight);
    const r = Number(reps);

    if (!w || !r) {
      Alert.alert("Invalid input", "Enter both weight and reps.");
      return;
    }

    setSaving(true);
    try {
      await addDoc(setsCol, {
        weight: w,
        reps: r,
        createdAt: serverTimestamp(),
      });
      setWeight("");
      setReps("");
    } catch (err: any) {
      console.log("add set error:", err);
      Alert.alert("Error", err?.message ?? "Failed to add set");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (setId: string) => {
    Alert.alert("Delete set?", "Remove this set?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!uid || !workoutId || !exerciseId) return;
          try {
            await deleteDoc(
              doc(
                db,
                "users",
                uid,
                "workouts",
                workoutId,
                "exercises",
                exerciseId,
                "sets",
                setId
              )
            );
          } catch (err: any) {
            console.log("delete set error:", err);
            Alert.alert("Error", err?.message ?? "Failed to delete set");
          }
        },
      },
    ]);
  };

  if (!uid) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>You are not logged in.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 56 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
        Sets
      </Text>

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
        <TextInput
          value={weight}
          onChangeText={setWeight}
          placeholder="Weight"
          keyboardType="numeric"
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        />
        <TextInput
          value={reps}
          onChangeText={setReps}
          placeholder="Reps"
          keyboardType="numeric"
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
          onPress={addSet}
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
          data={sets}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <Pressable
              onLongPress={() => confirmDelete(item.id)}
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 14,
                padding: 14,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700" }}>
                {item.weight} × {item.reps}
              </Text>
              <Text style={{ color: "#555" }}>Long-press</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={{ color: "#555", marginTop: 16 }}>
              No sets yet. Log your first one.
            </Text>
          }
        />
      )}
    </View>
  );
}
