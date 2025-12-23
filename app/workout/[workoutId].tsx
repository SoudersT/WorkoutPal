import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function WorkoutDetail() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 56 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 10 }}>
        Workout Detail
      </Text>
      <Text>workoutId: {workoutId}</Text>
      <Text style={{ marginTop: 12, color: "#555" }}>
        Next step: add exercises and log sets here.
      </Text>
    </View>
  );
}
