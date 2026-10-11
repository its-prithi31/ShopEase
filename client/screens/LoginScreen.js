import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      // Navigation will automatically update based on auth state
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill buttons for testing/interview demo convenience
  const fillDemoUser = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="cart" size={36} color="#2563EB" />
          </View>
          <Text style={styles.appName}>ShopEase</Text>
          <Text style={styles.subtitle}>Welcome back! Sign in to continue</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. user@shopease.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#94A3B8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Demo Quick-Fill Buttons */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Quick Demo Credentials:</Text>
            <View style={styles.demoButtonsRow}>
              <TouchableOpacity
                style={styles.demoBtn}
                onPress={() => fillDemoUser('user@shopease.com', 'user123')}
              >
                <Text style={styles.demoBtnText}>Fill Customer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.demoBtn, styles.demoAdminBtn]}
                onPress={() => fillDemoUser('admin@shopease.com', 'admin123')}
              >
                <Text style={[styles.demoBtnText, styles.demoAdminBtnText]}>Fill Admin</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Switch to Signup */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.footerLink}>Create One</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  eyeIcon: {
    padding: 6,
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  demoSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
    textAlign: 'center',
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  demoAdminBtn: {
    backgroundColor: '#FEF3C7',
  },
  demoAdminBtnText: {
    color: '#92400E',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
});

export default LoginScreen;
