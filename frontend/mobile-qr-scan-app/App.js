import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import { StatusBar } from "expo-status-bar";

// Update this to your backend URL
const BACKEND_URL = "http://localhost:5000"; // Change this to your actual backend URL

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);
    console.log(`QR code scanned: ${data}`);

    try {
      // Parse the QR code data
      let qrData;
      try {
        qrData = JSON.parse(data);
      } catch (e) {
        Alert.alert("Error", "Invalid QR code format");
        setScanned(false);
        setLoading(false);
        return;
      }

      // Send to backend for verification
      const response = await fetch(`${BACKEND_URL}/api/qr/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrCodeData: data,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setResult({
          success: true,
          message: result.message,
          reservation: result.reservation,
        });
        Alert.alert(
          "Success! ✅",
          `${result.message}\n\nReservation #${result.reservation?.reservationId}\nVehicle: ${result.reservation?.vehicleName}\nCustomer: ${result.reservation?.userName}`,
          [{ text: "OK", onPress: () => resetScanner() }]
        );
      } else {
        setResult({
          success: false,
          message: result.message,
        });
        Alert.alert("Verification Failed ❌", result.message, [
          { text: "Try Again", onPress: () => resetScanner() },
        ]);
      }
    } catch (error) {
      console.error("Error verifying QR code:", error);
      Alert.alert("Error", `Failed to verify QR code: ${error.message}`, [
        { text: "Try Again", onPress: () => resetScanner() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setResult(null);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
        <Button
          title="Grant Permission"
          onPress={() => Camera.requestCameraPermissionsAsync()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.title}>EV Rental QR Scanner</Text>
        <Text style={styles.subtitle}>
          Scan reservation QR code to confirm pickup
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          style={styles.camera}
        />

        {loading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.overlayText}>Verifying...</Text>
          </View>
        )}

        {scanned && !loading && (
          <View style={styles.overlay}>
            <View style={styles.resultContainer}>
              <Text
                style={[
                  styles.resultText,
                  result?.success ? styles.successText : styles.errorText,
                ]}
              >
                {result?.success ? "✅ Success!" : "❌ Failed"}
              </Text>
              <Text style={styles.resultMessage}>{result?.message}</Text>
              {result?.reservation && (
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailText}>
                    Reservation #{result.reservation.reservationId}
                  </Text>
                  <Text style={styles.detailText}>
                    Vehicle: {result.reservation.vehicleName}
                  </Text>
                  <Text style={styles.detailText}>
                    Customer: {result.reservation.userName}
                  </Text>
                  <Text style={styles.detailText}>
                    Status: {result.reservation.status}
                  </Text>
                </View>
              )}
              <TouchableOpacity style={styles.button} onPress={resetScanner}>
                <Text style={styles.buttonText}>Scan Another</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.scanArea}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
      </View>

      {!scanned && !loading && (
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Position the QR code within the frame
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#667eea",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#e0e0e0",
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  scanArea: {
    position: "absolute",
    top: "25%",
    left: "10%",
    right: "10%",
    height: "40%",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#667eea",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  overlayText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 10,
  },
  resultContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 30,
    alignItems: "center",
    maxWidth: "90%",
  },
  resultText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  successText: {
    color: "#10b981",
  },
  errorText: {
    color: "#ef4444",
  },
  resultMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  detailsContainer: {
    width: "100%",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#667eea",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  instructions: {
    padding: 20,
    backgroundColor: "#2a2a2a",
  },
  instructionText: {
    color: "#e0e0e0",
    textAlign: "center",
    fontSize: 14,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
});
