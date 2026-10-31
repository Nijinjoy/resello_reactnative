import { ComponentRef, ReactNode, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Camera, ImageIcon, ImagePlus, X } from 'lucide-react-native';
import {
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
  type CameraOptions,
} from 'react-native-image-picker';
import ActionSheet, { ActionSheetOption } from '../components/ActionSheet';
import Button from '../components/Button';
import Input from '../components/Input';
import { CATEGORIES, CATEGORY_ICONS } from '../data/categories';
import type { ListingCategory } from '../data/chats';
import type { Condition } from '../data/listings';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const MAX_PHOTOS = 6;
const PHOTO_SIZE = 96;
const CONDITIONS: Condition[] = ['New', 'Like new', 'Good', 'Fair'];

const PICKER_OPTIONS: CameraOptions = {
  mediaType: 'photo',
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.8,
};

type Field =
  | 'photos'
  | 'title'
  | 'category'
  | 'condition'
  | 'price'
  | 'location'
  | 'description';
type Errors = Partial<Record<Field, string>>;

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  children?: ReactNode;
};

function Chip({ label, selected, onPress, children }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {children}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

function SellScreen() {
  const wrapper = useRef<ComponentRef<typeof View>>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ListingCategory>();
  const [condition, setCondition] = useState<Condition>();
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const clearError = (field: Field) =>
    setErrors(current => ({ ...current, [field]: undefined }));

  const handlePicked = ({ assets, errorMessage }: ImagePickerResponse) => {
    if (errorMessage) {
      Alert.alert('Could not load photo', errorMessage);
      return;
    }
    const uris = (assets ?? []).flatMap(({ uri }) => (uri ? [uri] : []));
    if (uris.length > 0) {
      setPhotos(current => [...current, ...uris].slice(0, MAX_PHOTOS));
      clearError('photos');
    }
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
        launchImageLibrary({
          ...PICKER_OPTIONS,
          selectionLimit: MAX_PHOTOS - photos.length,
        }).then(handlePicked),
    },
  ];

  const submit = () => {
    const next: Errors = {};
    if (photos.length === 0) {
      next.photos = 'Add at least one photo';
    }
    if (title.trim().length < 3) {
      next.title = 'Enter a title for your item';
    }
    if (!category) {
      next.category = 'Choose a category';
    }
    if (!condition) {
      next.condition = 'Choose a condition';
    }
    if (!Number(price)) {
      next.price = 'Enter a price';
    }
    if (!location.trim()) {
      next.location = 'Enter a location';
    }
    if (!description.trim()) {
      next.description = 'Enter a description';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      return;
    }
    Keyboard.dismiss();
    Alert.alert(
      'Listing not posted',
      'Your details look good, but posting isn’t connected yet.',
    );
  };

  return (
    <View
      ref={wrapper}
      style={styles.container}
      onLayout={() =>
        wrapper.current?.measureInWindow((_x, y) => setKeyboardOffset(y))
      }
    >
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={keyboardOffset}
        style={styles.container}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.label}>
            Photos ({photos.length}/{MAX_PHOTOS})
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.photos}
            contentContainerStyle={styles.photosContent}
          >
            {photos.length < MAX_PHOTOS && (
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  setPhotoSheetOpen(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="Add photos"
                style={[styles.addPhoto, errors.photos && styles.addPhotoError]}
              >
                <ImagePlus color={colors.primary} size={26} />
                <Text style={styles.addPhotoText}>Add</Text>
              </Pressable>
            )}
            {photos.map((uri, index) => (
              <View key={`${uri}-${index}`} style={styles.photo}>
                <Image source={{ uri }} style={styles.photoImage} />
                {index === 0 && (
                  <View style={styles.cover}>
                    <Text style={styles.coverText}>Cover</Text>
                  </View>
                )}
                <Pressable
                  onPress={() =>
                    setPhotos(current => current.filter((_, i) => i !== index))
                  }
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove photo ${index + 1}`}
                  style={styles.removePhoto}
                >
                  <X color={colors.onPrimary} size={13} strokeWidth={3} />
                </Pressable>
              </View>
            ))}
          </ScrollView>
          {errors.photos && <Text style={styles.error}>{errors.photos}</Text>}

          <Input
            label="Title"
            value={title}
            onChangeText={value => {
              setTitle(value);
              clearError('title');
            }}
            placeholder="e.g. iPhone 15 Pro, 256GB"
            maxLength={80}
            error={errors.title}
            style={styles.field}
          />

          <Text style={[styles.label, styles.field]}>Category</Text>
          <View style={styles.chips}>
            {CATEGORIES.map(key => {
              const { label, Icon, tint } = CATEGORY_ICONS[key];
              const selected = key === category;
              return (
                <Chip
                  key={key}
                  label={label}
                  selected={selected}
                  onPress={() => {
                    setCategory(key);
                    clearError('category');
                  }}
                >
                  <Icon
                    color={selected ? colors.onPrimary : tint}
                    size={16}
                    strokeWidth={2.2}
                  />
                </Chip>
              );
            })}
          </View>
          {errors.category && (
            <Text style={styles.error}>{errors.category}</Text>
          )}

          <Text style={[styles.label, styles.field]}>Condition</Text>
          <View style={styles.chips}>
            {CONDITIONS.map(option => (
              <Chip
                key={option}
                label={option}
                selected={option === condition}
                onPress={() => {
                  setCondition(option);
                  clearError('condition');
                }}
              />
            ))}
          </View>
          {errors.condition && (
            <Text style={styles.error}>{errors.condition}</Text>
          )}

          <Input
            label="Price"
            value={price}
            onChangeText={value => {
              setPrice(value.replace(/\D/g, ''));
              clearError('price');
            }}
            prefix={<Text style={styles.currency}>AED</Text>}
            placeholder="0"
            keyboardType="number-pad"
            maxLength={9}
            error={errors.price}
            style={styles.field}
          />

          <Input
            label="Location"
            value={location}
            onChangeText={value => {
              setLocation(value);
              clearError('location');
            }}
            placeholder="e.g. Dubai Marina"
            maxLength={60}
            error={errors.location}
            style={styles.field}
          />

          <Text style={[styles.label, styles.field]}>Description</Text>
          <TextInput
            value={description}
            onChangeText={value => {
              setDescription(value);
              clearError('description');
            }}
            placeholder="Age, accessories, any wear or damage"
            placeholderTextColor={colors.placeholder}
            multiline
            maxLength={1000}
            textAlignVertical="top"
            accessibilityLabel="Description"
            style={[
              styles.description,
              errors.description && styles.descriptionError,
            ]}
          />
          {errors.description && (
            <Text style={styles.error}>{errors.description}</Text>
          )}

          <Button title="Post listing" onPress={submit} style={styles.submit} />
        </ScrollView>
      </KeyboardAvoidingView>

      <ActionSheet
        visible={photoSheetOpen}
        onClose={() => setPhotoSheetOpen(false)}
        title="Add photos"
        message="Clear photos help your item sell faster."
        options={photoOptions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  label: {
    marginBottom: 10,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.title,
  },
  field: {
    marginTop: 20,
  },
  error: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.error,
  },
  photos: {
    marginHorizontal: -20,
  },
  photosContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  addPhoto: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    gap: 4,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  addPhotoError: {
    borderColor: colors.error,
  },
  addPhotoText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.primary,
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  cover: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 3,
    alignItems: 'center',
    backgroundColor: 'rgba(31, 42, 42, 0.72)',
  },
  coverText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.onPrimary,
  },
  removePhoto: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(31, 42, 42, 0.72)',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.title,
  },
  chipTextSelected: {
    fontFamily: fonts.semibold,
    color: colors.onPrimary,
  },
  currency: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.title,
  },
  description: {
    minHeight: 110,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.title,
  },
  descriptionError: {
    borderColor: colors.error,
  },
  submit: {
    marginTop: 28,
  },
});

export default SellScreen;
