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
import Constants from "expo-constants";

// Backend URL resolution:
// - If EXPO_PUBLIC_BACKEND_URL is provided, use it
// - Else, when running in Expo Go, derive LAN IP from hostUri (works on iPhone)
// - Fallback to Android emulator loopback (10.0.2.2)
const deriveLanBackendUrl = () => {
  const hostUri = Constants?.expoConfig?.hostUri || Constants?.expoConfig?.bundleUrl || "";
  // In some SDKs hostUri may be like "192.168.1.23:19000" or "exp://192.168.1.23:19000"
  let hostname = null;
  if (typeof hostUri === "string" && hostUri.length > 0) {
    try {
      // Try URL parsing first
      const maybeUrl = hostUri.includes("://") ? hostUri : `exp://${hostUri}`;
      const url = new URL(maybeUrl);
      hostname = url.hostname;
    } catch (_) {
      // Fallback simple split
      hostname = hostUri.replace(/^exp:\/\//, "").split(":")[0];
    }
  }
  return hostname ? `http://${hostname}:5000` : "http://10.0.2.2:5000";
};

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || deriveLanBackendUrl();

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState(null);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const fetchWithTimeout = async (resource, options = {}) => {
    const { timeout = 8000, ...rest } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(resource, { ...rest, signal: controller.signal });
      return response;
    } finally {
      clearTimeout(id);
    }
  };

  const testConnection = async () => {
    try {
      setConnectionStatus("testing");
      // Try root first (may 404 but proves reachability)
      const resp = await fetchWithTimeout(`${BACKEND_URL}/`, { method: "GET", timeout: 4000 });
      setConnectionStatus(`Reachable (${resp.status})`);
    } catch (e) {
      setConnectionStatus(`Unreachable: ${e.name === "AbortError" ? "timeout" : e.message}`);
      Alert.alert("Backend not reachable", `${BACKEND_URL}\n\n${e.message}`);
    }
  };

  const testVerifyEndpoint = async () => {
    try {
      setVerifyStatus("testing");
      const start = Date.now();
      const resp = await fetchWithTimeout(`${BACKEND_URL}/api/qr/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ping: true }),
        timeout: 12000,
      });
      const elapsed = Date.now() - start;
      let bodyText = "";
      try {
        bodyText = await resp.text();
      } catch (_) {}
      setVerifyStatus(`Status ${resp.status} in ${elapsed}ms`);
      Alert.alert("/api/qr/verify", `HTTP ${resp.status}\n${bodyText?.slice(0, 400)}`);
    } catch (e) {
      setVerifyStatus(e.name === "AbortError" ? "timeout" : e.message);
      Alert.alert("/api/qr/verify failed", e.name === "AbortError" ? "timeout/aborted" : e.message);
    }
  };

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
      const response = await fetchWithTimeout(`${BACKEND_URL}/api/qr/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          qrCodeData: data,
        }),
        timeout: 15000,
      });

      let result;
      try {
        result = await response.json();
      } catch (_) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text?.slice(0, 200)}`);
      }

      if (result.success) {
        setResult({
          success: true,
          message: result.message,
          reservation: result.reservation,
          vehicleName: result.vehicleName,
          userName: result.userName,
        });
        Alert.alert(
          "Success! ✅",
          `${result.message}\n\nReservation #${result.reservation?.reservationId}\nVehicle: ${result.vehicleName ?? "Unknown"}\nCustomer: ${result.userName ?? "Unknown"}`,
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
        <Text style={[styles.subtitle, { marginTop: 6 }]}>Server: {BACKEND_URL}</Text>
        <View style={{ marginTop: 8 }}>
          <Button title={connectionStatus ? `Test: ${connectionStatus}` : "Test Connection"} onPress={testConnection} />
        </View>
        <View style={{ marginTop: 8 }}>
          <Button title={verifyStatus ? `Verify: ${verifyStatus}` : "Verify Endpoint"} onPress={testVerifyEndpoint} />
        </View>
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
                    Vehicle: {result.vehicleName}
                  </Text>
                  <Text style={styles.detailText}>
                    Customer: {result.userName}
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
