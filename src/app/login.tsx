import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/ctx/auth';

const palette = {
  ink: '#1c1c1e',
  label: '#38383d',
  secondary: '#85858d',
  placeholder: '#a0a0a8',
  field: '#f6f6f8',
  primary: '#ff7a1a',
};

export default function LoginScreen() {
  const { signIn } = useSession();
  const insets = useSafeAreaInsets();
  const passwordInput = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSignIn() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Use at least 8 characters for your demo password.');
      return;
    }
    Keyboard.dismiss();
    setError(null);
    setPassword('');
    signIn(email);
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.content,
            { paddingTop: Math.max(48, insets.top + 8), paddingBottom: Math.max(26, insets.bottom + 8) },
          ]}>
          <View style={styles.brand} accessibilityLabel="Recur" accessible>
            <Image source={require('@/assets/brand/recur-logo.svg')} style={styles.brandLogo} contentFit="contain" />
          </View>

          <View style={styles.intro}>
            <Text accessibilityRole="header" style={styles.title}>Welcome back.</Text>
            <Text style={styles.subtitle}>A clear view of your subscriptions.</Text>
          </View>

          <View style={styles.fields}>
            <View style={styles.field}>
              <Text nativeID="email-label" style={styles.label}>Email address</Text>
              <TextInput
                accessibilityLabel="Email address"
                accessibilityLabelledBy="email-label"
                value={email}
                onChangeText={(value) => { setEmail(value); setError(null); }}
                placeholder="you@example.com"
                placeholderTextColor={palette.placeholder}
                keyboardType="email-address"
                autoComplete="email"
                textContentType="username"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => passwordInput.current?.focus()}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                selectionColor={palette.primary}
                style={[styles.input, styles.emailInput, focusedField === 'email' && styles.focused]}
              />
            </View>

            <View style={styles.field}>
              <Text nativeID="password-label" style={styles.label}>Password</Text>
              <View style={[styles.passwordField, focusedField === 'password' && styles.focused]}>
                <TextInput
                  ref={passwordInput}
                  accessibilityLabel="Password"
                  accessibilityLabelledBy="password-label"
                  value={password}
                  onChangeText={(value) => { setPassword(value); setError(null); }}
                  placeholder="Enter your password"
                  placeholderTextColor={palette.placeholder}
                  secureTextEntry={!showPassword}
                  autoComplete="current-password"
                  textContentType="password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="go"
                  onSubmitEditing={handleSignIn}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  selectionColor={palette.primary}
                  style={[styles.input, styles.passwordInput]}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  accessibilityState={{ checked: showPassword }}
                  onPress={() => setShowPassword((value) => !value)}
                  style={({ pressed }) => [styles.passwordToggle, pressed && styles.pressed]}>
                  <Image source={require('@/assets/brand/login/eye.svg')} style={styles.eyeIcon} contentFit="contain" />
                  {showPassword ? <View pointerEvents="none" style={styles.eyeSlash} /> : null}
                </Pressable>
              </View>
            </View>
          </View>

          <Text style={styles.hint}>Demo only. Use a sample email and 8+ characters.</Text>
          {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            onPress={handleSignIn}
            style={({ pressed }) => [styles.signIn, pressed && styles.pressed]}>
            <Text style={styles.signInText}>Sign in</Text>
          </Pressable>

          <View style={styles.demoRow}>
            <Text style={styles.demoPrompt}>Just looking around?</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => { Keyboard.dismiss(); setPassword(''); signIn('demo@recur.app'); }}
              style={({ pressed }) => [styles.demoButton, pressed && styles.pressed]}>
              <Text style={styles.demoText}>Explore demo</Text>
              <Image source={require('@/assets/brand/login/chevron.svg')} style={styles.chevron} contentFit="contain" />
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Design prototype · No password is saved.</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  content: { flexGrow: 1, width: '100%', maxWidth: 390, paddingHorizontal: 30 },
  brand: { width: 101.477, height: 38.203, alignSelf: 'center' },
  brandLogo: { width: 101.477, height: 38.203 },
  intro: { alignItems: 'center', marginTop: 82, marginBottom: 34 },
  title: { fontFamily: 'RecurInter-Display', fontSize: 33, lineHeight: 38, letterSpacing: -1.15, color: palette.ink, textAlign: 'center', includeFontPadding: false },
  subtitle: { marginTop: 11, fontFamily: 'RecurInter-Regular', fontSize: 14, lineHeight: 22.4, color: palette.secondary, textAlign: 'center' },
  fields: { gap: 21 },
  field: { gap: 9 },
  label: { marginHorizontal: 2, fontFamily: 'RecurInter-Medium', fontSize: 12, lineHeight: 17, color: palette.label },
  input: { fontFamily: 'RecurInter-Regular', fontSize: 14, lineHeight: 20, color: palette.ink, height: 54, paddingHorizontal: 16, paddingVertical: 0, outlineWidth: 0 },
  emailInput: { borderRadius: 13, borderWidth: 1, borderColor: 'transparent', backgroundColor: palette.field },
  passwordField: { flexDirection: 'row', alignItems: 'center', height: 54, borderRadius: 13, borderWidth: 1, borderColor: 'transparent', backgroundColor: palette.field, paddingRight: 5 },
  passwordInput: { flex: 1, minWidth: 0, paddingRight: 5 },
  passwordToggle: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 9 },
  eyeIcon: { width: 19, height: 19 },
  eyeSlash: { position: 'absolute', width: 19, height: 1.5, backgroundColor: '#8e8e93', transform: [{ rotate: '-45deg' }] },
  focused: { borderColor: palette.primary },
  hint: { marginTop: 11, marginHorizontal: 2, fontFamily: 'RecurInter-Regular', fontSize: 10, lineHeight: 15, color: '#898991' },
  error: { marginTop: 8, fontFamily: 'RecurInter-Regular', fontSize: 12, lineHeight: 17, color: '#b42318' },
  signIn: { marginTop: 25, height: 52, borderRadius: 14, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' },
  signInText: { fontFamily: 'RecurInter-SemiBold', fontSize: 15, lineHeight: 21, letterSpacing: -0.15, color: '#ffffff' },
  pressed: { opacity: 0.7 },
  demoRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 22 },
  demoPrompt: { fontFamily: 'RecurInter-Regular', fontSize: 12, lineHeight: 17, color: '#92929a' },
  demoButton: { flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'center', minHeight: 44, paddingHorizontal: 4, borderRadius: 5 },
  demoText: { fontFamily: 'RecurInter-SemiBold', fontSize: 12, lineHeight: 17, color: palette.label },
  chevron: { width: 13, height: 13 },
  footer: { flexGrow: 1, justifyContent: 'flex-end', paddingTop: 44 },
  footerText: { fontFamily: 'RecurInter-Regular', fontSize: 10, lineHeight: 14, letterSpacing: 0.1, color: palette.placeholder, textAlign: 'center' },
});
