import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { Text, View } from "react-native";

export default function Profile() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>
        {auth.currentUser?.email}
      </Text>
      <Text onPress={() => signOut(auth)} style={{ color: "red" }}>
        Sign out
      </Text>
    </View>
  );
}
