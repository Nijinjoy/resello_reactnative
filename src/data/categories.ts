import {
  Bike,
  Camera,
  Gamepad2,
  Laptop,
  LucideIcon,
  Smartphone,
  Sofa,
  Watch,
} from 'lucide-react-native';
import type { ListingCategory } from './chats';

export const CATEGORY_ICONS: Record<
  ListingCategory,
  { label: string; Icon: LucideIcon; tint: string }
> = {
  phones: { label: 'Phones', Icon: Smartphone, tint: '#2B7FB8' },
  furniture: { label: 'Furniture', Icon: Sofa, tint: '#B8743A' },
  bikes: { label: 'Bikes', Icon: Bike, tint: '#2E9C6A' },
  cameras: { label: 'Cameras', Icon: Camera, tint: '#7A4FB8' },
  watches: { label: 'Watches', Icon: Watch, tint: '#D08A1F' },
  gaming: { label: 'Gaming', Icon: Gamepad2, tint: '#4F5DB8' },
  laptops: { label: 'Laptops', Icon: Laptop, tint: '#5B6B6A' },
};

export const CATEGORIES = Object.keys(CATEGORY_ICONS) as ListingCategory[];
