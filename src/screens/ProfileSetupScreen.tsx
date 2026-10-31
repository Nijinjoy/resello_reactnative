import { ComponentRef, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Camera, ImageIcon, Trash2, UserRound } from 'lucide-react-native';
import {
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
  type CameraOptions,
} from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActionSheet, { ActionSheetOption } from '../components/ActionSheet';
import Button from '../components/Button';
import Input from '../components/Input';
import type { RootStackScreenProps } from '../navigation/types';
import { saveProfile } from '../services/authService';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PICKER_OPTIONS: CameraOptions = {
  mediaType: 'photo',
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.8,
};

type Errors = { fullName?: string; email?: string };

function validate(fullName: string, email: string): Errors {
  const errors: Errors = {};
  if (fullName.length < 2) {
    errors.fullName = 'Please enter your full name';
  }
  if (!email) {
    errors.email = 'Please enter your email';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Please enter a valid email';
  }
  return errors;
}

function ProfileSetupScreen({
  navigation,
}: RootStackScreenProps<'ProfileSetup'>) {
  const insets = useSafeAreaInsets();
  const emailRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [photoUri, setPhotoUri] = useState<string>();
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);

  const handlePicked = ({ assets, errorMessage }: ImagePickerResponse) => {
    if (errorMessage) {
      Alert.alert('Could not load photo', errorMessage);
      return;
    }
    const uri = assets?.[0]?.uri;
    if (uri) {
      setPhotoUri(uri);
    }
  };

  const pickPhoto = () => {
    Keyboard.dismiss();
    setPhotoSheetOpen(true);
  };

  const photoOptions: ActionSheetOption[] = [
    {
      label: 'Take photo',
      Icon: Camera,
      onPress: () => launchCamera(PICKER_OPTIONS).then(handlePicked),
    },
    {
      label: 'Choose from library',
      Icon: ImageIcon,
      onPress: () =>
        launchImageLibrary({ ...PICKER_OPTIONS, selectionLimit: 1 }).then(
          handlePicked,
        ),
    },
    ...(photoUri
      ? [
          {
            label: 'Remove photo',
            Icon: Trash2,
            destructive: true,
            onPress: () => setPhotoUri(undefined),
          },
        ]
      : []),
  ];

  const submit = async () => {
    const name = fullName.trim();
    const mail = email.trim().toLowerCase();
    const nextErrors = validate(name, mail);
    setErrors(nextErrors);
    if (nextErrors.fullName || nextErrors.email) {
      return;
    }
    Keyboard.dismiss();
    setSaving(true);
    try {
      await saveProfile({ fullName: name, email: mail, photoUri });
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e) {
      Alert.alert(
        'Could not save profile',
        e instanceof Error ? e.message : 'Please try again.',
      );
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Set up your profile</Text>
        <Text style={styles.subtitle}>
          Tell buyers and sellers who they're dealing with.
        </Text>

        <View style={styles.avatarWrap}>
          <Pressable
            onPress={pickPhoto}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel={
              photoUri ? 'Change profile photo' : 'Add profile photo'
            }
            style={styles.avatar}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImage} />
            ) : (
              <UserRound color={colors.primary} size={44} strokeWidth={1.8} />
            )}
            <View style={styles.cameraBadge}>
              <Camera color={colors.onPrimary} size={16} strokeWidth={2.2} />
            </View>
          </Pressable>
          <Text style={styles.avatarHint}>
            {photoUri ? 'Tap to change photo' : 'Add a photo (optional)'}
          </Text>
        </View>

        <Input
          label="Full name"
          value={fullName}
          onChangeText={text => {
            setFullName(text);
            setErrors(prev => ({ ...prev, fullName: undefined }));
          }}
          error={errors.fullName}
          placeholder="e.g. Sara Ahmed"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          editable={!saving}
          style={styles.field}
        />

        <Input
          ref={emailRef}
          label="Email"
          value={email}
          onChangeText={text => {
            setEmail(text);
            setErrors(prev => ({ ...prev, email: undefined }));
          }}
          error={errors.email}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="done"
          onSubmitEditing={submit}
          editable={!saving}
          style={styles.field}
        />

        <Button
          title="Continue"
          onPress={submit}
          loading={saving}
          style={styles.button}
        />
      </ScrollView>

      <ActionSheet
        visible={photoSheetOpen}
        onClose={() => setPhotoSheetOpen(false)}
        title="Profile photo"
        message="Help people recognise you when buying and selling."
        options={photoOptions}
      />
    </KeyboardAvoidingView>
  );
}

const AVATAR_SIZE = 108;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: colors.title,
  },
  subtitle: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.body,
  },
  avatarWrap: {
    marginTop: 32,
    marginBottom: 12,
    alignItems: 'center',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR_SIZE / 2,
  },
  cameraBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
  },
  avatarHint: {
    marginTop: 10,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.body,
  },
  field: {
    marginTop: 20,
  },
  button: {
    marginTop: 32,
  },
});

export default ProfileSetupScreen;
