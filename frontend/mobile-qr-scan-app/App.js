import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Animated,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";

// Backend URL resolution:
// - If EXPO_PUBLIC_BACKEND_URL is provided, use it
// - Else, when running in Expo Go, derive LAN IP from hostUri (works on iPhone)
// - Fallback to Android emulator loopback (10.0.2.2)
const deriveLanBackendUrl = () => {
  const hostUri =
    Constants?.expoConfig?.hostUri || Constants?.expoConfig?.bundleUrl || "";
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
  const [showResultModal, setShowResultModal] = useState(false);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const iconScaleAnim = useRef(new Animated.Value(0)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  // Animate modal when it appears
  useEffect(() => {
    if (showResultModal) {
      // Reset animations
      scaleAnim.setValue(0);
      iconScaleAnim.setValue(0);
      iconRotateAnim.setValue(0);

      // Start animations sequence
      Animated.parallel([
        // Modal container scale up
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        // Icon animations
        Animated.sequence([
          Animated.delay(100),
          Animated.parallel([
            Animated.spring(iconScaleAnim, {
              toValue: 1,
              tension: 100,
              friction: 5,
              useNativeDriver: true,
            }),
            Animated.spring(iconRotateAnim, {
              toValue: 1,
              tension: 50,
              friction: 8,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    }
  }, [showResultModal]);

  const fetchWithTimeout = async (resource, options = {}) => {
    const { timeout = 8000, ...rest } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(resource, {
        ...rest,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(id);
    }
  };

  const testConnection = async () => {
    try {
      setConnectionStatus("testing");
      // Try root first (may 404 but proves reachability)
      const resp = await fetchWithTimeout(`${BACKEND_URL}/`, {
        method: "GET",
        timeout: 4000,
      });
      setConnectionStatus(`Reachable (${resp.status})`);
    } catch (e) {
      setConnectionStatus(
        `Unreachable: ${e.name === "AbortError" ? "timeout" : e.message}`
      );
      Alert.alert("Backend not reachable", `${BACKEND_URL}\n\n${e.message}`);
    }
  };

  const testVerifyEndpoint = async () => {
    try {
      setVerifyStatus("testing");
      const start = Date.now();
      const resp = await fetchWithTimeout(`${BACKEND_URL}/api/qr/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ ping: true }),
        timeout: 12000,
      });
      const elapsed = Date.now() - start;
      let bodyText = "";
      try {
        bodyText = await resp.text();
      } catch (_) {}
      setVerifyStatus(`Status ${resp.status} in ${elapsed}ms`);
      Alert.alert(
        "/api/qr/verify",
        `HTTP ${resp.status}\n${bodyText?.slice(0, 400)}`
      );
    } catch (e) {
      setVerifyStatus(e.name === "AbortError" ? "timeout" : e.message);
      Alert.alert(
        "/api/qr/verify failed",
        e.name === "AbortError" ? "timeout/aborted" : e.message
      );
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
        setShowResultModal(true);
      } else {
        setResult({
          success: false,
          message: result.message,
        });
        setShowResultModal(true);
      }
    } catch (error) {
      console.error("Error verifying QR code:", error);
      setResult({
        success: false,
        message: `Failed to verify QR code: ${error.message}`,
      });
      setShowResultModal(true);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setResult(null);
    setShowResultModal(false);
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
        <Text style={[styles.subtitle, { marginTop: 6 }]}>
          Server: {BACKEND_URL}
        </Text>
        <View style={{ marginTop: 8 }}>
          <Button
            title={
              connectionStatus ? `Test: ${connectionStatus}` : "Test Connection"
            }
            onPress={testConnection}
          />
        </View>
        <View style={{ marginTop: 8 }}>
          <Button
            title={verifyStatus ? `Verify: ${verifyStatus}` : "Verify Endpoint"}
            onPress={testVerifyEndpoint}
          />
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

      {/* Custom Result Modal */}
      <Modal
        visible={showResultModal}
        transparent={true}
        animationType="fade"
        onRequestClose={resetScanner}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {result?.success ? (
              // Success Modal Content
              <>
                <View style={styles.modalIconContainer}>
                  <Animated.View
                    style={[
                      styles.successIcon,
                      {
                        transform: [
                          { scale: iconScaleAnim },
                          {
                            rotate: iconRotateAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ["-180deg", "0deg"],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.iconText}>✓</Text>
                  </Animated.View>
                </View>
                <Text style={styles.modalTitle}>Verification Successful!</Text>
                <Text style={styles.modalMessage}>{result.message}</Text>

                {result.reservation && (
                  <View style={styles.modalDetailsContainer}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Reservation ID:</Text>
                      <Text style={styles.detailValue}>
                        #{result.reservation.reservationId}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Vehicle:</Text>
                      <Text style={styles.detailValue}>
                        {result.vehicleName ?? "Unknown"}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Customer:</Text>
                      <Text style={styles.detailValue}>
                        {result.userName ?? "Unknown"}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status:</Text>
                      <Text
                        style={[styles.detailValue, styles.statusConfirmed]}
                      >
                        {result.reservation.status}
                      </Text>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.modalButtonSuccess}
                  onPress={resetScanner}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalButtonText}>
                    Scan Another QR Code
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              // Failure Modal Content
              <>
                <View style={styles.modalIconContainer}>
                  <Animated.View
                    style={[
                      styles.errorIcon,
                      {
                        transform: [
                          { scale: iconScaleAnim },
                          {
                            rotate: iconRotateAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ["180deg", "0deg"],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.iconText}>✕</Text>
                  </Animated.View>
                </View>
                <Text style={styles.modalTitle}>Verification Failed</Text>
                <Text style={styles.modalMessage}>
                  {result?.message || "An error occurred"}
                </Text>

                <TouchableOpacity
                  style={styles.modalButtonError}
                  onPress={resetScanner}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalButtonText}>Try Again</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
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
  // Custom Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconContainer: {
    marginBottom: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  iconText: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  modalDetailsContainer: {
    width: "100%",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "bold",
  },
  statusConfirmed: {
    color: "#10b981",
    textTransform: "uppercase",
  },
  modalButtonSuccess: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalButtonError: {
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
