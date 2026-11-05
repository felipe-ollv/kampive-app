import { useTranslation } from '../lib/i18n';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import { Image, Pressable, Text, View, type TextProps } from 'react-native';
import { colors } from '../theme/tokens';
export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
export function Icon({
  name,
  size = 22,
  color = colors.primary,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
export function T({ className = '', ...props }: TextProps & { className?: string }) {
  return (
    <Text
      {...props}
      className={`${/\bfont-/.test(className) ? '' : 'font-jakarta'} ${/\btext-(?:xs|sm|base|lg|xl|[2-9]xl|\[\d)/.test(className) ? '' : 'text-sm'} ${/\bleading-/.test(className) ? '' : 'leading-[22px]'} ${/\btext-(?:primary|secondary|white|green|red|ink|\[\#)/.test(className) ? '' : 'text-ink'} ${className}`}
    />
  );
}
export function Section({ children }: { children: ReactNode }) {
  return (
    <T accessibilityRole="header" className="font-bold text-lg leading-7">
      {children}
    </T>
  );
}
export function Button({
  title,
  onPress,
  secondary = false,
  icon = 'arrow-right',
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  icon?: IconName;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={`min-h-14 flex-row items-center justify-center gap-3 rounded-xl px-4 py-3.5 ${secondary ? 'border border-primary bg-transparent' : 'bg-secondary'} ${disabled ? 'opacity-40' : 'active:opacity-80'}`}
    >
      <T className={`shrink font-bold ${secondary ? 'text-primary' : 'text-white'}`}>{title}</T>
      <Icon name={icon} size={20} color={secondary ? colors.primary : '#fff'} />
    </Pressable>
  );
}
export function Check({
  checked,
  onChange,
  children,
  compact = false,
}: {
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onChange}
      hitSlop={compact ? 8 : 0}
      className={`${compact ? 'min-h-7' : 'min-h-11'} flex-row items-center gap-3`}
    >
      <View
        className={`h-5 w-5 items-center justify-center rounded border ${checked ? 'border-primary bg-primary' : 'border-ink-muted'}`}
      >
        {checked && <Icon name="check" size={15} color="#fff" />}
      </View>
      <T className="flex-1 text-xs text-ink-variant">{children}</T>
    </Pressable>
  );
}
export function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) {
  const { t } = useTranslation();
  return (
    <View
      accessibilityLiveRegion="polite"
      className={`rounded-xl p-4 ${error ? 'bg-red-50' : 'bg-primary-container/60'}`}
    >
      <T className={`text-xs ${error ? 'text-red-700' : 'text-primary'}`}>
        {typeof children === 'string' ? t(children) : children}
      </T>
    </View>
  );
}
export function Empty({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="items-center gap-3 rounded-2xl border border-dashed border-line px-5 py-10">
      <Icon name="compass-outline" size={40} color={colors.muted} />
      <Section>{title}</Section>
      <T className="text-center text-ink-variant">{text}</T>
      {action && <Button title={t('Explorar refúgios')} onPress={action} secondary />}
    </View>
  );
}
export function Photo({
  uri,
  className = '',
  style,
}: {
  uri: string;
  className?: string;
  style?: ComponentProps<typeof Image>['style'];
}) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  return (
    <View className={`overflow-hidden bg-primary-container ${className}`} style={style}>
      {failed ? (
        <View className="flex-1 items-center justify-center">
          <Icon name="image-outline" size={36} color={colors.muted} />
          <T className="text-xs text-ink-variant">{t('Imagem indisponível')}</T>
        </View>
      ) : (
        <Image
          source={{ uri }}
          onError={() => setFailed(true)}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
          accessibilityLabel={t('Paisagem de camping ilustrativa')}
        />
      )}
    </View>
  );
}
